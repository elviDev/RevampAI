import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmStyle = 'default',
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onCancel}
          activeOpacity={1}
        />
        
        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  confirmStyle === 'destructive' ? 'bg-red-100' : 'bg-blue-100'
                }`}
              >
                <MaterialIcon
                  name={confirmStyle === 'destructive' ? 'warning' : 'help-outline'}
                  size={24}
                  color={confirmStyle === 'destructive' ? '#EF4444' : '#3B82F6'}
                />
              </View>
              <Text className="text-xl font-bold text-gray-900 flex-1">
                {title}
              </Text>
            </View>
          </View>

          {/* Message */}
          <Text className="text-gray-600 text-base leading-6 mb-6">
            {message}
          </Text>

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 bg-gray-100 rounded-xl py-4 px-6"
            >
              <Text className="text-gray-700 font-semibold text-center text-base">
                {cancelText}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onConfirm}
              className={`flex-1 rounded-xl py-4 px-6 ${
                confirmStyle === 'destructive' ? 'bg-red-600' : 'bg-blue-600'
              }`}
            >
              <Text className="text-white font-semibold text-center text-base">
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
