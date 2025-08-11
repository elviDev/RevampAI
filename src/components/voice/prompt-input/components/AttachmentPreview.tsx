import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../../contexts/ThemeContext';
import { AttachedFile } from '../types';

interface AttachmentPreviewProps {
  attachedFiles: AttachedFile[];
  onRemoveAttachment: (index: number) => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachedFiles,
  onRemoveAttachment,
}) => {
  const { theme } = useTheme();

  if (attachedFiles.length === 0) {
    return null;
  }

  return (
    <Animated.View style={{
      marginBottom: 12,
      opacity: 0.95,
    }}>
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        {attachedFiles.map((file, index) => (
          <View
            key={index}
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: theme.colors.shadows.neutral,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {file.uri &&
            (file.type?.startsWith('image') ||
              file.fileName?.match(/\.(jpg|jpeg|png|gif)$/i)) ? (
              <Image
                source={{ uri: file.uri }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              />
            ) : (
              <View style={{
                width: 32,
                height: 32,
                backgroundColor: theme.colors.primary,
                borderRadius: 8,
                marginRight: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon name="file-text" size={16} color={theme.colors.text.onPrimary} />
              </View>
            )}
            <Text
              style={{
                color: theme.colors.text.primary,
                fontSize: 14,
                flex: 1,
                fontWeight: '500',
              }}
              numberOfLines={1}
            >
              {file.fileName || file.name || 'Unknown file'}
            </Text>
            <TouchableOpacity onPress={() => onRemoveAttachment(index)}>
              <Icon name="x" size={16} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};