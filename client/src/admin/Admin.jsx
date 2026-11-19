import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { ProfileEditor, CollectionEditor, Messages } from "./Editors.jsx";

const TOKEN_KEY = "adminToken";
const readToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; }
};
const writeToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
};

export default function Admin() {
  const [token, setToken] = useState(readToken);

  useEffect(() => {
    document.title = "Admin · Portfolio";
  }, []);

  const logout = useCallback(() => {
    writeToken("");
    setToken("");
  }, []);

  if (!token) {
    return <Login onLogin={(t) => { writeToken(t); setToken(t); }} />;
  }
  return <Dashboard token={token} onLogout={logout} />;
}

function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { token } = await api("/auth/login", { method: "POST", body: { password } });
      onLogin(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <form className="panel" onSubmit={submit}>
        <h1 style={{ fontSize: "1.5rem" }}>Admin login</h1>
        <label className="field">
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required autoComplete="current-password" />
        </label>
        <button className="btn btn-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        {error && <p className="notice err">{error}</p>}
        <Link to="/" className="hint" style={{ textAlign: "center" }}>← Back to site</Link>
      </form>
    </div>
  );
}

const projectFields = [
  { key: "title", label: "Title" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "tags", label: "Tech tags", type: "list", hint: "Comma separated, e.g. React, Node.js" },
  { key: "live", label: "Live URL", hint: "Leave empty to hide" },
  { key: "code", label: "Code URL", hint: "Leave empty to hide" },
  { key: "order", label: "Order", type: "number", hint: "Lower numbers show first" },
];

const experienceFields = [
  { key: "role", label: "Role" },
  { key: "company", label: "Company" },
  { key: "period", label: "Period", hint: "e.g. 2023 — Present" },
  { key: "points", label: "Highlights", type: "lines", hint: "One per line" },
  { key: "order", label: "Order", type: "number", hint: "Lower numbers show first" },
];

function Dashboard({ token, onLogout }) {
  const [tab, setTab] = useState("profile");
  const [unread, setUnread] = useState(0);

  // Every admin request goes through here so an expired login sends you back to the login form.
  const call = useCallback(
    (path, opts = {}) =>
      api(path, { ...opts, token }).catch((err) => {
        if (err.status === 401) onLogout();
        throw err;
      }),
    [token, onLogout]
  );

  const tabs = [
    ["profile", "Profile"],
    ["projects", "Projects"],
    ["experience", "Experience"],
    ["messages", "Messages"],
  ];

  return (
    <div className="container admin">
      <div className="admin-top">
        <h1>Dashboard</h1>
        <div className="row">
          <a className="btn btn-ghost btn-sm" href="/" target="_blank" rel="noopener noreferrer">View site</a>
          <ThemeToggle />
          <button className="btn btn-sm" onClick={onLogout}>Log out</button>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {tabs.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={`tab${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>
            {label}
            {id === "messages" && unread > 0 && <span className="count">{unread}</span>}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileEditor call={call} />}
      {tab === "projects" && <CollectionEditor key="projects" call={call} path="projects" noun="project" fields={projectFields} titleKey="title" />}
      {tab === "experience" && <CollectionEditor key="experience" call={call} path="experience" noun="role" fields={experienceFields} titleKey="role" subtitleKey="company" />}
      {/* Messages stays mounted so the unread badge is always current */}
      <div hidden={tab !== "messages"}>
        <Messages call={call} onUnreadChange={setUnread} />
      </div>
    </div>
  );
}
