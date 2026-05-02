'use client'

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import AppLoader from "@/components/AppLoader";
import Navbar from "@/components/Navbar";
import RoleSelector from "@/components/RoleSelector";
import RecruiterDashboard from "@/components/RecruiterDashboard";
import CandidateDashboard from "@/components/CandidateDashboard";
import Toast from "@/components/Toast";
import { getUser } from "@/lib/api";

// # 'Home' Page #
const HomePage = () => {
    const { isLoaded, user } = useUser();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    // # Fetch User Data
    const fetchUserData = async () => {
        try {
            const response = await getUser(user.id);
            if (response.success) {
                setUserData(response.data);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            setLoading(false);
        }
    };

    // # Effect: Fetch user data when user is loaded
    useEffect(() => {
        if (isLoaded && user) {
            fetchUserData();
        }
    }, [isLoaded, user]);

    // # Loading State
    if (!isLoaded || loading) {
        return <AppLoader />;
    }

    // # No User Data - Show Role Selector
    if (!userData || !userData.role) {
        return (
            <>
                <Navbar />
                <RoleSelector onRoleSelected={fetchUserData} />
                <Toast />
            </>
        );
    }

    // # Render Dashboard Based on Role
    return (
        <>
            <Navbar userData={userData} />
            {userData.role === "RECRUITER" ? (
                <RecruiterDashboard userData={userData} />
            ) : (
                <CandidateDashboard userData={userData} />
            )}
            <Toast />
        </>
    );
};

export default HomePage;
