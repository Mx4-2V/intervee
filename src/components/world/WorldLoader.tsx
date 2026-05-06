import { Html } from "@react-three/drei";
import LoadingScreen from "../LoadingScreen";

export default function WorldLoader() {
  return (
    <Html center>
      <LoadingScreen
        subtitle="Preparando texturas y modelos..."
        title="Cargando Entorno 3D..."
      />
    </Html>
  );
}