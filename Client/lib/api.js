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
export const updateApplicationStatus = async (clerkUserId, applicationId, status) => {
    return await apiRequest(`/application/${applicationId}/status?status=${status}`, {
        method: "PUT",
        headers: {
            "clerk-user-id": clerkUserId,
        },
    });
};
