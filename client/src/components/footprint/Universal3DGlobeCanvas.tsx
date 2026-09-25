import React, { useCallback, useEffect, useRef } from "react";
import { WORLD_CONTINENTS } from "./worldContinentsData";
import type { CinematicWaypoint, FootprintProject, FootprintState } from "./GlobeProjectsExperience";

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
}

// 3D Spherical Orthographic Projection: Projects latitude & longitude onto a 3D rotating globe
export function projectSpherical(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  radius: number,
  canvasW: number,
  canvasH: number
): { x: number; y: number; visible: boolean; cosC: number } {
  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;
  const phi0 = (centerLat * Math.PI) / 180;
  const lambda0 = (centerLng * Math.PI) / 180;

  const cosC =
    Math.sin(phi0) * Math.sin(phi) +
    Math.cos(phi0) * Math.cos(phi) * Math.cos(lambda - lambda0);

  if (cosC < -0.05) {
    // Backside of the Earth
    return { x: 0, y: 0, visible: false, cosC };
  }

  const x = canvasW / 2 + radius * Math.cos(phi) * Math.sin(lambda - lambda0);
  const y =
    canvasH / 2 -
    radius *
      (Math.cos(phi0) * Math.sin(phi) -
        Math.sin(phi0) * Math.cos(phi) * Math.cos(lambda - lambda0));

  return { x, y, visible: true, cosC };
}

export default function Universal3DGlobeCanvas({
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
}: Universal3DGlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Camera Physics State (Smoothed Lat, Lng, Radius)
  const cameraRef = useRef({
    lat: 20.5,
    lng: 45.0,
    radius: 260,
  });

  const targetCameraRef = useRef({
    lat: 20.5,
    lng: 45.0,
    radius: 260,
  });

  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);
  const pulsePhaseRef = useRef(0);

  // Sync target camera when activeWaypoint changes
  useEffect(() => {
    if (isUserInteracting) return;

    const baseRadius = 260;
    let targetR = baseRadius;

    if (activeWaypoint.type === "world") {
      targetR = baseRadius;
    } else if (activeWaypoint.type === "asia") {
      targetR = baseRadius * 1.55;
    } else if (activeWaypoint.type === "india") {
      targetR = baseRadius * 2.5;
    } else if (activeWaypoint.type === "state") {
      targetR = baseRadius * 4.2;
    } else if (activeWaypoint.type === "city") {
      targetR = baseRadius * 7.5;
    } else if (activeWaypoint.type === "project") {
      targetR = baseRadius * 11.0;
    }

    targetCameraRef.current = {
      lat: activeWaypoint.coords.lat,
      lng: activeWaypoint.coords.lng,
      radius: targetR,
    };
  }, [activeWaypoint, isUserInteracting]);

  // Main 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let isRunning = true;

    // Fixed stars background
    const stars: Array<{ x: number; y: number; r: number; alpha: number }> = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.3 + 0.5,
        alpha: Math.random() * 0.7 + 0.25,
      });
    }

    const render = () => {
      if (!isRunning) return;

      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      pulsePhaseRef.current = (pulsePhaseRef.current + 0.04) % (Math.PI * 2);

      // Auto-rotation in world mode if not user interacting
      if (activeWaypoint.type === "world" && !isUserInteracting && !isDraggingRef.current) {
        targetCameraRef.current.lng = (targetCameraRef.current.lng + 0.12) % 360;
      }

      // Smooth camera interpolation
      const cam = cameraRef.current;
      const target = targetCameraRef.current;
      const lerpSpeed = isDraggingRef.current ? 0.2 : 0.065;

      cam.lat += (target.lat - cam.lat) * lerpSpeed;

      // Handle longitude wrap-around
      let dLng = target.lng - cam.lng;
      while (dLng > 180) dLng -= 360;
      while (dLng < -180) dLng += 360;
      cam.lng += dLng * lerpSpeed;
      cam.radius += (target.radius - cam.radius) * lerpSpeed;

      const cx = w / 2;
      const cy = h / 2;
      const R = cam.radius;

      // 1. Deep Space Background
      ctx.fillStyle = "#030c17";
      ctx.fillRect(0, 0, w, h);

      // Draw starry universe
      for (const s of stars) {
        ctx.fillStyle = `rgba(215, 235, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Outer Atmospheric Glow
      const atmosGrad = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.2);
      atmosGrad.addColorStop(0, "rgba(56, 189, 248, 0.35)");
      atmosGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.12)");
      atmosGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = atmosGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // 3. Globe Sphere (Clipping Mask)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // 3A. Ocean Base with 3D Spherical Curvature Lighting
      const lightX = cx - R * 0.35;
      const lightY = cy - R * 0.35;
      const oceanGrad = ctx.createRadialGradient(lightX, lightY, R * 0.1, cx, cy, R);
      oceanGrad.addColorStop(0, "#0e3a5f"); // Illuminated sunlit ocean
      oceanGrad.addColorStop(0.65, "#082138");
      oceanGrad.addColorStop(1, "#030f1c"); // Shadow limb
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // 3B. World Continents (Rendered on sphere)
      for (const continent of WORLD_CONTINENTS) {
        ctx.beginPath();
        let started = false;

        for (const [lng, lat] of continent.coordinates) {
          const pt = projectSpherical(lat, lng, cam.lat, cam.lng, R, w, h);
          if (pt.visible) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
        }

        if (started) {
          ctx.closePath();
          ctx.fillStyle = "#0c273e";
          ctx.fill();
          ctx.strokeStyle = "#16446a";
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      }

      // 3C. Official Survey of India Sovereign Boundaries
      if (indiaFeatures && indiaFeatures.length > 0) {
        for (const feat of indiaFeatures) {
          const geom = feat.geometry;
          if (!geom) continue;

          const stateCode = feat.properties?.code || "";
          const stateName = feat.properties?.NAME_1 || feat.properties?.STATE || "";
          const isSelected =
            (stateCode && activeWaypoint.stateCode && stateCode.toUpperCase() === activeWaypoint.stateCode.toUpperCase()) ||
            (activeWaypoint.stateName && stateName.toLowerCase() === activeWaypoint.stateName.toLowerCase());

          const polygons =
            geom.type === "Polygon" ? [geom.coordinates] : geom.type === "MultiPolygon" ? geom.coordinates : [];

          for (const poly of polygons) {
            for (const ring of poly) {
              ctx.beginPath();
              let started = false;

              for (const coord of ring) {
                const lng = coord[0];
                const lat = coord[1];
                const pt = projectSpherical(lat, lng, cam.lat, cam.lng, R, w, h);
                if (pt.visible) {
                  if (!started) {
                    ctx.moveTo(pt.x, pt.y);
                    started = true;
                  } else {
                    ctx.lineTo(pt.x, pt.y);
                  }
                }
              }

              if (started) {
                if (isSelected) {
                  ctx.fillStyle = "rgba(242, 184, 75, 0.38)";
                  ctx.fill();
                  ctx.strokeStyle = "#f2b84b";
                  ctx.lineWidth = 2.2;
                  ctx.stroke();
                } else {
                  ctx.fillStyle = "rgba(10, 42, 68, 0.4)";
                  ctx.fill();
                  ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
                  ctx.lineWidth = 0.9;
                  ctx.stroke();
                }
              }
            }
          }
        }
      }

      // 3D Shading Overlay (Simulate 3D planetary limb shadowing)
      const shadowGrad = ctx.createRadialGradient(lightX, lightY, R * 0.4, cx, cy, R);
      shadowGrad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
      shadowGrad.addColorStop(0.7, "rgba(0, 0, 0, 0)");
      shadowGrad.addColorStop(1, "rgba(0, 5, 12, 0.65)");
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      ctx.restore(); // Restore clipping mask

      // 4. 3D Animated Curved Supply Arcs (Ahmdedabad HQ -> Global & Domestic)
      const hq = { lat: 23.02, lng: 72.57 };
      const hqPt = projectSpherical(hq.lat, hq.lng, cam.lat, cam.lng, R, w, h);

      for (const arc of exportArcs) {
        const destPt = projectSpherical(arc.endLat, arc.endLng, cam.lat, cam.lng, R, w, h);

        if (hqPt.visible && destPt.visible) {
          const midLat = (hq.lat + arc.endLat) / 2;
          const midLng = (hq.lng + arc.endLng) / 2;
          const arcElevation = R * 1.15; // Raised into 3D space
          const midPt = projectSpherical(midLat, midLng, cam.lat, cam.lng, arcElevation, w, h);

          if (midPt.visible) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(hqPt.x, hqPt.y);
            ctx.quadraticCurveTo(midPt.x, midPt.y, destPt.x, destPt.y);

            const isGlobalArc = arc.color[1] === "#10b981";
            ctx.strokeStyle = isGlobalArc ? "rgba(16, 185, 129, 0.75)" : "rgba(242, 184, 75, 0.6)";
            ctx.lineWidth = 1.6;
            ctx.setLineDash([4, 6]);
            ctx.stroke();

            // Animated Energy Pulse along arc
            const t = ((pulsePhaseRef.current / (Math.PI * 2)) + arc.endLat * 0.1) % 1;
            const px = (1 - t) * (1 - t) * hqPt.x + 2 * (1 - t) * t * midPt.x + t * t * destPt.x;
            const py = (1 - t) * (1 - t) * hqPt.y + 2 * (1 - t) * t * midPt.y + t * t * destPt.y;

            ctx.fillStyle = isGlobalArc ? "#34d399" : "#fcd34d";
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // 5. Global Export Gateways (Dubai, Riyadh, Doha, Singapore, Nairobi, Dar es Salaam)
      for (const port of globalExportPoints) {
        const pt = projectSpherical(port.lat, port.lng, cam.lat, cam.lng, R, w, h);
        if (pt.visible) {
          ctx.fillStyle = "#10b981";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#34d399";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Label
          if (R < 900) {
            ctx.fillStyle = "#a7f3d0";
            ctx.font = "bold 9px system-ui, -apple-system, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(port.name, pt.x, pt.y - 8);
          }
        }
      }

      // 6. Indian State Hub Beacons
      for (const st of states) {
        const pt = projectSpherical(Number(st.lat), Number(st.lng), cam.lat, cam.lng, R, w, h);
        if (pt.visible) {
          const isSelected = activeWaypoint.stateCode?.toUpperCase() === st.code.toUpperCase();

          ctx.fillStyle = isSelected ? "#f2b84b" : "#38bdf8";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isSelected ? 6.5 : 3.5, 0, Math.PI * 2);
          ctx.fill();

          if (isSelected) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2.0;
            ctx.stroke();

            // Ripple ring on selected state
            const ringR = 12 + Math.sin(pulsePhaseRef.current) * 5;
            ctx.strokeStyle = "rgba(242, 184, 75, 0.7)";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, ringR, 0, Math.PI * 2);
            ctx.stroke();
          }

          // State Name Tag if zoomed in
          if (R >= 800 || isSelected) {
            ctx.fillStyle = isSelected ? "#fef08a" : "#bae6fd";
            ctx.font = isSelected ? "bold 11px system-ui, sans-serif" : "9px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(st.name, pt.x, pt.y - (isSelected ? 14 : 7));
          }
        }
      }

      // 7. Verified Landmark Projects Beacons (When Zoomed into State or City)
      if (R >= 1200) {
        for (const proj of allProjects) {
          const pt = projectSpherical(Number(proj.lat), Number(proj.lng), cam.lat, cam.lng, R, w, h);
          if (pt.visible) {
            const isActive = activeWaypoint.project?.id === proj.id;

            // Beacon core
            ctx.fillStyle = isActive ? "#ffffff" : "#f2b84b";
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, isActive ? 7.0 : 4.0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = isActive ? "#f2b84b" : "#d97706";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Expanding ripple wave on spotlighted project
            if (isActive) {
              const waveR1 = 14 + Math.sin(pulsePhaseRef.current) * 6;
              const waveR2 = 22 + Math.sin(pulsePhaseRef.current + 1) * 7;
              ctx.strokeStyle = "rgba(242, 184, 75, 0.65)";
              ctx.lineWidth = 1.6;
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, waveR1, 0, Math.PI * 2);
              ctx.stroke();

              ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, waveR2, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Project Name Pill
            ctx.fillStyle = isActive ? "#f2b84b" : "#e2e8f0";
            ctx.font = isActive ? "bold 12px system-ui, sans-serif" : "10px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`⚡ ${proj.name}`, pt.x, pt.y - 12);
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [
    activeWaypoint,
    states,
    allProjects,
    indiaFeatures,
    exportArcs,
    globalExportPoints,
    isUserInteracting,
  ]);

  // Handle Resize of Canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mouse & Touch Drag Controls (3D Spherical Rotation)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      onUserInteractionStart();
    },
    [onUserInteractionStart]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    const R = cameraRef.current.radius;
    const sensitivity = (180 / (R * Math.PI)) * 1.4;

    targetCameraRef.current.lng -= dx * sensitivity;
    targetCameraRef.current.lat += dy * sensitivity;
    targetCameraRef.current.lat = Math.max(-85, Math.min(85, targetCameraRef.current.lat));
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // Wheel Zoom Control
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      onUserInteractionStart();
      const zoomFactor = e.deltaY > 0 ? 0.88 : 1.14;
      targetCameraRef.current.radius = Math.max(
        180,
        Math.min(4800, targetCameraRef.current.radius * zoomFactor)
      );
    },
    [onUserInteractionStart]
  );

  // Click on Canvas: Detect if user clicked a project beacon or state
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const clickX = (e.clientX - rect.left) * dpr;
      const clickY = (e.clientY - rect.top) * dpr;

      const cam = cameraRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Check projects first (if zoomed in)
      if (cam.radius >= 1000) {
        for (const proj of allProjects) {
          const pt = projectSpherical(Number(proj.lat), Number(proj.lng), cam.lat, cam.lng, cam.radius, w, h);
          if (pt.visible) {
            const dist = Math.hypot(pt.x - clickX, pt.y - clickY);
            if (dist < 18 * dpr) {
              onSelectProject(proj);
              return;
            }
          }
        }
      }

      // Check states
      for (const st of states) {
        const pt = projectSpherical(Number(st.lat), Number(st.lng), cam.lat, cam.lng, cam.radius, w, h);
        if (pt.visible) {
          const dist = Math.hypot(pt.x - clickX, pt.y - clickY);
          if (dist < 16 * dpr) {
            onSelectState(st.code);
            return;
          }
        }
      }
    },
    [allProjects, states, onSelectProject, onSelectState]
  );

  return (
    <canvas
      ref={canvasRef}
      className="universal-3d-globe-canvas"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        cursor: isDraggingRef.current ? "grabbing" : "grab",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onClick={handleCanvasClick}
    />
  );
}
