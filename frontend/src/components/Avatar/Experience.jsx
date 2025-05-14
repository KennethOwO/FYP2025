import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import Man from "../AvatarModels/Man";

const Experience = () => {
  const controls = useRef();
  const { camera} = useThree();

  // Set up camera controls and limits
  useFrame(() => {

    controls.current.target.set(-7.5, 110, 30); // Manually set the target point
    controls.current.update();

  });

  return (
    <>
      <OrbitControls
        ref={controls}
        args={[camera]}
        zoomSpeed={1}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 2.5}
        enableZoom={false}
      />
      <ambientLight />
      <directionalLight
        position={[-5, 5, 5]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <group position={[0, 0, 0]}>
        <Man />
      </group>
      <mesh
        rotation={[-0.5 * Math.PI, 0, 0]}
        position={[0, 50, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 10, 1, 1]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};

export default Experience;
