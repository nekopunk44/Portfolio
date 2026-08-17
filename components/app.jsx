/* Main app wiring */

const { useState, useEffect, useMemo } = React;

const ACCENTS = {
  green:  "#7dff9e",
  amber:  "#ffb347",
  cyan:   "#7ddfff",
  magenta:"#ff7ddc",
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "green",
  "motion": "high",
  "crt": true,
  "scanlines": true,
  "flicker": true,
  "lang": "ru",
  "hero3d": true
}/*EDITMODE-END*/;

/* Проверка работы > описание работы: кейсы идут сразу после знакомства, стек — после них. */
const SECTIONS = ["home", "about", "cases", "lab", "stack", "process", "timeline", "faq", "contact"];
const SECTION_KEYS = { h: "home", a: "about", c: "cases", l: "lab", s: "stack", p: "process", t: "timeline", f: "faq", x: "contact" };

/* The boot sequence is a first-impression device, not a per-navigation toll. */
const BOOT_SEEN_KEY = "portfolio.booted";
const hasBooted = () => {
  try { return window.sessionStorage.getItem(BOOT_SEEN_KEY) === "1"; } catch (e) { return false; }
};
const markBooted = () => {
  try { window.sessionStorage.setItem(BOOT_SEEN_KEY, "1"); } catch (e) { /* ignore */ }
};

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [bootDone, setBootDone] = useState(hasBooted);
  /* Decided once, at mount. If this flipped when bootDone changed, Boot would be
     unmounted mid-dissolve and its exit transition would never play. */
  const [bootEnabled] = useState(() => !hasBooted() && tweaks.motion !== "low");
  const [activeSection, setActiveSection] = useState("home");
  const [termOpen, setTermOpen] = useState(false);
  const [kbdHint, setKbdHint] = useState("");
  const [gPrefix, setGPrefix] = useState(false);

  const t = window.PORTFOLIO_CONTENT.i18n[tweaks.lang] || window.PORTFOLIO_CONTENT.i18n.ru;
  const profile = window.PORTFOLIO_CONTENT.profile;

  const getScrollOffset = () => {
    const topbar = document.querySelector(".topbar");
    return (topbar?.getBoundingClientRect().height || 44) + 24;
  };

  const getSectionAnchor = (id) => {
    const section = document.getElementById(id);
    if (!section) return null;
    if (id === "home") return section;
    return section.querySelector(".section-head") || section;
  };

  const scrollToSection = (id) => {
    const anchor = getSectionAnchor(id);
    if (!anchor) return false;
    const top = id === "home"
      ? 0
      : window.scrollY + anchor.getBoundingClientRect().top - getScrollOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    return true;
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", ACCENTS[tweaks.accent] || ACCENTS.green);
  }, [tweaks.accent]);

  /* The document stayed lang="ru" even with the whole UI switched to English —
     so screen readers read English with Russian phonetics, and any :lang() or
     hyphenation rule would apply the wrong language's typographic rules. */
  useEffect(() => {
    document.documentElement.lang = tweaks.lang;
  }, [tweaks.lang]);

  useEffect(() => {
    const onScroll = () => {
      let current = "home";
      const trigger = getScrollOffset() + 18;
      const bottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      if (bottom) {
        setActiveSection(SECTIONS[SECTIONS.length - 1]);
        return;
      }
      for (const id of SECTIONS) {
        const anchor = getSectionAnchor(id);
        if (!anchor) continue;
        const r = anchor.getBoundingClientRect();
        if (r.top <= trigger) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const openTerm = () => setTermOpen(true);
    window.addEventListener("open-terminal", openTerm);
    return () => window.removeEventListener("open-terminal", openTerm);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
      if (termOpen) return;

      if (e.key === "`" || e.key === "~") {
        e.preventDefault();
        setTermOpen(true);
        return;
      }
      if (e.key === "j") { window.scrollBy({ top: window.innerHeight * 0.6, behavior: "smooth" }); showHint("↓ scroll down"); return; }
      if (e.key === "k") { window.scrollBy({ top: -window.innerHeight * 0.6, behavior: "smooth" }); showHint("↑ scroll up"); return; }
      if (e.key === "g") {
        if (gPrefix) {
          window.scrollTo({ top: 0, behavior: "smooth" });
          setGPrefix(false);
          showHint("↟ top");
        } else {
          setGPrefix(true);
          showHint("g_");
          setTimeout(() => setGPrefix(false), 800);
        }
        return;
      }
      if (e.key === "G") { window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); showHint("↡ bottom"); return; }
      if (gPrefix && SECTION_KEYS[e.key]) {
        const target = document.getElementById(SECTION_KEYS[e.key]);
        if (target) { target.scrollIntoView({ behavior: "smooth", block: "start" }); showHint(`→ ${SECTION_KEYS[e.key]}`); }
        setGPrefix(false);
        return;
      }
      if (e.key === "?") { setTermOpen(true); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [termOpen, gPrefix]);

  useEffect(() => {
    const onAnchorClick = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.('a[href^="#"]');
      if (!link) return;
      const id = decodeURIComponent(link.getAttribute("href").slice(1));
      if (!SECTIONS.includes(id)) return;
      event.preventDefault();
      if (!scrollToSection(id)) return;
      window.history.pushState(null, "", `#${id}`);
      setActiveSection(id);
      link.blur();
    };
    document.addEventListener("click", onAnchorClick);
    return () => document.removeEventListener("click", onAnchorClick);
  }, []);

  const hintTimerRef = React.useRef(null);
  const showHint = (text) => {
    setKbdHint(text);
    clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setKbdHint(""), 1400);
  };

  const navLabels = t.nav;
  const navigateTo = (id) => (event) => {
    event.preventDefault();
    if (!scrollToSection(id)) return;
    window.history.pushState(null, "", `#${id}`);
    setActiveSection(id);
    event.currentTarget.blur();
  };

  return (
    <>
      <Boot
        lines={t.bootLines}
        onDone={() => { markBooted(); setBootDone(true); }}
        enabled={bootEnabled}
      />

      <div className="topbar">
        <div className="dots">
          <span className="dot alive" />
          <span className="dot" />
          <span className="dot" />
        </div>
        <div className="path">~/<b>vladislav</b>/portfolio — <span style={{ color: "var(--accent)" }}>zsh</span></div>
        <div className="spacer" />
        <div className="meta">
          <span><i className="blip" />online</span>
          <span className="mono-small" style={{ cursor: "pointer" }} onClick={() => setTermOpen(true)} title="open shell (`)">[ ~ shell ]</span>
        </div>
        <div className="lang-switch">
          <button className={tweaks.lang === "ru" ? "active" : ""} onClick={() => setTweak("lang", "ru")}>RU</button>
          <button className={tweaks.lang === "en" ? "active" : ""} onClick={() => setTweak("lang", "en")}>EN</button>
        </div>
      </div>

      <nav className="sidenav">
        {SECTIONS.map((id, i) => (
          <a key={id} href={`#${id}`} onClick={navigateTo(id)} className={activeSection === id ? "active" : ""}>
            {navLabels[i] || `~/${id}`}
          </a>
        ))}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {["home","about","cases","stack","contact"].map(id => (
          <a key={id} href={`#${id}`} onClick={navigateTo(id)} className={activeSection === id ? "active" : ""}>
            <span className="dot" />
            <span>{id}</span>
          </a>
        ))}
      </nav>

      <div className="page">
        <section id="home" className="hero">
          <HeroCanvas motionLevel={tweaks.motion} />
          <HeroContent t={t} profile={profile} bootDone={bootDone} motion={tweaks.motion} />
        </section>
        <About t={t} profile={profile} />
        <Cases t={t} />
        <Lab t={t} />
        <Stack t={t} />
        <Process t={t} />
        <Timeline t={t} />
        <FAQ t={t} />
        <Contact t={t} profile={profile} />
        <footer className="footer">
          <span>© {new Date().getFullYear()} Vladislav Bredihin{" — "}{t.footer}</span>
          <span>press <span className="kbd">`</span> for shell · <span className="kbd">?</span> for help</span>
        </footer>
      </div>

      {tweaks.crt && <div className={`crt-overlay ${tweaks.flicker ? "flicker" : ""}`} style={{ "--crt-opacity": tweaks.scanlines ? 0.35 : 0.1 }} />}

      {/* Background sphere — always visible, rotates with scroll */}
      {window.SphereNav && tweaks.motion !== "low" && (
        <SphereNav activeSection={activeSection} />
      )}

      <InteractiveTerminal open={termOpen} onClose={() => setTermOpen(false)} profile={profile} lang={tweaks.lang} />

      <div className={`kbd-hint ${kbdHint ? "show" : ""}`}>{kbdHint || "·"}</div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent color">
          <TweakRadio label="Phosphor" value={tweaks.accent} options={["green", "amber", "cyan", "magenta"]} onChange={(v) => setTweak("accent", v)} />
        </TweakSection>
        <TweakSection label="Motion">
          <TweakRadio label="Intensity" value={tweaks.motion} options={["high", "mid", "low"]} onChange={(v) => setTweak("motion", v)} />
          <TweakToggle label="3D hero object" value={tweaks.hero3d} onChange={(v) => setTweak("hero3d", v)} />
        </TweakSection>
        <TweakSection label="CRT FX">
          <TweakToggle label="CRT overlay" value={tweaks.crt} onChange={(v) => setTweak("crt", v)} />
          <TweakToggle label="Scanlines" value={tweaks.scanlines} onChange={(v) => setTweak("scanlines", v)} />
          <TweakToggle label="Flicker" value={tweaks.flicker} onChange={(v) => setTweak("flicker", v)} />
        </TweakSection>
        <TweakSection label="Language">
          <TweakRadio label="Lang" value={tweaks.lang} options={["ru", "en"]} onChange={(v) => setTweak("lang", v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

/* Extract hero inner content to keep App concise */
const HeroContent = ({ t, profile, bootDone, motion = "high" }) => {
  const [typed, setTyped] = useState("");
  const target = profile.name;
  const animated = motion !== "low";

  useEffect(() => {
    if (!bootDone) return;
    let i = 0;
    let interval = 0;
    /* let the title finish rising into place before the caret starts running,
       so the two moves read in sequence instead of colliding */
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        setTyped(target.slice(0, i));
        if (i >= target.length) clearInterval(interval);
      }, 78);
    }, animated ? 300 : 0);
    return () => { clearTimeout(start); clearInterval(interval); };
  }, [bootDone, target, animated]);

  const [uptime, setUptime] = useState(() => {
    const n = new Date();
    return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}:${String(n.getSeconds()).padStart(2,"0")}`;
  });
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setUptime(`${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}:${String(n.getSeconds()).padStart(2,"0")}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`hero-content ${bootDone && animated ? "is-in" : ""}`}>
      <div className="hero-upper" style={{ position: "relative", top: 0, marginBottom: 60 }}>
        <div className="meta-block"><span className="k">LOCATION</span><span className="v">{profile.location}</span></div>
        <div className="meta-block"><span className="k">EXPERIENCE</span><span className="v">{profile.years} YEARS</span></div>
        <div className="meta-block"><span className="k">UPTIME</span><span className="v" style={{ color: "var(--accent)" }}>{uptime}</span></div>
        <div className="meta-block"><span className="k">HANDLE</span><span className="v">{profile.handle}</span></div>
      </div>

      <div className="status-pill"><i className="blip" />{t.status}</div>
      {/* aria-label carries the full name from the first render; the children are
          the typing animation and stay hidden from assistive tech. */}
      <h1 className="hero-name glitch" data-text={typed} aria-label={target}>
        <span aria-hidden="true">{typed || "\u00A0"}</span>
        <span className="cursor" aria-hidden="true" />
      </h1>
      <div className="hero-role">{t.heroRole}</div>
      <p className="hero-tagline">{t.heroTagline}</p>
      <div className="hero-actions">
        <a href="#contact" className="btn primary">{t.heroCta}</a>
        <a href="#cases" className="btn">~/cases</a>
        <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("open-terminal"))}>./shell</button>
      </div>

      {t.marquee && (
        <div className="marquee">
          <div className="marquee-track">
            {[...t.marquee, ...t.marquee].map((m, i) => <span key={i}><b>◆</b>{m}</span>)}
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
