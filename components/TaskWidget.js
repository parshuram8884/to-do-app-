import { Widget } from 'expo-widgets';
import { View, Text, Image, Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export const TaskWidget = () => {
  const [widgetData, setWidgetData] = useState({
    tasks: [],
    stats: { completed: 0, total: 0 }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const goals = await AsyncStorage.getItem('goals');
        const completedTasks = await AsyncStorage.getItem('completedTasks');
        
        if (goals) {
          const parsedGoals = JSON.parse(goals);
          const parsedCompleted = completedTasks ? JSON.parse(completedTasks) : [];
          
          // Sort goals by due date and urgency
          const upcomingTasks = parsedGoals
            .filter(goal => !goal.completed)
            .sort((a, b) => {
              const timeA = new Date(a.dueDate) - new Date();
              const timeB = new Date(b.dueDate) - new Date();
              // Prioritize tasks due soon
              if (timeA < 24 * 60 * 60 * 1000 && timeB >= 24 * 60 * 60 * 1000) return -1;
              if (timeB < 24 * 60 * 60 * 1000 && timeA >= 24 * 60 * 60 * 1000) return 1;
              return new Date(a.dueDate) - new Date(b.dueDate);
            })
            .slice(0, 3);
          
          setWidgetData({
            tasks: upcomingTasks,
            stats: {
              completed: parsedCompleted.length,
              total: parsedGoals.length + parsedCompleted.length
            }
          });
        }
      } catch (error) {
        console.error('Error loading widget data:', error);
      }
    };

    loadData();
    // Set up periodic refresh
    const refreshInterval = setInterval(loadData, 300000); // Refresh every 5 minutes
    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <Widget
      size={{ width: 320, height: 200 }}
      defaultSize={{ width: 320, height: 200 }}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={require('../assets/icons.png')} 
            style={styles.icon}
            resizeMode="contain" 
          />
          <Text style={styles.title}>
            Tasks ({widgetData.stats.completed}/{widgetData.stats.total})
          </Text>
        </View>
        
        <View style={styles.content}>
          {widgetData.tasks.map(task => (
            <View key={task.id}>
              <View style={styles.task}>
                <Ionicons 
                  name={getDueIcon(task.dueDate)} 
                  size={16} 
                  color={getDueColor(task.dueDate)} 
                />
                <Text style={[
                  styles.taskText,
                  { color: getDueColor(task.dueDate) }
                ]} numberOfLines={1}>
                  {task.title} ({formatTimeLeft(task.dueDate)})
                </Text>
              </View>
              
              {task.subGoals && task.subGoals.length > 0 && (
                <View style={styles.subGoalsContainer}>
                  {task.subGoals
                    .filter(sg => !sg.completed)
                    .slice(0, 2)
                    .map(subGoal => (
                      <View key={subGoal.id} style={styles.subGoalTask}>
                        <Ionicons 
                          name={getDueIcon(subGoal.dueDate, true)} 
                          size={12} 
                          color={getDueColor(subGoal.dueDate)} 
                        />
                        <Text style={[
                          styles.subGoalText,
                          { color: getDueColor(subGoal.dueDate) }
                        ]} numberOfLines={1}>
                          {subGoal.title}
                        </Text>
                      </View>
                  ))}
                </View>
              )}
            </View>
          ))}
          
          {widgetData.tasks.length === 0 && (
            <Text style={styles.emptyText}>All tasks completed! 🎉</Text>
          )}
        </View>
      </View>
    </Widget>
  );
};

function getDueIcon(dueDate, isSubGoal = false) {
  const timeLeft = new Date(dueDate) - new Date();
  if (timeLeft < 0) return isSubGoal ? 'alert-circle' : 'alert';
  if (timeLeft < 24 * 60 * 60 * 1000) return isSubGoal ? 'time' : 'time-sharp';
  return isSubGoal ? 'ellipse-outline' : 'checkbox-outline';
}

function getDueColor(dueDate) {
  const timeLeft = new Date(dueDate) - new Date();
  if (timeLeft < 0) return '#dc3545';
  if (timeLeft < 24 * 60 * 60 * 1000) return '#ffc107';
  return '#4682B4';
}

function formatTimeLeft(dueDate) {
  const diff = new Date(dueDate) - new Date();
  if (diff < 0) return 'Overdue';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) {
    return `${hours}h left`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days}d left`;
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 8,
    backgroundColor: '#4682B4',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: Platform.OS === 'android' ? 12 : 0,
    borderTopRightRadius: Platform.OS === 'android' ? 12 : 0,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    padding: 8,
    flex: 1,
  },
  task: {
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 6,
    borderRadius: 4,
  },
  taskText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  subGoalsContainer: {
    marginLeft: 24,
    marginTop: 2,
  },
  subGoalTask: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    backgroundColor: '#f8f9fa',
    padding: 4,
    borderRadius: 4,
  },
  subGoalText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
};