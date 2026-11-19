import { useCallback, useEffect, useState } from "react";
import { api } from "./api.js";
import Nav from "./components/Nav.jsx";
import { Hero, About, Skills, Projects, Experience, Contact, Footer } from "./components/Sections.jsx";

export default function Portfolio() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [slow, setSlow] = useState(false);

  const load = useCallback(() => {
    setError("");
    setSlow(false);
    // Render's free tier sleeps when idle; the first request can take ~30-50s.
    const timer = setTimeout(() => setSlow(true), 3500);
    api("/portfolio")
      .then(setData)
      .catch((e) => setError(e.message || "Could not load the site"))
      .finally(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => load(), [load]);

  useEffect(() => {
    if (data?.profile) document.title = `${data.profile.name} — ${data.profile.role}`;
  }, [data]);

  useReveal(data);

  if (error) {
    return (
      <div className="state">
        <p>Couldn't load the portfolio.</p>
        <p className="muted">{error}</p>
        <button className="btn" onClick={load}>Try again</button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="state">
        <div className="spinner" aria-hidden="true" />
        <p>{slow ? "Waking up the server — this can take up to a minute on first visit…" : "Loading…"}</p>
      </div>
    );
  }

  const { profile: p, projects, experience } = data;
  if (!p) return <div className="state"><p>No content yet. Add it from the admin page.</p></div>;

  return (
    <>
      <Nav name={p.name} initials={p.initials} hasExperience={experience.length > 0} />
      <main id="top">
        <Hero p={p} />
        <About p={p} />
        <Skills skills={p.skills} />
        <Projects projects={projects} />
        {experience.length > 0 && <Experience items={experience} />}
        <Contact contact={p.contact} />
      </main>
      <Footer name={p.name} />
    </>
  );
}

/** Fade elements with class "reveal" in as they scroll into view. */
function useReveal(dep) {
  useEffect(() => {
    if (!dep) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal:not(.in)").forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, [dep]);
}
