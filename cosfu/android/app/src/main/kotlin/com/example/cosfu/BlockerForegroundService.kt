package com.example.cosfu

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log

class BlockerForegroundService : Service() {

    private val CHANNEL_ID = "experge_blocker_channel"
    private val NOTIFICATION_ID = 1001
    private val checkIntervalMs = 1000L
    private val TAG = "EXPERGE"

    private val handler = Handler(Looper.getMainLooper())
    private var lastBlockedPackage: String? = null

    private val checkRunnable = object : Runnable {
        override fun run() {
            recheckActiveApp()
            handler.postDelayed(this, checkIntervalMs)
        }
    }

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "BlockerForegroundService criado")
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification())
        handler.post(checkRunnable)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "BlockerForegroundService iniciado")
        return START_STICKY
    }

    override fun onDestroy() {
        Log.d(TAG, "BlockerForegroundService destruído")
        handler.removeCallbacks(checkRunnable)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun recheckActiveApp() {
        val pkg = AppBlockerService.currentForegroundPackage ?: return
        if (!AppBlockerService.blockedPackages.contains(pkg)) return

        val until = AppBlockerService.unlockedUntil[pkg]
        val now = System.currentTimeMillis()
        if (until != null && until > now) return

        if (lastBlockedPackage != pkg) {
            lastBlockedPackage = pkg
            Log.d(TAG, "ForegroundService BLOQUEANDO $pkg")
            val intent = Intent(this, BlockOverlayActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                putExtra("blocked_package", pkg)
            }
            startActivity(intent)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Experge Blocker",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Mantém o bloqueio de apps ativo"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }
        return builder
            .setContentTitle("Experge está protegendo seu foco")
            .setContentText("Bloqueio de apps ativo")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setOngoing(true)
            .build()
    }
}