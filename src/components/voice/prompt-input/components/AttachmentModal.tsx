import React from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../../contexts/ThemeContext';

interface AttachmentModalProps {
  visible: boolean;
  onClose: () => void;
  onAttachFile: () => void;
  onAttachImage: () => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  visible,
  onClose,
  onAttachFile,
  onAttachImage,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
        onPress={onClose}
      >
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: 40,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: theme.colors.text.primary,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            Attach Content
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity
              onPress={() => {
                onAttachFile();
                onClose();
              }}
              style={{
                alignItems: 'center',
                padding: 16,
                borderRadius: 16,
                backgroundColor: theme.colors.primary + '20',
                minWidth: 100,
              }}
            >
              <Icon name="file" size={32} color={theme.colors.primary} />
              <Text
                style={{
                  marginTop: 8,
                  color: theme.colors.text.primary,
                  fontWeight: '600',
                }}
              >
                File
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onAttachImage();
                onClose();
              }}
              style={{
                alignItems: 'center',
                padding: 16,
                borderRadius: 16,
                backgroundColor: theme.colors.accent + '20',
                minWidth: 100,
              }}
            >
              <Icon name="image" size={32} color={theme.colors.accent} />
              <Text
                style={{
                  marginTop: 8,
                  color: theme.colors.text.primary,
                  fontWeight: '600',
                }}
              >
                Photo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};