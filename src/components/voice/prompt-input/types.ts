export interface PromptInputProps {
  onSendMessage?: (text: string) => void;
  onSendRecording?: (audioUri: string, transcript?: string) => void;
  onAttachFile?: (file: any) => void;
  onAttachImage?: (image: any) => void;
  onEnhanceText?: (text: string) => void;
  placeholder?: string;
  maxLines?: number;
  disabled?: boolean;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioPath: string;
}

export interface MentionUser {
  id: string;
  name: string;
  username: string;
}

export interface AttachedFile {
  uri?: string;
  fileName?: string;
  name?: string;
  type?: string;
}

export interface AnimationValues {
  recordingScale: any;
  recordingOpacity: any;
  pulseAnimation: any;
  sendButtonScale: any;
  focusAnimation: any;
  borderGlow: any;
  voiceWaveAnimation: any;
  sparkleAnimation: any;
  buttonHover: any;
}