import * as Notifications from "expo-notifications";
import { Alert, Platform, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure notification behavior with alarm sound and custom channel
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
    sound: 'alarm',
    vibrate: [0, 250, 250, 250],
  }),
});

// Create a high-priority notification channel for Android
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('task-alarms', {
    name: 'Task Alarms',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'alarm',
    enableVibrate: true,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationLockscreenVisibility.PUBLIC,
    bypassDnd: true, // Bypass Do Not Disturb
    showBadge: true,
    icon: '@drawable/notification_icon',
  });
}

export async function checkNotificationPermission() {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function requestPermissions() {
  let { status } = await Notifications.getPermissionsAsync();
  
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    status = newStatus;
  }
  
  await AsyncStorage.setItem("notificationsAllowed", status === "granted" ? "true" : "false");
  return status === "granted";
}

export async function checkPermissionsOnStart() {
  const status = await checkNotificationPermission();
  await AsyncStorage.setItem("notificationsAllowed", status === "granted" ? "true" : "false");
  return status === "granted";
}

export async function scheduleNotification(task) {
  const notificationsAllowed = await AsyncStorage.getItem("notificationsAllowed");
  if (notificationsAllowed !== "true") {
    console.warn("Notifications not allowed");
    return false;
  }

  const taskDueDate = new Date(task.dueDate);
  const now = new Date();

  if (taskDueDate <= now) return false;

  const timeDifference = taskDueDate - now;
  const taskNotificationId = `task-${task.id}`;
  
  await cancelTaskNotifications(taskNotificationId);

  const intervals = [
    { percent: 0.25, title: "Task Reminder", body: `"${task.title}" is due in 75% of time` },
    { percent: 0.5, title: "Task Reminder", body: `"${task.title}" is due in 50% of time` },
    { percent: 0.75, title: "Task Reminder", body: `"${task.title}" is due in 25% of time` },
    { percent: 0.85, title: "Task Almost Due", body: `"${task.title}" is due in 15% of time remaining` },
    { percent: 0.95, title: "Task Due Very Soon!", body: `"${task.title}" is due in 5% of time remaining!` },
    { percent: 1.0, title: "⚠️ Task Due Now!", body: `"${task.title}" is due now!` }
  ];

  const scheduledIds = [];

  for (const interval of intervals) {
    const triggerTime = new Date(now.getTime() + timeDifference * interval.percent);
    
    if (triggerTime > now) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: interval.title,
            body: interval.body,
            sound: 'alarm',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            channelId: 'task-alarms',
            icon: '@drawable/notification_icon',
            data: { 
              taskId: task.id, 
              type: 'task', 
              dueDate: taskDueDate.toISOString(),
              title: task.title
            },
            android: {
              channelId: 'task-alarms',
              smallIcon: '@drawable/notification_icon',
              priority: Notifications.AndroidNotificationPriority.MAX,
              sound: 'alarm',
            }
          },
          trigger: { 
            date: triggerTime,
          },
        });
        scheduledIds.push(id);
        
        // Store notification data for potential rescheduling
        await AsyncStorage.setItem(
          `notification-time-${id}`,
          triggerTime.toISOString()
        );
        await AsyncStorage.setItem(
          `notification-data-${id}`,
          JSON.stringify({
            taskId: task.id,
            taskTitle: task.title,
            type: 'task',
            dueDate: taskDueDate.toISOString()
          })
        );
      } catch (error) {
        console.error("Error scheduling notification:", error);
      }
    }
  }

  // Enhanced sub-goal notifications with similar configuration
  if (task.subGoals && task.subGoals.length > 0) {
    for (const subGoal of task.subGoals) {
      const subGoalDueDate = new Date(subGoal.dueDate);
      if (subGoalDueDate > now) {
        const subGoalReminders = [
          { minutes: 60, title: "Sub-Goal Due in 1 Hour" },
          { minutes: 30, title: "Sub-Goal Due Soon" },
          { minutes: 15, title: "⚠️ Sub-Goal Almost Due" },
          { minutes: 5, title: "🚨 Sub-Goal Final Warning" }
        ];

        for (const reminder of subGoalReminders) {
          const reminderTime = new Date(subGoalDueDate.getTime() - reminder.minutes * 60000);
          if (reminderTime > now) {
            try {
              const id = await Notifications.scheduleNotificationAsync({
                content: {
                  title: reminder.title,
                  body: `Sub-goal "${subGoal.title}" of task "${task.title}" is due in ${reminder.minutes} minutes!`,
                  sound: 'alarm',
                  priority: Notifications.AndroidNotificationPriority.HIGH,
                  channelId: 'task-alarms',
                  icon: '@drawable/notification_icon',
                  data: { 
                    taskId: task.id, 
                    subGoalId: subGoal.id, 
                    type: 'subgoal',
                    dueDate: subGoalDueDate.toISOString(),
                    title: subGoal.title,
                    parentTitle: task.title
                  },
                  android: {
                    channelId: 'task-alarms',
                    smallIcon: '@drawable/notification_icon',
                    priority: Notifications.AndroidNotificationPriority.MAX,
                    sound: 'alarm',
                  }
                },
                trigger: { 
                  date: reminderTime,
                },
              });
              scheduledIds.push(id);
              
              await AsyncStorage.setItem(
                `notification-time-${id}`,
                reminderTime.toISOString()
              );
              await AsyncStorage.setItem(
                `notification-data-${id}`,
                JSON.stringify({
                  taskId: task.id,
                  subGoalId: subGoal.id,
                  taskTitle: task.title,
                  subGoalTitle: subGoal.title,
                  type: 'subgoal',
                  dueDate: subGoalDueDate.toISOString()
                })
              );
            } catch (error) {
              console.error("Error scheduling sub-goal notification:", error);
            }
          }
        }
      }
    }
  }

  if (scheduledIds.length > 0) {
    await AsyncStorage.setItem(
      `notifications-${taskNotificationId}`,
      JSON.stringify(scheduledIds)
    );
    return true;
  }
  
  return false;
}

async function cancelTaskNotifications(taskNotificationId) {
  try {
    const notificationIds = await AsyncStorage.getItem(`notifications-${taskNotificationId}`);
    
    if (notificationIds) {
      const ids = JSON.parse(notificationIds);
      for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
        await AsyncStorage.removeItem(`notification-time-${id}`);
      }
      await AsyncStorage.removeItem(`notifications-${taskNotificationId}`);
    }
  } catch (error) {
    console.error("Error canceling notifications:", error);
  }
}

// New function to reschedule notifications after device reboot
export async function rescheduleMissedNotifications() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const notificationTimeKeys = keys.filter(key => key.startsWith('notification-time-'));
    
    const now = new Date();
    
    for (const key of notificationTimeKeys) {
      const scheduledTime = new Date(await AsyncStorage.getItem(key));
      const notificationId = key.replace('notification-time-', '');
      
      // If notification time has passed while device was off, show it immediately
      if (scheduledTime < now) {
        const notificationData = await AsyncStorage.getItem(`notification-data-${notificationId}`);
        if (notificationData) {
          const data = JSON.parse(notificationData);
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Missed Task Reminder",
              body: `You missed a reminder for task "${data.taskTitle}"`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
              channelId: 'task-alarms',
              data: data,
            },
            trigger: { seconds: 1 }, // Show immediately
          });
        }
      }
    }
  } catch (error) {
    console.error("Error rescheduling notifications:", error);
  }
}

export function openNotificationSettings() {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
}
