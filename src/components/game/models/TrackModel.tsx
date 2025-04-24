import React from 'react';
import { Environment } from '../../game/types';

interface TrackModelProps {
  environment: Environment;
}

const TrackModel: React.FC<TrackModelProps> = ({ environment }) => {
  // Track parameters
  const trackWidth = 20;
  const trackLength = environment.trackLength || 3000;
  const trackHeight = 0.1;

  return (
    <group>
      {/* Main track surface */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[trackWidth, trackLength]} />
        <meshStandardMaterial 
          color={environment.type === 'urban' ? '#333333' : 
                environment.type === 'desert' ? '#c2b280' :
                environment.type === 'snow' ? '#ffffff' :
                environment.type === 'beach' ? '#c2b280' : '#333333'}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Track barriers */}
      <mesh position={[-trackWidth/2, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, trackLength]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      <mesh position={[trackWidth/2, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, trackLength]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>

      {/* Track markings */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, trackLength]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Environment-specific decorations */}
      {environment.type === 'urban' && (
        <group>
          {/* Add buildings, streetlights, etc. */}
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh key={i} position={[
              (Math.random() - 0.5) * 100,
              Math.random() * 20 + 5,
              (Math.random() - 0.5) * trackLength
            ]}>
              <boxGeometry args={[10, Math.random() * 30 + 10, 10]} />
              <meshStandardMaterial color="#444444" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

export default TrackModel;