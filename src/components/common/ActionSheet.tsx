import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';

interface ActionSheetOption {
  text: string;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'cancel';
  icon?: string;
  iconLibrary?: 'material' | 'ionicon';
}

interface ActionSheetProps {
  visible: boolean;
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  onClose: () => void;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  title,
  message,
  options,
  onClose,
}) => {
  const handleOptionPress = (option: ActionSheetOption) => {
    option.onPress();
    onClose();
  };

  const getIconComponent = (option: ActionSheetOption) => {
    if (!option.icon) return null;
    
    const iconColor = option.style === 'destructive' ? '#EF4444' : option.style === 'cancel' ? '#6B7280' : '#374151';
    
    if (option.iconLibrary === 'ionicon') {
      return <IonIcon name={option.icon} size={20} color={iconColor} />;
    }
    return <MaterialIcon name={option.icon} size={20} color={iconColor} />;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={onClose}
          activeOpacity={1}
        />
        
        <Animated.View
          entering={SlideInUp.duration(300).springify()}
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 34, // Safe area bottom padding
            maxHeight: '80%',
          }}
        >
          {/* Header */}
          {(title || message) && (
            <View className="px-6 py-4 border-b border-gray-100">
              {title && (
                <Text className="text-lg font-bold text-gray-900 text-center mb-1">
                  {title}
                </Text>
              )}
              {message && (
                <Text className="text-sm text-gray-600 text-center">
                  {message}
                </Text>
              )}
            </View>
          )}

          {/* Options */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="py-2">
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleOptionPress(option)}
                  className="flex-row items-center px-6 py-4 active:bg-gray-50"
                >
                  {option.icon && (
                    <View className="mr-4">
                      {getIconComponent(option)}
                    </View>
                  )}
                  <Text
                    className={`text-base font-medium flex-1 ${
                      option.style === 'destructive'
                        ? 'text-red-600'
                        : option.style === 'cancel'
                        ? 'text-gray-500'
                        : 'text-gray-900'
                    }`}
                  >
                    {option.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
