import { useEffect, useState } from 'react';
import { Controls } from './useKeyboardControls';

export function useTouchControls(): Controls {
  const [controls, setControls] = useState<Controls>({
    forward: false,
    back: false,
    left: false,
    right: false,
    nitro: false,
    drift: false,
    reset: false
  });

  useEffect(() => {
    // Create touch control UI
    const createTouchControls = () => {
      // Remove any existing controls
      const existingControls = document.getElementById('touch-controls');
      if (existingControls) {
        existingControls.remove();
      }

      // Create container
      const controlsContainer = document.createElement('div');
      controlsContainer.id = 'touch-controls';
      controlsContainer.style.position = 'absolute';
      controlsContainer.style.bottom = '0';
      controlsContainer.style.left = '0';
      controlsContainer.style.width = '100%';
      controlsContainer.style.height = '30%';
      controlsContainer.style.display = 'flex';
      controlsContainer.style.justifyContent = 'space-between';
      controlsContainer.style.pointerEvents = 'none';
      controlsContainer.style.zIndex = '1000';

      // Create left joystick container (steering)
      const leftJoystick = document.createElement('div');
      leftJoystick.style.position = 'relative';
      leftJoystick.style.width = '40%';
      leftJoystick.style.height = '100%';
      leftJoystick.style.pointerEvents = 'auto';

      // Create right buttons container (acceleration, brake, nitro, drift)
      const rightButtons = document.createElement('div');
      rightButtons.style.position = 'relative';
      rightButtons.style.width = '40%';
      rightButtons.style.height = '100%';
      rightButtons.style.display = 'grid';
      rightButtons.style.gridTemplateColumns = '1fr 1fr';
      rightButtons.style.gridTemplateRows = '1fr 1fr';
      rightButtons.style.gap = '10px';
      rightButtons.style.padding = '20px';
      rightButtons.style.pointerEvents = 'auto';

      // Create buttons
      const accelerateBtn = createButton('↑', 'accelerate-btn', '#00aaff');
      const brakeBtn = createButton('↓', 'brake-btn', '#ff5555');
      const nitroBtn = createButton('N', 'nitro-btn', '#ffaa00');
      const driftBtn = createButton('D', 'drift-btn', '#aa00ff');

      // Add buttons to right container
      rightButtons.appendChild(accelerateBtn);
      rightButtons.appendChild(nitroBtn);
      rightButtons.appendChild(brakeBtn);
      rightButtons.appendChild(driftBtn);

      // Add containers to main container
      controlsContainer.appendChild(leftJoystick);
      controlsContainer.appendChild(rightButtons);

      // Add to document
      document.body.appendChild(controlsContainer);

      // Setup joystick
      setupJoystick(leftJoystick);

      // Setup button events
      setupButtonEvents(accelerateBtn, 'forward');
      setupButtonEvents(brakeBtn, 'back');
      setupButtonEvents(nitroBtn, 'nitro');
      setupButtonEvents(driftBtn, 'drift');

      // Add reset button
      const resetBtn = createButton('R', 'reset-btn', '#ffffff');
      resetBtn.style.position = 'absolute';
      resetBtn.style.top = '20px';
      resetBtn.style.right = '20px';
      resetBtn.style.width = '40px';
      resetBtn.style.height = '40px';
      resetBtn.style.zIndex = '1001';
      document.body.appendChild(resetBtn);
      
      setupButtonEvents(resetBtn, 'reset');
    };

    // Helper to create a button
    const createButton = (text: string, id: string, color: string) => {
      const button = document.createElement('div');
      button.id = id;
      button.innerText = text;
      button.style.backgroundColor = color;
      button.style.color = 'white';
      button.style.borderRadius = '50%';
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.style.fontSize = '24px';
      button.style.fontWeight = 'bold';
      button.style.opacity = '0.7';
      button.style.userSelect = 'none';
      button.style.touchAction = 'none';
      return button;
    };

    // Setup joystick functionality
    const setupJoystick = (joystickContainer: HTMLDivElement) => {
      const joystickBase = document.createElement('div');
      joystickBase.style.position = 'absolute';
      joystickBase.style.bottom = '80px';
      joystickBase.style.left = '80px';
      joystickBase.style.width = '120px';
      joystickBase.style.height = '120px';
      joystickBase.style.borderRadius = '50%';
      joystickBase.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      joystickBase.style.border = '2px solid rgba(255, 255, 255, 0.3)';

      const joystickKnob = document.createElement('div');
      joystickKnob.style.position = 'absolute';
      joystickKnob.style.top = '50%';
      joystickKnob.style.left = '50%';
      joystickKnob.style.transform = 'translate(-50%, -50%)';
      joystickKnob.style.width = '60px';
      joystickKnob.style.height = '60px';
      joystickKnob.style.borderRadius = '50%';
      joystickKnob.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
      joystickKnob.style.border = '2px solid rgba(255, 255, 255, 0.7)';

      joystickBase.appendChild(joystickKnob);
      joystickContainer.appendChild(joystickBase);

      let isDragging = false;
      const baseRect = joystickBase.getBoundingClientRect();
      const centerX = baseRect.width / 2;
      const centerY = baseRect.height / 2;
      const maxDistance = baseRect.width / 2 - 30; // Radius minus knob radius

      const handleStart = (clientX: number, clientY: number) => {
        isDragging = true;
        updateJoystickPosition(clientX, clientY);
      };

      const handleMove = (clientX: number, clientY: number) => {
        if (isDragging) {
          updateJoystickPosition(clientX, clientY);
        }
      };

      const handleEnd = () => {
        isDragging = false;
        joystickKnob.style.top = '50%';
        joystickKnob.style.left = '50%';
        joystickKnob.style.transform = 'translate(-50%, -50%)';
        setControls(prev => ({ ...prev, left: false, right: false }));
      };

      const updateJoystickPosition = (clientX: number, clientY: number) => {
        const baseRect = joystickBase.getBoundingClientRect();
        const offsetX = clientX - baseRect.left;
        const offsetY = clientY - baseRect.top;

        // Calculate distance from center
        const deltaX = offsetX - centerX;
        const deltaY = offsetY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Normalize to max distance
        const normalizedDistance = Math.min(distance, maxDistance);
        const angle = Math.atan2(deltaY, deltaX);

        // Calculate new position
        const newX = centerX + normalizedDistance * Math.cos(angle);
        const newY = centerY + normalizedDistance * Math.sin(angle);

        // Update knob position
        joystickKnob.style.left = `${newX}px`;
        joystickKnob.style.top = `${newY}px`;
        joystickKnob.style.transform = 'translate(-50%, -50%)';

        // Update controls based on joystick position
        const horizontalThreshold = 0.3;
        const normalizedX = deltaX / maxDistance;

        setControls(prev => ({
          ...prev,
          left: normalizedX < -horizontalThreshold,
          right: normalizedX > horizontalThreshold
        }));
      };

      // Touch events
      joystickBase.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      });

      joystickBase.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      });

      joystickBase.addEventListener('touchend', () => {
        handleEnd();
      });

      // Mouse events for testing on desktop
      joystickBase.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY);
      });

      window.addEventListener('mousemove', (e) => {
        handleMove(e.clientX, e.clientY);
      });

      window.addEventListener('mouseup', () => {
        handleEnd();
      });
    };

    // Setup button events
    const setupButtonEvents = (button: HTMLDivElement, controlName: keyof Controls) => {
      const handleButtonDown = () => {
        button.style.transform = 'scale(0.9)';
        button.style.opacity = '1';
        setControls(prev => ({ ...prev, [controlName]: true }));
      };

      const handleButtonUp = () => {
        button.style.transform = 'scale(1)';
        button.style.opacity = '0.7';
        setControls(prev => ({ ...prev, [controlName]: false }));
      };

      // Touch events
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleButtonDown();
      });

      button.addEventListener('touchend', () => {
        handleButtonUp();
      });

      // Mouse events for testing on desktop
      button.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleButtonDown();
      });

      button.addEventListener('mouseup', () => {
        handleButtonUp();
      });

      button.addEventListener('mouseleave', () => {
        handleButtonUp();
      });
    };

    // Initialize touch controls
    createTouchControls();

    // Cleanup
    return () => {
      const touchControls = document.getElementById('touch-controls');
      if (touchControls) {
        touchControls.remove();
      }
      
      const resetBtn = document.getElementById('reset-btn');
      if (resetBtn) {
        resetBtn.remove();
      }
    };
  }, []);

  return controls;
}