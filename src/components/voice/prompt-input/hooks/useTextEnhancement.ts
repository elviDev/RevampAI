import { useState } from 'react';
import { Alert } from 'react-native';
import { openAIService } from '../../../../services/ai/OpenAIService';
import { shouldShowEnhanceButton } from '../utils/textUtils';

export const useTextEnhancement = (
  onEnhanceText?: (text: string) => void
) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async (text: string, onTextChange: (text: string) => void) => {
    if (!text.trim() || !shouldShowEnhanceButton(text) || isEnhancing) {
      return;
    }

    setIsEnhancing(true);
    console.log('🔄 Starting text enhancement...');

    try {
      const enhancedText = await openAIService.enhanceText(text.trim());
      onTextChange(enhancedText);
      console.log('✅ Text enhanced successfully');

      onEnhanceText?.(enhancedText);
    } catch (error) {
      console.error('❌ Enhancement failed:', error);
      Alert.alert(
        'Enhancement Failed',
        error instanceof Error
          ? error.message
          : 'Unable to enhance text. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  return {
    isEnhancing,
    handleEnhance,
    shouldShowEnhanceButton: (text: string) => shouldShowEnhanceButton(text),
  };
};