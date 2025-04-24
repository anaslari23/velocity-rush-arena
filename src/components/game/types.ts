// Game types for Velocity Rush Arena

export interface RaceState {
  speed: number;
  nitroAmount: number;
  lap: number;
  totalLaps: number;
  position: number;
  totalRacers: number;
  time: number;
  isGameStarted: boolean;
  isPaused: boolean;
  isCountdown: boolean;
  countdownValue: number;
  isRaceComplete: boolean;
}

export interface CarStats {
  speed: number;       // Top speed capability (0-100)
  acceleration: number; // How quickly the car reaches top speed (0-100)
  handling: number;     // How well the car turns and maintains control (0-100)
  braking: number;      // How quickly the car can stop (0-100)
  nitro: number;        // Nitro boost effectiveness (0-100)
}

export interface CarData {
  id: string;
  name: string;
  description: string;
  stats: CarStats;
  price: number;
  premium: boolean;
  unlocked: boolean;
  defaultColor: string;
  modelType: 'sport' | 'muscle' | 'supercar' | 'concept';
}

export interface CarCustomization {
  color: string;
  wheelType: 'standard' | 'sport' | 'racing';
  spoiler: 'none' | 'medium' | 'large';
  nitroColor: string;
}

export interface Environment {
  id: string;
  name: string;
  description: string;
  type: 'urban' | 'highway' | 'desert' | 'snow' | 'beach';
  weather: 'clear' | 'rain' | 'fog' | 'snow' | 'night';
  difficulty: number; // 1-5 scale
  unlocked: boolean;
  trackLength: number; // in meters
}

export interface GameSettings {
  sfxVolume: number;
  musicVolume: number;
  showFPS: boolean;
  highQuality: boolean;
  vibration: boolean;
  controlType: 'keyboard' | 'touch' | 'tilt';
}

export interface RaceResult {
  position: number;
  time: number;
  coinsEarned: number;
  xpEarned: number;
}

export interface Checkpoint {
  id: number;
  position: [number, number, number];
  rotation: number;
}

export interface AIDriver {
  id: string;
  name: string;
  difficulty: number; // 1-10 scale
  car: CarData;
  color: string;
  aggressiveness: number; // 1-10 scale
  consistency: number; // 1-10 scale
}

export interface PowerUp {
  id: string;
  name: string;
  type: 'nitro' | 'shield' | 'speed' | 'slowdown';
  duration: number; // in seconds
  strength: number; // effect strength (1-10)
  icon: string;
}

export interface Track {
  id: string;
  name: string;
  environment: string; // ID of the environment
  length: number; // in meters
  difficulty: number; // 1-5 scale
  checkpoints: Checkpoint[];
  startPositions: [number, number, number][];
  bestTimes: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface PlayerProgress {
  level: number;
  xp: number;
  coins: number;
  unlockedCars: string[]; // IDs of unlocked cars
  unlockedEnvironments: string[]; // IDs of unlocked environments
  bestTimes: Record<string, number>; // Track ID -> best time
}