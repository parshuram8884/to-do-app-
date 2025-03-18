import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

const PerformanceChart = ({ timeStats, goals }) => {
  // Calculate time distribution data
  const getTimeDistributionData = () => {
    const data = {
      onTime: 0,
      atRisk: 0,
      late: 0,
      completed: 0,
    };

    goals.forEach(goal => {
      const now = new Date();
      const startTime = goal.startTime ? new Date(goal.startTime) : now;
      const dueDate = new Date(goal.dueDate);
      const totalDuration = dueDate - startTime;
      const timeLeft = dueDate - now;
      const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

      if (goal.completed) {
        data.completed++;
      } else if (timeLeft < 0) {
        data.late++;
      } else if (progress > 75) {
        data.atRisk++;
      } else {
        data.onTime++;
      }
    });

    return data;
  };

  const timeDistribution = getTimeDistributionData();

  const barData = {
    labels: ['On Time', 'At Risk', 'Late', 'Done'],
    datasets: [
      {
        data: [
          timeDistribution.onTime,
          timeDistribution.atRisk,
          timeDistribution.late,
          timeDistribution.completed,
        ],
      },
    ],
  };

  // Calculate completion trend over time
  const getCompletionTrend = () => {
    const now = new Date();
    const past7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return past7Days.map(date => {
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      return goals.filter(goal => {
        const completionDate = goal.completedDate ? new Date(goal.completedDate) : null;
        return completionDate && completionDate >= dayStart && completionDate <= dayEnd;
      }).length;
    });
  };

  const completionTrend = getCompletionTrend();
  const getDayLabel = (index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const lineData = {
    labels: Array.from({ length: 7 }, (_, i) => getDayLabel(i)),
    datasets: [
      {
        data: completionTrend,
        color: (opacity = 1) => `rgba(70, 130, 180, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(70, 130, 180, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4682B4',
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Distribution</Text>
      <BarChart
        data={barData}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        showValuesOnTopOfBars
      />

      <Text style={styles.title}>Completion Trend</Text>
      <LineChart
        data={lineData}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        bezier
      />

      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#4682B4' }]} />
          <Text style={styles.legendText}>On Time: {timeDistribution.onTime}</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#ffc107' }]} />
          <Text style={styles.legendText}>At Risk: {timeDistribution.atRisk}</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#dc3545' }]} />
          <Text style={styles.legendText}>Late: {timeDistribution.late}</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Completed: {timeDistribution.completed}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
});

export default PerformanceChart;
