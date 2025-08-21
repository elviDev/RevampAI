import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import Animated, { 
  FadeInUp, 
  useAnimatedStyle, 
  useSharedValue,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { TaskComment } from '../../types/task.types';

interface TaskCommentsCardProps {
  comments: TaskComment[];
  newComment: string;
  onNewCommentChange: (text: string) => void;
  onAddComment: () => void;
  formatTimeAgo: (date: Date) => string;
  commentInputScale?: any;
}

export const TaskCommentsCard: React.FC<TaskCommentsCardProps> = ({
  comments,
  newComment,
  onNewCommentChange,
  onAddComment,
  formatTimeAgo,
  commentInputScale,
}) => {
  const animatedCommentInputStyle = useAnimatedStyle(() => ({
    transform: commentInputScale ? [{ scale: commentInputScale.value }] : [],
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(600).duration(600)}
      className="bg-white mx-6 mt-4 rounded-2xl p-6"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <Text className="text-lg font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </Text>

      <View className="space-y-4 mb-6">
        {comments.map((comment, index) => (
          <Animated.View
            key={comment.id}
            entering={FadeInUp.delay(index * 150).duration(400)}
            className="flex-row"
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              className="w-10 h-10 rounded-full items-center justify-center mr-3 mt-0.5"
            >
              <Text className="text-white text-sm font-bold">
                {comment.author.avatar}
              </Text>
            </LinearGradient>

            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="font-semibold text-gray-900 mr-2">
                  {comment.author.name}
                </Text>
                <Text className="text-xs text-gray-500">
                  {formatTimeAgo(comment.timestamp)}
                </Text>
              </View>
              <Text className="text-gray-700 leading-relaxed">
                {comment.content}
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>

      {/* Add Comment Input */}
      <Animated.View
        style={animatedCommentInputStyle}
        className="flex-row items-center bg-gray-50 rounded-xl p-3 border border-gray-200"
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          className="w-9 h-9 rounded-full items-center justify-center mr-3"
        >
          <Text className="text-white text-sm font-bold">Y</Text>
        </LinearGradient>

        <TextInput
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={onNewCommentChange}
          className="flex-1 text-gray-900 text-base"
          placeholderTextColor="#9CA3AF"
          multiline
          style={{ minHeight: 20, maxHeight: 100 }}
        />

        {newComment.trim() && (
          <TouchableOpacity
            onPress={onAddComment}
            className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center ml-2"
          >
            <MaterialIcon name="send" size={16} color="white" />
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
};