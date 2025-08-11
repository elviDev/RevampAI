import { MentionUser } from './types';

// Dummy users for mention functionality
export const DUMMY_USERS: MentionUser[] = [
  { id: '1', name: 'John Doe', username: 'johndoe' },
  { id: '2', name: 'Jane Smith', username: 'janesmith' },
  { id: '3', name: 'Mike Johnson', username: 'mikejohnson' },
  { id: '4', name: 'Sarah Wilson', username: 'sarahwilson' },
  { id: '5', name: 'David Brown', username: 'davidbrown' },
  { id: '6', name: 'Emily Davis', username: 'emilydavis' },
  { id: '7', name: 'Chris Miller', username: 'chrismiller' },
  { id: '8', name: 'Lisa Anderson', username: 'lisaanderson' },
  { id: '9', name: 'Tom Garcia', username: 'tomgarcia' },
  { id: '10', name: 'Amy Martinez', username: 'amymartinez' },
];

export const ANIMATION_DURATIONS = {
  FOCUS: 200,
  BUTTON_PRESS: 100,
  SPARKLE_CYCLE: 2000,
  VOICE_WAVE: 500,
  PULSE: 1000,
  RECORDING_TRANSITION: 300,
} as const;

export const VOICE_WAVE_COUNT = 5;