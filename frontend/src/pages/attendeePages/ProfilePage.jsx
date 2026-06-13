// src/pages/attendeePages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/enum/userRole";
import { HttpMethod } from "@/enum/httpMethod";
import useAxios from "@/hooks/useAxios";
import { useAuth } from "@/hooks/useAuth";

import { getMediaUrl } from "@/utils/mediaUrl";

const MySwal = withReactContent(Swal);

const ProfileSchema = Yup.object({
  name: Yup.string()
    .min(3, "Too short")
    .max(50, "Too long")
    .required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
});

const PasswordSchema = Yup.object({
  newPassword: Yup.string()
    .min(8, "Minimum 8 characters")
    .required("New password required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm the new password"),
});

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, setUser: setAuthUser } = useAuth();
  const { fetchData, loading: apiLoading } = useAxios();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (authUser && !authLoading) {
      setUser(authUser);
      if (authUser.profileImage) {
        setAvatarPreview(getMediaUrl(authUser.profileImage));
      }
      setLoading(false);
    } else if (!authLoading && !authUser) {
      setUser(null);
      setLoading(false);
    }
  }, [authUser, authLoading]);

  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return "U";
    const parts = nameOrEmail.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleAvatarSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const saveProfile = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      const userId = user.id || user._id;

      if (avatarFile) {
        const imageForm = new FormData();
        imageForm.append("profileImage", avatarFile);

        const uploadResult = await fetchData({
          url: "/upload/profile",
          method: HttpMethod.POST,
          data: imageForm,
        });

        if (!uploadResult?.success) {
          throw new Error(
            uploadResult?.message || "Failed to upload profile image"
          );
        }

        const uploadedUser = uploadResult.data?.user;
        if (uploadedUser?.profileImage) {
          setAvatarPreview(getMediaUrl(uploadedUser.profileImage));
        }
        setAvatarFile(null);
      }

      const result = await fetchData({
        url: `/users/${userId}`,
        method: HttpMethod.PUT,
        data: {
          name: values.name,
          email: values.email,
        },
      });

      if (result?.user) {
        const updatedUser = result.user;
        if (!updatedUser.role) updatedUser.role = UserRole.ATTENDEE;
        setUser(updatedUser);
        setAuthUser(updatedUser);
        if (updatedUser.profileImage) {
          setAvatarPreview(getMediaUrl(updatedUser.profileImage));
        }

        MySwal.fire({
          title: "Saved",
          text: "Profile updated successfully",
          icon: "success",
        });
        setEditing(false);
      } else {
        throw new Error("Failed to save profile");
      }
    } catch (err) {
      console.error(err);
      MySwal.fire({
        title: "Error",
        text: err.message || "Network error while saving profile",
        icon: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      const result = await fetchData({
        url: "/users/reset-password",
        method: HttpMethod.POST,
        data: {
          userId: user?.id || user?._id,
          newPassword: values.newPassword,
        },
      });

      if (result) {
        MySwal.fire({
          title: "Password Reset",
          text: "Password has been updated.",
          icon: "success",
        });
        setShowPasswordModal(false);
        resetForm();
      } else {
        throw new Error("Could not reset password");
      }
    } catch (err) {
      console.error(err);
      MySwal.fire({
        title: "Error",
        text: err.message || "Network error resetting password",
        icon: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <main className="p-6">
        <div>Loading profile…</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-6">
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-lg font-semibold">No user found</h2>
          <p className="text-sm text-gray-600 mt-2">
            Please login to view your profile.
          </p>
        </div>
      </main>
    );
  }

  const initialValues = {
    name: user.name || user.displayName || "",
    email: user.email || "",
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded shadow">
          {/* ... existing profile UI code ... */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview || "/placeholder.svg"}
                  alt="avatar"
                  className="w-28 h-28 rounded-full object-cover border"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
                  {getInitials(initialValues.name || user.email)}
                </div>
              )}

              <div className="absolute right-0 bottom-0 flex gap-2">
                <label className="bg-white border px-2 py-1 rounded shadow cursor-pointer text-xs hover:bg-gray-100">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                </label>
                {avatarPreview && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="bg-white border px-2 py-1 rounded shadow text-xs hover:bg-gray-100"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {user.name || user.displayName}
                  </h2>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="mt-2">
                    <span className="inline-block text-xs px-3 py-1 rounded bg-gray-100 text-gray-700 font-medium">
                      Role: {user.role || UserRole.ATTENDEE}
                    </span>
                  </div>
                </div>

                <div>
                  {!editing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded shadow"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 bg-gray-100 rounded"
                      >
                        Reset Password
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 bg-gray-100 rounded"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Formik
                  initialValues={initialValues}
                  validationSchema={ProfileSchema}
                  onSubmit={saveProfile}
                  enableReinitialize
                >
                  {({ isSubmitting }) => (
                    <Form className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <Field
                          name="name"
                          disabled={!editing}
                          className={`mt-1 block w-full border rounded px-3 py-2 ${
                            editing ? "" : "bg-gray-50 cursor-not-allowed"
                          }`}
                          placeholder="Full name"
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="text-xs text-red-600 mt-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <Field
                          name="email"
                          disabled={!editing}
                          className={`mt-1 block w-full border rounded px-3 py-2 ${
                            editing ? "" : "bg-gray-50 cursor-not-allowed"
                          }`}
                          placeholder="Email address"
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="text-xs text-red-600 mt-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <div className="mt-1 block w-full border rounded px-3 py-2 bg-gray-50">
                          {user.role || UserRole.ATTENDEE}
                        </div>
                      </div>

                      {editing && (
                        <div className="flex items-center gap-2">
                          <button
                            type="submit"
                            disabled={isSubmitting || apiLoading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded shadow"
                          >
                            {isSubmitting || apiLoading
                              ? "Saving..."
                              : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className="px-4 py-2 bg-gray-100 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password reset modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
            <Formik
              initialValues={{ newPassword: "", confirmPassword: "" }}
              validationSchema={PasswordSchema}
              onSubmit={handlePasswordReset}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <Field
                      name="newPassword"
                      type="password"
                      className="mt-1 block w-full border rounded px-3 py-2"
                      placeholder="Enter new password"
                    />
                    <ErrorMessage
                      name="newPassword"
                      component="div"
                      className="text-xs text-red-600 mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <Field
                      name="confirmPassword"
                      type="password"
                      className="mt-1 block w-full border rounded px-3 py-2"
                      placeholder="Confirm password"
                    />
                    <ErrorMessage
                      name="confirmPassword"
                      component="div"
                      className="text-xs text-red-600 mt-1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || apiLoading}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded shadow"
                    >
                      {isSubmitting || apiLoading ? "Updating..." : "Update"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </main>
  );
}
