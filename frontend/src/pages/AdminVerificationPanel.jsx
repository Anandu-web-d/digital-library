import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../config/api';

const AdminVerificationPanel = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState('pending');
    const [selectedVerification, setSelectedVerification] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchVerifications();
        fetchStats();
    }, [user, filter]);

    const fetchVerifications = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/verification/pending?status=${filter}`);
            setVerifications(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load verification requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/verification/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to load stats');
        }
    };

    const handleViewDetails = async (id) => {
        try {
            const response = await axios.get(`/api/verification/${id}`);
            setSelectedVerification(response.data.data);
            setShowModal(true);
        } catch (error) {
            toast.error('Failed to load verification details');
        }
    };

    const handleApprove = async (id) => {
        setActionLoading(true);
        try {
            await axios.post(`/api/verification/${id}/approve`, {
                notes: 'Verified and approved',
            });
            toast.success('Researcher verification approved!');
            setShowModal(false);
            setSelectedVerification(null);
            fetchVerifications();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id) => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        setActionLoading(true);
        try {
            await axios.post(`/api/verification/${id}/reject`, {
                reason: rejectReason,
            });
            toast.success('Verification rejected');
            setShowModal(false);
            setSelectedVerification(null);
            setRejectReason('');
            fetchVerifications();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject');
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkUnderReview = async (id) => {
        setActionLoading(true);
        try {
            await axios.post(`/api/verification/${id}/review`);
            toast.success('Marked as under review');
            fetchVerifications();
            fetchStats();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
            under_review: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
            approved: 'bg-green-500/20 text-green-400 border-green-500/50',
            rejected: 'bg-red-500/20 text-red-400 border-red-500/50',
        };

        const labels = {
            pending: 'Pending',
            under_review: 'Under Review',
            approved: 'Approved',
            rejected: 'Rejected',
        };

        return (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-bg-primary py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">Researcher Verification</h1>
                        <p className="text-text-muted mt-1">Review and approve researcher verification requests</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin')}
                        className="text-text-muted hover:text-text-primary"
                    >
                        ← Back to Admin
                    </button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div
                            onClick={() => setFilter('pending')}
                            className={`bg-bg-card border-2 rounded-lg p-4 cursor-pointer transition-all ${filter === 'pending' ? 'border-yellow-500' : 'border-border-primary hover:border-text-muted'
                                }`}
                        >
                            <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
                            <div className="text-text-muted text-sm">Pending</div>
                        </div>
                        <div
                            onClick={() => setFilter('under_review')}
                            className={`bg-bg-card border-2 rounded-lg p-4 cursor-pointer transition-all ${filter === 'under_review' ? 'border-blue-500' : 'border-border-primary hover:border-text-muted'
                                }`}
                        >
                            <div className="text-3xl font-bold text-blue-400">{stats.under_review}</div>
                            <div className="text-text-muted text-sm">Under Review</div>
                        </div>
                        <div
                            onClick={() => setFilter('approved')}
                            className={`bg-bg-card border-2 rounded-lg p-4 cursor-pointer transition-all ${filter === 'approved' ? 'border-green-500' : 'border-border-primary hover:border-text-muted'
                                }`}
                        >
                            <div className="text-3xl font-bold text-green-400">{stats.approved}</div>
                            <div className="text-text-muted text-sm">Approved</div>
                        </div>
                        <div
                            onClick={() => setFilter('rejected')}
                            className={`bg-bg-card border-2 rounded-lg p-4 cursor-pointer transition-all ${filter === 'rejected' ? 'border-red-500' : 'border-border-primary hover:border-text-muted'
                                }`}
                        >
                            <div className="text-3xl font-bold text-red-400">{stats.rejected}</div>
                            <div className="text-text-muted text-sm">Rejected</div>
                        </div>
                        <div
                            onClick={() => setFilter('all')}
                            className={`bg-bg-card border-2 rounded-lg p-4 cursor-pointer transition-all ${filter === 'all' ? 'border-text-primary' : 'border-border-primary hover:border-text-muted'
                                }`}
                        >
                            <div className="text-3xl font-bold text-text-primary">{stats.total}</div>
                            <div className="text-text-muted text-sm">Total</div>
                        </div>
                    </div>
                )}

                {/* Verification List */}
                <div className="bg-bg-card border-2 border-border-primary rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="spinner h-10 w-10"></div>
                        </div>
                    ) : verifications.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-2">📋</div>
                            <p className="text-text-muted">No verification requests found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-bg-secondary">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Applicant</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Institution</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Position</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Submitted</th>
                                        <th className="text-right px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-primary">
                                    {verifications.map((v) => (
                                        <tr key={v._id} className="hover:bg-bg-hover transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-text-muted">
                                                        {v.profilePhoto ? (
                                                            <img
                                                                src={`${BACKEND_URL}${v.profilePhoto}`}
                                                                alt=""
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <span>👤</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-text-primary">{v.fullName}</div>
                                                        <div className="text-sm text-text-muted">{v.user?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-text-secondary">{v.institution}</td>
                                            <td className="px-6 py-4 text-text-secondary">{v.position || '-'}</td>
                                            <td className="px-6 py-4">{getStatusBadge(v.status)}</td>
                                            <td className="px-6 py-4 text-text-muted text-sm">{formatDate(v.submittedAt)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleViewDetails(v._id)}
                                                    className="text-accent-primary hover:text-accent-hover font-medium"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {showModal && selectedVerification && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-bg-card border-2 border-border-primary rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-bg-card border-b border-border-primary px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-text-primary">Verification Details</h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedVerification(null);
                                    setRejectReason('');
                                }}
                                className="text-text-muted hover:text-text-primary text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Profile Section */}
                            <div className="flex items-start gap-6">
                                {selectedVerification.profilePhoto && (
                                    <img
                                        src={`${BACKEND_URL}${selectedVerification.profilePhoto}`}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-lg object-cover border-2 border-border-primary"
                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-text-primary">{selectedVerification.fullName}</h3>
                                    <p className="text-text-muted">{selectedVerification.user?.email}</p>
                                    <div className="mt-2">
                                        {getStatusBadge(selectedVerification.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Academic Info */}
                            <div className="bg-bg-secondary rounded-lg p-4">
                                <h4 className="font-semibold text-text-primary mb-3">Academic Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-text-muted">Institution:</span>
                                        <p className="text-text-primary font-medium">{selectedVerification.institution}</p>
                                    </div>
                                    <div>
                                        <span className="text-text-muted">Department:</span>
                                        <p className="text-text-primary font-medium">{selectedVerification.department || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-text-muted">Position:</span>
                                        <p className="text-text-primary font-medium">{selectedVerification.position || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-text-muted">ORCID:</span>
                                        <p className="text-text-primary font-medium">{selectedVerification.orcidId || '-'}</p>
                                    </div>
                                </div>
                                {selectedVerification.researchAreas?.length > 0 && (
                                    <div className="mt-4">
                                        <span className="text-text-muted text-sm">Research Areas:</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedVerification.researchAreas.map((area, i) => (
                                                <span key={i} className="px-3 py-1 bg-bg-primary border border-border-primary rounded-full text-sm">
                                                    {area}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ID Verification */}
                            <div className="bg-bg-secondary rounded-lg p-4">
                                <h4 className="font-semibold text-text-primary mb-3">Identity Verification</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                    <div>
                                        <span className="text-text-muted">ID Type:</span>
                                        <p className="text-text-primary font-medium">{selectedVerification.idType}</p>
                                    </div>
                                    <div>
                                        <span className="text-text-muted">ID Number:</span>
                                        <p className="text-text-primary font-medium">{selectedVerification.idNumber}</p>
                                    </div>
                                </div>
                                {selectedVerification.idDocument && (
                                    <div>
                                        <span className="text-text-muted text-sm">ID Document:</span>
                                        <a
                                            href={`${BACKEND_URL}${selectedVerification.idDocument}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block mt-2 text-accent-primary hover:text-accent-hover"
                                        >
                                            📄 View Document →
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Academic Links */}
                            {(selectedVerification.googleScholarId || selectedVerification.linkedInProfile || selectedVerification.personalWebsite) && (
                                <div className="bg-bg-secondary rounded-lg p-4">
                                    <h4 className="font-semibold text-text-primary mb-3">Academic Links</h4>
                                    <div className="space-y-2 text-sm">
                                        {selectedVerification.googleScholarId && (
                                            <div>
                                                <span className="text-text-muted">Google Scholar:</span>
                                                <span className="ml-2 text-text-primary">{selectedVerification.googleScholarId}</span>
                                            </div>
                                        )}
                                        {selectedVerification.linkedInProfile && (
                                            <div>
                                                <span className="text-text-muted">LinkedIn:</span>
                                                <a href={selectedVerification.linkedInProfile} target="_blank" rel="noopener noreferrer" className="ml-2 text-accent-primary">
                                                    {selectedVerification.linkedInProfile}
                                                </a>
                                            </div>
                                        )}
                                        {selectedVerification.personalWebsite && (
                                            <div>
                                                <span className="text-text-muted">Website:</span>
                                                <a href={selectedVerification.personalWebsite} target="_blank" rel="noopener noreferrer" className="ml-2 text-accent-primary">
                                                    {selectedVerification.personalWebsite}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason Input */}
                            {selectedVerification.status !== 'approved' && selectedVerification.status !== 'rejected' && (
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Rejection Reason (if rejecting)
                                    </label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        className="input-field w-full h-24 resize-none"
                                        placeholder="Provide a reason for rejection..."
                                    />
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-bg-card border-t border-border-primary px-6 py-4 flex justify-end gap-3">
                            {selectedVerification.status === 'pending' && (
                                <button
                                    onClick={() => handleMarkUnderReview(selectedVerification._id)}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    Mark Under Review
                                </button>
                            )}
                            {(selectedVerification.status === 'pending' || selectedVerification.status === 'under_review') && (
                                <>
                                    <button
                                        onClick={() => handleReject(selectedVerification._id)}
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedVerification._id)}
                                        disabled={actionLoading}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading ? 'Processing...' : 'Approve'}
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedVerification(null);
                                    setRejectReason('');
                                }}
                                className="px-4 py-2 border border-border-primary text-text-muted hover:text-text-primary rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVerificationPanel;
