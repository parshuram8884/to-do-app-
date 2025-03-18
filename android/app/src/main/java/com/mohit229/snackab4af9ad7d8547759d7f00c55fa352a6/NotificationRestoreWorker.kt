package com.mohit229.snackab4af9ad7d8547759d7f00c55fa352a6

import android.content.Context
import androidx.work.Worker
import androidx.work.WorkerParameters

class NotificationRestoreWorker(
    context: Context,
    params: WorkerParameters
) : Worker(context, params) {
    
    override fun doWork(): Result {
        try {
            // Get receiver instance and call reschedule
            val receiver = NotificationAlarmReceiver()
            receiver.rescheduleNotifications(applicationContext)
            return Result.success()
        } catch (e: Exception) {
            e.printStackTrace()
            return Result.failure()
        }
    }
}
