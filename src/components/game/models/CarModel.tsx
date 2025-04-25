import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Car } from '../../garage/types';
import * as THREE from 'three';

interface CarModelProps {
  car: Car & {
    nitroActive?: boolean;
    velocity?: THREE.Vector3;
    acceleration?: THREE.Vector3;
    steering?: number;
    throttle?: number;
    brake?: number;
  };
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  isPlayerCar?: boolean;
  onPhysicsUpdate?: (position: THREE.Vector3, rotation: THREE.Euler) => void;
}

const CarModel: React.FC<CarModelProps> = ({ 
  car, 
  position, 
  rotation, 
  scale,
  isPlayerCar = false,
  onPhysicsUpdate
}) => {
  const { nodes, materials } = useGLTF('/models/car.glb') as any;
  
  // Physics-related refs
  const carRef = useRef<THREE.Group>(null);
  const wheelRefs = useRef<THREE.Mesh[]>([]);
  const nitroRef = useRef<THREE.Mesh>(null);
  
  // Physics parameters
  const engineForce = 25;
  const brakingForce = 35;
  const maxSteerAngle = 0.5;
  const steeringSpeed = 2.5;
  const wheelBase = 2.5;
  const gravity = new THREE.Vector3(0, -9.81, 0);
  const dragCoefficient = 0.3;
  const rollingResistance = 0.01;

  // Initialize physics state
  const physicsState = useRef({
    velocity: new THREE.Vector3(),
    acceleration: new THREE.Vector3(),
    steering: 0,
    wheelRotation: 0,
    isGrounded: true,
    suspensionHeight: 0.5,
    suspensionForce: new THREE.Vector3()
  });

  useFrame((state, delta) => {
    if (!carRef.current) return;

    const physics = physicsState.current;
    
    // Update steering
    if (car.steering) {
      physics.steering = THREE.MathUtils.lerp(
        physics.steering,
        car.steering * maxSteerAngle,
        delta * steeringSpeed
      );
    }

    // Calculate forces
    const forwardDir = new THREE.Vector3(0, 0, 1).applyEuler(carRef.current.rotation);
    
    // Engine force
    let enginePower = (car.throttle || 0) * engineForce;
    if (car.nitroActive) enginePower *= 1.5;
    
    // Braking force
    const brakePower = (car.brake || 0) * brakingForce;
    
    // Apply forces
    physics.acceleration.copy(forwardDir).multiplyScalar(enginePower);
    physics.acceleration.add(gravity);
    
    // Apply drag
    const speed = physics.velocity.length();
    const drag = physics.velocity.clone().normalize().multiplyScalar(-dragCoefficient * speed * speed);
    physics.acceleration.add(drag);
    
    // Apply rolling resistance
    const rolling = physics.velocity.clone().normalize().multiplyScalar(-rollingResistance);
    physics.acceleration.add(rolling);
    
    // Update velocity
    physics.velocity.add(physics.acceleration.multiplyScalar(delta));
    
    // Apply steering
    if (Math.abs(physics.steering) > 0.01) {
      const turnRadius = wheelBase / Math.sin(Math.abs(physics.steering));
      const angularVelocity = speed / turnRadius * Math.sign(physics.steering);
      carRef.current.rotation.y += angularVelocity * delta;
    }
    
    // Update position
    carRef.current.position.add(physics.velocity.clone().multiplyScalar(delta));
    
    // Animate wheels
    const wheelSpeed = speed * 2;
    physics.wheelRotation += wheelSpeed * delta;
    
    wheelRefs.current?.forEach((wheel, index) => {
      if (wheel) {
        wheel.rotation.x = physics.wheelRotation;
        // Apply steering to front wheels
        if (index < 2) {
          wheel.rotation.y = physics.steering;
        }
      }
    });

    // Update nitro effect
    if (nitroRef.current && isPlayerCar) {
      nitroRef.current.visible = car.nitroActive || false;
      if (car.nitroActive) {
        nitroRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.2;
      }
    }

    // Notify parent component of physics updates
    if (onPhysicsUpdate) {
      onPhysicsUpdate(carRef.current.position, carRef.current.rotation);
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale} ref={carRef}>
      {/* Car body */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 0.5, 4]} />
        <meshStandardMaterial color={car.customization.color} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Car cabin */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[1.5, 0.6, 2]} />
        <meshStandardMaterial color="#111111" metalness={0.2} roughness={0.5} />
      </mesh>

      {/* Wheels */}
      {[
        [-0.9, 0.3, 1], // Front Left
        [0.9, 0.3, 1],  // Front Right
        [-0.9, 0.3, -1], // Back Left
        [0.9, 0.3, -1]  // Back Right
      ].map((wheelPos, index) => (
        <mesh
          key={index}
          ref={el => wheelRefs.current[index] = el!}
          position={wheelPos as [number, number, number]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
          <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Spoiler (if enabled) */}
      {car.customization.spoiler !== 'none' && (
        <group position={[0, 1, -1.8]}>
          <mesh castShadow>
            <boxGeometry 
              args={[
                1.4, 
                0.1, 
                0.3
              ]} 
            />
            <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Spoiler supports */}
          <mesh position={[0.5, -0.2, 0]} castShadow>
            <boxGeometry args={[0.1, 0.4, 0.2]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
          <mesh position={[-0.5, -0.2, 0]} castShadow>
            <boxGeometry args={[0.1, 0.4, 0.2]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
        </group>
      )}

      {/* Headlights */}
      <mesh position={[0.6, 0.5, 1.9]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </mesh>
      <mesh position={[-0.6, 0.5, 1.9]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </mesh>

      {/* Taillights */}
      <mesh position={[0.6, 0.5, -1.9]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
      </mesh>
      <mesh position={[-0.6, 0.5, -1.9]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
      </mesh>

      {/* Nitro effect */}
      {isPlayerCar && (
        <group position={[0, 0.5, -2]}>
          <mesh ref={nitroRef} visible={false}>
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

useGLTF.preload('/models/car.glb');

export default CarModel;