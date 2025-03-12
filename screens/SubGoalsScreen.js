import React, { useContext, useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";
import { GoalContext } from "../context/GoalContext";

export default function SubGoalsScreen({ route }) {
  const { goalId } = route.params;
  const { goals, addSubGoal } = useContext(GoalContext);
  const [subGoalText, setSubGoalText] = useState("");

  const goal = goals.find(g => g.id === goalId);
  if (!goal) return <Text>Goal not found</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SubGoals for {goal.title}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter SubGoal"
        value={subGoalText}
        onChangeText={setSubGoalText}
      />
      <Button title="Add SubGoal" onPress={() => { addSubGoal(goalId, { title: subGoalText }); setSubGoalText(""); }} />
      <FlatList
        data={goal.subGoals}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.subGoalItem}>
            <Text>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, padding: 8, marginBottom: 10 },
  subGoalItem: { padding: 10, borderWidth: 1, marginTop: 5 }
});
