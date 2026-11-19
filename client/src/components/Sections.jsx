import { useMemo, useState } from "react";
import { api, safeUrl } from "../api.js";

const Icon = {
  pin: (
    <svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
  ),
  ext: (
    <svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>
  ),
  code: <svg viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5" /></svg>,
};

function SectionHead({ num, label, title }) {
  return (
    <>
      <p className="eyebrow">{num} · {label}</p>
      <h2>{title}</h2>
    </>
  );
}

export function Hero({ p }) {
  const resume = safeUrl(p.resumeUrl);
  return (
    <section className="hero">
      <div className="container hero-inner">
        {p.availability && (
          <p className="badge reveal"><span className="dot" />{p.availability}</p>
        )}
        <h1 className="reveal">
          Hi, I'm <span className="grad">{p.name}</span>.<br />
          <span className="muted-h">{p.role}</span>
        </h1>
        {p.tagline && <p className="lead reveal">{p.tagline}</p>}
        <div className="hero-cta reveal">
          <a href="#projects" className="btn">View my work</a>
          <a href="#contact" className="btn btn-ghost">Get in touch</a>
          {resume && <a href={resume} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">Résumé</a>}
        </div>
        {p.location && <p className="hero-meta reveal">{Icon.pin}{p.location}</p>}
      </div>
      <div className="hero-glow" aria-hidden="true" />
    </section>
  );
}

export function About({ p }) {
  return (
    <section id="about" className="section">
      <div className="container about-grid">
        <div>
          <SectionHead num="01" label="About" title="A bit about me" />
          <div className="about-text">
            {(p.about || []).map((para, i) => <p key={i} className="reveal">{para}</p>)}
          </div>
        </div>
        {p.stats?.length > 0 && (
          <div className="stats">
            {p.stats.map((s, i) => (
              <div key={i} className="stat reveal"><strong>{s.value}</strong><span>{s.label}</span></div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function Skills({ skills = [] }) {
  return (
    <section id="skills" className="section alt">
      <div className="container">
        <SectionHead num="02" label="Skills" title="What I work with" />
        <div className="skills-grid">
          {skills.map((g, i) => (
            <div key={i} className="skill-card reveal">
              <h3>{g.group}</h3>
              <div className="chips">{g.items.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Projects({ projects }) {
  const [filter, setFilter] = useState("All");

  const topTags = useMemo(() => {
    const counts = {};
    projects.forEach((p) => p.tags.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 6);
  }, [projects]);

  const shown = filter === "All" ? projects : projects.filter((p) => p.tags.includes(filter));

  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHead num="03" label="Projects" title="Selected work" />
        {projects.length > 3 && topTags.length > 1 && (
          <div className="filters">
            {["All", ...topTags].map((t) => (
              <button key={t} className={`filter${filter === t ? " active" : ""}`} onClick={() => setFilter(t)}>{t}</button>
            ))}
          </div>
        )}
        <div className="projects-grid reveal">
          {shown.map((p) => {
            const live = safeUrl(p.live);
            const code = safeUrl(p.code);
            return (
              <article key={p._id} className="project">
                <span className="project-num">{String(projects.indexOf(p) + 1).padStart(2, "0")}</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <div className="chips">{p.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
                {(live || code) && (
                  <div className="project-links">
                    {live && <a href={live} target="_blank" rel="noopener noreferrer">Live {Icon.ext}</a>}
                    {code && <a href={code} target="_blank" rel="noopener noreferrer">Code {Icon.code}</a>}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Experience({ items }) {
  return (
    <section id="experience" className="section alt">
      <div className="container">
        <SectionHead num="04" label="Experience" title="Where I've worked" />
        <ol className="timeline">
          {items.map((x) => (
            <li key={x._id} className="tl-item reveal">
              <div className="tl-head">
                <h3>{x.role} {x.company && <span className="tl-company">· {x.company}</span>}</h3>
                <span className="tl-period">{x.period}</span>
              </div>
              {x.points.length > 0 && <ul>{x.points.map((pt, i) => <li key={i}>{pt}</li>)}</ul>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Contact({ contact = {} }) {
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [status, setStatus] = useState({ state: "idle", msg: "" });
  const [copied, setCopied] = useState(false);
  const links = (contact.links || []).map((l) => ({ ...l, url: safeUrl(l.url) })).filter((l) => l.url);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: "sending", msg: "" });
    try {
      await api("/messages", { method: "POST", body: form });
      setForm({ name: "", email: "", message: "", website: "" });
      setStatus({ state: "sent", msg: "Thanks! Your message was sent — I'll get back to you soon." });
    } catch (err) {
      setStatus({ state: "error", msg: err.message });
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${contact.email}`;
    }
  };

  return (
    <section id="contact" className="section">
      <div className="container contact-grid">
        <div>
          <SectionHead num="05" label="Contact" title="Let's build something together" />
          <p className="lead-sm">Have a role, project or idea in mind? Send a message and I'll get back to you.</p>
          <div className="contact-cards">
            {contact.email && (
              <button className="contact-card" type="button" onClick={copyEmail}>
                <span className="cc-label">Email</span>
                <span className="cc-value">{contact.email}</span>
                <span className="cc-hint">{copied ? "Copied ✓" : "Click to copy"}</span>
              </button>
            )}
            {contact.phone && (
              <a className="contact-card" href={`tel:${contact.phone.replace(/\s+/g, "")}`}>
                <span className="cc-label">Phone</span>
                <span className="cc-value">{contact.phone}</span>
              </a>
            )}
          </div>
          {links.length > 0 && (
            <div className="socials">
              {links.map((l) => <a key={l.label + l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>)}
            </div>
          )}
        </div>

        <form className="contact-form" onSubmit={submit}>
          <label>Name<input name="name" value={form.name} onChange={update} required maxLength={100} autoComplete="name" placeholder="Jane Doe" /></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={update} required maxLength={200} autoComplete="email" placeholder="jane@company.com" /></label>
          <label>Message<textarea name="message" rows={5} value={form.message} onChange={update} required maxLength={5000} placeholder="Hi! I'd love to talk about…" /></label>
          {/* Honeypot: hidden from people, bots tend to fill it */}
          <input className="hp" name="website" value={form.website} onChange={update} tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button className="btn btn-full" type="submit" disabled={status.state === "sending"}>
            {status.state === "sending" ? "Sending…" : "Send message"}
          </button>
          {status.msg && <p className={`form-status ${status.state}`} role="status">{status.msg}</p>}
        </form>
      </div>
    </section>
  );
}

export function Footer({ name }) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© {new Date().getFullYear()} {name}</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
