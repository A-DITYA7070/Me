import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Nav({ name, initials, hasExperience }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  const links = [
    ["about", "About"],
    ["skills", "Skills"],
    ["projects", "Projects"],
    ...(hasExperience ? [["experience", "Experience"]] : []),
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setActive(en.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));
    return () => spy.disconnect();
  }, []);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="container nav-inner">
        <a href="#top" className="logo">
          <span className="logo-mark">{initials}</span>
          <span>{name}</span>
        </a>
        <nav className={`nav-links${open ? " open" : ""}`} onClick={(e) => e.target.closest("a") && setOpen(false)}>
          {links.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? "active" : ""}>{label}</a>
          ))}
          <a href="#contact" className="btn btn-sm">Contact</a>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <button className="icon-btn menu-btn" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
