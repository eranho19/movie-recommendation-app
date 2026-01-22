// Click sound utility using Web Audio API
let audioContext: AudioContext | null = null;

// Initialize audio context on first user interaction
function initAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.debug('Could not create audio context:', error);
    }
  }
  // Resume audio context if it's suspended (required by some browsers)
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(err => {
      console.debug('Could not resume audio context:', err);
    });
  }
}

export function playClickSound() {
  try {
    // Initialize audio context on first use
    initAudioContext();
    
    if (!audioContext) {
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Create a short, pleasant click sound
    oscillator.frequency.value = 800; // Higher pitch for click
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    // Silently fail if audio context is not available
    // (e.g., browser autoplay restrictions)
    console.debug('Could not play click sound:', error);
  }
}
