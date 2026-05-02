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
                    className="animate-bounce mb-4"
                    priority
                />

                {/* # Website 'Title' & 'Description' # */}
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Jobify
                    </h1>

                    <p className="text-base text-center max-w-xs font-medium leading-snug text-gray-600">
                        Find Your Dream Job
                    </p>
                </div>

                {/* # 'Spin' Loader # */}
                <div className="mt-6 animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />

                {/* # 'Status' Message # */}
                <p className="mt-4 text-md text-gray-700 font-medium">
                    Getting things ready for you{'.'.repeat(dotCount)}
                </p>
            </div>
        </>
    );
};

export default AppLoader;
