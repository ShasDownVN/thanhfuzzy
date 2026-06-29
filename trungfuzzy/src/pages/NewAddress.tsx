import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../services/api";
import type { Address } from "../types/user";

type AddressForm = Omit<Address, "id">;
const emptyAddress: AddressForm = {
  label: "Home", recipientName: "", phone: "", street: "", landmark: "",
  city: "", postalCode: "", isDefault: false
};

export default function NewAddress() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const addressId = params.get("id");
  const existing = useMemo(() => user?.addresses.find((item) => item.id === addressId), [addressId, user]);
  const [form, setForm] = useState<AddressForm>(() => existing ? {
    label: existing.label, recipientName: existing.recipientName, phone: existing.phone,
    street: existing.street, landmark: existing.landmark, city: existing.city,
    postalCode: existing.postalCode, isDefault: existing.isDefault
  } : emptyAddress);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await apiRequest(addressId ? `/users/me/addresses/${addressId}` : "/users/me/addresses", {
        method: addressId ? "PATCH" : "POST",
        body: JSON.stringify(form)
      });
      await refreshUser();
      navigate("/manage-address");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save address.");
    } finally {
      setSaving(false);
    }
  }

  const update = (field: keyof AddressForm, value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  return (
    <>
      <header className="section-t-space">
        <div className="custom-container">
          <div className="header-panel"><Link to="/manage-address">←</Link><h3>{addressId ? "Edit Address" : "Add New Address"}</h3></div>
        </div>
      </header>
      <section className="section-b-space">
        <div className="custom-container">
          <form className="address-form" onSubmit={save}>
            <label className="form-label">Recipient name</label>
            <input className="form-control mb-3" minLength={2} onChange={(e) => update("recipientName", e.target.value)} required value={form.recipientName} />
            <label className="form-label">Phone number</label>
            <input className="form-control mb-3" onChange={(e) => update("phone", e.target.value)} pattern="\\+?[0-9][0-9\\s-]{7,14}" required value={form.phone} />
            <label className="form-label">Street address</label>
            <input className="form-control mb-3" minLength={5} onChange={(e) => update("street", e.target.value)} required value={form.street} />
            <label className="form-label">Landmark</label>
            <input className="form-control mb-3" onChange={(e) => update("landmark", e.target.value)} value={form.landmark} />
            <div className="row">
              <div className="col-6">
                <label className="form-label">City</label>
                <input className="form-control mb-3" minLength={2} onChange={(e) => update("city", e.target.value)} required value={form.city} />
              </div>
              <div className="col-6">
                <label className="form-label">Postal code</label>
                <input className="form-control mb-3" minLength={3} onChange={(e) => update("postalCode", e.target.value)} required value={form.postalCode} />
              </div>
            </div>
            <label className="form-label">Address type</label>
            <div className="address-type-options">
              {(["Home", "Office", "Other"] as const).map((label) => (
                <label key={label}><input checked={form.label === label} name="label" onChange={() => update("label", label)} type="radio" /> {label}</label>
              ))}
            </div>
            <label className="default-address-check">
              <input checked={form.isDefault} onChange={(e) => update("isDefault", e.target.checked)} type="checkbox" /> Set as default address
            </label>
            {error && <p className="form-message" role="alert">{error}</p>}
            <div className="footer-modal d-flex gap-3">
              <Link className="btn gray-btn btn-inline mt-0 w-50" to="/manage-address">Cancel</Link>
              <button className="theme-btn btn btn-inline mt-0 w-50" disabled={saving} type="submit">{saving ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
