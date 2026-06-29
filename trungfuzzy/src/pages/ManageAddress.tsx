import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../services/api";
import type { Address } from "../types/user";

export default function ManageAddress() {
  const { user, refreshUser } = useAuth();
  if (!user) return null;

  async function setDefault(address: Address) {
    await apiRequest(`/users/me/addresses/${address.id}`, {
      method: "PATCH",
      body: JSON.stringify({ ...address, isDefault: true })
    });
    await refreshUser();
  }

  async function remove(address: Address) {
    if (!window.confirm(`Delete ${address.label} address?`)) return;
    await apiRequest(`/users/me/addresses/${address.id}`, { method: "DELETE" });
    await refreshUser();
  }

  return (
    <>
      <header className="section-t-space">
        <div className="custom-container">
          <div className="header-panel"><Link to="/profile">←</Link><h3>Saved Address</h3></div>
        </div>
      </header>
      <section className="shipping-details-sec">
        <div className="custom-container">
          {!user.addresses.length && <div className="empty-state">No saved addresses yet.</div>}
          <ul className="address-list">
            {user.addresses.map((address) => (
              <li key={address.id}>
                <div className="shipping-address">
                  <div className="address-heading">
                    <label>
                      <input checked={address.isDefault} name="defaultAddress" onChange={() => setDefault(address)} type="radio" />
                      <strong>{address.label}</strong>{address.isDefault && <small>Default</small>}
                    </label>
                    <div>
                      <Link className="address-action" to={`/new-address?id=${address.id}`}>Edit</Link>
                      <button className="address-action danger" onClick={() => remove(address)} type="button">Delete</button>
                    </div>
                  </div>
                  <div className="address-details">
                    <p>{address.recipientName} · {address.street}{address.landmark ? `, ${address.landmark}` : ""}, {address.city} {address.postalCode}</p>
                    <h5>Phone no.: <span>{address.phone}</span></h5>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link className="btn theme-btn w-100 add-address-button" to="/new-address">Add new address</Link>
        </div>
      </section>
    </>
  );
}
