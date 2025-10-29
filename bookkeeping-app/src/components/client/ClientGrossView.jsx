import { useEffect, useRef, useState } from "react";
import "./ClientGrossView.css";

const API_URL = "https://bookkeeping-backend-pewk.onrender.com/api";

const ClientGrossView = ({ clientInfo }) => {
  const formSelectRef = useRef(null);
  const customFormRef = useRef(null);
  const monthRef = useRef(null);
  const grossRef = useRef(null);
  const taxRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Default BIR Forms with tax rates
  const BIR_FORMS = [
    { name: "Form 2551Q (Percentage Tax)", rate: 0.03 },
    { name: "Form 1701Q (Income Tax)", rate: 0.08 },
    { name: "Form 2550M (VAT Monthly)", rate: 0.12 },
  ];

  useEffect(() => {
    if (clientInfo.id) {
      fetchGrossRecords();
    }
  }, [clientInfo.id]);

  const fetchGrossRecords = async () => {
    try {
      const response = await fetch(`${API_URL}/gross-records/${clientInfo.id}`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Error fetching gross records:", error);
    }
  };



  // Compute Tax
  const computeTax = () => {
    const selectedFormName = formSelectRef.current.value;
  
    const grossIncome = parseFloat(grossRef.current.value) || 0;

    const selected = BIR_FORMS.find((f) => f.name === selectedFormName);
    const rate = selected ? selected.rate : 0;
    const computedTax = grossIncome * rate;

    taxRef.current.textContent = `₱${computedTax.toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`;

    return computedTax;
  };

  // Add record to history
  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedForm = formSelectRef.current.value;
    const customForm = customFormRef.current.value;
    const month = monthRef.current.value;
    const gross = parseFloat(grossRef.current.value) || 0;
    const computedTax = computeTax();

    const formName = selectedForm || customForm;

    if (!formName || !month || !gross) {
      alert("Please complete all fields before submitting.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/gross-records/${clientInfo.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_name: formName, month, gross_income: gross, computed_tax: computedTax })
      });

      if (response.ok) {
        // Refresh history
        fetchGrossRecords();

        // Clear inputs
        formSelectRef.current.value = "";
        customFormRef.current.value = "";
        monthRef.current.value = "";
        grossRef.current.value = "";
        taxRef.current.textContent = "₱0.00";

        // Show success modal
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
      } else {
        alert("Failed to save record");
      }
    } catch (error) {
      console.error("Error saving gross record:", error);
      alert("Error saving record");
    }
  };

  return (
    <div className="client-gross-container">
      <h2>Gross Income & Tax Computation</h2>

      <div className="form-section">
        <form onSubmit={handleSubmit}>
          {/* Select Form */}
          <div>
            <label>Select BIR Form</label>
            <select ref={formSelectRef}>
              <option value="">-- Select a BIR Form --</option>
              {BIR_FORMS.map((form) => (
                <option key={form.name} value={form.name}>
                  {form.name} ({form.rate * 100}%)
                </option>
              ))}
            </select>
          </div>

          {/* Custom Form */}
          <div>
            <label>Or Add New Form</label>
            <input
              ref={customFormRef}
              type="text"
              placeholder="Enter form name"
            />
          </div>

          {/* Month Covered */}
          <div>
            <label>Month Covered</label>
            <input ref={monthRef} type="month" />
          </div>

          {/* Gross Income */}
          <div>
            <label>Gross Income (₱)</label>
            <input
              ref={grossRef}
              type="number"
              placeholder="Enter gross income"
              onBlur={computeTax}
            />
          </div>

          {/* Computed Tax */}
          <div className="tax-box">
            <p>Computed Tax:</p>
            <h3 ref={taxRef}>₱0.00</h3>
          </div>

          {/* Submit */}
          <button type="submit">Submit</button>
        </form>
      </div>

      {/* History Table */}
      <div className="history-section">
        <h3>Submission History</h3>
        <table>
          <thead>
            <tr>
              <th>Form</th>
              <th>Month</th>
              <th>Gross Income</th>
              <th>Tax</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record, index) => (
              <tr key={index}>
                <td>{record.form_name}</td>
                <td>{record.month}</td>
                <td>₱{record.gross_income.toLocaleString()}</td>
                <td>₱{record.computed_tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-modal-body">
              <CheckCircle className="success-icon" size={60} />
              <h3>Record Saved Successfully!</h3>
              <p>Your gross income record has been added to the history.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientGrossView;
