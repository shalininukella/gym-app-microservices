export interface Coach {
    _id: string;                 
    firstName: string;
    lastName: string;
    profilePic?: string;
    rating?: number;
    title: string;
    about?: string;
    type: string;
    specialization?: string[];
    certificates?: string[];
  }
 