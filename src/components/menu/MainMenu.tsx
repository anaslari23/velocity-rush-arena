import React from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Car } from '../garage/types';
import { Environment } from '../game/types';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenGarage: () => void;
  onOpenSettings: () => void;
  playerCoins: number;
  playerLevel: number;
  playerXp: number;
  selectedCar: Car;
  selectedEnvironment: Environment;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenGarage,
  onOpenSettings,
  playerCoins,
  playerLevel,
  playerXp,
  selectedCar,
  selectedEnvironment
}) => {
  // Calculate XP progress to next level (100 XP per level)
  const xpProgress = (playerXp % 100) / 100;
  
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-blue-950">
        <div className="absolute inset-0 bg-[url('/background-grid.png')] bg-repeat opacity-30"></div>
      </div>
      
      {/* Logo and title */}
      <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-16">
        <h1 className="text-6xl font-bold text-blue-500 mb-2">VELOCITY RUSH</h1>
        <h2 className="text-2xl font-bold text-white">ARENA</h2>
      </div>
      
      {/* Main menu container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="w-96 bg-black/70 border border-blue-500 p-8 backdrop-blur-sm">
          {/* Player stats */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-black font-bold">
                {playerLevel}
              </div>
              <div className="ml-2">
                <div className="text-xs text-gray-400">LEVEL</div>
                <div className="h-2 w-20 bg-gray-800 rounded-full mt-1">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${xpProgress * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 font-bold">{playerCoins} 💰</div>
              <div className="text-xs text-gray-400">COINS</div>
            </div>
          </div>
          
          {/* Selected car and track preview */}
          <div className="mb-6 p-4 bg-black/50 rounded-lg">
            <div className="flex justify-between mb-2">
              <div>
                <div className="text-xs text-gray-400">SELECTED CAR</div>
                <div className="text-white font-bold">{selectedCar.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">TRACK</div>
                <div className="text-white font-bold">{selectedEnvironment.name}</div>
              </div>
            </div>
            <div className="h-32 bg-gradient-to-b from-transparent to-blue-950/30 rounded flex items-center justify-center">
              <div className="text-center text-gray-500">
                [Car Preview]
              </div>
            </div>
          </div>
          
          {/* Menu buttons */}
          <div className="space-y-4">
            <Button 
              className="w-full py-6 text-xl bg-blue-500 text-black hover:bg-pink-500 transition-colors duration-300" 
              onClick={onStartGame}
            >
              START RACE
            </Button>
            
            <Button 
              className="w-full bg-green-500 text-black hover:bg-blue-500 transition-colors duration-300" 
              onClick={onOpenGarage}
            >
              GARAGE
            </Button>
            
            <Button 
              className="w-full bg-pink-500 text-black hover:bg-blue-500 transition-colors duration-300" 
              onClick={onOpenSettings}
            >
              SETTINGS
            </Button>
            
            <Button 
              className="w-full bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-300"
              onClick={() => window.close()}
            >
              EXIT
            </Button>
          </div>
          
          {/* Game version */}
          <div className="mt-6 text-center text-xs text-gray-500">
            Version 0.1.0 | © 2025 Velocity Rush
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MainMenu;