import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Car, CarCustomization, carColors, wheelOptions, spoilerOptions, nitroColorOptions } from './types';
import { useToast } from '../ui/use-toast';

interface GarageScreenProps {
  selectedCar: Car;
  onSelectCar: (car: Car) => void;
  onBack: () => void;
  playerCoins: number;
  unlockedCars: string[];
  onPurchaseCar: (carId: string, price: number) => boolean;
}

// Sample car data
const availableCars: Car[] = [
  {
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
  },
  {
    id: 'sports-2',
    name: 'Thunderbolt',
    description: 'High acceleration with excellent handling.',
    stats: {
      speed: 6,
      acceleration: 9,
      handling: 8,
      braking: 7
    },
    price: 2000,
    unlocked: false,
    customization: {
      color: '#0066ff',
      wheels: 'standard',
      spoiler: 'small',
      nitroColor: '#00ffff'
    }
  },
  {
    id: 'muscle-1',
    name: 'Dominator',
    description: 'Powerful muscle car with high top speed.',
    stats: {
      speed: 9,
      acceleration: 7,
      handling: 5,
      braking: 6
    },
    price: 3500,
    unlocked: false,
    customization: {
      color: '#111111',
      wheels: 'sport',
      spoiler: 'medium',
      nitroColor: '#ff0000'
    }
  },
  {
    id: 'supercar-1',
    name: 'Phantom X',
    description: 'Elite supercar with exceptional performance in all areas.',
    stats: {
      speed: 10,
      acceleration: 9,
      handling: 8,
      braking: 9
    },
    price: 10000,
    unlocked: false,
    customization: {
      color: '#ffaa00',
      wheels: 'racing',
      spoiler: 'large',
      nitroColor: '#aa00ff'
    }
  }
];

const GarageScreen: React.FC<GarageScreenProps> = ({
  selectedCar,
  onSelectCar,
  onBack,
  playerCoins,
  unlockedCars,
  onPurchaseCar
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('cars');
  const [customizing, setCustomizing] = useState<Car>(selectedCar);
  
  // Update cars with unlocked status
  const cars = availableCars.map(car => ({
    ...car,
    unlocked: car.id === 'sports-1' || unlockedCars.includes(car.id)
  }));
  
  // Handle car selection
  const handleSelectCar = (car: Car) => {
    if (car.unlocked) {
      onSelectCar(car);
      toast({
        title: "Car Selected",
        description: `${car.name} is now your active car.`,
      });
    } else {
      // Try to purchase the car
      const purchased = onPurchaseCar(car.id, car.price);
      if (purchased) {
        onSelectCar({...car, unlocked: true});
        toast({
          title: "Car Purchased!",
          description: `You've successfully purchased the ${car.name}.`,
        });
      } else {
        toast({
          title: "Not Enough Coins",
          description: `You need ${car.price - playerCoins} more coins to purchase this car.`,
          variant: "destructive"
        });
      }
    }
  };
  
  // Handle customization changes
  const handleCustomizationChange = (key: keyof CarCustomization, value: string) => {
    setCustomizing(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [key]: value
      }
    }));
  };
  
  // Apply customization
  const handleApplyCustomization = () => {
    onSelectCar(customizing);
    toast({
      title: "Customization Applied",
      description: "Your car has been updated with the new customization.",
    });
  };
  
  // Render stat bars
  const renderStatBar = (value: number) => {
    return (
      <div className="h-2 w-full bg-gray-800 rounded-full">
        <div 
          className="h-full bg-blue-500 rounded-full" 
          style={{ width: `${value * 10}%` }}
        ></div>
      </div>
    );
  };
  
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-blue-950">
        <div className="absolute inset-0 bg-[url('/garage-background.png')] bg-cover opacity-20"></div>
      </div>
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-6">
        <Button 
          variant="outline" 
          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black"
          onClick={onBack}
        >
          Back to Menu
        </Button>
        
        <div className="text-yellow-400 font-bold">
          {playerCoins} 💰
        </div>
      </div>
      
      {/* Garage content */}
      <div className="absolute inset-0 flex items-center justify-center pt-16 pb-8 px-8">
        <Card className="w-full max-w-4xl h-full bg-black/70 border border-blue-500 backdrop-blur-sm overflow-hidden">
          <Tabs defaultValue="cars" className="h-full flex flex-col">
            <div className="border-b border-gray-800 px-6 pt-4">
              <TabsList className="bg-gray-900">
                <TabsTrigger 
                  value="cars" 
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-black"
                  onClick={() => setActiveTab('cars')}
                >
                  Cars
                </TabsTrigger>
                <TabsTrigger 
                  value="customize" 
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-black"
                  onClick={() => {
                    setActiveTab('customize');
                    setCustomizing(selectedCar);
                  }}
                >
                  Customize
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <TabsContent value="cars" className="h-full mt-0">
                <h2 className="text-2xl font-bold text-white mb-4">Select Your Car</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cars.map(car => (
                    <div 
                      key={car.id}
                      className={`p-4 rounded-lg border ${car.id === selectedCar.id ? 'border-blue-500' : 'border-gray-800'} ${!car.unlocked ? 'opacity-70' : ''}`}
                    >
                      <div className="flex justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">{car.name}</h3>
                        {!car.unlocked && (
                          <div className="text-yellow-400 font-bold">{car.price} 💰</div>
                        )}
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4">{car.description}</p>
                      
                      <div className="h-32 bg-gradient-to-b from-transparent to-blue-950/30 rounded flex items-center justify-center mb-4">
                        <div className="text-center text-gray-500">
                          [Car Preview]
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Speed</span>
                          {renderStatBar(car.stats.speed)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Acceleration</span>
                          {renderStatBar(car.stats.acceleration)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Handling</span>
                          {renderStatBar(car.stats.handling)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Braking</span>
                          {renderStatBar(car.stats.braking)}
                        </div>
                      </div>
                      
                      <Button 
                        className={`w-full ${car.unlocked ? 'bg-blue-500' : 'bg-yellow-400'} text-black hover:bg-pink-500`}
                        onClick={() => handleSelectCar(car)}
                      >
                        {car.unlocked ? (car.id === selectedCar.id ? 'Selected' : 'Select') : 'Purchase'}
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="customize" className="h-full mt-0">
                <h2 className="text-2xl font-bold text-white mb-4">Customize Your Car</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="h-48 bg-gradient-to-b from-transparent to-blue-950/30 rounded flex items-center justify-center mb-4">
                      <div 
                        className="w-32 h-16 rounded-lg" 
                        style={{ backgroundColor: customizing.customization.color }}
                      ></div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2">Car: {customizing.name}</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Paint Color</h3>
                      <div className="grid grid-cols-5 gap-2">
                        {carColors.map(color => (
                          <button
                            key={color.id}
                            className={`w-full aspect-square rounded-full border-2 ${customizing.customization.color === color.value ? 'border-white' : 'border-transparent'}`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => handleCustomizationChange('color', color.value)}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Wheels</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {wheelOptions.map(option => (
                          <button
                            key={option.id}
                            className={`p-2 rounded ${customizing.customization.wheels === option.value ? 'bg-blue-500 text-black' : 'bg-gray-800 text-white'}`}
                            onClick={() => handleCustomizationChange('wheels', option.value)}
                          >
                            {option.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Spoiler</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {spoilerOptions.map(option => (
                          <button
                            key={option.id}
                            className={`p-2 rounded ${customizing.customization.spoiler === option.value ? 'bg-blue-500 text-black' : 'bg-gray-800 text-white'}`}
                            onClick={() => handleCustomizationChange('spoiler', option.value)}
                          >
                            {option.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Nitro Color</h3>
                      <div className="grid grid-cols-5 gap-2">
                        {nitroColorOptions.map(color => (
                          <button
                            key={color.id}
                            className={`w-full aspect-square rounded-full border-2 ${customizing.customization.nitroColor === color.value ? 'border-white' : 'border-transparent'}`}
                            style={{ backgroundColor: color.value === 'rainbow' ? 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' : color.value }}
                            onClick={() => handleCustomizationChange('nitroColor', color.value)}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-green-500 text-black hover:bg-blue-500"
                      onClick={handleApplyCustomization}
                    >
                      Apply Changes
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default GarageScreen;