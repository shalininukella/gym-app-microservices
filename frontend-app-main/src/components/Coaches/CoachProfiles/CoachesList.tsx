import React, { useEffect, useState } from "react";
import CoachCard from "./CoachCard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Coach } from "../../../interfaces/Coaches/Coaches";
import api from '../../../api/axios';

const CoachesList: React.FC = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const response = await api.get(`/gym/dev/coaches/`);
        setCoaches(response.data);
      } catch (error) {
        console.error("Error fetching coaches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  const skeletons = Array.from({ length: 8 }, (_, i) => (
    <div key={i} className="p-4 rounded shadow dark:bg-gray-800">
      <Skeleton height={200} />
      <Skeleton height={24} style={{ marginTop: 10 }} />
      <Skeleton count={2} />
    </div>
  ));

  return (
    <div className="p-10 min-h-screen bg-white dark:bg-gray-900 text-gray-900 ">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? skeletons
          : coaches.map((coach) => (
              <CoachCard key={coach._id} coach={coach} />
            ))}
      </div>
    </div>
  );
};

export default CoachesList;