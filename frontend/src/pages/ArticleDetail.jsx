import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await axios.get(`/api/documents/articles/${id}`);
      setArticle(response.data.data);
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCitation = (article) => {
    const authors = article.author || 'Unknown Author';
    const year = article.metadata?.publicationDate
      ? new Date(article.metadata.publicationDate).getFullYear()
      : new Date(article.createdAt).getFullYear();
    const title = article.title;
    const publisher = article.metadata?.publisher || 'Digital Library';
    
    return `${authors} (${year}). ${title}. ${publisher}.`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg">Article not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/articles"
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Articles
          </Link>

          <div className="mb-4">
            {article.category && (
              <span className="inline-block px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-800 rounded-full">
                {article.category}
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>

          {article.author && (
            <div className="mb-4">
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Author:</span> {article.author}
              </p>
              {article.metadata?.publisher && (
                <p className="text-sm text-gray-600 mt-1">
                  Published by: {article.metadata.publisher}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            {article.metadata?.publicationDate && (
              <span>
                <span className="font-semibold">Published:</span>{' '}
                {formatDate(article.metadata.publicationDate)}
              </span>
            )}
            {article.metadata?.doi && (
              <span>
                <span className="font-semibold">DOI:</span> {article.metadata.doi}
              </span>
            )}
            {article.metadata?.isbn && (
              <span>
                <span className="font-semibold">ISBN:</span> {article.metadata.isbn}
              </span>
            )}
            <span>
              <span className="font-semibold">Views:</span> {article.viewCount || 0}
            </span>
            <span>
              <span className="font-semibold">Downloads:</span> {article.downloadCount || 0}
            </span>
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Abstract</h2>
          {article.description ? (
            <p className="text-gray-700 leading-relaxed">{article.description}</p>
          ) : article.summary ? (
            <p className="text-gray-700 leading-relaxed">{article.summary}</p>
          ) : (
            <p className="text-gray-500 italic">No abstract available.</p>
          )}
        </div>

        {article.fileUrl && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Text</h3>
            <a
              href={article.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Download PDF
            </a>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Citation</h3>
          <div className="bg-gray-50 rounded p-4 font-mono text-sm text-gray-700">
            {formatCitation(article)}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(formatCitation(article));
              toast.success('Citation copied to clipboard!');
            }}
            className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Copy Citation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;

