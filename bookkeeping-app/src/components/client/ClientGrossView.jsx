import { useEffect, useRef, useState } from "react";
import "./ClientGrossView.css";

const API_URL = "http://localhost:5000/api";

const ClientGrossView = ({ clientInfo }) => {
  const formSelectRef = useRef(null);
  const customFormRef = useRef(null);
  const monthRef = useRef(null);
  const grossRef = useRef(null);
  const taxRef = useRef(null);
  const [history, setHistory] = useState([]);

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
        alert("Record saved successfully!");
      } else {
        alert("Failed to save record");
      }
    } catch (error) {
      console.error("Error saving gross record:", error);
      alert("Error saving record");
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Gross Income & Tax Computation
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Form */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Select BIR Form
          </label>
          <select
            ref={formSelectRef}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-yellow-300"
          >
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
          <label className="block text-gray-700 font-medium mb-1">
            Or Add New Form
          </label>
          <input
            ref={customFormRef}
            type="text"
            placeholder="Enter form name"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-yellow-300"
          />
        </div>

        {/* Month Covered */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Month Covered
          </label>
          <input
            ref={monthRef}
            type="month"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-yellow-300"
          />
        </div>

        {/* Gross Income */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Gross Income (₱)
          </label>
          <input
            ref={grossRef}
            type="number"
            placeholder="Enter gross income"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-yellow-300"
            onBlur={computeTax}
          />
        </div>

        {/* Computed Tax */}
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <p className="text-gray-700">Computed Tax:</p>
          <h3
            ref={taxRef}
            className="text-2xl font-bold text-yellow-700 mt-1"
          >
            ₱0.00
          </h3>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
        >
          Submit
        </button>
      </form>

      {/* History Table */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Submission History
        </h3>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Form</th>
              <th className="border p-2">Month</th>
              <th className="border p-2">Gross Income</th>
              <th className="border p-2">Tax</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record, index) => (
              <tr key={index}>
                <td className="border p-2">{record.form_name}</td>
                <td className="border p-2">{record.month}</td>
                <td className="border p-2">₱{record.gross_income.toLocaleString()}</td>
                <td className="border p-2 text-yellow-700 font-semibold">₱{record.computed_tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientGrossView;
