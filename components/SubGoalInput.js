import React, { useState } from "react";
import { 
  View, 
  TextInput, 
  Button, 
  StyleSheet, 
  Text, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { scheduleNotification } from "../utils/Notifications";

export default function SubGoalInput({ onAddSubGoal, parentGoal }) {
  const [subGoalText, setSubGoalText] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);

  const handleStartConfirm = (selectedDate) => {
    if (selectedDate) {
      // Validate start time is within parent goal's timeframe
      const parentStart = parentGoal.startTime ? new Date(parentGoal.startTime) : new Date();
      const parentDue = new Date(parentGoal.dueDate);
      
      if (selectedDate < parentStart || selectedDate >= parentDue) {
        Alert.alert(
          "Invalid Start Time",
          "Sub-goal must start after parent goal's start time and before its due date",
          [{ text: "OK" }]
        );
        return;
      }
      
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

  const handleDueConfirm = (selectedDate) => {
    if (selectedDate) {
      // Validate due date is within parent goal's timeframe
      const parentDue = new Date(parentGoal.dueDate);
      
      if (selectedDate > parentDue) {
        Alert.alert(
          "Invalid Due Date",
          "Sub-goal must be due before parent goal",
          [{ text: "OK" }]
        );
        return;
      }
      
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

  const addSubGoalHandler = async () => {
    if (!subGoalText.trim()) return;
    
    const newSubGoal = { 
      id: Date.now().toString(),
      title: subGoalText, 
      startTime,
      dueDate,
      completed: false
    };
    
    onAddSubGoal(newSubGoal);

    // Schedule notifications for the new sub-goal
    try {
      await scheduleNotification({
        ...parentGoal,
        subGoals: [newSubGoal]
      });
    } catch (error) {
      console.error("Error scheduling sub-goal notifications:", error);
    }

    setSubGoalText("");
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder="Sub-Goal"
            value={subGoalText}
            onChangeText={setSubGoalText}
          />
          
          <TouchableOpacity 
            onPress={() => setShowStartPicker(true)}
            style={styles.dateButton}
          >
            <Text style={styles.dateText}>Start: {startTime.toLocaleString()}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setShowDuePicker(true)}
            style={styles.dateButton}
          >
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

          <Button title="Add Sub-Goal" onPress={addSubGoalHandler} />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    width: '100%',
  },
  container: { 
    marginBottom: 20,
    padding: 10
  },
  input: { 
    borderWidth: 1, 
    padding: 8, 
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 4
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 10,
    padding: 8
  },
  dateText: { 
    fontSize: 16, 
    color: "blue", 
    textAlign: "center"
  }
});