import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../config/api';

const AdminApproval = () => {
  const { user } = useAuth();
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPendingDocuments();
    }
  }, [user]);

  const fetchPendingDocuments = async () => {
    try {
      const response = await axios.get('/api/documents/pending');
      setPendingDocuments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pending documents:', error);
      toast.error('Failed to load pending documents');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (documentId) => {
    try {
      await axios.post(`/api/documents/${documentId}/approve`);
      toast.success('Document approved and published!');
      fetchPendingDocuments();
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error('Failed to approve document');
    }
  };

  const handleReject = async () => {
    if (!selectedDoc) return;

    try {
      await axios.post(`/api/documents/${selectedDoc._id}/reject`, {
        reason: rejectReason,
      });
      toast.success('Document rejected');
      setShowRejectModal(false);
      setSelectedDoc(null);
      setRejectReason('');
      fetchPendingDocuments();
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject document');
    }
  };

  const openRejectModal = (doc) => {
    setSelectedDoc(doc);
    setShowRejectModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Document Approval</h1>
          <p className="text-gray-600">Review and approve pending document submissions</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : pendingDocuments.length > 0 ? (
          <div className="space-y-6">
            {pendingDocuments.map((doc, index) => (
              <div
                key={doc._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full animate-pulse">
                          Pending Approval
                        </span>
                        {doc.category && (
                          <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            {doc.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{doc.title}</h3>
                      {doc.author && (
                        <p className="text-gray-600 mb-2">
                          <span className="font-semibold">Author:</span> {doc.author}
                        </p>
                      )}
                      {doc.description && (
                        <p className="text-gray-500 line-clamp-2 mb-3">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>
                          <span className="font-semibold">Uploaded by:</span>{' '}
                          {doc.uploadedBy?.name || 'Unknown'}
                        </span>
                        <span>•</span>
                        <span>{formatDate(doc.createdAt)}</span>
                      </div>
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {doc.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleApprove(doc._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      ✓ Approve & Publish
                    </button>
                    <button
                      onClick={() => openRejectModal(doc)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      ✗ Reject
                    </button>
                    <a
                      href={`${BACKEND_URL}${doc.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      View PDF
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center animate-fade-in">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600 text-lg">No pending documents to review.</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-all animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Document</h3>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Title:</span> {selectedDoc?.title}
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason (Optional)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="Provide a reason for rejection..."
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold transition-all duration-200"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedDoc(null);
                  setRejectReason('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-semibold transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApproval;

