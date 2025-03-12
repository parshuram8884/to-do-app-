import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, StyleSheet, Switch } from "react-native";
import { GoalContext } from "../context/GoalContext";

export default function GoalItem({ goal, onComplete, onRemove }) {
  const [timeLeft, setTimeLeft] = useState("");
  const { addToIncomplete, completeGoal } = useContext(GoalContext);

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const difference = new Date(goal.dueDate) - now;
      
      if (difference <= 0 && !goal.completed) {
        setTimeLeft("Expired");
        addToIncomplete(goal); // ✅ Move expired goal to incomplete
        completeGoal(goal.id); // ✅ Mark goal as incomplete
        
      } else {
        setTimeLeft(difference > 0 ? formatTime(difference) : "Expired");
      }
    }

    function formatTime(ms) {
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [goal, goal.dueDate, goal.completed, goal.id, addToIncomplete, completeGoal, onRemove]);

  // Determine if we should show the complete button (only if no subgoals exist)
  const showCompleteButton = !goal.subGoals || goal.subGoals.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.goalRow}>
        <Switch
          value={goal.completed}
          onValueChange={() => showCompleteButton && onComplete(goal.id)}
          disabled={!showCompleteButton}
        />
        <Text style={[styles.goalText, goal.completed && styles.completed]}>
          {goal.title}
        </Text>
      </View>
      <Text style={[styles.goalTime, timeLeft === "Expired" && styles.expired]}>
        Time Left: {timeLeft}
      </Text>
      {showCompleteButton && (
        <Button title="Complete" onPress={() => onComplete(goal.id)} />
      )}
      {!showCompleteButton && (
        <Text style={styles.infoText}>
          Complete all sub-goals to mark this goal as complete
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, borderWidth: 1, marginBottom: 5, borderRadius: 5 },
  goalRow: { flexDirection: "row", alignItems: "center" },
  goalText: { fontSize: 16, fontWeight: "bold", marginLeft: 10 },
  completed: { textDecorationLine: "line-through", color: "gray" },
  goalTime: { fontSize: 14, color: "red" },
  expired: { color: "darkred", fontWeight: "bold" },
  infoText: { fontSize: 12, color: "gray", fontStyle: "italic", marginTop: 5 }
});