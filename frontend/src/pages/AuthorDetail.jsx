import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthorDetail = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthor();
  }, [id]);

  const fetchAuthor = async () => {
    try {
      const response = await axios.get(`/api/authors/${id}`);
      setAuthor(response.data.data);
    } catch (error) {
      console.error('Error fetching author:', error);
      toast.error('Failed to load author details');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg">Author not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-5xl font-bold text-blue-600">
                  {author.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{author.name}</h1>
              {author.affiliation && (
                <p className="text-lg text-gray-600 mb-4">{author.affiliation}</p>
              )}
              {author.bio && (
                <p className="text-gray-700 mb-4">{author.bio}</p>
              )}
              
              <div className="flex items-center gap-8 mb-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{author.citationCount || 0}</div>
                  <div className="text-sm text-gray-500">Total Citations</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{author.hIndex || 0}</div>
                  <div className="text-sm text-gray-500">h-index</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{author.publications?.length || 0}</div>
                  <div className="text-sm text-gray-500">Publications</div>
                </div>
              </div>

              {author.researchInterests?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Research Interests:</h3>
                  <div className="flex flex-wrap gap-2">
                    {author.researchInterests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 text-sm">
                {author.email && (
                  <a
                    href={`mailto:${author.email}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Email
                  </a>
                )}
                {author.website && (
                  <a
                    href={author.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Website
                  </a>
                )}
                {author.orcid && (
                  <a
                    href={`https://orcid.org/${author.orcid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    ORCID
                  </a>
                )}
                {author.googleScholarId && (
                  <a
                    href={`https://scholar.google.com/citations?user=${author.googleScholarId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Google Scholar
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Publications ({author.publications?.length || 0})
        </h2>

        {author.publications && author.publications.length > 0 ? (
          <div className="space-y-4">
            {author.publications.map((publication) => (
              <Link
                key={publication._id}
                to={`/articles/${publication._id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {publication.title}
                </h3>
                {publication.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {publication.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {publication.metadata?.publicationDate && (
                    <span>{formatDate(publication.metadata.publicationDate)}</span>
                  )}
                  {publication.category && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {publication.category}
                    </span>
                  )}
                  <span>{publication.viewCount || 0} views</span>
                  <span>{publication.downloadCount || 0} downloads</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No publications found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorDetail;

