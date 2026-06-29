import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { reloadTemplateScripts } from "../services/templateScripts";

export default function CreateAccount() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.body.classList.add("auth-body");
    reloadTemplateScripts();
    return () => document.body.classList.remove("auth-body");
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (fullName.trim().length < 2) return setError("Name must contain at least 2 characters.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email.");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
      return setError("Password needs 8+ characters, uppercase, lowercase, number and symbol.");
    }

    setSubmitting(true);
    try {
      const result = await register(fullName.trim(), email.trim(), password);
      if (result.requiresApproval) {
        navigate("/login", {
          replace: true,
          state: { notice: "Đăng ký thành công. Tài khoản đang chờ Admin duyệt." }
        });
      } else {
        navigate("/landing", { replace: true });
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="auth-img">
        <img alt="" className="img-fluid auth-bg" src="/assets/images/background/auth_bg.jpg" />
        <div className="auth-content">
          <div><h2>Let&apos;s get you in</h2><h4 className="p-0">Create your Fuzzy account</h4></div>
        </div>
      </div>
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <div className="custom-container">
          <div className="form-group">
            <label className="form-label" htmlFor="registerName">Full name</label>
            <div className="form-input mb-4">
              <input className="form-control" id="registerName" onChange={(e) => setFullName(e.target.value)} placeholder="Enter Your Name" value={fullName} />
              <i className="iconsax icons" data-icon="user-1" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="registerEmail">Email id</label>
            <div className="form-input mb-4">
              <input className="form-control" id="registerEmail" onChange={(e) => setEmail(e.target.value)} placeholder="Enter Your Email" type="email" value={email} />
              <i className="iconsax icons" data-icon="mail" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="registerPassword">Password</label>
            <div className="form-input">
              <input className="form-control" id="registerPassword" onChange={(e) => setPassword(e.target.value)} placeholder="Enter Your Password" type={showPassword ? "text" : "password"} value={password} />
              <i className="iconsax icons" data-icon="key" />
              <button className="password-toggle" onClick={() => setShowPassword((value) => !value)} type="button">{showPassword ? "Hide" : "Show"}</button>
            </div>
          </div>
          {error && <p className="login-error" role="alert">{error}</p>}
          <div className="submit-btn">
            <button className="btn auth-btn w-100" disabled={submitting} type="submit">{submitting ? "Creating..." : "Sign Up"}</button>
          </div>
          <h4 className="signup">Already have an account? <Link to="/login">Sign in</Link></h4>
        </div>
      </form>
    </>
  );
}
