/* Section components: Boot, Hero, About, Stack, Cases, Timeline, Contact */

const { useState, useEffect, useRef } = React;

/* ---------- Reveal-on-scroll ---------- */
const Reveal = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${shown ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
};

/* ---------- Boot Sequence ---------- */
/* Exit dissolve length — must stay in sync with the .boot transition in CSS. */
const BOOT_EXIT_MS = 900;

const Boot = ({ lines, onDone, enabled }) => {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [gone, setGone] = useState(!enabled);
  /* The veil unmounts itself only after the dissolve has finished. If the parent
     removed it the moment onDone fired, the exit transition would never render. */
  const [finished, setFinished] = useState(!enabled);

  useEffect(() => {
    if (!enabled) { setGone(true); setFinished(true); onDone && onDone(); return; }
    const total = lines.length;
    let i = 0;
    let timer = 0;
    let exitTimer = 0;
    const step = () => {
      if (i < total) {
        setIdx(i + 1);
        setProgress(Math.round(((i + 1) / total) * 100));
        i++;
        /* Deterministic, gently decelerating cadence. Random jitter read as stutter. */
        timer = setTimeout(step, 180 + i * 26);
      } else {
        /* hold on the full bar for a beat, then dissolve */
        timer = setTimeout(() => {
          setGone(true);
          /* hero starts rising now, underneath — the two crossfade */
          onDone && onDone();
          exitTimer = setTimeout(() => setFinished(true), BOOT_EXIT_MS);
        }, 520);
      }
    };
    timer = setTimeout(step, 260);
    return () => { clearTimeout(timer); clearTimeout(exitTimer); };
  }, [enabled]);

  if (finished) return null;
  return (
    <div className={`boot ${gone ? "gone" : ""}`}>
      <div className="boot-box">
        <div className="header">PORTFOLIO.OS // BOOTING</div>
        {lines.slice(0, idx).map((l, i) => (
          <div key={i} className="boot-line">
            <span className="ok">{l.match(/\[[^\]]+\]/)?.[0]}</span>{l.replace(/\[[^\]]+\]/, "")}
          </div>
        ))}
        {idx < lines.length && <div className="boot-line" style={{ color: "var(--fg-faint)" }}>[ .. ] working...</div>}
        <div className="boot-bar"><div className="fill" style={{ width: `${progress}%` }} /></div>
      </div>
    </div>
  );
};

/* Animated counter */
const AnimatedNumber = ({ target }) => {
  const [val, setVal] = useState(target);
  const ref = useRef(null);
  const match = String(target).match(/^([<\-]?)(\d+(?:\.\d+)?)(.*)$/);

  useEffect(() => {
    if (!match) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const prefix = match[1], end = parseFloat(match[2]), suffix = match[3];
        const duration = 1100;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          const cur = end * eased;
          const display = Number.isInteger(end) ? Math.round(cur) : cur.toFixed(1);
          setVal(`${prefix}${display}${suffix}`);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return <span ref={ref}>{val}</span>;
};

const SmoothCollapse = ({ open, children, className = "" }) => {
  const [mounted, setMounted] = useState(open);
  const boxRef = useRef(null);
  const animationRef = useRef(null);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !mounted) return;
    animationRef.current?.cancel();
    clearTimeout(closeTimerRef.current);

    const contentHeight = box.firstElementChild?.scrollHeight || 0;
    if (open) {
      box.style.height = "0px";
      box.style.opacity = "0";
      box.style.transform = "translateY(-6px)";
      animationRef.current = box.animate(
        [
          { height: "0px", opacity: 0, transform: "translateY(-6px)" },
          { height: `${contentHeight}px`, opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 360, easing: "cubic-bezier(0.22, 0.85, 0.25, 1)", fill: "forwards" }
      );
      animationRef.current.onfinish = () => {
        box.style.height = "auto";
        box.style.opacity = "1";
        box.style.transform = "translateY(0)";
      };
      return;
    }

    const currentHeight = box.getBoundingClientRect().height || contentHeight;
    animationRef.current = box.animate(
      [
        { height: `${currentHeight}px`, opacity: 1, transform: "translateY(0)" },
        { height: "0px", opacity: 0, transform: "translateY(-6px)" },
      ],
      { duration: 300, easing: "cubic-bezier(0.45, 0, 0.2, 1)", fill: "forwards" }
    );
    closeTimerRef.current = setTimeout(() => setMounted(false), 300);
    return () => {
      clearTimeout(closeTimerRef.current);
    };
  }, [open, mounted]);

  if (!mounted) return null;
  return (
    <div ref={boxRef} className={`smooth-collapse ${className}`}>
      <div className="smooth-collapse-inner">{children}</div>
    </div>
  );
};

/* ---------- About ---------- */
/* ---------- 3D avatar in About card ---------- */
const AboutScene3D = () => {
  const mountRef = React.useRef(null);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !window.mountThreeScene) return;
    return window.mountThreeScene(mount, (T) => {

    const W = () => mount.clientWidth;
    const H = () => mount.clientHeight;

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(44, W() / H(), 0.1, 100);
    camera.position.set(0, 0.08, W() < 520 ? 3.38 : 2.95);

    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1.6), 2));
    renderer.setSize(W(), H());
    renderer.setClearColor(0, 0);
    mount.appendChild(renderer.domElement);

    const getAccent = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7dff9e';

    const accentColor = () => new T.Color(getAccent());
    const lineMat = (opacity = 0.78) =>
      new T.LineBasicMaterial({ color: accentColor(), transparent: true, opacity });
    const fillMat = (opacity = 0.16, wireframe = false) =>
      new T.MeshBasicMaterial({ color: accentColor(), transparent: true, opacity, wireframe });

    const group = new T.Group();
    group.scale.setScalar(W() < 520 ? 1.08 : 1.36);
    scene.add(group);

    const workstationParts = [];
    const codeLines = [];
    const floaters = [];
    const pulseLights = [];
    const wifiArcs = [];

    const addPart = (part, track = true) => {
      if (track) workstationParts.push(part);
      group.add(part);
      return part;
    };
    const addWire = (mesh, opacity = 0.65) => {
      const edges = new T.LineSegments(new T.EdgesGeometry(mesh.geometry), lineMat(opacity));
      mesh.add(edges);
      workstationParts.push(edges);
      return edges;
    };
    const addMesh = (geo, opacity = 0.14, wireOpacity = 0.72) => {
      const mesh = addPart(new T.Mesh(geo, fillMat(opacity)));
      addWire(mesh, wireOpacity);
      return mesh;
    };
    const addLine = (from, to, opacity = 0.28) => {
      const geo = new T.BufferGeometry().setFromPoints([new T.Vector3(...from), new T.Vector3(...to)]);
      const line = new T.Line(geo, lineMat(opacity));
      workstationParts.push(line);
      group.add(line);
      return line;
    };

    const floor = addMesh(new T.BoxGeometry(2.25, 0.035, 1.05), 0.04, 0.16);
    floor.position.set(0, -0.58, 0);

    const pcScreen = addMesh(new T.BoxGeometry(0.86, 0.5, 0.04), 0.09, 0.86);
    pcScreen.position.set(0, 0.02, 0.02);
    const pcStand = addMesh(new T.CylinderGeometry(0.018, 0.024, 0.36, 8), 0.12, 0.58);
    pcStand.position.set(0, -0.34, 0.04);
    const pcBase = addMesh(new T.BoxGeometry(0.42, 0.035, 0.24), 0.08, 0.48);
    pcBase.position.set(0, -0.52, 0.08);
    const keyboard = addMesh(new T.BoxGeometry(0.66, 0.035, 0.2), 0.08, 0.48);
    keyboard.position.set(0, -0.5, 0.36);
    keyboard.rotation.x = -0.18;

    [-0.08, 0.04, 0.16].forEach((y, i) => {
      const line = addMesh(new T.BoxGeometry(0.46 - i * 0.08, 0.014, 0.01), 0.28, 0.72);
      line.position.set(-0.03, y, 0.055);
      codeLines.push(line);
    });

    for (let i = 0; i < 4; i++) {
      const rack = addMesh(new T.BoxGeometry(0.42, 0.12, 0.38), 0.1, 0.66);
      rack.position.set(-0.82, -0.43 + i * 0.145, 0.03);
      rack.rotation.y = 0.2;
      const led = addPart(new T.Mesh(new T.SphereGeometry(0.022, 8, 8), fillMat(0.86, true)));
      led.position.set(-0.99, -0.42 + i * 0.145, 0.22);
      led.userData.phase = i * 0.8;
      pulseLights.push(led);
    }

    const laptopPositions = [
      [0.74, -0.42, 0.28, -0.28],
      [1.02, -0.18, 0.02, -0.48],
      [0.72, 0.05, -0.22, -0.18],
    ];
    laptopPositions.forEach(([x, y, z, ry], i) => {
      const baseLap = addMesh(new T.BoxGeometry(0.34, 0.03, 0.22), 0.08, 0.5);
      baseLap.position.set(x, y, z + 0.12);
      baseLap.rotation.set(-0.2, ry, 0);
      const screenLap = addMesh(new T.BoxGeometry(0.32, 0.22, 0.028), 0.08, 0.66);
      screenLap.position.set(x, y + 0.14, z);
      screenLap.rotation.set(-0.04, ry, 0);
      screenLap.userData.baseY = screenLap.position.y;
      screenLap.userData.phase = i * 0.7;
      floaters.push(screenLap);
    });

    const router = addMesh(new T.BoxGeometry(0.42, 0.08, 0.22), 0.12, 0.74);
    router.position.set(0, 0.58, 0.02);
    const antennaA = addMesh(new T.CylinderGeometry(0.01, 0.01, 0.32, 8), 0.12, 0.7);
    antennaA.position.set(-0.14, 0.74, 0.02);
    antennaA.rotation.z = -0.34;
    const antennaB = addMesh(new T.CylinderGeometry(0.01, 0.01, 0.32, 8), 0.12, 0.7);
    antennaB.position.set(0.14, 0.74, 0.02);
    antennaB.rotation.z = 0.34;

    [0.24, 0.38, 0.52].forEach((radius, i) => {
      const arc = addPart(new T.Mesh(new T.TorusGeometry(radius, 0.006, 8, 64, Math.PI), fillMat(0.24 - i * 0.04, true)));
      arc.position.set(0, 0.61, 0.02);
      arc.rotation.set(0, 0, Math.PI);
      arc.scale.y = 0.42;
      arc.userData.phase = i * 0.7;
      wifiArcs.push(arc);
    });

    const hub = addPart(new T.Mesh(new T.SphereGeometry(0.04, 10, 10), fillMat(0.78, true)));
    hub.position.set(0, -0.23, 0.22);
    pulseLights.push(hub);

    addLine([-0.67, -0.2, 0.18], [0, -0.23, 0.22], 0.38);
    addLine([0.34, -0.18, 0.16], [0, -0.23, 0.22], 0.34);
    addLine([0, 0.26, 0.04], [0, 0.54, 0.04], 0.34);
    addLine([0.16, -0.23, 0.22], [0.68, -0.3, 0.28], 0.28);
    addLine([0.16, -0.1, 0.15], [0.9, -0.05, 0.04], 0.24);
    addLine([0.12, 0.04, 0.08], [0.64, 0.14, -0.14], 0.24);

    const gridHelper = new T.GridHelper(2.8, 10, accentColor(), accentColor());
    gridHelper.position.y = -0.58;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.12;
    scene.add(gridHelper);

    /* drag rotation */
    let autoRot = 0;
    let manualY = 0, manualX = 0;
    let dragging = false, lastX = 0, lastY = 0;

    const onDown = (e) => { dragging = true; lastX = e.clientX || e.touches?.[0]?.clientX; lastY = e.clientY || e.touches?.[0]?.clientY; mount.style.cursor = 'grabbing'; };
    const onUp   = () => { dragging = false; mount.style.cursor = 'grab'; };
    const onMove = (e) => {
      if (!dragging) return;
      const cx = e.clientX || e.touches?.[0]?.clientX;
      const cy = e.clientY || e.touches?.[0]?.clientY;
      manualY += (cx - lastX) * 0.012;
      manualX += (cy - lastY) * 0.008;
      manualX = Math.max(-0.5, Math.min(0.5, manualX));
      lastX = cx; lastY = cy;
    };
    mount.addEventListener('mousedown', onDown);
    mount.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });

    let fc = 0;
    const animate = () => {
      autoRot += 0.006;
      fc++;
      /* slow drift back to center when not dragging */
      if (!dragging) { manualX *= 0.97; }
      group.rotation.y = -0.12 + Math.sin(autoRot * 0.45) * 0.08 + manualY;
      group.rotation.x = Math.sin(autoRot * 0.3) * 0.05 + manualX;
      floaters.forEach((part, i) => {
        const baseY = part.userData.baseY ?? part.position.y;
        part.position.y = baseY + Math.sin(autoRot * 1.6 + (part.userData.phase || i)) * 0.018;
      });
      pulseLights.forEach((light, i) => {
        const scale = 0.8 + Math.sin(autoRot * 4 + (light.userData.phase || i)) * 0.22;
        light.scale.setScalar(scale);
      });
      wifiArcs.forEach((arc, i) => {
        arc.material.opacity = 0.16 + Math.sin(autoRot * 2.4 + (arc.userData.phase || i)) * 0.06;
      });
      codeLines.forEach((line, i) => {
        line.scale.x = 0.88 + Math.sin(autoRot * 2 + i) * 0.08;
      });

      /* refresh accent every 60 frames */
      if (fc % 60 === 0) {
        const c = new T.Color(getAccent());
        workstationParts.forEach(m => {
          if (m.material && m.material.color) m.material.color.set(c);
        });
        gridHelper.material.color.set(c);
      }

      renderer.render(scene, camera);
    };
    const stopLoop = window.rafScene(mount, animate);

    const onResize = () => {
      camera.aspect = W() / H();
      camera.position.z = W() < 520 ? 3.38 : 2.95;
      group.scale.setScalar(W() < 520 ? 1.08 : 1.36);
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };
    window.addEventListener('resize', onResize);

    return () => {
      stopLoop();
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
    });
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '240px', cursor: 'grab', margin: '12px 0 14px', border: '1px solid var(--line)' }}
    />
  );
};

const AsciiPortrait = () => <AboutScene3D />;

const About = ({ t, profile }) => (
  <section id="about" className="section">
    <div className="section-head">
      <h2 className="label">{t.sectionLabels.about}</h2>
      <div className="cmd">{t.about.cmd}</div>
    </div>
    <div className="about-grid">
      <Reveal>
        <div className="about-text">
          <h2>{t.about.title}</h2>
          {t.about.body.map((p, i) => <p key={i}>{p}</p>)}
          <div className="about-tags">
            {t.about.tags.map(tag => <span key={tag}>{tag}</span>)}
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.15}>
        <div className="about-card">
          <div className="card-head">// system_info</div>
          <AsciiPortrait />
          <div className="row"><span className="k">user</span><span className="v">vladislav</span></div>
          <div className="row"><span className="k">role</span><span className="v">fullstack_dev</span></div>
          <div className="row"><span className="k">uptime</span><span className="v">{profile.years}y+</span></div>
          <div className="row"><span className="k">github</span><span className="v"><a href={profile.github} target="_blank" rel="noreferrer">{profile.handle}</a></span></div>
          <div className="row"><span className="k">status</span><span className="v" style={{ color: "var(--accent)" }}>online</span></div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ---------- Stack (all-visible categorized grid) ---------- */
const STACK_ICONS = {
  "frontend/": "◈", "mobile/": "◉", "backend/": "◆",
  "databases/": "◇", "devops/": "▣", "integrations/": "⬡", "tools/": "◎",
};

const STACK_LABELS = {
  "frontend/": "UI",
  "mobile/": "MB",
  "backend/": "API",
  "databases/": "DB",
  "devops/": "OPS",
  "integrations/": "INT",
  "tools/": "TL",
};

const STACK_META = {
  "frontend/": { n: "01", role: "interfaces", hint: "web apps / animation / 3D UI" },
  "mobile/": { n: "02", role: "mobile", hint: "cross-platform apps" },
  "backend/": { n: "03", role: "server", hint: "API / realtime / auth" },
  "databases/": { n: "04", role: "data", hint: "storage / cache / search" },
  "devops/": { n: "05", role: "shipping", hint: "deploy / CI / VPS" },
  "integrations/": { n: "06", role: "services", hint: "payments / AI / messaging" },
  "tools/": { n: "07", role: "workflow", hint: "design / debug / handoff" },
};

const Stack = ({ t }) => (
  <section id="stack" className="section">
    <div className="section-head">
      <h2 className="label">{t.sectionLabels.stack}</h2>
      <div className="cmd">{t.stack.cmd}</div>
    </div>
    <Reveal>
      <div className="stack-console">
        <div className="stack-console-head">
          <span className="stack-dot is-live" />
          <span>runtime.stack</span>
          <span className="stack-head-path">~/production/toolchain</span>
        </div>
        <div className="stack-summary">
          <div><span className="stack-summary-k">primary</span><span className="stack-summary-v">React / Node / Three.js</span></div>
          <div><span className="stack-summary-k">mode</span><span className="stack-summary-v">fullstack + mobile</span></div>
          <div><span className="stack-summary-k">deploy</span><span className="stack-summary-v">Docker / VPS / CI</span></div>
        </div>
        <div className="stack-map">
          {t.stack.groups.map((g, gi) => {
            const meta = STACK_META[g.name] || { n: String(gi + 1).padStart(2, "0"), role: g.name.replace("/", ""), hint: "production tools" };
            return (
              <article key={g.name} className="stack-card" style={{ animationDelay: `${gi * 0.05}s` }}>
                <div className="stack-card-top">
                  <span className="stack-index">{meta.n}</span>
                  <span className="stack-icon">{STACK_LABELS[g.name] || "SK"}</span>
                  <span className="stack-count">{g.items.length}</span>
                </div>
                <div className="stack-card-title">
                  <span>{g.name}</span>
                  <b>{meta.role}</b>
                </div>
                <div className="stack-card-hint">{meta.hint}</div>
                <div className="stack-items">
                  {g.items.map((item, ii) => (
                    <span key={item} className="stack-token" style={{ animationDelay: `${gi * 0.04 + ii * 0.015}s` }}>
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
        <div className="stack-flow">
          <span>brief</span><i /><span>prototype</span><i /><span>api</span><i /><span>deploy</span>
        </div>
      </div>
    </Reveal>
  </section>
);

/* ---------- Cases ---------- */
const CaseCard = ({ c, open, onToggle }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const card = cardRef.current;
    if (!card) return;

    const scrollToHeader = () => {
      const rect = card.getBoundingClientRect();
      const scrollPadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 56;
      const targetTop = Math.max(12, scrollPadding + 12);
      window.scrollTo({
        top: Math.max(0, window.scrollY + rect.top - targetTop),
        behavior: "smooth",
      });
    };

    const raf = requestAnimationFrame(scrollToHeader);
    const settleTimer = setTimeout(scrollToHeader, 380);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settleTimer);
    };
  }, [open]);

  return (
    <div ref={cardRef} className={`case-card case-${c.id}`}>
      <div className="case-head">
        <div className="code">{c.code}</div>
        <div>
          <h3 className="title">
            <button
              type="button"
              className="case-toggle"
              aria-expanded={open}
              aria-controls={`case-body-${c.id}`}
              onClick={onToggle}
            >
              {c.name}
            </button>
          </h3>
          <div className="case-kind">{c.kind}</div>
        </div>
        <div className="meta">
          <span>{c.role}</span>
          <span className="case-sign" aria-hidden="true">{open ? "[ − ]" : "[ + ]"}</span>
        </div>
      </div>
      <SmoothCollapse open={open} className="case-collapse">
        <div id={`case-body-${c.id}`} className="case-body">
          <div>
            {c.context && (
              <>
                <h4>// task</h4>
                <p className="case-context">{c.context}</p>
              </>
            )}
            <h4>// solution</h4>
            <p className="summary">{c.summary}</p>
            <h4>// features</h4>
            <ul className="features">
              {c.features.map(f => <li key={f}>{f}</li>)}
            </ul>
            <h4>// stack</h4>
            <div className="case-stack">
              {c.stack.map(s => <span key={s}>{s}</span>)}
            </div>
            {c.links && (c.links.live || c.links.repo) && (
              <div className="case-links">
                {c.links.live && (
                  <a href={c.links.live} target="_blank" rel="noreferrer" className="is-live">
                    <b>↗</b> {c.links.liveLabel || "live"}
                  </a>
                )}
                {c.links.repo && (
                  <a href={c.links.repo} target="_blank" rel="noreferrer">
                    <b>{"</>"}</b> source
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="case-metrics">
            {c.metrics.map(m => (
              <div key={m.v} className="metric">
                <div className="k"><AnimatedNumber target={m.k} /></div>
                <div className="v">{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      </SmoothCollapse>
    </div>
  );
};

/* ---------- Process ---------- */
const Process = ({ t }) => {
  if (!t.process) return null;
  return (
  <section id="process" className="section">
    <div className="section-head">
      <h2 className="label">{(t.sectionLabels && t.sectionLabels.process) || "05 / PROCESS"}</h2>
      <div className="cmd">{t.process.cmd}</div>
    </div>
    <Reveal>
      <div className="process">
        {t.process.steps.map((s, i) => (
          <div key={s.n} className="step">
            <div className="num">STEP / {s.n}</div>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
            <div className="tools"><b>→</b> {s.tools}</div>
            <div className="arrow">▸</div>
          </div>
        ))}
      </div>
    </Reveal>
  </section>
  );
};

const Cases = ({ t }) => {
  const [openIdx, setOpenIdx] = useState(-1);
  return (
    <section id="cases" className="section">
      <div className="section-head">
        <h2 className="label">{t.sectionLabels.cases}</h2>
        <div className="cmd">ls -la ./cases</div>
      </div>
      <div className="cases">
        {t.cases.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.06}>
            <CaseCard c={c} open={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/* ---------- Lab (open-source pet projects) ---------- */
const Lab = ({ t }) => {
  if (!t.lab) return null;
  return (
    <section id="lab" className="section">
      <div className="section-head">
        <h2 className="label">{(t.sectionLabels && t.sectionLabels.lab) || "03 / LAB"}</h2>
        <div className="cmd">{t.lab.cmd}</div>
      </div>
      <Reveal>
        <p className="lab-note">{t.lab.note}</p>
        <div className="lab-grid">
          {t.lab.items.map((it, i) => (
            <article key={it.name} className="lab-card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="lab-card-top">
                <span className="lab-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="lab-lang">{it.lang}</span>
              </div>
              <h3 className="lab-name">{it.name}</h3>
              <div className="lab-kind">{it.kind}</div>
              <p className="lab-desc">{it.desc}</p>
              <div className="lab-tags">
                {it.tags.map(tag => <span key={tag}>{tag}</span>)}
              </div>
              <div className="lab-links">
                {it.live && <a href={it.live} target="_blank" rel="noreferrer" className="is-live"><b>↗</b> live</a>}
                {it.repo && <a href={it.repo} target="_blank" rel="noreferrer"><b>{"</>"}</b> source</a>}
              </div>
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  );
};

/* ---------- Timeline ---------- */
const shortHash = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h.toString(16).slice(0, 7);
};

const Timeline = ({ t }) => (
  <section id="timeline" className="section">
    <div className="section-head">
      <h2 className="label">{t.sectionLabels.timeline}</h2>
      <div className="cmd">git log --career</div>
    </div>
    <Reveal>
      <div className="gitlog">
        {t.timeline.map((row, i) => (
          <article key={i} className={`commit ${i === 0 ? "is-head" : ""}`}>
            <div className="commit-rail" aria-hidden="true"><span className="node" /></div>
            <div className="commit-body">
              <div className="commit-meta">
                <span className="hash">{shortHash(row.title + row.org)}</span>
                <span className="when">{row.when}</span>
                {i === 0 && <span className="head-tag">HEAD</span>}
              </div>
              <h3 className="commit-title">
                {row.title}<span className="org"> — {row.org}</span>
              </h3>
              {row.summary && <p className="commit-summary">{row.summary}</p>}
              {row.items && (
                <ul className="commit-items">
                  {row.items.map(item => <li key={item}>{item}</li>)}
                </ul>
              )}
              {row.stack && (
                <div className="commit-stack">
                  {row.stack.map(s => <span key={s}>{s}</span>)}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </Reveal>
  </section>
);

/* ---------- Contact ---------- */
const Contact = ({ t, profile }) => {
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  /* Spam trap: bots fill every field they find, humans never see this one.
     FormSubmit discards any submission where _honey is non-empty. */
  const [honey, setHoney] = useState("");
  const onChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const onSend = async (e) => {
    e.preventDefault();
    if (sending) return;
    /* say why nothing happened instead of silently ignoring the click */
    if (!form.name || !form.email || !form.msg) {
      setSent(false);
      setError(t.contact.incomplete);
      return;
    }

    setSending(true);
    setSent(false);
    setError("");

    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("email", form.email);
    payload.append("message", form.msg);
    payload.append("_subject", `Portfolio inquiry from ${form.name}`);
    payload.append("_template", "table");
    payload.append("_captcha", "false");
    payload.append("_honey", honey);

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${profile.email}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload,
      });
      /* FormSubmit answers 200 with {"success":"false"} for an unactivated form
         and other soft failures, so response.ok alone is not proof of delivery.
         Reporting success here would silently swallow real enquiries. */
      const data = await response.json().catch(() => null);
      if (!response.ok || !data || String(data.success) !== "true") {
        throw new Error(data && data.message ? data.message : "FormSubmit rejected the submission");
      }
      setSent(true);
      setForm({ name: "", email: "", msg: "" });
    } catch (err) {
      console.warn("Contact form submission failed:", err && err.message);
      setError(t.contact.error);
    } finally {
      setSending(false);
    }
  };
  const mailtoFallback =
    `mailto:${profile.email}` +
    `?subject=${encodeURIComponent(`Portfolio inquiry from ${form.name || "site visitor"}`)}` +
    `&body=${encodeURIComponent(`${form.msg}\n\n— ${form.name}\n${form.email}`)}`;

  return (
    <section id="contact" className="section">
      <div className="section-head">
        <h2 className="label">{t.sectionLabels.contact}</h2>
        <div className="cmd">{t.contact.cmd}</div>
      </div>
      <div className="contact-grid">
        <Reveal>
          <div className="contact-text">
            <h2>{t.contact.title}</h2>
            <p>{t.contact.body}</p>
            <div className="contact-links">
              <a href={`mailto:${profile.email}`}><span className="k">email</span><span className="v">{profile.email}</span></a>
              <a href={`https://t.me/${profile.telegram.replace("@","")}`} target="_blank" rel="noreferrer"><span className="k">telegram</span><span className="v">{profile.telegram}</span></a>
              <a href={`https://wa.me/${(profile.whatsapp||"").replace(/\D/g,"")}`} target="_blank" rel="noreferrer"><span className="k">whatsapp</span><span className="v">{profile.whatsapp || profile.telegram}</span></a>
              <a href={profile.github} target="_blank" rel="noreferrer"><span className="k">github</span><span className="v">{profile.handle}</span></a>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <form className="term" onSubmit={onSend}>
            <div className="term-head">
              <div className="dots"><i /><i /><i /></div>
              <span>bash — contact@vlad ~ 80×24</span>
            </div>
            <div className="term-body">
              <div className="line"><span className="prompt">$ </span>./contact --new</div>
              <div className="dim">// заполните поля и нажмите send</div>

              <label>› name</label>
              <input type="text" name="name" placeholder={t.contact.fields.name} value={form.name} onChange={onChange("name")} />

              <label>› email</label>
              <input type="email" name="email" placeholder={t.contact.fields.email} value={form.email} onChange={onChange("email")} />

              <label>› message</label>
              <textarea rows={4} name="message" placeholder={t.contact.fields.msg} value={form.msg} onChange={onChange("msg")} />

              <input
                type="text"
                name="_honey"
                className="honeypot"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honey}
                onChange={(e) => setHoney(e.target.value)}
              />

              <div className="send-row">
                <span style={{ color: "var(--fg-faint)", fontSize: 12 }}>{sending ? "transmitting..." : "press enter to transmit"}</span>
                <button className="send-btn" type="submit" disabled={sending}>{sending ? "sending..." : t.contact.send}</button>
              </div>
              {/* announced to screen readers as soon as it changes */}
              <div className="form-status" role="status" aria-live="polite">
                {sent && <div className="success">{t.contact.success}</div>}
                {error && (
                  <div className="form-error">
                    {error}
                    {/* no enquiry should die because a third-party service is down:
                        hand the visitor their own text, ready to send */}
                    <a className="form-fallback" href={mailtoFallback}>{t.contact.fallback}</a>
                  </div>
                )}
              </div>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
};

Object.assign(window, { Reveal, Boot, About, Stack, Cases, Lab, Process, Timeline, Contact, AnimatedNumber });
