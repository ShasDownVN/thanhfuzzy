(function () {
  const API_URL = "https://trungfuzzy-api.vercel.app/api";
  const TOKEN_KEY = "fuzzy-access-token";
  const USER_KEY = "fuzzy-demo-user";
  const DEFAULT_ADMIN_ROUTE = "/admin/users";

  function isAdminPath(pathname) {
    return pathname === "/admin" || pathname.startsWith("/admin/");
  }

  function getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  }

  function safeAdminRoute(value) {
    return value && isAdminPath(value) ? value : DEFAULT_ADMIN_ROUTE;
  }

  function adminLoginUrl(next, reason) {
    const params = new URLSearchParams({
      admin: "1",
      from: safeAdminRoute(next)
    });
    if (reason) params.set("reason", reason);
    return `/login?${params.toString()}`;
  }

  function protectAdminRoute() {
    if (!isAdminPath(location.pathname)) return;
    const token = sessionStorage.getItem(TOKEN_KEY);
    const user = getStoredUser();

    if (!token || !user || user.role !== "admin" || user.status !== "active") {
      location.replace(adminLoginUrl(location.pathname + location.search));
    }
  }

  function showError(form, message) {
    let error = form.querySelector(".login-error");
    if (!error) {
      error = document.createElement("p");
      error.className = "login-error";
      error.setAttribute("role", "alert");
      form.querySelector(".submit-btn")?.before(error);
    }
    error.textContent = message;
  }

  function decorateAdminLogin() {
    const params = new URLSearchParams(location.search);
    if (location.pathname !== "/login" || params.get("admin") !== "1") return;

    if (!document.body) return;
    document.body.classList.add("admin-login-mode");
    const heading = document.querySelector(".auth-content h2");
    const subtitle = document.querySelector(".auth-content h4");
    const button = document.querySelector(".auth-form button[type='submit']");
    if (heading && heading.textContent !== "Admin Sign In") {
      heading.textContent = "Admin Sign In";
    }
    if (subtitle && subtitle.textContent !== "Sign in with an active administrator account.") {
      subtitle.textContent = "Sign in with an active administrator account.";
    }
    if (button && !button.disabled && button.textContent !== "Sign In as Admin") {
      button.textContent = "Sign In as Admin";
    }

    if (params.get("reason") === "forbidden") {
      const form = document.querySelector(".auth-form");
      if (form) showError(form, "This account does not have administrator access.");
    }
  }

  protectAdminRoute();

  document.addEventListener("click", function (event) {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const url = new URL(link.href, location.origin);
    if (url.origin !== location.origin || !isAdminPath(url.pathname)) return;

    const user = getStoredUser();
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token && user?.role === "admin" && user.status === "active") return;

    event.preventDefault();
    location.assign(adminLoginUrl(url.pathname + url.search));
  }, true);

  document.addEventListener("submit", async function (event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.classList.contains("auth-form")) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const params = new URLSearchParams(location.search);
    const adminMode = params.get("admin") === "1";
    const email = form.querySelector('input[type="email"]')?.value.trim() || "";
    const password = form.querySelector('input[type="password"], input[autocomplete="current-password"]')?.value || "";
    const button = form.querySelector('button[type="submit"]');

    if (!email || password.length < 8) {
      showError(form, "Please enter a valid email and password.");
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = "Signing in...";
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.token || !data.user) {
        throw new Error(data.message || "Email or password is incorrect.");
      }
      if (adminMode && (data.user.role !== "admin" || data.user.status !== "active")) {
        throw new Error("This account does not have administrator access.");
      }

      sessionStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      location.assign(adminMode ? safeAdminRoute(params.get("from")) : "/landing");
    } catch (error) {
      showError(form, error instanceof Error ? error.message : "Login failed.");
      if (button) {
        button.disabled = false;
        button.textContent = adminMode ? "Sign In as Admin" : "Sign In";
      }
    }
  }, true);

  decorateAdminLogin();
  new MutationObserver(decorateAdminLogin).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
