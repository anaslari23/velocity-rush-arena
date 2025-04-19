import React from 'react';
import { usePlane } from '@react-three/cannon';
import * as THREE from 'three';

interface RaceTrackProps {
  onCheckpointReached?: (checkpointId: number) => void;
}

const RaceTrack: React.FC<RaceTrackProps> = ({ onCheckpointReached }) => {
  // Ground plane with better friction
  const [planeRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: { friction: 0.5, restitution: 0.3 }
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
      {/* Main ground with texture */}
      <mesh ref={planeRef as any} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#0a0a1e" />
      </mesh>

      {/* Track segments with improved textures */}
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
            {/* Road segment with better texture */}
            <mesh position={[midX, 0.01, midZ]} rotation={[0, angle, 0]} receiveShadow>
              <boxGeometry args={[width, 0.1, length]} />
              <meshStandardMaterial 
                color="#16213e" 
                roughness={0.6}
              />
            </mesh>
            
            {/* Dashed road markings */}
            {Array.from({ length: Math.floor(length / 5) }).map((_, i) => (
              <mesh 
                key={`marking-${index}-${i}`} 
                position={[
                  midX,
                  0.02,
                  midZ - length/2 + i * 5 + 2.5
                ]} 
                rotation={[0, angle, 0]} 
                receiveShadow
              >
                <boxGeometry args={[0.5, 0.03, 2]} />
                <meshStandardMaterial color="#e2e2e2" />
              </mesh>
            ))}
            
            {/* Road edge with guard rails */}
            <mesh position={[midX + width / 2, 0.2, midZ]} rotation={[0, angle, 0]} receiveShadow>
              <boxGeometry args={[0.5, 0.4, length]} />
              <meshStandardMaterial color="#e2e2e2" />
            </mesh>
            
            <mesh position={[midX - width / 2, 0.2, midZ]} rotation={[0, angle, 0]} receiveShadow>
              <boxGeometry args={[0.5, 0.4, length]} />
              <meshStandardMaterial color="#e2e2e2" />
            </mesh>
            
            {/* Guard rail posts */}
            {Array.from({ length: Math.floor(length / 10) + 1 }).map((_, i) => (
              <React.Fragment key={`rail-${index}-${i}`}>
                <mesh 
                  position={[
                    midX + width / 2,
                    0.6,
                    midZ - length/2 + i * 10
                  ]} 
                  rotation={[0, angle, 0]} 
                  castShadow
                >
                  <boxGeometry args={[0.2, 0.8, 0.2]} />
                  <meshStandardMaterial color="#777777" />
                </mesh>
                
                <mesh 
                  position={[
                    midX - width / 2,
                    0.6,
                    midZ - length/2 + i * 10
                  ]} 
                  rotation={[0, angle, 0]} 
                  castShadow
                >
                  <boxGeometry args={[0.2, 0.8, 0.2]} />
                  <meshStandardMaterial color="#777777" />
                </mesh>
              </React.Fragment>
            ))}
          </group>
        );
      })}
      
      {/* Checkpoints with better visibility */}
      {checkpoints.map((checkpoint) => (
        <group 
          key={checkpoint.id} 
          position={checkpoint.position as [number, number, number]} 
          rotation={checkpoint.rotation as [number, number, number]}
        >
          {/* Visual indicator for checkpoint */}
          <mesh>
            <boxGeometry args={[trackWidth, 3, 0.2]} />
            <meshStandardMaterial 
              color="#00ff66" 
              transparent 
              opacity={0.3} 
              emissive="#00ff88"
              emissiveIntensity={0.5}
            />
          </mesh>
          
          {/* Checkpoint markers */}
          <mesh position={[trackWidth/2 - 1, 0, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.5, 4, 8]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} />
          </mesh>
          
          <mesh position={[-trackWidth/2 + 1, 0, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.5, 4, 8]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
      
      {/* Environment obstacles and decorations */}
      <group position={[20, 0, -30]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[4, 3, 4]} />
          <meshStandardMaterial color="#444" roughness={0.6} />
        </mesh>
      </group>

      <group position={[-20, 0, -60]}>
        <mesh position={[0, 3, 0]} castShadow>
          <cylinderGeometry args={[2, 2, 6, 16]} />
          <meshStandardMaterial color="#345" roughness={0.7} />
        </mesh>
      </group>
      
      {/* Add some trees and decorations */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 150;
        const z = (Math.random() - 0.5) * 150;
        // Keep trees away from the track
        const distToTrack = Math.min(
          Math.abs(x), 
          Math.abs(z), 
          Math.abs(x - 100), 
          Math.abs(z + 100)
        );
        if (distToTrack < 20) return null;
        
        return (
          <group key={`tree-${i}`} position={[x, 0, z]}>
            {/* Tree trunk */}
            <mesh position={[0, 2, 0]} castShadow>
              <cylinderGeometry args={[0.5, 0.8, 4, 8]} />
              <meshStandardMaterial color="#5D4037" />
            </mesh>
            {/* Tree top */}
            <mesh position={[0, 5, 0]} castShadow>
              <coneGeometry args={[2, 6, 8]} />
              <meshStandardMaterial color="#2E7D32" />
            </mesh>
          </group>
        );
      })}
      
      {/* Stadium/Arena with additional detail */}
      <group position={[50, 0, -50]}>
        {/* Stadium stands in a circular pattern */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 80;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          return (
            <group key={i}>
              <mesh position={[x, 5, z]} rotation={[0, -angle, 0]} castShadow>
                <boxGeometry args={[10, 10, 3]} />
                <meshStandardMaterial color="#334455" />
              </mesh>
              {/* Stadium lights */}
              {i % 5 === 0 && (
                <mesh position={[x, 15, z]} castShadow>
                  <cylinderGeometry args={[0.5, 0.5, 5, 8]} />
                  <meshStandardMaterial color="#555555" />
                  <pointLight 
                    position={[0, 0, 0]} 
                    intensity={10} 
                    distance={60}
                    color="#ffffff"
                    castShadow
                  />
                </mesh>
              )}
            </group>
          );
        })}
      </group>
    </group>
  );
};

export default RaceTrack;
