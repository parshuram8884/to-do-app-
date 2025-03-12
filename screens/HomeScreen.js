import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert
} from "react-native";
import { checkPermissionsOnStart, requestPermissions, checkNotificationPermission } from "../utils/Notifications";

export default function HomeScreen({ navigation }) {
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    async function checkPermissionStatus() {
      const status = await checkNotificationPermission();
      setPermissionStatus(status);
    }

    checkPermissionStatus();
    
    // Set up a periodic check of permission status
    const permissionCheckInterval = setInterval(checkPermissionStatus, 5000);
    
    return () => clearInterval(permissionCheckInterval);
  }, []);

  const handleEnableNotifications = async () => {
    const result = await requestPermissions();
    if (result) {
      setPermissionStatus('granted');
      Alert.alert(
        "Notifications Enabled",
        "You will now receive reminders for your tasks!",
        [{ text: "Great!" }]
      );
    } else {
      Alert.alert(
        "Permission Required",
        "Please enable notifications in your device settings to receive task reminders.",
        [
          { 
            text: "Open Settings",
            onPress: () => Linking.openSettings()
          },
          {
            text: "Later",
            style: "cancel"
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List App</Text>

      {permissionStatus === 'denied' && (
        <View style={styles.permissionBox}>
          <Text style={styles.warningText}>⚠ Notifications are disabled!</Text>
          <Text style={styles.warningSubtext}>
            You will miss important task reminders without notifications
          </Text>
          <Button 
            title="Enable Notifications" 
            onPress={handleEnableNotifications}
            color="#ff6347" 
          />
        </View>
      )}
      
      {permissionStatus === 'granted' && (
        <View style={styles.permissionGrantedBox}>
          <Text style={styles.successText}>✓ Notifications enabled</Text>
          <Text style={styles.successSubtext}>You'll receive timely reminders for your tasks</Text>
        </View>
      )}

      <Button 
        title="Manage Goals" 
        onPress={() => navigation.navigate("Goals")} 
        color="#4682B4"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    padding: 20,
    backgroundColor: "#f8f9fa" 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 30,
    color: "#2c3e50" 
  },
  permissionBox: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: "#fff3f3",
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#ffcccb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionGrantedBox: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: "#f0fff0",
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#90ee90",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningText: { 
    color: "#e74c3c", 
    marginBottom: 10, 
    fontWeight: "bold",
    fontSize: 18 
  },
  warningSubtext: {
    color: "#7f8c8d",
    marginBottom: 15,
    textAlign: "center"
  },
  successText: {
    color: "#27ae60",
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 18
  },
  successSubtext: {
    color: "#7f8c8d",
    textAlign: "center"
  }
});
