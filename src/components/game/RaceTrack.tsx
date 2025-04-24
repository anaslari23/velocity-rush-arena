import React, { useEffect, useState } from 'react';
import { usePlane, useBox } from '@react-three/cannon';
import { Sky, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Environment as GameEnvironment } from './types';

interface RaceTrackProps {
  environment: GameEnvironment;
  onCheckpointReached?: (checkpointId: number) => void;
  checkpoints?: { id: number; position: [number, number, number]; rotation: number }[];
}

const RaceTrack: React.FC<RaceTrackProps> = ({ 
  environment, 
  onCheckpointReached,
  checkpoints = []
}) => {
  // Load textures based on environment type
  const getEnvironmentTextures = () => {
    switch (environment.type) {
      case 'urban':
        return {
          ground: '/textures/urban-ground.jpg',
          track: '/textures/urban-track.jpg',
          normal: '/textures/urban-normal.jpg',
          roughness: '/textures/urban-roughness.jpg',
          barrier: '#444444',
          rumble: '#ff2222'
        };
      case 'highway':
        return {
          ground: '/textures/highway-ground.jpg',
          track: '/textures/highway-track.jpg',
          normal: '/textures/highway-normal.jpg',
          roughness: '/textures/highway-roughness.jpg',
          barrier: '#888888',
          rumble: '#ffff00'
        };
      case 'desert':
        return {
          ground: '/textures/desert-ground.jpg',
          track: '/textures/desert-track.jpg',
          normal: '/textures/desert-normal.jpg',
          roughness: '/textures/desert-roughness.jpg',
          barrier: '#aa8866',
          rumble: '#ff8800'
        };
      case 'snow':
        return {
          ground: '/textures/snow-ground.jpg',
          track: '/textures/snow-track.jpg',
          normal: '/textures/snow-normal.jpg',
          roughness: '/textures/snow-roughness.jpg',
          barrier: '#aaaaaa',
          rumble: '#ff4444'
        };
      case 'beach':
        return {
          ground: '/textures/beach-ground.jpg',
          track: '/textures/beach-track.jpg',
          normal: '/textures/beach-normal.jpg',
          roughness: '/textures/beach-roughness.jpg',
          barrier: '#ddddbb',
          rumble: '#ff6600'
        };
      default:
        return {
          ground: '/textures/urban-ground.jpg',
          track: '/textures/urban-track.jpg',
          normal: '/textures/urban-normal.jpg',
          roughness: '/textures/urban-roughness.jpg',
          barrier: '#444444',
          rumble: '#ff2222'
        };
    }
  };

  // Fallback textures if the environment-specific ones aren't available
  const fallbackTextures = useTexture({
    diffuse: '/textures/track-diffuse.jpg',
    normal: '/textures/track-normal.jpg',
    roughness: '/textures/track-roughness.jpg'
  });
  
  // Track parameters
  const trackWidth = 18;
  const trackBanking = 0.1; // Banking angle for curves
  const barrierHeight = 1.2;
  
  // Track layout based on environment
  const getTrackLayout = () => {
    switch (environment.type) {
      case 'urban':
        return [
          { start: [0, 0, 0], end: [0, 0, -100], width: trackWidth, banking: 0 },
          { start: [0, 0, -100], end: [100, 2, -100], width: trackWidth, banking: trackBanking },
          { start: [100, 2, -100], end: [150, 4, -50], width: trackWidth, banking: trackBanking },
          { start: [150, 4, -50], end: [150, 4, 50], width: trackWidth, banking: 0 },
          { start: [150, 4, 50], end: [100, 2, 100], width: trackWidth, banking: -trackBanking },
          { start: [100, 2, 100], end: [0, 0, 100], width: trackWidth, banking: -trackBanking },
          { start: [0, 0, 100], end: [0, 0, 0], width: trackWidth, banking: 0 },
        ];
      case 'highway':
        return [
          { start: [0, 0, 0], end: [0, 0, -150], width: trackWidth + 5, banking: 0 },
          { start: [0, 0, -150], end: [100, 0, -250], width: trackWidth + 5, banking: 0.05 },
          { start: [100, 0, -250], end: [200, 0, -200], width: trackWidth + 5, banking: 0.05 },
          { start: [200, 0, -200], end: [250, 0, -50], width: trackWidth + 5, banking: 0.05 },
          { start: [250, 0, -50], end: [250, 0, 50], width: trackWidth + 5, banking: 0 },
          { start: [250, 0, 50], end: [200, 0, 200], width: trackWidth + 5, banking: 0.05 },
          { start: [200, 0, 200], end: [100, 0, 250], width: trackWidth + 5, banking: 0.05 },
          { start: [100, 0, 250], end: [0, 0, 150], width: trackWidth + 5, banking: 0.05 },
          { start: [0, 0, 150], end: [0, 0, 0], width: trackWidth + 5, banking: 0 },
        ];
      case 'desert':
        return [
          { start: [0, 0, 0], end: [100, 0, -50], width: trackWidth, banking: 0 },
          { start: [100, 0, -50], end: [150, 2, -100], width: trackWidth, banking: 0.05 },
          { start: [150, 2, -100], end: [200, 4, -50], width: trackWidth, banking: 0.1 },
          { start: [200, 4, -50], end: [200, 6, 50], width: trackWidth, banking: 0 },
          { start: [200, 6, 50], end: [150, 4, 100], width: trackWidth, banking: 0.1 },
          { start: [150, 4, 100], end: [50, 2, 100], width: trackWidth, banking: 0 },
          { start: [50, 2, 100], end: [0, 0, 50], width: trackWidth, banking: 0.05 },
          { start: [0, 0, 50], end: [0, 0, 0], width: trackWidth, banking: 0 },
        ];
      case 'snow':
        return [
          { start: [0, 0, 0], end: [0, 5, -100], width: trackWidth - 2, banking: 0.05 },
          { start: [0, 5, -100], end: [50, 10, -150], width: trackWidth - 2, banking: 0.1 },
          { start: [50, 10, -150], end: [100, 15, -100], width: trackWidth - 2, banking: 0.15 },
          { start: [100, 15, -100], end: [150, 10, -50], width: trackWidth - 2, banking: 0.1 },
          { start: [150, 10, -50], end: [150, 5, 0], width: trackWidth - 2, banking: 0.05 },
          { start: [150, 5, 0], end: [100, 0, 50], width: trackWidth - 2, banking: 0 },
          { start: [100, 0, 50], end: [50, 0, 50], width: trackWidth - 2, banking: 0 },
          { start: [50, 0, 50], end: [0, 0, 0], width: trackWidth - 2, banking: 0 },
        ];
      case 'beach':
        return [
          { start: [0, 0, 0], end: [100, 0, -50], width: trackWidth, banking: 0 },
          { start: [100, 0, -50], end: [200, 0, -100], width: trackWidth, banking: 0 },
          { start: [200, 0, -100], end: [250, 0, 0], width: trackWidth, banking: 0.05 },
          { start: [250, 0, 0], end: [200, 0, 100], width: trackWidth, banking: 0.05 },
          { start: [200, 0, 100], end: [100, 0, 150], width: trackWidth, banking: 0 },
          { start: [100, 0, 150], end: [0, 0, 100], width: trackWidth, banking: 0 },
          { start: [0, 0, 100], end: [0, 0, 0], width: trackWidth, banking: 0 },
        ];
      default:
        return [
          { start: [0, 0, 0], end: [0, 0, -100], width: trackWidth, banking: 0 },
          { start: [0, 0, -100], end: [100, 2, -100], width: trackWidth, banking: trackBanking },
          { start: [100, 2, -100], end: [150, 4, -50], width: trackWidth, banking: trackBanking },
          { start: [150, 4, -50], end: [150, 4, 50], width: trackWidth, banking: 0 },
          { start: [150, 4, 50], end: [100, 2, 100], width: trackWidth, banking: -trackBanking },
          { start: [100, 2, 100], end: [0, 0, 100], width: trackWidth, banking: -trackBanking },
          { start: [0, 0, 100], end: [0, 0, 0], width: trackWidth, banking: 0 },
        ];
    }
  };

  const trackSegments = getTrackLayout();
  const textures = getEnvironmentTextures();
  
  // Ground physics
  const [groundRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.1, 0],
    material: { 
      friction: environment.weather === 'rain' || environment.weather === 'snow' ? 0.6 : 0.8, 
      restitution: 0.2 
    }
  }));

  // Create checkpoint triggers
  const createCheckpointTrigger = (checkpoint: { id: number; position: [number, number, number]; rotation: number }) => {
    const [checkpointRef] = useBox(() => ({
      args: [10, 5, 1],
      position: checkpoint.position,
      rotation: [0, checkpoint.rotation, 0],
      isTrigger: true,
      onCollide: (e) => {
        if (e.body.name === 'playerCar' && onCheckpointReached) {
          onCheckpointReached(checkpoint.id);
        }
      }
    }));

    return (
      <mesh ref={checkpointRef as any} position={checkpoint.position} rotation={[0, checkpoint.rotation, 0]} visible={false}>
        <boxGeometry args={[10, 5, 1]} />
        <meshStandardMaterial color="#00ff00" transparent opacity={0.2} />
      </mesh>
    );
  };

  // Get ground color based on environment
  const getGroundColor = () => {
    switch (environment.type) {
      case 'urban': return "#0a0a1e";
      case 'highway': return "#1a1a2e";
      case 'desert': return "#aa8855";
      case 'snow': return "#e0e0e8";
      case 'beach': return "#ddcc99";
      default: return "#0a0a1e";
    }
  };

  // Get track color based on environment
  const getTrackColor = () => {
    switch (environment.type) {
      case 'urban': return "#202040";
      case 'highway': return "#303050";
      case 'desert': return "#aa7744";
      case 'snow': return "#aaaacc";
      case 'beach': return "#ccbb88";
      default: return "#202040";
    }
  };

  return (
    <group>
      {/* Ground with environment-specific texture */}
      <mesh ref={groundRef as any} receiveShadow>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial 
          color={getGroundColor()}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Track segments with environment-specific visuals */}
      {trackSegments.map((segment, index) => {
        const start = segment.start;
        const end = segment.end;
        const width = segment.width;
        const banking = segment.banking;
        
        // Calculate length and position
        const length = Math.sqrt(
          Math.pow(end[0] - start[0], 2) +
          Math.pow(end[2] - start[2], 2)
        );
        
        const midX = (start[0] + end[0]) / 2;
        const midY = (start[1] + end[1]) / 2;
        const midZ = (start[2] + end[2]) / 2;
        
        // Calculate rotation
        const angle = Math.atan2(end[0] - start[0], end[2] - start[2]);
        
        return (
          <group key={index}>
            {/* Main track surface */}
            <mesh position={[midX, midY, midZ]} rotation={[0, angle, banking]} receiveShadow>
              <boxGeometry args={[width, 0.2, length]} />
              <meshStandardMaterial 
                color={getTrackColor()}
                roughness={0.6}
                metalness={0.4}
              />
            </mesh>

            {/* Track markings */}
            <mesh position={[midX, midY + 0.01, midZ]} rotation={[0, angle, banking]} receiveShadow>
              <planeGeometry args={[width, length]} />
              <meshStandardMaterial 
                map={fallbackTextures.diffuse}
                normalMap={fallbackTextures.normal}
                roughnessMap={fallbackTextures.roughness}
                roughness={0.8}
                metalness={0.2}
              />
            </mesh>

            {/* Left barrier */}
            <mesh position={[midX - width/2, midY + barrierHeight/2, midZ]} rotation={[0, angle, banking]}>
              <boxGeometry args={[0.5, barrierHeight, length]} />
              <meshStandardMaterial color={textures.barrier} metalness={0.6} roughness={0.4} />
            </mesh>

            {/* Right barrier */}
            <mesh position={[midX + width/2, midY + barrierHeight/2, midZ]} rotation={[0, angle, banking]}>
              <boxGeometry args={[0.5, barrierHeight, length]} />
              <meshStandardMaterial color={textures.barrier} metalness={0.6} roughness={0.4} />
            </mesh>

            {/* Left rumble strip */}
            <mesh position={[midX - width/2 + 0.75, midY + 0.05, midZ]} rotation={[0, angle, banking]}>
              <boxGeometry args={[1.5, 0.1, length]} />
              <meshStandardMaterial color={textures.rumble} />
            </mesh>

            {/* Right rumble strip */}
            <mesh position={[midX + width/2 - 0.75, midY + 0.05, midZ]} rotation={[0, angle, banking]}>
              <boxGeometry args={[1.5, 0.1, length]} />
              <meshStandardMaterial color={textures.rumble} />
            </mesh>
          </group>
        );
      })}

      {/* Checkpoint triggers */}
      {checkpoints.map((checkpoint) => createCheckpointTrigger(checkpoint))}

      {/* Environment-specific decorations */}
      <EnvironmentDecorations type={environment.type} weather={environment.weather} />
    </group>
  );
};

// Environment-specific decorations
const EnvironmentDecorations: React.FC<{ type: string; weather: string }> = ({ type, weather }) => {
  switch (type) {
    case 'urban':
      return <UrbanDecorations />;
    case 'highway':
      return <HighwayDecorations />;
    case 'desert':
      return <DesertDecorations />;
    case 'snow':
      return <SnowDecorations />;
    case 'beach':
      return <BeachDecorations />;
    default:
      return <UrbanDecorations />;
  }
};

// Urban environment decorations
const UrbanDecorations = () => {
  return (
    <group>
      {/* Buildings */}
      {Array.from({ length: 40 }).map((_, i) => (
        <Building 
          key={i}
          position={[
            (Math.random() - 0.5) * 400,
            0,
            (Math.random() - 0.5) * 400
          ]}
          type="urban"
        />
      ))}
      
      {/* Street lights */}
      {Array.from({ length: 30 }).map((_, i) => (
        <StreetLight 
          key={i}
          position={[
            (Math.random() - 0.5) * 300,
            0,
            (Math.random() - 0.5) * 300
          ]}
        />
      ))}
      
      {/* Crowd stands */}
      <CrowdStands position={[30, 0, 0]} />
      <CrowdStands position={[-30, 0, -50]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
};

// Highway environment decorations
const HighwayDecorations = () => {
  return (
    <group>
      {/* Distant mountains */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Mountain 
          key={i}
          position={[
            (Math.random() - 0.5) * 1000,
            0,
            (Math.random() - 0.5) * 1000
          ]}
          scale={10 + Math.random() * 20}
        />
      ))}
      
      {/* Trees along the highway */}
      {Array.from({ length: 100 }).map((_, i) => (
        <Tree 
          key={i} 
          position={[
            (Math.random() - 0.5) * 500,
            0,
            (Math.random() - 0.5) * 500
          ]} 
          type="pine"
        />
      ))}
      
      {/* Highway signs */}
      {Array.from({ length: 10 }).map((_, i) => (
        <HighwaySign 
          key={i}
          position={[
            (Math.random() - 0.5) * 300,
            0,
            (Math.random() - 0.5) * 300
          ]}
        />
      ))}
    </group>
  );
};

// Desert environment decorations
const DesertDecorations = () => {
  return (
    <group>
      {/* Cacti */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Cactus 
          key={i} 
          position={[
            (Math.random() - 0.5) * 400,
            0,
            (Math.random() - 0.5) * 400
          ]} 
        />
      ))}
      
      {/* Rock formations */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Rock 
          key={i}
          position={[
            (Math.random() - 0.5) * 500,
            0,
            (Math.random() - 0.5) * 500
          ]}
          scale={1 + Math.random() * 3}
        />
      ))}
      
      {/* Distant mesas */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Mesa 
          key={i}
          position={[
            (Math.random() - 0.5) * 800,
            0,
            (Math.random() - 0.5) * 800
          ]}
        />
      ))}
    </group>
  );
};

// Snow environment decorations
const SnowDecorations = () => {
  return (
    <group>
      {/* Pine trees */}
      {Array.from({ length: 100 }).map((_, i) => (
        <Tree 
          key={i} 
          position={[
            (Math.random() - 0.5) * 400,
            0,
            (Math.random() - 0.5) * 400
          ]} 
          type="snow_pine"
        />
      ))}
      
      {/* Snow-covered rocks */}
      {Array.from({ length: 40 }).map((_, i) => (
        <Rock 
          key={i}
          position={[
            (Math.random() - 0.5) * 300,
            0,
            (Math.random() - 0.5) * 300
          ]}
          scale={1 + Math.random() * 2}
          color="#e0e0e8"
        />
      ))}
      
      {/* Distant mountains */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Mountain 
          key={i}
          position={[
            (Math.random() - 0.5) * 1000,
            0,
            (Math.random() - 0.5) * 1000
          ]}
          scale={15 + Math.random() * 25}
          color="#ffffff"
        />
      ))}
      
      {/* Ski lodge */}
      <SkiLodge position={[200, 0, 200]} />
    </group>
  );
};

// Beach environment decorations
const BeachDecorations = () => {
  return (
    <group>
      {/* Palm trees */}
      {Array.from({ length: 80 }).map((_, i) => (
        <Tree 
          key={i} 
          position={[
            (Math.random() - 0.5) * 400,
            0,
            (Math.random() - 0.5) * 400
          ]} 
          type="palm"
        />
      ))}
      
      {/* Beach umbrellas */}
      {Array.from({ length: 30 }).map((_, i) => (
        <BeachUmbrella 
          key={i}
          position={[
            (Math.random() - 0.5) * 300,
            0,
            (Math.random() - 0.5) * 300
          ]}
        />
      ))}
      
      {/* Beach huts */}
      {Array.from({ length: 10 }).map((_, i) => (
        <BeachHut 
          key={i}
          position={[
            (Math.random() - 0.5) * 400,
            0,
            (Math.random() - 0.5) * 400
          ]}
        />
      ))}
      
      {/* Ocean in the distance */}
      <Ocean position={[0, -1, -500]} />
    </group>
  );
};

// Decoration components
const Tree = ({ position, type = 'normal' }: { position: [number, number, number]; type?: string }) => {
  switch (type) {
    case 'pine':
      return (
        <mesh position={position}>
          <cylinderGeometry args={[0.3, 0.5, 2]} />
          <meshStandardMaterial color="#3a2a15" />
          <mesh position={[0, 2, 0]}>
            <coneGeometry args={[2, 4]} />
            <meshStandardMaterial color="#1a4721" />
          </mesh>
          <mesh position={[0, 3, 0]}>
            <coneGeometry args={[1.5, 3]} />
            <meshStandardMaterial color="#1a4721" />
          </mesh>
          <mesh position={[0, 4, 0]}>
            <coneGeometry args={[1, 2]} />
            <meshStandardMaterial color="#1a4721" />
          </mesh>
        </mesh>
      );
    case 'snow_pine':
      return (
        <mesh position={position}>
          <cylinderGeometry args={[0.3, 0.5, 2]} />
          <meshStandardMaterial color="#3a2a15" />
          <mesh position={[0, 2, 0]}>
            <coneGeometry args={[2, 4]} />
            <meshStandardMaterial color="#1a3721" />
            <mesh position={[0, 0.5, 0]} scale={[1.05, 0.2, 1.05]}>
              <coneGeometry args={[2, 1]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </mesh>
          <mesh position={[0, 3, 0]}>
            <coneGeometry args={[1.5, 3]} />
            <meshStandardMaterial color="#1a3721" />
            <mesh position={[0, 0.5, 0]} scale={[1.05, 0.2, 1.05]}>
              <coneGeometry args={[1.5, 1]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </mesh>
          <mesh position={[0, 4, 0]}>
            <coneGeometry args={[1, 2]} />
            <meshStandardMaterial color="#1a3721" />
            <mesh position={[0, 0.5, 0]} scale={[1.05, 0.2, 1.05]}>
              <coneGeometry args={[1, 1]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </mesh>
        </mesh>
      );
    case 'palm':
      return (
        <mesh position={position}>
          <cylinderGeometry args={[0.3, 0.5, 5]} />
          <meshStandardMaterial color="#7d6c4c" />
          {Array.from({ length: 7 }).map((_, i) => (
            <mesh 
              key={i} 
              position={[0, 5, 0]} 
              rotation={[
                Math.random() * 0.5 - 0.7, 
                Math.PI * 2 * i / 7, 
                0
              ]}
            >
              <boxGeometry args={[0.2, 0.1, 3]} />
              <meshStandardMaterial color="#2d8a47" />
              <mesh position={[0, 0, 1.5]} rotation={[0.2, 0, 0]}>
                <boxGeometry args={[1.5, 0.05, 1.5]} />
                <meshStandardMaterial color="#2d8a47" />
              </mesh>
            </mesh>
          ))}
        </mesh>
      );
    default:
      return (
        <mesh position={position}>
          <cylinderGeometry args={[0.3, 0.5, 2]} />
          <meshStandardMaterial color="#2d1a0a" />
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshStandardMaterial color="#2d5a27" />
          </mesh>
        </mesh>
      );
  }
};

const Building = ({ 
  position, 
  type = 'urban' 
}: { 
  position: [number, number, number]; 
  type?: string 
}) => {
  const height = 5 + Math.random() * 15;
  const width = 5 + Math.random() * 5;
  const depth = 5 + Math.random() * 5;
  
  let color = "#303040";
  switch (type) {
    case 'urban':
      color = Math.random() > 0.5 ? "#303040" : "#404050";
      break;
    case 'industrial':
      color = Math.random() > 0.5 ? "#505050" : "#605040";
      break;
    default:
      color = "#303040";
  }
  
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} />
      
      {/* Windows */}
      {Array.from({ length: Math.floor(height / 2) }).map((_, i) => (
        <group key={i} position={[0, i * 2 - height / 2 + 2, 0]}>
          {Array.from({ length: 4 }).map((_, j) => (
            <mesh 
              key={j} 
              position={[
                (j % 2) * 2 - 1, 
                0, 
                Math.floor(j / 2) * 2 - 1
              ]}
              scale={[0.8, 0.8, 0.8]}
            >
              <boxGeometry args={[1, 1, 0.1]} />
              <meshStandardMaterial 
                color="#aaddff" 
                emissive="#aaddff"
                emissiveIntensity={Math.random() > 0.3 ? 0.5 : 0}
              />
            </mesh>
          ))}
        </group>
      ))}
    </mesh>
  );
};

const CrowdStands = ({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0] 
}: { 
  position?: [number, number, number]; 
  rotation?: [number, number, number]; 
}) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[20, 10, 5]} />
        <meshStandardMaterial color="#404040" />
      </mesh>
      
      {/* Crowd */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 18, 
            10 + Math.random() * 2, 
            (Math.random() - 0.5) * 3 + 1
          ]}
        >
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial 
            color={`hsl(${Math.random() * 360}, 70%, 50%)`} 
          />
        </mesh>
      ))}
    </group>
  );
};

const StreetLight = ({ position }: { position: [number, number, number] }) => {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.2, 0.3, 5]} />
      <meshStandardMaterial color="#333333" />
      <mesh position={[0, 2.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 2]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[1, 2.5, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.5]} />
        <meshStandardMaterial 
          color="#ffff88" 
          emissive="#ffff88"
          emissiveIntensity={1}
        />
        <pointLight 
          position={[0, -1, 0]} 
          intensity={0.5} 
          distance={10} 
          color="#ffffaa"
        />
      </mesh>
    </mesh>
  );
};

const Mountain = ({ 
  position, 
  scale = 10, 
  color = "#556677" 
}: { 
  position: [number, number, number]; 
  scale?: number; 
  color?: string; 
}) => {
  return (
    <mesh position={position}>
      <coneGeometry args={[scale, scale * 2, 4]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const HighwaySign = ({ position }: { position: [number, number, number] }) => {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.2, 0.2, 6]} />
      <meshStandardMaterial color="#777777" />
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[4, 2, 0.2]} />
        <meshStandardMaterial color="#22aa22" />
      </mesh>
    </mesh>
  );
};

const Cactus = ({ position }: { position: [number, number, number] }) => {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.5, 0.7, 3 + Math.random() * 2]} />
      <meshStandardMaterial color="#2a6e37" />
      
      {/* Arms */}
      {Math.random() > 0.5 && (
        <mesh 
          position={[0, Math.random() * 1 + 0.5, 0]} 
          rotation={[0, 0, Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1)]}
        >
          <cylinderGeometry args={[0.3, 0.4, 1.5]} />
          <meshStandardMaterial color="#2a6e37" />
          <mesh position={[0, 0.7, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.3, 0.3, 1]} />
            <meshStandardMaterial color="#2a6e37" />
          </mesh>
        </mesh>
      )}
    </mesh>
  );
};

const Rock = ({ 
  position, 
  scale = 1, 
  color = "#777777" 
}: { 
  position: [number, number, number]; 
  scale?: number; 
  color?: string; 
}) => {
  return (
    <mesh position={position} scale={[scale, scale, scale]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
};

const Mesa = ({ position }: { position: [number, number, number] }) => {
  const height = 20 + Math.random() * 30;
  const topWidth = 30 + Math.random() * 50;
  const bottomWidth = topWidth + 20 + Math.random() * 30;
  
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[bottomWidth, height, bottomWidth]} />
        <meshStandardMaterial color="#aa6633" />
      </mesh>
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[topWidth, 5, topWidth]} />
        <meshStandardMaterial color="#cc8844" />
      </mesh>
    </group>
  );
};

const SkiLodge = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[15, 10, 10]} />
        <meshStandardMaterial color="#6d4c41" />
      </mesh>
      <mesh position={[0, 11, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[20, 3, 12]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      
      {/* Windows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (i % 3) * 4 - 4, 
            5 + Math.floor(i / 3) * 4, 
            5.1
          ]}
        >
          <boxGeometry args={[2, 2, 0.1]} />
          <meshStandardMaterial 
            color="#ffffdd" 
            emissive="#ffffdd"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      
      {/* Chimney */}
      <mesh position={[5, 13, 0]}>
        <boxGeometry args={[2, 5, 2]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
    </group>
  );
};

const BeachUmbrella = ({ position }: { position: [number, number, number] }) => {
  const color = Math.random() > 0.5 ? "#ff5555" : 
                Math.random() > 0.5 ? "#55ff55" : "#5555ff";
  
  return (
    <group position={position}>
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 4]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <coneGeometry args={[3, 1, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

const BeachHut = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[6, 4, 6]} />
        <meshStandardMaterial color="#d7ccc8" />
      </mesh>
      <mesh position={[0, 4.5, 0]}>
        <coneGeometry args={[4.5, 2, 4]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
    </group>
  );
};

const Ocean = ({ position }: { position: [number, number, number] }) => {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2000, 1000]} />
      <meshStandardMaterial 
        color="#0077be" 
        metalness={0.6}
        roughness={0.2}
      />
    </mesh>
  );
};

export default RaceTrack;
