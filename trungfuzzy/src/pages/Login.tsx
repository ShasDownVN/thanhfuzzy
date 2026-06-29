import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { reloadTemplateScripts } from "../services/templateScripts";
import { useAuth } from "../contexts/AuthContext";

const REMEMBERED_EMAIL_KEY = "fuzzy-remembered-email";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem(REMEMBERED_EMAIL_KEY)));
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const notice = (location.state as { notice?: string } | null)?.notice;

  useEffect(() => {
    document.body.classList.add("auth-body");
    reloadTemplateScripts();
    return () => document.body.classList.remove("auth-body");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (remember) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      const destination = (location.state as { from?: string } | null)?.from ?? "/landing";
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="auth-img">
        <img
          alt="A modern sofa in a dark interior"
          className="img-fluid auth-bg"
          src="/assets/images/background/auth_bg.jpg"
        />
        <div className="auth-content">
          <div>
            <h2>Hello Again!</h2>
            <h4 className="p-0">Welcome back, You have been missed!</h4>
          </div>
        </div>
      </div>

      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <div className="custom-container">
          <div className="form-group">
            <label className="form-label" htmlFor="inputusername">Email id</label>
            <div className="form-input mb-4">
              <input
                autoComplete="email"
                className="form-control"
                id="inputusername"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter Your Email"
                type="email"
                value={email}
              />
              <i className="iconsax icons" data-icon="mail" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="inputPassword">Password</label>
            <div className="form-input">
              <input
                autoComplete="current-password"
                className="form-control"
                id="inputPassword"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter Your Password"
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <i className="iconsax icons" data-icon="key" />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="option mt-3">
            <div className="form-check">
              <input
                checked={remember}
                className="form-check-input"
                id="flexCheckDefault"
                onChange={(event) => setRemember(event.target.checked)}
                type="checkbox"
              />
              <label className="form-check-label" htmlFor="flexCheckDefault">Remember me</label>
            </div>
            <Link className="forgot" to="/forgot-password">Forgot password?</Link>
          </div>

          {notice && !error && <p className="login-notice" role="status">{notice}</p>}
          {error && <p className="login-error" role="alert">{error}</p>}

          <div className="submit-btn">
            <button className="btn auth-btn w-100" disabled={submitting} type="submit">
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <div className="division"><span>OR</span></div>

          <ul className="social-media">
            <li>
              <a aria-label="Sign in with Facebook" href={`${API_URL}/auth/oauth/facebook`}>
                <img alt="" className="img-fluid icons" src="/assets/images/svg/facebook.svg" />
              </a>
            </li>
            <li>
              <a aria-label="Sign in with Google" href={`${API_URL}/auth/oauth/google`}>
                <img alt="" className="img-fluid icons" src="/assets/images/svg/google.svg" />
              </a>
            </li>
            <li>
              <a aria-label="Sign in with Apple" href="https://appleid.apple.com/" rel="noreferrer" target="_blank">
                <img alt="" className="img-fluid icons" src="/assets/images/svg/apple.svg" />
              </a>
            </li>
          </ul>

          <h4 className="signup">
            Don&apos;t have an account? <Link to="/create-account">Sign up</Link>
          </h4>
        </div>
      </form>
    </>
  );
}
