/* Three.js wireframe hero object - icosahedron with glow */

const Hero3D = ({ motionLevel = "high" }) => {
  const mountRef = React.useRef(null);

  React.useEffect(() => {
    if (motionLevel === "low") return;
    const mount = mountRef.current;
    if (!mount || !window.mountThreeScene) return;
    return window.mountThreeScene(mount, (THREE) => {

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.z = 6.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7dff9e";
    const accentColor = new THREE.Color(accent);

    // Outer wireframe icosahedron
    const geo = new THREE.IcosahedronGeometry(2.2, 1);
    const edges = new THREE.EdgesGeometry(geo);
    const mat = new THREE.LineBasicMaterial({ color: accentColor, transparent: true, opacity: 0.85 });
    const lines = new THREE.LineSegments(edges, mat);
    scene.add(lines);

    // Inner small rotating shape
    const innerGeo = new THREE.OctahedronGeometry(0.9, 0);
    const innerEdges = new THREE.EdgesGeometry(innerGeo);
    const innerMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
    const innerLines = new THREE.LineSegments(innerEdges, innerMat);
    scene.add(innerLines);

    // Particles cloud
    const pCount = 180;
    const pPositions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const r = 3 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pPositions[i*3] = r * Math.sin(phi) * Math.cos(theta);
      pPositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i*3+2] = r * Math.cos(phi);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({ color: accentColor, size: 0.04, transparent: true, opacity: 0.6 });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // Mouse parallax
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 0.6;
      target.y = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };
    window.addEventListener("mousemove", onMove);

    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", resize);

    let raf;
    let t = 0;
    const animate = () => {
      t += 0.004;
      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;

      lines.rotation.x = t * 0.5 + current.y;
      lines.rotation.y = t * 0.7 + current.x;
      innerLines.rotation.x = -t * 1.1 + current.y * 0.5;
      innerLines.rotation.y = -t * 1.3 + current.x * 0.5;
      innerLines.rotation.z = t * 0.6;
      points.rotation.y = t * 0.2 + current.x * 0.4;
      points.rotation.x = current.y * 0.4;

      // pulse opacity
      lines.material.opacity = 0.7 + Math.sin(t * 6) * 0.15;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
    });
  }, [motionLevel]);

  return <div ref={mountRef} className="hero-3d" />;
};

window.Hero3D = Hero3D;
