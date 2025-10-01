import React, { useEffect, useState } from "react";

function Deposit() {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  // Fetch accounts for logged-in user
  useEffect(() => {
    fetch("http://localhost:5000/api/accounts", {
      credentials: "include", // include session cookie
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.accounts) {
          setAccounts(data.accounts);
        } else {
          setMessage(data.error || "Failed to fetch accounts");
        }
      })
      .catch(() => setMessage("Error fetching accounts"));
  }, []);

  // Handle deposit
  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!accountId || !amount) {
      setMessage("Please select an account and enter amount");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ account_id: accountId, amount }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setAmount("");
        setAccountId("");
      } else {
        setMessage(data.error || "Withdraw failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: "40px" }}>
      <h2 style={{ textAlign: "center" }}>NHP Withdraw</h2>

      {message && (
        <p style={{ textAlign: "center", color: "red", fontWeight: "bold" }}>
          {message}
        </p>
      )}

      <form onSubmit={handleDeposit}>
        <div
          style={{
            display: "flex",
            gap: "50px",
            margin: "30px 0",
            alignItems: "center",
          }}
        >
          <label style={{ fontSize: "1.5rem" }}>Your Accounts:</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
            style={{ width: "400px", fontSize: "1.1rem", padding: "10px" }}
          >
            <option value="">Select an account</option>
            {accounts.map((acc) => (
              <option key={acc.account_id} value={acc.account_id}>
                {acc.account_type} A/C: {acc.account_number} — Balance: ₹
                {acc.balance.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "flex",
            gap: "50px",
            margin: "30px 0",
            alignItems: "center",
          }}
        >
          <label style={{ fontSize: "1.5rem" }}>Deposit Amount:</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{ height: "40px", width: "250px", fontSize: "1.1rem" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "30px",
            justifyContent: "center",
            marginTop: "40px",
          }}
        >
          <button
            type="submit"
            style={{
              backgroundColor: "#0077cc",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Withdraw
          </button>
          <a href="/dashboard/withdraw" style={{ color: "#0077cc" }}>
            Cancel
          </a>
          <a
            href="/dashboard"
            style={{ color: "red", textDecoration: "underline" }}
          >
            Back To Dashboard
          </a>
        </div>
      </form>
    </div>
  );
}

export default Deposit;
