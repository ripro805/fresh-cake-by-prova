import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Cake3DCanvasProps {
  interactive?: boolean;
}

export const Cake3DCanvas: React.FC<Cake3DCanvasProps> = ({ interactive = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const width = mount.clientWidth || 500;
    const height = mount.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 5.2);
    camera.lookAt(0, 0.3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff6ed, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.5);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd9b99b, 1.4);
    fillLight.position.set(-5, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xd4af37, 2.0, 10);
    rimLight.position.set(0, 3, -2);
    scene.add(rimLight);

    // 3. 3D Cake Group
    const cakeGroup = new THREE.Group();

    // Cake Pedestal Plate (White Marble / Porcelain with Gold Rim)
    const plateGeo = new THREE.CylinderGeometry(2.1, 1.9, 0.12, 48);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xfbfbf9,
      roughness: 0.2,
      metalness: 0.1
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = -1.0;
    cakeGroup.add(plate);

    const goldRimGeo = new THREE.TorusGeometry(2.0, 0.035, 16, 48);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.85
    });
    const goldRim = new THREE.Mesh(goldRimGeo, goldMat);
    goldRim.rotation.x = Math.PI / 2;
    goldRim.position.y = -0.94;
    cakeGroup.add(goldRim);

    // Tier 1 (Base - Swiss Buttercream Velvet Ivory)
    const tier1Geo = new THREE.CylinderGeometry(1.65, 1.65, 0.85, 48);
    const frostingMat = new THREE.MeshStandardMaterial({
      color: 0xfffcf7,
      roughness: 0.45,
      metalness: 0.05
    });
    const tier1 = new THREE.Mesh(tier1Geo, frostingMat);
    tier1.position.y = -0.5;
    cakeGroup.add(tier1);

    // Tier 1 Gold Pearl Border
    const pearlCount1 = 28;
    for (let i = 0; i < pearlCount1; i++) {
      const angle = (i / pearlCount1) * Math.PI * 2;
      const pearlGeo = new THREE.SphereGeometry(0.065, 16, 16);
      const pearl = new THREE.Mesh(pearlGeo, goldMat);
      pearl.position.set(Math.cos(angle) * 1.63, -0.08, Math.sin(angle) * 1.63);
      cakeGroup.add(pearl);
    }

    // Tier 2 (Middle - Blush Rose Buttercream)
    const tier2Geo = new THREE.CylinderGeometry(1.15, 1.15, 0.75, 48);
    const blushFrostingMat = new THREE.MeshStandardMaterial({
      color: 0xfceee8,
      roughness: 0.42,
      metalness: 0.05
    });
    const tier2 = new THREE.Mesh(tier2Geo, blushFrostingMat);
    tier2.position.y = 0.3;
    cakeGroup.add(tier2);

    // Tier 2 Salted Caramel Drips (Lustrous amber droplets)
    const caramelMat = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      roughness: 0.15,
      metalness: 0.2,
      transparent: true,
      opacity: 0.95
    });
    const dripCount = 14;
    for (let i = 0; i < dripCount; i++) {
      const angle = (i / dripCount) * Math.PI * 2;
      const dripHeight = 0.2 + (i % 3) * 0.12;
      const dripGeo = new THREE.ConeGeometry(0.06, dripHeight, 16);
      const drip = new THREE.Mesh(dripGeo, caramelMat);
      drip.rotation.x = Math.PI;
      drip.position.set(Math.cos(angle) * 1.13, 0.65 - dripHeight / 2, Math.sin(angle) * 1.13);
      cakeGroup.add(drip);
    }

    // Tier 3 (Top Crown)
    const tier3Geo = new THREE.CylinderGeometry(0.7, 0.7, 0.6, 40);
    const tier3 = new THREE.Mesh(tier3Geo, frostingMat);
    tier3.position.y = 0.98;
    cakeGroup.add(tier3);

    // Crown Cake Toppers: Artisanal Macarons & Fresh Raspberry Drops
    const macaronGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 24);
    const macaronPink = new THREE.Mesh(macaronGeo, new THREE.MeshStandardMaterial({ color: 0xe89ca5, roughness: 0.3 }));
    macaronPink.position.set(0.25, 1.34, 0.1);
    macaronPink.rotation.z = 0.4;
    cakeGroup.add(macaronPink);

    const macaronGold = new THREE.Mesh(macaronGeo, goldMat);
    macaronGold.position.set(-0.2, 1.35, 0.15);
    macaronGold.rotation.z = -0.3;
    cakeGroup.add(macaronGold);

    // Golden Sparkle / Confetti Halo Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3.8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.8 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3.8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.05,
      transparent: true,
      opacity: 0.75
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    scene.add(cakeGroup);

    // 4. Mouse Interactive Damping
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // 5. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth idle rotation
      targetRotationY += 0.006;

      // Mouse influence
      if (interactive) {
        cakeGroup.rotation.y += (targetRotationY + mouseX * 0.8 - cakeGroup.rotation.y) * 0.05;
        cakeGroup.rotation.x += (-mouseY * 0.35 + 0.1 - cakeGroup.rotation.x) * 0.05;
      } else {
        cakeGroup.rotation.y += 0.008;
      }

      // Gentle floating levitation
      cakeGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.06;

      // Particle gentle rotation
      particles.rotation.y = elapsedTime * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Resize handling
    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      renderer.dispose();
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div
      ref={mountRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '460px',
        position: 'relative',
        cursor: 'grab',
        touchAction: 'none'
      }}
    >
      {/* Interactive Micro-badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(217, 185, 155, 0.4)',
        borderRadius: 'var(--radius-full)',
        padding: '0.3rem 0.8rem',
        fontSize: '0.72rem',
        fontWeight: 700,
        color: 'var(--brand-primary)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D4AF37' }} />
        <span>3D Interactive Artisan View</span>
      </div>
    </div>
  );
};
