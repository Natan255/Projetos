import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/blocked_apps_provider.dart';
import '../providers/credit_provider.dart';
import '../providers/rewards_provider.dart';
import '../providers/task_provider.dart';
import 'focus_page.dart';
import 'home_page.dart';
import 'leisure_page.dart';
import 'market_page.dart';
import 'stats_page.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> with WidgetsBindingObserver {
  int _abaSelecionada = 2;

  static const List<Widget> _paginas = [
    StatsPage(),
    FocusPage(),
    HomePage(),
    LeisurePage(),
    MarketPage(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // App voltou ao foreground: reenvia estado pro Kotlin (caso o serviço tenha morrido e voltado)
      context.read<BlockedAppsProvider>().forceSave();
    }
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive ||
        state == AppLifecycleState.detached) {
      try {
        context.read<CreditProvider>().forceSave();
        context.read<BlockedAppsProvider>().forceSave();
        context.read<TaskProvider>().forceSave();
        context.read<RewardsProvider>().forceSave();
      } catch (_) {}
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _paginas[_abaSelecionada],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _abaSelecionada,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysHide,
        backgroundColor: const Color(0xFF1E1E1E),
        indicatorColor: const Color.fromARGB(255, 72, 178, 127),
        onDestinationSelected: (index) {
          setState(() => _abaSelecionada = index);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.analytics, size: 28, color: Colors.white),
            selectedIcon: Icon(Icons.analytics, size: 30, color: Colors.black),
            label: '',
          ),
          NavigationDestination(
            icon: Icon(
              Icons.remove_red_eye_sharp,
              size: 28,
              color: Colors.white,
            ),
            selectedIcon: Icon(
              Icons.remove_red_eye_sharp,
              size: 30,
              color: Colors.black,
            ),
            label: '',
          ),
          NavigationDestination(
            icon: Icon(Icons.home, size: 28, color: Colors.white),
            selectedIcon: Icon(Icons.home, size: 30, color: Colors.black),
            label: '',
          ),
          NavigationDestination(
            icon: Icon(
              Icons.attach_money_outlined,
              size: 28,
              color: Colors.white,
            ),
            selectedIcon: Icon(
              Icons.attach_money_outlined,
              size: 30,
              color: Colors.black,
            ),
            label: '',
          ),
          NavigationDestination(
            icon: Icon(Icons.shopping_bag, size: 28, color: Colors.white),
            selectedIcon: Icon(
              Icons.shopping_bag,
              size: 30,
              color: Colors.black,
            ),
            label: '',
          ),
        ],
      ),
    );
  }
}
