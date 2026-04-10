"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";
import { useStore } from "~/lib/store";

// Componente de ejemplo 3D
function Box(props: { position: [number, number, number] }) {
  const { position } = props;
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const increment = useStore((state) => state.increment);

  return (
    <mesh
      position={position}
      scale={clicked ? 1.5 : 1}
      onClick={() => {
        setClicked(!clicked);
        increment();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

// Escena 3D
function Scene() {
  const count = useStore((state) => state.count);

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
      <OrbitControls />
      <div className="absolute top-4 left-4 rounded bg-black/50 p-4 text-white">
        <p>Clics: {count}</p>
        <p className="text-sm text-gray-300">Haz clic en los cubos!</p>
      </div>
    </>
  );
}

// Componente principal
export default function VirtualWorld() {
  return (
    <div className="h-screen w-full">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Scene />
      </Canvas>
    </div>
  );
}
