package com.example.cosfu

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.os.Build
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.widget.Toast

class AppBlockerService : AccessibilityService() {

    companion object {
        private const val TAG = "EXPERGE"
        var blockedPackages: Set<String> = emptySet()
        var unlockedUntil: Map<String, Long> = emptyMap()
        var currentBlockedAppName: String? = null
        var currentBlockedCost: Int = 15
        var currentForegroundPackage: String? = null
        var isRunning: Boolean = false
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        isRunning = true
        Log.d(TAG, "AppBlockerService conectado")
        Toast.makeText(this, "Experge Blocker ativado", Toast.LENGTH_SHORT).show()

        val intent = Intent(this, BlockerForegroundService::class.java)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(intent)
            } else {
                startService(intent)
            }
            Log.d(TAG, "BlockerForegroundService iniciado")
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao iniciar ForegroundService: ${e.message}")
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val pkg = event.packageName?.toString() ?: return
        if (pkg == this.packageName) return

        currentForegroundPackage = pkg
        Log.d(TAG, "Foreground: $pkg | Blocked: $blockedPackages")

        if (blockedPackages.contains(pkg)) {
            val until = unlockedUntil[pkg]
            val now = System.currentTimeMillis()
            if (until != null && until > now) {
                Log.d(TAG, "$pkg liberado até $until (restam ${(until - now) / 1000}s)")
                return
            }

            Log.d(TAG, "BLOQUEANDO $pkg")
            currentBlockedAppName = pkg
            val intent = Intent(this, BlockOverlayActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                putExtra("blocked_package", pkg)
            }
            try {
                startActivity(intent)
                Log.d(TAG, "BlockOverlayActivity iniciada")
            } catch (e: Exception) {
                Log.e(TAG, "Erro ao abrir overlay: ${e.message}")
            }
        }
    }

    override fun onInterrupt() {
        isRunning = false
        Log.d(TAG, "AppBlockerService interrompido")
    }

    override fun onDestroy() {
        isRunning = false
        Log.d(TAG, "AppBlockerService destruído")
        super.onDestroy()
    }
}