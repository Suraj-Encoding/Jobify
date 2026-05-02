'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// # 'App Loader' Component #
const AppLoader = () => {
    const [dotCount, setDotCount] = useState(1);

    // # Animate the 'dots' for the 'status' message
    useEffect(() => {
        const interval = setInterval(() => {
            setDotCount(prev => (prev % 3) + 1);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">

                {/* # Website 'Logo' # */}
                <Image
                    src="/logo.png"
                    alt="Jobify Logo"
                    width={80}
                    height={80}
                    className="object-contain animate-fade-in"
                    priority
                />

                {/* # Website 'Title' & 'Description' # */}
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent animate-fade-in">
                        Jobify
                    </h1>

                    <p className="text-base text-center max-w-xs font-medium leading-snug bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-fade-in">
                        Modern Job Portal
                    </p>
                </div>

                {/* # 'Spin' Loader # */}
                <div className="mt-3 animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black" />

                {/* # 'Status' Message # */}
                <p className="text-md text-gray-700 font-medium animate-fade-in">
                    Getting things ready for you{'.'.repeat(dotCount)}
                </p>
            </div>
        </>
    );
};

export default AppLoader;
