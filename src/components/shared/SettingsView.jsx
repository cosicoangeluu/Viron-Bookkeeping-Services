import React, { useState } from "react";

const SettingsView = () => {
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Settings</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg p-2 mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg p-2 mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default SettingsView;
