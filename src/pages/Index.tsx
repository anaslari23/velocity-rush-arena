import React, { useState } from 'react';
import GameManager from '../components/game/GameManager';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { CarData, Environment } from '../components/game/types';
import { defaultCars, defaultEnvironments } from '../components/game/gameData';

const Index = () => {
  // Main states
  const [currentView, setCurrentView] = useState<'menu' | 'game' | 'garage' | 'settings'>('menu');
  const [selectedCar, setSelectedCar] = useState<CarData>(defaultCars[0]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment>(defaultEnvironments[0]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [playerCoins, setPlayerCoins] = useState<number>(1000);
  const [playerXP, setPlayerXP] = useState<number>(0);
  
  // Settings
  const [settings, setSettings] = useState({
    sfxVolume: 80,
    musicVolume: 70,
    showFPS: false,
    highQuality: true,
    vibration: true,
    controlType: 'keyboard' as 'keyboard' | 'touch' | 'tilt'
  });
  
  // Car customization
  const [carCustomization, setCarCustomization] = useState({
    color: '#ff0066',
    wheelType: 'sport',
    spoiler: 'medium',
    nitroColor: '#00ffff'
  });
  
  // Handle settings changes
  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle car customization
  const updateCarCustomization = (key: keyof typeof carCustomization, value: any) => {
    setCarCustomization(prev => ({ ...prev, [key]: value }));
  };
  
  // Start race with current settings
  const startRace = () => {
    setCurrentView('game');
  };
  
  // Return to main menu from any screen
  const returnToMenu = () => {
    setCurrentView('menu');
  };
  
  // Render game if in game view
  if (currentView === 'game') {
    return (
      <GameManager 
        selectedCar={selectedCar}
        carCustomization={carCustomization}
        environment={selectedEnvironment}
        difficulty={difficulty}
        settings={settings}
        onExit={returnToMenu}
        onRaceComplete={(coins, xp) => {
          setPlayerCoins(prev => prev + coins);
          setPlayerXP(prev => prev + xp);
          returnToMenu();
        }}
      />
    );
  }
  
  // Render garage if in garage view
  if (currentView === 'garage') {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-racing-asphalt overflow-hidden">
        {/* Background elements - same as main menu */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-racing-road rounded-full opacity-20"></div>
          
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute h-2 bg-blue-500 opacity-60 animate-pulse"
              style={{
                width: `${100 + Math.random() * 300}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                boxShadow: '0 0 15px #00f3ff',
                animationDelay: `${Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
        
        <Card className="w-full max-w-4xl p-8 bg-black bg-opacity-80 border border-blue-500 text-white relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-blue-500">GARAGE</h2>
            <div className="flex items-center gap-4">
              <div className="text-yellow-400">
                <span className="mr-1">💰</span>
                {playerCoins} coins
              </div>
              <div className="text-green-500">
                <span className="mr-1">⭐</span>
                Level {Math.floor(playerXP / 100) + 1}
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="cars">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="cars">Cars</TabsTrigger>
              <TabsTrigger value="customize">Customize</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cars" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {defaultCars.map((car, index) => (
                  <div 
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCar.id === car.id ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedCar(car)}
                  >
                    <div className="flex justify-between">
                      <h3 className="text-xl font-bold">{car.name}</h3>
                      {car.premium && !car.unlocked && (
                        <span className="text-yellow-400">💰 {car.price}</span>
                      )}
                    </div>
                    
                    <div className="h-32 my-4 flex items-center justify-center">
                      {/* Car image placeholder */}
                      <div 
                        className="w-64 h-24 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg"
                        style={{ backgroundColor: car.defaultColor }}
                      >
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🏎️
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-gray-400">Speed</div>
                        <div className="w-full bg-gray-700 h-2 rounded-full mt-1">
                          <div 
                            className="bg-blue-500 h-full rounded-full" 
                            style={{ width: `${car.stats.speed}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Acceleration</div>
                        <div className="w-full bg-gray-700 h-2 rounded-full mt-1">
                          <div 
                            className="bg-green-500 h-full rounded-full" 
                            style={{ width: `${car.stats.acceleration}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Handling</div>
                        <div className="w-full bg-gray-700 h-2 rounded-full mt-1">
                          <div 
                            className="bg-pink-500 h-full rounded-full" 
                            style={{ width: `${car.stats.handling}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {!car.unlocked && (
                      <Button 
                        className="w-full mt-4 bg-yellow-400 text-black"
                        disabled={playerCoins < car.price}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (playerCoins >= car.price) {
                            setPlayerCoins(prev => prev - car.price);
                            // Update the car to be unlocked
                            const updatedCars = defaultCars.map(c => 
                              c.id === car.id ? { ...c, unlocked: true } : c
                            );
                            // This would need to be properly implemented with state management
                            // For now, just select the car
                            setSelectedCar({ ...car, unlocked: true });
                          }
                        }}
                      >
                        {playerCoins < car.price ? 'Not enough coins' : `Purchase for ${car.price} coins`}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="customize" className="space-y-6">
              <div className="h-48 my-4 flex items-center justify-center">
                {/* Car preview with customizations */}
                <div 
                  className="w-96 h-36 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: carCustomization.color }}
                >
                  <div className="w-full h-full flex items-center justify-center text-6xl relative">
                    🏎️
                    {/* Spoiler visualization */}
                    {carCustomization.spoiler !== 'none' && (
                      <div 
                        className="absolute top-2 w-12 h-2 bg-gray-800 rounded"
                        style={{ 
                          height: carCustomization.spoiler === 'large' ? '8px' : '4px',
                          width: carCustomization.spoiler === 'large' ? '60px' : '40px'
                        }}
                      ></div>
                    )}
                    {/* Nitro visualization */}
                    <div 
                      className="absolute bottom-4 w-4 h-2 rounded"
                      style={{ backgroundColor: carCustomization.nitroColor }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">Car Color</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {['#ff0066', '#00aaff', '#ffaa00', '#00ff66', '#aa00ff', '#ffffff'].map(color => (
                      <div 
                        key={color}
                        className={`w-full h-8 rounded cursor-pointer ${
                          carCustomization.color === color ? 'ring-2 ring-white' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateCarCustomization('color', color)}
                      ></div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-white mb-2 block">Wheel Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'standard', name: 'Standard', price: 0 },
                      { id: 'sport', name: 'Sport', price: 200 },
                      { id: 'racing', name: 'Racing', price: 500 }
                    ].map(wheel => (
                      <div 
                        key={wheel.id}
                        className={`p-2 border rounded text-center cursor-pointer ${
                          carCustomization.wheelType === wheel.id 
                            ? 'border-blue-500 bg-blue-900/20' 
                            : 'border-gray-700'
                        }`}
                        onClick={() => updateCarCustomization('wheelType', wheel.id)}
                      >
                        <div>{wheel.name}</div>
                        {wheel.price > 0 && <div className="text-xs text-yellow-400">{wheel.price} coins</div>}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-white mb-2 block">Spoiler</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'none', name: 'None', price: 0 },
                      { id: 'medium', name: 'Medium', price: 300 },
                      { id: 'large', name: 'Large', price: 700 }
                    ].map(spoiler => (
                      <div 
                        key={spoiler.id}
                        className={`p-2 border rounded text-center cursor-pointer ${
                          carCustomization.spoiler === spoiler.id 
                            ? 'border-blue-500 bg-blue-900/20' 
                            : 'border-gray-700'
                        }`}
                        onClick={() => updateCarCustomization('spoiler', spoiler.id)}
                      >
                        <div>{spoiler.name}</div>
                        {spoiler.price > 0 && <div className="text-xs text-yellow-400">{spoiler.price} coins</div>}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-white mb-2 block">Nitro Color</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff0000', '#0000ff'].map(color => (
                      <div 
                        key={color}
                        className={`w-full h-8 rounded cursor-pointer ${
                          carCustomization.nitroColor === color ? 'ring-2 ring-white' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateCarCustomization('nitroColor', color)}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-blue-500 text-black hover:bg-green-500"
                onClick={() => {
                  // Apply customization to selected car
                  setSelectedCar(prev => ({
                    ...prev,
                    customization: {
                      ...prev.customization,
                      ...carCustomization
                    }
                  }));
                }}
              >
                Apply Customization
              </Button>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-between">
            <Button 
              className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-black"
              variant="outline"
              onClick={returnToMenu}
            >
              Back to Menu
            </Button>
            
            <Button 
              className="bg-blue-500 hover:bg-green-500 text-black transition-all duration-300"
              onClick={startRace}
            >
              Start Race
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  // Render settings if in settings view
  if (currentView === 'settings') {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-racing-asphalt overflow-hidden">
        {/* Background elements - same as main menu */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-racing-road rounded-full opacity-20"></div>
          
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute h-2 bg-blue-500 opacity-60 animate-pulse"
              style={{
                width: `${100 + Math.random() * 300}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                boxShadow: '0 0 15px #00f3ff',
                animationDelay: `${Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
        
        <Card className="w-full max-w-md p-8 bg-black bg-opacity-80 border border-blue-500 text-white relative z-10">
          <h2 className="text-3xl font-bold text-blue-500 mb-6">SETTINGS</h2>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="sfx-volume" className="text-white mb-2 block">SFX Volume: {settings.sfxVolume}%</Label>
              <Slider
                id="sfx-volume"
                min={0}
                max={100}
                step={1}
                value={[settings.sfxVolume]}
                onValueChange={(value) => updateSetting('sfxVolume', value[0])}
              />
            </div>
            
            <div>
              <Label htmlFor="music-volume" className="text-white mb-2 block">Music Volume: {settings.musicVolume}%</Label>
              <Slider
                id="music-volume"
                min={0}
                max={100}
                step={1}
                value={[settings.musicVolume]}
                onValueChange={(value) => updateSetting('musicVolume', value[0])}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-fps" className="text-white">Show FPS</Label>
              <Switch
                id="show-fps"
                checked={settings.showFPS}
                onCheckedChange={(checked) => updateSetting('showFPS', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="high-quality" className="text-white">High Quality Graphics</Label>
              <Switch
                id="high-quality"
                checked={settings.highQuality}
                onCheckedChange={(checked) => updateSetting('highQuality', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="vibration" className="text-white">Vibration</Label>
              <Switch
                id="vibration"
                checked={settings.vibration}
                onCheckedChange={(checked) => updateSetting('vibration', checked)}
              />
            </div>
            
            <div>
              <Label className="text-white mb-2 block">Control Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'keyboard', name: 'Keyboard' },
                  { id: 'touch', name: 'Touch' },
                  { id: 'tilt', name: 'Tilt' }
                ].map(control => (
                  <div 
                    key={control.id}
                    className={`p-2 border rounded text-center cursor-pointer ${
                      settings.controlType === control.id 
                        ? 'border-blue-500 bg-blue-900/20' 
                        : 'border-gray-700'
                    }`}
                    onClick={() => updateSetting('controlType', control.id)}
                  >
                    {control.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-between">
            <Button 
              className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-black"
              variant="outline"
              onClick={returnToMenu}
            >
              Back to Menu
            </Button>
            
            <Button 
              className="bg-green-500 text-black hover:bg-blue-500"
              onClick={() => {
                // Save settings logic would go here
                returnToMenu();
              }}
            >
              Save Settings
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  // Default: render main menu
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-racing-asphalt overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-racing-road rounded-full opacity-20"></div>
        
        {/* Neon lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute h-2 bg-blue-500 opacity-60 animate-pulse"
            style={{
              width: `${100 + Math.random() * 300}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              boxShadow: '0 0 15px #00f3ff',
              animationDelay: `${Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
      
      {/* Game logo */}
      <div className="absolute top-20 left-0 right-0 flex flex-col items-center">
        <h1 className="text-7xl font-bold text-blue-500 tracking-wider">VELOCITY RUSH</h1>
        <h2 className="text-3xl font-bold text-white mt-2">ARENA</h2>
      </div>
      
      {/* Main menu */}
      <Card className="w-96 bg-black bg-opacity-70 border border-blue-500 p-8 backdrop-blur-sm relative z-10">
        <div className="space-y-6">
          <Button 
            className="w-full py-6 text-xl bg-blue-500 text-black hover:bg-pink-500 transition-colors duration-300"
            onClick={startRace}
          >
            START RACE
          </Button>
          
          <Button 
            className="w-full bg-green-500 text-black hover:bg-blue-500 transition-colors duration-300"
            onClick={() => setCurrentView('garage')}
          >
            GARAGE
          </Button>
          
          <Button 
            className="w-full bg-pink-500 text-black hover:bg-blue-500 transition-colors duration-300"
            onClick={() => setCurrentView('settings')}
          >
            SETTINGS
          </Button>
        </div>
        
        <div className="mt-8 flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-400">SELECTED CAR</div>
            <div className="text-white">{selectedCar.name}</div>
          </div>
          <div className="text-right">
            <div className="text-yellow-400 font-bold">{playerCoins} 💰</div>
            <div className="text-xs text-gray-400">COINS</div>
          </div>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-500">
          Version 0.1.0 | © 2025 Velocity Rush
        </div>
      </Card>
    </div>
  );
};

export default Index;