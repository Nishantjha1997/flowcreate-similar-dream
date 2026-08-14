import { useEffect, useRef } from 'react';

const ScrollScene = () => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let disposed = false;
    let frame = 0;
    let renderer: import('three').WebGLRenderer | undefined;

    import('three').then((THREE) => {
      if (disposed || !host) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
      camera.position.z = 4.8;
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      host.appendChild(renderer.domElement);

      const field = new THREE.Group();
      const particles = new Float32Array(160 * 3);
      for (let index = 0; index < 160; index += 1) {
        const radius = 1.3 + Math.random() * 1.8;
        const angle = Math.random() * Math.PI * 2;
        particles[index * 3] = Math.cos(angle) * radius;
        particles[index * 3 + 1] = (Math.random() - 0.5) * 2.3;
        particles[index * 3 + 2] = Math.sin(angle) * radius - 0.7;
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particles, 3));
      const particleMaterial = new THREE.PointsMaterial({ color: 0x75a8ff, size: 0.028, transparent: true, opacity: 0.48, blending: THREE.AdditiveBlending, depthWrite: false });
      field.add(new THREE.Points(particleGeometry, particleMaterial));

      const ringGeometry = new THREE.TorusGeometry(1.45, 0.006, 8, 96);
      const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x4b7bff, transparent: true, opacity: 0.28 });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI * 0.52;
      field.add(ring);

      const innerRingMaterial = new THREE.MeshBasicMaterial({ color: 0xb6d1ff, transparent: true, opacity: 0.13 });
      const innerRing = new THREE.Mesh(ringGeometry, innerRingMaterial);
      innerRing.scale.setScalar(0.65);
      innerRing.rotation.x = Math.PI * 0.42;
      innerRing.rotation.z = Math.PI * 0.2;
      field.add(innerRing);
      scene.add(field);

      const scroll = { current: 0, target: window.scrollY };
      const onScroll = () => { scroll.target = window.scrollY; };
      const resize = () => {
        if (!renderer || !host) return;
        const width = host.clientWidth || 1;
        const height = host.clientHeight || 1;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };

      const tick = (time: number) => {
        if (disposed || !renderer) return;
        const seconds = time * 0.001;
        scroll.current += (scroll.target - scroll.current) * 0.035;
        const depth = Math.min(scroll.current / Math.max(document.documentElement.scrollHeight, 1), 1);
        field.rotation.y = seconds * 0.06 + depth * 0.8;
        field.rotation.x = Math.sin(seconds * 0.22) * 0.08 + depth * 0.18;
        field.position.y = depth * -0.45;
        ring.rotation.z = seconds * 0.14;
        innerRing.rotation.y = -seconds * 0.18;
        renderer.render(scene, camera);
        frame = requestAnimationFrame(tick);
      };

      resize();
      window.addEventListener('resize', resize, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      frame = requestAnimationFrame(tick);

      const cleanup = () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('scroll', onScroll);
        cancelAnimationFrame(frame);
        particleGeometry.dispose();
        particleMaterial.dispose();
        ringGeometry.dispose();
        ringMaterial.dispose();
        innerRingMaterial.dispose();
        renderer?.dispose();
        renderer?.domElement.remove();
      };

      (host as HTMLDivElement & { __cleanup?: () => void }).__cleanup = cleanup;
      if (disposed) cleanup();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      (host as HTMLDivElement & { __cleanup?: () => void }).__cleanup?.();
    };
  }, []);

  return <div ref={hostRef} className="flow-ambient-field" aria-hidden="true" />;
};

export default ScrollScene;
