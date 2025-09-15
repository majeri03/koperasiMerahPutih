// Lokasi: frontend/app/dashboard/admin/layout.tsx
"use client";

import { useState, ReactNode } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader toggleSidebar={toggleSidebar} />
        <main className="p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}