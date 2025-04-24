import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment as ThreeEnvironment } from '@react-three/drei';
import { Car } from '../garage/types';
import { Environment } from './types';
import CarModel from './models/CarModel';
import TrackModel from './models/TrackModel';
import * as THREE from 'three';

interface GameSceneProps {
  car: Car;
  environment: Environment;
  isRacing: boolean;
  onSpeedChange: (speed: number) => void;
}

// Camera controller component
const CameraController: React.FC<{
  target: THREE.Vector3;
  position: THREE.Vector3;
  isRacing: boolean;
}> = ({ target, position, isRacing }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  useFrame((state, delta) => {
    if (cameraRef.current) {
      if (isRacing) {
        // Smoothly move camera to follow the car
        cameraRef.current.position.lerp(position, delta * 5);
        
        // Look at target (car position)
        cameraRef.current.lookAt(target);
      } else {
        // Orbit around the car when not racing
        const time = state.clock.getElapsedTime() * 0.2;
        cameraRef.current.position.x = Math.sin(time) * 10;
        cameraRef.current.position.z = Math.cos(time) * 10;
        cameraRef.current.position.y = 5;
        cameraRef.current.lookAt(target);
      }
    }
  });
  
  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 5, -10]} fov={60} />;
};

// AI car controller
const AICar: React.FC<{
  position: [number, number, number];
  trackRadius: number;
  speed: number;
  color: string;
}> = ({ position, trackRadius, speed, color }) => {
  const carRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);
  
  useFrame((state, delta) => {
    if (carRef.current) {
      // Update angle based on speed
      setAngle(prev => prev + delta * speed * 0.2);
      
      // Calculate new position on track
      const x = Math.cos(angle) * trackRadius * 1.5;
      const z = Math.sin(angle) * trackRadius;
      
      // Update car position
      carRef.current.position.x = x;
      carRef.current.position.z = z;
      
      // Update car rotation to face direction of travel
      carRef.current.rotation.y = angle + Math.PI / 2;
    }
  });
  
  // Create a fake car for AI
  const aiCar = {
    id: 'ai-car',
    name: 'AI Car',
    description: '',
    stats: { speed: 5, acceleration: 5, handling: 5, braking: 5 },
    price: 0,
    unlocked: true,
    customization: {
      color: color,
      wheels: 'standard',
      spoiler: 'none',
      nitroColor: '#00ffff'
    }
  } as Car;
  
  return (
    <group ref={carRef} position={position}>
      <CarModel car={aiCar} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={0.5} />
    </group>
  );
};

// Player car controller
const PlayerCar: React.FC<{
  car: Car;
  isRacing: boolean;
  trackRadius: number;
  onPositionChange: (position: THREE.Vector3) => void;
  onTargetChange: (target: THREE.Vector3) => void;
  onSpeedChange: (speed: number) => void;
}> = ({ car, isRacing, trackRadius, onPositionChange, onTargetChange, onSpeedChange }) => {
  const carRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [acceleration, setAcceleration] = useState(0);
  const [steering, setSteering] = useState(0);
  
  // Set up keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        setAcceleration(1);
      }
      if (e.key === 'ArrowDown' || e.key === 's') {
        setAcceleration(-0.5);
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setSteering(-1);
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        setSteering(1);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        setAcceleration(0);
      }
      if (e.key === 'ArrowDown' || e.key === 's') {
        setAcceleration(0);
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setSteering(0);
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        setSteering(0);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  useFrame((state, delta) => {
    if (carRef.current && isRacing) {
      // Update speed based on acceleration and car stats
      const maxSpeed = car.stats.speed * 0.5;
      const accelFactor = car.stats.acceleration * 0.01;
      
      setSpeed(prev => {
        // Apply acceleration
        let newSpeed = prev + acceleration * accelFactor * delta * 10;
        
        // Apply natural deceleration
        if (acceleration === 0) {
          newSpeed *= 0.98;
        }
        
        // Apply braking
        if (acceleration < 0) {
          newSpeed *= 0.9;
        }
        
        // Clamp speed
        return Math.max(0, Math.min(maxSpeed, newSpeed));
      });
      
      // Update angle based on steering and speed
      const turnFactor = car.stats.handling * 0.01;
      setAngle(prev => prev + steering * turnFactor * speed * delta);
      
      // Calculate new position on track
      const radius = trackRadius + (Math.sin(state.clock.getElapsedTime() * 2) * 2); // Add some variation
      const x = Math.cos(angle) * radius * 1.5;
      const z = Math.sin(angle) * radius;
      
      // Update car position
      carRef.current.position.x = x;
      carRef.current.position.z = z;
      
      // Update car rotation to face direction of travel
      carRef.current.rotation.y = angle + Math.PI / 2;
      
      // Update camera target and position
      const target = new THREE.Vector3(x, 0, z);
      onTargetChange(target);
      
      const cameraPosition = new THREE.Vector3(
        x - Math.cos(angle) * 7,
        3,
        z - Math.sin(angle) * 7
      );
      onPositionChange(cameraPosition);
      
      // Update speed for UI
      onSpeedChange(speed * 10);
    }
  });
  
  return (
    <group ref={carRef} position={[trackRadius * 1.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <CarModel car={car} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={0.5} isPlayerCar={true} />
    </group>
  );
};

const GameScene: React.FC<GameSceneProps> = ({ car, environment, isRacing, onSpeedChange }) => {
  const [cameraTarget, setCameraTarget] = useState(new THREE.Vector3(0, 0, 0));
  const [cameraPosition, setCameraPosition] = useState(new THREE.Vector3(0, 5, -10));
  const trackRadius = 50;
  
  // Generate AI cars
  const aiCars = [];
  const aiCarColors = ['#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
  
  for (let i = 0; i < 7; i++) {
    const startAngle = (i / 7) * Math.PI * 2;
    const x = Math.cos(startAngle) * trackRadius * 1.5;
    const z = Math.sin(startAngle) * trackRadius;
    
    aiCars.push(
      <AICar 
        key={i} 
        position={[x, 0, z]} 
        trackRadius={trackRadius} 
        speed={3 + Math.random() * 2} 
        color={aiCarColors[i]} 
      />
    );
  }
  
  return (
    <Canvas shadows>
      <CameraController 
        target={cameraTarget} 
        position={cameraPosition} 
        isRacing={isRacing} 
      />
      
      <TrackModel environment={environment} />
      
      <PlayerCar 
        car={car} 
        isRacing={isRacing} 
        trackRadius={trackRadius}
        onPositionChange={setCameraPosition}
        onTargetChange={setCameraTarget}
        onSpeedChange={onSpeedChange}
      />
      
      {aiCars}
      
      <ThreeEnvironment preset="city" />
    </Canvas>
  );
};

export default GameScene;