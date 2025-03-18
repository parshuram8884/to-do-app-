import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { GoalContext } from '../context/GoalContext';
import PerformanceChart from '../components/PerformanceChart';

const Performance = () => {
  const { getPerformanceStats, goals, completedTasks, incompleteTasks } = useContext(GoalContext);
  const stats = getPerformanceStats();

  // Calculate time-based statistics
  const calculateTimeStats = () => {
    const now = new Date();
    const timeStats = {
      onTime: 0,
      late: 0,
      atRisk: 0,
      totalTime: 0,
      remainingTime: 0,
      averageCompletion: 0,
    };

    // Process active goals
    goals.forEach(goal => {
      const startTime = goal.startTime ? new Date(goal.startTime) : new Date();
      const dueDate = new Date(goal.dueDate);
      const totalDuration = dueDate - startTime;
      const timeLeft = dueDate - now;
      const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

      timeStats.totalTime += totalDuration;
      timeStats.remainingTime += Math.max(0, timeLeft);

      if (timeLeft < 0) {
        timeStats.late++;
      } else if (progress > 75) {
        timeStats.atRisk++;
      } else {
        timeStats.onTime++;
      }

      // Process sub-goals
      if (goal.subGoals) {
        goal.subGoals.forEach(subGoal => {
          const subStart = subGoal.startTime ? new Date(subGoal.startTime) : startTime;
          const subDue = new Date(subGoal.dueDate);
          timeStats.totalTime += subDue - subStart;
          if (subGoal.completed) {
            timeStats.averageCompletion++;
          }
        });
      }
    });

    // Process completed tasks for average completion time
    completedTasks.forEach(task => {
      if (task.completedDate) {
        const startTime = task.startTime ? new Date(task.startTime) : new Date(task.dueDate);
        const completionTime = new Date(task.completedDate) - startTime;
        timeStats.averageCompletion += completionTime;
      }
    });

    // Calculate average completion time
    const totalCompleted = completedTasks.length;
    if (totalCompleted > 0) {
      timeStats.averageCompletion = timeStats.averageCompletion / totalCompleted;
    }

    return timeStats;
  };

  const timeStats = calculateTimeStats();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Task Performance Analytics</Text>
      
      <PerformanceChart timeStats={timeStats} goals={[...goals, ...completedTasks]} />
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.completedValue]}>
            {stats.completed}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.incompleteValue]}>
            {stats.incomplete}
          </Text>
          <Text style={styles.statLabel}>Incomplete</Text>
        </View>
      </View>
      
      <View style={styles.performanceContainer}>
        <Text style={styles.performanceLabel}>Overall Completion Rate</Text>
        <Text style={styles.performanceValue}>{stats.performance}%</Text>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar,
              { width: `${Math.min(100, Math.max(0, parseFloat(stats.performance)))}%` }
            ]} 
          />
        </View>
      </View>

      <View style={styles.timeAnalyticsContainer}>
        <Text style={styles.sectionTitle}>Time Analytics</Text>
        
        <View style={styles.timeStatsGrid}>
          <View style={styles.timeStatBox}>
            <Text style={styles.timeStatValue}>{timeStats.onTime}</Text>
            <Text style={styles.timeStatLabel}>On Track</Text>
          </View>
          
          <View style={styles.timeStatBox}>
            <Text style={[styles.timeStatValue, styles.warningText]}>{timeStats.atRisk}</Text>
            <Text style={styles.timeStatLabel}>At Risk</Text>
          </View>
          
          <View style={styles.timeStatBox}>
            <Text style={[styles.timeStatValue, styles.errorText]}>{timeStats.late}</Text>
            <Text style={styles.timeStatLabel}>Overdue</Text>
          </View>
        </View>

        <View style={styles.timeAnalyticRow}>
          <Text style={styles.analyticsLabel}>Average Completion Time:</Text>
          <Text style={styles.analyticsValue}>
            {Math.round(timeStats.averageCompletion / (1000 * 60 * 60))}h
          </Text>
        </View>

        <View style={styles.timeAnalyticRow}>
          <Text style={styles.analyticsLabel}>Total Time Allocated:</Text>
          <Text style={styles.analyticsValue}>
            {Math.round(timeStats.totalTime / (1000 * 60 * 60))}h
          </Text>
        </View>

        <View style={styles.timeAnalyticRow}>
          <Text style={styles.analyticsLabel}>Remaining Time:</Text>
          <Text style={styles.analyticsValue}>
            {Math.round(timeStats.remainingTime / (1000 * 60 * 60))}h
          </Text>
        </View>
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Performance Insights:</Text>
        <Text style={styles.tipText}>• {timeStats.atRisk > 0 ? `${timeStats.atRisk} tasks need attention soon` : 'All tasks are on track'}</Text>
        <Text style={styles.tipText}>• {timeStats.late > 0 ? `${timeStats.late} tasks are overdue` : 'No overdue tasks'}</Text>
        <Text style={styles.tipText}>• {stats.performance >= 75 ? 'Great progress!' : 'Keep working on your goals'}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold'
  },
  completedValue: {
    color: '#4CAF50'
  },
  incompleteValue: {
    color: '#dc3545'
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  performanceContainer: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24
  },
  performanceLabel: {
    fontSize: 16,
    fontWeight: '500'
  },
  performanceValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 8
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 8
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50'
  },
  timeAnalyticsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16
  },
  timeStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  timeStatBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  timeStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  timeStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  warningText: {
    color: '#ffc107'
  },
  errorText: {
    color: '#dc3545'
  },
  timeAnalyticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  analyticsLabel: {
    fontSize: 14,
    color: '#666'
  },
  analyticsValue: {
    fontSize: 16,
    fontWeight: '500'
  },
  tipsContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2e7d32'
  },
  tipText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#1b5e20'
  }
});

export default Performance;