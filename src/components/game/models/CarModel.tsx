import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Car } from '../../garage/types';
import * as THREE from 'three';

interface CarModelProps {
  car: Car & {
    nitroActive?: boolean;
  };
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  isPlayerCar?: boolean;
}

const CarModel: React.FC<CarModelProps> = ({ 
  car, 
  position, 
  rotation, 
  scale,
  isPlayerCar = false 
}) => {
  // Load the car model
  const { nodes, materials } = useGLTF('/models/car.glb');
  
  // Create refs for animated parts
  const wheelRefs = useRef<THREE.Mesh[]>([]);
  const nitroRef = useRef<THREE.Mesh>(null);
  const carRef = useRef<THREE.Group>(null);

  // Initialize wheel refs if not already set
  React.useEffect(() => {
    if (nodes) {
      wheelRefs.current = [
        nodes.WheelFL,
        nodes.WheelFR,
        nodes.WheelBL,
        nodes.WheelBR
      ].filter(Boolean) as THREE.Mesh[];
    }
  }, [nodes]);

  useFrame((state, delta) => {
    // Animate wheels if they exist
    wheelRefs.current?.forEach((wheel) => {
      if (wheel) {
        wheel.rotation.x += delta * 2;
      }
    });

    // Animate nitro effect
    if (nitroRef.current && isPlayerCar) {
      const isNitroActive = car.nitroActive || false;
      nitroRef.current.visible = isNitroActive;
      if (isNitroActive) {
        nitroRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.2;
      }
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale} ref={carRef}>
      {/* Main car model */}
      {nodes.Car && <primitive object={nodes.Car} />}
      
      {/* Apply custom materials safely */}
      {materials && Object.entries(materials).map(([key, material]) => {
        try {
          if (material instanceof THREE.MeshStandardMaterial) {
            if (key.toLowerCase().includes('body')) {
              material.color = new THREE.Color(car.customization.color || '#ff0000');
              material.metalness = 0.6;
              material.roughness = 0.4;
            }
          }
        } catch (error) {
          console.warn(`Failed to modify material ${key}:`, error);
        }
        return null;
      })}

      {/* Wheels */}
      {wheelRefs.current.map((wheel, index) => (
        wheel && (
          <primitive 
            key={`wheel-${index}`}
            object={wheel}
            rotation={[0, 0, Math.PI / 2]}
          />
        )
      ))}

      {/* Spoiler */}
      {car.customization.spoiler !== 'none' && nodes.Spoiler && (
        <primitive 
          object={nodes.Spoiler}
          visible={true}
          scale={car.customization.spoiler === 'large' ? 1.2 : 1}
        />
      )}
      
      {/* Enhanced nitro effect */}
      {isPlayerCar && (
        <group position={[0, 0, 2]}>
          <mesh 
            ref={nitroRef}
            visible={false}
          >
            <coneGeometry args={[0.2, 1, 16]} />
            <meshStandardMaterial 
              color={car.customization.nitroColor} 
              emissive={car.customization.nitroColor}
              emissiveIntensity={2}
              transparent
              opacity={0.6}
            />
          </mesh>
          <pointLight
            color={car.customization.nitroColor}
            intensity={2}
            distance={3}
            decay={2}
            visible={car.nitroActive}
          />
        </group>
      )}
    </group>
  );
};

// Pre-load the model
useGLTF.preload('/models/car.glb');

export default CarModel;