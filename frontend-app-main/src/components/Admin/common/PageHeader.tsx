// src/components/admin/common/PageHeader.tsx
import React from 'react';
import { useAppSelector } from "../../../hooks/redux";
import { RootState } from "../../../store";

interface PageHeaderProps {
  headerImage: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ headerImage }) => {
  const user = useAppSelector((state: RootState) => state.auth?.user);
  const isLoggedIn = useAppSelector((state: RootState) => state.auth?.isAuthenticated);

  return (
    <div className="relative">
      <img
        src={headerImage || "/api/placeholder/1200/250"}
        alt="Header"
        className="w-full h-auto object-cover max-h-64"
      />
      <h1 className="absolute top-1/2 left-6 -translate-y-1/2 text-white text-sm md:text-xl drop-shadow-md">
        {isLoggedIn
          ? `Hello, ${user?.firstName || 'Admin'} ${user?.lastName || ''}`
          : "Welcome!"}
      </h1>
    </div>
  );
};

export default PageHeader;