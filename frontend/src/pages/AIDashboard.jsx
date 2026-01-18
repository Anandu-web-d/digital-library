import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AIDashboard = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState('');
    const [documents, setDocuments] = useState([]);
    const [citationStyle, setCitationStyle] = useState('APA');
    const [generatedCitation, setGeneratedCitation] = useState('');
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [recsRes, docsRes] = await Promise.all([
                axios.get('/api/documents/recommendations').catch(() => ({ data: { data: [] } })),
                axios.get('/api/documents?limit=10').catch(() => ({ data: { data: [] } })),
            ]);
            setRecommendations(recsRes.data.data?.slice(0, 3) || []);
            setDocuments(docsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSemanticSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/articles?search=${encodeURIComponent(searchQuery)}&mode=semantic`;
        }
    };

    const handleSummarize = async () => {
        if (!selectedDocument) {
            toast.error('Please select a document first');
            return;
        }
        setSummaryLoading(true);
        setSummary('');
        try {
            // Simulating API call - replace with actual endpoint
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSummary('This document discusses advanced techniques in machine learning, focusing on neural network architectures and their applications in natural language processing. The authors present a novel approach to attention mechanisms that improves model performance by 15% on standard benchmarks.');
            toast.success('Summary generated!');
        } catch (error) {
            toast.error('Failed to generate summary');
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleGenerateCitation = () => {
        if (!selectedDocument) {
            toast.error('Please select a document first');
            return;
        }
        const doc = documents.find(d => d._id === selectedDocument);
        if (!doc) return;

        const year = doc.metadata?.publicationDate
            ? new Date(doc.metadata.publicationDate).getFullYear()
            : new Date().getFullYear();

        let citation = '';
        switch (citationStyle) {
            case 'APA':
                citation = `${doc.author || 'Unknown Author'} (${year}). ${doc.title}. ${doc.metadata?.publisher || 'IntelliLib Repository'}.`;
                break;
            case 'MLA':
                citation = `${doc.author || 'Unknown Author'}. "${doc.title}." ${doc.metadata?.publisher || 'IntelliLib Repository'}, ${year}.`;
                break;
            case 'Chicago':
                citation = `${doc.author || 'Unknown Author'}. ${doc.title}. ${doc.metadata?.publisher || 'IntelliLib Repository'}, ${year}.`;
                break;
            default:
                citation = `${doc.author} - ${doc.title} (${year})`;
        }
        setGeneratedCitation(citation);
        toast.success('Citation generated!');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-10 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-accent-primary text-bg-primary flex items-center justify-center font-bold text-xl">
                            AI
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">AI Features Hub</h1>
                            <p className="text-text-muted">Your central command center for all AI-powered tools</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="spinner h-12 w-12"></div>
                    </div>
                ) : (
                    <>
                        {/* Feature Cards Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                            {/* Semantic Search Card */}
                            <div className="ai-feature-card animate-slide-up stagger-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="ai-badge">AI Powered</span>
                                    <h3 className="text-xl font-bold">Semantic Search</h3>
                                </div>
                                <p className="text-text-muted text-sm mb-4">
                                    Search by meaning, not just keywords. Our AI understands research context using vector embeddings.
                                </p>
                                <form onSubmit={handleSemanticSearch}>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="e.g., machine learning in healthcare..."
                                            className="input-field flex-1"
                                        />
                                        <button type="submit" className="btn-primary">
                                            Search
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* AI Chat Card */}
                            <Link to="/ai-chat" className="ai-feature-card animate-slide-up stagger-2 group block">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="ai-badge">Interactive</span>
                                    <h3 className="text-xl font-bold group-hover:text-accent-primary transition-colors">AI Research Assistant</h3>
                                </div>
                                <p className="text-text-muted text-sm mb-4">
                                    Chat with our AI to get answers to your research questions, explanations, and recommendations.
                                </p>
                                <div className="bg-bg-tertiary border border-border-secondary rounded-lg p-4 mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent-primary text-bg-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            AI
                                        </div>
                                        <div>
                                            <p className="text-sm text-text-secondary">
                                                "How can I help with your research today?"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-accent-primary font-semibold text-sm">
                                    Start Chatting →
                                </span>
                            </Link>

                            {/* Document Summarizer Card */}
                            <div className="ai-feature-card animate-slide-up stagger-3">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="ai-badge">AI Powered</span>
                                    <h3 className="text-xl font-bold">Document Summarizer</h3>
                                </div>
                                <p className="text-text-muted text-sm mb-4">
                                    Generate concise AI-powered summaries of academic papers in seconds.
                                </p>
                                <div className="space-y-4">
                                    <select
                                        value={selectedDocument}
                                        onChange={(e) => setSelectedDocument(e.target.value)}
                                        className="input-field w-full cursor-pointer"
                                    >
                                        <option value="">Select a document...</option>
                                        {documents.map((doc) => (
                                            <option key={doc._id} value={doc._id}>
                                                {doc.title}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleSummarize}
                                        disabled={!selectedDocument || summaryLoading}
                                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {summaryLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="spinner h-4 w-4"></div>
                                                Generating...
                                            </span>
                                        ) : (
                                            'Generate Summary'
                                        )}
                                    </button>
                                    {summary && (
                                        <div className="bg-bg-tertiary border border-border-secondary rounded-lg p-4 animate-fade-in">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-text-muted uppercase tracking-wide">AI Summary</span>
                                                <button
                                                    onClick={() => copyToClipboard(summary)}
                                                    className="text-xs text-accent-primary hover:underline"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                            <p className="text-sm text-text-secondary leading-relaxed">{summary}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Citation Generator Card */}
                            <div className="ai-feature-card animate-slide-up stagger-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="ai-badge">Tool</span>
                                    <h3 className="text-xl font-bold">Citation Generator</h3>
                                </div>
                                <p className="text-text-muted text-sm mb-4">
                                    Generate properly formatted citations in APA, MLA, or Chicago style.
                                </p>
                                <div className="space-y-4">
                                    <select
                                        value={selectedDocument}
                                        onChange={(e) => setSelectedDocument(e.target.value)}
                                        className="input-field w-full cursor-pointer"
                                    >
                                        <option value="">Select a document...</option>
                                        {documents.map((doc) => (
                                            <option key={doc._id} value={doc._id}>
                                                {doc.title}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        {['APA', 'MLA', 'Chicago'].map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => setCitationStyle(style)}
                                                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${citationStyle === style
                                                        ? 'bg-accent-primary text-bg-primary'
                                                        : 'bg-bg-tertiary text-text-muted hover:text-text-primary border border-border-secondary'
                                                    }`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleGenerateCitation}
                                        disabled={!selectedDocument}
                                        className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Generate Citation
                                    </button>
                                    {generatedCitation && (
                                        <div className="bg-bg-tertiary border border-border-secondary rounded-lg p-4 animate-fade-in">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-text-muted uppercase tracking-wide">{citationStyle} Format</span>
                                                <button
                                                    onClick={() => copyToClipboard(generatedCitation)}
                                                    className="text-xs text-accent-primary hover:underline"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                            <p className="text-sm text-text-secondary font-mono leading-relaxed">{generatedCitation}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recommendations Section */}
                        <div className="ai-feature-card animate-slide-up" style={{ animationDelay: '0.5s' }}>
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="ai-badge">Personalized</span>
                                    <h3 className="text-xl font-bold">Recommended For You</h3>
                                </div>
                                <Link to="/articles" className="text-text-muted hover:text-text-primary transition-colors text-sm font-medium">
                                    View All →
                                </Link>
                            </div>

                            {recommendations.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {recommendations.map((doc, index) => (
                                        <Link
                                            key={doc._id}
                                            to={`/documents/${doc._id}`}
                                            className="bg-bg-tertiary border border-border-secondary rounded-lg p-4 hover:border-accent-primary transition-all group"
                                        >
                                            <h4 className="font-bold text-text-primary group-hover:text-accent-primary transition-colors line-clamp-2 mb-2">
                                                {doc.title}
                                            </h4>
                                            {doc.author && (
                                                <p className="text-xs text-text-muted mb-2">By {doc.author}</p>
                                            )}
                                            {doc.category && (
                                                <span className="badge-outline text-xs">{doc.category}</span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-text-muted mb-2">No recommendations yet.</p>
                                    <p className="text-text-dim text-sm">Start exploring documents to get personalized suggestions.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AIDashboard;
