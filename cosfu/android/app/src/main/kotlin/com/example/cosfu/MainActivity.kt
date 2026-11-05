package com.example.cosfu

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import androidx.annotation.NonNull
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.example.cosfu/blocker"
    private val TAG = "EXPERGE"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Pede permissão de notificação no Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    1001
                )
            }
        }

        val fromBlock = intent?.getStringExtra("from_block")
        if (fromBlock != null) {
            Log.d(TAG, "Voltou do bloqueio: $fromBlock")
            flutterEngine?.dartExecutor?.binaryMessenger?.let {
                MethodChannel(it, CHANNEL).invokeMethod("onReturnedFromBlock", fromBlock)
            }
        }
    }

    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "updateBlockedApps" -> {
                        val blocked = call.argument<List<String>>("blocked")
                            ?: call.argument<List<String>>("packages")
                            ?: emptyList()
                        val unlockedRaw = call.argument<Map<String, Any>>("unlockedUntil")
                            ?: emptyMap()

                        Log.d(TAG, "Recebi blocked: $blocked")
                        Log.d(TAG, "Recebi unlockedUntil: $unlockedRaw")

                        AppBlockerService.blockedPackages = blocked.toSet()
                        AppBlockerService.unlockedUntil = unlockedRaw.mapValues { entry ->
                            (entry.value as? Number)?.toLong() ?: 0L
                        }
                        result.success(true)
                    }

                    "isAccessibilityEnabled" -> {
                        val enabled = isAccessibilityServiceEnabled()
                        Log.d(TAG, "isAccessibilityEnabled: $enabled")
                        result.success(enabled)
                    }

                    "isBlockerRunning" -> {
                        Log.d(TAG, "isBlockerRunning: ${AppBlockerService.isRunning}")
                        result.success(AppBlockerService.isRunning)
                    }

                    "openAccessibilitySettings" -> {
                        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                        startActivity(intent)
                        result.success(true)
                    }

                    "openAppSettings" -> {
                        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                            data = Uri.parse("package:$packageName")
                        }
                        startActivity(intent)
                        result.success(true)
                    }

                    "updateAppCost" -> {
                        val cost = call.argument<Int>("cost") ?: 15
                        AppBlockerService.currentBlockedCost = cost
                        result.success(true)
                    }

                    else -> result.notImplemented()
                }
            }
    }

    private fun isAccessibilityServiceEnabled(): Boolean {
        val service = "$packageName/${AppBlockerService::class.java.name}"
        val enabledServices = Settings.Secure.getString(
            contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false
        return enabledServices.contains(service)
    }
}