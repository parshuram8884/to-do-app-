import * as Notifications from "expo-notifications";
import { Alert, Platform, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Check current notification permission status
export async function checkNotificationPermission() {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

// Request notification permissions with improved handling
export async function requestPermissions() {
  // First check current permission status
  let { status } = await Notifications.getPermissionsAsync();
  
  // If not granted, request permission
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    status = newStatus;
  }
  
  // Store the permission status
  await AsyncStorage.setItem("notificationsAllowed", status === "granted" ? "true" : "false");
  
  return status === "granted";
}

// Check permissions on app start
export async function checkPermissionsOnStart() {
  const status = await checkNotificationPermission();
  const notificationsAllowed = status === "granted";
  
  // Update stored value to reflect current status
  await AsyncStorage.setItem("notificationsAllowed", notificationsAllowed ? "true" : "false");
  
  return notificationsAllowed;
}

// Schedule multiple notifications at percentage-based intervals
export async function scheduleNotification(task) {
  // First check if notifications are allowed
  const notificationsAllowed = await AsyncStorage.getItem("notificationsAllowed");
  if (notificationsAllowed !== "true") {
    console.warn("Notifications not allowed. Cannot schedule notifications.");
    return false;
  }
  
  const taskDueDate = new Date(task.dueDate);
  const now = new Date();

  if (taskDueDate <= now) {
    console.warn("Task due date has already passed.");
    return false;
  }

  const timeDifference = taskDueDate - now; // Total time until the task is due

  // Create a unique identifier for this task's notifications
  const taskNotificationId = `task-${task.id}`;
  
  // Intervals at which to send notifications (percentage of time until due date)
  const percentageIntervals = [0.25, 0.5, 0.75, 0.9, 0.95, 1.0]; // 25%, 50%, 75%, 90%, 95%, 100%

  // First cancel any existing notifications for this task
  await cancelTaskNotifications(taskNotificationId);

  const scheduledNotifications = [];

  for (const percent of percentageIntervals) {
    const triggerTime = new Date(now.getTime() + timeDifference * percent);

    // Only schedule if the trigger time is in the future
    if (triggerTime > now) {
      try {
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: percent === 1.0 ? "Task Due Now!" : "Task Reminder",
            body: percent === 1.0
              ? `Your task "${task.title}" is due now!`
              : `Your task "${task.title}" is due in ${formatTimeRemaining(triggerTime, now)}!`,
            sound: true,
            data: { taskId: task.id, notificationGroup: taskNotificationId },
          },
          trigger: { date: triggerTime },
        });
        
        scheduledNotifications.push(identifier);
      } catch (error) {
        console.error("Error scheduling notification:", error);
      }
    }
  }

  // Store notification IDs for this task
  if (scheduledNotifications.length > 0) {
    await AsyncStorage.setItem(
      `notifications-${taskNotificationId}`, 
      JSON.stringify(scheduledNotifications)
    );
    return true;
  }
  
  return false;
}

// Cancel all notifications for a specific task
async function cancelTaskNotifications(taskNotificationId) {
  try {
    const notificationIds = await AsyncStorage.getItem(`notifications-${taskNotificationId}`);
    
    if (notificationIds) {
      const ids = JSON.parse(notificationIds);
      
      // Cancel each scheduled notification
      for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      
      // Remove the stored notification IDs
      await AsyncStorage.removeItem(`notifications-${taskNotificationId}`);
    }
  } catch (error) {
    console.error("Error canceling task notifications:", error);
  }
}

// Format time remaining in a human-readable format
function formatTimeRemaining(futureDate, currentDate) {
  const diff = futureDate - currentDate;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'}`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  } else {
    return 'less than a minute';
  }
}

// Handle notifications when the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Function to open app settings for the user to enable notifications
export function openNotificationSettings() {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
}
