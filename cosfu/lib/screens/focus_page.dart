import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/timer_provider.dart';
import 'settings_page.dart';

class FocusPage extends StatelessWidget {
  const FocusPage({super.key});

  @override
  Widget build(BuildContext context) {
    final timer = context.watch<TimerProvider>();
    final isRunning = timer.status == TimerStatus.running;
    final isBreak = timer.mode == TimerMode.breakTime;

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Row(
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
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 40),
                    Text(
                      isBreak ? 'PAUSA' : 'FOCO',
                      style: TextStyle(
                        color: isBreak ? Colors.orangeAccent : Colors.greenAccent,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 4,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      timer.timerText,
                      style: const TextStyle(
                        fontSize: 64,
                        fontWeight: FontWeight.bold,
                        color: Colors.greenAccent,
                        letterSpacing: 2,
                      ),
                    ),
                    Text(
                      'Ciclo ${timer.cyclesCompleted}/${timer.targetCycles}',
                      style: const TextStyle(
                          fontSize: 16, color: Colors.grey, letterSpacing: 2),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.greenAccent,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 48, vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                      ),
                      onPressed: () {
                        if (isRunning) {
                          timer.pauseTimer();
                        } else {
                          timer.startTimer();
                        }
                      },
                      child: Text(
                        isRunning ? 'Pausar' : 'Iniciar',
                        style: const TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        OutlinedButton(
                          onPressed: timer.resetTimer,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Colors.white24),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 24, vertical: 12),
                          ),
                          child: const Text('Resetar'),
                        ),
                        const SizedBox(width: 12),
                        OutlinedButton(
                          onPressed: timer.resetCycles,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Colors.white24),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 24, vertical: 12),
                          ),
                          child: const Text('Zerar ciclos'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    _CycleInput(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CycleInput extends StatefulWidget {
  @override
  State<_CycleInput> createState() => _CycleInputState();
}

class _CycleInputState extends State<_CycleInput> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    final target = context.read<TimerProvider>().targetCycles;
    _controller = TextEditingController(text: '$target');
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 140,
      child: TextField(
        controller: _controller,
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          hintText: 'Ciclos',
          hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
          filled: true,
          fillColor: const Color(0xFF1E1E1E),
          contentPadding: const EdgeInsets.symmetric(vertical: 10),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
        ),
        onChanged: (value) {
          final n = int.tryParse(value);
          if (n != null && n > 0) {
            context.read<TimerProvider>().setTargetCycles(n);
          }
        },
      ),
    );
  }
}