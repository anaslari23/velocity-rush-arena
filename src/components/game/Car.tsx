
import React, { useRef } from 'react';
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
  const acceleration = 12;
  const braking = 15;
  const turnSpeed = 0.05;
  const driftFactor = 0.9;
  const drag = 0.99;
  const wheelOffset = { x: 0.7, z: 1.2, y: 0 };
  
  const [chassisRef, chassisApi] = useBox(() => ({
    mass: 500,
    type: 'Dynamic',
    position,
    args: [1.7, 0.6, 4],
    allowSleep: false,
    angularDamping: 0.9,
    linearDamping: 0.5,
  }));

  // Setup wheels
  const wheelRadius = 0.3;
  const wheelThickness = 0.2;
  
  const [flWheelRef] = useCylinder(() => ({
    mass: 50,
    type: 'Dynamic',
    position: [position[0] - wheelOffset.x, position[1] - wheelOffset.y, position[2] - wheelOffset.z],
    args: [wheelRadius, wheelRadius, wheelThickness, 16],
    rotation: [0, 0, Math.PI / 2],
  }));
  
  const [frWheelRef] = useCylinder(() => ({
    mass: 50,
    type: 'Dynamic',
    position: [position[0] + wheelOffset.x, position[1] - wheelOffset.y, position[2] - wheelOffset.z],
    args: [wheelRadius, wheelRadius, wheelThickness, 16],
    rotation: [0, 0, Math.PI / 2],
  }));
  
  const [blWheelRef] = useCylinder(() => ({
    mass: 50,
    type: 'Dynamic',
    position: [position[0] - wheelOffset.x, position[1] - wheelOffset.y, position[2] + wheelOffset.z],
    args: [wheelRadius, wheelRadius, wheelThickness, 16],
    rotation: [0, 0, Math.PI / 2],
  }));
  
  const [brWheelRef] = useCylinder(() => ({
    mass: 50,
    type: 'Dynamic',
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
  const nitroRefillRate = 10; // per second
  const nitroConsumptionRate = 30; // per second
  const nitroBoostMultiplier = 1.5;

  // AI behavior for non-player cars
  const aiWaypoint = useRef(0);
  const aiTargetPos = useRef([0, 0, 0]);

  useFrame((state, delta) => {
    if (!chassisRef.current) return;
    
    // Get current state
    const forward = controls.forward;
    const back = controls.back;
    const left = controls.left;
    const right = controls.right;
    const drift = controls.drift;
    
    // Nitro handling
    if (controls.nitro && nitroAmount.current > 0) {
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
    
    // Update velocity
    velocity.current += currentAcceleration * delta;
    velocity.current *= drag; // Apply drag
    
    // Clamp max speed
    const maxCurrentSpeed = nitroActive.current ? maxSpeed * nitroBoostMultiplier : maxSpeed;
    velocity.current = Math.max(-maxSpeed/2, Math.min(maxCurrentSpeed, velocity.current));
    
    // Apply steering
    if (left) steering.current -= turnSpeed;
    if (right) steering.current += turnSpeed;
    
    // Steering return to center and limits
    steering.current *= 0.9;
    steering.current = Math.max(-0.5, Math.min(0.5, steering.current));
    
    // Apply physics
    chassisApi.velocity.set(
      Math.sin(chassisRef.current.rotation.y) * velocity.current,
      0,
      Math.cos(chassisRef.current.rotation.y) * velocity.current
    );
    
    // Apply rotation
    const steeringAmount = steering.current * (drift ? driftFactor : 1);
    chassisApi.angularVelocity.set(0, steeringAmount * velocity.current * 0.5, 0);
    
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
        <mesh position={[0, 0.6, -0.5]}>
          <boxGeometry args={[1.5, 0.5, 1.8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        
        {/* Car front */}
        <mesh position={[0, 0, 1.5]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[1.65, 0.4, 0.9]} />
          <meshStandardMaterial color={color} />
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
      
      {/* Wheels */}
      <mesh ref={flWheelRef as any} castShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      
      <mesh ref={frWheelRef as any} castShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      
      <mesh ref={blWheelRef as any} castShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      
      <mesh ref={brWheelRef as any} castShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
        <meshStandardMaterial color="#222222" />
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
            />
          </mesh>
          
          <mesh position={[-0.4, 0, -2]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.1, 0.5, 8]} />
            <meshStandardMaterial 
              color="#00aaff" 
              emissive="#00ffff" 
              emissiveIntensity={2} 
            />
          </mesh>
        </>
      )}
    </group>
  );
};

export default Car;
