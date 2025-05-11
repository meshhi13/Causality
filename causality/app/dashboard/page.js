"use client";
import Dashboard from "../Components/dashboard";
import Header from "../Components/header";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
        <Header />
        <Dashboard />
    </div>
  );
}
