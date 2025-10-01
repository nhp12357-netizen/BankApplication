import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard", {
      credentials: "include" 
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          navigate("/AddAccount");
          navigate("/Deposit")
          throw new Error(errData.error || "Failed to fetch dashboard");
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: "40px", backgroundColor: "#f4f7f9" }}>
      <h2 style={{ textAlign: "center" }}>NHP Banking Dashboard</h2>

      <div
        style={{
          maxWidth: "800px",
          margin: "20px auto",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)"
        }}
      >
        <h2>Welcome, {data.user.username}!</h2>
        <h3 style={{ textAlign: "center" }}>Account Summary</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>#</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Account Number</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.accounts.map((acc, index) => (
              <tr
                key={acc.account_id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/account/${acc.account_id}`)}
              >
                <td style={{ padding: "12px" }}>{index + 1}</td>
                <td style={{ padding: "12px" }}>{acc.account_number}</td>
                <td style={{ padding: "12px" }}>₹{acc.balance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <a
          href="/add_account"
          style={{
            display: "inline-block",
            backgroundColor: "#28a745",
            color: "white",
            padding: "12px 24px",
            fontSize: "16px",
            borderRadius: "8px",
            textDecoration: "none"
          }}
        >
          + Add New Account
        </a>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          maxWidth: "900px",
          margin: "40px auto"
        }}
      >
        <div style={navItemStyle} onClick={() => navigate("/deposit")}>Deposit</div>
        <div style={navItemStyle} onClick={() => navigate("/withdraw")}>Withdraw</div>
        <div style={navItemStyle} onClick={() => navigate("/transfer")}>Transfer</div>
        <div style={navItemStyle} onClick={() => navigate("/bill_payments")}>Bill Payments & Recharges</div>
        <div style={navItemStyle} onClick={() => navigate("/loans")}>Loans & Credit Cards</div>
        <div style={navItemStyle} onClick={() => navigate("/investments")}>Fixed Deposits & Investments</div>
        <div style={navItemStyle} onClick={() => navigate("/pfmanage")}>Manage Profile & Security</div>
        <div style={navItemStyle} onClick={() => navigate("/")}>Logout</div>
        <div style={navItemStyle} onClick={() => navigate("/account_summary")}>Standalone Account Summary</div>
      </div>
    </div>
  );
}

const navItemStyle = {
  backgroundColor: "#0077cc",
  color: "white",
  padding: "20px",
  textAlign: "center",
  fontSize: "18px",
  borderRadius: "10px",
  textDecoration: "none",
  transition: "background-color 0.3s ease"
};

export default Dashboard;
