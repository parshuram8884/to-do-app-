package com.mohit229.snackab4af9ad7d8547759d7f00c55fa352a6

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import android.content.SharedPreferences
import android.view.View
import org.json.JSONArray
import org.json.JSONObject
import android.app.PendingIntent
import android.content.Intent
import android.os.Bundle

class TaskWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        
        if (intent.action == "android.appwidget.action.APPWIDGET_UPDATE" || 
            intent.action == AppWidgetManager.ACTION_APPWIDGET_UPDATE ||
            intent.action == "android.intent.action.BOOT_COMPLETED") {
            
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(
                android.content.ComponentName(context, TaskWidgetProvider::class.java)
            )
            
            onUpdate(context, appWidgetManager, appWidgetIds)
        }
    }

    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        val views = RemoteViews(context.packageName, R.layout.task_widget_layout)
        
        val sharedPrefs: SharedPreferences = context.getSharedPreferences("app", Context.MODE_PRIVATE)
        val goalsJson = sharedPrefs.getString("goals", "[]")
        
        try {
            val goalsArray = JSONArray(goalsJson)
            var totalTasks = 0
            var completedTasks = 0
            val taskViews = StringBuilder()
            
            // Count statistics
            for (i in 0 until goalsArray.length()) {
                val goal = goalsArray.getJSONObject(i)
                totalTasks++
                if (goal.getBoolean("completed")) {
                    completedTasks++
                }

                // Also count subgoals
                if (goal.has("subGoals")) {
                    val subGoals = goal.getJSONArray("subGoals")
                    for (j in 0 until subGoals.length()) {
                        totalTasks++
                        if (subGoals.getJSONObject(j).getBoolean("completed")) {
                            completedTasks++
                        }
                    }
                }
            }

            // Build task list view
            var taskCount = 0
            for (i in 0 until goalsArray.length()) {
                val goal = goalsArray.getJSONObject(i)
                if (!goal.getBoolean("completed") && taskCount < 3) {
                    taskViews.append("• ${goal.getString("title")}\n")
                    taskCount++
                    
                    // Add sub-goals if they exist
                    if (goal.has("subGoals")) {
                        val subGoals = goal.getJSONArray("subGoals")
                        for (j in 0 until Math.min(subGoals.length(), 2)) {
                            val subGoal = subGoals.getJSONObject(j)
                            if (!subGoal.getBoolean("completed")) {
                                val subGoalStatus = if (subGoal.getBoolean("completed")) "✓" else "○"
                                taskViews.append("    $subGoalStatus ${subGoal.getString("title")}\n")
                                taskCount++
                            }
                            if (taskCount >= 5) break
                        }
                    }
                    
                    if (taskCount >= 5) break
                }
            }
            
            // Update widget views
            views.setTextViewText(R.id.widget_header, "Todo Tasks ($completedTasks/$totalTasks)")
            
            val content = if (taskViews.isEmpty()) {
                "No upcoming tasks"
            } else {
                taskViews.toString().trim()
            }
            
            views.setTextViewText(R.id.tasks_container, content)

            // Add click handler to open the app
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                context.packageManager.getLaunchIntentForPackage(context.packageName),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_layout_root, pendingIntent)
            
        } catch (e: Exception) {
            views.setTextViewText(R.id.tasks_container, "Unable to load tasks")
        }
        
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}