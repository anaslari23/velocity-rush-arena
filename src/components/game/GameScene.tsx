import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment as ThreeEnvironment } from '@react-three/drei';
import { Car } from '../garage/types';
import { Environment } from './types';
import CarModel from './models/CarModel';
import TrackModel, { TRACK_DATA } from './models/TrackModel';
import * as THREE from 'three';

interface GameSceneProps {
  car: Car;
  environment: Environment;
  isRacing: boolean;
  onSpeedChange: (speed: number) => void;
  onLapComplete: () => void;
  onCheckpoint: (index: number) => void;
}

// Camera controller component
const CameraController: React.FC<{
  target: THREE.Vector3;
  position: THREE.Vector3;
  isRacing: boolean;
}> = ({ target, position, isRacing }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const currentPos = useRef(new THREE.Vector3(0, 15, 30));
  const currentLookAt = useRef(new THREE.Vector3());
  const smoothFactor = 0.1; // Lower = smoother but slower camera
  
  useFrame((state, delta) => {
    if (cameraRef.current) {
      if (isRacing) {
        // Smoothly interpolate camera position
        currentPos.current.lerp(position, smoothFactor);
        currentLookAt.current.lerp(target, smoothFactor);
        
        // Update camera position
        cameraRef.current.position.copy(currentPos.current);
        
        // Look at target (car position) with slight height offset
        const lookAtPos = currentLookAt.current.clone();
        lookAtPos.y += 1; // Look slightly above the car
        cameraRef.current.lookAt(lookAtPos);
      } else {
        // Orbit around the car when not racing
        const time = state.clock.getElapsedTime() * 0.1; // Reduced speed
        const radius = 30;
        const targetPos = new THREE.Vector3(
          Math.sin(time) * radius,
          15,
          Math.cos(time) * radius
        );
        
        // Smooth camera movement even in orbit mode
        currentPos.current.lerp(targetPos, smoothFactor);
        cameraRef.current.position.copy(currentPos.current);
        cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0));
      }
    }
  });
  
  return (
    <PerspectiveCamera 
      ref={cameraRef} 
      makeDefault 
      position={[0, 15, 30]} 
      fov={60} 
      near={0.1} 
      far={1000}
    />
  );
};

// AI car controller
const AICar: React.FC<{
  position: [number, number, number];
  color: string;
  difficulty: number;
  startOffset: number;
}> = ({ position, color, difficulty, startOffset }) => {
  const carRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(startOffset);
  const curve = useRef(new THREE.CatmullRomCurve3(TRACK_DATA.points, true));
  
  useFrame((state, delta) => {
    if (carRef.current) {
      // Update progress based on difficulty (speed factor)
      setProgress(prev => (prev + delta * difficulty * 0.2) % 1);
      
      // Get position on track
      const position = curve.current.getPoint(progress);
      const nextPosition = curve.current.getPoint((progress + 0.01) % 1);
      
      // Calculate direction and rotation
      const direction = nextPosition.clone().sub(position);
      const rotation = Math.atan2(direction.x, direction.z);
      
      // Apply some randomness to make AI less perfect
      const wobble = Math.sin(state.clock.elapsedTime * 2) * (1 / difficulty) * 0.02;
      
      // Update car position and rotation
      carRef.current.position.copy(position);
      carRef.current.rotation.y = rotation + wobble;
    }
  });
  
  // Create a fake car for AI with stats based on difficulty
  const aiCar = {
    id: `ai-car-${color}`,
    name: 'AI Car',
    description: '',
    stats: {
      speed: difficulty * 2,
      acceleration: difficulty * 2,
      handling: difficulty * 2,
      braking: difficulty * 2
    },
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

// Helper function to check if a point is within track boundaries
const isPointOnTrack = (point: THREE.Vector3, curve: THREE.CatmullRomCurve3, width: number): boolean => {
  const divisions = 200;
  let minDistance = Infinity;
  let closestPoint = null;
  let closestT = 0;

  for (let i = 0; i <= divisions; i++) {
    const t = i / divisions;
    const curvePoint = curve.getPoint(t);
    const distance = point.distanceTo(curvePoint);
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = curvePoint;
      closestT = t;
    }
  }

  // Get track direction at closest point for better boundary checking
  const tangent = curve.getTangent(closestT);
  const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
  const toPoint = point.clone().sub(closestPoint!);
  const lateralDistance = Math.abs(toPoint.dot(normal));

  // Include shoulders in valid area
  return lateralDistance <= (width / 2 + TRACK_DATA.shoulderWidth);
};

// Player car controller
const PlayerCar: React.FC<{
  car: Car;
  isRacing: boolean;
  onPositionChange: (position: THREE.Vector3) => void;
  onTargetChange: (target: THREE.Vector3) => void;
  onSpeedChange: (speed: number) => void;
  onLapComplete: () => void;
  onCheckpoint: (index: number) => void;
}> = ({ car, isRacing, onPositionChange, onTargetChange, onSpeedChange, onLapComplete, onCheckpoint }) => {
  const carRef = useRef<THREE.Group>(null);
  const positionRef = useRef(TRACK_DATA.startPosition.clone());
  const rotationRef = useRef(TRACK_DATA.startRotation);
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const [steering, setSteering] = useState(0);
  const [throttle, setThrottle] = useState(0);
  const [brake, setBrake] = useState(0);
  const [isDrifting, setIsDrifting] = useState(0);
  const [nextCheckpoint, setNextCheckpoint] = useState(0);
  const [lastStartLinePass, setLastStartLinePass] = useState(0);
  const [isOffTrack, setIsOffTrack] = useState(false);
  const lastValidPosition = useRef(TRACK_DATA.startPosition.clone());
  const lastValidRotation = useRef(TRACK_DATA.startRotation);
  const trackCurve = useRef(new THREE.CatmullRomCurve3(TRACK_DATA.points, true));

  // SlowRoads.io style physics parameters
  const physicsParams = {
    // Core movement
    maxSpeed: car.stats.speed * 1.2,           // Moderate top speed
    acceleration: car.stats.acceleration * 0.4, // Gentle acceleration
    deceleration: 0.99,                        // Smooth deceleration
    reverseSpeed: car.stats.speed * 0.3,       // Slow reverse
    brakingForce: 0.95,                        // Gentle braking
    
    // Handling characteristics
    turnSpeed: 0.025 * car.stats.handling,     // Smooth turning
    turnSpeedAtMaxVelocity: 0.015 * car.stats.handling, // Reduced high-speed turning
    
    // Vehicle physics
    mass: 1500,                                // Car mass (kg)
    inertia: 0.95,                            // Momentum preservation
    weightTransfer: 0.15,                      // Weight shift in turns
    rollingResistance: 0.99,                   // Ground friction
    airResistance: 0.995,                      // Air drag
    engineBraking: 0.98,                       // Slowdown when not accelerating
    
    // Tire characteristics
    gripFactor: 0.92,                          // Base tire grip
    lateralGripFactor: 0.85,                   // Side grip during turns
    corneringStiffness: 0.3,                   // How much the car resists sliding
    
    // Suspension
    suspensionDamping: 0.15,                   // How quickly oscillations settle
    bodyRoll: 0.1                              // Body tilt in corners
  };

  // Reset car to last valid position
  const resetToTrack = useCallback(() => {
    positionRef.current.copy(lastValidPosition.current);
    rotationRef.current = lastValidRotation.current;
    velocityRef.current.set(0, 0, 0);
    setIsOffTrack(false);
  }, []);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setThrottle(1);
          break;
        case 's':
        case 'arrowdown':
          setBrake(1);
          break;
        case 'a':
        case 'arrowleft':
          setSteering(prev => Math.max(prev - 1, -1));
          break;
        case 'd':
        case 'arrowright':
          setSteering(prev => Math.min(prev + 1, 1));
          break;
        case ' ':
          setIsDrifting(1);
          break;
        case 'r': // Add reset key
          resetToTrack();
          break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch(e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setThrottle(0);
          break;
        case 's':
        case 'arrowdown':
          setBrake(0);
          break;
        case 'a':
        case 'arrowleft':
          setSteering(prev => prev === -1 ? 0 : prev);
          break;
        case 'd':
        case 'arrowright':
          setSteering(prev => prev === 1 ? 0 : prev);
          break;
        case ' ':
          setIsDrifting(0);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetToTrack]);

  useFrame((state, deltaTime) => {
    if (!isRacing || !carRef.current) return;

    // Get current direction vectors
    const forward = new THREE.Vector3(
      Math.sin(rotationRef.current),
      0,
      Math.cos(rotationRef.current)
    );

    const right = new THREE.Vector3(
      Math.cos(rotationRef.current),
      0,
      -Math.sin(rotationRef.current)
    );

    // Current velocity and speed
    const currentSpeed = velocityRef.current.length();
    const normalizedSpeed = currentSpeed / physicsParams.maxSpeed;
    const forwardVelocity = forward.dot(velocityRef.current);
    const lateralVelocity = right.dot(velocityRef.current);
    const isReversing = forwardVelocity < -0.1;

    // Calculate weight transfer
    const lateralWeight = Math.abs(lateralVelocity) * physicsParams.weightTransfer;
    const longitudinalWeight = Math.abs(forwardVelocity) * physicsParams.weightTransfer;

    // Handle acceleration and braking
    if (throttle > 0 && !isReversing) {
      // Progressive acceleration curve
      const accelerationCurve = 1 - (currentSpeed / physicsParams.maxSpeed) ** 1.5;
      const engineForce = forward.multiplyScalar(
        physicsParams.acceleration * throttle * accelerationCurve * deltaTime * 20
      );
      
      // Apply engine force with weight transfer
      const effectiveForce = engineForce.multiplyScalar(1 - longitudinalWeight * 0.3);
      velocityRef.current.add(effectiveForce);
    } else if (brake > 0) {
      if (currentSpeed < 0.5 && !isReversing) {
        // Initiate reverse
        const reverseForce = forward.multiplyScalar(
          -physicsParams.acceleration * brake * physicsParams.reverseSpeed * deltaTime * 15
        );
        velocityRef.current.add(reverseForce);
      } else {
        // Progressive braking
        const brakeEffectiveness = physicsParams.brakingForce + (longitudinalWeight * 0.1);
        velocityRef.current.multiplyScalar(brakeEffectiveness);
      }
    } else {
      // Engine braking and coast
      velocityRef.current.multiplyScalar(physicsParams.engineBraking);
    }

    // Steering with weight transfer and speed sensitivity
    if (Math.abs(steering) > 0) {
      // Calculate effective turn rate
      const speedFactor = 1 - (normalizedSpeed * 0.6); // Less turning at high speeds
      const weightFactor = 1 - (lateralWeight * 0.5);  // Less turning under lateral load
      const baseTurnRate = THREE.MathUtils.lerp(
        physicsParams.turnSpeed,
        physicsParams.turnSpeedAtMaxVelocity,
        1 - speedFactor
      );

      // Apply steering with weight transfer consideration
      const effectiveTurnRate = baseTurnRate * weightFactor;
      const steeringDirection = isReversing ? -1 : 1;
      rotationRef.current += steering * effectiveTurnRate * steeringDirection;

      // Apply cornering forces
      const corneringForce = right.multiplyScalar(
        steering * currentSpeed * physicsParams.corneringStiffness * (1 - lateralWeight)
      );
      velocityRef.current.add(corneringForce);

      // Apply grip reduction in turns
      const gripReduction = Math.abs(steering) * (1 - physicsParams.lateralGripFactor);
      velocityRef.current.multiplyScalar(1 - gripReduction * deltaTime);
    }

    // Apply physics forces
    // Air resistance (increases with speed)
    const airResistance = 1 - ((1 - physicsParams.airResistance) * (normalizedSpeed ** 2));
    velocityRef.current.multiplyScalar(airResistance);

    // Rolling resistance
    velocityRef.current.multiplyScalar(physicsParams.rollingResistance);

    // Momentum and inertia
    velocityRef.current.multiplyScalar(physicsParams.inertia);

    // Speed limiting
    const maxCurrentSpeed = isReversing ? physicsParams.reverseSpeed : physicsParams.maxSpeed;
    if (currentSpeed > maxCurrentSpeed) {
      const reduction = maxCurrentSpeed / currentSpeed;
      velocityRef.current.multiplyScalar(reduction);
    }

    // Update position with momentum
    positionRef.current.add(velocityRef.current);

    // Update car transform
    carRef.current.position.copy(positionRef.current);
    carRef.current.rotation.y = rotationRef.current;

    // Smooth camera follow with weight transfer
    const cameraDistance = 15 + (normalizedSpeed * 8);
    const cameraHeight = 5 + (normalizedSpeed * 2);
    const lateralOffset = (steering * 2 * normalizedSpeed) + (lateralWeight * steering * 3);
    
    const idealOffset = new THREE.Vector3(
      -Math.sin(rotationRef.current) * cameraDistance + lateralOffset,
      cameraHeight + (longitudinalWeight * 2),
      -Math.cos(rotationRef.current) * cameraDistance
    );
    
    const cameraLag = Math.min(currentSpeed * 0.03, 0.8);
    const laggedPosition = positionRef.current.clone().sub(
      forward.multiplyScalar(cameraLag)
    );
    
    const cameraPosition = laggedPosition.clone().add(idealOffset);
    onPositionChange(cameraPosition);
    onTargetChange(positionRef.current.clone().add(new THREE.Vector3(0, 1, 0)));

    // Update UI speed (km/h)
    onSpeedChange(currentSpeed * 40); // Adjusted for more realistic speed display

    // Check for checkpoints and lap completion
    const distanceToStart = positionRef.current.distanceTo(TRACK_DATA.startPosition);
    if (distanceToStart < 15) {
      const timeSinceLastPass = state.clock.getElapsedTime() - lastStartLinePass;
      if (timeSinceLastPass > 5 && nextCheckpoint === TRACK_DATA.checkpoints.length) {
        setNextCheckpoint(0);
        onLapComplete();
        setLastStartLinePass(state.clock.getElapsedTime());
      }
    }

    // Check checkpoints
    const currentCheckpoint = TRACK_DATA.checkpoints[nextCheckpoint];
    if (currentCheckpoint) {
      const distanceToCheckpoint = positionRef.current.distanceTo(currentCheckpoint.position);
      if (distanceToCheckpoint < currentCheckpoint.radius) {
        onCheckpoint(nextCheckpoint);
        setNextCheckpoint(prev => prev + 1);
      }
    }
  });
  
  return (
    <group ref={carRef}>
      <CarModel 
        car={car} 
        position={[0, 0, 0]} 
        rotation={[0, 0, 0]} 
        scale={0.5} 
        isPlayerCar={true} 
      />
      {isOffTrack && (
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
};

const GameScene: React.FC<GameSceneProps> = ({ 
  car, 
  environment, 
  isRacing, 
  onSpeedChange,
  onLapComplete,
  onCheckpoint 
}) => {
  const [cameraTarget, setCameraTarget] = useState(new THREE.Vector3(0, 0, 0));
  const [cameraPosition, setCameraPosition] = useState(new THREE.Vector3(0, 15, 30));
  
  // Generate AI cars with different difficulties and starting positions
  const aiCars = [
    { color: '#ff0000', difficulty: 5, startOffset: 0.1 },    // Fast AI
    { color: '#0000ff', difficulty: 4.5, startOffset: 0.2 },  // Medium-Fast AI
    { color: '#00ff00', difficulty: 4, startOffset: 0.3 },    // Medium AI
    { color: '#ffff00', difficulty: 3.5, startOffset: 0.4 },  // Medium-Slow AI
    { color: '#ff00ff', difficulty: 3, startOffset: 0.5 }     // Slow AI
  ].map((aiConfig, index) => (
      <AICar 
      key={index}
      position={[TRACK_DATA.startPosition.x, 0, TRACK_DATA.startPosition.z]}
      color={aiConfig.color}
      difficulty={aiConfig.difficulty}
      startOffset={aiConfig.startOffset}
    />
  ));
  
  return (
    <Canvas shadows>
      {/* Add proper lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[50, 50, 25]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <hemisphereLight 
        intensity={0.5}
        groundColor="#000000"
        color="#ffffff"
      />
      
      <CameraController 
        target={cameraTarget} 
        position={cameraPosition} 
        isRacing={isRacing} 
      />
      
      <TrackModel environment={environment} />
      
      <PlayerCar 
        car={car} 
        isRacing={isRacing} 
        onPositionChange={setCameraPosition}
        onTargetChange={setCameraTarget}
        onSpeedChange={onSpeedChange}
        onLapComplete={onLapComplete}
        onCheckpoint={onCheckpoint}
      />
      
      {isRacing && aiCars}
      
      <ThreeEnvironment preset="city" />
      
      {/* Add fog for atmosphere */}
      <fog attach="fog" args={['#000000', 100, 1000]} />
    </Canvas>
  );
};

export default GameScene;