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

// Calculate time intervals based on total duration
function calculateTimeIntervals(startTime, dueDate) {
  const totalDuration = dueDate - startTime;
  const now = new Date();
  const timeLeft = dueDate - now;
  const percentageComplete = ((totalDuration - timeLeft) / totalDuration) * 100;
  
  // Define notification thresholds at key percentages
  return [
    { percent: 0, title: "Started", body: "Task has started" },
    { percent: 25, title: "25% Time Passed", body: "Quarter of time has passed" },
    { percent: 50, title: "Halfway Point", body: "Half of allocated time has passed" },
    { percent: 75, title: "75% Time Passed", body: "Only 25% of time remains" },
    { percent: 85, title: "Urgent", body: "Task is becoming urgent" },
    { percent: 90, title: "Very Urgent", body: "Task needs immediate attention" },
    { percent: 95, title: "Critical", body: "Task is critically due soon" },
    { percent: 100, title: "Due Now", body: "Task is due now" }
  ];
}

function adjustNotificationTime(date) {
  const adjustedDate = new Date(date);
  const hours = adjustedDate.getHours();
  const day = adjustedDate.getDay();

  // Don't send notifications between 10 PM and 8 AM
  if (hours >= 22 || hours < 8) {
    adjustedDate.setHours(8);
    adjustedDate.setMinutes(0);
    adjustedDate.setDate(adjustedDate.getDate() + (hours >= 22 ? 1 : 0));
  }

  // If it falls on weekend, move to Monday 8 AM
  if (day === 0 || day === 6) {
    adjustedDate.setDate(adjustedDate.getDate() + (day === 0 ? 1 : 2));
    adjustedDate.setHours(8);
    adjustedDate.setMinutes(0);
  }

  return adjustedDate;
}

export async function scheduleNotification(task) {
  const notificationsAllowed = await AsyncStorage.getItem("notificationsAllowed");
  if (notificationsAllowed !== "true") {
    console.warn("Notifications not allowed");
    return false;
  }

  const taskDueDate = new Date(task.dueDate);
  const now = new Date();
  const startTime = task.startTime ? new Date(task.startTime) : now;

  if (taskDueDate <= now) return false;

  const taskNotificationId = `task-${task.id}`;
  await cancelTaskNotifications(taskNotificationId);

  const intervals = calculateTimeIntervals(startTime, taskDueDate);
  const scheduledIds = [];

  // Schedule notifications for main goal
  const totalDuration = taskDueDate - startTime;
  for (const interval of intervals) {
    const triggerTime = new Date(startTime.getTime() + (totalDuration * (interval.percent / 100)));
    const adjustedTriggerTime = adjustNotificationTime(triggerTime);
    
    if (adjustedTriggerTime > now) {
      try {
        const timeLeftPercent = Math.round(((taskDueDate - adjustedTriggerTime) / totalDuration) * 100);
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${interval.title} - ${task.title}`,
            body: `${interval.body} - ${timeLeftPercent}% time remaining (Adjusted for your schedule)`,
            sound: 'alarm',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            channelId: 'task-alarms',
            icon: '@drawable/notification_icon',
            data: { 
              taskId: task.id, 
              type: 'task', 
              dueDate: taskDueDate.toISOString(),
              title: task.title,
              percentComplete: interval.percent,
              timeLeftPercent
            },
            android: {
              channelId: 'task-alarms',
              smallIcon: '@drawable/notification_icon',
              priority: Notifications.AndroidNotificationPriority.MAX,
              sound: 'alarm',
            }
          },
          trigger: { date: adjustedTriggerTime },
        });
        scheduledIds.push(id);
        
        await AsyncStorage.setItem(
          `notification-time-${id}`,
          adjustedTriggerTime.toISOString()
        );
        await AsyncStorage.setItem(
          `notification-data-${id}`,
          JSON.stringify({
            taskId: task.id,
            taskTitle: task.title,
            type: 'task',
            dueDate: taskDueDate.toISOString(),
            percentComplete: interval.percent
          })
        );
      } catch (error) {
        console.error("Error scheduling notification:", error);
      }
    }
  }

  // Schedule notifications for sub-goals
  if (task.subGoals && task.subGoals.length > 0) {
    for (const subGoal of task.subGoals) {
      const subGoalDueDate = new Date(subGoal.dueDate);
      const subGoalStartTime = subGoal.startTime ? new Date(subGoal.startTime) : now;
      
      if (subGoalDueDate > now) {
        const subGoalIntervals = calculateTimeIntervals(subGoalStartTime, subGoalDueDate);
        const subGoalDuration = subGoalDueDate - subGoalStartTime;

        for (const interval of subGoalIntervals) {
          const triggerTime = new Date(subGoalStartTime.getTime() + (subGoalDuration * (interval.percent / 100)));
          const adjustedTriggerTime = adjustNotificationTime(triggerTime);
          
          if (adjustedTriggerTime > now) {
            try {
              const timeLeftPercent = Math.round(((subGoalDueDate - adjustedTriggerTime) / subGoalDuration) * 100);
              const id = await Notifications.scheduleNotificationAsync({
                content: {
                  title: `Sub-Goal: ${interval.title}`,
                  body: `Sub-goal "${subGoal.title}" of "${task.title}" - ${timeLeftPercent}% time remaining (Adjusted for your schedule)`,
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
                    parentTitle: task.title,
                    percentComplete: interval.percent,
                    timeLeftPercent
                  },
                  android: {
                    channelId: 'task-alarms',
                    smallIcon: '@drawable/notification_icon',
                    priority: Notifications.AndroidNotificationPriority.MAX,
                    sound: 'alarm',
                  }
                },
                trigger: { date: adjustedTriggerTime },
              });
              scheduledIds.push(id);
              
              await AsyncStorage.setItem(
                `notification-time-${id}`,
                adjustedTriggerTime.toISOString()
              );
              await AsyncStorage.setItem(
                `notification-data-${id}`,
                JSON.stringify({
                  taskId: task.id,
                  subGoalId: subGoal.id,
                  taskTitle: task.title,
                  subGoalTitle: subGoal.title,
                  type: 'subgoal',
                  dueDate: subGoalDueDate.toISOString(),
                  percentComplete: interval.percent
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
