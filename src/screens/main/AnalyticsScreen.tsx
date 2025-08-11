import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInLeft,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuickActions } from '../../contexts/QuickActionsContext';
import { NavigationService } from '../../services/NavigationService';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface MetricCard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
  color: string;
}

const PRODUCTIVITY_DATA: ChartData[] = [
  { label: 'Mon', value: 85, color: '#6366F1' },
  { label: 'Tue', value: 92, color: '#8B5CF6' },
  { label: 'Wed', value: 78, color: '#EC4899' },
  { label: 'Thu', value: 96, color: '#F59E0B' },
  { label: 'Fri', value: 88, color: '#10B981' },
  { label: 'Sat', value: 45, color: '#EF4444' },
  { label: 'Sun', value: 32, color: '#6B7280' },
];

const METRICS: MetricCard[] = [
  {
    title: 'Tasks Completed',
    value: '142',
    change: '+12%',
    isPositive: true,
    icon: 'check-circle',
    color: '#10B981',
  },
  {
    title: 'Productivity Score',
    value: '94%',
    change: '+8%',
    isPositive: true,
    icon: 'trending-up',
    color: '#6366F1',
  },
  {
    title: 'Active Projects',
    value: '8',
    change: '+2',
    isPositive: true,
    icon: 'folder',
    color: '#F59E0B',
  },
  {
    title: 'Team Efficiency',
    value: '87%',
    change: '-3%',
    isPositive: false,
    icon: 'users',
    color: '#EF4444',
  },
];

const MetricCardComponent: React.FC<{
  metric: MetricCard;
  index: number;
  onPress: (metric: MetricCard) => void;
}> = ({ metric, index, onPress }) => {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      style={{
        flex: 1,
        marginHorizontal: 8,
      }}
    >
      <TouchableOpacity
        onPress={() => onPress(metric)}
        activeOpacity={0.8}
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadows.neutral,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: metric.color + '20',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={metric.icon} size={22} color={metric.color} />
          </View>

          <View
            style={{
              backgroundColor: metric.isPositive
                ? theme.colors.success + '20'
                : theme.colors.error + '20',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: metric.isPositive
                  ? theme.colors.success
                  : theme.colors.error,
              }}
            >
              {metric.change}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: theme.colors.text.primary,
            marginBottom: 4,
          }}
        >
          {metric.value}
        </Text>

        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.text.secondary,
          }}
        >
          {metric.title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const BarChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
  const { theme } = useTheme();
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Animated.View
      entering={FadeInUp.delay(300)}
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.shadows.neutral,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: theme.colors.text.primary,
          marginBottom: 20,
        }}
      >
        Weekly Productivity
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height: 120,
          marginBottom: 16,
        }}
      >
        {data.map((item, index) => (
          <View key={item.label} style={{ alignItems: 'center', flex: 1 }}>
            <Animated.View
              entering={FadeInUp.delay(400 + index * 50)}
              style={{
                width: 24,
                height: (item.value / maxValue) * 100,
                backgroundColor: item.color,
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: theme.colors.text.secondary,
              }}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const InsightCard: React.FC<{
  title: string;
  description: string;
  icon: string;
  color: string;
  index: number;
}> = ({ title, description, icon, color, index }) => {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInLeft.delay(600 + index * 100)}
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.shadows.neutral,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: color + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16,
        }}
      >
        <MaterialIcon name={icon} size={24} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.text.primary,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.text.secondary,
            lineHeight: 20,
          }}
        >
          {description}
        </Text>
      </View>
    </Animated.View>
  );
};

export const AnalyticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { showNotification } = useQuickActions();
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState<
    'week' | 'month' | 'year'
  >('week');

  const insights = [
    {
      title: 'Peak Performance',
      description:
        'Your highest productivity is on Thursdays. Consider scheduling important tasks then.',
      icon: 'trending-up',
      color: theme.colors.success,
    },
    {
      title: 'Task Completion Rate',
      description:
        'You complete 94% of your scheduled tasks. Excellent consistency!',
      icon: 'check-circle',
      color: theme.colors.primary,
    },
    {
      title: 'Collaboration Insight',
      description:
        'Team projects show 23% faster completion when you lead them.',
      icon: 'people',
      color: theme.colors.accent,
    },
  ];

  const handleMetricPress = (metric: MetricCard) => {
    switch (metric.title) {
      case 'Tasks Completed':
        NavigationService.navigateToTasks();
        showNotification('Viewing your completed tasks', 'info');
        break;
      case 'Active Projects':
        NavigationService.navigateToProjects();
        showNotification('Viewing your active projects', 'info');
        break;
      case 'Team Efficiency':
        NavigationService.navigateToActivity();
        showNotification('Viewing team activity feed', 'info');
        break;
      default:
        showNotification(`${metric.title}: ${metric.value}`, 'info');
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
      }}
    >
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(50)}
        style={{
          paddingHorizontal: 24,
          paddingVertical: 20,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: theme.colors.text.primary,
            }}
          >
            Analytics
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.surface,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadows.neutral,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.primary,
                textTransform: 'capitalize',
              }}
            >
              This {selectedPeriod}
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontSize: 16,
            color: theme.colors.text.secondary,
            marginBottom: 20,
          }}
        >
          Track your productivity and performance insights
        </Text>

        {/* Period Selector */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 4,
            borderWidth: 1,
            borderColor: theme.colors.border,
            marginBottom: 20,
          }}
        >
          {(['week', 'month', 'year'] as const).map(period => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor:
                  selectedPeriod === period
                    ? theme.colors.primary
                    : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color:
                    selectedPeriod === period
                      ? theme.colors.text.onPrimary
                      : theme.colors.text.secondary,
                  textTransform: 'capitalize',
                }}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 100,
        }}
      >
        {/* Metrics Grid */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: -8,
            marginBottom: 20,
          }}
        >
          {METRICS.map((metric, index) => (
            <View key={metric.title} style={{ width: '50%' }}>
              <MetricCardComponent
                metric={metric}
                index={index}
                onPress={handleMetricPress}
              />
            </View>
          ))}
        </View>

        {/* Chart */}
        <BarChart data={PRODUCTIVITY_DATA} />

        {/* AI Insights */}
        <Animated.View
          entering={FadeInDown.delay(500)}
          style={{ marginBottom: 20 }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: theme.colors.text.primary,
              marginBottom: 16,
            }}
          >
            AI Insights
          </Text>

          {insights.map((insight, index) => (
            <InsightCard
              key={insight.title}
              title={insight.title}
              description={insight.description}
              icon={insight.icon}
              color={insight.color}
              index={index}
            />
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
};
