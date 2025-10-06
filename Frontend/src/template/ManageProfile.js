import React, { useEffect, useState } from "react";

function ManageProfile() {
  const [profile, setProfile] = useState({
    username: "",
    full_name: "",
    email: "",
    phone_number: "",
  });
  const [message, setMessage] = useState("");

 
  useEffect(() => {
    fetch("http://localhost:5000/api/manageprofile", {
      method: "GET",
      credentials: "include", 
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setProfile({
            username: data.username || "",
            full_name: data.full_name || "",
            email: data.email || "",
            phone_number: data.phone_number || "",
          });
        }
      })
      .catch(() => setMessage("Error fetching profile data."));
  }, []);

  // Handle input updates
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Save updated profile
  const handleSave = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/api/manageprofile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(profile),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage("Profile updated successfully!");
        } else {
          setMessage(data.error || "Failed to update profile.");
        }
      })
      .catch(() => setMessage("Network error."));
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Manage Profile</h2>

      {message && <p style={{ color: "red" }}>{message}</p>}

      <form onSubmit={handleSave}>
        <div>
          <label>Username</label><br />
          <input
            type="text"
            name="username"
            value={profile.username}
            readOnly 
          />
        </div>
        <div>
          <label>Full Name</label><br />
          <input
            type="text"
            name="full_name"
            value={profile.full_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Email</label><br />
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Phone Number</label><br />
          <input
            type="text"
            name="phone_number"
            value={profile.phone_number}
            onChange={handleChange}
          />
        </div>

        <button type="submit" style={{ marginTop: "10px" }}>
          Save Changes
        </button>

        <a
            href="/dashboard"
            style={{ color: "red", textDecoration: "underline" }}
          >
            Back To Dashboard
        </a>
      </form>
    </div>
  );
}

export default ManageProfile;
