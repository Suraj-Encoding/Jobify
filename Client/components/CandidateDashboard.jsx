'use client';

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { getAllJobs, applyToJob, getMyApplications, uploadResume, getResumeViewUrl, withdrawApplication } from "@/lib/api";
import { Briefcase, MapPin, DollarSign, Building, X, Send, FileText, Clock, CheckCircle, XCircle, Upload, ExternalLink, Calendar, Award, Loader2, Users, Download, ZoomIn, ZoomOut, Trash2 } from "lucide-react";

// Job Type Labels
const JOB_TYPE_LABELS = {
    "FULL_TIME": "Full Time",
    "PART_TIME": "Part Time",
    "INTERNSHIP": "Internship",
    "CONTRACT": "Contract",
    "REMOTE": "Remote",
    "FREELANCE": "Freelance"
};

// # 'Candidate Dashboard' Component #
const CandidateDashboard = ({ userData }) => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState("jobs");
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showJobDetailModal, setShowJobDetailModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [uploadedResumeId, setUploadedResumeId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [appliedJobIds, setAppliedJobIds] = useState([]);
    const [showResumeViewer, setShowResumeViewer] = useState(false);
    const [resumeViewUrl, setResumeViewUrl] = useState("");
    const [pdfZoom, setPdfZoom] = useState(100);
    const [withdrawing, setWithdrawing] = useState(null);

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
                setAppliedJobIds((response.data || []).map(app => app.job_id));
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

    // # Handle Resume Upload
    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only PDF and Word documents are allowed");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        setResumeFile(file);
        setUploading(true);

        try {
            const response = await uploadResume(user.id, file);
            if (response.success) {
                setUploadedResumeId(response.data._id);
                toast.success("Resume uploaded successfully!");
            } else {
                toast.error(response.message || "Failed to upload resume");
                setResumeFile(null);
            }
        } catch (error) {
            toast.error("Failed to upload resume");
            setResumeFile(null);
        } finally {
            setUploading(false);
        }
    };

    // # Handle Apply
    const handleApply = async (e) => {
        e.preventDefault();
        try {
            const response = await applyToJob(user.id, {
                job_id: selectedJob._id,
                cover_letter: coverLetter,
                resume_id: uploadedResumeId
            });
            if (response.success) {
                toast.success("Application submitted successfully!");
                setShowApplyModal(false);
                setCoverLetter("");
                setResumeFile(null);
                setUploadedResumeId(null);
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
        setResumeFile(null);
        setUploadedResumeId(null);
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

    // # Handle Withdraw Application
    const handleWithdraw = async (applicationId) => {
        if (!confirm("Are you sure you want to withdraw this application?")) return;

        setWithdrawing(applicationId);
        try {
            const response = await withdrawApplication(user.id, applicationId);
            if (response.success) {
                toast.success("Application withdrawn successfully!");
                fetchApplications();
                fetchJobs();
            } else {
                toast.error(response.message || "Failed to withdraw application");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setWithdrawing(null);
        }
    };

    // # Open Resume Viewer
    const openResumeViewer = (resumeId) => {
        setResumeViewUrl(getResumeViewUrl(resumeId));
        setPdfZoom(100);
        setShowResumeViewer(true);
    };

    // # Get Application Count Display (for candidates - focus on remaining spots)
    const getApplicationCountDisplay = (job) => {
        const current = job.application_count || 0;
        const max = job.max_applications;
        if (max) {
            const remaining = max - current;
            if (remaining <= 0) {
                return { text: "Applications closed", color: "text-red-600", urgent: false };
            } else if (remaining <= 3) {
                return { text: `Only ${remaining} spot${remaining > 1 ? 's' : ''} left!`, color: "text-orange-600", urgent: true };
            } else {
                return { text: `${remaining} spots remaining`, color: "text-purple-600", urgent: false };
            }
        }
        return { text: `${current} applied`, color: "text-gray-600", urgent: false };
    };

    // # Check if Job is Full
    const isJobFull = (job) => {
        if (!job.max_applications) return false;
        const current = job.application_count || 0;
        return current >= job.max_applications;
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
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                                        {job.type && (
                                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
                                                {JOB_TYPE_LABELS[job.type] || job.type}
                                            </span>
                                        )}
                                    </div>

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
                                            <div className="flex items-center text-sm text-green-600 font-medium">
                                                <DollarSign className="w-4 h-4 mr-2" />
                                                {job.salary}
                                            </div>
                                        )}
                                        {job.experience && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Award className="w-4 h-4 mr-2 text-gray-400" />
                                                {job.experience}
                                            </div>
                                        )}
                                        {job.deadline && (
                                            <div className="flex items-center text-sm text-orange-600">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Deadline: {job.deadline}
                                            </div>
                                        )}
                                        {job.max_applications && (
                                            <div className={`flex items-center text-sm ${getApplicationCountDisplay(job).color} ${getApplicationCountDisplay(job).urgent ? 'font-semibold' : ''}`}>
                                                <Users className="w-4 h-4 mr-2" />
                                                {getApplicationCountDisplay(job).text}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>

                                    {job.skills && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {job.skills.split(',').slice(0, 3).map((skill, idx) => (
                                                <span key={idx} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                                    {skill.trim()}
                                                </span>
                                            ))}
                                            {job.skills.split(',').length > 3 && (
                                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                                    +{job.skills.split(',').length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedJob(job);
                                                setShowJobDetailModal(true);
                                            }}
                                            className="flex-1 py-2 rounded-lg font-medium transition-colors border border-gray-300 text-gray-700 hover:bg-gray-50"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => openApplyModal(job)}
                                            disabled={appliedJobIds.includes(job._id) || isJobFull(job)}
                                            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${appliedJobIds.includes(job._id)
                                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                                : isJobFull(job)
                                                    ? "bg-red-100 text-red-500 cursor-not-allowed"
                                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                                }`}
                                        >
                                            {appliedJobIds.includes(job._id) ? "Applied" : isJobFull(job) ? "Full" : "Apply"}
                                        </button>
                                    </div>
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

                                    {/* Resume Link */}
                                    {app.resume_url && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <button
                                                onClick={() => openResumeViewer(app.resume_url)}
                                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                <FileText className="w-4 h-4 mr-1" />
                                                View Your Submitted Resume
                                                <ExternalLink className="w-3 h-3 ml-1" />
                                            </button>
                                        </div>
                                    )}

                                    {app.cover_letter && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Cover Letter:</span> {app.cover_letter}
                                            </p>
                                        </div>
                                    )}

                                    {/* Rejection Reason */}
                                    {app.status === "REJECTED" && app.rejection_reason && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                <p className="text-sm text-red-700">
                                                    <span className="font-medium">Rejection Reason: </span>
                                                    {app.rejection_reason}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Acceptance Message */}
                                    {app.status === "ACCEPTED" && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <p className="text-sm text-green-700">
                                                    <span className="font-medium">Congratulations! </span>
                                                    Your application has been accepted. The recruiter will contact you soon.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Withdraw Button (only for PENDING) */}
                                    {app.status === "PENDING" && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <button
                                                onClick={() => handleWithdraw(app._id)}
                                                disabled={withdrawing === app._id}
                                                className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                {withdrawing === app._id ? (
                                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                )}
                                                Withdraw Application
                                            </button>
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
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Apply to Job</h3>
                            <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900">{selectedJob.title}</h4>
                            <p className="text-sm text-gray-600">{selectedJob.company} • {selectedJob.location}</p>
                            {selectedJob.type && (
                                <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                    {JOB_TYPE_LABELS[selectedJob.type] || selectedJob.type}
                                </span>
                            )}
                        </div>

                        <form onSubmit={handleApply}>
                            {/* Resume Upload */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload Resume <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                                    <div className="space-y-1 text-center">
                                        {resumeFile ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <FileText className="w-8 h-8 text-blue-500" />
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-gray-900">{resumeFile.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setResumeFile(null);
                                                        setUploadedResumeId(null);
                                                    }}
                                                    className="ml-2 text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                        <span>Upload a file</span>
                                                        <input
                                                            type="file"
                                                            accept=".pdf,.doc,.docx"
                                                            onChange={handleResumeUpload}
                                                            className="sr-only"
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                                            </>
                                        )}
                                        {uploading && (
                                            <div className="flex items-center justify-center space-x-2 mt-2">
                                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                                <span className="text-sm text-blue-600">Uploading...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Cover Letter */}
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
                                    disabled={!uploadedResumeId || uploading}
                                    className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${!uploadedResumeId || uploading
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Application
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* # Job Detail Modal # */}
            {showJobDetailModal && selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Job Details</h3>
                            <button onClick={() => setShowJobDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Job Header */}
                            <div className="border-b border-gray-200 pb-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h4>
                                        <p className="text-lg text-gray-600 mt-1">{selectedJob.company}</p>
                                    </div>
                                    {selectedJob.type && (
                                        <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                                            {JOB_TYPE_LABELS[selectedJob.type] || selectedJob.type}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                                    <span className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                        {selectedJob.location}
                                    </span>
                                    {selectedJob.salary && (
                                        <span className="flex items-center text-green-600 font-medium">
                                            <DollarSign className="w-4 h-4 mr-1" />
                                            {selectedJob.salary}
                                        </span>
                                    )}
                                    {selectedJob.experience && (
                                        <span className="flex items-center">
                                            <Award className="w-4 h-4 mr-1 text-gray-400" />
                                            {selectedJob.experience}
                                        </span>
                                    )}
                                    {selectedJob.deadline && (
                                        <span className="flex items-center text-orange-600">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            Deadline: {selectedJob.deadline}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h5 className="text-lg font-semibold text-gray-900 mb-2">Description</h5>
                                <p className="text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
                            </div>

                            {/* Skills */}
                            {selectedJob.skills && (
                                <div>
                                    <h5 className="text-lg font-semibold text-gray-900 mb-2">Required Skills</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedJob.skills.split(',').map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Requirements */}
                            {selectedJob.requirements && (
                                <div>
                                    <h5 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h5>
                                    <p className="text-gray-600 whitespace-pre-line">{selectedJob.requirements}</p>
                                </div>
                            )}

                            {/* Benefits */}
                            {selectedJob.benefits && (
                                <div>
                                    <h5 className="text-lg font-semibold text-gray-900 mb-2">Benefits</h5>
                                    <p className="text-gray-600 whitespace-pre-line">{selectedJob.benefits}</p>
                                </div>
                            )}

                            {/* Apply Button */}
                            <div className="pt-4 border-t border-gray-200">
                                {selectedJob.max_applications && (
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-sm flex items-center ${getApplicationCountDisplay(selectedJob).color} ${getApplicationCountDisplay(selectedJob).urgent ? 'font-semibold' : ''}`}>
                                                <Users className="w-4 h-4 mr-1" />
                                                {getApplicationCountDisplay(selectedJob).text}
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${isJobFull(selectedJob) ? 'bg-red-500' : 'bg-blue-500'}`}
                                                style={{ width: `${Math.min(100, ((selectedJob.application_count || 0) / selectedJob.max_applications) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        setShowJobDetailModal(false);
                                        openApplyModal(selectedJob);
                                    }}
                                    disabled={appliedJobIds.includes(selectedJob._id) || isJobFull(selectedJob)}
                                    className={`w-full py-3 rounded-lg font-medium transition-colors ${appliedJobIds.includes(selectedJob._id)
                                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                        : isJobFull(selectedJob)
                                            ? 'bg-red-100 text-red-500 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {appliedJobIds.includes(selectedJob._id) ? 'Already Applied' : isJobFull(selectedJob) ? 'Applications Full' : 'Apply Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* # Resume Viewer Modal # */}
            {showResumeViewer && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900">Resume Viewer</h3>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => setPdfZoom(Math.max(50, pdfZoom - 25))}
                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="w-5 h-5" />
                                </button>
                                <span className="text-sm text-gray-600 min-w-[60px] text-center font-medium">{pdfZoom}%</span>
                                <button
                                    onClick={() => setPdfZoom(Math.min(200, pdfZoom + 25))}
                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                <a
                                    href={resumeViewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                    title="Open in New Tab"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                                <a
                                    href={resumeViewUrl.replace('/view', '/download')}
                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                    title="Download"
                                >
                                    <Download className="w-5 h-5" />
                                </a>
                                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                <button
                                    onClick={() => setShowResumeViewer(false)}
                                    className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                                    title="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {/* PDF Content */}
                        <div className="flex-1 overflow-auto bg-gray-100">
                            <div
                                className="min-h-full flex justify-center p-6"
                                style={{ transform: `scale(${pdfZoom / 100})`, transformOrigin: 'top center' }}
                            >
                                <embed
                                    src={resumeViewUrl + '#toolbar=0&navpanes=0&scrollbar=1'}
                                    type="application/pdf"
                                    className="bg-white shadow-xl rounded"
                                    style={{ width: '850px', height: '1100px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CandidateDashboard;
