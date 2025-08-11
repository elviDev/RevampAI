import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { MessageReaction } from './ChatChannel';

interface EmojiReactionsProps {
  reactions: MessageReaction[];
  onReactionPress: (emoji: string) => void;
  currentUserId?: string;
}

export const EmojiReactions: React.FC<EmojiReactionsProps> = ({
  reactions,
  onReactionPress,
  currentUserId,
}) => {
  const { theme } = useTheme();

  if (!reactions || reactions.length === 0) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 4,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 4 }}
      >
        {reactions.map((reaction, index) => (
          <Animated.View
            key={`${reaction.emoji}-${index}`}
            entering={ZoomIn.delay(index * 50).duration(300)}
          >
            <TouchableOpacity
              onPress={() => onReactionPress(reaction.emoji)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: currentUserId && reaction.users.includes(currentUserId)
                  ? theme.colors.primary + '20'
                  : theme.colors.surface,
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: currentUserId && reaction.users.includes(currentUserId)
                  ? theme.colors.primary + '40'
                  : theme.colors.border,
              }}
            >
              <Text style={{ fontSize: 14, marginRight: 4 }}>
                {reaction.emoji}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: currentUserId && reaction.users.includes(currentUserId)
                    ? theme.colors.primary
                    : theme.colors.text.secondary,
                }}
              >
                {reaction.count}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );
};