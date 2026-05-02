'use client';

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

// # 'Navbar' Component #
const Navbar = ({ userData }) => {
    return (
        <>
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">

                        {/* # Logo & Title # */}
                        <div className="flex items-center space-x-3">
                            <Image
                                src="/logo.png"
                                alt="Jobify Logo"
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Jobify
                            </h1>
                        </div>

                        {/* # Center Tagline # */}
                        <div className="hidden md:flex items-center">
                            {!userData?.role ? (
                                <span className="text-sm font-medium px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-purple-200">
                                    ✨ <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Modern Job Portal</span>
                                </span>
                            ) : (
                                <span className={`text-sm font-medium px-4 py-1.5 rounded-full ${userData?.role === "RECRUITER"
                                        ? "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200"
                                        : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200"
                                    }`}>
                                    {userData?.role === "RECRUITER" ? "✨ Hire Top Talent" : "✨ Find Your Dream Job"}
                                </span>
                            )}
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
