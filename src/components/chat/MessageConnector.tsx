import React from 'react';
import { Text, View } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import type { Message } from '../../types/chat';

interface MessageConnectorProps {
  fromMessageId: string;
  toMessageId: string;
  messages: Message[];
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const MessageConnector: React.FC<MessageConnectorProps> = ({
  fromMessageId,
  toMessageId,
  messages,
}) => {
  const fromMessage = messages.find(m => m.id === fromMessageId);
  const toMessage = messages.find(m => m.id === toMessageId);

  const animationValue = useSharedValue(0);

  React.useEffect(() => {
    animationValue.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      false,
    );
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const dashOffset = 20 - animationValue.value * 20;
    return {
      strokeDashoffset: dashOffset,
    };
  });

  if (!fromMessage || !toMessage) return null;

  // Different connector styles based on message relationship
  const getConnectorStyle = () => {
    const isDirectReply = toMessage.replies.some(r => r.id === fromMessageId);
    const isSameSender = fromMessage.sender.id === toMessage.sender.id;

    if (isDirectReply) {
      return {
        color: '#10B981', // Green for direct replies
        strokeWidth: 2.5,
        opacity: 0.8,
      };
    } else if (isSameSender) {
      return {
        color: '#3B82F6', // Blue for same sender
        strokeWidth: 2,
        opacity: 0.6,
      };
    } else {
      return {
        color: '#8B5CF6', // Purple for topic continuation
        strokeWidth: 1.5,
        opacity: 0.5,
      };
    }
  };

  const style = getConnectorStyle();

  return (
    <View
      className="absolute left-4 -top-3 z-10"
      style={{ width: 60, height: 40 }}
    >
      <Svg height="40" width="60" viewBox="0 0 60 40">
        <Defs>
          <LinearGradient
            id="connectorGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop
              offset="0%"
              stopColor={style.color}
              stopOpacity={style.opacity}
            />
            <Stop
              offset="100%"
              stopColor={style.color}
              stopOpacity={style.opacity * 0.3}
            />
          </LinearGradient>
        </Defs>

        {/* Connection line with animation */}
        <AnimatedPath
          animatedProps={animatedProps}
          d="M 10 35 Q 25 20 50 5"
          stroke="url(#connectorGradient)"
          strokeWidth={style.strokeWidth}
          fill="none"
          strokeDasharray="4,4"
          strokeLinecap="round"
        />

        {/* Start dot */}
        <Circle
          cx="10"
          cy="35"
          r="3"
          fill={style.color}
          opacity={style.opacity}
        />

        {/* End arrow */}
        <Path
          d="M 45 8 L 50 5 L 47 2"
          stroke={style.color}
          strokeWidth={style.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={style.opacity}
        />
      </Svg>

      {/* Connection type indicator */}
      <View
        className={`absolute top-2 right-2 px-2 py-1 rounded-full ${
          style.color === '#10B981'
            ? 'bg-green-100'
            : style.color === '#3B82F6'
              ? 'bg-blue-100'
              : 'bg-purple-100'
        }`}
        style={{ transform: [{ scale: 0.8 }] }}
      >
        <Text
          className={`text-xs font-medium ${
            style.color === '#10B981'
              ? 'text-green-600'
              : style.color === '#3B82F6'
                ? 'text-blue-600'
                : 'text-purple-600'
          }`}
        >
          {style.color === '#10B981'
            ? '↳'
            : style.color === '#3B82F6'
              ? '→'
              : '∿'}
        </Text>
      </View>
    </View>
  );
};
