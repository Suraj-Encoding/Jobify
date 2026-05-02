'use client';

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { getAllJobs, applyToJob, getMyApplications } from "@/lib/api";
import { Briefcase, MapPin, DollarSign, Building, X, Send, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

// # 'Candidate Dashboard' Component #
const CandidateDashboard = ({ userData }) => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState("jobs");
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [appliedJobIds, setAppliedJobIds] = useState([]);

    // # Fetch Jobs
    const fetchJobs = async () => {
        try {
            const response = await getAllJobs();
            if (response.success) {
                setJobs(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    // # Fetch My Applications
    const fetchApplications = async () => {
        try {
            const response = await getMyApplications(user.id);
            if (response.success) {
                setApplications(response.data || []);
                setAppliedJobIds((response.data || []).map(app => app.jobId));
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
        }
    };

    // # Effect: Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchJobs(), fetchApplications()]);
            setLoading(false);
        };
        fetchData();
    }, []);

    // # Handle Apply
    const handleApply = async (e) => {
        e.preventDefault();
        try {
            const response = await applyToJob(user.id, {
                jobId: selectedJob._id,
                coverLetter: coverLetter
            });
            if (response.success) {
                toast.success("Application submitted successfully!");
                setShowApplyModal(false);
                setCoverLetter("");
                fetchApplications();
                fetchJobs();
            } else {
                toast.error(response.message || "Failed to submit application");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    };

    // # Open Apply Modal
    const openApplyModal = (job) => {
        setSelectedJob(job);
        setCoverLetter("");
        setShowApplyModal(true);
    };

    // # Get Status Badge Color
    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING": return "bg-yellow-100 text-yellow-700";
            case "REVIEWED": return "bg-blue-100 text-blue-700";
            case "ACCEPTED": return "bg-green-100 text-green-700";
            case "REJECTED": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    // # Get Status Icon
    const getStatusIcon = (status) => {
        switch (status) {
            case "PENDING": return <Clock className="w-4 h-4" />;
            case "REVIEWED": return <FileText className="w-4 h-4" />;
            case "ACCEPTED": return <CheckCircle className="w-4 h-4" />;
            case "REJECTED": return <XCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* # Header # */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Candidate Dashboard</h2>
                    <p className="text-gray-600 mt-1">Browse jobs and track your applications</p>
                </div>

                {/* # Tabs # */}
                <div className="flex space-x-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("jobs")}
                        className={`pb-3 px-1 font-medium transition-colors ${activeTab === "jobs"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Browse Jobs
                    </button>
                    <button
                        onClick={() => setActiveTab("applications")}
                        className={`pb-3 px-1 font-medium transition-colors ${activeTab === "applications"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        My Applications ({applications.length})
                    </button>
                </div>

                {/* # Content # */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                ) : activeTab === "jobs" ? (
                    /* # Jobs Tab # */
                    jobs.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
                            <p className="text-gray-600">Check back later for new job postings</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map((job) => (
                                <div key={job._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{job.title}</h3>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Building className="w-4 h-4 mr-2 text-gray-400" />
                                            {job.company}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                            {job.location}
                                        </div>
                                        {job.salary && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                                {job.salary}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{job.description}</p>

                                    <button
                                        onClick={() => openApplyModal(job)}
                                        disabled={appliedJobIds.includes(job._id)}
                                        className={`w-full py-2 rounded-lg font-medium transition-colors ${appliedJobIds.includes(job._id)
                                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                            }`}
                                    >
                                        {appliedJobIds.includes(job._id) ? "Already Applied" : "Apply Now"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* # Applications Tab # */
                    applications.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                            <p className="text-gray-600 mb-4">Start applying to jobs to track your progress</p>
                            <button
                                onClick={() => setActiveTab("jobs")}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Browse Jobs
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.map((app) => (
                                <div key={app._id} className="bg-white rounded-xl border border-gray-200 p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {app.job?.title || "Job"}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                                                <span className="flex items-center">
                                                    <Building className="w-4 h-4 mr-1 text-gray-400" />
                                                    {app.job?.company || "Company"}
                                                </span>
                                                <span className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                                    {app.job?.location || "Location"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(app.status)}`}>
                                            {getStatusIcon(app.status)}
                                            <span className="ml-1.5">{app.status}</span>
                                        </div>
                                    </div>
                                    {app.coverLetter && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Cover Letter:</span> {app.coverLetter}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* # Apply Modal # */}
            {showApplyModal && selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Apply to Job</h3>
                            <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900">{selectedJob.title}</h4>
                            <p className="text-sm text-gray-600">{selectedJob.company} • {selectedJob.location}</p>
                        </div>

                        <form onSubmit={handleApply}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cover Letter (Optional)
                                </label>
                                <textarea
                                    rows={5}
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Tell the recruiter why you're a great fit for this role..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowApplyModal(false)}
                                    className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Application
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default CandidateDashboard;
