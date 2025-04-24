import React, { useState, useEffect } from 'react';
import { Car } from '../garage/types';
import { Environment, RaceState } from './types';
import { GameSettings } from '../settings/types';
import GameUI from './GameUI';
import GameScene from './GameScene';

interface GameScreenProps {
  car: Car;
  environment: Environment;
  settings: GameSettings;
  onExit: () => void;
  onComplete: (position: number, time: number) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  car,
  environment,
  settings,
  onExit,
  onComplete
}) => {
  // Game state
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [isRaceComplete, setIsRaceComplete] = useState(false);
  
  // Race state
  const [speed, setSpeed] = useState(0);
  const [nitroAmount, setNitroAmount] = useState(100);
  const [lap, setLap] = useState(1);
  const totalLaps = 3;
  const [position, setPosition] = useState(8);
  const totalRacers = 8;
  const [time, setTime] = useState(0);
  const [raceTimer, setRaceTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Player position (for minimap)
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0, 0]);
  
  // Checkpoints
  const [checkpoints, setCheckpoints] = useState<number[]>([]);
  
  // Race results
  const [raceResults, setRaceResults] = useState<{
    position: number;
    time: number;
    coinsEarned: number;
    xpEarned: number;
  } | null>(null);
  
  // Handle speed changes from the 3D scene
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    
    // Update nitro based on speed
    if (newSpeed > 30) {
      setNitroAmount(prev => Math.max(0, prev - 0.2));
    } else {
      setNitroAmount(prev => Math.min(100, prev + 0.1));
    }
    
    // Update position based on speed (simplified)
    if (isGameStarted && !isPaused && !isRaceComplete) {
      if (Math.random() > 0.99) {
        setPosition(prev => Math.max(1, prev - 1));
      }
    }
  };
  
  // Start the race with countdown
  const handleStartRace = () => {
    setIsGameStarted(true);
    setIsCountdown(true);
    
    // Countdown timer
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      setCountdownValue(count);
      
      if (count === 0) {
        clearInterval(countdownInterval);
        setTimeout(() => {
          setIsCountdown(false);
          startRaceTimer();
          
          // Initialize checkpoints
          setCheckpoints([0, 1, 2, 3, 4, 5, 6, 7]);
        }, 1000);
      }
    }, 1000);
  };
  
  // Start the race timer
  const startRaceTimer = () => {
    const timer = setInterval(() => {
      setTime(prevTime => prevTime + 100);
    }, 100);
    
    setRaceTimer(timer);
  };
  
  // Pause the race
  const handlePauseRace = () => {
    setIsPaused(true);
    if (raceTimer) {
      clearInterval(raceTimer);
    }
  };
  
  // Resume the race
  const handleResumeRace = () => {
    setIsPaused(false);
    startRaceTimer();
  };
  
  // Restart the race
  const handleRestartRace = () => {
    // Reset all race state
    setIsGameStarted(false);
    setIsPaused(false);
    setIsCountdown(false);
    setIsRaceComplete(false);
    setSpeed(0);
    setNitroAmount(100);
    setLap(1);
    setPosition(8);
    setTime(0);
    setPlayerPosition([0, 0, 0]);
    setCheckpoints([]);
    setRaceResults(null);
    
    if (raceTimer) {
      clearInterval(raceTimer);
    }
    
    // Start a new race
    setTimeout(() => {
      handleStartRace();
    }, 500);
  };
  
  // Exit the race
  const handleExitRace = () => {
    if (raceTimer) {
      clearInterval(raceTimer);
    }
    onExit();
  };
  
  // Simulate lap changes
  useEffect(() => {
    if (isGameStarted && !isPaused && !isRaceComplete) {
      // Simulate lap changes
      const lapTimer = setTimeout(() => {
        setLap(2);
        
        setTimeout(() => {
          setLap(3);
          
          // Race completion
          setTimeout(() => {
            if (raceTimer) {
              clearInterval(raceTimer);
            }
            
            // Calculate rewards
            const finalPosition = position;
            const finalTime = time;
            const coinsEarned = Math.floor(100 * (9 - finalPosition) / 2);
            const xpEarned = Math.floor(50 * (9 - finalPosition) / 2);
            
            setRaceResults({
              position: finalPosition,
              time: finalTime,
              coinsEarned,
              xpEarned
            });
            
            setIsRaceComplete(true);
            
            // Notify parent component
            onComplete(finalPosition, finalTime);
          }, 20000);
        }, 30000);
      }, 30000);
      
      return () => {
        clearTimeout(lapTimer);
      };
    }
  }, [isGameStarted, isPaused, isRaceComplete, position, time, raceTimer, onComplete]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (raceTimer) {
        clearInterval(raceTimer);
      }
    };
  }, [raceTimer]);
  
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Game 3D scene */}
      <div className="absolute inset-0">
        <GameScene 
          car={car} 
          environment={environment} 
          isRacing={isGameStarted && !isPaused && !isRaceComplete && !isCountdown}
          onSpeedChange={handleSpeedChange}
        />
      </div>
      
      {/* Game UI */}
      <GameUI
        speed={speed}
        nitroAmount={nitroAmount}
        lap={lap}
        totalLaps={totalLaps}
        position={position}
        totalRacers={totalRacers}
        time={time}
        isGameStarted={isGameStarted}
        isPaused={isPaused}
        isCountdown={isCountdown}
        countdownValue={countdownValue}
        isRaceComplete={isRaceComplete}
        raceResults={raceResults}
        onStart={handleStartRace}
        onResume={handleResumeRace}
        onPause={handlePauseRace}
        onRestart={handleRestartRace}
        onExit={handleExitRace}
        environment={environment}
        playerPosition={playerPosition}
        checkpoints={checkpoints}
        controlType={settings.controls.type}
      />
    </div>
  );
};

export default GameScreen;