import { useState } from "react";

function AddAccount() {
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("");
  const [balance, setBalance] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/add_account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({
          account_number: accountNumber,
          account_type: accountType,
          balance: balance,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Account created successfully!");
        setAccountNumber("");
        setAccountType("");
        setBalance("");
      } else {
        setMessage("Error: " + (data.error || "Could not create account"));
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Network error");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", padding: "30px", background: "#fff", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Add New Account</h2>

      {message && <p style={{ color: "green", textAlign: "center" }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="account_number">Account Number</label>
        <input
          type="text"
          id="account_number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        <label htmlFor="account_type">Account Type</label>
        <select
          id="account_type"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        >
          <option value="">-- Select --</option>
          <option value="Savings">Savings</option>
          <option value="Checking">Checking</option>
          <option value="Loan">Loan</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Fixed Deposit">Fixed Deposit</option>
        </select>

        <label htmlFor="balance">Initial Balance (₹)</label>
        <input
          type="number"
          step="0.01"
          id="balance"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
        />

        <button type="submit" style={{ width: "100%", padding: "12px", background: "#0077cc", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Create Account
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <a href="/Dashboard" style={{ color: "#0077cc" }}>← Back to Dashboard</a>
      </div>
    </div>
  );
}

export default AddAccount;