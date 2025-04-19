
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox, useCylinder } from '@react-three/cannon';
import { useKeyboardControls } from './useKeyboardControls';
import * as THREE from 'three';

interface CarProps {
  position: [number, number, number];
  color?: string;
  isPlayer?: boolean;
  onUpdate?: (position: [number, number, number], velocity: number) => void;
}

const Car = ({ position, color = '#ff0000', isPlayer = false, onUpdate }: CarProps) => {
  const maxSpeed = 30;
  const acceleration = 10;
  const braking = 15;
  const turnSpeed = 0.04;
  const wheelOffset = { x: 0.7, z: 1.2, y: -0.1 };
  const gravity = 30;
  
  const [chassisRef, chassisApi] = useBox(() => ({
    mass: 500,
    position,
    args: [1.7, 0.6, 4],
    allowSleep: false,
    angularDamping: 0.9,
    linearDamping: 0.5,
  }));

  // Setup wheels with more realistic parameters
  const wheelRadius = 0.35;
  const wheelThickness = 0.25;
  
  const [flWheelRef, flWheelApi] = useCylinder(() => ({
    mass: 30,
    position: [position[0] - wheelOffset.x, position[1] - wheelOffset.y, position[2] - wheelOffset.z],
    args: [wheelRadius, wheelRadius, wheelThickness, 16],
    rotation: [0, 0, Math.PI / 2],
  }));
  
  const [frWheelRef, frWheelApi] = useCylinder(() => ({
    mass: 30,
    position: [position[0] + wheelOffset.x, position[1] - wheelOffset.y, position[2] - wheelOffset.z],
    args: [wheelRadius, wheelRadius, wheelThickness, 16],
    rotation: [0, 0, Math.PI / 2],
  }));
  
  const [blWheelRef, blWheelApi] = useCylinder(() => ({
    mass: 30,
    position: [position[0] - wheelOffset.x, position[1] - wheelOffset.y, position[2] + wheelOffset.z],
    args: [wheelRadius, wheelRadius, wheelThickness, 16],
    rotation: [0, 0, Math.PI / 2],
  }));
  
  const [brWheelRef, brWheelApi] = useCylinder(() => ({
    mass: 30,
    position: [position[0] + wheelOffset.x, position[1] - wheelOffset.y, position[2] + wheelOffset.z],
    args: [wheelRadius, wheelRadius, wheelThickness, 16],
    rotation: [0, 0, Math.PI / 2],
  }));
  
  // Car controls
  const controls = isPlayer ? useKeyboardControls() : { forward: false, back: false, left: false, right: false, nitro: false, drift: false };
  
  // Car state
  const velocity = useRef(0);
  const steering = useRef(0);
  const nitroAmount = useRef(100);
  const nitroActive = useRef(false);
  const isInAir = useRef(false);
  const nitroRefillRate = 10; // per second
  const nitroConsumptionRate = 30; // per second
  const nitroBoostMultiplier = 1.5;
  const wheelsRotation = useRef(0);

  // Ground detection
  useEffect(() => {
    const checkGroundContact = () => {
      // Simple ground check based on chassis position
      const chassisPos = new THREE.Vector3();
      if (chassisRef.current) {
        chassisRef.current.getWorldPosition(chassisPos);
        isInAir.current = chassisPos.y > 1.2; // If higher than this, we're in the air
      }
    };
    
    const interval = setInterval(checkGroundContact, 100);
    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    if (!chassisRef.current) return;
    
    // Get current state
    const forward = controls.forward;
    const back = controls.back;
    const left = controls.left;
    const right = controls.right;
    const drift = controls.drift;
    
    // Nitro handling
    if (controls.nitro && nitroAmount.current > 0 && !isInAir.current) {
      nitroActive.current = true;
      nitroAmount.current = Math.max(0, nitroAmount.current - nitroConsumptionRate * delta);
    } else {
      nitroActive.current = false;
      nitroAmount.current = Math.min(100, nitroAmount.current + nitroRefillRate * delta);
    }
    
    // Calculate acceleration and steering
    let currentAcceleration = 0;
    if (forward) currentAcceleration = acceleration;
    if (back) currentAcceleration = -braking;
    
    // Apply nitro boost
    if (nitroActive.current) {
      currentAcceleration *= nitroBoostMultiplier;
    }
    
    // Update velocity with ground friction when on ground
    if (!isInAir.current) {
      velocity.current += currentAcceleration * delta;
      velocity.current *= 0.98; // Ground friction
    } else {
      velocity.current *= 0.995; // Less drag in air
    }
    
    // Clamp max speed
    const maxCurrentSpeed = nitroActive.current ? maxSpeed * nitroBoostMultiplier : maxSpeed;
    velocity.current = Math.max(-maxSpeed/2, Math.min(maxCurrentSpeed, velocity.current));
    
    // Apply steering only when on ground
    if (!isInAir.current) {
      if (left) steering.current -= turnSpeed;
      if (right) steering.current += turnSpeed;
    }
    
    // Steering return to center and limits
    steering.current *= 0.95;
    steering.current = Math.max(-0.5, Math.min(0.5, steering.current));
    
    // Apply physics to chassis
    chassisApi.velocity.set(
      Math.sin(chassisRef.current.rotation.y) * velocity.current,
      isInAir.current ? -gravity * delta : 0, // Apply gravity if in air
      Math.cos(chassisRef.current.rotation.y) * velocity.current
    );
    
    // Apply rotation with drift factor
    const steeringAmount = steering.current * (drift && !isInAir.current ? 0.7 : 1);
    chassisApi.angularVelocity.set(0, steeringAmount * velocity.current * 0.4, 0);
    
    // Update wheel positions and rotations
    if (flWheelRef.current && frWheelRef.current && blWheelRef.current && brWheelRef.current) {
      // Calculate wheel rotation based on velocity
      wheelsRotation.current += velocity.current * 0.5 * delta;
      
      // Get chassis position and rotation
      const chassisPos = new THREE.Vector3();
      const chassisRot = new THREE.Euler();
      chassisRef.current.getWorldPosition(chassisPos);
      chassisRef.current.getWorldQuaternion(new THREE.Quaternion().setFromEuler(chassisRot));
      
      // Position wheels relative to chassis
      const frontWheelRotY = drift ? steering.current * 0.5 : 0; // Wheel turning for visuals
      
      // Front left wheel
      const flPos = new THREE.Vector3(
        chassisPos.x - Math.cos(chassisRef.current.rotation.y) * wheelOffset.x - Math.sin(chassisRef.current.rotation.y) * wheelOffset.z,
        chassisPos.y + wheelOffset.y,
        chassisPos.z - Math.sin(chassisRef.current.rotation.y) * wheelOffset.x + Math.cos(chassisRef.current.rotation.y) * wheelOffset.z
      );
      flWheelApi.position.set(flPos.x, flPos.y, flPos.z);
      flWheelApi.rotation.set(wheelsRotation.current, chassisRef.current.rotation.y + frontWheelRotY, Math.PI / 2);
      
      // Front right wheel
      const frPos = new THREE.Vector3(
        chassisPos.x + Math.cos(chassisRef.current.rotation.y) * wheelOffset.x - Math.sin(chassisRef.current.rotation.y) * wheelOffset.z,
        chassisPos.y + wheelOffset.y,
        chassisPos.z + Math.sin(chassisRef.current.rotation.y) * wheelOffset.x + Math.cos(chassisRef.current.rotation.y) * wheelOffset.z
      );
      frWheelApi.position.set(frPos.x, frPos.y, frPos.z);
      frWheelApi.rotation.set(wheelsRotation.current, chassisRef.current.rotation.y + frontWheelRotY, Math.PI / 2);
      
      // Back left wheel
      const blPos = new THREE.Vector3(
        chassisPos.x - Math.cos(chassisRef.current.rotation.y) * wheelOffset.x + Math.sin(chassisRef.current.rotation.y) * wheelOffset.z,
        chassisPos.y + wheelOffset.y,
        chassisPos.z - Math.sin(chassisRef.current.rotation.y) * wheelOffset.x - Math.cos(chassisRef.current.rotation.y) * wheelOffset.z
      );
      blWheelApi.position.set(blPos.x, blPos.y, blPos.z);
      blWheelApi.rotation.set(wheelsRotation.current, chassisRef.current.rotation.y, Math.PI / 2);
      
      // Back right wheel
      const brPos = new THREE.Vector3(
        chassisPos.x + Math.cos(chassisRef.current.rotation.y) * wheelOffset.x + Math.sin(chassisRef.current.rotation.y) * wheelOffset.z,
        chassisPos.y + wheelOffset.y,
        chassisPos.z + Math.sin(chassisRef.current.rotation.y) * wheelOffset.x - Math.cos(chassisRef.current.rotation.y) * wheelOffset.z
      );
      brWheelApi.position.set(brPos.x, brPos.y, brPos.z);
      brWheelApi.rotation.set(wheelsRotation.current, chassisRef.current.rotation.y, Math.PI / 2);
    }
    
    // Get current position
    const position: [number, number, number] = [0, 0, 0];
    const worldPos = new THREE.Vector3();
    chassisRef.current.getWorldPosition(worldPos);
    position[0] = worldPos.x;
    position[1] = worldPos.y;
    position[2] = worldPos.z;
    
    // Update callback
    if (isPlayer && onUpdate) {
      onUpdate(position, Math.abs(velocity.current));
    }
  });

  return (
    <group>
      <mesh ref={chassisRef as any} castShadow>
        {/* Car body */}
        <boxGeometry args={[1.7, 0.6, 4]} />
        <meshStandardMaterial color={color} />
        
        {/* Car cabin */}
        <mesh position={[0, 0.5, -0.5]}>
          <boxGeometry args={[1.5, 0.5, 1.8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        
        {/* Car hood */}
        <mesh position={[0, 0.2, 1.5]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[1.65, 0.4, 0.9]} />
          <meshStandardMaterial color={color} />
        </mesh>
        
        {/* Car spoiler */}
        <mesh position={[0, 0.7, -1.8]}>
          <boxGeometry args={[1.4, 0.1, 0.5]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        
        {/* Headlights */}
        <mesh position={[0.5, 0, 1.9]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
          <meshStandardMaterial 
            color="#ffffaa" 
            emissive="#ffffaa" 
            emissiveIntensity={1} 
          />
        </mesh>
        
        <mesh position={[-0.5, 0, 1.9]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
          <meshStandardMaterial 
            color="#ffffaa" 
            emissive="#ffffaa" 
            emissiveIntensity={1} 
          />
        </mesh>
        
        {/* Taillights */}
        <mesh position={[0.6, 0, -1.9]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.2, 0.1, 0.05]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000" 
            emissiveIntensity={0.8} 
          />
        </mesh>
        
        <mesh position={[-0.6, 0, -1.9]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.2, 0.1, 0.05]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000" 
            emissiveIntensity={0.8} 
          />
        </mesh>
      </mesh>
      
      {/* Visible Wheels */}
      <mesh ref={flWheelRef as any} castShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
        <meshStandardMaterial color="#222222" />
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.2, 0.2, wheelThickness + 0.01, 12]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      </mesh>
      
      <mesh ref={frWheelRef as any} castShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
        <meshStandardMaterial color="#222222" />
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.2, 0.2, wheelThickness + 0.01, 12]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      </mesh>
      
      <mesh ref={blWheelRef as any} castShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
        <meshStandardMaterial color="#222222" />
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.2, 0.2, wheelThickness + 0.01, 12]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      </mesh>
      
      <mesh ref={brWheelRef as any} castShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
        <meshStandardMaterial color="#222222" />
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.2, 0.2, wheelThickness + 0.01, 12]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      </mesh>
      
      {/* Nitro particles when active */}
      {nitroActive.current && (
        <>
          <mesh position={[0.4, 0, -2]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.1, 0.5, 8]} />
            <meshStandardMaterial 
              color="#00aaff" 
              emissive="#00ffff" 
              emissiveIntensity={2} 
              transparent
              opacity={0.8}
            />
          </mesh>
          
          <mesh position={[-0.4, 0, -2]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.1, 0.5, 8]} />
            <meshStandardMaterial 
              color="#00aaff" 
              emissive="#00ffff" 
              emissiveIntensity={2}
              transparent
              opacity={0.8}
            />
          </mesh>
        </>
      )}
    </group>
  );
};

export default Car;
