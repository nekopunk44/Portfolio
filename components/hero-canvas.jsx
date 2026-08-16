/* Hero background: matrix rain + dot grid — single merged RAF loop */

const HeroCanvas = ({ motionLevel = "high" }) => {
  const rainRef = React.useRef(null);
  const gridRef = React.useRef(null);
  const mouseRef = React.useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });

  React.useEffect(() => {
    const rainCanvas = rainRef.current;
    const gridCanvas = gridRef.current;
    if (!gridCanvas) return;

    const rainCtx = rainCanvas ? rainCanvas.getContext('2d') : null;
    const gridCtx = gridCanvas.getContext('2d');

    let w, h, dpr;
    let rainCols = [], rainDrops = [];
    const fontSize = 16;
    const chars = "01アカサタナ<>/\\{}#=*+-|";

    const resize = () => {
      dpr = 1; /* force dpr=1 for perf */
      w = gridCanvas.clientWidth;
      h = gridCanvas.clientHeight;

      if (rainCanvas) {
        rainCanvas.width  = w * dpr;
        rainCanvas.height = h * dpr;
        rainCtx.scale(dpr, dpr);
      }
      gridCanvas.width  = w * dpr;
      gridCanvas.height = h * dpr;
      gridCtx.scale(dpr, dpr);

      /* wider spacing = fewer columns = faster */
      rainCols = Math.floor(w / (fontSize * 1.8));
      rainDrops = Array.from({ length: rainCols }, () => Math.random() * -h);
    };
    resize();

    const onMove = (e) => {
      const r = gridCanvas.getBoundingClientRect();
      mouseRef.current.tx = (e.clientX - r.left) / r.width;
      mouseRef.current.ty = (e.clientY - r.top) / r.height;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('resize', resize);

    const getAccent = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7dff9e';

    let lastAccent = getAccent();
    let frameCount = 0;
    let t = 0;
    let rainFrame = 0;

    const draw = () => {
      t++;
      frameCount++;

      const accent = frameCount % 60 === 0 ? (lastAccent = getAccent()) : lastAccent;

      /* ── matrix rain (draw every 3rd frame to save CPU) ── */
      if (motionLevel !== 'low' && rainCtx) {
        rainFrame++;
        if (rainFrame % 3 === 0) {
          rainCtx.fillStyle = 'rgba(10,10,11,0.1)';
          rainCtx.fillRect(0, 0, w, h);
          rainCtx.font = `${fontSize}px JetBrains Mono, monospace`;
          for (let i = 0; i < rainCols; i++) {
            const ch = chars[Math.floor(Math.random() * chars.length)];
            const x  = i * fontSize * 1.8;
            const y  = rainDrops[i];
            rainCtx.globalAlpha = 0.75;
            rainCtx.fillStyle = accent;
            rainCtx.fillText(ch, x, y);
            rainCtx.globalAlpha = 0.2;
            rainCtx.fillText(ch, x, y - fontSize);
            rainCtx.globalAlpha = 1;
            rainDrops[i] += fontSize * (0.5 + Math.random() * 0.3);
            if (rainDrops[i] > h && Math.random() > 0.975) rainDrops[i] = Math.random() * -200;
          }
        }
      }

      /* ── dot grid with mouse parallax ── */
      gridCtx.clearRect(0, 0, w, h);

      /* smooth mouse lerp */
      mouseRef.current.x += (mouseRef.current.tx - mouseRef.current.x) * 0.07;
      mouseRef.current.y += (mouseRef.current.ty - mouseRef.current.y) * 0.07;
      const mx = mouseRef.current.x * w;
      const my = mouseRef.current.y * h;

      const spacing = 38;
      for (let x = 0; x < w + spacing; x += spacing) {
        for (let y = 0; y < h + spacing; y += spacing) {
          const dx = x - mx, dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const inf  = Math.max(0, 1 - dist / 240);
          const size = 1 + inf * 2;
          gridCtx.fillStyle = inf > 0.02 ? accent : '#2e2e32';
          gridCtx.globalAlpha = 0.22 + inf * 0.65;
          gridCtx.beginPath();
          gridCtx.arc(x + (dx / (dist || 1)) * inf * 7, y + (dy / (dist || 1)) * inf * 7, size, 0, Math.PI * 2);
          gridCtx.fill();
        }
      }
      gridCtx.globalAlpha = 1;

      /* scan line */
      const scanY = ((t * 1.6) % (h + 40)) - 20;
      const grad  = gridCtx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      grad.addColorStop(0, 'rgba(125,255,158,0)');
      grad.addColorStop(0.5, 'rgba(125,255,158,0.09)');
      grad.addColorStop(1, 'rgba(125,255,158,0)');
      gridCtx.fillStyle = grad;
      gridCtx.fillRect(0, scanY - 30, w, 60);

    };

    const stopLoop = window.rafScene(gridCanvas, draw);

    return () => {
      stopLoop();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, [motionLevel]);

  const canvasStyle = {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    pointerEvents: 'none',
  };

  return (
    <div className="hero-grid-canvas">
      {motionLevel !== 'low' && (
        <canvas ref={rainRef} style={{ ...canvasStyle, opacity: 0.18 }} />
      )}
      <canvas ref={gridRef} style={canvasStyle} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, var(--bg) 100%)', pointerEvents: 'none' }} />
    </div>
  );
};

window.HeroCanvas = HeroCanvas;
