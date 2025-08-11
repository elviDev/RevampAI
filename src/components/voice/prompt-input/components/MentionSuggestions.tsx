import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { MentionUser } from '../types';

interface MentionSuggestionsProps {
  visible: boolean;
  users: MentionUser[];
  onSelectUser: (user: MentionUser) => void;
}

export const MentionSuggestions: React.FC<MentionSuggestionsProps> = ({
  visible,
  users,
  onSelectUser,
}) => {
  const { theme } = useTheme();

  if (!visible || users.length === 0) {
    return null;
  }

  return (
    <View style={{
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 16,
      shadowColor: theme.colors.shadows.neutral,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
      maxHeight: 200,
    }}>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onSelectUser(item)}
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{
              width: 36,
              height: 36,
              backgroundColor: theme.colors.primary + '20',
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Text style={{
                color: theme.colors.primary,
                fontWeight: '700',
                fontSize: 16,
              }}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: theme.colors.text.primary,
                fontWeight: '600',
                fontSize: 16,
              }}>
                {item.name}
              </Text>
              <Text style={{
                color: theme.colors.text.secondary,
                fontSize: 14,
              }}>
                @{item.username}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};