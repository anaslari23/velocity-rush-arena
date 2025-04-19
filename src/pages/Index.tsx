
import React, { useState } from 'react';
import GameManager from '@/components/game/GameManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Index = () => {
  const [showGame, setShowGame] = useState(false);
  
  if (showGame) {
    return <GameManager />;
  }
  
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-racing-asphalt overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Track-like pattern */}
        <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-racing-road rounded-full opacity-20"></div>
        
        {/* Glowing lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute h-2 bg-neon-blue opacity-60 animate-pulse-neon"
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
      
      <Card className="w-full max-w-md p-8 bg-black bg-opacity-80 border border-neon-blue text-white relative z-10">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-2 text-neon-blue neon-text tracking-wider">
            VELOCITY
          </h1>
          <h1 className="text-5xl font-bold mb-6 text-neon-pink neon-text tracking-wider">
            RUSH
          </h1>
          
          <p className="mb-8 text-gray-300">
            Experience high-speed thrills in this futuristic racing game. 
            Challenge AI opponents on dynamic tracks with realistic physics.
          </p>
          
          <div className="space-y-4">
            <Button 
              className="w-full py-6 text-xl bg-neon-blue hover:bg-neon-green text-black transition-all duration-300 neon-border" 
              onClick={() => setShowGame(true)}
            >
              START GAME
            </Button>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button variant="outline" className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black">
                Controls
              </Button>
              <Button variant="outline" className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black">
                Options
              </Button>
            </div>
          </div>
          
          <div className="mt-8 text-xs text-gray-500">
            <p>Use WASD or Arrow Keys to drive</p>
            <p>SPACE for nitro boost</p>
            <p>SHIFT to drift</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Index;
