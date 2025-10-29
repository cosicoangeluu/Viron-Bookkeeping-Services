import {
  ArrowLeft,
  Download,
  Paperclip,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import "./BookkeeperDocumentsView.css";

const API_URL = "https://bookkeeping-backend-pewk.onrender.com/api";

const BookkeeperDocumentView = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [allClientDocuments, setAllClientDocuments] = useState({});
  const [quarter, setQuarter] = useState("");
  const [year, setYear] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [birForms, setBirForms] = useState([]);
  const [showAddFormModal, setShowAddFormModal] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
    fetchBirForms();
    fetchAllClientDocuments();
  }, []);

  // Fetch documents when client or form changes
  useEffect(() => {
    if (selectedClient && selectedForm) {
      fetchDocuments();
    } else {
      setUploadedFiles([]);
    }
  }, [selectedClient, selectedForm]);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/clients`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      alert("Failed to load clients. Please check if the server is running.");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchBirForms = async () => {
    try {
      const response = await fetch(`${API_URL}/bir-forms`);
      const data = await response.json();
      setBirForms(data.map((form) => form.form_name));
    } catch (error) {
      console.error("Error fetching BIR forms:", error);
    }
  };

  const fetchAllClientDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/documents`);
      const data = await response.json();
      setAllClientDocuments(data);
    } catch (error) {
      console.error("Error fetching all client documents:", error);
    }
  };

  const fetchDocuments = async () => {
    if (!selectedClient || !selectedForm) {
      setUploadedFiles([]);
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/documents/${selectedClient}/${selectedForm}`
      );
      const data = await response.json();
      setUploadedFiles(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setUploadedFiles([]);
    }
  };

  const handleUpload = async (files) => {
    if (!selectedForm || !quarter || !year) {
      alert("Please select a form, quarter, and year before uploading.");
      return;
    }

    if (!files || files.length === 0) {
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
    
    formData.append("client_id", selectedClient);
    formData.append("form_name", selectedForm);
    formData.append("quarter", quarter);
    formData.append("year", year);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      await fetchDocuments();
      await fetchAllClientDocuments();
      alert("Files uploaded successfully!");

      // Reset form
      document.getElementById("file-input").value = "";
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      await fetchDocuments();
      await fetchAllClientDocuments();
      alert("Document deleted successfully!");
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document: " + error.message);
    }
  };

  const handleAddForm = async () => {
    if (!newFormName.trim()) {
      alert("Please enter a form name");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bir-forms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ form_name: newFormName.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add form");
      }

      await fetchBirForms();
      setNewFormName("");
      setShowAddFormModal(false);
      alert("Form added successfully!");
    } catch (error) {
      console.error("Error adding form:", error);
      alert(error.message);
    }
  };

  const selectedClientName = clients.find((c) => c.id === selectedClient)?.name;

  if (initialLoading) {
    return (
      <div className="page-container">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          Loading clients and documents...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {!selectedClient ? (
        <div>
          <h2 className="page-title">Client List</h2>
          {clients.length > 0 ? (
            <ul className="client-list-plain">
              {clients.map((client) => (
                <li
                  key={client.id}
                  className="client-row"
                  onClick={() => setSelectedClient(client.id)}
                >
                  <div>{client.name}</div>
                  {client.email && (
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      {client.email}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              background: 'white',
              borderRadius: '0.5rem',
              color: '#6b7280'
            }}>
              No clients found. Please check your database.
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="page-header">
            <button className="back-btn" onClick={() => {
              setSelectedClient(null);
              setSelectedForm("");
              setQuarter("");
              setYear("");
              setUploadedFiles([]);
            }}>
              <ArrowLeft size={18} /> Back
            </button>
            <h2>{selectedClientName}</h2>
          </div>

          <div className="selection-row">
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
            >
              <option value="">Select BIR Form</option>
              {birForms.map((form) => (
                <option key={form} value={form}>
                  {form}
                </option>
              ))}
            </select>

            <button
              className="add-form-btn"
              onClick={() => setShowAddFormModal(true)}
            >
              <Plus size={14} /> Add Form
            </button>

            <select value={quarter} onChange={(e) => setQuarter(e.target.value)}>
              <option value="">Quarter</option>
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>

            <input
              type="number"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="2000"
              max="2100"
            />
          </div>

          <div className="action-row">
            <label className="upload-btn">
              <Upload size={16} /> {loading ? "Uploading..." : "Upload"}
              <input
                id="file-input"
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={(e) => handleUpload(e.target.files)}
                disabled={loading}
              />
            </label>
          </div>

          <div className="uploaded-section">
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#1f2937'
            }}>
              Uploaded Documents
              {selectedForm && ` - ${selectedForm}`}
            </h3>

            {uploadedFiles.length > 0 ? (
              uploadedFiles.map((file) => (
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
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(file.id)}
                      title="Delete file"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-file-msg">
                {selectedForm
                  ? "No files uploaded yet for this form."
                  : "Please select a BIR form to view documents."}
              </p>
            )}
          </div>

          {/* All Documents for Selected Client */}
          {selectedClient && Object.keys(allClientDocuments).length > 0 && (
            <div className="uploaded-section" style={{ marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                All Documents for {selectedClientName}
              </h3>

              {Object.entries(allClientDocuments[selectedClientName] || {}).map(([formName, files]) => (
                <div key={formName} style={{ marginBottom: '1rem' }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    color: '#374151'
                  }}>
                    {formName}
                  </h4>
                  {files.length > 0 ? (
                    files.map((file) => (
                      <div key={file.id} className="uploaded-item" style={{ marginLeft: '1rem' }}>
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
                    <p className="no-file-msg" style={{ marginLeft: '1rem' }}>No files available.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Form Modal */}
      {showAddFormModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New BIR Form</h3>
            <input
              type="text"
              placeholder="Enter form name (e.g., BIR Form 1234)"
              value={newFormName}
              onChange={(e) => setNewFormName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddForm();
                }
              }}
              autoFocus
            />
            <div className="modal-actions">
              <button className="modal-add-btn" onClick={handleAddForm}>
                Add
              </button>
              <button
                className="modal-cancel-btn"
                onClick={() => {
                  setShowAddFormModal(false);
                  setNewFormName("");
                }}
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookkeeperDocumentView;