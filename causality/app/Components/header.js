"use client";

function Header() {
    return (
        <header className="header border-2 border-gray-300 p-4 bg-100 sticky top-0 z-50 h-2/10">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">Causality</h1>
                <nav>
                    <ul className="flex space-x-6">
                    <li>
                        <a
                        href="#home"
                        className="hover:text-gray-300 transition-colors duration-200"
                        >
                        Account
                        </a>
                    </li>
                    <li>
                        <a
                        href="#contact"
                        className="hover:text-gray-300 transition-colors duration-200"
                        >
                        Search
                        </a>
                    </li>
                    </ul>
                </nav>
                </div>
        </header>
    );
}

export default Header;