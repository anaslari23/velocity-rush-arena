import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Stats, PerspectiveCamera, Sky, Environment, useTexture } from '@react-three/drei';
import Car from './Car';
import RaceTrack from './RaceTrack';
import GameUI from './GameUI';
import { useToast } from '@/components/ui/use-toast';
import * as THREE from 'three';
import { CarData, Environment as GameEnvironment, CarCustomization, GameSettings, Track } from './types';
import { aiDrivers, tracks, soundEffects, backgroundMusic, weatherEffects } from './gameData';
import { Howl } from 'howler';

interface GameManagerProps {
  selectedCar: CarData;
  carCustomization: CarCustomization;
  environment: GameEnvironment;
  difficulty: 'easy' | 'medium' | 'hard';
  settings: GameSettings;
  onExit: () => void;
  onRaceComplete: (coinsEarned: number, xpEarned: number) => void;
}

const GameManager: React.FC<GameManagerProps> = ({
  selectedCar,
  carCustomization,
  environment,
  difficulty,
  settings,
  onExit,
  onRaceComplete
}) => {
  // Game state
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [isRaceComplete, setIsRaceComplete] = useState(false);
  const [raceResults, setRaceResults] = useState<{
    position: number;
    time: number;
    coinsEarned: number;
    xpEarned: number;
  } | null>(null);
  
  // Player state
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 1, 0]);
  const [playerSpeed, setPlayerSpeed] = useState(0);
  const [playerRotation, setPlayerRotation] = useState(0);
  const [currentLap, setCurrentLap] = useState(1);
  const [totalLaps] = useState(3);
  const [racePosition, setRacePosition] = useState(1);
  const [raceTime, setRaceTime] = useState(0);
  const [nitroAmount, setNitroAmount] = useState(100);
  const [checkpoints, setCheckpoints] = useState<number[]>([]);
  
  // AI state
  const [aiCars, setAiCars] = useState<Array<{
    id: string;
    position: [number, number, number];
    rotation: number;
    speed: number;
    color: string;
    lap: number;
    checkpoints: number[];
    carType: CarData;
  }>>([]);
  
  // Track and environment
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [weatherType, setWeatherType] = useState(environment.weather);
  
  // Audio
  const engineSoundRef = useRef<Howl | null>(null);
  const nitroSoundRef = useRef<Howl | null>(null);
  const driftSoundRef = useRef<Howl | null>(null);
  const musicRef = useRef<Howl | null>(null);
  const countdownSoundRef = useRef<Howl | null>(null);
  
  // Game loop refs
  const { toast } = useToast();
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const cameraPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 4, 10));
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  
  // Initialize the game
  useEffect(() => {
    // Find a track for the selected environment
    const track = tracks.find(t => t.environment === environment.id) || tracks[0];
    setCurrentTrack(track);
    
    // Initialize AI cars based on difficulty
    const numberOfAI = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
    const difficultyLevel = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 6 : 9;
    
    // Filter AI drivers by difficulty
    const eligibleDrivers = aiDrivers.filter(driver => 
      driver.difficulty <= difficultyLevel + 2 && driver.difficulty >= difficultyLevel - 2
    );
    
    // Create AI cars
    const aiCarsData = eligibleDrivers.slice(0, numberOfAI).map((driver, index) => ({
      id: driver.id,
      position: track.startPositions[index + 1] || [5 * (index + 1), 1, 0],
      rotation: 0,
      speed: 0,
      color: driver.color,
      lap: 1,
      checkpoints: [],
      carType: driver.car
    }));
    
    setAiCars(aiCarsData);
    
    // Initialize audio if enabled
    if (settings.sfxVolume > 0) {
      engineSoundRef.current = new Howl({
        src: [soundEffects.engine.idle],
        loop: true,
        volume: settings.sfxVolume / 100
      });
      
      nitroSoundRef.current = new Howl({
        src: [soundEffects.nitro],
        volume: settings.sfxVolume / 100
      });
      
      driftSoundRef.current = new Howl({
        src: [soundEffects.drift],
        volume: settings.sfxVolume / 100
      });
      
      countdownSoundRef.current = new Howl({
        src: [soundEffects.countdown],
        volume: settings.sfxVolume / 100
      });
    }
    
    // Initialize music if enabled
    if (settings.musicVolume > 0) {
      const randomTrack = backgroundMusic.race[Math.floor(Math.random() * backgroundMusic.race.length)];
      musicRef.current = new Howl({
        src: [randomTrack],
        loop: true,
        volume: settings.musicVolume / 100
      });
    }
    
    // Set player starting position
    setPlayerPosition(track.startPositions[0] || [0, 1, 0]);
    
    // Cleanup function
    return () => {
      if (engineSoundRef.current) engineSoundRef.current.stop();
      if (nitroSoundRef.current) nitroSoundRef.current.stop();
      if (driftSoundRef.current) driftSoundRef.current.stop();
      if (musicRef.current) musicRef.current.stop();
      if (countdownSoundRef.current) countdownSoundRef.current.stop();
      
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [environment, difficulty, settings.sfxVolume, settings.musicVolume]);
  
  // Game loop
  useEffect(() => {
    if (!isGameStarted || isPaused || isCountdown || isRaceComplete) return;
    
    // Start engine sound
    if (engineSoundRef.current && !engineSoundRef.current.playing()) {
      engineSoundRef.current.play();
    }
    
    // Start music
    if (musicRef.current && !musicRef.current.playing()) {
      musicRef.current.play();
    }
    
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
  }, [isGameStarted, isPaused, isCountdown, isRaceComplete]);
  
  // Countdown timer
  useEffect(() => {
    if (!isCountdown) return;
    
    let countdownTimer: NodeJS.Timeout;
    
    if (countdownValue > 0) {
      // Play countdown sound
      if (countdownSoundRef.current) {
        countdownSoundRef.current.play();
      }
      
      countdownTimer = setTimeout(() => {
        setCountdownValue(prev => prev - 1);
      }, 1000);
    } else {
      // Start the race
      setIsCountdown(false);
      setIsGameStarted(true);
    }
    
    return () => {
      if (countdownTimer) clearTimeout(countdownTimer);
    };
  }, [isCountdown, countdownValue]);
  
  // Update game state
  const updateGameState = useCallback((deltaTime: number) => {
    // Update AI cars
    setAiCars(prevAiCars => {
      return prevAiCars.map(car => {
        // Simple AI logic - will be enhanced in future updates
        const difficultyFactor = difficulty === 'easy' ? 0.7 : difficulty === 'medium' ? 0.85 : 1;
        const maxSpeed = 30 * difficultyFactor;
        const acceleration = 5 * difficultyFactor;
        const randomFactor = Math.random() * 0.2 - 0.1; // -0.1 to 0.1
        
        // Accelerate or decelerate
        let newSpeed = car.speed;
        if (newSpeed < maxSpeed) {
          newSpeed += acceleration * (deltaTime / 1000) * (1 + randomFactor);
        }
        
        // Apply some randomness to make AI less perfect
        const turnAmount = Math.sin(raceTime * 0.001 + parseInt(car.id.split('_')[1])) * 0.02;
        
        // Calculate new position based on speed and rotation
        const newX = car.position[0] + Math.sin(car.rotation) * newSpeed * (deltaTime / 1000);
        const newZ = car.position[2] + Math.cos(car.rotation) * newSpeed * (deltaTime / 1000);
        
        return {
          ...car,
          position: [newX, car.position[1], newZ] as [number, number, number],
          rotation: car.rotation + turnAmount,
          speed: newSpeed
        };
      });
    });
    
    // Update race positions based on checkpoints and laps
    const allRacers = [
      { 
        id: 'player', 
        lap: currentLap, 
        checkpoints: checkpoints.length,
        position: playerPosition
      },
      ...aiCars.map(car => ({ 
        id: car.id, 
        lap: car.lap, 
        checkpoints: car.checkpoints.length,
        position: car.position
      }))
    ];
    
    // Sort racers by lap and checkpoints
    allRacers.sort((a, b) => {
      if (a.lap !== b.lap) return b.lap - a.lap;
      return b.checkpoints - a.checkpoints;
    });
    
    // Find player position
    const playerIndex = allRacers.findIndex(racer => racer.id === 'player');
    if (playerIndex !== -1) {
      setRacePosition(playerIndex + 1);
    }
    
    // Check if player completed all laps
    if (currentLap > totalLaps && !isRaceComplete) {
      completeRace();
    }
  }, [currentLap, totalLaps, checkpoints, playerPosition, aiCars, difficulty, isRaceComplete]);
  
  // Complete race
  const completeRace = useCallback(() => {
    setIsRaceComplete(true);
    setIsPaused(true);
    
    // Stop engine sound
    if (engineSoundRef.current) {
      engineSoundRef.current.stop();
    }
    
    // Stop music
    if (musicRef.current) {
      musicRef.current.fade(musicRef.current.volume(), 0, 1000);
      setTimeout(() => {
        if (musicRef.current) musicRef.current.stop();
      }, 1000);
    }
    
    // Calculate rewards based on position and time
    const positionMultiplier = racePosition === 1 ? 3 : racePosition === 2 ? 2 : racePosition === 3 ? 1.5 : 1;
    const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
    const timeBonus = Math.max(0, 300000 - raceTime) / 10000; // Bonus for finishing quickly
    
    const coinsEarned = Math.round(100 * positionMultiplier * difficultyMultiplier + timeBonus);
    const xpEarned = Math.round(50 * positionMultiplier * difficultyMultiplier + timeBonus / 2);
    
    setRaceResults({
      position: racePosition,
      time: raceTime,
      coinsEarned,
      xpEarned
    });
    
    // Show toast notification
    toast({
      title: racePosition === 1 ? 'Victory!' : 'Race Completed!',
      description: `Position: ${racePosition}/${aiCars.length + 1} | Time: ${formatTime(raceTime)}`,
      variant: racePosition === 1 ? 'default' : 'destructive',
    });
  }, [racePosition, difficulty, raceTime, aiCars.length, toast]);
  
  // Format time for display
  const formatTime = (timeMs: number) => {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const milliseconds = Math.floor((timeMs % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
  };
  
  // Handle player car updates
  const handlePlayerUpdate = (position: [number, number, number], speed: number, rotation: number, isNitroActive: boolean, isDrifting: boolean) => {
    setPlayerPosition(position);
    setPlayerSpeed(speed);
    setPlayerRotation(rotation);
    
    // Update nitro amount
    setNitroAmount(prevNitro => {
      let newNitro = prevNitro;
      if (isNitroActive) {
        newNitro -= 0.5; // Consume nitro
      } else {
        newNitro += 0.1; // Regenerate nitro slowly
      }
      return Math.max(0, Math.min(100, newNitro));
    });
    
    // Update camera position
    if (cameraRef.current) {
      // Calculate camera position based on car direction
      const carDir = new THREE.Vector3(
        Math.sin(rotation),
        0,
        Math.cos(rotation)
      ).normalize();
      
      // Position camera behind the car
      const cameraHeight = 3 + speed * 0.02; // Camera rises with speed
      const cameraDistance = 7 - speed * 0.02; // Camera gets closer with speed
      
      const idealOffset = new THREE.Vector3(
        position[0] - carDir.x * cameraDistance,
        position[1] + cameraHeight,
        position[2] - carDir.z * cameraDistance
      );
      
      // Smooth camera movement
      cameraPosRef.current.lerp(idealOffset, isDrifting ? 0.03 : 0.05);
      cameraRef.current.position.copy(cameraPosRef.current);
      
      // Look at car
      const targetPos = new THREE.Vector3(
        position[0], 
        position[1] + 1, // Look slightly above the car
        position[2]
      );
      cameraTargetRef.current.lerp(targetPos, 0.1);
      cameraRef.current.lookAt(cameraTargetRef.current);
    }
    
    // Update engine sound based on speed
    if (engineSoundRef.current && settings.sfxVolume > 0) {
      // Adjust volume based on speed
      const volume = Math.min(1, 0.3 + speed / 50) * (settings.sfxVolume / 100);
      engineSoundRef.current.volume(volume);
      
      // Adjust playback rate based on speed
      const rate = 0.8 + speed / 40;
      engineSoundRef.current.rate(rate);
    }
    
    // Play nitro sound
    if (isNitroActive && nitroSoundRef.current && !nitroSoundRef.current.playing() && settings.sfxVolume > 0) {
      nitroSoundRef.current.play();
    }
    
    // Play drift sound
    if (isDrifting && driftSoundRef.current && !driftSoundRef.current.playing() && settings.sfxVolume > 0) {
      driftSoundRef.current.play();
    } else if (!isDrifting && driftSoundRef.current && driftSoundRef.current.playing()) {
      driftSoundRef.current.stop();
    }
  };
  
  // Handle checkpoint reached
  const handleCheckpointReached = (checkpointId: number) => {
    if (!checkpoints.includes(checkpointId)) {
      setCheckpoints(prev => [...prev, checkpointId]);
      
      // Play checkpoint sound
      if (settings.sfxVolume > 0) {
        const checkpointSound = new Howl({
          src: [soundEffects.checkpoint],
          volume: settings.sfxVolume / 100
        });
        checkpointSound.play();
      }
      
      // Check if lap is completed
      if (currentTrack && checkpoints.length + 1 >= currentTrack.checkpoints.length) {
        completeLap();
      }
    }
  };
  
  // Complete a lap
  const completeLap = () => {
    setCheckpoints([]);
    
    if (currentLap < totalLaps) {
      setCurrentLap(prev => prev + 1);
      
      // Show notification
      toast({
        title: `Lap ${currentLap} completed!`,
        description: `Time: ${formatTime(raceTime)}`,
      });
      
      // Add some nitro as reward
      setNitroAmount(prev => Math.min(100, prev + 30));
    } else {
      // Final lap completed
      setCurrentLap(prev => prev + 1);
    }
  };
  
  // Game control handlers
  const handleStartGame = () => {
    setIsCountdown(true);
    setCountdownValue(3);
    resetGame();
  };
  
  const handlePauseGame = () => {
    setIsPaused(true);
    
    // Pause sounds
    if (engineSoundRef.current) engineSoundRef.current.pause();
    if (musicRef.current) musicRef.current.pause();
  };
  
  const handleResumeGame = () => {
    setIsPaused(false);
    lastTimeRef.current = 0;
    
    // Resume sounds
    if (engineSoundRef.current) engineSoundRef.current.play();
    if (musicRef.current) musicRef.current.play();
  };
  
  const handleRestartGame = () => {
    resetGame();
    setIsCountdown(true);
    setCountdownValue(3);
    setIsRaceComplete(false);
    setRaceResults(null);
  };
  
  const handleExitGame = () => {
    // If race was completed, pass the rewards to the parent component
    if (isRaceComplete && raceResults) {
      onRaceComplete(raceResults.coinsEarned, raceResults.xpEarned);
    } else {
      onExit();
    }
  };
  
  // Reset game state
  const resetGame = () => {
    setRaceTime(0);
    setCurrentLap(1);
    setCheckpoints([]);
    setRacePosition(1);
    lastTimeRef.current = 0;
    
    // Reset player
    if (currentTrack) {
      setPlayerPosition(currentTrack.startPositions[0] || [0, 1, 0]);
    } else {
      setPlayerPosition([0, 1, 0]);
    }
    setPlayerSpeed(0);
    setNitroAmount(100);
    
    // Reset AI cars
    if (currentTrack) {
      setAiCars(prevAiCars => 
        prevAiCars.map((car, index) => ({
          ...car,
          position: currentTrack.startPositions[index + 1] || [5 * (index + 1), 1, 0],
          rotation: 0,
          speed: 0,
          lap: 1,
          checkpoints: []
        }))
      );
    }
  };
  
  // Render the game
  return (
    <div className="w-screen h-screen">
      <Canvas shadows>
        <Physics 
          gravity={[0, -30, 0]} 
          defaultContactMaterial={{ 
            friction: weatherType === 'rain' || weatherType === 'snow' ? 0.3 : 0.5, 
            restitution: 0.3 
          }}
        >
          <PerspectiveCamera 
            ref={cameraRef} 
            makeDefault 
            position={[playerPosition[0], playerPosition[1] + 4, playerPosition[2] + 10]} 
            fov={75} 
          />
          
          {/* Lighting based on environment */}
          {weatherType === 'night' ? (
            <>
              <ambientLight intensity={0.2} />
              <directionalLight 
                position={[10, 10, 5]} 
                intensity={0.3} 
                castShadow 
                shadow-mapSize={[2048, 2048]}
              />
              <pointLight 
                position={[playerPosition[0], playerPosition[1] + 2, playerPosition[2]]} 
                intensity={1} 
                distance={20} 
                color="#ffffff"
              />
            </>
          ) : (
            <>
              <ambientLight intensity={weatherType === 'fog' ? 0.3 : 0.5} />
              <directionalLight 
                position={[10, 10, 5]} 
                intensity={weatherType === 'fog' ? 0.7 : 1} 
                castShadow 
                shadow-mapSize={[2048, 2048]}
              />
            </>
          )}
          
          {/* Sky and environment */}
          {weatherType === 'night' ? (
            <Sky sunPosition={[0, -10, 0]} turbidity={10} rayleigh={0.5} />
          ) : weatherType === 'rain' ? (
            <Sky sunPosition={[100, 10, 100]} turbidity={15} rayleigh={3} />
          ) : weatherType === 'fog' ? (
            <Sky sunPosition={[100, 30, 100]} turbidity={20} rayleigh={4} />
          ) : weatherType === 'snow' ? (
            <Sky sunPosition={[100, 50, 100]} turbidity={10} rayleigh={1} />
          ) : (
            <Sky sunPosition={[100, 100, 20]} turbidity={10} rayleigh={0.5} />
          )}
          
          {/* Weather effects */}
          {weatherType === 'rain' && <RainEffect />}
          {weatherType === 'snow' && <SnowEffect />}
          {weatherType === 'fog' && <FogEffect />}
          
          {/* Race track */}
          <RaceTrack 
            environment={environment} 
            onCheckpointReached={handleCheckpointReached} 
            checkpoints={currentTrack?.checkpoints || []}
          />
          
          {/* Player car */}
          <Car 
            position={playerPosition} 
            color={carCustomization.color} 
            isPlayer={true} 
            onUpdate={handlePlayerUpdate}
            carStats={selectedCar.stats}
            customization={carCustomization}
            nitroAmount={nitroAmount}
            controlType={settings.controlType}
          />
          
          {/* AI cars */}
          {aiCars.map((car, index) => (
            <Car 
              key={car.id} 
              position={car.position} 
              rotation={car.rotation}
              color={car.color} 
              isPlayer={false}
              carStats={car.carType.stats}
              customization={{
                color: car.color,
                wheelType: 'standard',
                spoiler: 'medium',
                nitroColor: '#00ffff'
              }}
            />
          ))}
        </Physics>
        
        {/* Show FPS counter if enabled */}
        {settings.showFPS && <Stats />}
      </Canvas>
      
      {/* Game UI */}
      <GameUI 
        speed={playerSpeed}
        nitroAmount={nitroAmount}
        lap={currentLap}
        totalLaps={totalLaps}
        position={racePosition}
        totalRacers={aiCars.length + 1}
        time={raceTime}
        isGameStarted={isGameStarted}
        isPaused={isPaused}
        isCountdown={isCountdown}
        countdownValue={countdownValue}
        isRaceComplete={isRaceComplete}
        raceResults={raceResults}
        onStart={handleStartGame}
        onPause={handlePauseGame}
        onResume={handleResumeGame}
        onRestart={handleRestartGame}
        onExit={handleExitGame}
        environment={environment}
        playerPosition={playerPosition}
        checkpoints={checkpoints}
        controlType={settings.controlType}
      />
    </div>
  );
};

// Weather effect components
const RainEffect = () => {
  return (
    <group>
      {Array.from({ length: 1000 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 200,
            50 + Math.random() * 50,
            (Math.random() - 0.5) * 200
          ]}
        >
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshBasicMaterial color="#aaddff" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

const SnowEffect = () => {
  return (
    <group>
      {Array.from({ length: 500 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 200,
            30 + Math.random() * 30,
            (Math.random() - 0.5) * 200
          ]}
        >
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

const FogEffect = () => {
  return (
    <fog attach="fog" color="#aabbcc" near={10} far={100} />
  );
};

export default GameManager;
