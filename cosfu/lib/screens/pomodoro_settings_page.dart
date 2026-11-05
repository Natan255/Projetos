import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/timer_provider.dart';

class PomodoroSettingsPage extends StatelessWidget {
  const PomodoroSettingsPage({super.key});

  Future<void> _editDuration(
    BuildContext context, {
    required String title,
    required int currentMinutes,
    required Function(int) onSave,
  }) async {
    final controller = TextEditingController(text: '$currentMinutes');
    final result = await showDialog<int>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        title: Text(title, style: const TextStyle(color: Colors.white)),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          autofocus: true,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            labelText: 'Minutos',
            labelStyle: TextStyle(color: Colors.grey),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, null),
            child: const Text('Cancelar', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.greenAccent,
              foregroundColor: Colors.black,
            ),
            onPressed: () {
              final n = int.tryParse(controller.text);
              Navigator.pop(ctx, (n != null && n > 0) ? n : null);
            },
            child: const Text('Salvar'),
          ),
        ],
      ),
    );
    if (result != null) onSave(result);
  }

  @override
  Widget build(BuildContext context) {
    final timer = context.watch<TimerProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Text(
          'Pomodoro',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _tile(
            icon: Icons.bolt,
            title: 'Multiplicador de crédito',
            subtitle:
                '${timer.creditMultiplier.toStringAsFixed(2)}x '
                '(${((timer.focusDuration ~/ 60) * timer.creditMultiplier).round()} '
                'min por ciclo de ${timer.focusDuration ~/ 60} min)',
            onTap: () async {
              final controller = TextEditingController(
                text: timer.creditMultiplier.toString(),
              );
              final result = await showDialog<double>(
                context: context,
                builder: (ctx) => AlertDialog(
                  backgroundColor: const Color(0xFF1E1E1E),
                  title: const Text(
                    'Multiplicador de crédito',
                    style: TextStyle(color: Colors.white),
                  ),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        '1.0 = ganha o mesmo tanto de minutos que focou.\n'
                        '0.5 = ganha metade. 2.0 = ganha o dobro.',
                        style: TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: controller,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        autofocus: true,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          labelText: 'Multiplicador',
                          labelStyle: TextStyle(color: Colors.grey),
                        ),
                      ),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, null),
                      child: const Text(
                        'Cancelar',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.greenAccent,
                        foregroundColor: Colors.black,
                      ),
                      onPressed: () {
                        final n = double.tryParse(
                          controller.text.replaceAll(',', '.'),
                        );
                        Navigator.pop(ctx, (n != null && n > 0) ? n : null);
                      },
                      child: const Text('Salvar'),
                    ),
                  ],
                ),
              );
              if (result != null) timer.setCreditMultiplier(result);
            },
          ),
          _tile(
            icon: Icons.timer,
            title: 'Tempo de foco',
            subtitle: '${timer.focusDuration ~/ 60} min',
            onTap: () => _editDuration(
              context,
              title: 'Tempo de foco (min)',
              currentMinutes: timer.focusDuration ~/ 60,
              onSave: (m) => timer.setFocusDuration(m),
            ),
          ),
          _tile(
            icon: Icons.free_breakfast,
            title: 'Tempo de pausa',
            subtitle: '${timer.breakDuration ~/ 60} min',
            onTap: () => _editDuration(
              context,
              title: 'Tempo de pausa (min)',
              currentMinutes: timer.breakDuration ~/ 60,
              onSave: (m) => timer.setBreakDuration(m),
            ),
          ),
          _tile(
            icon: Icons.repeat,
            title: 'Ciclos até completar',
            subtitle: '${timer.targetCycles}',
            onTap: () => _editDuration(
              context,
              title: 'Quantidade de ciclos',
              currentMinutes: timer.targetCycles,
              onSave: (m) => timer.setTargetCycles(m),
            ),
          ),
        ],
      ),
    );
  }

  Widget _tile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
      ),
      child: ListTile(
        leading: Icon(icon, color: Colors.greenAccent),
        title: Text(title, style: const TextStyle(color: Colors.white)),
        subtitle: Text(subtitle, style: const TextStyle(color: Colors.grey)),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey),
        onTap: onTap,
      ),
    );
  }
}
