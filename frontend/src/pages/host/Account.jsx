import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axios"; 

export default function Account() {
  const location = useLocation();

  const getInitialUserData = () => {
    const stateData = location.state?.data;
    if (stateData) return stateData;

    const localData = localStorage.getItem("data");
    if (localData) return JSON.parse(localData);

    return null;
  };

  const [user, setUser] = useState(getInitialUserData);
  const [formData, setFormData] = useState(() => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    profilePicture: null,
  }));
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        profilePicture: null,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, profilePicture: file }));
  };

  const handleSave = async () => {
    try {
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("username", formData.username);

      if (formData.profilePicture) {
        data.append("profilePicture", formData.profilePicture);
      }

      const response = await api.put("/user", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(response.data.user);
      localStorage.setItem("userData", JSON.stringify(response.data.user));
      setEditMode(false);
      setMessage("Changes saved successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save changes.");
    }
  };

  if (!user || (!user.userId && !user.id)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>No user data found.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center max-h-screen bg-gray-100 px-4">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-xl">
        <div className="flex flex-col items-center mb-8">
          <img
            src={
              formData.profilePicture
                ? URL.createObjectURL(formData.profilePicture)
                : user.profilePicture
                  ? `${import.meta.env.VITE_SERVER_URL}${user.profilePicture}`
                  : "/default-avatar.png"
            }
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-gray-200 mb-5 object-cover"
          />
          {editMode && (
            <label className="cursor-pointer text-blue-600 hover:underline mb-4">
              Change Picture
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          <p className="text-gray-400">
            @{user.username} -{" "}
            <span
              className={user.isActive ? "text-green-500" : "text-red-500"}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </p>
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name
              </label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-blue-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                value={user.email}
                disabled
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-blue-400"
              />
            </div>
          </div>

          <div className="flex justify-center">
            {!editMode && (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Edit Profile
              </button>
            )}
          </div>

          {editMode && (
            <button
              type="submit"
              className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
            >
              Save Changes
            </button>
          )}
        </form>

        {message && (
          <p className="mt-6 text-center text-green-600">{message}</p>
        )}
      </div>
    </div>
  );
}
