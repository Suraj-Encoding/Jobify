'use client';

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { getMyJobs, createJob, updateJob, deleteJob, getApplicationsByJob, updateApplicationStatus, exportApplicationsToExcel, getResumeViewUrl } from "@/lib/api";
import { Plus, Briefcase, Users, Trash2, Eye, X, CheckCircle, XCircle, Clock, Download, FileText, ExternalLink, ZoomIn, ZoomOut, Edit2 } from "lucide-react";

// Job Type Options
const JOB_TYPES = [
    { value: "FULL_TIME", label: "Full Time" },
    { value: "PART_TIME", label: "Part Time" },
    { value: "INTERNSHIP", label: "Internship" },
    { value: "CONTRACT", label: "Contract" },
    { value: "REMOTE", label: "Remote" },
    { value: "FREELANCE", label: "Freelance" }
];

// Experience Options
const EXPERIENCE_LEVELS = [
    { value: "Fresher", label: "Fresher (0-1 years)" },
    { value: "1-3 years", label: "1-3 years" },
    { value: "3-5 years", label: "3-5 years" },
    { value: "5-7 years", label: "5-7 years" },
    { value: "7+ years", label: "7+ years" },
    { value: "10+ years", label: "10+ years" }
];

// # 'Recruiter Dashboard' Component #
const RecruiterDashboard = ({ userData }) => {
    const { user } = useUser();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showApplicationsModal, setShowApplicationsModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [applications, setApplications] = useState([]);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showResumeViewer, setShowResumeViewer] = useState(false);
    const [resumeViewUrl, setResumeViewUrl] = useState("");
    const [pdfZoom, setPdfZoom] = useState(100);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);
    const [editingJob, setEditingJob] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        salary: "",
        company: "",
        type: "FULL_TIME",
        experience: "",
        skills: "",
        requirements: "",
        benefits: "",
        deadline: "",
        max_applications: ""
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
                setFormData({
                    title: "", description: "", location: "", salary: "", company: "",
                    type: "FULL_TIME", experience: "", skills: "", requirements: "", benefits: "", deadline: "", max_applications: ""
                });
                fetchJobs();
            } else {
                toast.error(response.message || "Failed to create job");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    };

    // # Open Delete Confirmation
    const openDeleteModal = (job) => {
        setJobToDelete(job);
        setShowDeleteModal(true);
    };

    // # Handle Delete Job
    const handleDeleteJob = async () => {
        if (!jobToDelete) return;
        try {
            const response = await deleteJob(user.id, jobToDelete._id);
            if (response.success) {
                toast.success("Job deleted successfully!");
                setShowDeleteModal(false);
                setJobToDelete(null);
                fetchJobs();
            } else {
                toast.error(response.message || "Failed to delete job");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    };

    // # Open Edit Modal
    const openEditModal = (job) => {
        setEditingJob(job);
        setFormData({
            title: job.title || "",
            description: job.description || "",
            location: job.location || "",
            salary: job.salary || "",
            company: job.company || "",
            type: job.type || "FULL_TIME",
            experience: job.experience || "",
            skills: job.skills || "",
            requirements: job.requirements || "",
            benefits: job.benefits || "",
            deadline: job.deadline || "",
            max_applications: job.max_applications || ""
        });
        setShowEditModal(true);
    };

    // # Handle Update Job
    const handleUpdateJob = async (e) => {
        e.preventDefault();
        try {
            const response = await updateJob(user.id, editingJob._id, formData);
            if (response.success) {
                toast.success("Job updated successfully!");
                setShowEditModal(false);
                setEditingJob(null);
                setFormData({
                    title: "", description: "", location: "", salary: "", company: "",
                    type: "FULL_TIME", experience: "", skills: "", requirements: "", benefits: "", deadline: "", max_applications: ""
                });
                fetchJobs();
            } else {
                toast.error(response.message || "Failed to update job");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    };

    // # Handle View Applications
    const handleViewApplications = async (job) => {
        setSelectedJob(job);
        try {
            const response = await getApplicationsByJob(user.id, job._id);
            if (response.success) {
                setApplications(response.data || []);
                setShowApplicationsModal(true);
            }
        } catch (error) {
            toast.error("Failed to fetch applications");
        }
    };

    // # Handle Update Application Status
    const handleUpdateStatus = async (applicationId, status, reason = null) => {
        try {
            const response = await updateApplicationStatus(user.id, applicationId, status, reason);
            if (response.success) {
                toast.success("Status updated successfully!");
                handleViewApplications(selectedJob);
                setShowRejectModal(false);
                setRejectionReason("");
                setSelectedApplication(null);
            } else {
                toast.error(response.message || "Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    };

    // # Handle Reject with Reason
    const openRejectModal = (app) => {
        setSelectedApplication(app);
        setRejectionReason("");
        setShowRejectModal(true);
    };

    // # Handle Export to Excel
    const handleExportExcel = async () => {
        try {
            const blob = await exportApplicationsToExcel(user.id, selectedJob._id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `candidates_${selectedJob.title.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Excel exported successfully!");
        } catch (error) {
            toast.error("Failed to export Excel");
        }
    };

    // # View Resume
    const handleViewResume = (resumeUrl) => {
        if (resumeUrl) {
            setResumeViewUrl(getResumeViewUrl(resumeUrl));
            setPdfZoom(100);
            setShowResumeViewer(true);
        }
    };

    // # Get Application Count Display
    const getApplicationCountDisplay = (job) => {
        const current = job.application_count || 0;
        const max = job.max_applications;
        if (max) {
            return `${current}/${max} applicants`;
        }
        return `${current} applicants`;
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
                        onClick={() => {
                            setFormData({
                                title: "", description: "", location: "", salary: "", company: "",
                                type: "FULL_TIME", experience: "", skills: "", requirements: "", benefits: "", deadline: "", max_applications: ""
                            });
                            setShowCreateModal(true);
                        }}
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
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                                        {job.type && (
                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                                                {JOB_TYPES.find(t => t.value === job.type)?.label || job.type}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => openEditModal(job)}
                                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                            title="Edit Job"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(job)}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete Job"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{job.company}</p>
                                <p className="text-sm text-gray-500 mb-2">{job.location}</p>
                                {job.salary && <p className="text-sm text-green-600 font-medium mb-2">{job.salary}</p>}
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Users className="w-4 h-4 mr-1" />
                                        {getApplicationCountDisplay(job)}
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
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Post New Job</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateJob} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                                    <select
                                        required
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        {JOB_TYPES.map((type) => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                                    <select
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="">Select experience</option>
                                        {EXPERIENCE_LEVELS.map((exp) => (
                                            <option key={exp.value} value={exp.value}>{exp.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                                    <input
                                        type="text"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g. $80,000 - $100,000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                                <input
                                    type="text"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g. React, Node.js, MongoDB, TypeScript"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="Brief description of the job role..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                                <textarea
                                    rows={3}
                                    value={formData.requirements}
                                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="Detailed requirements and qualifications..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                                <textarea
                                    rows={2}
                                    value={formData.benefits}
                                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="e.g. Health insurance, 401k, Remote work, Flexible hours..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Applications</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.max_applications}
                                        onChange={(e) => setFormData({ ...formData, max_applications: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Leave empty for unlimited"
                                    />
                                </div>
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
                    <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Applications</h3>
                                <p className="text-sm text-gray-600">{selectedJob.title}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                {applications.length > 0 && (
                                    <button
                                        onClick={handleExportExcel}
                                        className="inline-flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Download className="w-4 h-4 mr-1" />
                                        Export Excel
                                    </button>
                                )}
                                <button onClick={() => setShowApplicationsModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {applications.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No applications yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applications.map((app) => (
                                    <div key={app._id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    {app.candidate_name || (app.candidate?.firstName + " " + app.candidate?.lastName)}
                                                </h4>
                                                <p className="text-sm text-gray-600">{app.candidate_email || app.candidate?.email}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </div>

                                        {/* Resume Link */}
                                        {app.resume_url && (
                                            <div className="mb-3">
                                                <button
                                                    onClick={() => handleViewResume(app.resume_url)}
                                                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                                                >
                                                    <FileText className="w-4 h-4 mr-1" />
                                                    View Resume
                                                    <ExternalLink className="w-3 h-3 ml-1" />
                                                </button>
                                            </div>
                                        )}

                                        {app.cover_letter && (
                                            <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded-lg">
                                                <span className="font-medium">Cover Letter: </span>{app.cover_letter}
                                            </p>
                                        )}

                                        {/* Rejection Reason */}
                                        {app.status === "REJECTED" && app.rejection_reason && (
                                            <p className="text-sm text-red-600 mb-3 bg-red-50 p-3 rounded-lg">
                                                <span className="font-medium">Rejection Reason: </span>{app.rejection_reason}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(app._id, "REVIEWED")}
                                                className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                            >
                                                <Clock className="w-4 h-4 mr-1" /> Review
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(app._id, "ACCEPTED")}
                                                className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" /> Accept
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(app)}
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

            {/* # Rejection Modal # */}
            {showRejectModal && selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Reject Application</h3>
                            <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            You are rejecting the application from <strong>{selectedApplication.candidate_name || (selectedApplication.candidate?.firstName + " " + selectedApplication.candidate?.lastName)}</strong>.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason (Optional)</label>
                            <textarea
                                rows={3}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                placeholder="Provide a reason for the candidate..."
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(selectedApplication._id, "REJECTED", rejectionReason)}
                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* # Resume Viewer Modal # */}
            {showResumeViewer && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Resume Viewer</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setPdfZoom(Math.max(50, pdfZoom - 25))}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="w-5 h-5" />
                                </button>
                                <span className="text-sm text-gray-600 min-w-[60px] text-center">{pdfZoom}%</span>
                                <button
                                    onClick={() => setPdfZoom(Math.min(200, pdfZoom + 25))}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                                <a
                                    href={resumeViewUrl}
                                    download
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    title="Download"
                                >
                                    <Download className="w-5 h-5" />
                                </a>
                                <button
                                    onClick={() => setShowResumeViewer(false)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    title="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {/* PDF Content */}
                        <div className="flex-1 overflow-auto bg-gray-100 p-4">
                            <div style={{ transform: `scale(${pdfZoom / 100})`, transformOrigin: 'top center' }}>
                                <iframe
                                    src={resumeViewUrl}
                                    className="w-full bg-white shadow-lg"
                                    style={{ height: '100vh', minWidth: '800px' }}
                                    title="Resume"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* # Edit Job Modal # */}
            {showEditModal && editingJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Edit Job</h3>
                            <button onClick={() => { setShowEditModal(false); setEditingJob(null); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateJob} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                                    <select
                                        required
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        {JOB_TYPES.map((type) => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                                    <select
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="">Select experience</option>
                                        {EXPERIENCE_LEVELS.map((exp) => (
                                            <option key={exp.value} value={exp.value}>{exp.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                                    <input
                                        type="text"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                                <input
                                    type="text"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g. React, Node.js, MongoDB"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                                <textarea
                                    rows={3}
                                    value={formData.requirements}
                                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                                <textarea
                                    rows={2}
                                    value={formData.benefits}
                                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Applications</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.max_applications}
                                        onChange={(e) => setFormData({ ...formData, max_applications: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Leave empty for unlimited"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setEditingJob(null); }}
                                    className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Update Job
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* # Delete Confirmation Modal # */}
            {showDeleteModal && jobToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Job</h3>
                        <p className="text-gray-600 text-center mb-2">
                            Are you sure you want to delete this job?
                        </p>
                        <p className="text-gray-900 font-medium text-center mb-4">
                            "{jobToDelete.title}"
                        </p>
                        <p className="text-sm text-red-600 text-center mb-6">
                            This action cannot be undone. All applications for this job will also be affected.
                        </p>
                        <div className="flex justify-center space-x-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setJobToDelete(null); }}
                                className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteJob}
                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete Job
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RecruiterDashboard;
