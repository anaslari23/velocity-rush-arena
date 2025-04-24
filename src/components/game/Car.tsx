
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox, useCylinder } from '@react-three/cannon';
import { useKeyboardControls } from './useKeyboardControls';
import { useTouchControls } from './useTouchControls';
import { useTiltControls } from './useTiltControls';
import * as THREE from 'three';
import { CarStats, CarCustomization } from './types';
import { Controls } from './useKeyboardControls';

interface CarProps {
  position: [number, number, number];
  rotation?: number;
  color?: string;
  isPlayer?: boolean;
  carStats?: CarStats;
  customization?: CarCustomization;
  nitroAmount?: number;
  controlType?: 'keyboard' | 'touch' | 'tilt';
  onUpdate?: (
    position: [number, number, number], 
    velocity: number, 
    rotation: number, 
    isNitroActive: boolean, 
    isDrifting: boolean
  ) => void;
}

const Car = ({ 
  position, 
  rotation = 0,
  color = '#ff0000', 
  isPlayer = false, 
  carStats,
  customization,
  nitroAmount = 100,
  controlType = 'keyboard',
  onUpdate 
}: CarProps) => {
  // Default car stats if none provided
  const defaultStats: CarStats = {
    speed: 75,
    acceleration: 70,
    handling: 80,
    braking: 75,
    nitro: 70
  };
  
  const stats = carStats || defaultStats;
  
  // Default customization if none provided
  const defaultCustomization: CarCustomization = {
    color: color,
    wheelType: 'standard',
    spoiler: 'medium',
    nitroColor: '#00ffff'
  };
  
  const carCustomization = customization || defaultCustomization;
  
  // Calculate physics parameters based on car stats
  const maxSpeed = 35 + (stats.speed / 100) * 25; // 35-60 range
  const acceleration = 10 + (stats.acceleration / 100) * 15; // 10-25 range
  const braking = 15 + (stats.braking / 100) * 20; // 15-35 range
  const turnSpeed = 0.03 + (stats.handling / 100) * 0.04; // 0.03-0.07 range
  const nitroBoostMultiplier = 1.3 + (stats.nitro / 100) * 0.7; // 1.3-2.0 range
  
  // Physics parameters
  const wheelOffset = { x: 0.85, z: 1.4, y: -0.2 };
  const gravity = 35;
  const downforce = 1.2;
  const driftFactor = 0.8;
  
  // Chassis physics
  const [chassisRef, chassisApi] = useBox(() => ({
    mass: 500,
    position,
    rotation: [0, rotation, 0],
    args: [1.7, 0.6, 4],
    allowSleep: false,
    angularDamping: 0.9,
    linearDamping: 0.5,
  }));

  // Wheel parameters based on customization
  const wheelRadius = carCustomization.wheelType === 'racing' ? 0.38 : 
                      carCustomization.wheelType === 'sport' ? 0.35 : 0.32;
  const wheelThickness = carCustomization.wheelType === 'racing' ? 0.3 : 
                         carCustomization.wheelType === 'sport' ? 0.25 : 0.2;
  
  // Wheel physics
  const [flWheelRef, flWheelApi] = useCylinder(() => ({
    mass: 30,
    position: [position[0] - wheelOffset.x, position[1] - wheelOffset.y, position[2] - wheelOffset.z],
    args: [wheelRadius, wheelRadius, wheelThickness, 16],
    rotation: [0, rotation, Math.PI / 2],
    material: { friction: 1.5, restitution: 0.3 },
  }));
  
  const [frWheelRef, frWheelApi] = useCylinder(() => ({
    mass: 30,
    position: [position[0] + wheelOffset.x, position[1] - wheelOffset.y, position[2] - wheelOffset.z],
    args: [wheelRadius, wheelRadius, wheelThickness, 16],
    rotation: [0, rotation, Math.PI / 2],
  }));
  
  const [blWheelRef, blWheelApi] = useCylinder(() => ({
    mass: 30,
    position: [position[0] - wheelOffset.x, position[1] - wheelOffset.y, position[2] + wheelOffset.z],
    args: [wheelRadius, wheelRadius, wheelThickness, 16],
    rotation: [0, rotation, Math.PI / 2],
  }));
  
  const [brWheelRef, brWheelApi] = useCylinder(() => ({
    mass: 30,
    position: [position[0] + wheelOffset.x, position[1] - wheelOffset.y, position[2] + wheelOffset.z],
    args: [wheelRadius, wheelRadius, wheelThickness, 16],
    rotation: [0, rotation, Math.PI / 2],
  }));
  
  // Car controls based on control type
  let controls: Controls;
  if (isPlayer) {
    if (controlType === 'touch') {
      controls = useTouchControls();
    } else if (controlType === 'tilt') {
      controls = useTiltControls();
    } else {
      controls = useKeyboardControls();
    }
  } else {
    controls = { forward: false, back: false, left: false, right: false, nitro: false, drift: false, reset: false };
  }
  
  // Car state
  const velocity = useRef(0);
  const steering = useRef(0);
  const nitroActive = useRef(false);
  const isInAir = useRef(false);
  const isDrifting = useRef(false);
  const nitroRefillRate = 10; // per second
  const nitroConsumptionRate = 30; // per second
  const wheelsRotation = useRef(0);
  const [spoilerSize, setSpoilerSize] = useState({ width: 1.4, height: 0.1, depth: 0.5 });

  // Set spoiler size based on customization
  useEffect(() => {
    if (carCustomization.spoiler === 'large') {
      setSpoilerSize({ width: 1.6, height: 0.15, depth: 0.7 });
    } else if (carCustomization.spoiler === 'medium') {
      setSpoilerSize({ width: 1.4, height: 0.1, depth: 0.5 });
    } else {
      setSpoilerSize({ width: 0, height: 0, depth: 0 });
    }
  }, [carCustomization.spoiler]);

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
    if (controls.nitro && nitroAmount > 0 && !isInAir.current) {
      nitroActive.current = true;
    } else {
      nitroActive.current = false;
    }
    
    // Drift handling
    isDrifting.current = drift && Math.abs(velocity.current) > 10 && !isInAir.current;
    
    // Reset car position if requested
    if (controls.reset && isPlayer) {
      chassisApi.position.set(0, 1, 0);
      chassisApi.velocity.set(0, 0, 0);
      chassisApi.angularVelocity.set(0, 0, 0);
      chassisApi.rotation.set(0, 0, 0);
      velocity.current = 0;
      steering.current = 0;
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
      
      // Apply different friction when drifting
      if (isDrifting.current) {
        velocity.current *= 0.99; // Less friction when drifting
      } else {
        velocity.current *= 0.98; // Normal ground friction
      }
    } else {
      velocity.current *= 0.995; // Less drag in air
    }
    
    // Clamp max speed
    const maxCurrentSpeed = nitroActive.current ? maxSpeed * nitroBoostMultiplier : maxSpeed;
    velocity.current = Math.max(-maxSpeed/2, Math.min(maxCurrentSpeed, velocity.current));
    
    // Apply steering only when on ground
    if (!isInAir.current) {
      if (left) steering.current -= turnSpeed * (isDrifting.current ? 1.5 : 1);
      if (right) steering.current += turnSpeed * (isDrifting.current ? 1.5 : 1);
    }
    
    // Steering return to center and limits
    steering.current *= isDrifting.current ? 0.98 : 0.95; // Slower return when drifting
    steering.current = Math.max(-0.5, Math.min(0.5, steering.current));
    
    // Apply physics to chassis
    chassisApi.velocity.set(
      Math.sin(chassisRef.current.rotation.y) * velocity.current,
      isInAir.current ? -gravity * delta : 0, // Apply gravity if in air
      Math.cos(chassisRef.current.rotation.y) * velocity.current
    );
    
    // Apply rotation with drift factor
    const steeringAmount = steering.current * (isDrifting.current ? driftFactor : 1);
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
      const frontWheelRotY = isDrifting.current ? steering.current * 0.7 : steering.current * 0.5;
      
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
    
    // Get current position and rotation
    const currentPosition: [number, number, number] = [0, 0, 0];
    const worldPos = new THREE.Vector3();
    chassisRef.current.getWorldPosition(worldPos);
    currentPosition[0] = worldPos.x;
    currentPosition[1] = worldPos.y;
    currentPosition[2] = worldPos.z;
    
    // Update callback
    if (isPlayer && onUpdate) {
      onUpdate(
        currentPosition, 
        Math.abs(velocity.current), 
        chassisRef.current.rotation.y,
        nitroActive.current,
        isDrifting.current
      );
    }
  });

  return (
    <group>
      <mesh ref={chassisRef as any} castShadow>
        {/* Car body */}
        <boxGeometry args={[1.7, 0.6, 4]} />
        <meshStandardMaterial color={carCustomization.color} metalness={0.6} roughness={0.4} />
        
        {/* Car cabin */}
        <mesh position={[0, 0.5, -0.5]}>
          <boxGeometry args={[1.5, 0.5, 1.8]} />
          <meshStandardMaterial color="#111111" metalness={0.2} roughness={0.5} />
        </mesh>
        
        {/* Car hood */}
        <mesh position={[0, 0.2, 1.5]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[1.65, 0.4, 0.9]} />
          <meshStandardMaterial color={carCustomization.color} metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Car spoiler - only if enabled */}
        {carCustomization.spoiler !== 'none' && (
          <mesh position={[0, 0.7, -1.8]}>
            <boxGeometry args={[spoilerSize.width, spoilerSize.height, spoilerSize.depth]} />
            <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
            
            {/* Spoiler supports */}
            <mesh position={[spoilerSize.width/2 - 0.1, -0.2, 0]}>
              <boxGeometry args={[0.1, 0.4, 0.1]} />
              <meshStandardMaterial color="#222222" />
            </mesh>
            
            <mesh position={[-spoilerSize.width/2 + 0.1, -0.2, 0]}>
              <boxGeometry args={[0.1, 0.4, 0.1]} />
              <meshStandardMaterial color="#222222" />
            </mesh>
          </mesh>
        )}
        
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
        
        {/* Car details based on model type */}
        {/* Front bumper */}
        <mesh position={[0, -0.1, 1.95]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.65, 0.3, 0.1]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        
        {/* Rear bumper */}
        <mesh position={[0, -0.1, -1.95]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.65, 0.3, 0.1]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        
        {/* Side skirts */}
        <mesh position={[0.85, -0.2, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.05, 0.2, 3.8]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        
        <mesh position={[-0.85, -0.2, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.05, 0.2, 3.8]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        
        {/* Windshield */}
        <mesh position={[0, 0.6, 0.5]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[1.45, 0.05, 1.2]} />
          <meshStandardMaterial color="#aaddff" transparent opacity={0.7} />
        </mesh>
      </mesh>
      
      {/* Visible Wheels - style based on wheel type */}
      <mesh ref={flWheelRef as any} castShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
        <meshStandardMaterial color="#222222" />
        
        {/* Wheel rim style based on type */}
        {carCustomization.wheelType === 'racing' ? (
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.25, 0.25, wheelThickness + 0.01, 12]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
            {/* Racing wheel spokes */}
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh 
                key={i} 
                position={[0, 0, 0]} 
                rotation={[0, 0, (Math.PI * i) / 4]}
              >
                <boxGeometry args={[0.05, 0.4, wheelThickness + 0.02]} />
                <meshStandardMaterial color="#666666" metalness={0.7} />
              </mesh>
            ))}
          </mesh>
        ) : carCustomization.wheelType === 'sport' ? (
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.22, 0.22, wheelThickness + 0.01, 12]} />
            <meshStandardMaterial color="#555555" metalness={0.6} roughness={0.3} />
            {/* Sport wheel 5-spoke design */}
            {Array.from({ length: 5 }).map((_, i) => (
              <mesh 
                key={i} 
                position={[0, 0, 0]} 
                rotation={[0, 0, (Math.PI * 2 * i) / 5]}
              >
                <boxGeometry args={[0.08, 0.35, wheelThickness + 0.02]} />
                <meshStandardMaterial color="#777777" metalness={0.5} />
              </mesh>
            ))}
          </mesh>
        ) : (
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.2, 0.2, wheelThickness + 0.01, 12]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
        )}
      </mesh>
      
      {/* Duplicate wheel style for other wheels */}
      <mesh ref={frWheelRef as any} castShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
        <meshStandardMaterial color="#222222" />
        
        {/* Same wheel rim style as front left */}
        {carCustomization.wheelType === 'racing' ? (
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.25, 0.25, wheelThickness + 0.01, 12]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh 
                key={i} 
                position={[0, 0, 0]} 
                rotation={[0, 0, (Math.PI * i) / 4]}
              >
                <boxGeometry args={[0.05, 0.4, wheelThickness + 0.02]} />
                <meshStandardMaterial color="#666666" metalness={0.7} />
              </mesh>
            ))}
          </mesh>
        ) : carCustomization.wheelType === 'sport' ? (
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.22, 0.22, wheelThickness + 0.01, 12]} />
            <meshStandardMaterial color="#555555" metalness={0.6} roughness={0.3} />
            {Array.from({ length: 5 }).map((_, i) => (
              <mesh 
                key={i} 
                position={[0, 0, 0]} 
                rotation={[0, 0, (Math.PI * 2 * i) / 5]}
              >
                <boxGeometry args={[0.08, 0.35, wheelThickness + 0.02]} />
                <meshStandardMaterial color="#777777" metalness={0.5} />
              </mesh>
            ))}
          </mesh>
        ) : (
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.2, 0.2, wheelThickness + 0.01, 12]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
        )}
      </mesh>
      
      <mesh ref={blWheelRef as any} castShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
        <meshStandardMaterial color="#222222" />
        
        {/* Same wheel rim style as front wheels */}
        {carCustomization.wheelType === 'racing' ? (
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.25, 0.25, wheelThickness + 0.01, 12]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh 
                key={i} 
                position={[0, 0, 0]} 
                rotation={[0, 0, (Math.PI * i) / 4]}
              >
                <boxGeometry args={[0.05, 0.4, wheelThickness + 0.02]} />
                <meshStandardMaterial color="#666666" metalness={0.7} />
              </mesh>
            ))}
          </mesh>
        ) : carCustomization.wheelType === 'sport' ? (
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.22, 0.22, wheelThickness + 0.01, 12]} />
            <meshStandardMaterial color="#555555" metalness={0.6} roughness={0.3} />
            {Array.from({ length: 5 }).map((_, i) => (
              <mesh 
                key={i} 
                position={[0, 0, 0]} 
                rotation={[0, 0, (Math.PI * 2 * i) / 5]}
              >
                <boxGeometry args={[0.08, 0.35, wheelThickness + 0.02]} />
                <meshStandardMaterial color="#777777" metalness={0.5} />
              </mesh>
            ))}
          </mesh>
        ) : (
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.2, 0.2, wheelThickness + 0.01, 12]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
        )}
      </mesh>
      
      <mesh ref={brWheelRef as any} castShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
        <meshStandardMaterial color="#222222" />
        
        {/* Same wheel rim style as other wheels */}
        {carCustomization.wheelType === 'racing' ? (
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.25, 0.25, wheelThickness + 0.01, 12]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh 
                key={i} 
                position={[0, 0, 0]} 
                rotation={[0, 0, (Math.PI * i) / 4]}
              >
                <boxGeometry args={[0.05, 0.4, wheelThickness + 0.02]} />
                <meshStandardMaterial color="#666666" metalness={0.7} />
              </mesh>
            ))}
          </mesh>
        ) : carCustomization.wheelType === 'sport' ? (
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.22, 0.22, wheelThickness + 0.01, 12]} />
            <meshStandardMaterial color="#555555" metalness={0.6} roughness={0.3} />
            {Array.from({ length: 5 }).map((_, i) => (
              <mesh 
                key={i} 
                position={[0, 0, 0]} 
                rotation={[0, 0, (Math.PI * 2 * i) / 5]}
              >
                <boxGeometry args={[0.08, 0.35, wheelThickness + 0.02]} />
                <meshStandardMaterial color="#777777" metalness={0.5} />
              </mesh>
            ))}
          </mesh>
        ) : (
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.2, 0.2, wheelThickness + 0.01, 12]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
        )}
      </mesh>
      
      {/* Nitro particles when active */}
      {nitroActive.current && (
        <>
          <mesh position={[0.4, 0, -2]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.1, 0.5, 8]} />
            <meshStandardMaterial 
              color={carCustomization.nitroColor} 
              emissive={carCustomization.nitroColor} 
              emissiveIntensity={2} 
              transparent
              opacity={0.8}
            />
          </mesh>
          
          <mesh position={[-0.4, 0, -2]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.1, 0.5, 8]} />
            <meshStandardMaterial 
              color={carCustomization.nitroColor} 
              emissive={carCustomization.nitroColor} 
              emissiveIntensity={2}
              transparent
              opacity={0.8}
            />
          </mesh>
          
          {/* Additional nitro particles */}
          {Array.from({ length: 10 }).map((_, i) => (
            <mesh 
              key={i}
              position={[
                (Math.random() - 0.5) * 0.8, 
                (Math.random() - 0.5) * 0.2, 
                -2 - Math.random() * 0.5
              ]} 
              rotation={[0, 0, 0]}
            >
              <sphereGeometry args={[0.05 + Math.random() * 0.05, 8, 8]} />
              <meshStandardMaterial 
                color={carCustomization.nitroColor} 
                emissive={carCustomization.nitroColor} 
                emissiveIntensity={2}
                transparent
                opacity={0.6 + Math.random() * 0.4}
              />
            </mesh>
          ))}
        </>
      )}
      
      {/* Drift smoke effect */}
      {isDrifting.current && Math.abs(velocity.current) > 15 && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh 
              key={i}
              position={[
                (Math.random() - 0.5) * 1.5 + (Math.random() > 0.5 ? 0.8 : -0.8), 
                0.1, 
                (Math.random() - 0.5) * 1 + 1.2
              ]} 
              rotation={[0, 0, 0]}
            >
              <sphereGeometry args={[0.2 + Math.random() * 0.3, 8, 8]} />
              <meshStandardMaterial 
                color="#ffffff" 
                transparent
                opacity={0.3 + Math.random() * 0.3}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
};

export default Car;
