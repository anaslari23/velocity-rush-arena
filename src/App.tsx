import { useState } from 'react';
import MainMenu from './components/menu/MainMenu';
import GameScreen from './components/game/GameScreen';
import GarageScreen from './components/garage/GarageScreen';
import SettingsScreen from './components/settings/SettingsScreen';
import { Car } from './components/garage/types';
import { Environment } from './components/game/types';
import { GameSettings } from './components/settings/types';

// Default car
const defaultCar: Car = {
  id: 'sports-1',
  name: 'Velocity GT',
  description: 'A balanced sports car with good handling and speed.',
  stats: {
    speed: 7,
    acceleration: 6,
    handling: 8,
    braking: 7
  },
  price: 0,
  unlocked: true,
  customization: {
    color: '#ff0000',
    wheels: 'standard',
    spoiler: 'none',
    nitroColor: '#00ffff'
  }
};

// Default environment
const defaultEnvironment: Environment = {
  id: 'urban-1',
  name: 'Downtown Circuit',
  description: 'Race through the neon-lit streets of the city center.',
  type: 'urban',
  weather: 'clear',
  difficulty: 1,
  unlocked: true,
  trackLength: 3000
};

// Default settings
const defaultSettings: GameSettings = {
  audio: {
    master: 80,
    music: 70,
    sfx: 90
  },
  graphics: {
    quality: 'high',
    shadows: true,
    particles: true,
    postProcessing: true
  },
  controls: {
    type: 'keyboard',
    sensitivity: 5,
    invertY: false,
    vibration: true
  }
};

// Game screens
type Screen = 'menu' | 'game' | 'garage' | 'settings';

const App = () => {
  // Current screen
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  
  // Game state
  const [selectedCar, setSelectedCar] = useState<Car>(defaultCar);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment>(defaultEnvironment);
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [unlockedCars, setUnlockedCars] = useState<string[]>(['sports-1']);
  const [playerCoins, setPlayerCoins] = useState<number>(1000);
  const [playerXp, setPlayerXp] = useState<number>(0);
  const [playerLevel, setPlayerLevel] = useState<number>(1);
  
  // Navigation handlers
  const handleStartGame = () => {
    setCurrentScreen('game');
  };
  
  const handleOpenGarage = () => {
    setCurrentScreen('garage');
  };
  
  const handleOpenSettings = () => {
    setCurrentScreen('settings');
  };
  
  const handleBackToMenu = () => {
    setCurrentScreen('menu');
  };
  
  // Game completion handler
  const handleGameComplete = (position: number, time: number) => {
    // Calculate rewards based on position and time
    const baseCoins = 100;
    const baseXp = 50;
    
    const positionMultiplier = position === 1 ? 3 : position === 2 ? 2 : position === 3 ? 1.5 : 1;
    const earnedCoins = Math.floor(baseCoins * positionMultiplier);
    const earnedXp = Math.floor(baseXp * positionMultiplier);
    
    // Update player stats
    setPlayerCoins(prev => prev + earnedCoins);
    setPlayerXp(prev => {
      const newXp = prev + earnedXp;
      // Level up if XP threshold reached (100 XP per level)
      if (Math.floor(newXp / 100) > Math.floor(prev / 100)) {
        setPlayerLevel(Math.floor(newXp / 100) + 1);
      }
      return newXp;
    });
    
    // Return to menu
    setCurrentScreen('menu');
  };
  
  // Car purchase handler
  const handlePurchaseCar = (carId: string, price: number) => {
    if (playerCoins >= price) {
      setPlayerCoins(prev => prev - price);
      setUnlockedCars(prev => [...prev, carId]);
      return true;
    }
    return false;
  };
  
  // Render current screen
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      {currentScreen === 'menu' && (
        <MainMenu 
          onStartGame={handleStartGame}
          onOpenGarage={handleOpenGarage}
          onOpenSettings={handleOpenSettings}
          playerCoins={playerCoins}
          playerLevel={playerLevel}
          playerXp={playerXp}
          selectedCar={selectedCar}
          selectedEnvironment={selectedEnvironment}
        />
      )}
      
      {currentScreen === 'game' && (
        <GameScreen 
          car={selectedCar}
          environment={selectedEnvironment}
          settings={settings}
          onExit={handleBackToMenu}
          onComplete={handleGameComplete}
        />
      )}
      
      {currentScreen === 'garage' && (
        <GarageScreen 
          selectedCar={selectedCar}
          onSelectCar={setSelectedCar}
          onBack={handleBackToMenu}
          playerCoins={playerCoins}
          unlockedCars={unlockedCars}
          onPurchaseCar={handlePurchaseCar}
        />
      )}
      
      {currentScreen === 'settings' && (
        <SettingsScreen 
          settings={settings}
          onUpdateSettings={setSettings}
          onBack={handleBackToMenu}
        />
      )}
    </div>
  );
};

export default App;
