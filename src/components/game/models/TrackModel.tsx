import React from 'react';
import { Environment } from '../../game/types';
import * as THREE from 'three';

interface TrackModelProps {
  environment: Environment;
}

// Define a proper racing circuit with clear segments
const TRACK_POINTS = [
  // Start/Finish straight
  new THREE.Vector3(0, 0, 0),           // Start line
  new THREE.Vector3(50, 0, 0),          // Mid start straight
  new THREE.Vector3(100, 0, 0),         // End of start straight
  
  // First corner (gentle right turn)
  new THREE.Vector3(120, 0, 20),        // Entry
  new THREE.Vector3(130, 0, 50),        // Mid corner
  new THREE.Vector3(120, 0, 80),        // Exit
  
  // Second straight
  new THREE.Vector3(100, 0, 100),       // Start of second straight
  new THREE.Vector3(50, 0, 120),        // Mid second straight
  new THREE.Vector3(0, 0, 130),         // End of second straight
  
  // Third corner (tight left)
  new THREE.Vector3(-50, 0, 120),       // Entry
  new THREE.Vector3(-80, 0, 100),       // Mid corner
  new THREE.Vector3(-100, 0, 50),       // Exit
  
  // Final straight back to start
  new THREE.Vector3(-80, 0, 20),        // Start of final straight
  new THREE.Vector3(-50, 0, 0),         // Mid final straight
];

// Export track data for use in other components
export const TRACK_DATA = {
  points: TRACK_POINTS,
  startPosition: new THREE.Vector3(-20, 0, 0),  // Slightly before start line
  startRotation: 0,  // Facing straight ahead
  checkpoints: [
    { position: new THREE.Vector3(100, 0, 0), radius: 20 },    // End of start straight
    { position: new THREE.Vector3(120, 0, 80), radius: 20 },   // After first corner
    { position: new THREE.Vector3(0, 0, 130), radius: 20 },    // End of second straight
    { position: new THREE.Vector3(-100, 0, 50), radius: 20 },  // After third corner
  ],
  // Add track bounds for better collision detection
  trackWidth: 20,
  shoulderWidth: 3,
  barrierOffset: 2,
};

const TrackModel: React.FC<TrackModelProps> = ({ environment }) => {
  const { trackWidth, shoulderWidth, barrierOffset } = TRACK_DATA;
  const barrierHeight = 1.5;
  const barrierSpacing = 10;  // Reduced spacing for better guidance
  const trackThickness = 0.2;
  const curbHeight = 0.3;
  
  // Create a smooth curve from the points with tension for better corners
  const curve = new THREE.CatmullRomCurve3(TRACK_POINTS, true, 'centripetal');
  const points = curve.getPoints(300); // Increased point count for smoother curve
  
  // Create track segments
  const trackSegments = points.map((point, i) => {
    const nextPoint = points[(i + 1) % points.length];
    const direction = nextPoint.clone().sub(point);
    const length = direction.length();
    const rotation = Math.atan2(direction.x, direction.z);

    return { point, rotation, length };
  });

  // Calculate barrier positions with spacing
  const barrierPositions = points.filter((_, index) => index % Math.round(barrierSpacing) === 0);

  return (
    <group>
      {/* Track segments */}
      {trackSegments.map((segment, i) => (
        <group key={i} position={segment.point.toArray()} rotation={[0, segment.rotation, 0]}>
          {/* Main track surface */}
          <mesh receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[trackWidth, trackThickness, segment.length]} />
            <meshStandardMaterial 
              color="#1a1a1a"
              roughness={0.6}
              metalness={0.4}
            />
          </mesh>

          {/* Track shoulders */}
          <mesh receiveShadow position={[-trackWidth/2 - shoulderWidth/2, 0, 0]}>
            <boxGeometry args={[shoulderWidth, trackThickness, segment.length]} />
            <meshStandardMaterial color="#333333" roughness={0.8} />
          </mesh>
          <mesh receiveShadow position={[trackWidth/2 + shoulderWidth/2, 0, 0]}>
            <boxGeometry args={[shoulderWidth, trackThickness, segment.length]} />
            <meshStandardMaterial color="#333333" roughness={0.8} />
          </mesh>

          {/* Track curbs */}
          <mesh receiveShadow position={[-trackWidth/2 - 1, curbHeight/2, 0]}>
            <boxGeometry args={[1, curbHeight, segment.length]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#ff0000" : "#ffffff"} />
          </mesh>
          <mesh receiveShadow position={[trackWidth/2 + 1, curbHeight/2, 0]}>
            <boxGeometry args={[1, curbHeight, segment.length]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#ff0000" : "#ffffff"} />
          </mesh>
        </group>
      ))}

      {/* Track barriers */}
      {barrierPositions.map((point, i) => {
        const nextPoint = barrierPositions[(i + 1) % barrierPositions.length];
        const direction = nextPoint.clone().sub(point);
        const rotation = Math.atan2(direction.x, direction.z);

        return (
          <group key={`barrier-${i}`} position={point.toArray()} rotation={[0, rotation, 0]}>
            {/* Left barrier */}
            <mesh castShadow receiveShadow position={[-trackWidth/2 - shoulderWidth - barrierOffset, barrierHeight/2, 0]}>
              <boxGeometry args={[0.5, barrierHeight, barrierSpacing]} />
              <meshStandardMaterial color="#ffffff" roughness={0.7} metalness={0.3} />
            </mesh>
            {/* Right barrier */}
            <mesh castShadow receiveShadow position={[trackWidth/2 + shoulderWidth + barrierOffset, barrierHeight/2, 0]}>
              <boxGeometry args={[0.5, barrierHeight, barrierSpacing]} />
              <meshStandardMaterial color="#ffffff" roughness={0.7} metalness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Start/Finish Line */}
      <mesh 
        position={[0, trackThickness/2 + 0.01, 0]} 
        rotation={[-Math.PI/2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[trackWidth, 4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial 
          color="#0a380a"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Add trees around the track */}
      {Array.from({ length: 30 }).map((_, i) => {
        const angle = (i / 30) * Math.PI * 2;
        const radius = 150 + Math.random() * 50;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const scale = 0.7 + Math.random() * 0.6;
        return (
          <group key={`tree-${i}`} position={[x, 0, z]} scale={[scale, scale, scale]}>
            {/* Tree trunk */}
            <mesh castShadow position={[0, 5, 0]}>
              <cylinderGeometry args={[0.5, 1, 10]} />
              <meshStandardMaterial color="#4a2f1b" />
            </mesh>
            {/* Tree top */}
            <mesh castShadow position={[0, 12, 0]}>
              <coneGeometry args={[4, 8, 8]} />
              <meshStandardMaterial color="#0a5a0a" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default TrackModel;