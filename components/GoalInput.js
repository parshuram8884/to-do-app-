import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function GoalInput({ onAddGoal }) {
  const [goalText, setGoalText] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleConfirm = (selectedDate) => {
    if (selectedDate) {
      setDueDate(selectedDate);
    }
    setShowPicker(false);
  };

  const addGoalHandler = () => {
    if (!goalText.trim()) return;
    onAddGoal({
      id: Date.now().toString(), // Unique ID
      title: goalText,
      dueDate,
      completed: false,
    });
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

      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>Due: {dueDate.toLocaleString()}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showPicker}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={() => setShowPicker(false)}
      />

      <Button title="Add Goal" onPress={addGoalHandler} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  input: { borderWidth: 1, padding: 8, marginBottom: 10 },
  dateText: { fontSize: 16, color: "blue", textAlign: "center", marginBottom: 10 },
});
