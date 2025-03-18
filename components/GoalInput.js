import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { scheduleNotification } from "../utils/Notifications";

export default function GoalInput({ onAddGoal }) {
  const [goalText, setGoalText] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);

  const handleDueConfirm = (selectedDate) => {
    if (selectedDate) {
      if (selectedDate <= startTime) {
        Alert.alert(
          "Invalid Due Date",
          "Due date must be after start time",
          [{ text: "OK" }]
        );
        return;
      }
      setDueDate(selectedDate);
    }
    setShowDuePicker(false);
  };

  const handleStartConfirm = (selectedDate) => {
    if (selectedDate) {
      if (selectedDate >= dueDate) {
        Alert.alert(
          "Invalid Start Time",
          "Start time must be before due date",
          [{ text: "OK" }]
        );
        return;
      }
      setStartTime(selectedDate);
    }
    setShowStartPicker(false);
  };

  const addGoalHandler = async () => {
    if (!goalText.trim()) return;
    
    const newGoal = {
      id: Date.now().toString(),
      title: goalText,
      startTime,
      dueDate,
      completed: false,
    };

    onAddGoal(newGoal);
    
    // Schedule notifications for the new goal
    try {
      await scheduleNotification(newGoal);
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
    
    setGoalText("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Main Goal"
        value={goalText}
        onChangeText={setGoalText}
      />

      <TouchableOpacity onPress={() => setShowStartPicker(true)}>
        <Text style={styles.dateText}>Start: {startTime.toLocaleString()}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setShowDuePicker(true)}>
        <Text style={styles.dateText}>Due: {dueDate.toLocaleString()}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showStartPicker}
        mode="datetime"
        onConfirm={handleStartConfirm}
        onCancel={() => setShowStartPicker(false)}
      />

      <DateTimePickerModal
        isVisible={showDuePicker}
        mode="datetime"
        onConfirm={handleDueConfirm}
        onCancel={() => setShowDuePicker(false)}
      />

      <Button title="Add Goal" onPress={addGoalHandler} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  input: { borderWidth: 1, padding: 8, marginBottom: 10 },
  dateText: { 
    fontSize: 16, 
    color: "blue", 
    textAlign: "center", 
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4
  },
});
