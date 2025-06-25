import { Request, Response } from "express";
import { Workout } from "../models/Workouts.model";
import Coach, { ICoach } from "../models/Coach.model";
import mongoose from "mongoose";

type CoachDocument = mongoose.Document<mongoose.Types.ObjectId, {}, ICoach> &
  ICoach &
  Required<{ _id: mongoose.Types.ObjectId }> & { __v: number };

export const getAvailableWorkouts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    let { type, date, time, coachId } = req.query;


    if (!date) {
      res.status(400).json({
        error: "Missing required parameter",
        missingParams: ["date"],
      });
      return;
    }

    type = type || "all";
    coachId = coachId || "all";

    const dateString = date as string;
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(dateString)) {
      res.status(400).json({
        error: "Invalid date format",
        message: "Date must be in DD-MM-YYYY format",
      });
      return;
    }

    const [day, month, year] = dateString.split("-").map(Number);

    const nowUTC = new Date();

    const istOffset = 0;

    const nowIST = new Date(nowUTC.getTime() + istOffset);

    console.log("Current UTC time:", nowUTC.toISOString());
    console.log("Current IST time:", nowIST.toISOString());

    const todayIST = new Date(nowIST);
    todayIST.setHours(0, 0, 0, 0);

    const selectedDateIST = new Date(year, month - 1, day);
    selectedDateIST.setHours(0, 0, 0, 0);

    if (selectedDateIST < todayIST) {
      res.status(400).json({
        error: "Invalid date",
        message: "Cannot book workouts for past dates",
      });
      return;
    }

    const allPossibleTimes = [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
    ];

    let availableTimes = [...allPossibleTimes];

    const isToday =
      selectedDateIST.getFullYear() === todayIST.getFullYear() &&
      selectedDateIST.getMonth() === todayIST.getMonth() &&
      selectedDateIST.getDate() === todayIST.getDate();

    if (isToday) {
      const currentHourIST = nowIST.getHours();
      const currentMinuteIST = nowIST.getMinutes();

      const currentTimeInMinutes = currentHourIST * 60 + currentMinuteIST;

      availableTimes = allPossibleTimes.filter((t) => {
        const [h, m] = t.split(":").map(Number);
        const timeInMinutes = h * 60 + m;
        return timeInMinutes > currentTimeInMinutes;
      });

      if (time) {
        const timeString = time as string;
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(timeString)) {
          res.status(400).json({
            error: "Invalid time format",
            message: "Time must be in HH:MM 24-hour format",
          });
          return;
        }

        const [hours, minutes] = timeString.split(":").map(Number);
        const selectedTimeInMinutes = hours * 60 + minutes;

        if (selectedTimeInMinutes <= currentTimeInMinutes) {
          res.status(400).json({
            error: "Invalid time",
            message: "Cannot book workouts for times that have already passed",
            details: {
              currentTimeIST: `${currentHourIST}:${currentMinuteIST}`,
              requestedTime: timeString,
              availableTimes: availableTimes,
            },
          });
          return;
        }
      }

      if (availableTimes.length === 0) {
        res.status(400).json({
          error: "No available times",
          message:
            "No more available time slots for today. Please try booking for another day.",
        });
        return;
      }
    } else if (time) {
      const timeString = time as string;
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(timeString)) {
        res.status(400).json({
          error: "Invalid time format",
          message: "Time must be in HH:MM 24-hour format",
        });
        return;
      }
    }

    const workoutQuery: any = { date: dateString };
    if (coachId !== "all") workoutQuery.coachId = coachId;

    const bookedWorkouts = await Workout.find({
      ...workoutQuery,
      coachStatus: { $ne: "Cancelled" },
      clientStatus: { $ne: "Cancelled" },
    });

    const bookedMap: { [key: string]: string[] } = {};
    bookedWorkouts.forEach((w) => {
      const coachIdStr = w.coachId.toString();
      if (!bookedMap[coachIdStr]) {
        bookedMap[coachIdStr] = [];
      }
      bookedMap[coachIdStr].push(w.time);
    });

    let coaches: CoachDocument[] = [];

    if (coachId === "all") {
      const coachQuery: any = {};
      if (type !== "all") {
        coachQuery.type = type;
      }
      coaches = (await Coach.find(coachQuery)) as CoachDocument[];
    } else {
      const coach = (await Coach.findById(coachId)) as CoachDocument | null;
      if (coach) {
        if (type === "all" || coach.type === type) {
          coaches = [coach];
        } else {
          res.status(400).json({
            error: "Coach type does not match the requested type",
          });
          return;
        }
      } else {
        res.status(404).json({
          error: "Coach not found",
        });
        return;
      }
    }

    const availableWorkouts = [];

    for (const coach of coaches) {
      const coachIdStr = coach._id.toString();

      const bookedTimes = bookedMap[coachIdStr] || [];

      const coachAvailableTimes = availableTimes.filter(
        (t) => !bookedTimes.includes(t),
      );

      if (time) {
        const timeString = time as string;

        if (!coachAvailableTimes.includes(timeString)) {
          continue;
        }

        availableWorkouts.push({
          coachId: coach._id,
          coachName: `${coach.firstName} ${coach.lastName}`,
          coachTitle: coach.title,
          coachProfileUrl: coach.profilePic || "",
          rating: coach.rating || 0,
          type: coach.type,
          date: dateString,
          selectedTime: timeString,
          availableSlots: coachAvailableTimes.filter((t) => t !== timeString),
        });
      } else {
        if (coachAvailableTimes.length > 0) {
          availableWorkouts.push({
            coachId: coach._id,
            coachName: `${coach.firstName} ${coach.lastName}`,
            coachTitle: coach.title,
            coachProfileUrl: coach.profilePic || "",
            rating: coach.rating || 0,
            type: coach.type,
            date: dateString,
            availableSlots: coachAvailableTimes,
          });
        }
      }
    }

    if (availableWorkouts.length === 0) {
      res.status(404).json({
        error: "No available workouts found for the specified parameters",
        message: time
          ? "The requested time might be already booked, in the past, or there are no coaches matching your criteria"
          : "There are no available time slots for the requested date or no coaches matching your criteria",
      });
      return;
    }

    res.status(200).json(availableWorkouts);
  } catch (error: unknown) {
    console.error("Error in getAvailableWorkouts:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    res.status(500).json({
      error: "Failed to fetch available workouts",
      message: errorMessage,
    });
  }
};