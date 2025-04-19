
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

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
  onStart: () => void;
  onResume: () => void;
  onPause: () => void;
  onRestart: () => void;
  onExit: () => void;
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
  onStart,
  onResume,
  onPause,
  onRestart,
  onExit
}) => {
  const { toast } = useToast();
  const [timeFormatted, setTimeFormatted] = useState('00:00:000');
  const [showSpeedLines, setShowSpeedLines] = useState(false);
  
  // Format the time
  useEffect(() => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = time % 1000;
    
    setTimeFormatted(
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`
    );
  }, [time]);
  
  // Show speed lines when going fast
  useEffect(() => {
    setShowSpeedLines(speed > 25);
  }, [speed]);
  
  // Display a notification when lap changes
  useEffect(() => {
    if (lap > 1) {
      toast({
        title: `Lap ${lap} started!`,
        description: `${totalLaps - lap + 1} laps remaining`,
      });
    }
  }, [lap, totalLaps, toast]);

  if (!isGameStarted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
        <Card className="w-96 p-8 bg-black border border-neon-blue text-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-6 text-neon-blue neon-text">VELOCITY RUSH</h1>
            <p className="mb-8 text-gray-300">Get ready for the ultimate racing experience!</p>
            <div className="space-y-4">
              <Button 
                className="w-full bg-neon-blue text-black hover:bg-neon-pink transition-colors duration-300 neon-border" 
                onClick={onStart}
              >
                START RACE
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
        <Card className="w-96 p-8 bg-black border border-neon-blue text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6 text-neon-blue neon-text">PAUSED</h2>
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

  return (
    <div className="game-ui">
      {/* Speed lines effect */}
      <div className={`speedlines ${showSpeedLines ? 'active' : ''}`}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white h-20 w-1 opacity-50 animate-speedlines"
            style={{ 
              left: `${Math.random() * 100}%`, 
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${0.2 + Math.random() * 0.3}s`
            }}
          />
        ))}
      </div>
      
      {/* HUD Elements */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="bg-black bg-opacity-50 p-2 rounded-lg">
          <div className="text-neon-blue text-lg neon-text">{timeFormatted}</div>
        </div>
        
        <div className="bg-black bg-opacity-50 p-2 rounded-lg">
          <div className="text-neon-yellow font-bold neon-text">LAP {lap}/{totalLaps}</div>
        </div>
        
        <div className="bg-black bg-opacity-50 p-2 rounded-lg">
          <div className="text-neon-green neon-text">Position: {position}/{totalRacers}</div>
        </div>
      </div>
      
      {/* Speedometer */}
      <div className="absolute bottom-8 right-8 w-40 h-40 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-full border-2 border-neon-blue neon-border">
        <div className="text-5xl font-bold text-white">{Math.floor(speed * 3.6)}</div>
        <div className="text-sm text-gray-300">KM/H</div>
      </div>
      
      {/* Nitro bar */}
      <div className="absolute bottom-8 left-8 w-48">
        <div className="mb-1 text-xs text-neon-blue neon-text">NITRO</div>
        <Progress value={nitroAmount} className="h-3 bg-gray-800">
          <div className="h-full bg-neon-blue" style={{ width: `${nitroAmount}%` }} />
        </Progress>
      </div>
      
      {/* Pause button */}
      <div className="absolute top-4 right-4">
        <Button size="sm" variant="outline" onClick={onPause} className="bg-black bg-opacity-50 border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black">
          Pause
        </Button>
      </div>
      
      {/* Controls help */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 p-2 rounded text-xs text-gray-300 flex space-x-4">
        <div>WASD or Arrows: Drive</div>
        <div>SHIFT: Drift</div>
        <div>SPACE: Nitro</div>
        <div>R: Reset</div>
      </div>
    </div>
  );
};

export default GameUI;
