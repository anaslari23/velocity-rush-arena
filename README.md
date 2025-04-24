# Velocity Rush Arena

A high-speed arcade racing game with customizable cars and dynamic environments.

## Features

- Multiple sports cars with unique stats (speed, acceleration, handling)
- Car customization system (paint, wheels, spoilers)
- Dynamic racing environments (urban, highway, desert, snow, beach)
- Weather effects (rain, fog, night mode)
- Realistic physics with drifting mechanics, nitro boost, and collision reactions
- AI-controlled opponents with difficulty levels
- Sound effects and background soundtrack
- Scoreboard, race timer, laps, and rewards system
- Mobile-friendly controls (touch steering, tilt controls)

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Project Structure

- `/src/components/game` - Game mechanics and 3D rendering
- `/src/components/garage` - Car selection and customization
- `/src/components/menu` - Main menu and navigation
- `/src/components/settings` - Game settings
- `/src/components/ui` - Reusable UI components

## Controls

### Keyboard
- W/Up Arrow: Accelerate
- S/Down Arrow: Brake/Reverse
- A/D or Left/Right Arrows: Steer
- Shift: Drift
- Space: Nitro Boost
- R: Reset car position

### Touch Controls
- Left side of screen: Virtual joystick for steering
- Right side of screen: Buttons for acceleration, braking, drift, and nitro

### Tilt Controls
- Tilt device left/right to steer
- On-screen buttons for acceleration, braking, drift, and nitro

## Game Progression

- Win races to earn coins and XP
- Use coins to unlock new cars and customization options
- Level up to access more challenging tracks and environments

## Development

This project is built with:
- React
- TypeScript
- Three.js (via React Three Fiber)
- Tailwind CSS
- Vite

## Building for Production

To create a production build:
```
npm run build
```

The build artifacts will be stored in the `dist/` directory.