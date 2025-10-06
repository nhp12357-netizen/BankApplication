import React, { useEffect, useState } from "react";

function Loans() {
  const [loans, setLoans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    account_id: "",
    loan_type: "",
    sanctioned_amount: "",
    interest_rate: "",
    tenure_months: "",
    emi_amount: "",
    next_emi_due_date: "",
    last_paid_date: "",
    status: "Pending",
  });

  const [addingLoan, setAddingLoan] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loansRes, accountsRes] = await Promise.all([
        fetch("http://localhost:5000/api/get_loans", { credentials: "include" }),
        fetch("http://localhost:5000/api/accounts", { credentials: "include" })
      ]);

      const loansData = await loansRes.json();
      if (!loansRes.ok) throw new Error(loansData.error || "Failed to fetch loans");
      setLoans(loansData.loans || []);

      const accountsData = await accountsRes.json();
      if (!accountsRes.ok) throw new Error(accountsData.error || "Failed to fetch accounts");
      setAccounts(accountsData.accounts || []);

      // Pre-select first account if available
      if (accountsData.accounts.length > 0) {
        setForm(prev => ({ ...prev, account_id: accountsData.accounts[0].account_id }));
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddingLoan(true);
    setFormError(null);
    try {
      const res = await fetch("http://localhost:5000/api/add_loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add loan");

      setLoans(data.loans || []);
      // Clear loan-specific fields but keep account_id
      setForm(prev => ({
        ...prev,
        loan_type: "",
        sanctioned_amount: "",
        interest_rate: "",
        tenure_months: "",
        emi_amount: "",
        next_emi_due_date: "",
        last_paid_date: "",
        status: "Pending"
      }));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setAddingLoan(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: "40px", backgroundColor: "#f4f7f9" }}>
      <h2 style={{ textAlign: "center" }}>Loan Summary</h2>

      {/* Loan Table */}
      <div style={{ maxWidth: "900px", margin: "40px auto", backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th>#</th><th>Account ID</th><th>Loan Type</th><th>Sanctioned</th><th>Outstanding</th>
              <th>Interest</th><th>Tenure</th><th>EMI</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loans.length > 0 ? loans.map((loan, index) => (
              <tr key={loan.loan_id}>
                <td>{index + 1}</td>
                <td>{loan.account_id}</td>
                <td>{loan.loan_type}</td>
                <td>₹{loan.sanctioned_amount}</td>
                <td>₹{loan.outstanding_balance}</td>
                <td>{loan.interest_rate}%</td>
                <td>{loan.tenure_months}</td>
                <td>₹{loan.emi_amount}</td>
                <td>{loan.status}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", color: "gray" }}>No loans found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Add Loan Form */}
        <div style={{ marginTop: "30px" }}>
          <h3>Add New Loan</h3>
          {formError && <p style={{ color: "red" }}>{formError}</p>}
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
            {/* Account selection dropdown */}
            <select name="account_id" value={form.account_id} onChange={handleChange} required>
              {accounts.map(acc => (
                <option key={acc.account_id} value={acc.account_id}>
                  {acc.account_number} (ID: {acc.account_id})
                </option>
              ))}
            </select>
            <input type="text" name="loan_type" placeholder="Loan Type" value={form.loan_type} onChange={handleChange} required />
            <input type="number" step="0.01" name="sanctioned_amount" placeholder="Sanctioned Amount" value={form.sanctioned_amount} onChange={handleChange} required />
            <input type="number" step="0.01" name="interest_rate" placeholder="Interest Rate (%)" value={form.interest_rate} onChange={handleChange} required />
            <input type="number" name="tenure_months" placeholder="Tenure (Months)" value={form.tenure_months} onChange={handleChange} required />
            <input type="number" step="0.01" name="emi_amount" placeholder="EMI Amount" value={form.emi_amount} onChange={handleChange} required />
            <input type="date" name="next_emi_due_date" placeholder="Next EMI Due Date" value={form.next_emi_due_date} onChange={handleChange} />
            <input type="date" name="last_paid_date" placeholder="Last Paid Date" value={form.last_paid_date} onChange={handleChange} />
            <button type="submit" disabled={addingLoan} style={{ padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px" }}>
              {addingLoan ? "Adding..." : "+ Add Loan"}
            </button>
          </form>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <a href="/Dashboard" style={{ display: "inline-block", backgroundColor: "#0077cc", color: "white", padding: "10px 20px", borderRadius: "8px", textDecoration: "none" }}>
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}

export default Loans;
