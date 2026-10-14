import React, { useEffect, useRef } from "react";
// @ts-ignore
import * as THREE from "three";

interface Category3DHologramProps {
  categoryName: string;
  isHovered: boolean;
  mousePos?: { x: number; y: number }; // normalized -1 to 1
  accentColor?: string;
}

/**
 * Next-Gen Spatial 3D Hologram Miniature (Apple Vision Pro style)
 * Features:
 * - Concentric rotating HUD rings & tech reticle
 * - Laser CT scanline sweep beam
 * - Dynamic energy/electron particle flow
 * - Interactive layer explosion on hover
 * - High-fidelity PBR metallic reflections
 */
export function Category3DHologram({
  categoryName,
  isHovered,
  mousePos = { x: 0, y: 0 },
  accentColor = "#0284c7",
}: Category3DHologramProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // References to dynamic objects
  const modelGroupRef = useRef<any>(null);
  const hudGroupRef = useRef<any>(null);
  const particlesRef = useRef<any>(null);
  const laserBeamRef = useRef<any>(null);
  const explodePartsRef = useRef<Array<{ mesh: any; origPos: THREE.Vector3; explodeDir: THREE.Vector3 }>>([]);

  const isHoveredRef = useRef(isHovered);
  const mousePosRef = useRef(mousePos);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    mousePosRef.current = mousePos;
  }, [mousePos]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 150;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.9, 4.3);

    // 3. WebGL Renderer with High-Precision Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    container.appendChild(renderer.domElement);

    // 4. Lighting Suite
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.4);
    dirLight1.position.set(4, 6, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x7dd3fc, 1.2);
    dirLight2.position.set(-4, -2, 3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(accentColor, 3.5, 9);
    pointLight.position.set(0, 0.5, 2.2);
    scene.add(pointLight);

    // 5. Holographic HUD Rings & Spatial Reticle
    const hudGroup = new THREE.Group();
    hudGroupRef.current = hudGroup;
    scene.add(hudGroup);

    // Outer HUD Ring with Dashed Tech Grid
    const ringGeo1 = new THREE.RingGeometry(1.65, 1.67, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accentColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.3;
    hudGroup.add(ring1);

    // Inner HUD Ring
    const ringGeo2 = new THREE.RingGeometry(1.35, 1.37, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 2.3;
    ring2.rotation.z = Math.PI / 4;
    hudGroup.add(ring2);

    // 6. Laser CT Scanline Beam Plane
    const laserGeo = new THREE.PlaneGeometry(3.2, 0.04);
    const laserMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accentColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const laserBeam = new THREE.Mesh(laserGeo, laserMat);
    laserBeam.position.z = 0.4;
    laserBeamRef.current = laserBeam;
    scene.add(laserBeam);

    // 7. Swarming Flowing Energy Particles (Electrons)
    const particleCount = 42;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particlePhases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.1 + Math.random() * 0.6;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 1.8;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
      particlePhases[i] = Math.random() * Math.PI * 2;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(accentColor).offsetHSL(0, 0, 0.15),
      size: 0.055,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = { mesh: particles, phases: particlePhases };
    scene.add(particles);

    // 8. Construct High-Fidelity 3D Product Geometry with Explode Support
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    const explodeParts: Array<{ mesh: any; origPos: THREE.Vector3; explodeDir: THREE.Vector3 }> = [];
    explodePartsRef.current = explodeParts;

    const cat = categoryName.toLowerCase();

    // Reusable PBR Materials with high specular depth
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xca6f28,
      metalness: 0.94,
      roughness: 0.18,
    });
    const tinMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.22,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xdeb841,
      metalness: 0.88,
      roughness: 0.2,
    });
    const blackSheathMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.18,
      roughness: 0.6,
    });
    const whitePlasticMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.08,
      roughness: 0.3,
    });

    if (cat.includes("cable") || cat.includes("wire")) {
      // 3D Multi-Core Armoured Cable
      const sheathGeo = new THREE.CylinderGeometry(0.78, 0.78, 1.4, 32);
      const sheath = new THREE.Mesh(sheathGeo, blackSheathMat);
      sheath.position.y = -0.6;
      modelGroup.add(sheath);
      explodeParts.push({ mesh: sheath, origPos: sheath.position.clone(), explodeDir: new THREE.Vector3(0, -0.6, 0) });

      // Steel Wire Armour Rings
      const armourGeo = new THREE.CylinderGeometry(0.71, 0.71, 0.35, 32);
      const armour = new THREE.Mesh(armourGeo, tinMat);
      armour.position.y = 0.3;
      modelGroup.add(armour);
      explodeParts.push({ mesh: armour, origPos: armour.position.clone(), explodeDir: new THREE.Vector3(0, -0.2, 0) });

      // 4 Color-Coded Insulated Cores with Pure Copper Conductors
      const coreColors = [0xef4444, 0xfacc15, 0x3b82f6, 0x1e293b];
      const offsets = [
        [-0.26, -0.26],
        [0.26, -0.26],
        [-0.26, 0.26],
        [0.26, 0.26],
      ];
      offsets.forEach(([cx, cz], i) => {
        const coreGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.4, 16);
        const coreMat = new THREE.MeshStandardMaterial({
          color: coreColors[i],
          metalness: 0.22,
          roughness: 0.35,
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(cx, 0.85, cz);
        modelGroup.add(core);

        // Conductor Strands at Top
        const condGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 16);
        const cond = new THREE.Mesh(condGeo, copperMat);
        cond.position.set(cx, 1.85, cz);
        modelGroup.add(cond);

        // Explode outward radially on hover
        const explodeDir = new THREE.Vector3(cx * 1.8, 0.4, cz * 1.8);
        explodeParts.push({ mesh: core, origPos: core.position.clone(), explodeDir });
        explodeParts.push({ mesh: cond, origPos: cond.position.clone(), explodeDir });
      });

      modelGroup.rotation.x = 0.45;
      modelGroup.rotation.z = -0.32;
      modelGroup.scale.set(0.85, 0.85, 0.85);
    } else if (cat.includes("switch") || cat.includes("gear")) {
      // 3D Modular Power Contactor / Circuit Breaker with Neon Status LED
      const bodyGeo = new THREE.BoxGeometry(1.25, 1.85, 1.35);
      const body = new THREE.Mesh(bodyGeo, whitePlasticMat);
      modelGroup.add(body);

      // Faceplate
      const faceGeo = new THREE.BoxGeometry(0.95, 1.45, 0.12);
      const faceMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 });
      const face = new THREE.Mesh(faceGeo, faceMat);
      face.position.z = 0.74;
      modelGroup.add(face);
      explodeParts.push({ mesh: face, origPos: face.position.clone(), explodeDir: new THREE.Vector3(0, 0, 0.5) });

      // Neon LED Power Status Indicator (Green Glowing Dot)
      const ledGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.rotation.x = Math.PI / 2;
      led.position.set(-0.3, 0.45, 0.82);
      modelGroup.add(led);

      // Toggle Switch
      const toggleGeo = new THREE.BoxGeometry(0.24, 0.5, 0.38);
      const toggleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25 });
      const toggle = new THREE.Mesh(toggleGeo, toggleMat);
      toggle.position.set(0, 0.05, 0.96);
      modelGroup.add(toggle);
      explodeParts.push({ mesh: toggle, origPos: toggle.position.clone(), explodeDir: new THREE.Vector3(0, 0.2, 0.8) });

      // Top & Bottom Bi-Connect Terminal Tunnel Clamps
      [-0.4, 0, 0.4].forEach((tx) => {
        const topScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 12), tinMat);
        topScrew.position.set(tx, 0.98, 0.28);
        modelGroup.add(topScrew);
        explodeParts.push({ mesh: topScrew, origPos: topScrew.position.clone(), explodeDir: new THREE.Vector3(0, 0.4, 0) });

        const btmScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 12), tinMat);
        btmScrew.position.set(tx, -0.98, 0.28);
        modelGroup.add(btmScrew);
        explodeParts.push({ mesh: btmScrew, origPos: btmScrew.position.clone(), explodeDir: new THREE.Vector3(0, -0.4, 0) });
      });

      modelGroup.rotation.y = 0.42;
      modelGroup.rotation.x = 0.18;
      modelGroup.scale.set(0.9, 0.9, 0.9);
    } else if (cat.includes("lug")) {
      // 3D Electro-Tinned Heavy Duty Tubular Crimping Lug
      const barrelGeo = new THREE.CylinderGeometry(0.36, 0.36, 1.45, 24);
      const barrel = new THREE.Mesh(barrelGeo, tinMat);
      barrel.position.y = -0.48;
      modelGroup.add(barrel);

      // Flared Bell Mouth Entry
      const bellGeo = new THREE.CylinderGeometry(0.44, 0.36, 0.24, 24);
      const bell = new THREE.Mesh(bellGeo, tinMat);
      bell.position.y = -1.25;
      modelGroup.add(bell);

      // Flat Mounting Palm
      const palmGeo = new THREE.BoxGeometry(0.74, 1.15, 0.18);
      const palm = new THREE.Mesh(palmGeo, tinMat);
      palm.position.y = 0.72;
      modelGroup.add(palm);

      // Stud Hole
      const holeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 16), blackSheathMat);
      holeMesh.rotation.x = Math.PI / 2;
      holeMesh.position.set(0, 0.8, 0);
      modelGroup.add(holeMesh);

      // Inspection Hole in Barrel
      const inspectMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.45, 12), blackSheathMat);
      inspectMesh.rotation.z = Math.PI / 2;
      inspectMesh.position.set(0, -0.15, 0);
      modelGroup.add(inspectMesh);

      explodeParts.push({ mesh: palm, origPos: palm.position.clone(), explodeDir: new THREE.Vector3(0, 0.35, 0) });
      explodeParts.push({ mesh: bell, origPos: bell.position.clone(), explodeDir: new THREE.Vector3(0, -0.35, 0) });

      modelGroup.rotation.z = -0.38;
      modelGroup.rotation.x = 0.28;
      modelGroup.scale.set(0.95, 0.95, 0.95);
    } else if (cat.includes("gland")) {
      // 3D Double Compression Brass Gland
      const hexNutGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.38, 6);
      const nut1 = new THREE.Mesh(hexNutGeo, brassMat);
      nut1.position.y = -0.65;
      modelGroup.add(nut1);
      explodeParts.push({ mesh: nut1, origPos: nut1.position.clone(), explodeDir: new THREE.Vector3(0, -0.55, 0) });

      const bodyGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.75, 24);
      const body = new THREE.Mesh(bodyGeo, brassMat);
      modelGroup.add(body);

      const nut2 = new THREE.Mesh(hexNutGeo, brassMat);
      nut2.position.y = 0.6;
      modelGroup.add(nut2);
      explodeParts.push({ mesh: nut2, origPos: nut2.position.clone(), explodeDir: new THREE.Vector3(0, 0.55, 0) });

      const threadGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.55, 24);
      const thread = new THREE.Mesh(threadGeo, brassMat);
      thread.position.y = 1.05;
      modelGroup.add(thread);
      explodeParts.push({ mesh: thread, origPos: thread.position.clone(), explodeDir: new THREE.Vector3(0, 0.9, 0) });

      modelGroup.rotation.x = 0.35;
      modelGroup.rotation.z = 0.28;
      modelGroup.scale.set(1.1, 1.1, 1.1);
    } else if (cat.includes("solar")) {
      // 3D Monocrystalline Half-Cut Solar Panel
      const frameGeo = new THREE.BoxGeometry(1.85, 2.45, 0.08);
      const frame = new THREE.Mesh(frameGeo, tinMat);
      modelGroup.add(frame);

      const glassGeo = new THREE.BoxGeometry(1.72, 2.32, 0.02);
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x1e40af,
        metalness: 0.7,
        roughness: 0.08,
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.z = 0.045;
      modelGroup.add(glass);
      explodeParts.push({ mesh: glass, origPos: glass.position.clone(), explodeDir: new THREE.Vector3(0, 0, 0.35) });

      // 16BB Busbars Lines
      for (let bx = -0.72; bx <= 0.72; bx += 0.36) {
        const barGeo = new THREE.BoxGeometry(0.015, 2.28, 0.01);
        const bar = new THREE.Mesh(barGeo, tinMat);
        bar.position.set(bx, 0, 0.055);
        modelGroup.add(bar);
        explodeParts.push({ mesh: bar, origPos: bar.position.clone(), explodeDir: new THREE.Vector3(0, 0, 0.5) });
      }

      modelGroup.rotation.x = 0.38;
      modelGroup.rotation.y = -0.28;
      modelGroup.scale.set(0.78, 0.78, 0.78);
    } else if (cat.includes("earth")) {
      // 3D Copper Bonded Earth Electrode Rod & Grounding Pulse Clamp
      const rodGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.9, 24);
      const rod = new THREE.Mesh(rodGeo, copperMat);
      modelGroup.add(rod);

      const clampGeo = new THREE.BoxGeometry(0.48, 0.36, 0.36);
      const clamp = new THREE.Mesh(clampGeo, brassMat);
      clamp.position.y = 0.85;
      modelGroup.add(clamp);
      explodeParts.push({ mesh: clamp, origPos: clamp.position.clone(), explodeDir: new THREE.Vector3(0, 0.5, 0) });

      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.54, 12), tinMat);
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(0, 0.85, 0);
      modelGroup.add(bolt);
      explodeParts.push({ mesh: bolt, origPos: bolt.position.clone(), explodeDir: new THREE.Vector3(0, 0.5, 0.3) });

      modelGroup.rotation.z = -0.42;
      modelGroup.rotation.x = 0.22;
      modelGroup.scale.set(0.9, 0.9, 0.9);
    } else if (cat.includes("conduit") || cat.includes("pipe")) {
      // 3D Heavy-Duty Industrial Conduit with Corrugated Flexible Ribs & Threaded Coupler
      const conduitBaseMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.1,
        roughness: 0.35,
        side: THREE.DoubleSide,
      });

      // Central Pipe Tube
      const mainTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.38, 2.4, 32, 1, true),
        conduitBaseMat
      );
      modelGroup.add(mainTube);

      // Multiple Corrugated Flexible Ribs along the pipe
      for (let ry = -0.7; ry <= 0.7; ry += 0.22) {
        const rib = new THREE.Mesh(
          new THREE.TorusGeometry(0.42, 0.045, 12, 32),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 })
        );
        rib.rotation.x = Math.PI / 2;
        rib.position.y = ry;
        modelGroup.add(rib);
        explodeParts.push({ mesh: rib, origPos: rib.position.clone(), explodeDir: new THREE.Vector3(0, ry * 0.4, 0) });
      }

      // Threaded Bell Coupling Socket at Top
      const coupler = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.44, 0.55, 32),
        conduitBaseMat
      );
      coupler.position.y = 1.15;
      modelGroup.add(coupler);
      explodeParts.push({ mesh: coupler, origPos: coupler.position.clone(), explodeDir: new THREE.Vector3(0, 0.65, 0) });

      // Metal Locking Nut Ring
      const lockNut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.52, 0.52, 0.18, 6),
        brassMat
      );
      lockNut.position.y = 0.85;
      modelGroup.add(lockNut);
      explodeParts.push({ mesh: lockNut, origPos: lockNut.position.clone(), explodeDir: new THREE.Vector3(0, 0.4, 0) });

      modelGroup.rotation.z = -0.42;
      modelGroup.rotation.x = 0.3;
      modelGroup.scale.set(0.9, 0.9, 0.9);
    } else {
      // 3D Luxury Modular Wiring Device (Architectural Wall Plate + Illuminated Switch + Socket)
      // Beveled Modular Plate
      const plateGeo = new THREE.BoxGeometry(2.1, 1.45, 0.18);
      const plateMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        metalness: 0.15,
        roughness: 0.2,
      });
      const plate = new THREE.Mesh(plateGeo, plateMat);
      modelGroup.add(plate);

      // Inner Bezel Trim
      const bezelGeo = new THREE.BoxGeometry(1.85, 1.2, 0.04);
      const bezelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      const bezel = new THREE.Mesh(bezelGeo, bezelMat);
      bezel.position.z = 0.11;
      modelGroup.add(bezel);
      explodeParts.push({ mesh: bezel, origPos: bezel.position.clone(), explodeDir: new THREE.Vector3(0, 0, 0.25) });

      // Module 1: Modular Rocker Switch with Glowing Neon Line
      const rockerGeo = new THREE.BoxGeometry(0.65, 0.95, 0.12);
      const rocker = new THREE.Mesh(rockerGeo, whitePlasticMat);
      rocker.position.set(-0.48, 0, 0.16);
      rocker.rotation.x = -0.15; // slightly toggled
      modelGroup.add(rocker);
      explodeParts.push({ mesh: rocker, origPos: rocker.position.clone(), explodeDir: new THREE.Vector3(-0.3, 0, 0.6) });

      // Neon LED Indicator Strip on Switch
      const neonStrip = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.04, 0.04),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      neonStrip.position.set(-0.48, 0.28, 0.23);
      modelGroup.add(neonStrip);
      explodeParts.push({ mesh: neonStrip, origPos: neonStrip.position.clone(), explodeDir: new THREE.Vector3(-0.3, 0.1, 0.7) });

      // Module 2: 3-Pin Safety Shuttered Universal Socket
      const socketBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.95, 0.08),
        whitePlasticMat
      );
      socketBase.position.set(0.48, 0, 0.14);
      modelGroup.add(socketBase);
      explodeParts.push({ mesh: socketBase, origPos: socketBase.position.clone(), explodeDir: new THREE.Vector3(0.3, 0, 0.6) });

      // Socket Pin Holes (Earth, Neutral, Line)
      const pinMat = new THREE.MeshBasicMaterial({ color: 0x0b1320 });
      // Top Earth Hole
      const earthHole = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.15, 12), pinMat);
      earthHole.rotation.x = Math.PI / 2;
      earthHole.position.set(0.48, 0.22, 0.2);
      modelGroup.add(earthHole);

      // Bottom Left & Right Pin Slots
      [-0.14, 0.14].forEach((px) => {
        const slot = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.12, 0.15), pinMat);
        slot.position.set(0.48 + px, -0.12, 0.2);
        modelGroup.add(slot);
      });

      modelGroup.rotation.x = 0.25;
      modelGroup.rotation.y = -0.22;
      modelGroup.scale.set(0.95, 0.95, 0.95);
    }

    // 9. High-FPS Render Loop with Dynamic Physics & Shader Logic
    let baseAngle = 0;
    let scanY = 0;
    let scanDirection = 1;
    let explodeFactor = 0;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const hovered = isHoveredRef.current;
      const mPos = mousePosRef.current;

      // 1. Base Model Orbit & Mouse Tracking
      baseAngle += hovered ? 0.028 : 0.009;
      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.y = baseAngle + mPos.x * 0.7;
        modelGroupRef.current.rotation.x = 0.22 + mPos.y * 0.45;
      }

      // 2. HUD Ring Counter-Rotation
      if (hudGroupRef.current) {
        hudGroupRef.current.rotation.z = -baseAngle * 0.6;
      }

      // 3. Laser CT Scanline Movement
      if (laserBeamRef.current) {
        scanY += 0.022 * scanDirection;
        if (scanY > 1.2) scanDirection = -1;
        if (scanY < -1.2) scanDirection = 1;
        laserBeamRef.current.position.y = scanY;
        laserBeamRef.current.material.opacity = hovered ? 0.85 : 0.4;
      }

      // 4. Swarming Particle Orbit Motion
      if (particlesRef.current) {
        const { mesh, phases } = particlesRef.current;
        const positions = mesh.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          phases[i] += hovered ? 0.04 : 0.015;
          const radius = 1.1 + Math.sin(phases[i] * 2) * 0.2;
          positions[i * 3] = Math.cos(phases[i]) * radius;
          positions[i * 3 + 2] = Math.sin(phases[i]) * radius;
          positions[i * 3 + 1] = Math.sin(phases[i] * 3) * 0.9;
        }
        mesh.geometry.attributes.position.needsUpdate = true;
      }

      // 5. Smooth Explode Layer Interpolation
      const targetExplode = hovered ? 1 : 0;
      explodeFactor += (targetExplode - explodeFactor) * 0.1;

      explodePartsRef.current.forEach(({ mesh, origPos, explodeDir }) => {
        mesh.position.x = origPos.x + explodeDir.x * explodeFactor;
        mesh.position.y = origPos.y + explodeDir.y * explodeFactor;
        mesh.position.z = origPos.z + explodeDir.z * explodeFactor;
      });

      renderer.render(scene, camera);
    };

    animate();

    // 10. Auto-Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [categoryName, accentColor]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative flex items-center justify-center overflow-hidden pointer-events-none"
    />
  );
}
