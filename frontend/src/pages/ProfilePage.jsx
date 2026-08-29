import { useEffect, useRef, useState } from "react";

import {
  UserRound,
  Pencil,
  X,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Code2,
  UserCog,
  Check,
  Camera,
} from "lucide-react";

import Card from "../components/Card";
import { api } from "../services/api";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const FIELDS = [
  {
    name: "full_name",
    placeholder: "Full name",
    label: "Full Name",
  },
  {
    name: "professional_title",
    placeholder: "Professional title",
    label: "Professional Title",
  },
  {
    name: "email",
    type: "email",
    placeholder: "Email address",
    label: "Email",
  },
  {
    name: "phone",
    type: "tel",
    placeholder: "Phone number",
    label: "Phone",
  },
  {
    name: "location",
    placeholder: "Location",
    label: "Location",
  },
  {
    name: "linkedin",
    type: "url",
    placeholder: "LinkedIn profile URL",
    label: "LinkedIn",
  },
  {
    name: "github",
    type: "url",
    placeholder: "GitHub profile URL",
    label: "GitHub",
  },
  {
    name: "bio",
    type: "textarea",
    placeholder: "Write a short professional bio...",
    label: "Bio",
  },
];

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.get("/profile");
      const items = Array.isArray(data) ? data : [];
      setProfile(items.length > 0 ? items[0] : null);
    } catch (error) {
      console.error("Error loading profile:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const startEdit = () => {
    const editData = {};
    FIELDS.forEach((field) => {
      editData[field.name] = profile[field.name] ?? "";
    });
    editData.avatar_url = profile.avatar_url || "";
    setForm(editData);
    setAvatarPreview(profile.avatar_url || null);
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setForm({});
    setAvatarPreview(null);
    setEditing(false);
  };

  const handleChange = (fieldName, value) => {
    setForm((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum size is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      setUploading(true);
      const result = await api.upload(file);
      setForm((prev) => ({ ...prev, avatar_url: result.url }));
      setAvatarPreview(result.url);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload image. Please try again.");
      setAvatarPreview(form.avatar_url || null);
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    const payload = {};
    FIELDS.forEach((field) => {
      payload[field.name] = form[field.name] || "";
    });
    payload.avatar_url = form.avatar_url || "";

    try {
      setSaving(true);

      if (profile) {
        await api.put(`/profile/${profile.id}`, payload);
      } else {
        await api.post("/profile", payload);
      }

      setEditing(false);
      setForm({});
      setAvatarPreview(null);
      await loadProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page module dataPage">
        <div className="moduleHeader dataPageHeader">
          <h1>Profile / Professional Information</h1>
        </div>
        <div className="emptyState loadingState">
          Loading your profile...
        </div>
      </div>
    );
  }

  const hasProfile = profile !== null;

  return (
    <div className="page module dataPage">

      {/* PAGE HERO */}
      <div className="moduleHeader dataPageHeader">
        <h1>Profile / Professional Information</h1>
      </div>


      {/* FORM (create or edit) */}
      {(!hasProfile || editing) && (
        <div className="formCenter">
          <Card className="dataForm">

            <div className="formTitle">
              <div className="formTitleContent">
                <div className="formIcon">
                  <UserRound size={22} />
                </div>
                <div>
                  <h2>
                    {hasProfile
                      ? "Edit Your Profile"
                      : "Create Your Profile"}
                  </h2>
                  <p>
                    {hasProfile
                      ? "Update your information below."
                      : "Add your professional information to GrowthOS. You only need to do this once."}
                  </p>
                </div>
              </div>

             
            </div>

            <div className="avatarUploadSection">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />

              <button
                type="button"
                className="avatarUploadBtn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview.startsWith("/") ? `${API_BASE_URL}${avatarPreview}` : avatarPreview}
                    alt="Avatar preview"
                    className="avatarUploadPreview"
                  />
                ) : (
                  <div className="avatarUploadPlaceholder">
                    <Camera size={24} />
                    <span>{uploading ? "Uploading..." : "Add Photo"}</span>
                  </div>
                )}
              </button>

              <p className="avatarUploadHint">
                JPG, PNG or WebP. Max 5MB.
              </p>
            </div>

            <div className="formFields">
              {FIELDS.map((field) => {
                if (field.type === "textarea") {
                  return (
                    <div
                      className="formGroup fullWidth"
                      key={field.name}
                    >
                      <label>{field.label}</label>
                      <textarea
                        placeholder={field.placeholder}
                        value={form[field.name] || ""}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
                      />
                    </div>
                  );
                }

                return (
                  <div className="formGroup" key={field.name}>
                    <label>{field.label}</label>
                    <input
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      value={form[field.name] ?? ""}
                      onChange={(e) =>
                        handleChange(field.name, e.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>

            <div className="formActions">
              {hasProfile && (
                <button
                  type="button"
                  className="cancelBtn"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  <X size={17} />
                  Cancel
                </button>
              )}

              <button
                type="button"
                className="saveBtn"
                onClick={saveProfile}
                disabled={saving}
              >
                <Check size={17} />
                {saving
                  ? "Saving..."
                  : hasProfile
                  ? "Save Changes"
                  : "Create Profile"}
              </button>
            </div>

          </Card>
        </div>
      )}


      {/* READ-ONLY VIEW (when profile exists and not editing) */}
      {hasProfile && !editing && (
        <div className="profileView">

          <Card className="profileCard">

            <button
              type="button"
              className="profileEditBtn"
              onClick={startEdit}
              title="Edit profile"
            >
              <Pencil size={15} />
            </button>

            <div className="profileCardHeader">

              <div className="profileAvatar">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url.startsWith("/") ? `${API_BASE_URL}${profile.avatar_url}` : profile.avatar_url}
                    alt={profile.full_name || "Profile"}
                    className="profileAvatarImg"
                  />
                ) : (
                  <UserRound size={28} />
                )}
              </div>

              <div className="profileCardInfo">
                <h2>{profile.full_name || "No name set"}</h2>
              </div>

            </div>

            {profile.bio && (
              <p className="profileBio">{profile.bio}</p>
            )}

              {profile.professional_title && (
                <div className="profileDetail">
                  <UserCog size={16} />
                  <span>{profile.professional_title}</span>
                </div>
              )}
              
              {profile.email && (
                <div className="profileDetail">
                  <Mail size={16} />
                  <span>{profile.email}</span>
                </div>
              )}

              {profile.phone && (
                <div className="profileDetail">
                  <Phone size={16} />
                  <span>{profile.phone}</span>
                </div>
              )}

              {profile.location && (
                <div className="profileDetail">
                  <MapPin size={16} />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.linkedin && (
                <div className="profileDetail">
                  <ExternalLink size={16} />
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {profile.linkedin}
                  </a>
                </div>
              )}

              {profile.github && (
                <div className="profileDetail">
                  <Code2 size={16} />
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {profile.github}
                  </a>
                </div>
              )}

          </Card>

        </div>
      )}

    </div>
  );
}

export default ProfilePage;
