import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/credit_provider.dart';
import '../widgets/contract_card.dart';
import '../widgets/powerup_card.dart';
import 'settings_page.dart';

class MarketPage extends StatelessWidget {
  const MarketPage({super.key});

  Future<void> _buyPowerUp(
      BuildContext context, String name, int cost) async {
    final credit = context.read<CreditProvider>();
    final ok = await credit.spendCredits(cost);
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          ok ? '$name adquirido!' : 'Créditos insuficientes!',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final credit = context.watch<CreditProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
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
              ),
              const SizedBox(height: 16),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Text('Desafios',
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.greenAccent)),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 160,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    ContractCard(
                      title: 'Sprint de 7 dias',
                      description:
                          'Foque 1h por dia durante 1 semana inteira.',
                      reward: '+100 min',
                      risk: '-50 min',
                      onAccept: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Contrato "Sprint" aceito!')),
                        );
                      },
                    ),
                    const SizedBox(width: 12),
                    ContractCard(
                      title: 'Foco Hardcore',
                      description:
                          'Complete 3 ciclos sem pausar no meio.',
                      reward: '+60 min',
                      risk: '-30 min',
                      onAccept: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content:
                                  Text('Contrato "Hardcore" aceito!')),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Power UP',
                        style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.greenAccent,
                            letterSpacing: 2)),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        PowerUpCard(
                          title: 'Escudo de Foco',
                          icon: Icons.shield_outlined,
                          price: '30 min',
                          onTap: () => _buyPowerUp(
                              context, 'Escudo de Foco', 30),
                        ),
                        PowerUpCard(
                          title: 'Dobro de XP',
                          icon: Icons.bolt,
                          price: '45 min',
                          onTap: () =>
                              _buyPowerUp(context, 'Dobro de XP', 45),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}