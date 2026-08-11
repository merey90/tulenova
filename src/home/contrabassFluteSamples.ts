const CONTRABASS_SAMPLE_SETS = [
  {
    url: '/audio/contrabass-flute/BassFlute.mf.C3B3.aiff',
    startMidi: 48,
    noteCount: 12,
  },
  {
    url: '/audio/contrabass-flute/BassFlute.mf.C4B4.aiff',
    startMidi: 60,
    noteCount: 12,
  },
];

export interface ContrabassFluteNote {
  midi: number;
  buffer: AudioBuffer;
}

const sliceChromaticNotes = (
  context: AudioContext,
  buffer: AudioBuffer,
  startMidi: number,
  noteCount: number
): ContrabassFluteNote[] => {
  const notes: ContrabassFluteNote[] = [];
  const noteDuration = buffer.duration / noteCount;

  for (let index = 0; index < noteCount; index += 1) {
    const startTime = index * noteDuration;
    const endTime = startTime + noteDuration;
    const startSample = Math.floor(startTime * buffer.sampleRate);
    const endSample = Math.floor(endTime * buffer.sampleRate);
    const length = endSample - startSample;

    const slice = context.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const source = buffer.getChannelData(channel);
      const target = slice.getChannelData(channel);
      target.set(source.subarray(startSample, endSample));
    }

    notes.push({ midi: startMidi + index, buffer: slice });
  }

  return notes;
};

export const loadContrabassFluteSamples = async (context: AudioContext): Promise<ContrabassFluteNote[]> => {
  const notes: ContrabassFluteNote[] = [];

  for (const sampleSet of CONTRABASS_SAMPLE_SETS) {
    const response = await fetch(sampleSet.url);
    if (!response.ok) throw new Error(`Failed to load ${sampleSet.url}`);

    const arrayBuffer = await response.arrayBuffer();
    const decoded = await context.decodeAudioData(arrayBuffer);
    notes.push(...sliceChromaticNotes(context, decoded, sampleSet.startMidi, sampleSet.noteCount));
  }

  return notes.sort((a, b) => a.midi - b.midi);
};

export const frequencyToMidi = (frequency: number): number => 69 + 12 * Math.log2(frequency / 440);

export const findNearestContrabassNote = (notes: ContrabassFluteNote[], midi: number): ContrabassFluteNote => {
  return notes.reduce((nearest, note) => (Math.abs(note.midi - midi) < Math.abs(nearest.midi - midi) ? note : nearest));
};

export const playbackRateForMidi = (noteMidi: number, targetMidi: number): number =>
  2 ** ((targetMidi - noteMidi) / 12);

const PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const midiToPitchLabel = (midi: number): string => {
  const name = PITCH_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
};

export const CONTRABASS_MIN_MIDI = 33;
export const CONTRABASS_MAX_MIDI = 57;
