// Car types
export interface CarStats {
  speed: number;
  acceleration: number;
  handling: number;
  braking: number;
}

export interface CarCustomization {
  color: string;
  wheels: 'standard' | 'sport' | 'racing';
  spoiler: 'none' | 'small' | 'medium' | 'large';
  nitroColor: string;
}

export interface Car {
  id: string;
  name: string;
  description: string;
  stats: CarStats;
  price: number;
  unlocked: boolean;
  customization: CarCustomization;
}

// Garage types
export interface GarageState {
  selectedCar: Car;
  availableCars: Car[];
  unlockedCars: string[];
  playerCoins: number;
}

// Customization options
export interface ColorOption {
  id: string;
  name: string;
  value: string;
  price: number;
}

export interface WheelOption {
  id: string;
  name: string;
  value: 'standard' | 'sport' | 'racing';
  price: number;
}

export interface SpoilerOption {
  id: string;
  name: string;
  value: 'none' | 'small' | 'medium' | 'large';
  price: number;
}

export interface NitroColorOption {
  id: string;
  name: string;
  value: string;
  price: number;
}

// Available customization options
export const carColors: ColorOption[] = [
  { id: 'red', name: 'Racing Red', value: '#ff0000', price: 0 },
  { id: 'blue', name: 'Electric Blue', value: '#0066ff', price: 500 },
  { id: 'green', name: 'Neon Green', value: '#00ff66', price: 500 },
  { id: 'yellow', name: 'Sunburst Yellow', value: '#ffcc00', price: 500 },
  { id: 'purple', name: 'Midnight Purple', value: '#6600cc', price: 1000 },
  { id: 'orange', name: 'Blaze Orange', value: '#ff6600', price: 1000 },
  { id: 'black', name: 'Stealth Black', value: '#111111', price: 1500 },
  { id: 'white', name: 'Arctic White', value: '#ffffff', price: 1500 },
  { id: 'pink', name: 'Hot Pink', value: '#ff00aa', price: 2000 },
  { id: 'gold', name: 'Metallic Gold', value: '#ffaa00', price: 3000 },
];

export const wheelOptions: WheelOption[] = [
  { id: 'standard', name: 'Standard', value: 'standard', price: 0 },
  { id: 'sport', name: 'Sport', value: 'sport', price: 1000 },
  { id: 'racing', name: 'Racing', value: 'racing', price: 2500 },
];

export const spoilerOptions: SpoilerOption[] = [
  { id: 'none', name: 'None', value: 'none', price: 0 },
  { id: 'small', name: 'Small', value: 'small', price: 800 },
  { id: 'medium', name: 'Medium', value: 'medium', price: 1500 },
  { id: 'large', name: 'Large', value: 'large', price: 3000 },
];

export const nitroColorOptions: NitroColorOption[] = [
  { id: 'blue', name: 'Blue Fire', value: '#00ffff', price: 0 },
  { id: 'purple', name: 'Purple Haze', value: '#aa00ff', price: 1000 },
  { id: 'green', name: 'Toxic Green', value: '#00ff00', price: 1000 },
  { id: 'red', name: 'Inferno Red', value: '#ff0000', price: 1000 },
  { id: 'rainbow', name: 'Rainbow Burst', value: 'rainbow', price: 5000 },
];