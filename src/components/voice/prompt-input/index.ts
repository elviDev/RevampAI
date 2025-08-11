// Main component export
export { PromptInput } from './PromptInputContainer';

// Type exports
export type {
  PromptInputProps,
  RecordingState,
  MentionUser,
  AttachedFile,
  AnimationValues,
} from './types';

// Component exports
export { SparkleEffect } from './components/SparkleEffect';
export { VoiceWaveform } from './components/VoiceWaveform';
export { RecordingIndicator } from './components/RecordingIndicator';
export { TextInputField } from './components/TextInputField';
export { ActionButtons } from './components/ActionButtons';
export { AttachmentPreview } from './components/AttachmentPreview';
export { MentionSuggestions } from './components/MentionSuggestions';
export { AttachmentModal } from './components/AttachmentModal';

// Hook exports
export { usePromptInputAnimations } from './hooks/usePromptInputAnimations';
export { useVoiceRecording } from './hooks/useVoiceRecording';
export { useMentions } from './hooks/useMentions';
export { useFileAttachments } from './hooks/useFileAttachments';
export { useTextEnhancement } from './hooks/useTextEnhancement';

// Utility exports
export { getWordCount, shouldShowEnhanceButton } from './utils/textUtils';
export { DUMMY_USERS, ANIMATION_DURATIONS, VOICE_WAVE_COUNT } from './constants';