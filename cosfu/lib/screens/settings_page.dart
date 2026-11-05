import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/rewards_provider.dart';
import '../widgets/option_card.dart';
import 'distractions_page.dart';
import 'pomodoro_settings_page.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  void _placeholder(BuildContext context, String name) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text('"$name" — em breve')));
  }

  Future<void> _editTaskReward(BuildContext context) async {
    final rewards = context.read<RewardsProvider>();
    final controller = TextEditingController(text: '${rewards.creditsPerTask}');
    final result = await showDialog<int>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        title: const Text(
          'Créditos por tarefa',
          style: TextStyle(color: Colors.white),
        ),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          autofocus: true,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            labelText: 'Minutos de crédito por tarefa concluída',
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
              Navigator.pop(ctx, (n != null && n >= 0) ? n : null);
            },
            child: const Text('Salvar'),
          ),
        ],
      ),
    );
    if (result != null) await rewards.setCreditsPerTask(result);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Text(
          'Configurações',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const _SectionTitle('Gerenciar'),
            OptionCard(
              icon: Icons.timer_outlined,
              title: 'Pomodoro',
              subtitle: 'Defina o tempo de foco e as pausas',
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PomodoroSettingsPage()),
              ),
            ),
            OptionCard(
              icon: Icons.task_alt,
              title: 'Tarefas',
              subtitle: 'Recompensa por tarefa concluída',
              onTap: () => _editTaskReward(context),
            ),
            OptionCard(
              icon: Icons.bolt_outlined,
              title: 'Ganho por esforço',
              subtitle: 'Defina quanto crédito ganhar com o seu esforço',
              onTap: () => _placeholder(context, 'Ganho por esforço'),
            ),
            OptionCard(
              icon: Icons.block,
              title: 'Distrações',
              subtitle: 'Selecione os apps que te atrapalham no foco',
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const DistractionsPage()),
              ),
            ),
            OptionCard(
              icon: Icons.lock_clock,
              title: 'Vícios',
              subtitle: 'Apps bloqueados que exigem créditos',
              onTap: () => _placeholder(context, 'Vícios'),
            ),
            const SizedBox(height: 20),
            const _SectionTitle('Aparência'),
            OptionCard(
              icon: Icons.palette_outlined,
              title: 'Tema da Interface',
              subtitle: 'Personalizar cores e destaques',
              onTap: () => _placeholder(context, 'Tema'),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;
  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 12),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Colors.greenAccent,
        ),
      ),
    );
  }
}