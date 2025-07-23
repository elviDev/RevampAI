import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Member {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface MentionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  members: Member[];
  onFocus?: () => void;
  onBlur?: () => void;
  multiline?: boolean;
  maxHeight?: number;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChangeText,
  placeholder,
  members,
  onFocus,
  onBlur,
  multiline = true,
  maxHeight = 120,
}) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  const inputRef = useRef<TextInput>(null);
  const mentionsHeight = useSharedValue(0);

  // Fixed @ detection logic
  const handleTextChange = (text: string) => {
    onChangeText(text);

    // Get text before cursor
    const beforeCursor = text.substring(0, selectionStart);

    // Find the last @ symbol
    const lastAtIndex = beforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      // Get text after the last @
      const afterAt = beforeCursor.substring(lastAtIndex + 1);

      // Check if there's no space after @ (still typing the mention)
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        setMentionQuery(afterAt.toLowerCase());
        setShowMentions(true);

        // Animate mentions dropdown
        const filteredCount = members.filter(member =>
          member.name.toLowerCase().includes(afterAt.toLowerCase()),
        ).length;

        mentionsHeight.value = withSpring(Math.min(filteredCount * 60, 200), {
          damping: 15,
        });
      } else {
        hideMentions();
      }
    } else {
      hideMentions();
    }
  };

  const hideMentions = () => {
    setShowMentions(false);
    mentionsHeight.value = withSpring(0);
    setMentionQuery('');
  };

  const handleSelectionChange = (event: any) => {
    const { start, end } = event.nativeEvent.selection;
    setSelectionStart(start);
    setSelectionEnd(end);
  };

  const insertMention = (member: Member) => {
    const beforeCursor = value.substring(0, selectionStart);
    const afterCursor = value.substring(selectionStart);

    // Find the last @ symbol before cursor
    const lastAtIndex = beforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const beforeAt = value.substring(0, lastAtIndex);
      const newText = `${beforeAt}@${member.name} ${afterCursor}`;

      onChangeText(newText);
      hideMentions();

      // Set cursor position after the mention
      const newCursorPosition = lastAtIndex + member.name.length + 2;
      setTimeout(() => {
        inputRef.current?.setNativeProps({
          selection: { start: newCursorPosition, end: newCursorPosition },
        });
      }, 100);
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(mentionQuery),
  );

  const mentionsAnimatedStyle = useAnimatedStyle(() => ({
    height: mentionsHeight.value,
    opacity: mentionsHeight.value > 0 ? 1 : 0,
  }));

  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = () => {
    // Delay hiding mentions to allow selection
    setTimeout(() => {
      hideMentions();
      onBlur?.();
    }, 200);
  };

  return (
    <View style={{ position: 'relative' }}>
      {/* Mentions Dropdown */}
      {showMentions && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#fff',
              borderRadius: 12,
              marginBottom: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
              zIndex: 1000,
              maxHeight: 200,
            },
            mentionsAnimatedStyle,
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member, index) => (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => insertMention(member)}
                  className={`px-4 py-3 flex-row items-center ${
                    index < filteredMembers.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                  style={{ backgroundColor: 'transparent' }}
                >
                  {/* Avatar */}
                  <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
                    <Text className="text-white text-sm font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  {/* Member Info */}
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium text-base">
                      {member.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">{member.role}</Text>
                  </View>

                  {/* Mention Icon */}
                  <View className="bg-blue-50 px-2 py-1 rounded-full">
                    <Text className="text-blue-600 text-xs font-medium">@</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="px-4 py-6 items-center">
                <Text className="text-gray-400 text-sm">
                  No members found for "@{mentionQuery}"
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* Text Input */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleTextChange}
        onSelectionChange={handleSelectionChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        style={{
          maxHeight: maxHeight,
          minHeight: 24,
          textAlignVertical: multiline ? 'top' : 'center',
          paddingTop: multiline ? 8 : 0,
        }}
        className="text-gray-900 text-base"
        scrollEnabled={multiline}
      />
    </View>
  );
};
