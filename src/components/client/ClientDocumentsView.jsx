import { ChevronDown, ChevronRight, Download, Eye, Paperclip, X } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = "https://bookkeeping-backend-pewk.onrender.com/api";

const ClientDocumentsView = ({ clientInfo }) => {
  const clientId = clientInfo?.id;
  const [documents, setDocuments] = useState({});
  const [expandedForm, setExpandedForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);

  useEffect(() => {
    if (clientId) {
      fetchDocuments();
    }
  }, [clientId]);

  const fetchDocuments = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/documents/${clientId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setDocuments(data || {});
    } catch (error) {
      console.error("Error fetching documents:", error);
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/3)`);
        setTimeout(() => fetchDocuments(retryCount + 1), delay);
        return;
      }
      setError("Failed to load documents after multiple attempts. Please try again later.");
      setDocuments({});
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = (formName) => {
    setExpandedForm(expandedForm === formName ? null : formName);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          Loading your documents...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          {error}
          <button
            className="retry-btn"
            onClick={fetchDocuments}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">My BIR Documents</h2>

      <div className="uploaded-section">
        {documents && Object.keys(documents).length > 0 ? (
          Object.entries(documents).map(([formName, files]) => {
            const isExpanded = expandedForm === formName;

            return (
              <div key={formName} className="form-section">
                <div className="form-header" onClick={() => toggleForm(formName)}>
                  {isExpanded ? (
                    <ChevronDown size={16} className="icon" />
                  ) : (
                    <ChevronRight size={16} className="icon" />
                  )}
                  <h3 className="form-title">{formName}</h3>
                  <span className="file-count">
                    {Array.isArray(files) ? files.length : 0} {Array.isArray(files) && files.length === 1 ? "file" : "files"}
                  </span>
                </div>

                {isExpanded && (
                  <div className="form-files">
                    {Array.isArray(files) && files.length > 0 ? (
                      files.map((file) => (
                        <div key={file.id} className="uploaded-item">
                          <Paperclip size={14} />
                          <span>
                            {file.fileName} ({file.quarter}, {file.year})
                          </span>
                          <div style={{ marginLeft: "auto", display: "flex", gap: "0.4rem" }}>
                            <button
                              className="view-btn"
                              title="View file"
                              onClick={() => setViewingDocument(file)}
                            >
                              <Eye size={14} />
                            </button>
                            <a
                              href={`${API_URL}/download/${file.id}`}
                              className="download-btn"
                              title="Download file"
                              download={file.fileName}
                            >
                              <Download size={14} />
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-file-msg">No files available yet.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <p className="no-file-msg">No documents available yet.</p>
            <p className="empty-state-hint">
              Your bookkeeper will upload your BIR documents here.
            </p>
          </div>
        )}
      </div>

      {viewingDocument && (
        <div className="modal-overlay" onClick={() => setViewingDocument(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewingDocument.fileName}</h3>
              <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
                <a
                  href={`${API_URL}/download/${viewingDocument.id}`}
                  className="download-btn"
                  title="Download file"
                  download={viewingDocument.fileName}
                  style={{ textDecoration: "none", padding: "0.5rem" }}
                >
                  <Download size={16} />
                </a>
                <button
                  className="close-btn"
                  onClick={() => setViewingDocument(null)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="modal-body">
              <iframe
                src={`${API_URL}/download/${viewingDocument.id}?inline=true`}
                width="100%"
                height="600px"
                style={{ border: 'none', borderRadius: '0.5rem' }}
                title={`View ${viewingDocument.fileName}`}
                onError={(e) => {
                  console.error('Error loading document:', e);
                }}
              />
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#f3f4f6',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <strong>Note:</strong> If the document doesn't display above, click the download button to save it to your device.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDocumentsView;
