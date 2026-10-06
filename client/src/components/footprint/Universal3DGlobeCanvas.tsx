import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
// @ts-ignore
import * as THREE from "three";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Compass,
  Globe2,
  Maximize2,
  Minimize2,
  Minus,
  Navigation,
  Plus,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import type {
  CinematicWaypoint,
  FootprintProject,
  FootprintState,
} from "./GlobeProjectsExperience";
import { OFFICIAL_STATE_COUNTS } from "./GlobeProjectsExperience";

export interface Universal3DGlobeHandle {
  pointOfView: (
    coords: { lat: number; lng: number; altitude?: number },
    durationMs?: number
  ) => void;
  controls: () => OrbitControls | null;
  renderer: () => any;
}

interface Universal3DGlobeCanvasProps {
  activeWaypoint: CinematicWaypoint;
  states: FootprintState[];
  allProjects: FootprintProject[];
  indiaFeatures: any[];
  exportArcs: Array<{
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    target: string;
    color: string[];
  }>;
  globalExportPoints: Array<{
    name: string;
    lat: number;
    lng: number;
    territory: string;
    color: string;
    size: number;
  }>;
  isUserInteracting: boolean;
  onUserInteractionStart: () => void;
  onSelectProject: (proj: FootprintProject) => void;
  onSelectState: (code: string) => void;
  onGlobeReady?: () => void;
}

// Convert Geographic Latitude & Longitude to 3D Cartesian coordinates
export function latLngToVector3(
  lat: number,
  lng: number,
  radius: number
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

const GLOBE_RADIUS = 100;
const MIN_CAMERA_DISTANCE = 108; // Close-up zoom right above the ground and landmark pins!
const MAX_CAMERA_DISTANCE = 480;

export const Universal3DGlobeCanvas = forwardRef<
  Universal3DGlobeHandle,
  Universal3DGlobeCanvasProps
>(function Universal3DGlobeCanvas(
  {
    activeWaypoint,
    states,
    allProjects,
    indiaFeatures,
    exportArcs,
    globalExportPoints,
    isUserInteracting,
    onUserInteractionStart,
    onSelectProject,
    onSelectState,
    onGlobeReady,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Three.js Core Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Dynamic Scene Group Refs
  const globeMeshRef = useRef<THREE.Mesh | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);
  const pulsesGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const boundariesGroupRef = useRef<THREE.Group | null>(null);
  const ringsGroupRef = useRef<THREE.Group | null>(null);

  // Interactive Hover & Raycast State
  const [hoveredInfo, setHoveredInfo] = useState<{
    title: string;
    subtitle: string;
    tag?: string;
    extra?: string;
    x: number;
    y: number;
  } | null>(null);

  // Camera flight interpolation state
  const flightRef = useRef<{
    isFlying: boolean;
    startTime: number;
    duration: number;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
  }>({
    isFlying: false,
    startTime: 0,
    duration: 2200,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
  });

  // Pulse animation data
  const pulseDataRef = useRef<
    Array<{
      mesh: THREE.Mesh;
      curve: THREE.QuadraticBezierCurve3;
      speed: number;
      offset: number;
    }>
  >([]);

  // Ripple rings animation data
  const rippleRingsRef = useRef<
    Array<{
      mesh: THREE.Mesh;
      initialScale: number;
      maxScale: number;
      speed: number;
      baseOpacity: number;
    }>
  >([]);

  // UNESCO Concentric Target Reticles (spinning crosshairs)
  const rotatingReticlesRef = useRef<
    Array<{
      mesh: THREE.Mesh;
      speed: number;
    }>
  >([]);

  // Smoothly Fly Camera to Given Lat, Lng, Altitude (Cesium / UNESCO Great-Circle Flight)
  const flyToCoordinates = useCallback(
    (
      coords: { lat: number; lng: number; altitude?: number },
      durationMs: number = 2200
    ) => {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      if (!camera || !controls) return;

      // Allow deep zoom into landmark locations down to altitude 0.10!
      const rawAlt = coords.altitude ?? 1.4;
      const safeAlt = Math.max(0.10, Math.min(2.8, rawAlt));
      const distance = Math.max(
        MIN_CAMERA_DISTANCE,
        Math.min(MAX_CAMERA_DISTANCE, GLOBE_RADIUS * (1 + safeAlt))
      );
      const targetPos = latLngToVector3(coords.lat, coords.lng, distance);

      // Pause auto-rotation during camera flight
      controls.autoRotate = false;

      // For site-level zoom (altitude < 0.45), orient camera with a gentle 3D oblique tilt
      const isSiteZoom = safeAlt < 0.45;
      const surfacePt = latLngToVector3(coords.lat, coords.lng, GLOBE_RADIUS);
      const endTarget = isSiteZoom
        ? surfacePt.clone().multiplyScalar(0.25) // subtle forward look target for true 3D horizon
        : new THREE.Vector3(0, 0, 0);

      flightRef.current = {
        isFlying: true,
        startTime: performance.now(),
        duration: Math.max(800, durationMs),
        startPos: camera.position.clone(),
        endPos: targetPos,
        startTarget: controls.target.clone(),
        endTarget,
      };
    },
    []
  );

  // Imperative handle for parent component
  useImperativeHandle(
    ref,
    () => ({
      pointOfView: (coords, durationMs = 2200) => {
        flyToCoordinates(coords, durationMs);
      },
      controls: () => controlsRef.current,
      renderer: () => rendererRef.current,
    }),
    [flyToCoordinates]
  );

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 740;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera (Wide 45-degree cinematic FOV)
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
    // Initial camera overlooking Indian Ocean / India
    const initialCamPos = latLngToVector3(20.5, 55.0, GLOBE_RADIUS * 2.3);
    camera.position.copy(initialCamPos);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.85;
    controls.minDistance = MIN_CAMERA_DISTANCE;
    controls.maxDistance = MAX_CAMERA_DISTANCE;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.addEventListener("start", () => {
      onUserInteractionStart();
    });
    controlsRef.current = controls;

    // 5. Lighting Setup (Sunlight + Rim Light + Ambient)
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.8);
    sunLight.position.set(350, 240, 280);
    scene.add(sunLight);

    const blueRimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    blueRimLight.position.set(-280, -120, -220);
    scene.add(blueRimLight);

    const goldAccentLight = new THREE.DirectionalLight(0xf59e0b, 0.9);
    goldAccentLight.position.set(150, 300, 100);
    scene.add(goldAccentLight);

    // 6. Deep Space Starfield
    const starCount = 800;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 900 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPos[i] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i + 2] = r * Math.cos(phi);
    }
    starGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 1.6,
      transparent: true,
      opacity: 0.75,
    });
    const starField = new THREE.Points(starGeom, starMat);
    scene.add(starField);

    // 7. Earth Sphere
    const sphereGeom = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const textureLoader = new THREE.TextureLoader();

    // Default base material (deep space ocean with sheen)
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x0a243d,
      roughness: 0.55,
      metalness: 0.12,
    });

    const earthMesh = new THREE.Mesh(sphereGeom, earthMat);
    scene.add(earthMesh);
    globeMeshRef.current = earthMesh;

    // Load High-Res Marble, Bump Map & Night Lights
    textureLoader.load(
      "/manus-storage/earth-blue-marble_cb903e9b.jpg",
      (texture: any) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        earthMat.map = texture;
        earthMat.color.setHex(0xffffff);
        earthMat.needsUpdate = true;
      },
      undefined,
      (err: any) => {
        console.warn("[3D Globe] Texture load fallback:", err);
      }
    );

    textureLoader.load("/manus-storage/earth-topology_640fce13.png", (bump: any) => {
      earthMat.bumpMap = bump;
      earthMat.bumpScale = 0.9;
      earthMat.needsUpdate = true;
    });

    textureLoader.load("/manus-storage/earth-night_cb903e9b.jpg", (night: any) => {
      night.colorSpace = THREE.SRGBColorSpace;
      earthMat.emissiveMap = night;
      earthMat.emissive = new THREE.Color(0xffe29a);
      earthMat.emissiveIntensity = 0.45;
      earthMat.needsUpdate = true;
    });

    // 8. Dual-Layer Outer Atmospheric Halo Glow
    const atmosGeom = new THREE.SphereGeometry(GLOBE_RADIUS * 1.025, 48, 48);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeom, atmosMat);
    scene.add(atmosMesh);

    // 9. Overlay Groups
    const boundariesGroup = new THREE.Group();
    scene.add(boundariesGroup);
    boundariesGroupRef.current = boundariesGroup;

    const arcsGroup = new THREE.Group();
    scene.add(arcsGroup);
    arcsGroupRef.current = arcsGroup;

    const pulsesGroup = new THREE.Group();
    scene.add(pulsesGroup);
    pulsesGroupRef.current = pulsesGroup;

    const ringsGroup = new THREE.Group();
    scene.add(ringsGroup);
    ringsGroupRef.current = ringsGroup;

    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Ready signal to parent component
    if (onGlobeReady) {
      onGlobeReady();
    }

    // 10. Resize Observer
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth || 1200;
      const h = containerRef.current.clientHeight || 740;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 11. Animation Render Loop (60 FPS)
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Handle Smooth Camera Flight
      if (flightRef.current.isFlying && cameraRef.current && controlsRef.current) {
        const { startTime, duration, startPos, endPos, startTarget, endTarget } =
          flightRef.current;
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / duration);

        // Smooth cubic ease-in-out
        const t =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        // Spherical interpolation with realistic orbital arch lift (Cesium / Google Earth style)
        const baseLength = THREE.MathUtils.lerp(startPos.length(), endPos.length(), t);
        const archLift = Math.sin(t * Math.PI) * 28;
        const curLength = baseLength + archLift;

        const slerpedPos = new THREE.Vector3().copy(startPos).normalize();
        const endNorm = new THREE.Vector3().copy(endPos).normalize();
        const angle = slerpedPos.angleTo(endNorm);

        if (angle > 0.001) {
          const axis = new THREE.Vector3().crossVectors(slerpedPos, endNorm).normalize();
          slerpedPos.applyAxisAngle(axis, angle * t);
        }
        slerpedPos.multiplyScalar(curLength);
        cameraRef.current.position.copy(slerpedPos);

        controlsRef.current.target.lerpVectors(startTarget, endTarget, t);

        if (progress >= 1) {
          flightRef.current.isFlying = false;
        }
      }

      // Update Controls (damping & idle auto-rotation)
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Animate Arcs Photon Energy Pulses
      const now = performance.now() * 0.001;
      for (const pulse of pulseDataRef.current) {
        const u = (now * pulse.speed + pulse.offset) % 1.0;
        const pos = pulse.curve.getPoint(u);
        pulse.mesh.position.copy(pos);
      }

      // Animate Radar Ripple Rings
      for (const ring of rippleRingsRef.current) {
        const cycle = ((now * ring.speed) % 1.0);
        const scale = 1 + cycle * (ring.maxScale - 1);
        ring.mesh.scale.set(scale, scale, scale);
        // Fade opacity toward edge of ripple
        if (ring.mesh.material && (ring.mesh.material as any).opacity !== undefined) {
          (ring.mesh.material as any).opacity = ring.baseOpacity * (1 - cycle);
        }
      }

      // Animate UNESCO Concentric Target Reticles
      for (const reticle of rotatingReticlesRef.current) {
        reticle.mesh.rotation.z += reticle.speed;
      }

      // Render Scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [onGlobeReady, onUserInteractionStart]);

  // Sync Camera When activeWaypoint Changes (if user is not manually dragging)
  useEffect(() => {
    if (isUserInteracting) return;
    if (activeWaypoint && activeWaypoint.coords) {
      flyToCoordinates(activeWaypoint.coords, activeWaypoint.flyDurationMs || 2200);
    }
  }, [activeWaypoint, isUserInteracting, flyToCoordinates]);

  // Render Official Survey of India Sovereign Boundary Ribbons
  useEffect(() => {
    const group = boundariesGroupRef.current;
    if (!group || !indiaFeatures || indiaFeatures.length === 0) return;

    group.clear();

    const activeCode = activeWaypoint?.stateCode?.toUpperCase();

    for (const feat of indiaFeatures) {
      const geom = feat.geometry;
      if (!geom) continue;

      const code = feat.properties?.code?.toUpperCase() || "";
      const isSelected = Boolean(activeCode && code === activeCode);

      const polygons =
        geom.type === "Polygon"
          ? [geom.coordinates]
          : geom.type === "MultiPolygon"
          ? geom.coordinates
          : [];

      for (const poly of polygons) {
        for (const ring of poly) {
          const points: THREE.Vector3[] = [];
          for (const coord of ring) {
            const lng = coord[0];
            const lat = coord[1];
            // Raise slightly off sphere surface so it never clips
            const elevation = isSelected ? 100.28 : 100.16;
            points.push(latLngToVector3(lat, lng, elevation));
          }

          if (points.length > 1) {
            const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
            const lineMat = new THREE.LineBasicMaterial({
              color: isSelected ? 0xf59e0b : 0x0284c7,
              linewidth: isSelected ? 2 : 1,
              transparent: true,
              opacity: isSelected ? 0.95 : 0.4,
            });
            const line = new THREE.Line(lineGeom, lineMat);
            group.add(line);
          }
        }
      }
    }
  }, [indiaFeatures, activeWaypoint]);

  // Build Animated 3D Curved Supply Arcs & Photon Pulses
  useEffect(() => {
    const arcsGroup = arcsGroupRef.current;
    const pulsesGroup = pulsesGroupRef.current;
    if (!arcsGroup || !pulsesGroup || !exportArcs) return;

    arcsGroup.clear();
    pulsesGroup.clear();
    pulseDataRef.current = [];

    const hqLat = 23.02;
    const hqLng = 72.57;
    const startPt = latLngToVector3(hqLat, hqLng, 100.25);

    exportArcs.forEach((arc, idx) => {
      const endPt = latLngToVector3(arc.endLat, arc.endLng, 100.25);
      const isGlobal = arc.color[1] === "#10b981";

      const distance = startPt.distanceTo(endPt);
      const arcElevation = GLOBE_RADIUS + Math.min(50, distance * 0.28);

      const midLat = (hqLat + arc.endLat) / 2;
      const midLng = (hqLng + arc.endLng) / 2;
      const midPt = latLngToVector3(midLat, midLng, arcElevation);

      const curve = new THREE.QuadraticBezierCurve3(startPt, midPt, endPt);
      const curvePoints = curve.getPoints(54);
      const curveGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);

      const arcMat = new THREE.LineBasicMaterial({
        color: isGlobal ? 0x10b981 : 0xf59e0b,
        transparent: true,
        opacity: isGlobal ? 0.8 : 0.65,
      });

      const arcLine = new THREE.Line(curveGeom, arcMat);
      arcsGroup.add(arcLine);

      // Photon Energy Particle Pulse traveling along curve
      const pulseGeom = new THREE.SphereGeometry(isGlobal ? 0.85 : 0.7, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: isGlobal ? 0x34d399 : 0xfef08a,
      });
      const pulseMesh = new THREE.Mesh(pulseGeom, pulseMat);
      pulsesGroup.add(pulseMesh);

      pulseDataRef.current.push({
        mesh: pulseMesh,
        curve,
        speed: 0.25 + (idx % 3) * 0.08,
        offset: (idx * 0.18) % 1.0,
      });
    });
  }, [exportArcs]);

  // Build Sleek 3D Holographic Beacon Pins (States, Global Hubs, Landmark Projects)
  useEffect(() => {
    const markersGroup = markersGroupRef.current;
    const ringsGroup = ringsGroupRef.current;
    if (!markersGroup || !ringsGroup) return;

    markersGroup.clear();
    ringsGroup.clear();
    rippleRingsRef.current = [];
    rotatingReticlesRef.current = [];

    // Helper: Align a 3D pin object along the sphere surface normal
    const orientPinToSurface = (mesh: THREE.Object3D, pos: THREE.Vector3) => {
      const normal = pos.clone().normalize();
      const up = new THREE.Vector3(0, 1, 0);
      mesh.quaternion.setFromUnitVectors(up, normal);
    };

    // 1. Indian State Hub Beacons
    states.forEach((st) => {
      const lat = Number(st.lat);
      const lng = Number(st.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const surfacePos = latLngToVector3(lat, lng, 100.1);
      const isSelected = activeWaypoint?.stateCode?.toUpperCase() === st.code.toUpperCase();
      const isHq = st.code.toUpperCase() === "GJ";

      const pinGroup = new THREE.Group();
      pinGroup.position.copy(surfacePos);
      orientPinToSurface(pinGroup, surfacePos);

      // Light Pillar Cylinder
      const beamHeight = isSelected || isHq ? 3.8 : 2.2;
      const beamGeom = new THREE.CylinderGeometry(0.12, 0.28, beamHeight, 10);
      beamGeom.translate(0, beamHeight / 2, 0);
      const beamMat = new THREE.MeshStandardMaterial({
        color: isHq ? 0xf59e0b : isSelected ? 0xf59e0b : 0x0284c7,
        emissive: isHq ? 0xd97706 : isSelected ? 0xd97706 : 0x0369a1,
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0.85,
      });
      const beamMesh = new THREE.Mesh(beamGeom, beamMat);
      pinGroup.add(beamMesh);

      // Glowing Gemstone Tip
      const tipGeom = new THREE.SphereGeometry(isSelected || isHq ? 0.9 : 0.6, 14, 14);
      const tipMat = new THREE.MeshStandardMaterial({
        color: isHq ? 0xfef08a : isSelected ? 0xfef08a : 0x38bdf8,
        emissive: isHq ? 0xf59e0b : isSelected ? 0xf59e0b : 0x0284c7,
        emissiveIntensity: 1.2,
      });
      const tipMesh = new THREE.Mesh(tipGeom, tipMat);
      tipMesh.position.set(0, beamHeight, 0);
      pinGroup.add(tipMesh);

      pinGroup.userData = {
        type: "state",
        data: st,
      };
      markersGroup.add(pinGroup);

      // Radar Ripple Ring on surface
      if (isSelected || isHq || st.projectsCompleted >= 15) {
        const ringGeom = new THREE.RingGeometry(0.6, 1.1, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: isHq || isSelected ? 0xf59e0b : 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.position.copy(surfacePos);
        ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
        ringsGroup.add(ringMesh);

        rippleRingsRef.current.push({
          mesh: ringMesh,
          initialScale: 1,
          maxScale: 2.4,
          speed: 1.8,
          baseOpacity: 0.7,
        });
      }
    });

    // 2. Global Export Gateways (Dubai, Riyadh, Doha, Singapore, Nairobi, Dar es Salaam)
    globalExportPoints.forEach((port) => {
      const surfacePos = latLngToVector3(port.lat, port.lng, 100.1);

      const pinGroup = new THREE.Group();
      pinGroup.position.copy(surfacePos);
      orientPinToSurface(pinGroup, surfacePos);

      // Green Emerald Light Pillar
      const beamGeom = new THREE.CylinderGeometry(0.15, 0.35, 2.6, 10);
      beamGeom.translate(0, 1.3, 0);
      const beamMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 1.1,
      });
      const beamMesh = new THREE.Mesh(beamGeom, beamMat);
      pinGroup.add(beamMesh);

      // Glowing Diamond Tip
      const tipGeom = new THREE.OctahedronGeometry(0.85);
      const tipMat = new THREE.MeshStandardMaterial({
        color: 0x6ee7b7,
        emissive: 0x10b981,
        emissiveIntensity: 1.3,
      });
      const tipMesh = new THREE.Mesh(tipGeom, tipMat);
      tipMesh.position.set(0, 2.6, 0);
      pinGroup.add(tipMesh);

      pinGroup.userData = {
        type: "global",
        data: port,
      };
      markersGroup.add(pinGroup);

      // Pulsing Green Radar Halo
      const haloGeom = new THREE.RingGeometry(0.7, 1.3, 20);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const haloMesh = new THREE.Mesh(haloGeom, haloMat);
      haloMesh.position.copy(surfacePos);
      haloMesh.lookAt(new THREE.Vector3(0, 0, 0));
      ringsGroup.add(haloMesh);

      rippleRingsRef.current.push({
        mesh: haloMesh,
        initialScale: 1,
        maxScale: 2.2,
        speed: 1.6,
        baseOpacity: 0.6,
      });
    });

    // 3. Landmark Infrastructure Projects
    allProjects.forEach((proj) => {
      const lat = Number(proj.lat);
      const lng = Number(proj.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const surfacePos = latLngToVector3(lat, lng, 100.1);
      const isSpotlight = activeWaypoint.project?.id === proj.id;
      const isInActiveState = Boolean(
        activeWaypoint.stateCode &&
          proj.stateCode.toUpperCase() === activeWaypoint.stateCode.toUpperCase()
      );

      const pinGroup = new THREE.Group();
      pinGroup.position.copy(surfacePos);
      orientPinToSurface(pinGroup, surfacePos);

      // Project Light Beam Pillar
      const beamHeight = isSpotlight ? 4.8 : isInActiveState ? 3.2 : 2.0;
      const beamGeom = new THREE.CylinderGeometry(
        isInActiveState || isSpotlight ? 0.12 : 0.08,
        isInActiveState || isSpotlight ? 0.28 : 0.2,
        beamHeight,
        10
      );
      beamGeom.translate(0, beamHeight / 2, 0);
      const beamMat = new THREE.MeshStandardMaterial({
        color: isSpotlight || isInActiveState ? 0xf59e0b : 0x0284c7,
        emissive: isSpotlight || isInActiveState ? 0xd97706 : 0x0369a1,
        emissiveIntensity: isSpotlight ? 1.8 : isInActiveState ? 1.3 : 0.75,
        transparent: true,
        opacity: isSpotlight || isInActiveState ? 0.95 : 0.7,
      });
      const beamMesh = new THREE.Mesh(beamGeom, beamMat);
      pinGroup.add(beamMesh);

      // Gemstone Tip
      const tipGeom = new THREE.SphereGeometry(
        isSpotlight ? 0.9 : isInActiveState ? 0.65 : 0.42,
        14,
        14
      );
      const tipMat = new THREE.MeshStandardMaterial({
        color: isSpotlight ? 0xffffff : isInActiveState ? 0xfef08a : 0x38bdf8,
        emissive: isSpotlight || isInActiveState ? 0xf59e0b : 0x0284c7,
        emissiveIntensity: isSpotlight ? 2.2 : isInActiveState ? 1.4 : 0.9,
      });
      const tipMesh = new THREE.Mesh(tipGeom, tipMat);
      tipMesh.position.set(0, beamHeight, 0);
      pinGroup.add(tipMesh);

      pinGroup.userData = {
        type: "project",
        data: proj,
      };
      markersGroup.add(pinGroup);

      // UNESCO Concentric Target Rings for Landmark Projects
      if (isSpotlight || isInActiveState) {
        // 1. Inner solid core pearl disc
        const coreGeom = new THREE.CircleGeometry(0.35, 16);
        const coreMat = new THREE.MeshBasicMaterial({
          color: isSpotlight ? 0xffffff : 0xfef08a,
          side: THREE.DoubleSide,
        });
        const coreMesh = new THREE.Mesh(coreGeom, coreMat);
        coreMesh.position.copy(surfacePos);
        coreMesh.lookAt(new THREE.Vector3(0, 0, 0));
        ringsGroup.add(coreMesh);

        // 2. Intermediate thin concentric target ring
        const innerRingGeom = new THREE.RingGeometry(0.65, 0.85, 24);
        const innerRingMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const innerRingMesh = new THREE.Mesh(innerRingGeom, innerRingMat);
        innerRingMesh.position.copy(surfacePos);
        innerRingMesh.lookAt(new THREE.Vector3(0, 0, 0));
        ringsGroup.add(innerRingMesh);

        // 3. Expanding outer radar ripple wave
        const radarGeom = new THREE.RingGeometry(0.95, 1.35, 28);
        const radarMat = new THREE.MeshBasicMaterial({
          color: 0xfbbf24,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: isSpotlight ? 0.9 : 0.65,
        });
        const radarMesh = new THREE.Mesh(radarGeom, radarMat);
        radarMesh.position.copy(surfacePos);
        radarMesh.lookAt(new THREE.Vector3(0, 0, 0));
        ringsGroup.add(radarMesh);

        rippleRingsRef.current.push({
          mesh: radarMesh,
          initialScale: 1,
          maxScale: isSpotlight ? 2.8 : 2.0,
          speed: isSpotlight ? 2.0 : 1.6,
          baseOpacity: isSpotlight ? 0.9 : 0.65,
        });

        // 4. Rotating target reticle crosshair (Active Spotlight)
        if (isSpotlight) {
          const reticleGeom = new THREE.RingGeometry(1.65, 1.95, 32);
          const reticleMat = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            side: THREE.DoubleSide,
            wireframe: true,
            transparent: true,
            opacity: 0.85,
          });
          const reticleMesh = new THREE.Mesh(reticleGeom, reticleMat);
          reticleMesh.position.copy(surfacePos);
          reticleMesh.lookAt(new THREE.Vector3(0, 0, 0));
          ringsGroup.add(reticleMesh);
          rotatingReticlesRef.current.push({ mesh: reticleMesh, speed: 0.02 });
        }
      }
    });
  }, [states, globalExportPoints, allProjects, activeWaypoint]);

  // Raycasting for Mouse Hover & Click
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      const camera = cameraRef.current;
      const markersGroup = markersGroupRef.current;
      if (!container || !camera || !markersGroup) return;

      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      mouseRef.current.x = (clientX / rect.width) * 2 - 1;
      mouseRef.current.y = -(clientY / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        markersGroup.children,
        true
      );

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData?.type && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        if (hitObj && hitObj.userData) {
          const data = hitObj.userData;

          if (data.type === "state") {
            const st: FootprintState = data.data;
            const official =
              OFFICIAL_STATE_COUNTS[st.code] ??
              (st.projectsCompleted > 0 ? `${st.projectsCompleted}` : "Active Desk");
            setHoveredInfo({
              title: st.name,
              subtitle: `${st.territory} · ${st.industry}`,
              tag: `Verified Projects: ${official}`,
              extra: "Click to orbit state corridor",
              x: clientX,
              y: clientY,
            });
            container.style.cursor = "pointer";
            return;
          }

          if (data.type === "global") {
            const port = data.data;
            setHoveredInfo({
              title: port.name,
              subtitle: port.territory,
              tag: "Verified Global Export Gateway",
              extra: "Click to orbit international corridor",
              x: clientX,
              y: clientY,
            });
            container.style.cursor = "pointer";
            return;
          }

          if (data.type === "project") {
            const proj: FootprintProject = data.data;
            setHoveredInfo({
              title: `⚡ ${proj.name}`,
              subtitle: `${proj.city} · ${proj.year}`,
              tag: proj.category,
              extra: "Click to inspect engineering specifications",
              x: clientX,
              y: clientY,
            });
            container.style.cursor = "pointer";
            return;
          }
        }
      }

      setHoveredInfo(null);
      container.style.cursor = "grab";
    },
    []
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      const camera = cameraRef.current;
      const markersGroup = markersGroupRef.current;
      if (!container || !camera || !markersGroup) return;

      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      mouseRef.current.x = (clientX / rect.width) * 2 - 1;
      mouseRef.current.y = -(clientY / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        markersGroup.children,
        true
      );

      if (intersects.length > 0) {
        onUserInteractionStart();
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData?.type && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        if (hitObj && hitObj.userData) {
          const data = hitObj.userData;
          if (data.type === "project") {
            onSelectProject(data.data);
          } else if (data.type === "state") {
            onSelectState(data.data.code);
          } else if (data.type === "global") {
            flyToCoordinates({ lat: data.data.lat, lng: data.data.lng, altitude: 1.15 }, 1800);
          }
        }
      }
    },
    [onSelectProject, onSelectState, onUserInteractionStart, flyToCoordinates]
  );

  // Quick Action Buttons
  const handleZoomIn = () => {
    onUserInteractionStart();
    if (cameraRef.current) {
      const currentDist = cameraRef.current.position.length();
      if (currentDist > MIN_CAMERA_DISTANCE + 2) {
        cameraRef.current.position.multiplyScalar(0.82);
      }
    }
  };

  const handleZoomOut = () => {
    onUserInteractionStart();
    if (cameraRef.current) {
      const currentDist = cameraRef.current.position.length();
      if (currentDist < MAX_CAMERA_DISTANCE - 10) {
        cameraRef.current.position.multiplyScalar(1.18);
      }
    }
  };

  const handleFocusIndia = () => {
    onUserInteractionStart();
    flyToCoordinates({ lat: 22.0, lng: 78.5, altitude: 1.35 }, 2000);
  };

  const handleFocusWorld = () => {
    onUserInteractionStart();
    flyToCoordinates({ lat: 20.5, lng: 50.0, altitude: 2.2 }, 2200);
  };

  const handleFocusHQ = () => {
    onUserInteractionStart();
    flyToCoordinates({ lat: 23.02, lng: 72.57, altitude: 0.85 }, 2200);
    onSelectState("GJ");
  };

  const toggleAutoRotate = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden"
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating 3D Tooltip */}
      {hoveredInfo && (
        <div
          className="pointer-events-none absolute z-50 transform -translate-x-1/2 -translate-y-full mb-3 px-4 py-2.5 rounded-xl bg-slate-950/90 backdrop-blur-xl border border-cyan-500/40 shadow-2xl text-left min-w-[210px] max-w-[320px] transition-all duration-75 ease-out"
          style={{
            left: `${hoveredInfo.x}px`,
            top: `${hoveredInfo.y}px`,
          }}
        >
          <div className="text-sm font-bold text-white flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
            {hoveredInfo.title}
          </div>
          <div className="text-xs text-slate-300 mt-0.5">{hoveredInfo.subtitle}</div>
          {hoveredInfo.tag && (
            <div className="mt-1.5 inline-block text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
              {hoveredInfo.tag}
            </div>
          )}
          {hoveredInfo.extra && (
            <div className="text-[10px] text-cyan-300/80 mt-1 italic">
              {hoveredInfo.extra}
            </div>
          )}
        </div>
      )}

      {/* Quick 3D Navigation Controls Widget (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-1.5 p-1.5 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-700/60 shadow-2xl">
        <button
          onClick={handleZoomIn}
          className="size-8 rounded-xl bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 flex items-center justify-center transition-all cursor-pointer"
          title="Zoom In"
        >
          <Plus className="size-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="size-8 rounded-xl bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 flex items-center justify-center transition-all cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="size-4" />
        </button>
        <div className="h-px bg-slate-700/60 my-0.5" />
        <button
          onClick={handleFocusIndia}
          className="size-8 rounded-xl bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-amber-400 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
          title="Focus Pan-India Sovereign Map"
        >
          🇮🇳
        </button>
        <button
          onClick={handleFocusHQ}
          className="size-8 rounded-xl bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-amber-400 flex items-center justify-center transition-all cursor-pointer"
          title="Focus Ahmedabad HQ & Manufacturing Hub"
        >
          <Zap className="size-4" />
        </button>
        <button
          onClick={handleFocusWorld}
          className="size-8 rounded-xl bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 flex items-center justify-center transition-all cursor-pointer"
          title="Reset to Orbital World View"
        >
          <Globe2 className="size-4" />
        </button>
        <button
          onClick={toggleAutoRotate}
          className="size-8 rounded-xl bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 flex items-center justify-center transition-all cursor-pointer"
          title="Toggle Earth Auto-Rotation"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </div>
  );
});

export default Universal3DGlobeCanvas;
