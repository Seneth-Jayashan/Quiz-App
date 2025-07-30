import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axios";

import { motion, AnimatePresence } from "framer-motion";

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
  const [loading, setLoading] = useState(false);
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
      setLoading(true); // start loading
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
    } finally {
      setLoading(false); // stop loading
    }
  };

  // Show loading animation while saving
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <motion.div
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  if (!user || (!user.userId && !user.id)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600 text-lg font-semibold">No user data found.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <motion.div
        className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex flex-col items-center mb-8">
          <motion.img
            src={
              formData.profilePicture
                ? URL.createObjectURL(formData.profilePicture)
                : user.profilePicture
                ? `${import.meta.env.VITE_SERVER_URL}${user.profilePicture}`
                : "/default.jpg"
            }
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-gray-200 mb-5 object-cover"
            layoutId="profile-picture"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          {editMode && (
            <label className="cursor-pointer text-blue-600 hover:underline mb-4 text-sm font-medium">
              Change Picture
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          <p className="text-gray-500 text-sm">
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
            {["firstName", "lastName", "username"].map((field) => (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="block text-sm font-medium mb-1 text-gray-700"
                >
                  {field === "firstName"
                    ? "First Name"
                    : field === "lastName"
                    ? "Last Name"
                    : "Username"}
                </label>
                <input
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full border rounded-lg p-3 focus:outline-none ${
                    editMode
                      ? "border-blue-500 focus:ring-2 focus:ring-blue-400"
                      : "border-gray-300 bg-gray-100 cursor-not-allowed"
                  } transition`}
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1 text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                value={user.email}
                disabled
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            {!editMode ? (
              <motion.button
                type="button"
                onClick={() => {
                  setMessage("");
                  setEditMode(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Edit Profile
              </motion.button>
            ) : (
              <>
                <motion.button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Save Changes
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setMessage("");
                    // Reset form data on cancel
                    setFormData({
                      firstName: user.firstName || "",
                      lastName: user.lastName || "",
                      username: user.username || "",
                      profilePicture: null,
                    });
                  }}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </>
            )}
          </div>
        </form>

        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`mt-6 text-center font-medium ${
                message.includes("Failed")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
