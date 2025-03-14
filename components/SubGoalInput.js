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
  Keyboard
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function SubGoalInput({ onAddSubGoal }) {
  const [subGoalText, setSubGoalText] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleConfirm = (selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const addSubGoalHandler = () => {
    if (!subGoalText.trim()) return;
    onAddSubGoal({ title: subGoalText, dueDate });
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
          
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Text style={styles.dateText}>Due: {dueDate.toLocaleString()}</Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={showPicker}
            mode="datetime"
            onConfirm={handleConfirm}
            onCancel={() => setShowPicker(false)}
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
    backgroundColor: 'white' 
  },
  dateText: { 
    fontSize: 16, 
    color: "blue", 
    textAlign: "center", 
    marginBottom: 10 
  }
});