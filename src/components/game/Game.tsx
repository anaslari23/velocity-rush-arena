import React, { useState, useEffect } from 'react';
import { Car } from '../garage/types';
import { Environment } from './types';
import GameScene from './GameScene';
import { Button } from '@radix-ui/themes';
import { styled } from '@stitches/react';

interface GameProps {
  car: Car;
  environment: Environment;
}

const GameOverlay = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  color: 'white',
  fontFamily: 'system-ui',
});

const RaceInfo = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 20px',
  background: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '10px',
  marginBottom: '10px',
});

const StartButton = styled(Button, {
  pointerEvents: 'auto',
  alignSelf: 'center',
  marginTop: 'auto',
  marginBottom: '40px',
});

const Game: React.FC<GameProps> = ({ car, environment }) => {
  const [isRacing, setIsRacing] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [currentLap, setCurrentLap] = useState(0);
  const [checkpointsHit, setCheckpointsHit] = useState(0);
  const [raceStartTime, setRaceStartTime] = useState(0);
  const [bestLapTime, setBestLapTime] = useState<number | null>(null);
  const [lastLapTime, setLastLapTime] = useState<number | null>(null);

  const handleStartRace = () => {
    setIsRacing(true);
    setCurrentLap(1);
    setCheckpointsHit(0);
    setRaceStartTime(Date.now());
  };

  const handleLapComplete = () => {
    const lapTime = (Date.now() - raceStartTime) / 1000;
    setLastLapTime(lapTime);
    if (!bestLapTime || lapTime < bestLapTime) {
      setBestLapTime(lapTime);
    }
    setCurrentLap(prev => prev + 1);
    setRaceStartTime(Date.now());
  };

  const handleCheckpoint = (index: number) => {
    setCheckpointsHit(prev => prev + 1);
  };

  return (
    <>
      <GameScene
        car={car}
        environment={environment}
        isRacing={isRacing}
        onSpeedChange={setSpeed}
        onLapComplete={handleLapComplete}
        onCheckpoint={handleCheckpoint}
      />
      <GameOverlay>
        {isRacing ? (
          <RaceInfo>
            <div>Speed: {Math.round(speed)} km/h</div>
            <div>Lap: {currentLap}</div>
            <div>Checkpoints: {checkpointsHit}</div>
            {bestLapTime && <div>Best Lap: {bestLapTime.toFixed(2)}s</div>}
            {lastLapTime && <div>Last Lap: {lastLapTime.toFixed(2)}s</div>}
          </RaceInfo>
        ) : (
          <StartButton onClick={handleStartRace}>
            Start Race
          </StartButton>
        )}
      </GameOverlay>
    </>
  );
};

export default Game; 