import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:cosfu/providers/credit_provider.dart';
import 'package:cosfu/providers/task_provider.dart';
import 'package:cosfu/providers/timer_provider.dart';
import 'package:cosfu/screens/main_shell.dart';

void main() {
  testWidgets('App inicia na HomePage sem erros', (tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => CreditProvider()),
          ChangeNotifierProxyProvider<CreditProvider, TimerProvider>(
            create: (_) => TimerProvider(),
            update: (_, credit, timer) {
              timer!.setCreditProvider(credit);
              return timer;
            },
          ),
          ChangeNotifierProvider(create: (_) => TaskProvider()),
        ],
        child: const MaterialApp(home: MainShell()),
      ),
    );

    // Aguarda carregamento dos providers (SharedPreferences mock)
    await tester.pumpAndSettle();

    // Verifica se o título "Experge" aparece na HomePage
    expect(find.text('Experge'), findsOneWidget);
  });
}