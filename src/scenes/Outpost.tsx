import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useState } from "react";
import { BUILDINGS, type BuildingName } from "../content/buildings";
function ContextGuard({
  fail,
  selected,
  onSelect,
}: {
  fail: () => void;
  selected: string;
  onSelect: (name: BuildingName) => void;
}) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      orthographic
      camera={{ position: [11, 11, 14], zoom: 40 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            fail();
          },
          { once: true },
        );
      }}
      fallback={<p>3D is unavailable. Use the lightweight view.</p>}
      aria-label="Interactive 3D view of Ares Outpost. Equivalent building controls are below the view."
    >
      <color attach="background" args={["#d5b49a"]} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 10, 3]} intensity={2.8} color="#fff3d8" />
      <Terrain selected={selected} onSelect={onSelect} />
      <OrbitControls
        enablePan={false}
        enableZoom
        minZoom={28}
        maxZoom={65}
        minPolarAngle={0.4}
        maxPolarAngle={1.2}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
function Terrain({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (name: BuildingName) => void;
}) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial color="#bf7956" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.17, 0]}>
        <ringGeometry args={[4.4, 4.47, 64]} />
        <meshStandardMaterial color="#dfa17a" />
      </mesh>
      {[-1, 1].map((i) => (
        <mesh
          key={i}
          position={[0, 0.02, 0]}
          rotation={[0, i === 1 ? 0 : Math.PI / 2, 0]}
        >
          <boxGeometry args={[0.55, 0.1, 7]} />
          <meshStandardMaterial color="#bca48c" />
        </mesh>
      ))}
      {BUILDINGS.map((b, i) => (
        <group
          key={b.name}
          position={[b.x, 0, b.z]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(b.name);
          }}
        >
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[1.1, 1.25, 0.3, 8]} />
            <meshStandardMaterial color="#8b6751" />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[1.65, 1.05, 1.5]} />
            <meshStandardMaterial
              color={b.color}
              emissive={selected === b.name ? "#806432" : "#000000"}
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[0, 1.25, 0]}>
            <cylinderGeometry args={[0.7, 1, 0.4, 4]} />
            <meshStandardMaterial color={i === 2 ? "#c4d5a4" : "#eee5d3"} />
          </mesh>
          <mesh position={[0, 0.8, 0.76]}>
            <boxGeometry args={[0.75, 0.32, 0.02]} />
            <meshStandardMaterial
              color="#384f58"
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
          {i === 5 && (
            <group position={[0, 1.6, 0]} rotation={[0.5, 0, 0.3]}>
              <mesh>
                <cylinderGeometry args={[0.75, 0.1, 0.2, 16]} />
                <meshStandardMaterial color="#f6ebd7" side={2} />
              </mesh>
              <mesh position={[0, -0.5, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 1]} />
                <meshStandardMaterial color="#56656b" />
              </mesh>
            </group>
          )}
        </group>
      ))}
      {[0, 1, 2].map((i) => (
        <group key={i} position={[4.5, 0.4, -1 + i * 1.2]}>
          <mesh rotation={[-0.35, 0, 0]}>
            <boxGeometry args={[2.2, 0.08, 0.9]} />
            <meshStandardMaterial color="#273f55" metalness={0.4} />
          </mesh>
          {[-0.7, 0, 0.7].map((x) => (
            <mesh key={x} position={[x, 0.04, 0]} rotation={[-0.35, 0, 0]}>
              <boxGeometry args={[0.025, 0.04, 0.9]} />
              <meshStandardMaterial color="#9aaeb3" />
            </mesh>
          ))}
        </group>
      ))}
      {Array.from({ length: 26 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * 2.4) * (6 + (i % 4)),
            0.05,
            Math.sin(i * 2.4) * (6 + (i % 4)),
          ]}
          rotation={[i, i * 2, 0.2]}
          scale={0.15 + (i % 3) * 0.12}
        >
          <dodecahedronGeometry />
          <meshStandardMaterial color={i % 2 ? "#a45e40" : "#cc8b60"} />
        </mesh>
      ))}
      <group position={[4.6, 0.25, 3.4]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.1, 0.45, 1.6]} />
          <meshStandardMaterial color="#e7d4b7" />
        </mesh>
        {[-0.6, 0.6].flatMap((x) =>
          [-0.5, 0.5].map((z) => (
            <mesh
              key={`${x}-${z}`}
              position={[x, 0, z]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.27, 0.27, 0.15, 10]} />
              <meshStandardMaterial color="#343b38" />
            </mesh>
          )),
        )}
        <mesh position={[0, 0.9, -0.3]}>
          <cylinderGeometry args={[0.04, 0.04, 0.8]} />
          <meshStandardMaterial color="#e5dfce" />
        </mesh>
      </group>
    </group>
  );
}
export default function Outpost({
  selected,
  onSelect,
  lightweight,
  onFail,
}: {
  selected: string;
  onSelect: (name: BuildingName) => void;
  lightweight: boolean;
  onFail: () => void;
}) {
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");
      setSupported(Boolean(gl));
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setSupported(false);
    }
  }, []);

  if (lightweight || !supported)
    return (
      <div className="flat-map" aria-label="Lightweight outpost map">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        {BUILDINGS.map((b, i) => (
          <button
            key={b.name}
            className={`map-building map-building-${i} ${selected === b.name ? "active" : ""}`}
            onClick={() => onSelect(b.name)}
          >
            <span>{"\u2302"}</span>
            {b.name}
          </button>
        ))}
        <span className="map-rover">Sampling route</span>
      </div>
    );
  return <ContextGuard fail={onFail} selected={selected} onSelect={onSelect} />;
}
