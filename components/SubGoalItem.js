import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { Button } from "react-native";
import { GoalContext } from "../context/GoalContext";

export default function SubGoalItem({ subGoal, goalId }) {
  const { completeSubGoal, markSubGoalExpired } = useContext(GoalContext);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const difference = new Date(subGoal.dueDate) - now;
      
      // Check if subgoal time expired and not already completed
      if (difference <= 0 && !subGoal.completed) {
        setTimeLeft("Expired");
        // Call new function to handle subgoal expiration
        markSubGoalExpired(goalId, subGoal.id);
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
  }, [subGoal.dueDate, subGoal.completed, goalId, subGoal.id, markSubGoalExpired]);

  return (
    <View style={styles.container}>
      <View style={styles.goalRow}>
        <Switch
          value={subGoal.completed}
          onValueChange={() => completeSubGoal(goalId, subGoal.id)}
        />
        <Text style={[styles.goalText, subGoal.completed && styles.completed]}>
          {subGoal.title}
        </Text>
      </View>
      <Text style={[styles.goalTime, timeLeft === "Expired" && styles.expired]}>
        Time Left: {timeLeft}
      </Text>
      <Button 
        title="Complete" 
        onPress={() => completeSubGoal(goalId, subGoal.id)} 
        disabled={subGoal.completed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 10, 
    borderWidth: 1, 
    marginBottom: 5, 
    borderRadius: 5,
    marginLeft: 15,  // Indent to show hierarchy
  },
  goalRow: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  goalText: { 
    fontSize: 14, 
    fontWeight: "500", 
    marginLeft: 10 
  },
  completed: { 
    textDecorationLine: "line-through", 
    color: "gray" 
  },
  goalTime: { 
    fontSize: 12, 
    color: "red" 
  },
  expired: {
    color: "darkred",
    fontWeight: "bold"
  }
});