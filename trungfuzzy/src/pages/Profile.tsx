import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <div className="account-page">
      <header className="profile-header section-t-space">
        <div className="custom-container">
          <div className="header-panel"><Link to="/landing">←</Link><h3>My Profile</h3></div>
          <div className="profile-setting-pic mx-auto">
            <img alt={user.fullName} className="img-fluid img" src={user.avatar || "/assets/images/icons/profile1.png"} />
          </div>
          <div className="profile-summary">
            <h2>{user.fullName}</h2>
            <p>{user.email}</p>
          </div>
        </div>
      </header>
      <main className="custom-container account-menu">
        {(user.role === "admin" || import.meta.env.DEV) && <Link className="admin-profile-link" to="/admin/users"><span>Admin dashboard</span><b>›</b></Link>}
        <Link to="/profile-setting"><span>Personal information</span><b>›</b></Link>
        <Link to="/manage-address"><span>Saved addresses ({user.addresses.length})</span><b>›</b></Link>
        <Link to="/order-history"><span>My orders</span><b>›</b></Link>
        <button onClick={() => { logout(); navigate("/login", { replace: true }); }} type="button">
          <span>Logout</span><b>›</b>
        </button>
      </main>
    </div>
  );
}
