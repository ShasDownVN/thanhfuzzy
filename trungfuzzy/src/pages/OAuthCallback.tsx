import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { tokenStore } from "../services/api";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    window.history.replaceState(null, "", "/oauth/callback");
    if (!token) {
      navigate("/login?oauth=failed", { replace: true });
      return;
    }
    tokenStore.set(token);
    refreshUser()
      .then(() => navigate("/landing", { replace: true }))
      .catch(() => navigate("/login?oauth=failed", { replace: true }));
  }, [navigate, refreshUser]);

  return <div className="auth-loading">Completing sign in...</div>;
}
