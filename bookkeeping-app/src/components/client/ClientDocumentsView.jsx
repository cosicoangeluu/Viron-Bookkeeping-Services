import { ChevronDown, ChevronRight, Download, Paperclip } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = "https://bookkeeping-backend-pewk.onrender.com/api";

const ClientDocumentsView = ({ clientInfo }) => {
  const clientId = clientInfo?.id;
  const [documents, setDocuments] = useState({});
  const [expandedForm, setExpandedForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (clientId) {
      fetchDocuments();
    }
  }, [clientId]);

  const fetchDocuments = async () => {
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
      setError("Failed to load documents. Please try again later.");
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
                            <a
                              href={`https://bookkeeping-backend-pewk.onrender.com/api/download/${file.id}`}
                              className="download-btn"
                              title="Download file"
                              target="_blank"
                              rel="noopener noreferrer"
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
    </div>
  );
};

export default ClientDocumentsView;