
import React from 'react';
import { usePlane } from '@react-three/cannon';

interface RaceTrackProps {
  onCheckpointReached?: (checkpointId: number) => void;
}

const RaceTrack: React.FC<RaceTrackProps> = ({ onCheckpointReached }) => {
  // Ground plane
  const [planeRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: { friction: 0.1 }
  }));

  // Track layout data
  const trackWidth = 15;
  const trackSegments = [
    { start: [0, 0, 0], end: [0, 0, -100], width: trackWidth },
    { start: [0, 0, -100], end: [100, 0, -100], width: trackWidth },
    { start: [100, 0, -100], end: [100, 0, 0], width: trackWidth },
    { start: [100, 0, 0], end: [0, 0, 0], width: trackWidth },
  ];

  // Checkpoint positions (middle of each segment)
  const checkpoints = [
    { id: 0, position: [0, 1, -50], rotation: [0, 0, 0] },
    { id: 1, position: [50, 1, -100], rotation: [0, Math.PI / 2, 0] },
    { id: 2, position: [100, 1, -50], rotation: [0, 0, 0] },
    { id: 3, position: [50, 1, 0], rotation: [0, Math.PI / 2, 0] }
  ];

  return (
    <group>
      {/* Main ground */}
      <mesh ref={planeRef} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Track segments */}
      {trackSegments.map((segment, index) => {
        const start = segment.start;
        const end = segment.end;
        const width = segment.width;
        
        // Calculate length and position
        const length = Math.sqrt(
          Math.pow(end[0] - start[0], 2) +
          Math.pow(end[2] - start[2], 2)
        );
        
        const midX = (start[0] + end[0]) / 2;
        const midZ = (start[2] + end[2]) / 2;
        
        // Calculate rotation
        const angle = Math.atan2(end[0] - start[0], end[2] - start[2]);
        
        return (
          <group key={index}>
            {/* Road segment */}
            <mesh position={[midX, 0.01, midZ]} rotation={[0, angle, 0]} receiveShadow>
              <boxGeometry args={[width, 0.1, length]} />
              <meshStandardMaterial color="#16213e" />
            </mesh>
            
            {/* Road markings */}
            <mesh position={[midX, 0.02, midZ]} rotation={[0, angle, 0]} receiveShadow>
              <boxGeometry args={[0.5, 0.02, length * 0.8]} />
              <meshStandardMaterial color="#e2e2e2" />
            </mesh>
            
            {/* Road edge */}
            <mesh position={[midX + width / 2, 0.1, midZ]} rotation={[0, angle, 0]} receiveShadow>
              <boxGeometry args={[0.5, 0.2, length]} />
              <meshStandardMaterial color="#e2e2e2" />
            </mesh>
            
            <mesh position={[midX - width / 2, 0.1, midZ]} rotation={[0, angle, 0]} receiveShadow>
              <boxGeometry args={[0.5, 0.2, length]} />
              <meshStandardMaterial color="#e2e2e2" />
            </mesh>
          </group>
        );
      })}
      
      {/* Checkpoints */}
      {checkpoints.map((checkpoint) => (
        <group key={checkpoint.id} position={checkpoint.position} rotation={checkpoint.rotation}>
          {/* Visual indicator for checkpoint */}
          <mesh>
            <boxGeometry args={[trackWidth, 3, 0.5]} />
            <meshStandardMaterial color="#00ff66" transparent opacity={0.3} />
          </mesh>
          
          {/* Trigger collider would be added here in a more complex implementation */}
        </group>
      ))}
      
      {/* Environment obstacles and decorations */}
      <group position={[20, 0, -30]}>
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[4, 2, 4]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      </group>

      <group position={[-20, 0, -60]}>
        <mesh position={[0, 3, 0]} castShadow>
          <cylinderGeometry args={[2, 2, 6, 16]} />
          <meshStandardMaterial color="#345" />
        </mesh>
      </group>
      
      {/* Stadium/Arena */}
      <group position={[50, 0, -50]}>
        {/* Stadium stands in a circular pattern */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 80;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          return (
            <mesh key={i} position={[x, 5, z]} rotation={[0, -angle, 0]} castShadow>
              <boxGeometry args={[10, 10, 3]} />
              <meshStandardMaterial color="#334455" />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

export default RaceTrack;
