// src/components/world/WorldLoader.tsx
import { Html } from "@react-three/drei";

export default function WorldLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-gray-950 text-white">
        {/* Tu Spinner */}
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        
        {/* Tu Texto */}
        <h1 className="text-3xl font-bold mt-8 animate-pulse text-center">
          Cargando Entorno 3D...
        </h1>
        <p className="text-gray-400 mt-4 text-center max-w-sm px-4">
          Preparando texturas y modelos...
        </p>
      </div>
    </Html>
  );
}