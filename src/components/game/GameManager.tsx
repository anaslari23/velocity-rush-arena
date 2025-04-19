import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Stats, PerspectiveCamera, Sky } from '@react-three/drei';
import Car from './Car';
import RaceTrack from './RaceTrack';
import GameUI from './GameUI';
import { useToast } from '@/components/ui/use-toast';
import * as THREE from 'three';

const GameManager: React.FC = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 1, 0]);
  const [playerSpeed, setPlayerSpeed] = useState(0);
  const [currentLap, setCurrentLap] = useState(1);
  const [totalLaps] = useState(3);
  const [racePosition, setRacePosition] = useState(1);
  const [totalRacers] = useState(4);
  const [raceTime, setRaceTime] = useState(0);
  const [nitroAmount, setNitroAmount] = useState(100);
  const [checkpoints, setCheckpoints] = useState<number[]>([]);
  const [aiCars, setAiCars] = useState<Array<{position: [number, number, number], color: string}>>([
    { position: [5, 1, 0], color: '#3388ff' },
    { position: [-5, 1, 0], color: '#ff8800' },
    { position: [2, 1, 0], color: '#88ff00' },
  ]);
  
  const { toast } = useToast();
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const cameraPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 4, 10));
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  
  useEffect(() => {
    if (!isGameStarted || isPaused) return;
    
    const gameLoop = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }
      
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;
      
      setRaceTime(prevTime => prevTime + deltaTime);
      
      updateGameState(deltaTime);
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isGameStarted, isPaused]);
  
  const updateGameState = (deltaTime: number) => {
    if (Math.random() < 0.002) {
      const newPosition = Math.max(1, Math.min(totalRacers, racePosition + (Math.random() > 0.5 ? 1 : -1)));
      setRacePosition(newPosition);
    }
    
    const checkpointCount = checkpoints.length;
    if (checkpointCount >= 4) {
      setCheckpoints([]);
      
      if (currentLap < totalLaps) {
        setCurrentLap(prev => prev + 1);
        toast({
          title: `Lap ${currentLap} completed!`,
          description: `Time: ${formatTime(raceTime)}`,
        });
      } else {
        setIsPaused(true);
        toast({
          title: 'Race Completed!',
          description: `Your final time: ${formatTime(raceTime)}`,
          variant: 'default',
        });
      }
    }
  };
  
  const formatTime = (timeMs: number) => {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const milliseconds = Math.floor((timeMs % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
  };
  
  const handlePlayerUpdate = (position: [number, number, number], speed: number) => {
    setPlayerPosition(position);
    setPlayerSpeed(speed);
    
    setNitroAmount(prevNitro => {
      const newNitro = prevNitro + (Math.random() > 0.8 ? 1 : -0.5);
      return Math.max(0, Math.min(100, newNitro));
    });
    
    if (cameraRef.current) {
      const carDir = new THREE.Vector3(
        Math.sin(cameraRef.current.rotation.y),
        0,
        Math.cos(cameraRef.current.rotation.y)
      ).normalize();
      
      const idealOffset = new THREE.Vector3(
        position[0] - carDir.x * 7,
        position[1] + 3 + speed * 0.05,
        position[2] - carDir.z * 7
      );
      
      cameraPosRef.current.lerp(idealOffset, 0.05);
      
      cameraRef.current.position.copy(cameraPosRef.current);
      
      const targetPos = new THREE.Vector3(position[0], position[1], position[2]);
      cameraTargetRef.current.lerp(targetPos, 0.1);
      cameraRef.current.lookAt(cameraTargetRef.current);
    }
  };
  
  const handleCheckpointReached = (checkpointId: number) => {
    if (!checkpoints.includes(checkpointId)) {
      setCheckpoints(prev => [...prev, checkpointId]);
    }
  };
  
  const handleStartGame = () => {
    setIsGameStarted(true);
    setIsPaused(false);
    resetGame();
  };
  
  const handlePauseGame = () => {
    setIsPaused(true);
  };
  
  const handleResumeGame = () => {
    setIsPaused(false);
    lastTimeRef.current = 0;
  };
  
  const handleRestartGame = () => {
    resetGame();
    setIsPaused(false);
  };
  
  const handleExitGame = () => {
    setIsGameStarted(false);
    resetGame();
  };
  
  const resetGame = () => {
    setRaceTime(0);
    setCurrentLap(1);
    setCheckpoints([]);
    setRacePosition(1);
    lastTimeRef.current = 0;
    
    setPlayerPosition([0, 1, 0]);
    setPlayerSpeed(0);
    setNitroAmount(100);
  };
  
  return (
    <div className="w-screen h-screen">
      <Canvas shadows>
        <Physics 
          gravity={[0, -30, 0]} 
          defaultContactMaterial={{ friction: 0.5, restitution: 0.3 }}
        >
          <PerspectiveCamera 
            ref={cameraRef} 
            makeDefault 
            position={[playerPosition[0], playerPosition[1] + 4, playerPosition[2] + 10]} 
            fov={75} 
          />
          
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            castShadow 
            shadow-mapSize-width={2048} 
            shadow-mapSize-height={2048}
          />
          
          <Sky sunPosition={[100, 100, 20]} />
          
          <RaceTrack onCheckpointReached={handleCheckpointReached} />
          
          <Car 
            position={playerPosition} 
            color="#ff0066" 
            isPlayer={true} 
            onUpdate={handlePlayerUpdate} 
          />
          
          {aiCars.map((car, index) => (
            <Car 
              key={index} 
              position={car.position} 
              color={car.color} 
              isPlayer={false} 
            />
          ))}
        </Physics>
        
        {process.env.NODE_ENV === 'development' && <Stats />}
      </Canvas>
      
      <GameUI 
        speed={playerSpeed}
        nitroAmount={nitroAmount}
        lap={currentLap}
        totalLaps={totalLaps}
        position={racePosition}
        totalRacers={totalRacers}
        time={raceTime}
        isGameStarted={isGameStarted}
        isPaused={isPaused}
        onStart={handleStartGame}
        onPause={handlePauseGame}
        onResume={handleResumeGame}
        onRestart={handleRestartGame}
        onExit={handleExitGame}
      />
    </div>
  );
};

export default GameManager;
