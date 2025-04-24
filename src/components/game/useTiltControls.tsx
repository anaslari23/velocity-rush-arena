import { useEffect, useState } from 'react';
import { Controls } from './useKeyboardControls';

export function useTiltControls(): Controls {
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
    // Check if device orientation is supported
    if (!window.DeviceOrientationEvent) {
      console.warn('Device orientation not supported on this device');
      return;
    }

    // Create tilt control UI
    const createTiltControls = () => {
      // Remove any existing controls
      const existingControls = document.getElementById('tilt-controls');
      if (existingControls) {
        existingControls.remove();
      }

      // Create container
      const controlsContainer = document.createElement('div');
      controlsContainer.id = 'tilt-controls';
      controlsContainer.style.position = 'absolute';
      controlsContainer.style.bottom = '0';
      controlsContainer.style.left = '0';
      controlsContainer.style.width = '100%';
      controlsContainer.style.height = '30%';
      controlsContainer.style.display = 'flex';
      controlsContainer.style.justifyContent = 'space-between';
      controlsContainer.style.pointerEvents = 'none';
      controlsContainer.style.zIndex = '1000';

      // Create tilt indicator
      const tiltIndicator = document.createElement('div');
      tiltIndicator.id = 'tilt-indicator';
      tiltIndicator.style.position = 'absolute';
      tiltIndicator.style.top = '20px';
      tiltIndicator.style.left = '20px';
      tiltIndicator.style.width = '60px';
      tiltIndicator.style.height = '60px';
      tiltIndicator.style.borderRadius = '50%';
      tiltIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      tiltIndicator.style.border = '2px solid rgba(255, 255, 255, 0.5)';
      tiltIndicator.style.display = 'flex';
      tiltIndicator.style.alignItems = 'center';
      tiltIndicator.style.justifyContent = 'center';
      tiltIndicator.style.pointerEvents = 'none';

      const tiltDot = document.createElement('div');
      tiltDot.style.width = '20px';
      tiltDot.style.height = '20px';
      tiltDot.style.borderRadius = '50%';
      tiltDot.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      tiltDot.style.position = 'absolute';
      tiltDot.style.top = '50%';
      tiltDot.style.left = '50%';
      tiltDot.style.transform = 'translate(-50%, -50%)';

      tiltIndicator.appendChild(tiltDot);
      controlsContainer.appendChild(tiltIndicator);

      // Create buttons for acceleration, braking, nitro, and drift
      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.position = 'absolute';
      buttonsContainer.style.bottom = '20px';
      buttonsContainer.style.right = '20px';
      buttonsContainer.style.display = 'grid';
      buttonsContainer.style.gridTemplateColumns = '1fr 1fr';
      buttonsContainer.style.gridTemplateRows = '1fr 1fr';
      buttonsContainer.style.gap = '10px';
      buttonsContainer.style.pointerEvents = 'auto';

      // Create buttons
      const accelerateBtn = createButton('↑', 'accelerate-btn', '#00aaff');
      const brakeBtn = createButton('↓', 'brake-btn', '#ff5555');
      const nitroBtn = createButton('N', 'nitro-btn', '#ffaa00');
      const driftBtn = createButton('D', 'drift-btn', '#aa00ff');

      // Add buttons to container
      buttonsContainer.appendChild(accelerateBtn);
      buttonsContainer.appendChild(nitroBtn);
      buttonsContainer.appendChild(brakeBtn);
      buttonsContainer.appendChild(driftBtn);

      controlsContainer.appendChild(buttonsContainer);

      // Add to document
      document.body.appendChild(controlsContainer);

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

      return { tiltDot };
    };

    // Helper to create a button
    const createButton = (text: string, id: string, color: string) => {
      const button = document.createElement('div');
      button.id = id;
      button.innerText = text;
      button.style.backgroundColor = color;
      button.style.color = 'white';
      button.style.borderRadius = '50%';
      button.style.width = '60px';
      button.style.height = '60px';
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

    // Initialize tilt controls
    const { tiltDot } = createTiltControls();

    // Handle device orientation
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      // Get gamma (left to right tilt)
      const gamma = event.gamma; // Range: -90 to 90
      
      if (gamma === null) return;

      // Update tilt indicator
      if (tiltDot) {
        const maxTilt = 30; // Maximum tilt angle to consider
        const normalizedGamma = Math.max(-maxTilt, Math.min(maxTilt, gamma)) / maxTilt;
        const offsetX = normalizedGamma * 20; // 20px is half the width of the indicator minus dot radius
        
        tiltDot.style.transform = `translate(calc(-50% + ${offsetX}px), -50%)`;
      }

      // Update steering controls based on tilt
      const tiltThreshold = 5; // Minimum tilt to register
      setControls(prev => ({
        ...prev,
        left: gamma < -tiltThreshold,
        right: gamma > tiltThreshold
      }));
    };

    // Add device orientation event listener
    window.addEventListener('deviceorientation', handleDeviceOrientation);

    // Request permission for device orientation on iOS 13+
    const requestPermission = () => {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleDeviceOrientation);
            } else {
              console.warn('Device orientation permission denied');
            }
          })
          .catch(console.error);
      } else {
        // Handle regular non-iOS 13+ devices
        window.addEventListener('deviceorientation', handleDeviceOrientation);
      }
    };

    // Add permission request button for iOS
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permissionBtn = document.createElement('button');
      permissionBtn.innerText = 'Enable Tilt Controls';
      permissionBtn.style.position = 'absolute';
      permissionBtn.style.top = '50%';
      permissionBtn.style.left = '50%';
      permissionBtn.style.transform = 'translate(-50%, -50%)';
      permissionBtn.style.padding = '12px 24px';
      permissionBtn.style.backgroundColor = '#00aaff';
      permissionBtn.style.color = 'white';
      permissionBtn.style.border = 'none';
      permissionBtn.style.borderRadius = '4px';
      permissionBtn.style.fontSize = '16px';
      permissionBtn.style.zIndex = '2000';
      
      permissionBtn.addEventListener('click', () => {
        requestPermission();
        permissionBtn.remove();
      });
      
      document.body.appendChild(permissionBtn);
    } else {
      // Non-iOS device, no permission needed
      requestPermission();
    }

    // Cleanup
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      
      const tiltControls = document.getElementById('tilt-controls');
      if (tiltControls) {
        tiltControls.remove();
      }
      
      const resetBtn = document.getElementById('reset-btn');
      if (resetBtn) {
        resetBtn.remove();
      }
      
      const permissionBtn = document.querySelector('button');
      if (permissionBtn && permissionBtn.innerText === 'Enable Tilt Controls') {
        permissionBtn.remove();
      }
    };
  }, []);

  return controls;
}