
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { useToast } from '../ui/use-toast';
import { Environment } from './types';

// Mini-map component
interface MiniMapProps {
  position: [number, number, number];
  checkpoints: number[];
  environment: Environment;
}

const MiniMap: React.FC<MiniMapProps> = ({ position, checkpoints, environment }) => {
  // Get track color based on environment
  const getTrackColor = () => {
    switch (environment.type) {
      case 'urban': return "rgba(32, 32, 64, 0.5)";
      case 'highway': return "rgba(48, 48, 80, 0.5)";
      case 'desert': return "rgba(170, 119, 68, 0.5)";
      case 'snow': return "rgba(170, 170, 204, 0.5)";
      case 'beach': return "rgba(204, 187, 136, 0.5)";
      default: return "rgba(32, 32, 64, 0.5)";
    }
  };

  // Get background color based on environment
  const getBackgroundColor = () => {
    switch (environment.type) {
      case 'urban': return "rgba(10, 10, 30, 0.3)";
      case 'highway': return "rgba(26, 26, 46, 0.3)";
      case 'desert': return "rgba(170, 136, 85, 0.3)";
      case 'snow': return "rgba(224, 224, 232, 0.3)";
      case 'beach': return "rgba(221, 204, 153, 0.3)";
      default: return "rgba(10, 10, 30, 0.3)";
    }
  };

  return (
    <div className="relative w-full h-full" style={{ backgroundColor: getBackgroundColor() }}>
      {/* Track outline */}
      <div 
        className="absolute inset-4 border-2 rounded-lg" 
        style={{ borderColor: getTrackColor() }}
      />
      
      {/* Checkpoints */}
      {checkpoints.map((checkpoint, index) => (
        <div 
          key={index}
          className="absolute w-3 h-3 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${((index * 30 + 50) / 300) * 100}%`,
            top: `${((index * 30 + 50) / 300) * 100}%`,
            opacity: 0.7
          }}
        />
      ))}
      
      {/* Player position */}
      <div 
        className="absolute w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"
        style={{
          left: `${((position[0] + 150) / 300) * 100}%`,
          top: `${((position[2] + 150) / 300) * 100}%`,
          boxShadow: '0 0 5px #00f3ff'
        }}
      />
      
      {/* Direction indicator */}
      <div className="absolute top-2 right-2 text-xs text-white">N</div>
      <div className="absolute bottom-2 right-2 text-xs text-white">S</div>
      <div className="absolute top-1/2 right-2 text-xs text-white transform -translate-y-1/2">E</div>
      <div className="absolute top-1/2 left-2 text-xs text-white transform -translate-y-1/2">W</div>
    </div>
  );
};

// Control hint component
interface ControlHintProps {
  icon: string;
  text: string;
  desc: string;
}

const ControlHint: React.FC<ControlHintProps> = ({ icon, text, desc }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-lg">{icon}</span>
      <span className="text-xs opacity-80">{text}</span>
      <span className="text-xs opacity-60">{desc}</span>
    </div>
  );
};

// Touch controls component
interface TouchControlsProps {
  controlType: 'keyboard' | 'touch' | 'tilt';
}

const TouchControls: React.FC<TouchControlsProps> = ({ controlType }) => {
  if (controlType === 'keyboard') return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {controlType === 'touch' && (
        <div className="absolute bottom-4 left-4 text-xs text-white opacity-50">
          Touch controls enabled
        </div>
      )}
      
      {controlType === 'tilt' && (
        <div className="absolute bottom-4 left-4 text-xs text-white opacity-50">
          Tilt controls enabled
        </div>
      )}
    </div>
  );
};

// Countdown component
interface CountdownProps {
  value: number;
}

const Countdown: React.FC<CountdownProps> = ({ value }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-9xl font-bold text-white animate-pulse">
        {value === 0 ? 'GO!' : value}
      </div>
    </div>
  );
};

// Race results component
interface RaceResultsProps {
  position: number;
  totalRacers: number;
  time: number;
  coinsEarned: number;
  xpEarned: number;
  onRestart: () => void;
  onExit: () => void;
}

const RaceResults: React.FC<RaceResultsProps> = ({ 
  position, 
  totalRacers, 
  time, 
  coinsEarned, 
  xpEarned,
  onRestart,
  onExit
}) => {
  // Format time
  const formatTime = (timeMs: number) => {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const milliseconds = Math.floor((timeMs % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
      <Card className="w-full max-w-md p-8 bg-black border border-blue-500 text-white">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-2 text-blue-500">
            {position === 1 ? 'VICTORY!' : 'RACE COMPLETE'}
          </h2>
          
          <div className="my-6 p-4 bg-black/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-xl">
              <div className="text-left text-gray-400">Position:</div>
              <div className="text-right font-bold">{position}/{totalRacers}</div>
              
              <div className="text-left text-gray-400">Time:</div>
              <div className="text-right font-bold">{formatTime(time)}</div>
              
              <div className="text-left text-gray-400">Coins Earned:</div>
              <div className="text-right font-bold text-yellow-400">+{coinsEarned} 💰</div>
              
              <div className="text-left text-gray-400">XP Earned:</div>
              <div className="text-right font-bold text-green-500">+{xpEarned} ⭐</div>
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            <Button 
              className="w-full bg-blue-500 text-black hover:bg-green-500 transition-colors duration-300" 
              onClick={onRestart}
            >
              RACE AGAIN
            </Button>
            
            <Button 
              className="w-full bg-pink-500 text-black hover:bg-blue-500 transition-colors duration-300" 
              onClick={onExit}
            >
              BACK TO MENU
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Weather effect component
interface WeatherEffectProps {
  type: string;
}

const WeatherEffect: React.FC<WeatherEffectProps> = ({ type }) => {
  if (type === 'clear') return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {type === 'rain' && (
        <div className="rain-container">
          {Array.from({ length: 100 }).map((_, i) => (
            <div 
              key={i}
              className="raindrop"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
      
      {type === 'snow' && (
        <div className="snow-container">
          {Array.from({ length: 50 }).map((_, i) => (
            <div 
              key={i}
              className="snowflake"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${3 + Math.random() * 5}s`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      )}
      
      {type === 'fog' && (
        <div className="fog-overlay" />
      )}
      
      {type === 'night' && (
        <div className="night-overlay" />
      )}
    </div>
  );
};

// Main GameUI component
interface GameUIProps {
  speed: number;
  nitroAmount: number;
  lap: number;
  totalLaps: number;
  position: number;
  totalRacers: number;
  time: number;
  isGameStarted: boolean;
  isPaused: boolean;
  isCountdown?: boolean;
  countdownValue?: number;
  isRaceComplete?: boolean;
  raceResults?: {
    position: number;
    time: number;
    coinsEarned: number;
    xpEarned: number;
  } | null;
  onStart: () => void;
  onResume: () => void;
  onPause: () => void;
  onRestart: () => void;
  onExit: () => void;
  environment: Environment;
  playerPosition: [number, number, number];
  checkpoints: number[];
  controlType: 'keyboard' | 'touch' | 'tilt';
}

const GameUI: React.FC<GameUIProps> = ({
  speed,
  nitroAmount,
  lap,
  totalLaps,
  position,
  totalRacers,
  time,
  isGameStarted,
  isPaused,
  isCountdown = false,
  countdownValue = 3,
  isRaceComplete = false,
  raceResults = null,
  onStart,
  onResume,
  onPause,
  onRestart,
  onExit,
  environment,
  playerPosition,
  checkpoints,
  controlType
}) => {
  const { toast } = useToast();
  const [timeFormatted, setTimeFormatted] = useState('00:00:000');
  const [showSpeedLines, setShowSpeedLines] = useState(false);
  
  // Format the time
  useEffect(() => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    
    setTimeFormatted(
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`
    );
  }, [time]);
  
  // Show speed lines when going fast
  useEffect(() => {
    setShowSpeedLines(speed > 25);
  }, [speed]);
  
  // Display a notification when lap changes
  useEffect(() => {
    if (lap > 1 && lap <= totalLaps) {
      toast({
        title: `Lap ${lap} started!`,
        description: `${totalLaps - lap + 1} laps remaining`,
      });
    }
  }, [lap, totalLaps, toast]);

  // Start screen
  if (!isGameStarted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
        <Card className="w-96 p-8 bg-black border border-blue-500 text-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-6 text-blue-500">VELOCITY RUSH</h1>
            <p className="mb-4 text-gray-300">Get ready for the ultimate racing experience!</p>
            
            <div className="mb-6 p-4 bg-black/50 rounded-lg">
              <h3 className="text-xl font-bold text-green-500 mb-2">{environment.name}</h3>
              <p className="text-sm text-gray-400 mb-2">{environment.description}</p>
              <div className="flex justify-between text-xs text-gray-300">
                <span>Weather: {environment.weather}</span>
                <span>Difficulty: {'★'.repeat(environment.difficulty)}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button 
                className="w-full py-6 text-xl bg-blue-500 text-black hover:bg-pink-500 transition-colors duration-300" 
                onClick={onStart}
              >
                START RACE
              </Button>
              
              <Button 
                className="w-full bg-neon-pink text-black hover:bg-neon-blue transition-colors duration-300" 
                onClick={onExit}
              >
                BACK TO MENU
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Pause screen
  if (isPaused && !isRaceComplete) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
        <Card className="w-96 p-8 bg-black border border-neon-blue text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6 text-neon-blue neon-text">PAUSED</h2>
            
            <div className="mb-4 p-4 bg-black/50 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-left text-gray-400">Position:</div>
                <div className="text-right">{position}/{totalRacers}</div>
                
                <div className="text-left text-gray-400">Lap:</div>
                <div className="text-right">{lap}/{totalLaps}</div>
                
                <div className="text-left text-gray-400">Time:</div>
                <div className="text-right">{timeFormatted}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button 
                className="w-full bg-neon-blue text-black hover:bg-neon-green transition-colors duration-300" 
                onClick={onResume}
              >
                RESUME
              </Button>
              <Button 
                className="w-full bg-neon-green text-black hover:bg-neon-blue transition-colors duration-300" 
                onClick={onRestart}
              >
                RESTART
              </Button>
              <Button 
                className="w-full bg-neon-pink text-black hover:bg-neon-blue transition-colors duration-300" 
                onClick={onExit}
              >
                EXIT
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Race results screen
  if (isRaceComplete && raceResults) {
    return (
      <RaceResults 
        position={raceResults.position}
        totalRacers={totalRacers}
        time={raceResults.time}
        coinsEarned={raceResults.coinsEarned}
        xpEarned={raceResults.xpEarned}
        onRestart={onRestart}
        onExit={onExit}
      />
    );
  }

  // Countdown screen
  if (isCountdown) {
    return <Countdown value={countdownValue} />;
  }

  // Main game UI
  return (
    <div className="game-ui">
      {/* Weather effects */}
      <WeatherEffect type={environment.weather} />
      
      {/* Enhanced HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        {/* Speed display with digital speedometer */}
        <div className="bg-black/70 p-4 rounded-lg backdrop-blur-sm">
          <div className="text-4xl font-bold text-blue-500">
            {Math.floor(speed * 3.6)}
            <span className="text-sm ml-1">KM/H</span>
          </div>
        </div>

        {/* Race position and lap counter */}
        <div className="bg-black/70 p-4 rounded-lg backdrop-blur-sm">
          <div className="text-2xl font-bold text-white">
            Position: {position}/{totalRacers}
          </div>
          <div className="text-xl text-neon-yellow">
            Lap {lap}/{totalLaps}
          </div>
        </div>

        {/* Race timer */}
        <div className="bg-black/70 p-4 rounded-lg backdrop-blur-sm">
          <div className="text-2xl font-bold text-neon-green">
            {timeFormatted}
          </div>
        </div>
      </div>

      {/* Enhanced nitro bar */}
      <div className="absolute bottom-8 left-8 w-64">
        <div className="relative h-4 bg-black/50 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-gradient-to-r from-blue-500 to-pink-500 transition-all duration-200"
            style={{ width: `${nitroAmount}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
            NITRO
          </div>
        </div>
      </div>

      {/* Mini-map */}
      <div className="absolute bottom-8 right-8 w-48 h-48 bg-black/70 rounded-lg overflow-hidden">
        <MiniMap 
          position={playerPosition} 
          checkpoints={checkpoints}
          environment={environment}
        />
      </div>

      {/* Enhanced controls help */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 p-4 rounded-lg backdrop-blur-sm">
        <div className="grid grid-cols-4 gap-4 text-sm text-white">
          {controlType === 'keyboard' ? (
            <>
              <ControlHint icon="⌨️" text="WASD / Arrows" desc="Drive" />
              <ControlHint icon="⇧" text="Shift" desc="Drift" />
              <ControlHint icon="␣" text="Space" desc="Nitro" />
              <ControlHint icon="R" text="R" desc="Reset" />
            </>
          ) : controlType === 'touch' ? (
            <>
              <ControlHint icon="👆" text="Left Joystick" desc="Steering" />
              <ControlHint icon="👆" text="Accelerate Button" desc="Drive" />
              <ControlHint icon="D" text="Drift Button" desc="Drift" />
              <ControlHint icon="N" text="Nitro Button" desc="Boost" />
            </>
          ) : (
            <>
              <ControlHint icon="📱" text="Tilt Phone" desc="Steering" />
              <ControlHint icon="👆" text="Accelerate Button" desc="Drive" />
              <ControlHint icon="D" text="Drift Button" desc="Drift" />
              <ControlHint icon="N" text="Nitro Button" desc="Boost" />
            </>
          )}
        </div>
      </div>

      {/* Touch controls overlay */}
      <TouchControls controlType={controlType} />

      {/* Pause button */}
      <button 
        className="absolute top-4 right-4 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center text-white"
        onClick={onPause}
      >
        ⏸️
      </button>

      {/* Speed lines effect */}
      {showSpeedLines && (
        <div className="speedlines-container">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="speedline"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GameUI;
