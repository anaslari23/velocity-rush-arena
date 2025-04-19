
import { useEffect, useState } from 'react';

interface Controls {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  nitro: boolean;
  drift: boolean;
  reset: boolean;
}

export function useKeyboardControls(): Controls {
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
    const keyDownHandler = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          setControls((controls) => ({ ...controls, forward: true }));
          break;
        case 'ArrowDown':
        case 'KeyS':
          setControls((controls) => ({ ...controls, back: true }));
          break;
        case 'ArrowLeft':
        case 'KeyA':
          setControls((controls) => ({ ...controls, left: true }));
          break;
        case 'ArrowRight':
        case 'KeyD':
          setControls((controls) => ({ ...controls, right: true }));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setControls((controls) => ({ ...controls, drift: true }));
          break;
        case 'Space':
          setControls((controls) => ({ ...controls, nitro: true }));
          break;
        case 'KeyR':
          setControls((controls) => ({ ...controls, reset: true }));
          break;
        default:
          break;
      }
    };

    const keyUpHandler = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          setControls((controls) => ({ ...controls, forward: false }));
          break;
        case 'ArrowDown':
        case 'KeyS':
          setControls((controls) => ({ ...controls, back: false }));
          break;
        case 'ArrowLeft':
        case 'KeyA':
          setControls((controls) => ({ ...controls, left: false }));
          break;
        case 'ArrowRight':
        case 'KeyD':
          setControls((controls) => ({ ...controls, right: false }));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setControls((controls) => ({ ...controls, drift: false }));
          break;
        case 'Space':
          setControls((controls) => ({ ...controls, nitro: false }));
          break;
        case 'KeyR':
          setControls((controls) => ({ ...controls, reset: false }));
          break;
        default:
          break;
      }
    };

    // Touch controls for mobile
    const createTouchHandler = (controlName: keyof Controls, value: boolean) => () => {
      setControls((controls) => ({ ...controls, [controlName]: value }));
    };

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);

    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
    };
  }, []);

  return controls;
}
