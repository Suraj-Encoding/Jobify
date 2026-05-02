'use client';

import { UserButton } from "@clerk/nextjs";

// # 'Navbar' Component #
const Navbar = ({ userData }) => {
    return (
        <>
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">

                        {/* # Logo & Title # */}
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">💼</span>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Jobify
                            </h1>
                        </div>

                        {/* # User Info & Actions # */}
                        <div className="flex items-center space-x-4">
                            {userData && (
                                <div className="hidden sm:flex items-center space-x-2">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${userData.role === "RECRUITER"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-blue-100 text-blue-700"
                                        }`}>
                                        {userData.role}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {userData.firstName} {userData.lastName}
                                    </span>
                                </div>
                            )}
                            <UserButton afterSignOutUrl="/sign-in" />
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
