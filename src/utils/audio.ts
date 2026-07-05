// Procedural audio generator using Web Audio API for cute 8-bit pentatonic melodies
let audioCtx: AudioContext | null = null;
let currentOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
let melodyTimeout: any = null;
let nextNoteTimeout: any = null;
let playSecondsRemaining = 60;
let onTimeUpdateCallback: ((seconds: number) => void) | null = null;
let onEndedCallback: (() => void) | null = null;
let isPlayingAudio = false;

// Scale definition (C pentatonic major - always sounds happy and harmonic)
const PENTATONIC_SCALE = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.00  // A5
];

export interface Track {
  title: string;
  mood: string;
  notes: number[]; // indices of PENTATONIC_SCALE or actual frequencies
  tempo: number; // ms per beat
}

export const PRESET_TRACKS: Track[] = [
  {
    title: "啾啾的快乐时光",
    mood: "欢快开朗",
    notes: [5, 6, 7, 5, 7, 8, 9, 7, 5, 3, 5, 3, 2, 0, 2, 5],
    tempo: 220
  },
  {
    title: "小主人放学啦",
    mood: "温馨甜蜜",
    notes: [0, 2, 3, 5, 5, 3, 2, 0, 0, 2, 3, 2, 0, 2, 3, 5],
    tempo: 280
  },
  {
    title: "古诗韵律歌",
    mood: "典雅悠长",
    notes: [4, 4, 6, 7, 6, 4, 3, 3, 5, 6, 5, 3, 2, 2, 4, 0],
    tempo: 350
  },
  {
    title: "世界杯冲锋号",
    mood: "动感激情",
    notes: [0, 3, 5, 3, 5, 7, 8, 7, 8, 9, 8, 9, 7, 5, 3, 5],
    tempo: 180
  }
];

// Helper to derive a deterministic note sequence from any custom song title
export function generateTrackFromTitle(title: string): Track {
  const notes: number[] = [];
  const charSum = Array.from(title).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  
  // Make a 16-note sequence based on character codes
  for (let i = 0; i < 16; i++) {
    const code = title.charCodeAt(i % title.length) || (charSum + i);
    const scaleIndex = (code + i * 3) % PENTATONIC_SCALE.length;
    notes.push(scaleIndex);
  }

  // Determine tempo based on string length
  const tempo = 200 + (title.length * 15) % 150;

  return {
    title,
    mood: charSum % 2 === 0 ? "动感活力" : "抒情悠扬",
    notes,
    tempo
  };
}

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

export function playTrack(
  track: Track, 
  onTimeUpdate: (seconds: number) => void, 
  onEnded: () => void
) {
  stopAudio();
  initAudio();
  
  if (!audioCtx) return;

  isPlayingAudio = true;
  onTimeUpdateCallback = onTimeUpdate;
  onEndedCallback = onEnded;
  playSecondsRemaining = 60; // 1 minute play limit
  onTimeUpdateCallback(playSecondsRemaining);

  let noteIndex = 0;
  
  // Outer countdown timer
  melodyTimeout = setInterval(() => {
    if (!isPlayingAudio) {
      clearInterval(melodyTimeout);
      melodyTimeout = null;
      return;
    }

    playSecondsRemaining--;
    if (onTimeUpdateCallback) {
      onTimeUpdateCallback(playSecondsRemaining);
    }
    
    if (playSecondsRemaining <= 0) {
      stopAudio();
      if (onEndedCallback) onEndedCallback();
    }
  }, 1000);

  // Function to play the next note in the sequence
  function playNextNote() {
    if (!isPlayingAudio || !audioCtx || playSecondsRemaining <= 0) return;

    const scaleIndex = track.notes[noteIndex % track.notes.length];
    const freq = PENTATONIC_SCALE[scaleIndex];

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Use triangular or sine wave for sweet soft tones
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Sweet envelope: sharp attack, quick decay
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (track.tempo / 1000) * 0.9);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    try {
      osc.stop(audioCtx.currentTime + track.tempo / 1000);
    } catch (e) {}

    const oscRef = { osc, gain };
    currentOscillators.push(oscRef);

    // Clean up oscillator references
    setTimeout(() => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch (e) {}
      currentOscillators = currentOscillators.filter(item => item !== oscRef);
    }, track.tempo + 100);

    noteIndex++;
    
    // Schedule next note ONLY if we are still playing
    if (isPlayingAudio) {
      nextNoteTimeout = setTimeout(playNextNote, track.tempo);
    }
  }

  playNextNote();
}

export function stopAudio() {
  isPlayingAudio = false;

  // Clear counting timers and timeouts
  if (melodyTimeout) {
    clearInterval(melodyTimeout);
    melodyTimeout = null;
  }

  if (nextNoteTimeout) {
    clearTimeout(nextNoteTimeout);
    nextNoteTimeout = null;
  }

  // Stop active sound generators
  currentOscillators.forEach(({ osc, gain }) => {
    try {
      osc.stop();
    } catch (e) {}
    try {
      osc.disconnect();
      gain.disconnect();
    } catch (e) {}
  });
  currentOscillators = [];
  playSecondsRemaining = 60;
}
