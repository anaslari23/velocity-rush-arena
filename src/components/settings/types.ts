// Settings types
export interface AudioSettings {
  master: number;
  music: number;
  sfx: number;
}

export interface GraphicsSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  shadows: boolean;
  particles: boolean;
  postProcessing: boolean;
}

export interface ControlSettings {
  type: 'keyboard' | 'touch' | 'tilt';
  sensitivity: number;
  invertY: boolean;
  vibration: boolean;
}

export interface GameSettings {
  audio: AudioSettings;
  graphics: GraphicsSettings;
  controls: ControlSettings;
}

// Default settings
export const defaultSettings: GameSettings = {
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