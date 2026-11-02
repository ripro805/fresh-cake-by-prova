import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Sparkles, 
  Layers, 
  RotateCw, 
  Info, 
  Check, 
  ShoppingBag, 
  Eye, 
  Heart, 
  ArrowRight,
  Maximize2,
  X
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { Link } from 'react-router-dom';
import { Product } from '../../types';

export type CakeFlavorId = 'caramel' | 'chocolate' | 'redvelvet';

interface CakeFlavorConfig {
  id: CakeFlavorId;
  productId: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice: number;
  badge: string;
  badgeColor: string;
  image: string;
  normalMap: string;
  description: string;
  spongeNotes: string;
  frostingNotes: string;
  decorNotes: string;
  pins: {
    id: string;
    title: string;
    desc: string;
    x: number; // percentage from left
    y: number; // percentage from top
  }[];
}

const CAKE_FLAVORS: Record<CakeFlavorId, CakeFlavorConfig> = {
  caramel: {
    id: 'caramel',
    productId: 'prod-cake-01',
    name: 'Golden Caramel Drip Celebration Cake',
    tagline: 'Signature 2-tier vanilla sponge, salted amber caramel & 24K gold foil',
    price: 1650,
    originalPrice: 1850,
    badge: 'Artisan Signature',
    badgeColor: '#B46824',
    image: '/images/hero_cake_caramel_cutout.png',
    normalMap: '/images/hero_cake_normal.png',
    description: 'Slow-simmered artisanal amber salted caramel cascading over velvet Swiss meringue buttercream, adorned with 24K gold foil and fresh garden roses.',
    spongeNotes: '3 moist layers of Bourbon vanilla bean sponge soaked in vanilla syrup',
    frostingNotes: 'Light-as-air Swiss meringue buttercream made with pure European butter',
    decorNotes: '24K edible gold leaf flakes, blush David Austin garden roses & organic eucalyptus',
    pins: [
      { id: 'pin-bloom', title: '🌸 Fresh Botanical Blooms', desc: 'Hand-selected blush garden roses, ranunculus & fragrant organic eucalyptus sprigs.', x: 44, y: 22 },
      { id: 'pin-drip', title: '🍯 Salted Caramel Drip', desc: 'Slow-simmered house salted caramel with French sea salt, dripping naturally down both tiers.', x: 62, y: 38 },
      { id: 'pin-gold', title: '✨ 24K Edible Gold Leaf', desc: 'Hand-gilded edible 24K pure gold foil applied delicately onto the buttercream.', x: 44, y: 60 },
      { id: 'pin-stand', title: '🏛️ Carrara Marble Stand', desc: 'Served on a solid white Italian Carrara marble pedestal cake stand with gold accent.', x: 50, y: 82 }
    ]
  },
  chocolate: {
    id: 'chocolate',
    productId: 'prod-cake-02',
    name: 'Belgian Dark Chocolate Truffle Cake',
    tagline: 'Intense 70% Callebaut dark chocolate ganache, fudge sponge & handmade truffles',
    price: 1750,
    originalPrice: 1950,
    badge: 'Chocolatier Special',
    badgeColor: '#4A2810',
    image: '/images/hero_cake_chocolate_cutout.png',
    normalMap: '/images/hero_cake_chocolate_normal.png',
    description: 'An indulgent, double-tier chocolate masterpiece with mirror chocolate ganache drip, dark chocolate mousse layers, and cocoa-dusted artisan truffles.',
    spongeNotes: 'Deep, fudgy chocolate blackout sponge crafted with dark Dutch cocoa',
    frostingNotes: 'Silky 70% Belgian dark chocolate ganache whipped with sweet butter',
    decorNotes: 'Hand-rolled dark cocoa truffles, Belgian chocolate curls & 24K gold flakes',
    pins: [
      { id: 'pin-truffle', title: '🍫 Artisan Cocoa Truffles', desc: 'Hand-rolled dark chocolate ganache truffles dusted with fine Dutch cocoa powder.', x: 50, y: 24 },
      { id: 'pin-ganache', title: '🍯 Mirror Chocolate Ganache', desc: 'Glossy 70% Callebaut dark chocolate drip cascading over rich chocolate fudge.', x: 64, y: 44 },
      { id: 'pin-curls', title: '✨ Gold & Chocolate Curls', desc: 'Crisp chocolate curls and genuine edible gold leaf accents.', x: 38, y: 64 },
      { id: 'pin-stand', title: '🏛️ Marble & Gold Pedestal', desc: 'Heavy stone pedestal with polished brass rim for stable, luxurious presentation.', x: 50, y: 82 }
    ]
  },
  redvelvet: {
    id: 'redvelvet',
    productId: 'prod-cake-05',
    name: 'Classic Red Velvet Berry Dream Cake',
    tagline: 'Crimson cocoa sponge, tangy cream cheese frosting & wild berry coulis',
    price: 1600,
    originalPrice: 1800,
    badge: 'Customer Favorite',
    badgeColor: '#931B24',
    image: '/images/hero_cake_redvelvet_cutout.png',
    normalMap: '/images/hero_cake_redvelvet_normal.png',
    description: 'Vibrant scarlet cocoa sponge with Philadelphia cream cheese frosting, wild raspberry drip, and an abundance of fresh strawberries and blackberries.',
    spongeNotes: 'Traditional Southern red velvet sponge with subtle buttermilk cocoa crumb',
    frostingNotes: 'Tangy and smooth Philadelphia cream cheese frosting with Madagascar vanilla',
    decorNotes: 'Freshly harvested strawberries, blackberries, raspberries, and red velvet crumble',
    pins: [
      { id: 'pin-berries', title: '🍓 Fresh Orchard Berries', desc: 'Sweet ripe strawberries, plump blackberries, and raspberries glistening on top.', x: 50, y: 20 },
      { id: 'pin-coulis', title: '🍒 Wild Raspberry Coulis', desc: 'Tart berry drip handcrafted from wild raspberries and fresh lemon zest.', x: 64, y: 40 },
      { id: 'pin-crumb', title: '🍰 Velvet Sponge Layers', desc: 'Semi-naked finish showcasing the rich ruby sponge and velvety cream cheese.', x: 42, y: 62 },
      { id: 'pin-stand', title: '🏛️ Ceramic Marble Stand', desc: 'Classic bakery display pedestal supporting the double-tiered creation.', x: 50, y: 82 }
    ]
  }
};

export const RealCake3DInteractive: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { settings, showToast } = useSettings();

  const [selectedFlavor, setSelectedFlavor] = useState<CakeFlavorId>('caramel');
  const [viewMode, setViewMode] = useState<'showpiece' | 'slice'>('showpiece');
  const [autoRotate, setAutoRotate] = useState(true);
  const [activePin, setActivePin] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  const flavor = CAKE_FLAVORS[selectedFlavor];

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cakeMeshRef = useRef<THREE.Mesh | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);
  const particleGroupRef = useRef<THREE.Points | null>(null);

  // Rotation & Dragging State
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });
  const textureLoaderRef = useRef<THREE.TextureLoader | null>(null);
  const loadedTexturesRef = useRef<Record<string, THREE.Texture>>({});

  // 1. Initialize Three.js WebGL Scene with PBR and Dynamic Lighting
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Detect WebGL capability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = mount.clientWidth || 560;
    const height = mount.clientHeight || 560;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.05, 5.0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    // 2. Realistic Bakery Studio Lighting Setup
    // Warm Ambient Light
    const ambientLight = new THREE.AmbientLight(0xfff7ec, 1.25);
    scene.add(ambientLight);

    // Soft Directional Key Light
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    // Cool Ambient Fill Light
    const fillLight = new THREE.DirectionalLight(0xe8dcd0, 1.1);
    fillLight.position.set(-4, 2, -1);
    scene.add(fillLight);

    // Golden Rim Light for Glistening Glaze
    const rimLight = new THREE.DirectionalLight(0xd4af37, 2.0);
    rimLight.position.set(0, 4, -3);
    scene.add(rimLight);

    // Interactive Cursor Specular Point Light
    const pointLight = new THREE.PointLight(0xfffaed, 2.2, 8);
    pointLight.position.set(0, 0.5, 2.2);
    pointLightRef.current = pointLight;
    scene.add(pointLight);

    // 3. Ground Contact Shadow Plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const shadowCtx = shadowCanvas.getContext('2d')!;
    const grad = shadowCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(53, 39, 31, 0.42)');
    grad.addColorStop(0.5, 'rgba(53, 39, 31, 0.16)');
    grad.addColorStop(1, 'rgba(53, 39, 31, 0)');
    shadowCtx.fillStyle = grad;
    shadowCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(2.8, 0.95);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.85
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2.2;
    shadowMesh.position.set(0, -1.33, -0.1);
    scene.add(shadowMesh);

    // 4. Ambient 3D Golden Sparkle Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 5.0;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 4.0;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particleGroupRef.current = particles;
    scene.add(particles);

    // 5. Load Real Cake Cutout as 3D Plane Mesh with Normal Map
    const textureLoader = new THREE.TextureLoader();
    textureLoaderRef.current = textureLoader;

    const cakeGeo = new THREE.PlaneGeometry(2.65, 2.65, 32, 32);
    const cakeTexture = textureLoader.load(flavor.image, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      loadedTexturesRef.current[flavor.image] = tex;
    });

    const normalTexture = textureLoader.load(flavor.normalMap, (tex) => {
      loadedTexturesRef.current[flavor.normalMap] = tex;
    });

    const cakeMat = new THREE.MeshStandardMaterial({
      map: cakeTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.65, 0.65),
      transparent: true,
      alphaTest: 0.02,
      roughness: 0.38,
      metalness: 0.14,
      side: THREE.DoubleSide
    });

    const cakeMesh = new THREE.Mesh(cakeGeo, cakeMat);
    cakeMesh.position.set(0, 0, 0);
    cakeMeshRef.current = cakeMesh;
    scene.add(cakeMesh);

    // 6. Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Subtle natural breathing / floating
      if (cakeMeshRef.current) {
        cakeMeshRef.current.position.y = -0.05 + Math.sin(time * 1.4) * 0.035;

        // Auto-rotation if enabled & not dragging
        if (autoRotate && !isDraggingRef.current && !isHovered) {
          targetRotationRef.current.y = Math.sin(time * 0.45) * 0.24;
          targetRotationRef.current.x = Math.cos(time * 0.55) * 0.06;
        }

        // Smooth Lerp Damping
        currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.065;
        currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.065;

        cakeMeshRef.current.rotation.x = currentRotationRef.current.x;
        cakeMeshRef.current.rotation.y = currentRotationRef.current.y;
      }

      // Gentle sparkle drift
      if (particleGroupRef.current) {
        particleGroupRef.current.rotation.y = time * 0.04;
        particleGroupRef.current.position.y = Math.sin(time * 0.8) * 0.06;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Observer
    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight || newW;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      cakeGeo.dispose();
      cakeMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  // Update Cake Texture when flavor changes
  useEffect(() => {
    if (!cakeMeshRef.current || !textureLoaderRef.current) return;

    const loader = textureLoaderRef.current;
    const newTex = loadedTexturesRef.current[flavor.image] || loader.load(flavor.image, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      loadedTexturesRef.current[flavor.image] = tex;
    });

    const newNorm = loadedTexturesRef.current[flavor.normalMap] || loader.load(flavor.normalMap, (tex) => {
      loadedTexturesRef.current[flavor.normalMap] = tex;
    });

    const mat = cakeMeshRef.current.material as THREE.MeshStandardMaterial;
    if (mat) {
      mat.map = newTex;
      mat.normalMap = newNorm;
      mat.needsUpdate = true;
    }
  }, [selectedFlavor, flavor]);

  // Sync renderer & camera when switching back to 3D showpiece
  useEffect(() => {
    if (viewMode === 'showpiece' && rendererRef.current && cameraRef.current && mountRef.current) {
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || w;
      if (w > 0 && h > 0) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    }
  }, [viewMode]);

  // Mouse / Touch Interaction Handlers for 3D Studio
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const mount = mountRef.current;
    if (!mount) return;

    const rect = mount.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;

    // Update cursor specular point light position in Three.js
    if (pointLightRef.current) {
      pointLightRef.current.position.set(relX * 4, -relY * 3 + 0.3, 2.2);
    }

    if (isDraggingRef.current) {
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      // Constrain rotation to realistic luxury presentation bounds (max +/- 32 degrees)
      targetRotationRef.current.y = Math.max(-0.48, Math.min(0.48, targetRotationRef.current.y + deltaX * 0.007));
      targetRotationRef.current.x = Math.max(-0.25, Math.min(0.25, targetRotationRef.current.x + deltaY * 0.007));
    } else {
      // Subtle interactive parallax hover
      targetRotationRef.current.y = relX * 0.42;
      targetRotationRef.current.x = -relY * 0.22;
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleAddToCart = () => {
    const dummyProduct: Product = {
      id: flavor.productId,
      slug: flavor.id === 'caramel' ? 'golden-caramel-celebration-cake' : flavor.id === 'chocolate' ? 'belgian-dark-chocolate-truffle-cake' : 'classic-red-velvet-berry-cake',
      name: flavor.name,
      category: 'cakes',
      cake_type: 'Celebration Cakes',
      description: flavor.description,
      price: flavor.price,
      images: [flavor.image],
      variants: [
        { id: 'v-1lb', name: '1 Pound Celebration Tier', price: flavor.price, is_default: true }
      ],
      availability: true,
      is_featured: true,
      is_bestseller: true
    };

    const added = addToCart(dummyProduct, dummyProduct.variants[0], flavor.name);
    if (added) {
      showToast(`Added ${flavor.name} to your celebration cart!`, 'success');
      setIsCartDrawerOpen(true);
    }
  };

  return (
    <div 
      className="real-cake-hero-studio"
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all var(--transition-normal)'
      }}
    >
      {/* Studio Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(250, 246, 239, 0.7)',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span 
            className="badge" 
            style={{ 
              backgroundColor: `${flavor.badgeColor}18`, 
              color: flavor.badgeColor,
              border: `1px solid ${flavor.badgeColor}40`,
              fontWeight: 700,
              fontSize: '0.74rem',
              letterSpacing: '0.04em'
            }}
          >
            {flavor.badge}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} style={{ color: 'var(--brand-secondary)' }} />
            <span>Real Bakery Studio Capture</span>
          </span>
        </div>

        {/* View Mode Toggle (3D Studio vs Sponge Layer Cut) */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-secondary)',
          padding: '3px',
          borderRadius: 'var(--radius-full)'
        }}>
          <button
            type="button"
            onClick={() => setViewMode('showpiece')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              backgroundColor: viewMode === 'showpiece' ? 'var(--bg-surface)' : 'transparent',
              color: viewMode === 'showpiece' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <RotateCw size={12} />
            <span>3D Showpiece</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('slice')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              backgroundColor: viewMode === 'slice' ? 'var(--bg-surface)' : 'transparent',
              color: viewMode === 'slice' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Layers size={12} />
            <span>Sponge Layers</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display Area */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(420px, 50vw, 530px)',
          backgroundColor: 'var(--bg-primary)',
          cursor: viewMode === 'showpiece' ? (isDraggingRef.current ? 'grabbing' : 'grab') : 'default',
          userSelect: 'none',
          overflow: 'hidden'
        }}
        onPointerDown={viewMode === 'showpiece' ? handlePointerDown : undefined}
        onPointerMove={viewMode === 'showpiece' ? handlePointerMove : undefined}
        onPointerUp={viewMode === 'showpiece' ? handlePointerUp : undefined}
        onPointerLeave={() => {
          isDraggingRef.current = false;
          setIsHovered(false);
          setActivePin(null);
        }}
        onMouseEnter={() => setIsHovered(true)}
      >
        {/* Soft Radial Ambient Studio Light Gradient Behind Cake */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.75) 0%, rgba(247, 239, 231, 0.45) 50%, rgba(242, 233, 220, 0) 75%)',
          pointerEvents: 'none'
        }} />

        {/* 1. Mode A: Three.js 3D Interactive WebGL Cake (Permanently Mounted, Visibility Controlled via CSS) */}
        {webglSupported && (
          <div 
            ref={mountRef} 
            style={{ 
              width: '100%', 
              height: '100%', 
              position: 'absolute',
              inset: 0,
              zIndex: viewMode === 'showpiece' ? 2 : 1,
              opacity: viewMode === 'showpiece' ? 1 : 0,
              pointerEvents: viewMode === 'showpiece' ? 'auto' : 'none',
              transition: 'opacity 0.28s ease',
              display: 'block'
            }} 
          />
        )}

        {/* 1. Mode A Fallback: High-Res Clean Photorealistic Studio Cutout with 3D CSS Tilt */}
        {!webglSupported && (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'absolute',
            inset: 0,
            zIndex: viewMode === 'showpiece' ? 2 : 1,
            opacity: viewMode === 'showpiece' ? 1 : 0,
            pointerEvents: viewMode === 'showpiece' ? 'auto' : 'none',
            transition: 'opacity 0.28s ease'
          }}>
            <img
              src={flavor.image}
              alt={flavor.name}
              style={{
                maxWidth: '90%',
                maxHeight: '90%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 30px rgba(53, 39, 31, 0.22))',
                animation: 'floatSlow 4s ease-in-out infinite'
              }}
            />
          </div>
        )}

        {/* 2. Mode B: Real Bakery Crumb & Sponge Cross-Section Inspection */}
        <div style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: viewMode === 'slice' ? 3 : 0,
          opacity: viewMode === 'slice' ? 1 : 0,
          pointerEvents: viewMode === 'slice' ? 'auto' : 'none',
          transition: 'opacity 0.28s ease'
        }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="/images/caramel_cake_slice.jpg"
              alt="Moist Sponge Crumb & Filling Cross-Section"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              backgroundColor: 'rgba(34, 24, 18, 0.85)',
              backdropFilter: 'blur(6px)',
              color: '#FAF6EF',
              padding: '0.85rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong style={{ display: 'block', color: 'var(--brand-accent)' }}>Moist Crumb &amp; Praline Filling</strong>
                <span style={{ fontSize: '0.78rem', opacity: 0.9 }}>Slow-baked 3-tier golden sponge with salted caramel between every layer</span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('showpiece')}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
              >
                View 3D
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Hotspot Pins (Only on Showpiece View) */}
        {viewMode === 'showpiece' && flavor.pins.map(pin => (
          <div
            key={pin.id}
            style={{
              position: 'absolute',
              left: `${pin.x}%`,
              top: `${pin.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePin(activePin === pin.id ? null : pin.id);
              }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: activePin === pin.id ? 'var(--brand-primary)' : 'rgba(255, 255, 255, 0.92)',
                color: activePin === pin.id ? '#FFFFFF' : 'var(--brand-primary)',
                border: '2px solid var(--brand-secondary)',
                boxShadow: '0 4px 12px rgba(53, 39, 31, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                transform: activePin === pin.id ? 'scale(1.15)' : 'scale(1)'
              }}
              title={pin.title}
              aria-label={pin.title}
            >
              <Sparkles size={13} />
            </button>

            {/* Expanded Pin Popover Card */}
            {activePin === pin.id && (
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '240px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem 1rem',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 20,
                  animation: 'slideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.86rem', color: 'var(--brand-primary)' }}>{pin.title}</strong>
                  <button 
                    onClick={() => setActivePin(null)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                  >
                    <X size={13} />
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {pin.desc}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* 3D Interaction Cue Badge */}
        {viewMode === 'showpiece' && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(6px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '0.35rem 0.85rem',
            fontSize: '0.74rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            <RotateCw size={12} style={{ color: 'var(--brand-secondary)' }} />
            <span>Drag or move cursor to inspect in 3D</span>
          </div>
        )}
      </div>

      {/* Flavor Selection Carousel Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {(Object.keys(CAKE_FLAVORS) as CakeFlavorId[]).map((fKey) => {
          const cfg = CAKE_FLAVORS[fKey];
          const isSelected = selectedFlavor === fKey;
          return (
            <button
              key={fKey}
              type="button"
              onClick={() => {
                setSelectedFlavor(fKey);
                setActivePin(null);
              }}
              style={{
                backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
                border: isSelected ? '1.5px solid var(--brand-secondary)' : '1px solid transparent',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.75rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all var(--transition-fast)',
                boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-primary)',
                flexShrink: 0,
                border: isSelected ? '1.5px solid var(--brand-secondary)' : '1px solid var(--border-subtle)'
              }}>
                <img 
                  src={cfg.image} 
                  alt={cfg.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.2)' }} 
                />
              </div>

              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 700 : 600,
                  color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}>
                  {cfg.id === 'caramel' ? 'Golden Caramel' : cfg.id === 'chocolate' ? 'Belgian Truffle' : 'Red Velvet Berry'}
                </div>
                <div style={{ fontSize: '0.72rem', color: isSelected ? 'var(--brand-secondary)' : 'var(--text-muted)' }}>
                  {settings.currency} {cfg.price}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Flavor Description & E-Commerce CTAs */}
      <div style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        backgroundColor: 'var(--bg-surface)'
      }}>
        <div style={{ flexGrow: 1, minWidth: '220px' }}>
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 2px 0', lineHeight: 1.3 }}>
            {flavor.name}
          </h3>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {flavor.tagline}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right', marginRight: '4px' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)', lineHeight: 1 }}>
              {settings.currency} {flavor.price}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              {settings.currency} {flavor.originalPrice}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="btn btn-primary btn-sm"
            style={{
              padding: '0.65rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShoppingBag size={15} />
            <span>Order This Cake</span>
          </button>
        </div>
      </div>
    </div>
  );
};
