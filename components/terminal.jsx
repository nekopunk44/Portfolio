/* Interactive CLI overlay - easter egg */

const { useState: useStateT, useEffect: useEffectT, useRef: useRefT } = React;

const InteractiveTerminal = ({ open, onClose, profile, lang }) => {
  const [history, setHistory] = useStateT([
    { type: "sys", text: "portfolio.os v2.26 — interactive shell" },
    { type: "sys", text: "type 'help' to see available commands. esc to close." },
    { type: "sys", text: "" },
  ]);
  const [input, setInput] = useStateT("");
  const [cmdHistory, setCmdHistory] = useStateT([]);
  const [cmdIdx, setCmdIdx] = useStateT(-1);
  const inputRef = useRefT(null);
  const bodyRef = useRefT(null);

  useEffectT(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [open]);

  useEffectT(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [history]);

  const commands = {
    help: () => [
      "available commands:",
      "  help        — this message",
      "  about       — who I am",
      "  stack       — tech stack summary",
      "  cases       — list projects",
      "  contact     — how to reach me",
      "  social      — telegram / github / email",
      "  whoami      — current user",
      "  date        — current date/time",
      "  clear       — clear terminal",
      "  sudo hire   — ;)",
      "  exit        — close terminal",
    ],
    about: () => [
      "vladislav · fullstack developer · 2+ years",
      "tiraspol, md · working remotely",
      "builds: web apps · mobile apps · 3d web scenes",
    ],
    stack: () => [
      "frontend:  react · next.js · typescript · three.js · tailwind",
      "mobile:    react native · expo · flutter",
      "backend:   node.js · nestjs · python/fastapi · postgres · mongodb",
      "devops:    docker · nginx · redis · github actions · vps",
    ],
    cases: () => [
      "case_01  villa-jaconda   · booking app (rn + node + stripe)",
      "case_02  avtotime        · social + marketplace (next + nest)",
      "case_03  studio-3d       · 3d showcase (three.js + r3f)",
    ],
    contact: () => [
      `email:    ${profile.email}`,
      `telegram: ${profile.telegram}`,
      `github:   ${profile.github}`,
      "scroll to ~/contact to open the form.",
    ],
    social: () => [
      `telegram: ${profile.telegram}`,
      `github:   ${profile.handle}`,
      `email:    ${profile.email}`,
    ],
    whoami: () => ["guest@portfolio.os"],
    date: () => [new Date().toString()],
    "sudo hire": () => [
      "[ OK ] authenticating...",
      "[ OK ] best decision today.",
      `→ drop me a line: ${profile.email}`,
    ],
    exit: () => { setTimeout(onClose, 200); return ["closing shell..."]; },
    clear: () => { setHistory([]); return null; },
    ls: () => ["about  cases  contact  stack  social  (try 'cases')"],
  };

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase();
    const next = [...history, { type: "cmd", text: `$ ${raw}` }];
    if (!cmd) { setHistory(next); return; }
    const handler = commands[cmd];
    if (handler) {
      const out = handler();
      if (out === null) return; // clear handled
      setHistory([...next, ...out.map(t => ({ type: "out", text: t })), { type: "out", text: "" }]);
    } else {
      setHistory([...next, { type: "err", text: `command not found: ${cmd}. try 'help'.` }, { type: "out", text: "" }]);
    }
    setCmdHistory([raw, ...cmdHistory.filter(x => x !== raw)].slice(0, 20));
    setCmdIdx(-1);
  };

  const onKey = (e) => {
    if (e.key === "Enter") { run(input); setInput(""); }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      const ni = Math.min(cmdIdx + 1, cmdHistory.length - 1);
      setCmdIdx(ni);
      if (cmdHistory[ni]) setInput(cmdHistory[ni]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const ni = Math.max(cmdIdx - 1, -1);
      setCmdIdx(ni);
      setInput(ni === -1 ? "" : cmdHistory[ni]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;
  return (
    <div className="term-overlay" onClick={(e) => e.target.classList.contains("term-overlay") && onClose()}>
      <div className="box">
        <div className="head">
          <div className="dots"><i/><i/><i/></div>
          <span>interactive shell — portfolio.os</span>
          <span className="close" onClick={onClose}>[ esc to close ]</span>
        </div>
        <div className="body" ref={bodyRef}>
          {history.map((h, i) => (
            <div key={i} className={`line ${h.type === "err" ? "err" : h.type === "sys" ? "dim" : h.type === "cmd" ? "" : ""}`}>
              {h.type === "cmd" ? <span className="prompt">{h.text}</span> : h.text}
            </div>
          ))}
        </div>
        <div className="input-row">
          <span>$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="type 'help'..."
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
};

window.InteractiveTerminal = InteractiveTerminal;
