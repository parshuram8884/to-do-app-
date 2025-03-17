package com.mohit229.snackab4af9ad7d8547759d7f00c55fa352a6

import android.os.Build
import android.os.Bundle
import android.content.IntentFilter
import android.content.Intent

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  private val notificationReceiver = NotificationAlarmReceiver()
  
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme)
    super.onCreate(null)
    
    // Register for boot completed and package replaced events
    val intentFilter = IntentFilter().apply {
      addAction(Intent.ACTION_BOOT_COMPLETED)
      addAction(Intent.ACTION_MY_PACKAGE_REPLACED)
      addAction(Intent.ACTION_QUICKBOOT_POWERON)
      addAction("com.mohit229.snackab4af9ad7d8547759d7f00c55fa352a6.NOTIFICATION_ALARM")
    }
    registerReceiver(notificationReceiver, intentFilter)
  }

  override fun onDestroy() {
    super.onDestroy()
    try {
      unregisterReceiver(notificationReceiver)
    } catch (e: Exception) {
      // Receiver might already be unregistered
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}
