import React, { useState, useEffect } from "react";

function TransferFunds() {
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch all accounts on load
  useEffect(() => {
    fetch("http://localhost:5000/api/accounts", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.accounts) {
          setAccounts(data.accounts);
        } else {
          setError(data.error || "Failed to load accounts");
        }
      })
      .catch(() => setError("Error connecting to server"));
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!fromAccount || !toAccount || !amount) {
      setError("All fields are required");
      return;
    }
    if (fromAccount === toAccount) {
      setError("Cannot transfer to the same account");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/transfer", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_account: fromAccount,
          to_account: toAccount,
          amount: amount,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        setError(data.error || "Transfer failed");
      }
    } catch (err) {
      setError("Error connecting to server");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Transfer Funds</h2>

      <form onSubmit={handleTransfer} style={styles.form}>
        <label style={styles.label}>From Account:</label>
        <select
          style={styles.input}
          value={fromAccount}
          onChange={(e) => setFromAccount(e.target.value)}
        >
          <option value="">-- Select Account --</option>
          {accounts.map((acc) => (
            <option key={acc.account_number} value={acc.account_number}>
              {acc.account_number} (₹{acc.balance})
            </option>
          ))}
        </select>

        <label style={styles.label}>To Account:</label>
        <input
          style={styles.input}
          type="text"
          placeholder="Enter recipient account number"
          value={toAccount}
          onChange={(e) => setToAccount(e.target.value)}
        />

        <label style={styles.label}>Amount (₹):</label>
        <input
          style={styles.input}
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button style={styles.button} type="submit">
          Transfer
        </button>

        <a
            href="/dashboard"
            style={{ color: "red", textDecoration: "underline" }}
          >
            Back To Dashboard
        </a>
      </form>

      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  label: {
    fontWeight: "bold",
  },
  input: {
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  success: {
    color: "green",
    textAlign: "center",
    marginTop: "10px",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: "10px",
  },
};

export default TransferFunds;
