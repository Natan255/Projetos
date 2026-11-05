import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/credit_provider.dart';
import '../providers/task_provider.dart';
import '../providers/timer_provider.dart';

class StatsPage extends StatelessWidget {
  const StatsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final credit = context.watch<CreditProvider>();
    final task = context.watch<TaskProvider>();
    final timer = context.watch<TimerProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Estatísticas',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold)),
              const SizedBox(height: 24),
              _StatTile(
                icon: Icons.bolt,
                label: 'Créditos',
                value: '${credit.credits} min',
              ),
              _StatTile(
                icon: Icons.local_fire_department,
                label: 'Streak',
                value: '${credit.streakDays} dias',
              ),
              _StatTile(
                icon: Icons.timelapse,
                label: 'Ciclos concluídos',
                value: '${timer.cyclesCompleted}',
              ),
              _StatTile(
                icon: Icons.check_circle_outline,
                label: 'Tarefas concluídas',
                value: '${task.completedTasksCount} / ${task.tasks.length}',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _StatTile({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.greenAccent, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Text(label,
                style: const TextStyle(color: Colors.white70, fontSize: 14)),
          ),
          Text(value,
              style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16)),
        ],
      ),
    );
  }
}