import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { GoalContext } from "../context/GoalContext";

export default function SubGoalItem({ subGoal, goalId, parentStartTime, parentDueDate }) {
  const { completeSubGoal, markSubGoalExpired } = useContext(GoalContext);
  const [expanded, setExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // Calculate time progress
  const now = new Date();
  const startTime = subGoal.startTime ? new Date(subGoal.startTime) : 
                   parentStartTime ? new Date(parentStartTime) : now;
  const dueDate = new Date(subGoal.dueDate);
  const totalDuration = dueDate - startTime;
  const timeElapsed = now - startTime;
  const timeLeftMs = dueDate - now;
  const parentDeadline = parentDueDate ? new Date(parentDueDate) : null;
  const progress = Math.min(100, Math.max(0, (timeElapsed / totalDuration) * 100));

  useEffect(() => {
    function updateCountdown() {
      const difference = new Date(subGoal.dueDate) - new Date();
      
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

  const getProgressColor = () => {
    if (subGoal.completed) return '#4CAF50';
    if (progress >= 90) return '#dc3545';
    if (progress >= 75) return '#ffc107';
    return '#4682B4';
  };

  const formatTimeLeft = () => {
    if (timeLeftMs < 0) return 'Overdue';
    const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  };

  const getTimeWarning = () => {
    if (!parentDeadline) return null;
    if (dueDate > parentDeadline) {
      return "⚠️ Due after parent goal";
    }
    return null;
  };

  return (
    <View style={styles.subGoalItem}>
      <View style={styles.header}>
        <Switch
          value={subGoal.completed}
          onValueChange={() => completeSubGoal(goalId, subGoal.id)}
          style={styles.switch}
        />
        <Text style={[
          styles.title,
          subGoal.completed && styles.completedText
        ]}>
          {subGoal.title}
        </Text>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: getProgressColor() }]}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.toggleText}>{expanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={[
          styles.progressBar, 
          { width: `${progress}%`, backgroundColor: getProgressColor() }
        ]} />
        <Text style={styles.progressText}>
          {Math.round(progress)}% Time Used
        </Text>
      </View>

      {expanded && (
        <View style={styles.details}>
          <Text style={styles.timeInfo}>
            Start: {startTime.toLocaleString()}
          </Text>
          <Text style={styles.timeInfo}>
            Due: {dueDate.toLocaleString()} ({formatTimeLeft()})
          </Text>
          {getTimeWarning() && (
            <Text style={styles.warning}>{getTimeWarning()}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  subGoalItem: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    marginVertical: 4,
    marginLeft: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  switch: {
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
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
    height: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
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
    fontSize: 10,
    lineHeight: 16,
  },
  details: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  timeInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  warning: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
});