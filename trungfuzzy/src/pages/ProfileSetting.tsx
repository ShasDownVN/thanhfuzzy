import { ChangeEvent, FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../services/api";
import type { User } from "../types/user";

export default function ProfileSetting() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({
    fullName: user?.fullName ?? "",
    phone: user?.phone ?? "",
    birthDate: user?.birthDate ?? "",
    avatar: user?.avatar ?? ""
  }));
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  if (!user) return null;

  function readAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1_500_000) {
      setMessage("Avatar must be an image smaller than 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((value) => ({ ...value, avatar: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      const response = await apiRequest<{ user: User }>("/users/me", {
        method: "PATCH",
        body: JSON.stringify(form)
      });
      setUser(response.user);
      navigate("/profile");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="profile-header section-t-space">
        <div className="custom-container">
          <div className="header-panel"><Link to="/profile">←</Link><h3>Edit Profile</h3></div>
          <label className="profile-setting-pic mx-auto avatar-picker">
            <img alt="" className="img-fluid img" src={form.avatar || "/assets/images/icons/profile1.png"} />
            <input accept="image/*" onChange={readAvatar} type="file" />
            <span>Change</span>
          </label>
        </div>
      </header>
      <form className="theme-form profile-setting mt-4" onSubmit={save}>
        <div className="custom-container">
          <label className="form-label" htmlFor="profileName">Full name</label>
          <input className="form-control mb-3" id="profileName" minLength={2} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required value={form.fullName} />
          <label className="form-label" htmlFor="profileEmail">Email</label>
          <input className="form-control mb-3" disabled id="profileEmail" value={user.email} />
          <label className="form-label" htmlFor="profilePhone">Phone number</label>
          <input className="form-control mb-3" id="profilePhone" onChange={(e) => setForm({ ...form, phone: e.target.value })} pattern="\\+?[0-9][0-9\\s-]{7,14}" value={form.phone} />
          <label className="form-label" htmlFor="birthDate">Birth date</label>
          <input className="form-control" id="birthDate" max={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} type="date" value={form.birthDate} />
          {message && <p className="form-message" role="alert">{message}</p>}
          <div className="footer-modal d-flex gap-3">
            <Link className="btn gray-btn btn-inline mt-0 w-50" to="/profile">Cancel</Link>
            <button className="theme-btn btn btn-inline mt-0 w-50" disabled={saving} type="submit">{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </form>
    </>
  );
}
