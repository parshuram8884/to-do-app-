import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { GoalContext } from "../context/GoalContext";

export default function GoalItem({ goal, onComplete, onRemove }) {
  const [timeLeft, setTimeLeft] = useState("");
  const { addToIncomplete, completeGoal } = useContext(GoalContext);
  const [expanded, setExpanded] = useState(false);

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

  // Calculate time progress
  const now = new Date();
  const startTime = goal.startTime ? new Date(goal.startTime) : now;
  const dueDate = new Date(goal.dueDate);
  const totalDuration = dueDate - startTime;
  const timeElapsed = now - startTime;
  const timeLeftMs = dueDate - now;
  const progress = Math.min(100, Math.max(0, (timeElapsed / totalDuration) * 100));
  
  const getProgressColor = () => {
    if (progress >= 90) return '#dc3545'; // Red for urgent
    if (progress >= 75) return '#ffc107'; // Yellow for warning
    return '#4CAF50'; // Green for good
  };

  const formatTimeLeft = () => {
    if (timeLeftMs < 0) return 'Overdue';
    const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  };

  const getSubGoalProgress = () => {
    if (!goal.subGoals || goal.subGoals.length === 0) return 0;
    const completed = goal.subGoals.filter(sg => sg.completed).length;
    return (completed / goal.subGoals.length) * 100;
  };

  // Determine if we should show the complete button (only if no subgoals exist)
  const showCompleteButton = !goal.subGoals || goal.subGoals.length === 0;

  return (
    <View style={styles.goalItem}>
      <View style={styles.header}>
        <Text style={styles.title}>{goal.title}</Text>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: getProgressColor() }]}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.toggleText}>{expanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: getProgressColor() }]} />
        <Text style={styles.progressText}>{Math.round(progress)}% Time Used</Text>
      </View>

      {goal.subGoals && goal.subGoals.length > 0 && (
        <View style={styles.subGoalProgress}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${getSubGoalProgress()}%`, backgroundColor: '#4682B4' }
            ]} 
          />
          <Text style={styles.progressText}>
            {Math.round(getSubGoalProgress())}% Sub-goals Complete
          </Text>
        </View>
      )}

      {expanded && (
        <View style={styles.details}>
          <Text style={styles.timeInfo}>
            Start: {startTime.toLocaleString()}
          </Text>
          <Text style={styles.timeInfo}>
            Due: {dueDate.toLocaleString()} ({formatTimeLeft()})
          </Text>
        </View>
      )}

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
  infoText: { fontSize: 12, color: "gray", fontStyle: "italic", marginTop: 5 },
  goalItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
  },
  toggleButton: {
    padding: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  subGoalProgress: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    position: 'absolute',
    left: 0,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#000',
    fontSize: 12,
    lineHeight: 20,
  },
  details: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  timeInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});