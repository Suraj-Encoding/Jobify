'use client';

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { getAllJobs, applyToJob, getMyApplications, uploadResume, getResumeViewUrl, withdrawApplication, getUser, getLogoViewUrl, uploadCoverLetter, getCoverLetterViewUrl } from "@/lib/api";
import { Briefcase, MapPin, DollarSign, Building, X, Send, FileText, Clock, CheckCircle, XCircle, Upload, ExternalLink, Calendar, Award, Loader2, Users, Download, Trash2, User, Settings, AlertTriangle, Globe, FileUp } from "lucide-react";
import ProfileDialog from "@/components/ProfileDialog";
import PDFViewer from "@/components/PDFViewer";

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
const CandidateDashboard = ({ userData: initialUserData }) => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState("jobs");
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showJobDetailModal, setShowJobDetailModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [uploadedResumeId, setUploadedResumeId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [appliedJobIds, setAppliedJobIds] = useState([]);
    // Cover letter state
    const [coverLetterFile, setCoverLetterFile] = useState(null);
    const [uploadedCoverLetterId, setUploadedCoverLetterId] = useState(null);
    const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);
    // PDF Viewer state
    const [showPDFViewer, setShowPDFViewer] = useState(false);
    const [pdfViewerUrl, setPdfViewerUrl] = useState("");
    const [pdfViewerTitle, setPdfViewerTitle] = useState("PDF Viewer");
    const [withdrawing, setWithdrawing] = useState(null);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [applicationToWithdraw, setApplicationToWithdraw] = useState(null);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const [userData, setUserData] = useState(initialUserData);

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

    // # Refresh user data after profile update
    const handleProfileUpdate = async (updatedUser) => {
        if (updatedUser) {
            setUserData(updatedUser);
        } else {
            try {
                const response = await getUser(user.id);
                if (response.success) {
                    setUserData(response.data);
                }
            } catch (error) {
                console.error("Error refreshing user data:", error);
            }
        }
    };

    // # Profile Completion (calculated by backend)
    const profileCompletion = userData?.profile_completion ?? 0;
    const canApply = profileCompletion >= 80;

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

    // # Handle Cover Letter Upload (PDF only)
    const handleCoverLetterUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type (PDF only)
        if (file.type !== 'application/pdf') {
            toast.error("Only PDF files are allowed for cover letters");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        setCoverLetterFile(file);
        setUploadingCoverLetter(true);

        try {
            const response = await uploadCoverLetter(user.id, file);
            if (response.success) {
                setUploadedCoverLetterId(response.data._id);
                toast.success("Cover letter uploaded successfully!");
            } else {
                toast.error(response.message || "Failed to upload cover letter");
                setCoverLetterFile(null);
            }
        } catch (error) {
            toast.error("Failed to upload cover letter");
            setCoverLetterFile(null);
        } finally {
            setUploadingCoverLetter(false);
        }
    };

    // # Handle Apply
    const handleApply = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!uploadedResumeId) {
            toast.error("Please upload your resume");
            return;
        }
        if (!uploadedCoverLetterId) {
            toast.error("Please upload your cover letter");
            return;
        }

        try {
            const response = await applyToJob(user.id, {
                job_id: selectedJob._id,
                cover_letter_id: uploadedCoverLetterId,
                resume_id: uploadedResumeId
            });
            if (response.success) {
                toast.success("Application submitted successfully!");
                setShowApplyModal(false);
                setResumeFile(null);
                setUploadedResumeId(null);
                setCoverLetterFile(null);
                setUploadedCoverLetterId(null);
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
        setResumeFile(null);
        setUploadedResumeId(null);
        setCoverLetterFile(null);
        setUploadedCoverLetterId(null);
        setShowApplyModal(true);
    };

    // # Open PDF Viewer (for resume or cover letter)
    const openPDFViewer = (url, title) => {
        setPdfViewerUrl(url);
        setPdfViewerTitle(title);
        setShowPDFViewer(true);
    };

    // # Get Status Badge Color
    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING": return "bg-yellow-100 text-yellow-700";
            case "UNDER_REVIEW": return "bg-blue-100 text-blue-700";
            case "ACCEPTED": return "bg-green-100 text-green-700";
            case "REJECTED": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    // # Get Status Icon
    const getStatusIcon = (status) => {
        switch (status) {
            case "PENDING": return <Clock className="w-4 h-4" />;
            case "UNDER_REVIEW": return <FileText className="w-4 h-4" />;
            case "ACCEPTED": return <CheckCircle className="w-4 h-4" />;
            case "REJECTED": return <XCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    // # Open Withdraw Modal
    const openWithdrawModal = (app) => {
        setApplicationToWithdraw(app);
        setShowWithdrawModal(true);
    };

    // # Handle Withdraw Application
    const handleWithdraw = async () => {
        if (!applicationToWithdraw) return;

        setWithdrawing(applicationToWithdraw._id);
        try {
            const response = await withdrawApplication(user.id, applicationToWithdraw._id);
            if (response.success) {
                toast.success("Application withdrawn successfully!");
                setShowWithdrawModal(false);
                setApplicationToWithdraw(null);
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

                {/* # Profile Completion Banner # */}
                {!canApply && (
                    <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-red-800 dark:text-red-200">Complete Your Profile to Apply for Jobs</h3>
                                    <p className="text-sm text-red-700 dark:text-red-300">You need at least 80% profile completion to apply. Current: <strong>{profileCompletion}%</strong></p>
                                    <div className="mt-2 w-full max-w-xs bg-red-200 dark:bg-red-900 rounded-full h-2">
                                        <div className="bg-red-600 h-2 rounded-full transition-all" style={{ width: `${profileCompletion}%` }} />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowProfileDialog(true)}
                                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shrink-0"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Complete Profile
                            </button>
                        </div>
                    </div>
                )}

                {/* # Header # */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div className="flex items-center gap-4">
                        {/* Profile Avatar from Clerk */}
                        {user?.imageUrl ? (
                            <img src={user.imageUrl} alt={user?.firstName} className="w-14 h-14 rounded-xl object-cover border-2 border-gray-100 shadow-sm" />
                        ) : (
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-sm text-white font-bold text-xl">
                                {user?.firstName?.charAt(0)?.toUpperCase() || <User className="w-7 h-7" />}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Welcome"}
                                </h2>
                                <button
                                    onClick={() => setShowProfileDialog(true)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Profile"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                                Find your dream job
                                {userData?.current_title ? ` • ${userData.current_title}` : ""}
                                {userData?.location ? ` • ${userData.location}` : ""}
                            </p>
                        </div>
                    </div>
                    {userData?.linkedin_url && (
                        <a
                            href={userData.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Globe className="w-4 h-4 mr-2" />
                            View LinkedIn
                        </a>
                    )}
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
                                    <div className="flex items-start gap-3 mb-4">
                                        {/* Company Logo */}
                                        {job.company_logo ? (
                                            <img src={getLogoViewUrl(job.company_logo)} alt={job.company} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                                <Building className="w-6 h-6 text-blue-600" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                                                {job.type && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full whitespace-nowrap shrink-0">
                                                        {JOB_TYPE_LABELS[job.type] || job.type}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 font-medium">{job.company}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
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
                                            onClick={() => {
                                                if (!canApply) {
                                                    toast.error(`Complete at least 80% of your profile to apply. Current: ${profileCompletion}%`);
                                                    setShowProfileDialog(true);
                                                    return;
                                                }
                                                openApplyModal(job);
                                            }}
                                            disabled={appliedJobIds.includes(job._id) || isJobFull(job) || !canApply}
                                            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${appliedJobIds.includes(job._id)
                                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                                : isJobFull(job)
                                                    ? "bg-red-100 text-red-500 cursor-not-allowed"
                                                    : !canApply
                                                        ? "bg-orange-100 text-orange-600 cursor-not-allowed"
                                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                                }`}
                                        >
                                            {appliedJobIds.includes(job._id) ? "Applied" : isJobFull(job) ? "Full" : !canApply ? `${profileCompletion}%` : "Apply"}
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
                                            <span className="ml-1.5">{app.status === "UNDER_REVIEW" ? "Under Review" : app.status}</span>
                                        </div>
                                    </div>

                                    {/* Documents - Resume and Cover Letter */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                                        {/* Resume Link */}
                                        {app.resume_url && (
                                            <button
                                                onClick={() => openPDFViewer(getResumeViewUrl(app.resume_url), "Resume")}
                                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                                            >
                                                <FileText className="w-4 h-4 mr-1" />
                                                View Resume
                                                <ExternalLink className="w-3 h-3 ml-1" />
                                            </button>
                                        )}

                                        {/* Cover Letter Link */}
                                        {app.cover_letter_url && (
                                            <button
                                                onClick={() => openPDFViewer(getCoverLetterViewUrl(app.cover_letter_url), "Cover Letter")}
                                                className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded-lg transition-colors"
                                            >
                                                <FileUp className="w-4 h-4 mr-1" />
                                                View Cover Letter
                                                <ExternalLink className="w-3 h-3 ml-1" />
                                            </button>
                                        )}
                                    </div>

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

                                    {/* Withdraw Button (for PENDING and UNDER_REVIEW only) */}
                                    {(app.status === "PENDING" || app.status === "UNDER_REVIEW") && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <button
                                                onClick={() => openWithdrawModal(app)}
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

                            {/* Cover Letter Upload (PDF only) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload Cover Letter <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-purple-400 transition-colors">
                                    <div className="space-y-1 text-center">
                                        {coverLetterFile ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <FileUp className="w-8 h-8 text-purple-500" />
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-gray-900">{coverLetterFile.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {(coverLetterFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCoverLetterFile(null);
                                                        setUploadedCoverLetterId(null);
                                                    }}
                                                    className="ml-2 text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <FileUp className="mx-auto h-10 w-10 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500">
                                                        <span>Upload a PDF</span>
                                                        <input
                                                            type="file"
                                                            accept=".pdf"
                                                            onChange={handleCoverLetterUpload}
                                                            className="sr-only"
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PDF only, up to 5MB</p>
                                            </>
                                        )}
                                        {uploadingCoverLetter && (
                                            <div className="flex items-center justify-center space-x-2 mt-2">
                                                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                                <span className="text-sm text-purple-600">Uploading...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                                    disabled={!uploadedResumeId || !uploadedCoverLetterId || uploading || uploadingCoverLetter}
                                    className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${!uploadedResumeId || !uploadedCoverLetterId || uploading || uploadingCoverLetter
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
                            {/* Job Header with Company Logo */}
                            <div className="border-b border-gray-200 pb-6">
                                <div className="flex items-start gap-4">
                                    {/* Company Logo */}
                                    {selectedJob.company_logo ? (
                                        <img src={selectedJob.company_logo} alt={selectedJob.company} className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                                    ) : (
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                                            <Building className="w-8 h-8 text-blue-600" />
                                        </div>
                                    )}
                                    <div className="flex-1">
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
                                    </div>
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
                                    {selectedJob.company_website && (
                                        <a
                                            href={selectedJob.company_website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-blue-600 hover:text-blue-700"
                                        >
                                            <Globe className="w-4 h-4 mr-1" />
                                            Company Website
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Company Info (if available from recruiter) */}
                            {selectedJob.recruiter && (selectedJob.recruiter.company_description || selectedJob.recruiter.industry) && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <Building className="w-5 h-5 text-gray-600" />
                                        About {selectedJob.company}
                                    </h5>
                                    {selectedJob.recruiter.company_description && (
                                        <p className="text-sm text-gray-600 mb-3">{selectedJob.recruiter.company_description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                        {selectedJob.recruiter.industry && (
                                            <span className="px-2 py-1 bg-white rounded-lg border border-gray-200">
                                                {selectedJob.recruiter.industry}
                                            </span>
                                        )}
                                        {selectedJob.recruiter.company_size && (
                                            <span className="px-2 py-1 bg-white rounded-lg border border-gray-200">
                                                {selectedJob.recruiter.company_size}
                                            </span>
                                        )}
                                        {selectedJob.recruiter.headquarters && (
                                            <span className="px-2 py-1 bg-white rounded-lg border border-gray-200">
                                                📍 {selectedJob.recruiter.headquarters}
                                            </span>
                                        )}
                                        {selectedJob.recruiter.founded_year && (
                                            <span className="px-2 py-1 bg-white rounded-lg border border-gray-200">
                                                Founded {selectedJob.recruiter.founded_year}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

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
                                        if (!canApply) {
                                            toast.error(`Complete at least 80% of your profile to apply. Current: ${profileCompletion}%`);
                                            setShowProfileDialog(true);
                                            return;
                                        }
                                        setShowJobDetailModal(false);
                                        openApplyModal(selectedJob);
                                    }}
                                    disabled={appliedJobIds.includes(selectedJob._id) || isJobFull(selectedJob) || !canApply}
                                    className={`w-full py-3 rounded-lg font-medium transition-colors ${appliedJobIds.includes(selectedJob._id)
                                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                        : isJobFull(selectedJob)
                                            ? 'bg-red-100 text-red-500 cursor-not-allowed'
                                            : !canApply
                                                ? 'bg-orange-100 text-orange-600 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {appliedJobIds.includes(selectedJob._id) ? 'Already Applied' : isJobFull(selectedJob) ? 'Applications Full' : !canApply ? `Complete Profile (${profileCompletion}%)` : 'Apply Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* # PDF Viewer (for Resume and Cover Letter) # */}
            <PDFViewer
                isOpen={showPDFViewer}
                onClose={() => setShowPDFViewer(false)}
                pdfUrl={pdfViewerUrl}
                title={pdfViewerTitle}
            />

            {/* # Withdraw Confirmation Modal # */}
            {showWithdrawModal && applicationToWithdraw && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[80] p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Withdraw Application</h3>
                        <p className="text-gray-600 text-center mb-2">
                            Are you sure you want to withdraw your application for:
                        </p>
                        <p className="text-gray-900 font-medium text-center mb-4">
                            "{applicationToWithdraw.job?.title || 'this job'}"
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                            <p className="text-sm text-yellow-700 text-center">
                                <span className="font-medium">Note: </span>
                                This action cannot be undone. You can apply again if the position is still open.
                            </p>
                        </div>
                        <div className="flex justify-center space-x-3">
                            <button
                                onClick={() => { setShowWithdrawModal(false); setApplicationToWithdraw(null); }}
                                className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWithdraw}
                                disabled={withdrawing}
                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors inline-flex items-center"
                            >
                                {withdrawing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Withdrawing...
                                    </>
                                ) : (
                                    'Withdraw'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* # Profile Dialog # */}
            <ProfileDialog
                isOpen={showProfileDialog}
                onClose={() => setShowProfileDialog(false)}
                userData={userData}
                clerkUserId={user?.id}
                onProfileUpdate={handleProfileUpdate}
            />
        </>
    );
};

export default CandidateDashboard;
