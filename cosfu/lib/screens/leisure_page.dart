import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/blocked_apps_provider.dart';
import '../providers/credit_provider.dart';
import '../widgets/option_card.dart';
import 'settings_page.dart';

class LeisurePage extends StatelessWidget {
  const LeisurePage({super.key});

  Future<void> _tryUnlock(BuildContext context, dynamic app) async {
    final credit = context.read<CreditProvider>();
    final blocked = context.read<BlockedAppsProvider>();

    if (app.isUnlocked) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
              '${app.appName} já liberado por ${app.remainingMinutes} min'),
        ),
      );
      return;
    }

    final ok = await blocked.tryUnlock(app.packageName, credit);
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          ok
              ? '${app.appName} liberado por ${app.unlockCostMinutes} min!'
              : 'Créditos insuficientes!',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final credit = context.watch<CreditProvider>();
    final blocked = context.watch<BlockedAppsProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
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
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E1E1E),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.bolt,
                            color: Colors.greenAccent, size: 16),
                        const SizedBox(width: 4),
                        Text('${credit.credits} min',
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
              const Text(
                'Lazer',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.greenAccent),
              ),
              const SizedBox(height: 8),
              const Text(
                'Apps bloqueados. Gaste créditos para liberar.',
                style: TextStyle(color: Colors.grey, fontSize: 13),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: blocked.apps.isEmpty
                    ? const Center(
                        child: Text(
                          'Nenhum app bloqueado ainda.\n'
                          'Vá em Configurações > Distrações para adicionar.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey),
                        ),
                      )
                    : ListView.builder(
                        itemCount: blocked.apps.length,
                        itemBuilder: (context, i) {
                          final app = blocked.apps[i];
                          return OptionCard(
                            icon: app.isUnlocked
                                ? Icons.lock_open
                                : Icons.block,
                            title: app.appName,
                            subtitle: app.isUnlocked
                                ? 'Liberado por ${app.remainingMinutes} min'
                                : '${app.unlockCostMinutes} min para liberar',
                            onTap: () => _tryUnlock(context, app),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}