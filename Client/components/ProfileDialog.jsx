'use client';

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { X, User, Building2, MapPin, Phone, Mail, Globe, Briefcase, GraduationCap, Linkedin, FileText, DollarSign, Calendar, Users, Info, Save, AlertCircle, Upload, Image, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { updateProfile, uploadLogo, getLogoViewUrl } from "@/lib/api";

// # Industry Options #
const INDUSTRIES = [
    "Technology", "Healthcare", "Finance", "Education", "Retail", "Manufacturing",
    "Consulting", "Media", "Real Estate", "Transportation", "Hospitality", "Other"
];

// # Company Size Options #
const COMPANY_SIZES = [
    "1-10 employees", "11-50 employees", "51-200 employees",
    "201-500 employees", "501-1000 employees", "1000+ employees", "Other"
];

// # Experience Level Options #
const EXPERIENCE_LEVELS = [
    "Fresher (0-1 years)", "Junior (1-3 years)", "Mid-level (3-5 years)",
    "Senior (5-8 years)", "Lead (8-10 years)", "Expert (10+ years)"
];

// # Education Options #
const EDUCATION_OPTIONS = [
    "High School", "Bachelor's Degree", "Master's Degree", "PhD", "Diploma", "Other"
];

// # 'Profile Dialog' Component #
const ProfileDialog = ({ isOpen, onClose, userData, clerkUserId, onProfileUpdate }) => {
    const { user: clerkUser } = useUser();
    const [loading, setLoading] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const isRecruiter = userData?.role === "RECRUITER";
    const isCandidate = userData?.role === "CANDIDATE";

    // # Form Data #
    const [formData, setFormData] = useState({
        // Common fields
        phone: "",
        location: "",
        linkedin_url: "",
        // Candidate fields
        bio: "",
        skills: "",
        experience_level: "",
        current_title: "",
        education_degree: "",
        custom_education_degree: "",
        education_college: "",
        portfolio_url: "",
        expected_salary: "",
        // Recruiter/Company fields
        company_name: "",
        company_logo: "",
        company_website: "",
        company_email: "",
        company_phone: "",
        industry: "",
        custom_industry: "",
        company_size: "",
        custom_company_size: "",
        headquarters: "",
        company_description: "",
        founded_year: "",
        company_linkedin: ""
    });

    // # Effect: Populate form data from userData (reset on dialog open) #
    useEffect(() => {
        if (isOpen && userData) {
            // Check if industry is a custom value (not in predefined list)
            const isCustomIndustry = userData.industry && !INDUSTRIES.includes(userData.industry);
            // Check if education_degree is a custom value (not in predefined list)
            const isCustomEducation = userData.education_degree && !EDUCATION_OPTIONS.includes(userData.education_degree);
            // Check if company_size is a custom value (not in predefined list)
            const isCustomCompanySize = userData.company_size && !COMPANY_SIZES.includes(userData.company_size);

            setFormData({
                phone: userData.phone || "",
                location: userData.location || "",
                linkedin_url: userData.linkedin_url || "",
                bio: userData.bio || "",
                skills: userData.skills || "",
                experience_level: userData.experience_level || "",
                current_title: userData.current_title || "",
                education_degree: isCustomEducation ? "Other" : (userData.education_degree || ""),
                custom_education_degree: isCustomEducation ? userData.education_degree : "",
                education_college: userData.education_college || "",
                portfolio_url: userData.portfolio_url || "",
                expected_salary: userData.expected_salary || "",
                company_name: userData.company_name || "",
                company_logo: userData.company_logo || "",
                company_website: userData.company_website || "",
                company_email: userData.company_email || "",
                company_phone: userData.company_phone || "",
                industry: isCustomIndustry ? "Other" : (userData.industry || ""),
                custom_industry: isCustomIndustry ? userData.industry : "",
                company_size: isCustomCompanySize ? "Other" : (userData.company_size || ""),
                custom_company_size: isCustomCompanySize ? userData.company_size : "",
                headquarters: userData.headquarters || "",
                company_description: userData.company_description || "",
                founded_year: userData.founded_year || "",
                company_linkedin: userData.company_linkedin || ""
            });
            // Set logo preview if exists
            if (userData.company_logo) {
                setLogoPreview(getLogoViewUrl(userData.company_logo));
            } else {
                setLogoPreview(null);
            }
        }
    }, [isOpen, userData]);

    // # Handle Logo Upload #
    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only PNG, JPEG, GIF, and WebP images are allowed");
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Logo size must be less than 2MB");
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => setLogoPreview(e.target.result);
        reader.readAsDataURL(file);

        setUploadingLogo(true);
        try {
            const response = await uploadLogo(clerkUserId, file);
            if (response.success) {
                toast.success("Logo uploaded successfully!");
                setFormData(prev => ({ ...prev, company_logo: response.data._id }));
                setLogoPreview(getLogoViewUrl(response.data._id));
            } else {
                toast.error(response.message || "Failed to upload logo");
                setLogoPreview(userData?.company_logo ? getLogoViewUrl(userData.company_logo) : null);
            }
        } catch (error) {
            toast.error("Failed to upload logo");
            setLogoPreview(userData?.company_logo ? getLogoViewUrl(userData.company_logo) : null);
        } finally {
            setUploadingLogo(false);
        }
    };

    // # Handle Input Change #
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // # Handle Submit #
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Replace "Other" with custom values
            const submitData = {
                ...formData,
                industry: formData.industry === "Other" && formData.custom_industry
                    ? formData.custom_industry
                    : formData.industry,
                education_degree: formData.education_degree === "Other" && formData.custom_education_degree
                    ? formData.custom_education_degree
                    : formData.education_degree,
                company_size: formData.company_size === "Other" && formData.custom_company_size
                    ? formData.custom_company_size
                    : formData.company_size,
            };
            // Remove custom fields before sending
            delete submitData.custom_industry;
            delete submitData.custom_education_degree;
            delete submitData.custom_company_size;

            const response = await updateProfile(clerkUserId, submitData);
            if (response.success) {
                toast.success("Profile updated successfully!");
                onProfileUpdate?.(response.data);
                onClose();
            } else {
                toast.error(response.message || "Failed to update profile");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        {isRecruiter ? (
                            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        ) : (
                            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        )}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {isRecruiter ? "Company Profile" : "Complete Your Profile"}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {isRecruiter ? "Add your company information" : "Help recruiters find you"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Progress Bar - Using backend calculated value */}
                <div className="px-4 py-3 border-b dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Completion</span>
                        <span className={`text-sm font-bold ${(userData?.profile_completion ?? 0) < 50 ? 'text-red-500' : (userData?.profile_completion ?? 0) < 80 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {userData?.profile_completion ?? 0}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${(userData?.profile_completion ?? 0) < 50 ? 'bg-red-500' : (userData?.profile_completion ?? 0) < 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${userData?.profile_completion ?? 0}%` }}
                        />
                    </div>
                    {(userData?.profile_completion ?? 0) < 80 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Complete at least 80% to {isRecruiter ? 'post jobs' : 'apply for jobs'}
                        </p>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Account Info - Read Only */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <User className="w-4 h-4" /> {isRecruiter ? "Recruiter" : "Candidate"} Account Information
                            <span className="text-xs font-normal text-gray-400">(Read-only)</span>
                        </h3>

                        {/* Profile Image - Always Clerk User */}
                        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            {clerkUser?.imageUrl ? (
                                <img src={clerkUser.imageUrl} alt="Profile" className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200" />
                            ) : (
                                <div className={`w-16 h-16 bg-gradient-to-br ${isRecruiter ? "from-purple-500 to-purple-700" : "from-blue-500 to-blue-700"} rounded-xl flex items-center justify-center text-white font-bold text-xl`}>
                                    {clerkUser?.firstName?.charAt(0)?.toUpperCase() || <User className="w-8 h-8" />}
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {clerkUser?.firstName || ""} {clerkUser?.lastName || ""}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{userData?.email}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${isRecruiter ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                                    {isRecruiter ? "RECRUITER" : "CANDIDATE"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Recruiter/Company Fields */}
                    {isRecruiter && (
                        <>
                            {/* Company Basic Info */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" /> Company Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
                                        <input
                                            type="text"
                                            name="company_name"
                                            value={formData.company_name}
                                            onChange={handleChange}
                                            placeholder="Enter company name"
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry *</label>
                                        <select
                                            name="industry"
                                            value={formData.industry}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select industry</option>
                                            {INDUSTRIES.map(ind => (
                                                <option key={ind} value={ind}>{ind}</option>
                                            ))}
                                        </select>
                                        {formData.industry === "Other" && (
                                            <input
                                                type="text"
                                                name="custom_industry"
                                                value={formData.custom_industry}
                                                onChange={handleChange}
                                                placeholder="Enter your industry"
                                                className="w-full mt-2 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Size *</label>
                                        <select
                                            name="company_size"
                                            value={formData.company_size}
                                            onChange={(e) => setFormData({ ...formData, company_size: e.target.value, custom_company_size: "" })}
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select size</option>
                                            {COMPANY_SIZES.map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                        {formData.company_size === "Other" && (
                                            <input
                                                type="text"
                                                name="custom_company_size"
                                                value={formData.custom_company_size}
                                                onChange={handleChange}
                                                placeholder="Enter company size"
                                                className="w-full mt-2 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Founded Year</label>
                                        <input
                                            type="number"
                                            name="founded_year"
                                            value={formData.founded_year}
                                            onChange={handleChange}
                                            placeholder="e.g. 2020"
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Headquarters *</label>
                                    <input
                                        type="text"
                                        name="headquarters"
                                        value={formData.headquarters}
                                        onChange={handleChange}
                                        placeholder="e.g. Mumbai, India"
                                        className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Description *</label>
                                    <textarea
                                        name="company_description"
                                        value={formData.company_description}
                                        onChange={handleChange}
                                        placeholder="Tell candidates about your company..."
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Company Contact Info */}
                            <div className="space-y-3 pt-2">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Contact Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Email *</label>
                                        <input
                                            type="email"
                                            name="company_email"
                                            value={formData.company_email}
                                            onChange={handleChange}
                                            placeholder="hr@company.com"
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Phone *</label>
                                        <input
                                            type="tel"
                                            name="company_phone"
                                            value={formData.company_phone}
                                            onChange={handleChange}
                                            placeholder="+91 98765 43210"
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Website *</label>
                                        <input
                                            type="url"
                                            name="company_website"
                                            value={formData.company_website}
                                            onChange={handleChange}
                                            placeholder="https://company.com"
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company LinkedIn</label>
                                        <input
                                            type="url"
                                            name="company_linkedin"
                                            value={formData.company_linkedin}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/company/..."
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Logo</label>
                                    <div className="flex items-center gap-4">
                                        {/* Logo Preview */}
                                        <div className="flex-shrink-0">
                                            {logoPreview ? (
                                                <img
                                                    src={logoPreview}
                                                    alt="Company Logo"
                                                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                                                    <Image className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        {/* Upload Button */}
                                        <div className="flex-1">
                                            <label className="cursor-pointer">
                                                <div className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition-colors ${uploadingLogo ? 'border-blue-300 bg-blue-50' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}>
                                                    {uploadingLogo ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                                            <span className="text-sm text-blue-600 dark:text-blue-400">Uploading...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                                {logoPreview ? 'Change Logo' : 'Upload Logo'}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                                                    onChange={handleLogoUpload}
                                                    className="hidden"
                                                    disabled={uploadingLogo}
                                                />
                                            </label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPEG, GIF, WebP (max 2MB)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Candidate Fields */}
                    {isCandidate && (
                        <>
                            {/* Personal Info */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+91 98765 43210"
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="e.g. Mumbai, India"
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About Me *</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Tell recruiters about yourself..."
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Professional Info */}
                            <div className="space-y-3 pt-2">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> Professional Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current/Last Job Title *</label>
                                        <input
                                            type="text"
                                            name="current_title"
                                            value={formData.current_title}
                                            onChange={handleChange}
                                            placeholder="e.g. Software Engineer"
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience Level *</label>
                                        <select
                                            name="experience_level"
                                            value={formData.experience_level}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select experience</option>
                                            {EXPERIENCE_LEVELS.map(level => (
                                                <option key={level} value={level}>{level}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills *</label>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        placeholder="e.g. JavaScript, React, Node.js, Python"
                                        className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Salary</label>
                                    <input
                                        type="text"
                                        name="expected_salary"
                                        value={formData.expected_salary}
                                        onChange={handleChange}
                                        placeholder="e.g. ₹8-12 LPA"
                                        className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Education */}
                            <div className="space-y-3 pt-2">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" /> Education
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Highest Degree *</label>
                                        <select
                                            name="education_degree"
                                            value={formData.education_degree}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select degree</option>
                                            {EDUCATION_OPTIONS.map(deg => (
                                                <option key={deg} value={deg}>{deg}</option>
                                            ))}
                                        </select>
                                        {formData.education_degree === "Other" && (
                                            <input
                                                type="text"
                                                name="custom_education_degree"
                                                value={formData.custom_education_degree}
                                                onChange={handleChange}
                                                placeholder="Enter your degree"
                                                className="w-full mt-2 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">College/University *</label>
                                        <input
                                            type="text"
                                            name="education_college"
                                            value={formData.education_college}
                                            onChange={handleChange}
                                            placeholder="e.g. IIT Mumbai"
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Links */}
                            <div className="space-y-3 pt-2">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> Links
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn Profile</label>
                                        <input
                                            type="url"
                                            name="linkedin_url"
                                            value={formData.linkedin_url}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/in/..."
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio URL</label>
                                        <input
                                            type="url"
                                            name="portfolio_url"
                                            value={formData.portfolio_url}
                                            onChange={handleChange}
                                            placeholder="https://yourportfolio.com"
                                            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </form>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    {(userData?.profile_completion ?? 0) < 80 && (
                        <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>Complete at least 80% for better visibility</span>
                        </div>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDialog;
