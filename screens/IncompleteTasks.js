import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Switch
} from "react-native";
import { GoalContext } from '../context/GoalContext';

const IncompleteTasks = () => {
  const { incompleteTasks } = useContext(GoalContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expired/Incomplete Tasks</Text>
      <FlatList
        data={incompleteTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[
            styles.itemContainer, 
            item.hasIncompleteSubgoals && styles.incompleteSubgoalsContainer
          ]}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDate}>Due: {new Date(item.dueDate).toLocaleString()}</Text>
            
            {/* Show a specific message if this task has incomplete subgoals */}
            {item.hasIncompleteSubgoals && (
              <Text style={styles.incompleteSubgoalsText}>
                ⚠️ This goal has incomplete sub-goals
              </Text>
            )}
            
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
            
            {/* Add when this task became incomplete */}
            {item.expiredDate && (
              <Text style={styles.expiredText}>
                Expired on: {new Date(item.expiredDate).toLocaleString()}
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No expired tasks yet!</Text>}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  itemContainer: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: '#fff8f8'
  },
  incompleteSubgoalsContainer: {
    backgroundColor: '#fff0f0',
    borderColor: '#ffcccc'
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500'
  },
  itemDate: {
    fontSize: 14,
    color: 'red',
    marginTop: 5
  },
  expiredText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic'
  },
  incompleteSubgoalsText: {
    color: '#d9534f',
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 14
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray'
  },
  subGoalsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  subGoalsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5
  },
  subGoalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3
  },
  subGoalText: {
    fontSize: 14,
    marginLeft: 8
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray'
  },
  incompleteText: {
    color: '#d9534f'
  }
});

export default IncompleteTasks;