 import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css'
import SignUp from "./components/Authentication/SignUp/SignUp";
import SignIn from "./components/Authentication/SignIn/SignIn";
import App from "./App";
import Home from "./components/Home/Home";
import CoachProfilePage from "./components/Coaches/CoachProfiles/CoachProfilePage";
import CoachesList from "./components/Coaches/CoachProfiles/CoachesList";
import Workouts from "./components/Activities/Workouts";
import Reports from "./components/Admin/Reports";
import CoachWorkouts from "./components/CoachLogin/CoachWorkouts";
import EditProfile from "./components/Navbar/EditProfile";
import { Provider } from "react-redux";
import { store } from "./store";
import { ThemeProvider } from "./components/ThemeProvider"; // Add this import

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home/> },
      { path: "/workouts", element: <Workouts/> },
      { path: "/coaches", element: <CoachesList/> },
      { path: "/coachpage", element: <CoachWorkouts /> },
      { path: "/adminpage", element: <Reports /> },
      { path: "/coach-profile/:coachId", element: <CoachProfilePage /> },
      { path: "/admin/reports", element: <Reports /> },
      { path: "/edit-profile", element: <EditProfile /> },
    ],
  },
  {
    path: "/auth/sign-in",
    element: <SignIn />,
  },
  {
    path: "/auth/sign-up",
    element: <SignUp />,
  },
  {
    path: "/home",
    element: <Home/>
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);