import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import AppLoader from "@/components/AppLoader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <RoleSelector onRoleSelected={fetchUserData} />
                <Footer />
                <Toast />
            </div>
        );
    }

    // # Render Dashboard Based on Role
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar userData={userData} />
            <div className="flex-1">
                {userData.role === "RECRUITER" ? (
                    <RecruiterDashboard userData={userData} />
                ) : (
                    <CandidateDashboard userData={userData} />
                )}
            </div>
            <Footer />
            <Toast />
        </div>
    );
};

export default HomePage;
