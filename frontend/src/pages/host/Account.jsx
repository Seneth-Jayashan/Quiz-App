import React, { useState } from "react";

export default function Account() {
  // Sample static user data (from your Mongoose model)
  const sampleUser = {
    userId: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    username: "johnny",
    profilePicture: "https://i.pravatar.cc/150?img=12",
    isAdmin: false,
    isActive: true,
    lastLogin: "2025-07-26T12:30:00.000Z",
    createdAt: "2025-07-20T09:00:00.000Z",
  };

  const [user, setUser] = useState(sampleUser);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(sampleUser);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // In real app, send PUT request to backend here
    setUser(formData);
    setEditMode(false);
    setMessage("Changes saved successfully!");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        <div className="flex flex-col items-center">
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-24 h-24 rounded-full border mb-4"
          />
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4 hover:bg-blue-600"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">User ID</label>
            <input
              value={user.userId}
              disabled
              className="w-full border p-2 rounded-lg bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full border p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full border p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              value={user.email}
              disabled
              className="w-full border p-2 rounded-lg bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full border p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Status</label>
            <input
              value={user.isActive ? "Active" : "Inactive"}
              disabled
              className="w-full border p-2 rounded-lg bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Last Login</label>
            <input
              value={new Date(user.lastLogin).toLocaleString()}
              disabled
              className="w-full border p-2 rounded-lg bg-gray-100"
            />
          </div>

          {editMode && (
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full"
            >
              Save Changes
            </button>
          )}
        </div>

        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}
