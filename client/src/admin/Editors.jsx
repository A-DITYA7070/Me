import { useCallback, useEffect, useState } from "react";

/* ---------- small helpers ---------- */
const lines = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const splitOnce = (line, sep) => {
  const i = line.indexOf(sep);
  return i < 0 ? [line.trim(), ""] : [line.slice(0, i).trim(), line.slice(i + 1).trim()];
};

function Field({ label, hint, type = "text", value, onChange, rows = 4, ...rest }) {
  return (
    <label className="field">
      <span>{label} {hint && <span className="hint">— {hint}</span>}</span>
      {type === "textarea" ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      )}
    </label>
  );
}

function Notice({ status }) {
  if (!status?.msg) return null;
  return <p className={`notice ${status.ok ? "ok" : "err"}`} role="status">{status.msg}</p>;
}

/* ---------- Profile ---------- */
// The profile has a few nested lists; they're edited as plain text lines to keep the form simple.
const profileToForm = (p = {}) => ({
  name: p.name || "",
  initials: p.initials || "",
  role: p.role || "",
  tagline: p.tagline || "",
  location: p.location || "",
  availability: p.availability || "",
  resumeUrl: p.resumeUrl || "",
  email: p.contact?.email || "",
  phone: p.contact?.phone || "",
  about: (p.about || []).join("\n\n"),
  stats: (p.stats || []).map((s) => `${s.value} | ${s.label}`).join("\n"),
  skills: (p.skills || []).map((s) => `${s.group}: ${s.items.join(", ")}`).join("\n"),
  links: (p.contact?.links || []).map((l) => `${l.label} | ${l.url}`).join("\n"),
});

const formToProfile = (f) => ({
  name: f.name,
  initials: f.initials,
  role: f.role,
  tagline: f.tagline,
  location: f.location,
  availability: f.availability,
  resumeUrl: f.resumeUrl,
  about: f.about.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean),
  stats: lines(f.stats).map((l) => {
    const [value, label] = splitOnce(l, "|");
    return { value, label };
  }),
  skills: lines(f.skills).map((l) => {
    const [group, rest] = splitOnce(l, ":");
    return { group, items: rest.split(",").map((s) => s.trim()).filter(Boolean) };
  }),
  contact: {
    email: f.email,
    phone: f.phone,
    links: lines(f.links).map((l) => {
      const [label, url] = splitOnce(l, "|");
      return { label, url };
    }),
  },
});

export function ProfileEditor({ call }) {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    call("/admin/profile")
      .then((p) => setForm(profileToForm(p || {})))
      .catch((e) => setStatus({ ok: false, msg: e.message }));
  }, [call]);

  if (!form) return status ? <Notice status={status} /> : <p className="muted">Loading…</p>;

  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const saved = await call("/admin/profile", { method: "PUT", body: formToProfile(form) });
      setForm(profileToForm(saved));
      setStatus({ ok: true, msg: "Saved — the live site is updated." });
    } catch (err) {
      setStatus({ ok: false, msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="panel" onSubmit={save}>
      <div className="field-grid">
        <Field label="Full name" value={form.name} onChange={set("name")} required />
        <Field label="Initials" hint="logo" value={form.initials} onChange={set("initials")} maxLength={3} />
        <Field label="Role / title" value={form.role} onChange={set("role")} />
        <Field label="Location" value={form.location} onChange={set("location")} />
      </div>
      <Field label="Tagline" value={form.tagline} onChange={set("tagline")} />
      <div className="field-grid">
        <Field label="Availability badge" hint="empty hides it" value={form.availability} onChange={set("availability")} />
        <Field label="Résumé link" hint="e.g. /resume.pdf" value={form.resumeUrl} onChange={set("resumeUrl")} />
      </div>
      <Field label="About" hint="blank line between paragraphs" type="textarea" rows={6} value={form.about} onChange={set("about")} />
      <div className="field-grid">
        <Field label="Stats" hint="one per line: 3+ | Years experience" type="textarea" value={form.stats} onChange={set("stats")} />
        <Field label="Skills" hint="one group per line: Frontend: React, CSS" type="textarea" value={form.skills} onChange={set("skills")} />
      </div>
      <div className="field-grid">
        <Field label="Contact email" type="email" value={form.email} onChange={set("email")} />
        <Field label="Phone" hint="optional" value={form.phone} onChange={set("phone")} />
      </div>
      <Field label="Social links" hint="one per line: GitHub | https://github.com/you" type="textarea" value={form.links} onChange={set("links")} />
      <div className="actions">
        <button className="btn" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
        <Notice status={status} />
      </div>
    </form>
  );
}

/* ---------- Projects / Experience ---------- */
const itemToForm = (fields, item = {}) =>
  Object.fromEntries(
    fields.map(({ key, type }) => {
      const v = item[key];
      if (type === "list") return [key, (v || []).join(", ")];
      if (type === "lines") return [key, (v || []).join("\n")];
      if (type === "number") return [key, v == null ? "0" : String(v)];
      return [key, v || ""];
    })
  );

const formToItem = (fields, form) =>
  Object.fromEntries(
    fields.map(({ key, type }) => {
      const v = form[key];
      if (type === "list") return [key, v.split(",").map((s) => s.trim()).filter(Boolean)];
      if (type === "lines") return [key, lines(v)];
      if (type === "number") return [key, Number(v) || 0];
      return [key, v.trim()];
    })
  );

export function CollectionEditor({ call, path, noun, fields, titleKey, subtitleKey }) {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null); // { id, form } or null
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    () => call(`/admin/${path}`).then(setItems).catch((e) => setStatus({ ok: false, msg: e.message })),
    [call, path]
  );
  useEffect(() => { load(); }, [load]);

  const startNew = () => {
    const form = itemToForm(fields);
    if ("order" in form) form.order = String(items?.length || 0);
    setEditing({ id: null, form });
    setStatus(null);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = formToItem(fields, editing.form);
      if (editing.id) await call(`/admin/${path}/${editing.id}`, { method: "PUT", body });
      else await call(`/admin/${path}`, { method: "POST", body });
      setEditing(null);
      setStatus({ ok: true, msg: "Saved — the live site is updated." });
      await load();
    } catch (err) {
      setStatus({ ok: false, msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item[titleKey]}"? This can't be undone.`)) return;
    try {
      await call(`/admin/${path}/${item._id}`, { method: "DELETE" });
      setStatus({ ok: true, msg: "Deleted." });
      await load();
    } catch (err) {
      setStatus({ ok: false, msg: err.message });
    }
  };

  if (editing) {
    const set = (key) => (v) => setEditing((ed) => ({ ...ed, form: { ...ed.form, [key]: v } }));
    return (
      <form className="panel" onSubmit={save}>
        <h2 style={{ fontSize: "1.3rem", margin: 0 }}>{editing.id ? `Edit ${noun}` : `New ${noun}`}</h2>
        {fields.map((f) => (
          <Field
            key={f.key}
            label={f.label}
            hint={f.hint}
            type={f.type === "textarea" || f.type === "lines" ? "textarea" : f.type === "number" ? "number" : "text"}
            value={editing.form[f.key]}
            onChange={set(f.key)}
            required={f.key === titleKey}
          />
        ))}
        <div className="actions">
          <button className="btn" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          <Notice status={status} />
        </div>
      </form>
    );
  }

  return (
    <div className="list">
      <div className="actions">
        <button className="btn" onClick={startNew}>+ Add {noun}</button>
        <Notice status={status} />
      </div>
      {items === null && !status && <p className="muted">Loading…</p>}
      {items?.length === 0 && <p className="muted">Nothing here yet.</p>}
      {items?.map((item) => (
        <div key={item._id} className="list-item">
          <div>
            <h3>{item[titleKey]}</h3>
            {subtitleKey && item[subtitleKey] && <p>{item[subtitleKey]}</p>}
          </div>
          <div className="actions">
            <button className="btn btn-ghost btn-sm" onClick={() => { setEditing({ id: item._id, form: itemToForm(fields, item) }); setStatus(null); }}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => remove(item)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Contact messages ---------- */
export function Messages({ call, onUnreadChange }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(
    () => call("/admin/messages").then(setItems).catch((e) => setError(e.message)),
    [call]
  );
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (items) onUnreadChange(items.filter((m) => !m.read).length);
  }, [items, onUnreadChange]);

  const toggleRead = async (m) => {
    try {
      const updated = await call(`/admin/messages/${m._id}`, { method: "PATCH", body: { read: !m.read } });
      setItems((list) => list.map((x) => (x._id === m._id ? updated : x)));
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (m) => {
    if (!window.confirm(`Delete the message from ${m.name}? This can't be undone.`)) return;
    try {
      await call(`/admin/messages/${m._id}`, { method: "DELETE" });
      setItems((list) => list.filter((x) => x._id !== m._id));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="list">
      <div className="actions">
        <button className="btn btn-ghost btn-sm" onClick={load}>Refresh</button>
        {error && <p className="notice err">{error}</p>}
      </div>
      {items === null && !error && <p className="muted">Loading…</p>}
      {items?.length === 0 && <p className="muted">No messages yet.</p>}
      {items?.map((m) => (
        <div key={m._id} className={`list-item${m.read ? "" : " unread"}`}>
          <div style={{ flex: "1 1 300px", minWidth: 0 }}>
            <h3>{m.name} {!m.read && <span className="count">new</span>}</h3>
            <p>
              <a href={`mailto:${m.email}`} style={{ color: "var(--accent)" }}>{m.email}</a>
              {" · "}
              {new Date(m.createdAt).toLocaleString()}
            </p>
            <p className="msg-body">{m.message}</p>
          </div>
          <div className="actions">
            <a className="btn btn-sm" href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`}>Reply</a>
            <button className="btn btn-ghost btn-sm" onClick={() => toggleRead(m)}>{m.read ? "Mark unread" : "Mark read"}</button>
            <button className="btn btn-danger btn-sm" onClick={() => remove(m)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
