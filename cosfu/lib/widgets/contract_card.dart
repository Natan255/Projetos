import 'package:flutter/material.dart';

class ContractCard extends StatelessWidget {
  final String title;
  final String description;
  final String reward;
  final String risk;
  final VoidCallback onAccept;

  const ContractCard({
    super.key,
    required this.title,
    required this.description,
    required this.reward,
    required this.risk,
    required this.onAccept,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 260,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16)),
          const SizedBox(height: 8),
          Text(description,
              style: const TextStyle(color: Colors.grey, fontSize: 12)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Ganho: $reward",
                      style: const TextStyle(
                          color: Colors.greenAccent,
                          fontSize: 11,
                          fontWeight: FontWeight.bold)),
                  Text("Risco: $risk",
                      style: const TextStyle(
                          color: Colors.redAccent, fontSize: 11)),
                ],
              ),
              ElevatedButton(
                onPressed: onAccept,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.greenAccent,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                ),
                child: const Text("Aceitar"),
              ),
            ],
          ),
        ],
      ),
    );
  }
}