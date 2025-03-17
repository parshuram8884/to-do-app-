package com.mohit229.snackab4af9ad7d8547759d7f00c55fa352a6

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class TodoWidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "TodoWidgetModule"
    }

    @ReactMethod
    fun updateWidget() {
        val context = reactApplicationContext
        val intent = Intent(context, TaskWidgetProvider::class.java)
        intent.action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        
        val ids = AppWidgetManager.getInstance(context)
            .getAppWidgetIds(android.content.ComponentName(context, TaskWidgetProvider::class.java))
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        
        context.sendBroadcast(intent)
    }
}