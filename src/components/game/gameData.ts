import { CarData, Environment, Track, AIDriver } from './types';

// Default cars available in the game
export const defaultCars: CarData[] = [
  {
    id: 'velocity_gt',
    name: 'Velocity GT',
    description: 'A balanced sports car with good all-around performance.',
    stats: {
      speed: 75,
      acceleration: 70,
      handling: 80,
      braking: 75,
      nitro: 70
    },
    price: 0,
    premium: false,
    unlocked: true,
    defaultColor: '#ff0066',
    modelType: 'sport'
  },
  {
    id: 'thunder_x',
    name: 'Thunder X',
    description: 'High top speed but requires skill to handle properly.',
    stats: {
      speed: 90,
      acceleration: 65,
      handling: 60,
      braking: 70,
      nitro: 85
    },
    price: 2500,
    premium: true,
    unlocked: false,
    defaultColor: '#00aaff',
    modelType: 'supercar'
  },
  {
    id: 'phantom',
    name: 'Phantom',
    description: 'Exceptional acceleration and handling for tight tracks.',
    stats: {
      speed: 70,
      acceleration: 90,
      handling: 85,
      braking: 80,
      nitro: 75
    },
    price: 3000,
    premium: true,
    unlocked: false,
    defaultColor: '#ffaa00',
    modelType: 'sport'
  },
  {
    id: 'dominator',
    name: 'Dominator',
    description: 'Powerful muscle car with incredible nitro boost.',
    stats: {
      speed: 85,
      acceleration: 80,
      handling: 65,
      braking: 60,
      nitro: 95
    },
    price: 3500,
    premium: true,
    unlocked: false,
    defaultColor: '#00ff66',
    modelType: 'muscle'
  },
  {
    id: 'quantum',
    name: 'Quantum',
    description: 'Futuristic concept car with perfect balance.',
    stats: {
      speed: 85,
      acceleration: 85,
      handling: 85,
      braking: 85,
      nitro: 85
    },
    price: 5000,
    premium: true,
    unlocked: false,
    defaultColor: '#aa00ff',
    modelType: 'concept'
  }
];

// Racing environments
export const defaultEnvironments: Environment[] = [
  {
    id: 'city_streets',
    name: 'City Streets',
    description: 'Race through neon-lit urban streets with tight corners and shortcuts.',
    type: 'urban',
    weather: 'clear',
    difficulty: 2,
    unlocked: true,
    trackLength: 3500
  },
  {
    id: 'coastal_highway',
    name: 'Coastal Highway',
    description: 'High-speed highway along a beautiful coastline with sweeping curves.',
    type: 'highway',
    weather: 'clear',
    difficulty: 1,
    unlocked: true,
    trackLength: 5000
  },
  {
    id: 'desert_dunes',
    name: 'Desert Dunes',
    description: 'Navigate through challenging desert terrain with jumps and banked turns.',
    type: 'desert',
    weather: 'clear',
    difficulty: 3,
    unlocked: false,
    trackLength: 4000
  },
  {
    id: 'mountain_pass',
    name: 'Mountain Pass',
    description: 'Treacherous snowy mountain roads with hairpin turns and limited visibility.',
    type: 'snow',
    weather: 'snow',
    difficulty: 4,
    unlocked: false,
    trackLength: 3800
  },
  {
    id: 'night_city',
    name: 'Night City',
    description: 'The city streets at night with rain and reflective surfaces.',
    type: 'urban',
    weather: 'rain',
    difficulty: 3,
    unlocked: false,
    trackLength: 3500
  },
  {
    id: 'beach_circuit',
    name: 'Beach Circuit',
    description: 'Seaside racing with a mix of road and sand sections.',
    type: 'beach',
    weather: 'clear',
    difficulty: 2,
    unlocked: false,
    trackLength: 4200
  }
];

// AI Drivers
export const aiDrivers: AIDriver[] = [
  {
    id: 'rival_1',
    name: 'Max Velocity',
    difficulty: 5,
    car: defaultCars[1],
    color: '#3388ff',
    aggressiveness: 6,
    consistency: 7
  },
  {
    id: 'rival_2',
    name: 'Turbo',
    difficulty: 4,
    car: defaultCars[2],
    color: '#ff8800',
    aggressiveness: 8,
    consistency: 5
  },
  {
    id: 'rival_3',
    name: 'Drift King',
    difficulty: 6,
    car: defaultCars[3],
    color: '#88ff00',
    aggressiveness: 4,
    consistency: 8
  },
  {
    id: 'rival_4',
    name: 'Nitro Queen',
    difficulty: 7,
    car: defaultCars[4],
    color: '#ff00ff',
    aggressiveness: 7,
    consistency: 7
  },
  {
    id: 'rival_5',
    name: 'Rookie',
    difficulty: 2,
    car: defaultCars[0],
    color: '#ffffff',
    aggressiveness: 3,
    consistency: 4
  },
  {
    id: 'rival_6',
    name: 'The Pro',
    difficulty: 9,
    car: defaultCars[4],
    color: '#ff0000',
    aggressiveness: 9,
    consistency: 9
  }
];

// Tracks
export const tracks: Track[] = [
  {
    id: 'city_circuit',
    name: 'City Circuit',
    environment: 'city_streets',
    length: 3500,
    difficulty: 2,
    checkpoints: [
      { id: 1, position: [0, 0, -50], rotation: 0 },
      { id: 2, position: [100, 2, -100], rotation: 90 },
      { id: 3, position: [150, 4, 0], rotation: 180 },
      { id: 4, position: [50, 2, 100], rotation: 270 }
    ],
    startPositions: [
      [0, 1, 0],
      [5, 1, 0],
      [-5, 1, 0],
      [10, 1, 0],
      [-10, 1, 0],
      [15, 1, 0]
    ],
    bestTimes: {
      easy: 120000,
      medium: 105000,
      hard: 95000
    }
  },
  {
    id: 'coastal_run',
    name: 'Coastal Run',
    environment: 'coastal_highway',
    length: 5000,
    difficulty: 1,
    checkpoints: [
      { id: 1, position: [0, 0, -100], rotation: 0 },
      { id: 2, position: [200, 0, -200], rotation: 90 },
      { id: 3, position: [400, 0, 0], rotation: 180 },
      { id: 4, position: [200, 0, 200], rotation: 270 }
    ],
    startPositions: [
      [0, 1, 0],
      [5, 1, 0],
      [-5, 1, 0],
      [10, 1, 0],
      [-10, 1, 0],
      [15, 1, 0]
    ],
    bestTimes: {
      easy: 180000,
      medium: 160000,
      hard: 145000
    }
  }
];

// Sound effects
export const soundEffects = {
  engine: {
    idle: '/sounds/engine_idle.mp3',
    low: '/sounds/engine_low.mp3',
    medium: '/sounds/engine_medium.mp3',
    high: '/sounds/engine_high.mp3'
  },
  nitro: '/sounds/nitro_boost.mp3',
  drift: '/sounds/tire_squeal.mp3',
  crash: '/sounds/crash.mp3',
  checkpoint: '/sounds/checkpoint.mp3',
  countdown: '/sounds/countdown.mp3',
  menu: {
    select: '/sounds/menu_select.mp3',
    hover: '/sounds/menu_hover.mp3',
    back: '/sounds/menu_back.mp3'
  },
  victory: '/sounds/victory.mp3',
  defeat: '/sounds/defeat.mp3'
};

// Background music
export const backgroundMusic = {
  menu: '/music/menu_theme.mp3',
  race: [
    '/music/race_theme_1.mp3',
    '/music/race_theme_2.mp3',
    '/music/race_theme_3.mp3'
  ],
  victory: '/music/victory_theme.mp3'
};

// Weather effects
export const weatherEffects = {
  rain: {
    intensity: 0.5,
    soundEffect: '/sounds/rain.mp3',
    particleEffect: 'rain',
    roadFriction: 0.7
  },
  snow: {
    intensity: 0.4,
    soundEffect: '/sounds/snow.mp3',
    particleEffect: 'snow',
    roadFriction: 0.6
  },
  fog: {
    intensity: 0.3,
    particleEffect: 'fog',
    visibility: 0.5
  },
  night: {
    lightLevel: 0.2,
    headlightsEnabled: true
  }
};