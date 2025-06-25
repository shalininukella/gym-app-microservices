// types.ts

export interface Booking {
    type: string;
    time: string;
    date: string;

  }
  
  export interface Trainer {
    id:string;
    name: string;
    title: string;
    image: string;
    rating: number;
    booking: Booking;
    description: string;
    availableTimes: string[];
  }
  