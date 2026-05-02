'use client';

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { setUserRole } from "@/lib/api";
import { Briefcase, User } from "lucide-react";

// # 'Role Selector' Component #
const RoleSelector = ({ onRoleSelected }) => {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    // # Handle Role Selection
    const handleSelectRole = async (role) => {
        setLoading(true);
        try {
            const response = await setUserRole(user.id, role);
            if (response.success) {
                toast.success(`Welcome! You are now a ${role.toLowerCase()}.`);
                onRoleSelected();
            } else {
                toast.error(response.message || "Failed to set role");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
                <div className="max-w-2xl w-full">
                    {/* # Welcome Message # */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome to Jobify! 👋
                        </h2>
                        <p className="text-gray-600">
                            Please select your role to continue
                        </p>
                    </div>

                    {/* # Role Cards # */}
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* # Recruiter Card # */}
                        <button
                            onClick={() => handleSelectRole("RECRUITER")}
                            disabled={loading}
                            className="group p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all duration-200 text-left disabled:opacity-50"
                        >
                            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                                <Briefcase className="w-7 h-7 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                I'm a Recruiter
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Post job openings, review applications, and find the perfect candidates for your company.
                            </p>
                        </button>

                        {/* # Candidate Card # */}
                        <button
                            onClick={() => handleSelectRole("CANDIDATE")}
                            disabled={loading}
                            className="group p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-left disabled:opacity-50"
                        >
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                                <User className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                I'm a Candidate
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Browse job listings, apply to positions, and track your application status.
                            </p>
                        </button>
                    </div>

                    {/* # Loading Indicator # */}
                    {loading && (
                        <div className="mt-6 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default RoleSelector;
