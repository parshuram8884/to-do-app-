import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Switch
} from "react-native";
import { GoalContext } from '../context/GoalContext';

const CompletedTasks = () => {
    const { completedTasks } = useContext(GoalContext); 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completed Tasks</Text>
      {completedTasks.length === 0 ? (
        <Text style={styles.emptyText}>No completed tasks yet</Text>
      ) : (
        <FlatList
          data={completedTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskDate}>
                Completed on: {new Date(item.completedDate).toLocaleDateString()}
              </Text>
              
              {item.subGoals && item.subGoals.length > 0 && (
                <View style={styles.subGoalsContainer}>
                  <Text style={styles.subGoalsTitle}>Sub-Goals:</Text>
                  {item.subGoals.map(subGoal => (
                    <View key={subGoal.id} style={styles.subGoalItem}>
                      <Switch value={subGoal.completed} disabled={true} />
                      <Text 
                        style={[
                          styles.subGoalText,
                          subGoal.completed ? styles.completedText : styles.incompleteText
                        ]}
                      >
                        • {subGoal.title}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: 'gray'
  },
  taskItem: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  taskDate: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4
  },
  subGoalsContainer: {
    marginTop: 12
  },
  subGoalsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6
  },
  subGoalText: {
    fontSize: 14,
    marginLeft: 12,
    marginBottom: 4
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray'
  }
});

export default CompletedTasks;