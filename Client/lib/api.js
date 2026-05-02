// ## API Functions ##

// # API Configuration #
const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:3001";
const API_VERSION = process.env.NEXT_PUBLIC_SERVER_API_VERSION || "/api/v1";

// # Build API URL #
const buildUrl = (path) => {
    return `${API_BASE_URL}${API_VERSION}${path}`;
};

// # Make API Request #
const apiRequest = async (path, options = {}) => {
    const url = buildUrl(path);

    const config = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    return data;
};

// ## User API ##

// # Get User #
export const getUser = async (clerkUserId) => {
    return await apiRequest("/user", {
        method: "GET",
        headers: {
            "clerk-user-id": clerkUserId,
        },
    });
};

// # Set User Role #
export const setUserRole = async (clerkUserId, role) => {
    return await apiRequest("/user/role", {
        method: "PUT",
        headers: {
            "clerk-user-id": clerkUserId,
        },
        body: JSON.stringify({
            data: { role },
        }),
    });
};

// ## Job API ##

// # Get All Jobs #
export const getAllJobs = async () => {
    return await apiRequest("/job/list", {
        method: "GET",
    });
};

// # Get My Jobs (Recruiter) #
export const getMyJobs = async (clerkUserId) => {
    return await apiRequest("/job/my-jobs", {
        method: "GET",
        headers: {
            "clerk-user-id": clerkUserId,
        },
    });
};

// # Get Job By ID #
export const getJobById = async (jobId) => {
    return await apiRequest(`/job/${jobId}`, {
        method: "GET",
    });
};

// # Create Job #
export const createJob = async (clerkUserId, jobData) => {
    return await apiRequest("/job", {
        method: "POST",
        headers: {
            "clerk-user-id": clerkUserId,
        },
        body: JSON.stringify({
            data: jobData,
        }),
    });
};

// # Delete Job #
export const deleteJob = async (clerkUserId, jobId) => {
    return await apiRequest(`/job/${jobId}`, {
        method: "DELETE",
        headers: {
            "clerk-user-id": clerkUserId,
        },
    });
};

// ## Application API ##

// # Apply to Job #
export const applyToJob = async (clerkUserId, applicationData) => {
    return await apiRequest("/application", {
        method: "POST",
        headers: {
            "clerk-user-id": clerkUserId,
        },
        body: JSON.stringify({
            data: applicationData,
        }),
    });
};

// # Get Applications by Job (Recruiter) #
export const getApplicationsByJob = async (clerkUserId, jobId) => {
    return await apiRequest(`/application/job/${jobId}`, {
        method: "GET",
        headers: {
            "clerk-user-id": clerkUserId,
        },
    });
};

// # Get My Applications (Candidate) #
export const getMyApplications = async (clerkUserId) => {
    return await apiRequest("/application/my-applications", {
        method: "GET",
        headers: {
            "clerk-user-id": clerkUserId,
        },
    });
};

// # Update Application Status #
export const updateApplicationStatus = async (clerkUserId, applicationId, status, reason = null) => {
    let url = `/application/${applicationId}/status?status=${status}`;
    if (reason) {
        url += `&reason=${encodeURIComponent(reason)}`;
    }
    return await apiRequest(url, {
        method: "PUT",
        headers: {
            "clerk-user-id": clerkUserId,
        },
    });
};

// # Withdraw Application (Candidate) #
export const withdrawApplication = async (clerkUserId, applicationId) => {
    return await apiRequest(`/application/${applicationId}`, {
        method: "DELETE",
        headers: {
            "clerk-user-id": clerkUserId,
        },
    });
};

// # Export Applications to Excel #
export const exportApplicationsToExcel = async (clerkUserId, jobId) => {
    const url = `${API_BASE_URL}${API_VERSION}/application/job/${jobId}/export`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "clerk-user-id": clerkUserId,
        },
    });
    return response.blob();
};

// ## File API ##

// # Upload Resume #
export const uploadResume = async (clerkUserId, file) => {
    const url = `${API_BASE_URL}${API_VERSION}/file/resume`;
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "clerk-user-id": clerkUserId,
        },
        body: formData,
    });
    return response.json();
};

// # Get Resume View URL #
export const getResumeViewUrl = (resumeId) => {
    return `${API_BASE_URL}${API_VERSION}/file/resume/${resumeId}/view`;
};

// # Delete Resume #
export const deleteResume = async (clerkUserId) => {
    return await apiRequest("/file/resume", {
        method: "DELETE",
        headers: {
            "clerk-user-id": clerkUserId,
        },
    });
};
