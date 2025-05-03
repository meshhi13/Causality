"use client";
import { useRouter } from "next/navigation";

export default function Header() {
    const router = useRouter();

    const handleSearch = () => {
        router.push("/dashboard");
    };

    const handleAccount = () => {
        router.push("/account");
    };

    return (
        <header className="header border-2 border-gray-300 p-4 bg-100 sticky top-0 z-99 h-2/10 bg-black">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">Causality</h1>
                <nav>
                    <ul className="flex space-x-6">
                        <li>
                            <button
                                className="hover:text-gray-300 transition-colors duration-200 cursor-pointer"
                                onClick={handleAccount}
                            >
                                Account
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={handleSearch}
                                className="hover:text-gray-300 transition-colors duration-200 cursor-pointer"
                            >
                                Search
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}