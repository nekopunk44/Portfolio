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

const Studio3DScene = () => {
  const mountRef = React.useRef(null);
  const [activeModel, setActiveModel] = React.useState(0);
  const activeModelRef = React.useRef(0);

  const modelLabels = ["drone prototype", "sneaker product", "glass sculpture"];

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      activeModelRef.current = (activeModelRef.current + 1) % modelLabels.length;
      setActiveModel(activeModelRef.current);
    }, 12000);
    return () => window.clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !window.mountThreeScene) return;
    return window.mountThreeScene(mount, (T) => {
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 1.2, 4.55);

    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const getAccent = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7dff9e";

    const accentColor = new T.Color(getAccent());
    const darkMat = new T.MeshStandardMaterial({ color: 0x151820, roughness: 0.52, metalness: 0.55 });
    const panelMat = new T.MeshStandardMaterial({ color: 0x20232c, roughness: 0.44, metalness: 0.4 });
    const accentMat = new T.MeshStandardMaterial({
      color: accentColor,
      emissive: accentColor,
      emissiveIntensity: 0.35,
      roughness: 0.28,
      metalness: 0.2,
    });
    const glassMat = new T.MeshPhysicalMaterial({
      color: 0x10131a,
      roughness: 0.12,
      metalness: 0.25,
      transmission: 0.15,
      transparent: true,
      opacity: 0.72,
    });
    const wireMat = new T.LineBasicMaterial({ color: accentColor, transparent: true, opacity: 0.34 });

    const root = new T.Group();
    scene.add(root);

    const addEdges = (mesh, opacity = 0.28) => {
      const mat = wireMat.clone();
      mat.opacity = opacity;
      const edges = new T.LineSegments(new T.EdgesGeometry(mesh.geometry), mat);
      edges.position.copy(mesh.position);
      edges.rotation.copy(mesh.rotation);
      edges.scale.copy(mesh.scale);
      mesh.parent.add(edges);
      return edges;
    };

    const makePedestal = (parent) => {
      const base = new T.Mesh(new T.CylinderGeometry(0.62, 0.74, 0.13, 48), darkMat);
      base.position.set(0, -0.62, 0);
      parent.add(base);
      addEdges(base, 0.18);
      return base;
    };

    const drone = new T.Group();
    makePedestal(drone);
    drone.position.set(0, -0.02, 0);
    const droneBody = new T.Mesh(new T.IcosahedronGeometry(0.34, 1), panelMat);
    droneBody.scale.set(1.35, 0.55, 0.9);
    drone.add(droneBody);
    const droneGlass = new T.Mesh(new T.SphereGeometry(0.18, 32, 16), glassMat);
    droneGlass.scale.set(1.2, 0.45, 0.75);
    droneGlass.position.set(0.08, 0.08, 0.02);
    drone.add(droneGlass);
    const rotors = [];
    [[-0.74, 0.44], [0.74, 0.44], [-0.74, -0.44], [0.74, -0.44]].forEach(([x, z]) => {
      const arm = new T.Mesh(new T.BoxGeometry(0.82, 0.055, 0.055), darkMat);
      arm.position.set(x * 0.48, -0.02, z * 0.48);
      arm.rotation.y = Math.atan2(z, x);
      drone.add(arm);

      const rotor = new T.Group();
      rotor.position.set(x, 0.02, z);
      const ring = new T.Mesh(new T.TorusGeometry(0.2, 0.018, 10, 40), accentMat);
      ring.rotation.x = Math.PI / 2;
      rotor.add(ring);
      const bladeA = new T.Mesh(new T.BoxGeometry(0.42, 0.018, 0.045), glassMat);
      const bladeB = bladeA.clone();
      bladeB.rotation.y = Math.PI / 2;
      rotor.add(bladeA, bladeB);
      rotors.push(rotor);
      drone.add(rotor);
    });
    drone.children.forEach((child) => child.isMesh && addEdges(child, 0.24));
    root.add(drone);

    const sneaker = new T.Group();
    makePedestal(sneaker);
    sneaker.position.set(0, -0.02, 0);
    const sole = new T.Mesh(new T.CapsuleGeometry(0.23, 0.95, 8, 24), darkMat);
    sole.rotation.z = Math.PI / 2;
    sole.scale.set(1.05, 0.52, 0.34);
    sole.position.set(0, -0.1, 0);
    sneaker.add(sole);

    const upperShape = new T.Shape();
    upperShape.moveTo(-0.62, -0.02);
    upperShape.bezierCurveTo(-0.42, 0.26, -0.18, 0.38, 0.18, 0.3);
    upperShape.bezierCurveTo(0.52, 0.22, 0.66, 0.08, 0.72, -0.04);
    upperShape.lineTo(0.48, -0.18);
    upperShape.bezierCurveTo(0.12, -0.1, -0.28, -0.12, -0.66, -0.14);
    upperShape.closePath();
    const upperGeo = new T.ExtrudeGeometry(upperShape, {
      depth: 0.42,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 3,
    });
    upperGeo.center();
    const upper = new T.Mesh(upperGeo, panelMat);
    upper.position.set(0.02, 0.1, 0);
    sneaker.add(upper);

    const heel = new T.Mesh(new T.BoxGeometry(0.22, 0.48, 0.48), glassMat);
    heel.position.set(-0.48, 0.08, 0);
    heel.rotation.z = -0.18;
    sneaker.add(heel);
    const toeGlow = new T.Mesh(new T.TorusGeometry(0.23, 0.018, 10, 48), accentMat);
    toeGlow.position.set(0.48, 0.02, 0);
    toeGlow.rotation.y = Math.PI / 2;
    sneaker.add(toeGlow);
    [-0.22, -0.05, 0.12, 0.29].forEach((x, i) => {
      const lace = new T.Mesh(new T.BoxGeometry(0.24, 0.025, 0.035), accentMat);
      lace.position.set(x, 0.25 - i * 0.025, 0.22);
      lace.rotation.z = -0.24;
      sneaker.add(lace);
    });
    sneaker.children.forEach((child) => child.isMesh && addEdges(child, 0.22));
    root.add(sneaker);

    const sculpture = new T.Group();
    makePedestal(sculpture);
    sculpture.position.set(0, -0.02, 0);
    const crystal = new T.Mesh(new T.OctahedronGeometry(0.42, 1), glassMat);
    crystal.scale.set(0.75, 1.35, 0.75);
    sculpture.add(crystal);
    const haloA = new T.Mesh(new T.TorusGeometry(0.54, 0.018, 12, 80), accentMat);
    haloA.rotation.set(Math.PI / 2, 0.65, 0);
    const haloB = haloA.clone();
    haloB.rotation.set(1.08, -0.45, Math.PI / 2);
    const haloC = haloA.clone();
    haloC.rotation.set(0.55, 0.2, 0.9);
    sculpture.add(haloA, haloB, haloC);
    for (let i = 0; i < 8; i++) {
      const shard = new T.Mesh(new T.ConeGeometry(0.055, 0.32, 5), accentMat);
      const a = (i / 8) * Math.PI * 2;
      shard.position.set(Math.cos(a) * 0.58, Math.sin(i * 1.7) * 0.14, Math.sin(a) * 0.58);
      shard.rotation.set(Math.sin(a), 0, -a);
      sculpture.add(shard);
    }
    sculpture.children.forEach((child) => child.isMesh && addEdges(child, 0.22));
    root.add(sculpture);
    const showcaseModels = [drone, sneaker, sculpture];

    const grid = new T.GridHelper(4.8, 18, accentColor, accentColor);
    grid.position.y = -0.66;
    grid.material.transparent = true;
    grid.material.opacity = 0.12;
    scene.add(grid);

    scene.add(new T.AmbientLight(0xffffff, 0.55));
    const keyLight = new T.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    const rimLight = new T.PointLight(accentColor, 1.6, 8);
    rimLight.position.set(-2.8, 1.2, 2.6);
    scene.add(rimLight);

    let dragging = false;
    let lastX = 0;
    let targetY = 0;
    let targetX = 0.06;
    let zoom = 4.55;

    const pointer = (event) => event.touches?.[0] || event;
    const onDown = (event) => {
      dragging = true;
      const p = pointer(event);
      lastX = p.clientX;
      mount.classList.add("is-dragging");
    };
    const onMove = (event) => {
      if (!dragging) return;
      const p = pointer(event);
      targetY += (p.clientX - lastX) * 0.01;
      lastX = p.clientX;
    };
    const onUp = () => {
      dragging = false;
      mount.classList.remove("is-dragging");
    };
    const onWheel = (event) => {
      event.preventDefault();
      zoom = Math.max(3.8, Math.min(6.2, zoom + event.deltaY * 0.002));
    };

    mount.addEventListener("mousedown", onDown);
    mount.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    mount.addEventListener("wheel", onWheel, { passive: false });

    const resize = () => {
      const width = mount.clientWidth || 420;
      const height = mount.clientHeight || 300;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf;
    let frame = 0;
    const animate = () => {
      frame += 0.01;
      root.rotation.y += (targetY - root.rotation.y) * 0.08;
      root.rotation.x += (targetX - root.rotation.x) * 0.08;
      camera.position.z += (zoom - camera.position.z) * 0.08;
      const activeIndex = activeModelRef.current;
      showcaseModels.forEach((model, index) => {
        model.visible = index === activeIndex;
      });
      drone.rotation.y = Math.sin(frame * 0.9) * 0.16;
      drone.position.y = -0.02 + Math.sin(frame * 1.6) * 0.04;
      rotors.forEach((rotor, i) => {
        rotor.rotation.y += 0.28 + i * 0.015;
      });
      sneaker.rotation.y = Math.sin(frame * 0.65) * 0.18;
      sculpture.rotation.y -= 0.015;
      sculpture.rotation.x = Math.sin(frame) * 0.18;
      rimLight.color.set(getAccent());
      accentMat.color.set(getAccent());
      accentMat.emissive.set(getAccent());
      grid.material.color.set(getAccent());
      wireMat.color.set(getAccent());
      camera.lookAt(0, 0.08, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("mousedown", onDown);
      mount.removeEventListener("touchstart", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
      mount.removeEventListener("wheel", onWheel);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((mat) => mat.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
    });
  }, []);

  return (
    <div className="studio-3d-scene" ref={mountRef}>
      <div className="studio-3d-badge">{modelLabels[activeModel]}</div>
      <div className="studio-3d-count">{activeModel + 1}/3</div>
      <div className="studio-3d-caption">drag rotate / wheel zoom</div>
    </div>
  );
};

const Studio3DMockup = () => (
  <div className="mockup-browser mockup-3d-browser">
    <div className="bar">
      <div className="dots"><i/><i/><i/></div>
      <div className="url">studio.example / <b>models</b></div>
    </div>
    <div className="viewport studio-viewport">
      <Studio3DScene />
    </div>
  </div>
);

window.CaseMockups = {
  "villa-jaconda": VillaJacondaMockup,
  "avtotime": AvtotimeMockup,
  "studio-3d": Studio3DMockup,
};
