import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/credit_provider.dart';
import '../providers/task_provider.dart';
import '../providers/timer_provider.dart';
import 'settings_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final TextEditingController _tarefaController = TextEditingController();

  @override
  void dispose() {
    _tarefaController.dispose();
    super.dispose();
  }

  void _mostrarDialogoNovaTarefa() {
    _tarefaController.clear();
    showDialog(
      context: context,
      builder: (dialogContext) {
        final taskProvider = dialogContext.read<TaskProvider>();
        return AlertDialog(
          backgroundColor: const Color(0xFF1E1E1E),
          title: const Text('Nova Tarefa',
              style: TextStyle(
                  color: Colors.white, fontWeight: FontWeight.bold)),
          content: TextField(
            controller: _tarefaController,
            autofocus: true,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              hintText: 'Digite a sua tarefa...',
              hintStyle: TextStyle(color: Colors.white38),
              enabledBorder: UnderlineInputBorder(
                borderSide:
                    BorderSide(color: Color.fromARGB(255, 72, 178, 127)),
              ),
              focusedBorder: UnderlineInputBorder(
                borderSide:
                    BorderSide(color: Color.fromARGB(255, 72, 178, 127)),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancelar',
                  style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    const Color.fromARGB(255, 72, 178, 127),
              ),
              onPressed: () {
                final text = _tarefaController.text.trim();
                if (text.isNotEmpty) {
                  taskProvider.addTask(text);
                  Navigator.pop(dialogContext);
                }
              },
              child: const Text('Adicionar',
                  style: TextStyle(color: Colors.black)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final taskProvider = context.watch<TaskProvider>();
    final creditProvider = context.watch<CreditProvider>();
    final timer = context.watch<TimerProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const SettingsPage()),
                    ),
                    icon: const Icon(Icons.settings, color: Colors.white),
                  ),
                  Text(
                    timer.timerText,
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14),
                  ),
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Experge',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.bold)),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E1E1E),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.local_fire_department,
                            color: Colors.orangeAccent, size: 20),
                        const SizedBox(width: 4),
                        Text('${creditProvider.streakDays} dias',
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      const Color.fromARGB(255, 72, 178, 127)
                          .withValues(alpha: 0.2),
                      const Color(0xFF1E1E1E),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: const Color.fromARGB(255, 72, 178, 127)
                        .withValues(alpha: 0.3),
                  ),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.format_quote_rounded,
                        color: Color.fromARGB(255, 72, 178, 127),
                        size: 32),
                    SizedBox(height: 8),
                    Text(
                      '"Uma árvore que deseja tocar os céus precisa ter raízes profundas a ponto de chegar no inferno."',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        fontStyle: FontStyle.italic,
                        height: 1.3,
                      ),
                    ),
                    SizedBox(height: 12),
                    Text('— Mark Twain',
                        style: TextStyle(
                            color: Colors.white54,
                            fontSize: 13,
                            fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Tarefas do Dia',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold)),
                  IconButton(
                    onPressed: _mostrarDialogoNovaTarefa,
                    icon: const Icon(Icons.add_circle,
                        color: Color.fromARGB(255, 72, 178, 127),
                        size: 28),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              if (taskProvider.tasks.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 32),
                    child: Text(
                      'Nenhuma tarefa cadastrada para hoje!',
                      style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.4)),
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: taskProvider.tasks.length,
                  itemBuilder: (context, index) {
                    final item = taskProvider.tasks[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E1E1E),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: item.isCompleted
                              ? const Color.fromARGB(255, 72, 178, 127)
                                  .withValues(alpha: 0.3)
                              : Colors.white.withValues(alpha: 0.05),
                        ),
                      ),
                      child: CheckboxListTile(
                        activeColor:
                            const Color.fromARGB(255, 72, 178, 127),
                        checkColor: Colors.black,
                        value: item.isCompleted,
                        onChanged: (_) =>
                            taskProvider.toggleTaskStatus(item.id),
                        title: Text(
                          item.title,
                          style: TextStyle(
                            color: item.isCompleted
                                ? Colors.white38
                                : Colors.white,
                            decoration: item.isCompleted
                                ? TextDecoration.lineThrough
                                : TextDecoration.none,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        secondary: IconButton(
                          icon: const Icon(Icons.delete_outline,
                              color: Colors.grey, size: 20),
                          onPressed: () =>
                              taskProvider.removeTask(item.id),
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}