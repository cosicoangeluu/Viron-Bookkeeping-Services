import { useEffect, useState } from "react";
import "./ClientPersonalInfo.css"; // Import CSS file

const API_URL = "https://bookkeeping-backend-pewk.onrender.com/api";

const ClientPersonalInfoView = ({ clientInfo }) => {
  const defaultFormData = {
    full_name: "",
    tin: "",
    birth_date: "",
    birth_place: "",
    citizenship: "",
    civil_status: "",
    gender: "",
    address: "",
    phone: "",
    spouse_name: "",
    spouse_tin: "",
    employment_status: "employed",
    philhealth_number: "",
    sss_number: "",
    pagibig_number: "",
    dependents: []
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '', visible: false });

  useEffect(() => {
    if (clientInfo.id) {
      fetchPersonalInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientInfo.id]);

  const fetchPersonalInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/personal-info/${clientInfo.id}`);
      const data = await response.json();
      console.log("Fetched data from backend:", data);

      // Create a clean object with only the fields that have values from the database
      const cleanData = {};
      Object.keys(defaultFormData).forEach(key => {
        if (key === 'dependents') {
          cleanData[key] = data[key] || [];
        } else {
          // Use the fetched value if it exists and is not null, otherwise use empty string
          const value = (data[key] !== null && data[key] !== undefined) ? data[key] : "";
          cleanData[key] = value;
          console.log(`  ${key}: "${value}"`);
        }
      });

      console.log("Setting formData to:", cleanData);
      setFormData(cleanData);
    } catch (error) {
      console.error("Error fetching personal info:", error);
      setFormData(defaultFormData);
    } finally {
      setLoading(false);
    }
  };

  // Define dynamic fields
  const fields = [
    { key: "full_name", label: "Full Name", type: "text" },
    { key: "tin", label: "Taxpayer Identification Number (TIN)", type: "text" },
    { key: "birth_date", label: "Birth Date", type: "date" },
    { key: "birth_place", label: "Place of Birth", type: "text" },
    { key: "citizenship", label: "Citizenship", type: "text" },
    {
      key: "civil_status",
      label: "Civil Status",
      type: "select",
      options: ["Single", "Married", "Widowed", "Legally Separated"],
    },
    {
      key: "gender",
      label: "Gender",
      type: "select",
      options: ["Male", "Female"],
    },
    { key: "address", label: "Registered Address", type: "text" },
    { key: "phone", label: "Phone Number", type: "tel" },
    { key: "spouse_name", label: "Spouse’s Name (if applicable)", type: "text" },
    { key: "spouse_tin", label: "Spouse’s TIN (if applicable)", type: "text" },
    {
      key: "employment_status",
      label: "Employment Status",
      type: "select",
      options: ["employed", "self-employed"],
    },
    { key: "philhealth_number", label: "PhilHealth Number", type: "text" },
    { key: "sss_number", label: "SSS Number", type: "text" },
    { key: "pagibig_number", label: "Pag-IBIG Number", type: "text" },
  ];

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDependentChange = (index, field, value) => {
    const updatedDependents = [...(formData.dependents || [])];
    const keyMap = {
      depName: "dep_name",
      depBirthDate: "dep_birth_date",
      depRelationship: "dep_relationship"
    };
    const dbField = keyMap[field] || field;
    updatedDependents[index] = { ...updatedDependents[index], [dbField]: value };
    setFormData((prev) => ({ ...prev, dependents: updatedDependents }));
  };

  const addDependent = () => {
    setFormData((prev) => ({
      ...prev,
      dependents: [...(prev.dependents || []), { dep_name: "", dep_birth_date: "", dep_relationship: "" }],
    }));
  };

  const removeDependent = (index) => {
    const updatedDependents = [...(formData.dependents || [])];
    updatedDependents.splice(index, 1);
    setFormData((prev) => ({ ...prev, dependents: updatedDependents }));
  };

  const showNotification = (type, message) => {
    setNotification({ type, message, visible: true });
    setTimeout(() => {
      setNotification({ type: '', message: '', visible: false });
    }, 3000);
  };

  const handleSave = async () => {
    console.log("💾 Saving formData:", formData);
    try {
      const response = await fetch(`${API_URL}/personal-info/${clientInfo.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const result = await response.json();
        console.log("Save successful:", result);
        setIsEditing(false);
        showNotification('success', 'Personal info saved successfully!');
        // Refetch data to ensure consistency
        await fetchPersonalInfo();
      } else {
        const error = await response.json();
        console.error("Save failed:", error);
        showNotification('error', 'Failed to save personal info');
      }
    } catch (error) {
      console.error('Error saving personal info:', error);
      showNotification('error', 'Error saving personal info');
    }
  };

  const handleEdit = () => {
    console.log("✏️ Entering edit mode. Current formData:", formData);
    setIsEditing(true);
  };

  return (
    <div className="client-card">
      {notification.visible && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      <div className="client-header">
        <h2>Personal Information</h2>
        {loading && <p>Loading...</p>}
        {!isEditing ? (
          <button className="btn btn-edit" onClick={handleEdit}>
            Edit
          </button>
        ) : (
          <button className="btn btn-save" onClick={handleSave}>
            Save
          </button>
        )}
      </div>

      <div className="client-grid">
        {fields.map(({ key, label, type, options }) => (
          <div key={key} className="client-field">
            <label className="client-label">{label}</label>
            {isEditing ? (
              type === "select" ? (
                <select
                  value={formData[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="client-input"
                >
                  <option value="">Select...</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  value={formData[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="client-input"
                />
              )
            ) : (
              <p className="client-value">{key === "birth_date" && formData[key] ? new Date(formData[key]).toLocaleDateString() : formData[key] || "—"}</p>
            )}
          </div>
        ))}
      </div>

      {/* Dependents Section */}
      <div className="dependents-section">
        <h3>Dependents</h3>
        {isEditing && (
          <button className="btn btn-add" onClick={addDependent}>
            + Add Dependent
          </button>
        )}
        <div className="dependents-list">
          {(formData.dependents || []).length === 0 && !isEditing ? (
            <p className="client-value">—</p>
          ) : (
            (formData.dependents || []).map((dep, index) => (
              <div key={index} className="dependent-item">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={dep.dep_name || ""}
                      onChange={(e) => handleDependentChange(index, "depName", e.target.value)}
                      className="client-input"
                    />
                    <input
                      type="date"
                      value={dep.dep_birth_date || ""}
                      onChange={(e) => handleDependentChange(index, "depBirthDate", e.target.value)}
                      className="client-input"
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={dep.dep_relationship || ""}
                      onChange={(e) => handleDependentChange(index, "depRelationship", e.target.value)}
                      className="client-input"
                    />
                    <button className="btn btn-remove" onClick={() => removeDependent(index)}>
                      Remove
                    </button>
                  </>
                ) : (
                  <p className="client-value">
                    {dep.dep_name || "—"} — {dep.dep_birth_date ? new Date(dep.dep_birth_date).toLocaleDateString() : "—"} ({dep.dep_relationship || "—"})
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPersonalInfoView;
