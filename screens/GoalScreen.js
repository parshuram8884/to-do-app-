import React, { useContext, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";
import GoalInput from "../components/GoalInput.js";
import GoalItem from "../components/GoalItem.js";
import SubGoalInput from "../components/SubGoalInput.js";
import SubGoalItem from "../components/SubGoalItem.js";
import { GoalContext } from "../context/GoalContext";

export default function GoalsScreen() {
  const { goals, addGoal, addSubGoal, completeGoal, removeGoal } = useContext(GoalContext);
  const [expandedGoals, setExpandedGoals] = useState({});

  const toggleExpand = (goalId) => {
    setExpandedGoals(prev => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const handleAddSubGoal = (goalId, subGoal) => {
    // Show alert when adding a sub-goal
    Alert.alert(
      "Add Sub-Goal",
      "Adding sub-goals will make the main goal complete automatically when all sub-goals are completed.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Add Sub-Goal",
          onPress: () => addSubGoal(goalId, subGoal)
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={100}
      >
        <ScrollView>
          <Text style={styles.title}>My Goals</Text>
          <GoalInput onAddGoal={addGoal} />
          
          <FlatList
            data={goals}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.goalContainer}>
                <GoalItem 
                  goal={item} 
                  onComplete={completeGoal}
                  onRemove={removeGoal} 
                />
                
                <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                  <Text style={styles.toggleText}>
                    {expandedGoals[item.id] ? "Show Less" : "Show More"}
                  </Text>
                </TouchableOpacity>
                
                {expandedGoals[item.id] && (
                  <View>
                    <SubGoalInput onAddSubGoal={(subGoal) => handleAddSubGoal(item.id, subGoal)} />
                    <FlatList
                      data={item.subGoals || []}
                      keyExtractor={(sub, index) => index.toString()}
                      renderItem={({ item: sub }) => <SubGoalItem subGoal={sub} goalId={item.id} />}
                      nestedScrollEnabled={true}
                    />
                  </View>
                )}
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No goals added yet!</Text>}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: { 
    flex: 1, 
    padding: 20 
  },
  title: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 10 
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray'
  },
  goalContainer: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  toggleText: {
    color: "blue",
    textAlign: "right",
    marginTop: 5,
    fontSize: 14,
  }
});