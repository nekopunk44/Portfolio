/* FAQ and AI-powered intent analyzer */

const { useState: useStateF, useRef: useRefF, useEffect: useEffectF } = React;

/* ---------- FAQ ---------- */
const SmoothCollapseF = ({ open, children }) => {
  const [mounted, setMounted] = useStateF(open);
  const boxRef = useRefF(null);
  const animationRef = useRefF(null);
  const closeTimerRef = useRefF(null);

  useEffectF(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffectF(() => {
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
        { duration: 320, easing: "cubic-bezier(0.22, 0.85, 0.25, 1)", fill: "forwards" }
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
      { duration: 260, easing: "cubic-bezier(0.45, 0, 0.2, 1)", fill: "forwards" }
    );
    closeTimerRef.current = setTimeout(() => setMounted(false), 260);
    return () => {
      clearTimeout(closeTimerRef.current);
    };
  }, [open, mounted]);

  if (!mounted) return null;
  return (
    <div ref={boxRef} className="smooth-collapse faq-collapse">
      <div className="smooth-collapse-inner">{children}</div>
    </div>
  );
};

const FAQItem = ({ q, a, open, onToggle, idx }) => (
  <div style={{
    borderBottom: "1px solid var(--line)",
    padding: "0",
  }}>
    <button
      onClick={onToggle}
      style={{
        width: "100%",
        background: "transparent",
        border: "none",
        color: "var(--fg)",
        padding: "18px 0",
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 18,
        fontFamily: "var(--mono)",
        fontSize: 16,
      }}
    >
      <span style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <span style={{ color: "var(--fg-faint)", fontSize: 12, letterSpacing: "0.1em" }}>Q{String(idx + 1).padStart(2, "0")}</span>
        <span>{q}</span>
      </span>
      <span style={{ color: "var(--accent)", fontSize: 14 }}>{open ? "[ − ]" : "[ + ]"}</span>
    </button>
    <SmoothCollapseF open={open}>
      <div style={{
        color: "var(--fg-dim)",
        fontSize: 14,
        padding: "0 0 20px 48px",
        lineHeight: 1.6,
        maxWidth: "72ch",
      }}>
        <span style={{ color: "var(--accent)" }}>{"> "}</span>{a}
      </div>
    </SmoothCollapseF>
  </div>
);

const FAQ = ({ t }) => {
  const [openIdx, setOpenIdx] = useStateF(-1);
  if (!t.faq) return null;
  return (
    <section id="faq" className="section">
      <div className="section-head">
        <h2 className="label">{(t.sectionLabels && t.sectionLabels.faq) || "07 / FAQ"}</h2>
        <div className="cmd">{t.faq.cmd}</div>
      </div>
      <Reveal>
        <div style={{
          border: "1px solid var(--line)",
          background: "var(--bg-2)",
          padding: "0 28px",
        }}>
          {t.faq.items.map((it, i) => (
            <FAQItem
              key={i}
              idx={i}
              q={it.q}
              a={it.a}
              open={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
            />
          ))}
        </div>
      </Reveal>
    </section>
  );
};

/* ---------- AI Brief Analyzer (standalone section) ---------- */
const AIBriefSection = ({ lang }) => {
  const L = lang === "ru" ? {
    label: "AI / ОЦЕНКА",
    cmd: "./ai-estimate --model=haiku-4.5",
    title: "Опишите задачу — получите оценку за 5 секунд",
    sub: "AI-ассистент разберёт описание и предложит формат, стек, срок и ориентировочный бюджет. Это не коммерческое предложение — финальные цифры после брифа.",
    placeholder: "нужен сайт-визитка для архитектурного бюро с портфолио и формой заявки...",
    btn: "./estimate",
    btnLoading: "analyzing",
    min: "минимум 20 символов",
    chips: ["Лендинг стартапа", "Интернет-магазин", "Мобильное приложение", "3D-презентация", "Dashboard / админка"],
    chipLabel: "// или выберите пример:",
    rows: { type: "Формат", scope: "Объём", stack: "Стек", timeline: "Срок", budget: "Бюджет", next: "Дальше" },
    ok: "оценка готова",
    disclaimer: "приблизительные цифры. точные — после разговора.",
    err: "не удалось разобрать ответ. попробуйте ещё раз.",
    poweredBy: "powered by claude haiku 4.5 · без регистрации · без передачи данных",
  } : {
    label: "AI / ESTIMATE",
    cmd: "./ai-estimate --model=haiku-4.5",
    title: "Describe your task — get an estimate in 5 seconds",
    sub: "An AI assistant parses your brief and suggests format, stack, timeline and budget range. Not a binding quote — exact numbers come after the brief.",
    placeholder: "landing for an architecture studio with portfolio and contact form...",
    btn: "./estimate",
    btnLoading: "analyzing",
    min: "at least 20 chars",
    chips: ["Startup landing", "E-commerce", "Mobile app", "3D showcase", "Admin dashboard"],
    chipLabel: "// or pick an example:",
    rows: { type: "Format", scope: "Scope", stack: "Stack", timeline: "Timeline", budget: "Budget", next: "Next" },
    ok: "estimate ready",
    disclaimer: "ballpark figures. exact numbers after a call.",
    err: "couldn't parse the response. try again.",
    poweredBy: "powered by claude haiku 4.5 · no sign-up · no data kept",
  };

  const EXAMPLES_RU = {
    "Лендинг стартапа": "лендинг для AI-стартапа, одностраничник с hero, фичами, pricing и waitlist-формой. анимации, подключение к mailchimp.",
    "Интернет-магазин": "интернет-магазин одежды на 50 товаров, корзина, оплата картой, интеграция с crm и службами доставки.",
    "Мобильное приложение": "мобильное приложение для записи в барбершоп: авторизация, выбор мастера/времени, оплата, push-уведомления. iOS + Android.",
    "3D-презентация": "сайт-презентация промышленного оборудования с интерактивной 3D-моделью (поворот, разборка по узлам, анимация работы).",
    "Dashboard / админка": "админка для SaaS: графики метрик, управление пользователями, биллинг, роли, логи действий. подключение к готовому backend api.",
  };
  const EXAMPLES_EN = {
    "Startup landing": "landing for an AI startup, single page with hero, features, pricing and a waitlist form. animations, mailchimp integration.",
    "E-commerce": "clothing e-commerce with 50 products, cart, card payments, CRM and shipping integrations.",
    "Mobile app": "mobile app for barbershop booking: auth, master/time picker, payment, push notifications. iOS + Android.",
    "3D showcase": "industrial equipment presentation site with an interactive 3D model (rotate, exploded view, operation animation).",
    "Admin dashboard": "SaaS admin panel: metrics charts, user management, billing, roles, activity logs. connects to an existing backend api.",
  };
  const EXAMPLES = lang === "ru" ? EXAMPLES_RU : EXAMPLES_EN;

  const [brief, setBrief] = useStateF("");
  const [loading, setLoading] = useStateF(false);
  const [result, setResult] = useStateF(null);
  const [error, setError] = useStateF(null);

  const analyze = async () => {
    if (brief.trim().length < 20) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const systemPrompt = `You are a project-intake assistant for a fullstack developer (React, Next.js, React Native, Expo, Flutter, Three.js, Node.js/Express, ASP.NET Core/C#, Python/FastAPI, Socket.IO, Docker, Postgres, MongoDB, Redis). Analyze the client's brief and return STRICT JSON only (no markdown, no prose). Respond in ${lang === "ru" ? "Russian" : "English"}.

Schema:
{
  "type": "landing | corporate site | mobile app | 3d web | dashboard | marketplace | mvp | other",
  "scope": "short phrase about size (e.g. '5–7 screens', '~30 products')",
  "stack": ["tech1", "tech2", "tech3", "tech4"],
  "timeline": "X weeks",
  "budget": "$X – $Y",
  "next": "one sentence — recommended next step"
}

Realistic ranges: landing $400–1500 / 1–2w, corporate $1200–4000 / 3–5w, e-commerce $2000–6000 / 4–8w, mobile MVP $2500–8000 / 6–10w, 3d showcase $1500–5000 / 3–6w, dashboard $1500–5000 / 3–6w. Keep fields short (each field under 60 chars except stack array).`;

      const raw = await window.claude.complete({
        messages: [{ role: "user", content: `${systemPrompt}\n\n---\nClient brief:\n${brief}` }],
      });
      let jsonText = raw.trim();
      const match = jsonText.match(/\{[\s\S]*\}/);
      if (match) jsonText = match[0];
      const parsed = JSON.parse(jsonText);
      setResult(parsed);
    } catch (e) {
      setError(L.err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ai-estimate" className="section ai-section">
      <div className="section-head">
        <h2 className="label">{L.label}</h2>
        <div className="cmd">{L.cmd}</div>
      </div>

      <Reveal>
        <div className="ai-wrap">
          <div className="ai-title-row">
            <h2 className="ai-title">{L.title}</h2>
            <div className="ai-badge">
              <span className="ai-badge-dot" />
              <span>AI · LIVE</span>
            </div>
          </div>
          <p className="ai-sub">{L.sub}</p>

          <div className="ai-panel">
            <div className="ai-panel-head">
              <span className="ai-prompt">{">"}</span>
              <span className="ai-path">~/brief.txt</span>
              <span className="ai-len">{brief.length < 20 ? `${brief.length}/20 — ${L.min}` : `${brief.length} chars`}</span>
            </div>

            <textarea
              className="ai-textarea"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder={L.placeholder}
              rows={4}
            />

            <div className="ai-chips">
              <span className="ai-chips-label">{L.chipLabel}</span>
              {L.chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="ai-chip"
                  onClick={() => setBrief(EXAMPLES[c] || "")}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="ai-footer-row">
              <span className="ai-powered">{L.poweredBy}</span>
              <button
                className="ai-submit"
                onClick={analyze}
                disabled={loading || brief.trim().length < 20}
              >
                {loading ? <><LoadingDots label={L.btnLoading} /></> : <>{L.btn} <span className="ai-arrow">→</span></>}
              </button>
            </div>
          </div>

          {error && (
            <div className="ai-error">
              <span style={{ color: "var(--danger)" }}>[ ! ]</span> {error}
            </div>
          )}

          {result && (
            <div className="ai-result">
              <div className="ai-result-head">
                <span className="ai-ok">[ OK ]</span>
                <span className="ai-result-msg">{L.ok}</span>
              </div>
              <div className="ai-grid">
                <AICard k={L.rows.type} v={result.type} accent />
                <AICard k={L.rows.timeline} v={result.timeline} accent />
                <AICard k={L.rows.budget} v={result.budget} accent big />
                <AICard k={L.rows.scope} v={result.scope} />
                <AICard
                  k={L.rows.stack}
                  v={Array.isArray(result.stack) ? result.stack : [result.stack]}
                  chips
                />
                <AICard k={L.rows.next} v={result.next} wide />
              </div>
              <div className="ai-disclaimer">// {L.disclaimer}</div>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
};

const AICard = ({ k, v, accent, big, chips, wide }) => (
  <div className={`ai-card ${accent ? "is-accent" : ""} ${big ? "is-big" : ""} ${wide ? "is-wide" : ""}`}>
    <div className="ai-card-k">{k}</div>
    {chips ? (
      <div className="ai-card-chips">
        {v.map((item, i) => <span key={i} className="ai-stack-chip">{item}</span>)}
      </div>
    ) : (
      <div className="ai-card-v">{v}</div>
    )}
  </div>
);

const LoadingDots = ({ label }) => {
  const [dots, setDots] = useStateF("");
  useEffectF(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 280);
    return () => clearInterval(id);
  }, []);
  return <span>{label}{dots}</span>;
};

window.FAQ = FAQ;
window.AIBriefSection = AIBriefSection;
