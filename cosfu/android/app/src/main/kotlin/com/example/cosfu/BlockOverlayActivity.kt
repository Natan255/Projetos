package com.example.cosfu

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.graphics.Color
import android.view.Gravity
import android.view.WindowManager

class BlockOverlayActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Tela cheia e por cima de tudo
        window.setFlags(
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
        )

        val packageName = intent.getStringExtra("blocked_package") ?: ""

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#121212"))
            setPadding(64, 64, 64, 64)
        }

        val title = TextView(this).apply {
            text = "🔒 App Bloqueado"
            textSize = 28f
            setTextColor(Color.parseColor("#48B27F"))
            gravity = Gravity.CENTER
        }

        val message = TextView(this).apply {
            text = "Você precisa de créditos no Experge para liberar este app."
            textSize = 16f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            setPadding(0, 32, 0, 32)
        }

        val unlockButton = Button(this).apply {
            text = "Ir para o Experge"
            setBackgroundColor(Color.parseColor("#48B27F"))
            setTextColor(Color.BLACK)
            setOnClickListener {
                // Volta para o Experge (MainActivity)
                val intent = Intent(this@BlockOverlayActivity, MainActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    putExtra("from_block", packageName)
                }
                startActivity(intent)
                finish()
            }
        }

        layout.addView(title)
        layout.addView(message)
        layout.addView(unlockButton)
        setContentView(layout)
    }

    override fun onBackPressed() {
        // Bloqueia o botão voltar — usuário não pode escapar
        // (Opcional: mover o app para o background ou mandar para home)
    }
}