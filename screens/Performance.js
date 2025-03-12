import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { GoalContext } from '../context/GoalContext';

const Performance = () => {
  const { getPerformanceStats, goals, completedTasks, incompleteTasks } = useContext(GoalContext);
  const stats = getPerformanceStats();

  // Count completed and incomplete subgoals
  let totalSubGoals = 0;
  let completedSubGoals = 0;
  
  // Count subgoals in active goals
  goals.forEach(goal => {
    totalSubGoals += goal.subGoals.length;
    completedSubGoals += goal.subGoals.filter(sub => sub.completed).length;
  });
  
  // Count subgoals in completed tasks
  completedTasks.forEach(task => {
    if (task.subGoals && task.subGoals.length > 0) {
      totalSubGoals += task.subGoals.length;
      completedSubGoals += task.subGoals.filter(sub => sub.completed).length;
    }
  });
  
  // Count subgoals in incomplete tasks
  incompleteTasks.forEach(task => {
    if (task.subGoals && task.subGoals.length > 0) {
      totalSubGoals += task.subGoals.length;
      completedSubGoals += task.subGoals.filter(sub => sub.completed).length;
    }
  });

  const incompleteSubGoals = totalSubGoals - completedSubGoals;
  
  // Main tasks stats
  const mainTasksTotal = stats.total;
  const mainTasksCompleted = stats.completed;
  const mainTasksIncomplete = stats.incomplete;
  
  // Combined stats
  const totalTasks = mainTasksTotal + totalSubGoals;
  const completedTasks_all = mainTasksCompleted + completedSubGoals;
  const incompleteTasks_all = mainTasksIncomplete + incompleteSubGoals;
  const performance = totalTasks > 0 ? ((completedTasks_all / totalTasks) * 100).toFixed(2) : 0;
  
  // Calculate sub-goal completion rate
  const subGoalPerformance = totalSubGoals > 0 ? ((completedSubGoals / totalSubGoals) * 100).toFixed(2) : 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Task Performance</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalTasks}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.completedValue]}>
            {completedTasks_all}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.incompleteValue]}>
            {incompleteTasks_all}
          </Text>
          <Text style={styles.statLabel}>Incomplete</Text>
        </View>
      </View>
      
      <View style={styles.performanceContainer}>
        <Text style={styles.performanceLabel}>Overall Completion Rate:</Text>
        <Text style={styles.performanceValue}>{performance}%</Text>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar,
              { width: `${Math.min(100, Math.max(0, parseFloat(performance)))}%` }
            ]} 
          />
        </View>
      </View>
      
      {/* New section for detailed statistics */}
      <View style={styles.detailedStatsContainer}>
        <Text style={styles.detailedStatsTitle}>Detailed Statistics</Text>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Main Goals:</Text>
          <Text style={styles.statsValue}>
            {mainTasksCompleted}/{mainTasksTotal} ({mainTasksTotal > 0 ? ((mainTasksCompleted/mainTasksTotal)*100).toFixed(1) : 0}%)
          </Text>
        </View>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Sub-Goals:</Text>
          <Text style={styles.statsValue}>
            {completedSubGoals}/{totalSubGoals} ({subGoalPerformance}%)
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar,
              { width: `${Math.min(100, Math.max(0, parseFloat(subGoalPerformance)))}%` }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Performance Tips:</Text>
        <Text style={styles.tipText}>• Break large tasks into smaller sub-goals</Text>
        <Text style={styles.tipText}>• Set realistic deadlines</Text>
        <Text style={styles.tipText}>• Complete tasks before they expire</Text>
        <Text style={styles.tipText}>• Main goals complete automatically when all sub-goals are done</Text>
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
    color: 'green'
  },
  incompleteValue: {
    color: 'red'
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
  detailedStatsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24
  },
  detailedStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  statsLabel: {
    fontSize: 16,
    color: '#333'
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '500'
  },
  tipsContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  tipText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333'
  }
});

export default Performance;