/* Optimized sphere: single RAF, pixelRatio=1, no per-frame allocations */

const SphereNav = ({ activeSection }) => {
  const mountRef = React.useRef(null);
  const stateRef = React.useRef({
    activeIdx: 0, setTarget: null, raf: null,
    scrollProgress: 0, currentCamZ: 6.4,
  });

  const PHI = (1 + Math.sqrt(5)) / 2;
  const LEN = Math.sqrt(1 + PHI * PHI);
  const VERTS_RAW = [
    [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
    [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
    [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1],
  ];
  const SECTION_VERTS = {
    home: 0, about: 4, stack: 8, cases: 6,
    process: 1, timeline: 7, faq: 5, contact: 9,
  };

  React.useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById('home');
      stateRef.current.scrollProgress =
        Math.min(1, Math.max(0, window.scrollY / ((hero && hero.offsetHeight) || window.innerHeight)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !window.mountThreeScene) return;
    return window.mountThreeScene(mount, (T) => {
    const st = stateRef.current;

    const W = () => mount.clientWidth;
    const H = () => mount.clientHeight;

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(40, W() / H(), 0.1, 100);
    camera.position.z = 6.4;

    /* pixelRatio=1 — biggest perf win on retina */
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(1);
    renderer.setSize(W(), H());
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const accentCSS = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7dff9e';

    /* pre-allocate color object — never create new T.Color() in loop */
    const accentColor = new T.Color(accentCSS());
    const whiteColor  = new T.Color(0xffffff);
    const lerpedColor = new T.Color();

    const group = new T.Group();
    scene.add(group);

    /* outer wireframe — lower detail (0 subdivisions = pure icosahedron) */
    const geo = new T.IcosahedronGeometry(2.0, 1);
    const edges = new T.EdgesGeometry(geo);
    const wireMat = new T.LineBasicMaterial({ color: accentColor.clone(), transparent: true, opacity: 0.38 });
    group.add(new T.LineSegments(edges, wireMat));

    /* inner subtle lines */
    const geoIn = new T.IcosahedronGeometry(1.15, 0);
    const edgesIn = new T.EdgesGeometry(geoIn);
    const innerMat = new T.LineBasicMaterial({ color: accentColor.clone(), transparent: true, opacity: 0.10 });
    group.add(new T.LineSegments(edgesIn, innerMat));

    /* vertex dots — small spheres, pre-allocated */
    const VERTS = VERTS_RAW.map(([x, y, z]) => new T.Vector3(x / LEN, y / LEN, z / LEN));
    const dotR = 2.0;
    const dotGeo = new T.SphereGeometry(0.052, 6, 6);
    const dotMeshes = [];
    const dotMats = VERTS.map((v) => {
      const mat = new T.MeshBasicMaterial({
        color: accentColor.clone(),
        transparent: true,
        opacity: 0.2,
      });
      const mesh = new T.Mesh(dotGeo, mat);
      mesh.position.copy(v.clone().multiplyScalar(dotR));
      group.add(mesh);
      dotMeshes.push(mesh);
      return mat;
    });

    /* glow halo for active node */
    const haloGeo = new T.SphereGeometry(0.14, 8, 8);
    const haloMat = new T.MeshBasicMaterial({ color: accentColor.clone(), transparent: true, opacity: 0, side: T.FrontSide });
    const halo = new T.Mesh(haloGeo, haloMat);
    group.add(halo);

    /* quaternion state */
    const currentQ = new T.Quaternion();
    const targetQ  = new T.Quaternion();
    const front    = new T.Vector3(0, 0, 1);

    const setTarget = (sectionId) => {
      const idx = SECTION_VERTS[sectionId] ?? 0;
      st.activeIdx = idx;
      const v = VERTS[idx].clone().normalize();
      targetQ.setFromUnitVectors(v, front);
      /* move halo to active vertex */
      halo.position.copy(VERTS[idx].clone().multiplyScalar(dotR));
    };

    setTarget('home');
    currentQ.copy(targetQ);
    group.quaternion.copy(currentQ);
    st.setTarget = setTarget;

    let lastAccentCSS = accentCSS();
    let frameCount = 0;
    let t = 0;

    const animate = () => {
      t += 0.008;
      frameCount++;

      /* refresh accent color only every 60 frames */
      if (frameCount % 60 === 0) {
        const a = accentCSS();
        if (a !== lastAccentCSS) {
          lastAccentCSS = a;
          accentColor.set(a);
          wireMat.color.set(a);
          innerMat.color.set(a);
          dotMats.forEach(m => m.color.set(a));
        }
      }

      /* camera zoom: hero (p=0) camZ=6.4, background (p=1) camZ=4.0 */
      const p = st.scrollProgress;
      const targetCamZ = 6.4 - p * 2.4;
      st.currentCamZ += (targetCamZ - st.currentCamZ) * 0.055;
      camera.position.z = st.currentCamZ;

      /* wireframe opacity */
      wireMat.opacity  = 0.38 - p * 0.22;
      innerMat.opacity = 0.10 - p * 0.04;

      /* section rotation */
      currentQ.slerp(targetQ, 0.030);
      group.quaternion.copy(currentQ);

      /* active node: simple glow — bright dot + halo */
      const ai = st.activeIdx;
      dotMats.forEach((m, i) => {
        if (i === ai) {
          m.color.copy(whiteColor);
          m.opacity = 0.95;
        } else {
          m.color.copy(accentColor);
          m.opacity = 0.14;
        }
      });
      /* halo pulse: gentle opacity breathe, no scale change */
      haloMat.color.copy(accentColor);
      haloMat.opacity = 0.22 + Math.sin(t * 3) * 0.12;
      halo.position.copy(VERTS[ai].clone().multiplyScalar(dotR));

      renderer.render(scene, camera);
      st.raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(st.raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
    });
  }, []);

  React.useEffect(() => {
    const st = stateRef.current;
    if (st.setTarget) st.setTarget(activeSection);
  }, [activeSection]);

  return (
    <div
      ref={mountRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
};

window.SphereNav = SphereNav;
