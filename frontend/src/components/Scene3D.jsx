import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Stars } from '@react-three/drei';

const AICore = () => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      {/* Outer wireframe layer */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.5, 1]} />
        <meshStandardMaterial color="#CCFF00" wireframe wireframeLinewidth={2} transparent opacity={0.6} emissive="#CCFF00" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Inner solid energy core */}
      <mesh>
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color="#FF4A00" emissive="#FF4A00" emissiveIntensity={2} roughness={0.2} metalness={0.8} />
      </mesh>
    </Float>
  );
};

const Scene3D = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-auto overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#CCFF00" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#FF4A00" />
        
        {/* Subtle background starfield for depth */}
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        
        {/* Interactive orbital rotation */}
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
        
        {/* Positioned slightly to the left side to sit beautifully behind typography */}
        <group position={[-2, 0, 0]}>
           <AICore />
        </group>
      </Canvas>
      
      {/* Dark gradient overlay to blend 3D canvas seamlessly into the dark background */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-[#050505]/60 to-[#050505] z-10" />
    </div>
  );
};

export default Scene3D;
