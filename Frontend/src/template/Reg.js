import React, { useState } from "react";

function Register() {
  const [formData, setFormData] = useState({
    fullname: "",
    mailid: "",
    phoneno: "",
    desiredUsername: "",
    password: "",
    confirmpassword: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/reg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`${data.message}`);
      } else {
        setMessage(`${data.message}`);
      }
    } catch (error) {
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f0f2f5",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        marginTop: "50px",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "#2c3e50", marginBottom: "30px" }}>
        Welcome to NHP Bank - Registration
      </h1>

      {message && (
        <div style={{ marginBottom: "20px", fontWeight: "bold", color: "red" }}>
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "white",
          display: "inline-block",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
          textAlign: "left",
        }}
      >
        <label style={{ display: "block", marginTop: "15px", fontWeight: "bold" }}>
          Full Name:
        </label>
        <input
          type="text"
          name="fullname"
          value={formData.fullname}
          onChange={handleChange}
          placeholder="Enter Full Name"
          required
          style={inputStyle}
        />

        <label style={{ display: "block", marginTop: "15px", fontWeight: "bold" }}>
          Email:
        </label>
        <input
          type="text"
          name="mailid"
          value={formData.mailid}
          onChange={handleChange}
          placeholder="Enter Email"
          required
          style={inputStyle}
        />

        <label style={{ display: "block", marginTop: "15px", fontWeight: "bold" }}>
          Phone Number:
        </label>
        <input
          type="number"
          name="phoneno"
          value={formData.phoneno}
          onChange={handleChange}
          placeholder="Enter Phone Number"
          required
          style={inputStyle}
        />

        <label style={{ display: "block", marginTop: "15px", fontWeight: "bold" }}>
          Desired Username:
        </label>
        <input
          type="text"
          name="desiredUsername"
          value={formData.desiredUsername}
          onChange={handleChange}
          placeholder="Enter Username"
          required
          style={inputStyle}
        />

        <label style={{ display: "block", marginTop: "15px", fontWeight: "bold" }}>
          Choose Password:
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter Password"
          required
          style={inputStyle}
        />

        <label style={{ display: "block", marginTop: "15px", fontWeight: "bold" }}>
          Confirm Password:
        </label>
        <input
          type="password"
          name="confirmpassword"
          value={formData.confirmpassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          required
          style={inputStyle}
        />

        <button
          type="submit"
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </form>

      <div style={{ marginTop: "20px" }}>
        <a href="/" style={{ color: "#3498db", textDecoration: "none" }}>
          Back to Login
        </a>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "250px",
  padding: "10px",
  marginTop: "5px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "16px",
};

export default Register;
