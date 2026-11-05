import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'providers/blocked_apps_provider.dart'; // <-- tem que estar aqui
import 'providers/credit_provider.dart';
import 'providers/rewards_provider.dart';
import 'providers/task_provider.dart';
import 'providers/timer_provider.dart';
import 'screens/main_shell.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CreditProvider()),
        ChangeNotifierProvider(create: (_) => BlockedAppsProvider()), // <-- FALTAVA ESTE
        ChangeNotifierProvider(create: (_) => RewardsProvider()),
        ChangeNotifierProxyProvider<CreditProvider, TimerProvider>(
          create: (_) => TimerProvider(),
          update: (_, credit, timer) {
            timer!.setCreditProvider(credit);
            return timer;
          },
        ),
        ChangeNotifierProxyProvider2<CreditProvider, RewardsProvider,
            TaskProvider>(
          create: (_) => TaskProvider(),
          update: (_, credit, rewards, task) {
            task!.attachProviders(credit, rewards);
            return task;
          },
        ),
      ],
      child: const ExpergeApp(),
    ),
  );
}

class ExpergeApp extends StatelessWidget {
  const ExpergeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Experge',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.green,
          brightness: Brightness.dark,
          secondaryContainer: Colors.green.withValues(alpha: 0.3),
        ),
      ),
      home: const MainShell(),
    );
  }
}