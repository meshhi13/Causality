"use client";
import Header from "../Components/header";
import Account from "../Components/account"

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
        <Header />
        <Account />
    </div>
  );
}
