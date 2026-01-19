import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ResearcherVerification = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);

    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        dateOfBirth: '',
        idType: 'university_id',
        idNumber: '',
        institution: user?.institution || '',
        department: '',
        position: '',
        researchAreas: [],
        orcidId: '',
        googleScholarId: '',
        linkedInProfile: '',
        personalWebsite: '',
    });

    const [files, setFiles] = useState({
        idDocument: null,
        profilePhoto: null,
    });

    const [previews, setPreviews] = useState({
        idDocument: null,
        profilePhoto: null,
    });

    const [newResearchArea, setNewResearchArea] = useState('');

    useEffect(() => {
        checkVerificationStatus();
    }, []);

    const checkVerificationStatus = async () => {
        try {
            const response = await axios.get('/api/verification/status');
            setVerificationStatus(response.data.data);
        } catch (error) {
            console.error('Failed to check verification status');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles[0]) {
            // Validate file size (5MB max)
            if (selectedFiles[0].size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }

            setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));

            // Create preview for images
            if (selectedFiles[0].type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => ({ ...prev, [name]: reader.result }));
                };
                reader.readAsDataURL(selectedFiles[0]);
            } else {
                setPreviews(prev => ({ ...prev, [name]: 'pdf' }));
            }
        }
    };

    const addResearchArea = () => {
        if (newResearchArea.trim() && !formData.researchAreas.includes(newResearchArea.trim())) {
            setFormData(prev => ({
                ...prev,
                researchAreas: [...prev.researchAreas, newResearchArea.trim()],
            }));
            setNewResearchArea('');
        }
    };

    const removeResearchArea = (area) => {
        setFormData(prev => ({
            ...prev,
            researchAreas: prev.researchAreas.filter(a => a !== area),
        }));
    };

    const validateStep = (stepNum) => {
        switch (stepNum) {
            case 1:
                if (!formData.fullName || !formData.institution) {
                    toast.error('Please fill in required fields');
                    return false;
                }
                return true;
            case 2:
                if (formData.researchAreas.length === 0) {
                    toast.error('Please add at least one research area');
                    return false;
                }
                return true;
            case 3:
                if (!formData.idType || !formData.idNumber) {
                    toast.error('Please provide ID information');
                    return false;
                }
                if (!files.idDocument) {
                    toast.error('Please upload your ID document');
                    return false;
                }
                return true;
            case 4:
                if (!files.profilePhoto) {
                    toast.error('Please upload your profile photo');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep(4)) return;

        setLoading(true);
        try {
            const submitData = new FormData();

            // Append form fields
            Object.keys(formData).forEach(key => {
                if (key === 'researchAreas') {
                    submitData.append(key, JSON.stringify(formData[key]));
                } else {
                    submitData.append(key, formData[key]);
                }
            });

            // Append files
            if (files.idDocument) {
                submitData.append('idDocument', files.idDocument);
            }
            if (files.profilePhoto) {
                submitData.append('profilePhoto', files.profilePhoto);
            }

            const response = await axios.post('/api/verification/submit', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                toast.success('Verification request submitted successfully!');
                if (refreshUser) {
                    await refreshUser();
                }
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit verification');
        } finally {
            setLoading(false);
        }
    };

    // Show status if already submitted
    if (verificationStatus && verificationStatus.status !== 'unverified' && verificationStatus.status !== 'rejected') {
        return (
            <div className="min-h-screen bg-bg-primary py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-bg-card border-2 border-border-primary rounded-lg p-8 text-center">
                        <div className="text-6xl mb-4">
                            {verificationStatus.status === 'pending' && '⏳'}
                            {verificationStatus.status === 'under_review' && '🔍'}
                            {verificationStatus.status === 'approved' && '✅'}
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary mb-2">
                            {verificationStatus.status === 'pending' && 'Verification Pending'}
                            {verificationStatus.status === 'under_review' && 'Under Review'}
                            {verificationStatus.status === 'approved' && 'Verified Researcher'}
                        </h2>
                        <p className="text-text-muted mb-6">
                            {verificationStatus.status === 'pending' && 'Your verification request is waiting for admin review.'}
                            {verificationStatus.status === 'under_review' && 'An admin is currently reviewing your documents.'}
                            {verificationStatus.status === 'approved' && 'Congratulations! You are a verified researcher.'}
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-primary"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const positions = [
        'Professor',
        'Associate Professor',
        'Assistant Professor',
        'Lecturer',
        'Research Fellow',
        'Postdoctoral Researcher',
        'PhD Student',
        'Research Assistant',
        'Other',
    ];

    const idTypes = [
        { value: 'university_id', label: 'University ID Card' },
        { value: 'national_id', label: 'National ID/Aadhar' },
        { value: 'passport', label: 'Passport' },
        { value: 'drivers_license', label: "Driver's License" },
    ];

    return (
        <div className="min-h-screen bg-bg-primary py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        Researcher Verification
                    </h1>
                    <p className="text-text-muted">
                        Complete the verification process to unlock researcher features
                    </p>
                </div>

                {/* Rejected Status Banner */}
                {verificationStatus?.status === 'rejected' && (
                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">❌</span>
                            <div>
                                <h3 className="font-semibold text-red-400">Previous Request Rejected</h3>
                                <p className="text-red-300 text-sm mt-1">
                                    {verificationStatus.rejectionReason || 'Your previous verification request was not approved.'}
                                </p>
                                <p className="text-text-muted text-sm mt-2">
                                    Please review the reason and submit a new request with updated information.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s
                                        ? 'bg-text-primary text-bg-primary'
                                        : 'bg-bg-secondary text-text-muted border-2 border-border-primary'
                                    }`}
                            >
                                {step > s ? '✓' : s}
                            </div>
                            {s < 5 && (
                                <div
                                    className={`w-12 sm:w-20 h-1 mx-2 ${step > s ? 'bg-text-primary' : 'bg-border-primary'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Labels */}
                <div className="flex justify-between text-xs text-text-muted mb-8 px-2">
                    <span className={step === 1 ? 'text-text-primary font-semibold' : ''}>Basic Info</span>
                    <span className={step === 2 ? 'text-text-primary font-semibold' : ''}>Academic</span>
                    <span className={step === 3 ? 'text-text-primary font-semibold' : ''}>Identity</span>
                    <span className={step === 4 ? 'text-text-primary font-semibold' : ''}>Photo</span>
                    <span className={step === 5 ? 'text-text-primary font-semibold' : ''}>Review</span>
                </div>

                {/* Form Card */}
                <div className="bg-bg-card border-2 border-border-primary rounded-lg p-8">
                    {/* Step 1: Basic Information */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-bold text-text-primary mb-4">Basic Information</h2>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="Enter your full legal name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Institution/University <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="institution"
                                    value={formData.institution}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="e.g., Stanford University"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="e.g., Computer Science"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Position/Role
                                </label>
                                <select
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                >
                                    <option value="">Select your position</option>
                                    {positions.map(pos => (
                                        <option key={pos} value={pos}>{pos}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Academic Profile */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-bold text-text-primary mb-4">Academic Profile</h2>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Research Areas <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newResearchArea}
                                        onChange={(e) => setNewResearchArea(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResearchArea())}
                                        className="input-field flex-1"
                                        placeholder="e.g., Machine Learning"
                                    />
                                    <button
                                        type="button"
                                        onClick={addResearchArea}
                                        className="btn-primary px-4"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.researchAreas.map(area => (
                                        <span
                                            key={area}
                                            className="px-3 py-1 bg-bg-secondary border border-border-primary rounded-full text-sm flex items-center gap-2"
                                        >
                                            {area}
                                            <button
                                                onClick={() => removeResearchArea(area)}
                                                className="text-text-muted hover:text-red-500"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    ORCID ID
                                </label>
                                <input
                                    type="text"
                                    name="orcidId"
                                    value={formData.orcidId}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="0000-0000-0000-0000"
                                />
                                <p className="text-xs text-text-dim mt-1">
                                    Get your ORCID at <a href="https://orcid.org" target="_blank" rel="noopener noreferrer" className="text-accent-primary">orcid.org</a>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Google Scholar ID
                                </label>
                                <input
                                    type="text"
                                    name="googleScholarId"
                                    value={formData.googleScholarId}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="Your Google Scholar profile ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    LinkedIn Profile
                                </label>
                                <input
                                    type="url"
                                    name="linkedInProfile"
                                    value={formData.linkedInProfile}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="https://linkedin.com/in/yourprofile"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Personal Website
                                </label>
                                <input
                                    type="url"
                                    name="personalWebsite"
                                    value={formData.personalWebsite}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Identity Verification */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-bold text-text-primary mb-4">Identity Verification</h2>

                            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
                                <p className="text-yellow-200 text-sm">
                                    🔒 Your documents are encrypted and only used for verification purposes. They will be reviewed by our admin team.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    ID Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="idType"
                                    value={formData.idType}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                >
                                    {idTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    ID Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="idNumber"
                                    value={formData.idNumber}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="Enter your ID number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Upload ID Document <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-border-primary rounded-lg p-6 text-center">
                                    {previews.idDocument ? (
                                        <div className="space-y-3">
                                            {previews.idDocument === 'pdf' ? (
                                                <div className="text-4xl">📄</div>
                                            ) : (
                                                <img
                                                    src={previews.idDocument}
                                                    alt="ID Preview"
                                                    className="max-h-40 mx-auto rounded-lg"
                                                />
                                            )}
                                            <p className="text-sm text-text-muted">{files.idDocument?.name}</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFiles(prev => ({ ...prev, idDocument: null }));
                                                    setPreviews(prev => ({ ...prev, idDocument: null }));
                                                }}
                                                className="text-red-500 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-4xl mb-2">📤</div>
                                            <p className="text-text-muted mb-2">Drag & drop or click to upload</p>
                                            <p className="text-xs text-text-dim">JPEG, PNG, or PDF (max 5MB)</p>
                                            <input
                                                type="file"
                                                name="idDocument"
                                                accept="image/*,.pdf"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Profile Photo */}
                    {step === 4 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-bold text-text-primary mb-4">Profile Photo</h2>

                            <div className="bg-bg-secondary rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-text-primary mb-2">Photo Guidelines:</h3>
                                <ul className="text-sm text-text-muted space-y-1">
                                    <li>✓ Clear, recent photograph of yourself</li>
                                    <li>✓ Face should be clearly visible</li>
                                    <li>✓ Plain background preferred</li>
                                    <li>✓ Professional appearance</li>
                                </ul>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Upload Profile Photo <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-border-primary rounded-lg p-6 text-center relative">
                                    {previews.profilePhoto ? (
                                        <div className="space-y-3">
                                            <img
                                                src={previews.profilePhoto}
                                                alt="Profile Preview"
                                                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-border-primary"
                                            />
                                            <p className="text-sm text-text-muted">{files.profilePhoto?.name}</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFiles(prev => ({ ...prev, profilePhoto: null }));
                                                    setPreviews(prev => ({ ...prev, profilePhoto: null }));
                                                }}
                                                className="text-red-500 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-24 h-24 rounded-full bg-bg-tertiary mx-auto flex items-center justify-center mb-3">
                                                <span className="text-4xl">👤</span>
                                            </div>
                                            <p className="text-text-muted mb-2">Click to upload your photo</p>
                                            <p className="text-xs text-text-dim">JPEG or PNG (max 5MB)</p>
                                            <input
                                                type="file"
                                                name="profilePhoto"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review & Submit */}
                    {step === 5 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-bold text-text-primary mb-4">Review & Submit</h2>

                            <div className="space-y-4">
                                <div className="bg-bg-secondary rounded-lg p-4">
                                    <h3 className="font-semibold text-text-primary mb-3">Personal Information</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-text-muted">Name:</span>
                                        <span className="text-text-primary">{formData.fullName}</span>
                                        <span className="text-text-muted">Institution:</span>
                                        <span className="text-text-primary">{formData.institution}</span>
                                        <span className="text-text-muted">Department:</span>
                                        <span className="text-text-primary">{formData.department || '-'}</span>
                                        <span className="text-text-muted">Position:</span>
                                        <span className="text-text-primary">{formData.position || '-'}</span>
                                    </div>
                                </div>

                                <div className="bg-bg-secondary rounded-lg p-4">
                                    <h3 className="font-semibold text-text-primary mb-3">Research Areas</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.researchAreas.map(area => (
                                            <span key={area} className="px-3 py-1 bg-bg-primary border border-border-primary rounded-full text-sm">
                                                {area}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-bg-secondary rounded-lg p-4">
                                    <h3 className="font-semibold text-text-primary mb-3">Academic Links</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-text-muted">ORCID:</span>
                                        <span className="text-text-primary">{formData.orcidId || '-'}</span>
                                        <span className="text-text-muted">Google Scholar:</span>
                                        <span className="text-text-primary">{formData.googleScholarId || '-'}</span>
                                        <span className="text-text-muted">LinkedIn:</span>
                                        <span className="text-text-primary truncate">{formData.linkedInProfile || '-'}</span>
                                    </div>
                                </div>

                                <div className="bg-bg-secondary rounded-lg p-4">
                                    <h3 className="font-semibold text-text-primary mb-3">Documents</h3>
                                    <div className="flex items-center gap-4">
                                        {previews.profilePhoto && (
                                            <img
                                                src={previews.profilePhoto}
                                                alt="Profile"
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                        )}
                                        <div className="text-sm">
                                            <p className="text-text-muted">ID Type: <span className="text-text-primary">{idTypes.find(t => t.value === formData.idType)?.label}</span></p>
                                            <p className="text-text-muted">ID Document: <span className="text-green-400">✓ Uploaded</span></p>
                                            <p className="text-text-muted">Profile Photo: <span className="text-green-400">✓ Uploaded</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                                <p className="text-yellow-200 text-sm">
                                    By submitting, you confirm that all information provided is accurate and that you agree to our verification terms.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-border-primary">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-6 py-2 border border-border-primary rounded-lg text-text-muted hover:text-text-primary hover:border-text-primary transition-all"
                            >
                                ← Previous
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-2 text-text-muted hover:text-text-primary transition-all"
                            >
                                Cancel
                            </button>
                        )}

                        {step < 5 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="btn-primary"
                            >
                                Continue →
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary px-8"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="spinner h-5 w-5"></span>
                                        Submitting...
                                    </span>
                                ) : (
                                    'Submit Verification'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResearcherVerification;
