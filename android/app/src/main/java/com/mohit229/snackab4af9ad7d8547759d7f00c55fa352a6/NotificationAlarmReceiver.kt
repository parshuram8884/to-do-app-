package com.mohit229.snackab4af9ad7d8547759d7f00c55fa352a6

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.SharedPreferences
import org.json.JSONObject
import android.os.Build
import android.app.NotificationChannel
import android.app.NotificationManager
import android.media.AudioAttributes
import android.net.Uri
import androidx.core.app.NotificationCompat

class NotificationAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED, Intent.ACTION_MY_PACKAGE_REPLACED, Intent.ACTION_QUICKBOOT_POWERON -> {
                rescheduleNotifications(context)
            }
            "com.mohit229.snackab4af9ad7d8547759d7f00c55fa352a6.NOTIFICATION_ALARM" -> {
                showNotification(context, intent)
            }
        }
    }

    private fun rescheduleNotifications(context: Context) {
        val sharedPrefs: SharedPreferences = context.getSharedPreferences("app", Context.MODE_PRIVATE)
        val notificationData = sharedPrefs.getString("notification_schedules", null) ?: return

        try {
            val schedules = JSONObject(notificationData)
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            schedules.keys().forEach { key ->
                val notification = schedules.getJSONObject(key)
                val triggerTime = notification.getLong("triggerTime")
                
                if (triggerTime > System.currentTimeMillis()) {
                    val intent = Intent(context, NotificationAlarmReceiver::class.java).apply {
                        action = "com.mohit229.snackab4af9ad7d8547759d7f00c55fa352a6.NOTIFICATION_ALARM"
                        putExtra("title", notification.getString("title"))
                        putExtra("message", notification.getString("message"))
                        putExtra("taskId", notification.getString("taskId"))
                    }

                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        key.hashCode(),
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        if (alarmManager.canScheduleExactAlarms()) {
                            alarmManager.setAlarmClock(
                                AlarmManager.AlarmClockInfo(triggerTime, pendingIntent),
                                pendingIntent
                            )
                        }
                    } else {
                        alarmManager.setExactAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            triggerTime,
                            pendingIntent
                        )
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun showNotification(context: Context, intent: Intent) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Create notification channel for Android O and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "task-alarms",
                "Task Alarms",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "High priority notifications for task reminders"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 250, 250, 250)
                setSound(
                    Uri.parse("android.resource://${context.packageName}/raw/alarm"),
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
            }
            notificationManager.createNotificationChannel(channel)
        }

        val title = intent.getStringExtra("title") ?: "Task Reminder"
        val message = intent.getStringExtra("message") ?: "You have a task due!"
        val taskId = intent.getStringExtra("taskId")

        // Create notification
        val notification = NotificationCompat.Builder(context, "task-alarms")
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(R.drawable.notification_icon)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setSound(Uri.parse("android.resource://${context.packageName}/raw/alarm"))
            .setVibrate(longArrayOf(0, 250, 250, 250))
            .build()

        // Show notification
        notificationManager.notify(taskId?.hashCode() ?: System.currentTimeMillis().toInt(), notification)
    }
}