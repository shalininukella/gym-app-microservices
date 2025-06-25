export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    preferableActivity?: string;
    target?: string; 
    type: 'client' | 'coach' | 'admin';
  }
  
  export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
  }