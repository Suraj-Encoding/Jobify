'use client';

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { getMyJobs, createJob, deleteJob, getApplicationsByJob, updateApplicationStatus } from "@/lib/api";
import { Plus, Briefcase, Users, Trash2, Eye, X, CheckCircle, XCircle, Clock } from "lucide-react";

// # 'Recruiter Dashboard' Component #
const RecruiterDashboard = ({ userData }) => {
    const { user } = useUser();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showApplicationsModal, setShowApplicationsModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        salary: "",
        company: ""
    });

    // # Fetch Jobs
    const fetchJobs = async () => {
        try {
            const response = await getMyJobs(user.id);
            if (response.success) {
                setJobs(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    // # Effect: Fetch jobs on mount
    useEffect(() => {
        fetchJobs();
    }, []);

    // # Handle Create Job
    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            const response = await createJob(user.id, formData);
            if (response.success) {
                toast.success("Job created successfully!");
                setShowCreateModal(false);
                setFormData({ title: "", description: "", location: "", salary: "", company: "" });
                fetchJobs();
            } else {
                toast.error(response.message || "Failed to create job");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    };

    // # Handle Delete Job
    const handleDeleteJob = async (jobId) => {
        if (!confirm("Are you sure you want to delete this job?")) return;
        try {
            const response = await deleteJob(user.id, jobId);
            if (response.success) {
                toast.success("Job deleted successfully!");
                fetchJobs();
            } else {
                toast.error(response.message || "Failed to delete job");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    };

    // # Handle View Applications
    const handleViewApplications = async (job) => {
        setSelectedJob(job);
        try {
            const response = await getApplicationsByJob(user.id, job.id);
            if (response.success) {
                setApplications(response.data || []);
                setShowApplicationsModal(true);
            }
        } catch (error) {
            toast.error("Failed to fetch applications");
        }
    };

    // # Handle Update Application Status
    const handleUpdateStatus = async (applicationId, status) => {
        try {
            const response = await updateApplicationStatus(user.id, applicationId, status);
            if (response.success) {
                toast.success("Status updated successfully!");
                handleViewApplications(selectedJob);
            } else {
                toast.error(response.message || "Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
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

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* # Header # */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h2>
                        <p className="text-gray-600 mt-1">Manage your job postings and applications</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Post New Job
                    </button>
                </div>

                {/* # Jobs Grid # */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                        <p className="text-gray-600 mb-4">Start by posting your first job opening</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Post New Job
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <div key={job._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                                    <button
                                        onClick={() => handleDeleteJob(job._id)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{job.company}</p>
                                <p className="text-sm text-gray-500 mb-4">{job.location}</p>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Users className="w-4 h-4 mr-1" />
                                        {job.applicationCount || 0} applicants
                                    </div>
                                    <button
                                        onClick={() => handleViewApplications(job)}
                                        className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* # Create Job Modal # */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Post New Job</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateJob} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g. Frontend Developer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g. Tech Corp"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g. New York, NY or Remote"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                                <input
                                    type="text"
                                    value={formData.salary}
                                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g. $80,000 - $100,000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="Describe the job role, responsibilities, and requirements..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Post Job
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* # Applications Modal # */}
            {showApplicationsModal && selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Applications</h3>
                                <p className="text-sm text-gray-600">{selectedJob.title}</p>
                            </div>
                            <button onClick={() => setShowApplicationsModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {applications.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No applications yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applications.map((app) => (
                                    <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    {app.candidate?.firstName} {app.candidate?.lastName}
                                                </h4>
                                                <p className="text-sm text-gray-600">{app.candidate?.email}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        {app.coverLetter && (
                                            <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded-lg">
                                                {app.coverLetter}
                                            </p>
                                        )}
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleUpdateStatus(app.id, "REVIEWED")}
                                                className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                            >
                                                <Clock className="w-4 h-4 mr-1" /> Review
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(app.id, "ACCEPTED")}
                                                className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(app.id, "REJECTED")}
                                                className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                <XCircle className="w-4 h-4 mr-1" /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default RecruiterDashboard;
