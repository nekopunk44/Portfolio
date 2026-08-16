/* Mockup components for cases */

const CASE_VIDEO_SOURCES = {
  "villa-jaconda": [
    { src: "../assets/videos/villa_jaconda.demo.mp4?v=2", type: "video/mp4" },
  ],
  avtotime: [
    { src: "../assets/videos/avtotime.demo.mp4?v=2", type: "video/mp4" },
  ],
};

const CaseVideo = ({ sources, label, className = "", children }) => {
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const videoRef = React.useRef(null);

  const markReady = (event) => {
    const video = event.currentTarget;
    video.play().catch(() => {});
    setReady(true);
  };

  React.useEffect(() => {
    if (!ready || failed || !videoRef.current) return;
    videoRef.current.play().catch(() => {});
  }, [ready, failed]);

  return (
    <div className={`case-video-shell ${className} ${ready && !failed ? "is-playing" : "is-fallback"}`}>
      {!failed && (
        <video
          ref={videoRef}
          className="case-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={label}
          onCanPlay={markReady}
          onError={() => setFailed(true)}
        >
          {sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
      )}
      <div className="case-video-fallback">
        {children}
      </div>
    </div>
  );
};

const VillaJacondaMockup = () => (
  <div className="mockup-phone mockup-phone-video">
    <div className="screen">
      <CaseVideo sources={CASE_VIDEO_SOURCES["villa-jaconda"]} label="Villa Jaconda app demo">
        <div className="mk-status">
          <span>9:41</span>
          <span>5G 100%</span>
        </div>
        <div className="mk-title">Villa Jaconda</div>
        <div className="mk-sub">Сб, 5 июня - 2 гостя</div>
        <div className="mk-card">
          <div style={{fontSize: 9, opacity: 0.8}}>АКЦИЯ -20%</div>
          <div style={{fontSize: 13, marginTop: 2}}>Кэшбэк на июнь</div>
        </div>
        <div className="mk-row"><span>Главный дом</span><b>$240/ночь</b></div>
        <div className="mk-row"><span>Домик у озера</span><b>$180/ночь</b></div>
        <div className="mk-row"><span>Гостевой</span><b>$95/ночь</b></div>
        <div className="mk-tabs">
          <div className="active">дома</div>
          <div>события</div>
          <div>профиль</div>
        </div>
      </CaseVideo>
    </div>
  </div>
);

const AvtotimeMockup = () => (
  <div className="mockup-desktop">
    <div className="desktop-monitor">
      <div className="desktop-camera" />
      <div className="desktop-screen">
        <div className="mockup-browser mockup-browser-clean">
          <div className="viewport viewport-video">
            <CaseVideo sources={CASE_VIDEO_SOURCES.avtotime} label="Avtotime platform demo" className="desktop-video">
              <div className="mk-browser-fallback">
                <div className="mk-hero">Avtotime - <b>все для авто</b></div>
                <div className="mk-chips">
                  <span>авто</span><span>запчасти</span><span>сервисы</span><span>курсы</span><span>помощь</span>
                </div>
                <div className="mk-grid">
                  <div className="mk-tile"><span>BMW M3</span><b>$42,000</b></div>
                  <div className="mk-tile"><span>Mercedes C-Class</span><b>$38,500</b></div>
                  <div className="mk-tile"><span>Audi RS6</span><b>$89,900</b></div>
                  <div className="mk-tile"><span>Шиномонтаж</span><b>от $25</b></div>
                  <div className="mk-tile"><span>Автокурс</span><b>14 уроков</b></div>
                  <div className="mk-tile"><span>Эвакуатор</span><b>24/7</b></div>
                </div>
              </div>
            </CaseVideo>
          </div>
        </div>
      </div>
    </div>
    <div className="desktop-neck" />
    <div className="desktop-base">
      <span />
    </div>
  </div>
);

window.CaseMockups = {
  "villa-jaconda": VillaJacondaMockup,
  "avtotime": AvtotimeMockup,
};
