import React from 'react';
import { TextInput, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../../contexts/ThemeContext';

interface TextInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectionChange: (event: any) => void;
  onFocus: () => void;
  onBlur: () => void;
  placeholder: string;
  textInputRef: React.RefObject<TextInput>;
  isFocused: boolean;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  value,
  onChangeText,
  onSelectionChange,
  onFocus,
  onBlur,
  placeholder,
  textInputRef,
  isFocused,
}) => {
  const { theme } = useTheme();

  return (
    <View style={{ position: 'relative' }}>
      {/* Enhanced Background Gradient */}
      <LinearGradient
        colors={[
          theme.colors.glass.background,
          theme.colors.glass.backgroundSecondary,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 12,
          opacity: isFocused ? 0.8 : 0.4,
        }}
      />

      <TextInput
        ref={textInputRef}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSelectionChange={onSelectionChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholderTextColor={theme.colors.text.secondary}
        multiline={true}
        scrollEnabled={true}
        style={{
          color: theme.colors.text.primary,
          textAlignVertical: 'top',
          paddingTop: 16,
          paddingBottom: 16,
          paddingHorizontal: 16,
          minHeight: 60,
          maxHeight: 140,
          lineHeight: 24,
          fontSize: 16,
          fontWeight: '400',
          letterSpacing: 0.3,
          borderRadius: 12,
          backgroundColor: 'transparent',
        }}
        removeClippedSubviews={false}
        keyboardType="default"
        blurOnSubmit={false}
        enablesReturnKeyAutomatically={false}
        returnKeyType="default"
        textBreakStrategy="balanced"
        autoCorrect={true}
        spellCheck={true}
      />
    </View>
  );
};