import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios"; // Adjust import path to your axios instance
import { toast } from "react-toastify";

export default function Account() {
  const initial = {
    _id: "",
    userId: null,
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    profilePicture: "/uploads/default.jpg",
    role: "teacher",
    subscription: "free",
    subs_start: null,
    subs_end: null,
    lastLogin: null,
    createdAt: null,
    preferences: {
      notifyNewStudent: true,
      notifyQuizSubmission: true,
    },
  };

  const [profile, setProfile] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get("/user/me");
        setProfile(res.data.user);
      } catch (err) {
        toast.error("Failed to load profile");
      }
    }
    fetchProfile();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("preferences.")) {
      const key = name.split(".")[1];
      setProfile((p) => ({ ...p, preferences: { ...p.preferences, [key]: checked } }));
      return;
    }
    setProfile((p) => ({ ...p, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      // Use FormData if profilePicture is a file URL string (no file upload here)
      // For real upload, handle file input separately

      // Prepare payload (remove _id or anything not needed by API)
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        // You can add phone, bio here if your API supports
      };

      // If you want to update preferences, add them here
      if (profile.preferences) payload.preferences = profile.preferences;

      await api.put(`/user/users/${profile._id}`, payload);
      toast.success("Profile saved");
      setEditing(false);
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  // Avatar upload: simple local preview only here
  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview
    const url = URL.createObjectURL(file);
    setProfile((p) => ({ ...p, profilePicture: url }));
    // TODO: Upload file to backend, get new URL and update
  }

  // Password change handlers (API integration can be added later)
  function handlePasswordChange(e) {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      setMessage({ type: "error", text: "New password and confirm do not match." });
      return;
    }
    // TODO: call password change API
    setTimeout(() => {
      setPasswordOpen(false);
      setPasswords({ current: "", newPass: "", confirm: "" });
      toast.success("Password updated (demo)");
    }, 800);
  }

  // Delete account handler (demo)
  function handleDeleteAccount() {
    if (!window.confirm("Are you sure you want to delete your account? This is irreversible.")) return;
    // TODO: call API to delete account and redirect
    toast.info("Account deleted (demo)");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Account</h2>
          <p className="text-sm text-gray-500">Manage your profile, subscription and settings</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing((s) => !s)} className="px-4 py-2 bg-gray-800 text-white rounded-md shadow-sm">
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            message.type === "success" ? "bg-green-50 text-green-700" : message.type === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - profile card */}
        <div className="col-span-1 bg-white/60 dark:bg-slate-800 p-4 rounded-2xl shadow">
          <div className="flex flex-col items-center text-center">
            <img
              src={`${import.meta.env.VITE_SERVER_URL}${profile.profilePicture || "/uploads/default.jpg"}`}
              alt="avatar"
              className="w-28 h-28 rounded-full ring-2 ring-gray-200 mb-3 object-cover"
            />
            {editing && (
              <label className="text-xs text-gray-500 cursor-pointer">
                Change avatar
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            )}
            <h3 className="font-semibold mt-3">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-sm text-gray-500 capitalize">{profile.role}</p>

            <div className="mt-4 w-full">
              <div className="text-xs text-gray-400">Subscription</div>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <div className="text-sm font-medium capitalize">{profile.subscription}</div>
                  {profile.subs_start && (
                    <div className="text-xs text-gray-500">Start: {new Date(profile.subs_start).toLocaleDateString()}</div>
                  )}
                  {profile.subs_end && (
                    <div className="text-xs text-gray-500">Expires: {new Date(profile.subs_end).toLocaleDateString()}</div>
                  )}
                </div>
                <button
                  onClick={() => toast.info("Open subscription modal (demo)")}
                  className="px-3 py-1 border rounded text-xs"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>

          {/* Add any additional stats if you have them */}
        </div>

        {/* Right column - editable form and settings */}
        <div className="col-span-2 bg-white/60 dark:bg-slate-800 p-6 rounded-2xl shadow">
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">First Name</label>
                <input
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`mt-1 w-full rounded-md border px-3 py-2 bg-white/30 ${editing ? "" : "opacity-80"}`}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600">Last Name</label>
                <input
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`mt-1 w-full rounded-md border px-3 py-2 bg-white/30 ${editing ? "" : "opacity-80"}`}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600">Email</label>
                <input
                  name="email"
                  value={profile.email}
                  disabled
                  className="mt-1 w-full rounded-md border px-3 py-2 bg-gray-100/60"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600">Username</label>
                <input
                  name="username"
                  value={profile.username}
                  disabled
                  className="mt-1 w-full rounded-md border px-3 py-2 bg-gray-100/60"
                />
              </div>
            </div>

            {/* Preferences: Add if needed */}
            {/* <div className="mt-6 flex items-center gap-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="preferences.notifyNewStudent"
                  checked={profile.preferences.notifyNewStudent}
                  onChange={handleChange}
                  disabled={!editing}
                />
                <span className="ml-2 text-sm text-gray-600">Notify when new student joins</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="preferences.notifyQuizSubmission"
                  checked={profile.preferences.notifyQuizSubmission}
                  onChange={handleChange}
                  disabled={!editing}
                />
                <span className="ml-2 text-sm text-gray-600">Notify on quiz submissions</span>
              </label>
            </div> */}

            <div className="mt-6 flex items-center justify-between">
              <div>
                {editing && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPasswordOpen(true)}
                  className="px-3 py-2 border rounded-md"
                >
                  Change password
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-3 py-2 text-red-600 border rounded-md"
                >
                  Delete account
                </button>
              </div>
            </div>
          </form>

          {/* Password modal */}
          {passwordOpen && (
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40" onClick={() => setPasswordOpen(false)} />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-50 bg-white/90 dark:bg-slate-900 p-6 rounded-2xl w-full max-w-md shadow-lg"
              >
                <h3 className="text-lg font-semibold mb-2">Change password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Current password</label>
                    <input
                      type="password"
                      value={passwords.current}
                      onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">New password</label>
                    <input
                      type="password"
                      value={passwords.newPass}
                      onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Confirm new password</label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPasswordOpen(false)}
                      className="px-3 py-2 border rounded-md"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">
                      Update
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 max-w-5xl mx-auto">
        <div className="bg-white/60 dark:bg-slate-800 p-4 rounded-2xl shadow">
          <h4 className="font-semibold mb-3">Danger zone</h4>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Delete account and all data</div>
            <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white rounded-md">
              Delete account
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
