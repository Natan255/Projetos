import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:device_apps_ng/device_apps_ng.dart';

import '../models/blocked_app.dart';
import '../providers/blocked_apps_provider.dart';
import '../services/blocker_service.dart';

class DistractionsPage extends StatefulWidget {
  const DistractionsPage({super.key});

  @override
  State<DistractionsPage> createState() => _DistractionsPageState();
}

class _DistractionsPageState extends State<DistractionsPage> {
  List<Application> _installedApps = [];
  List<Application> _filteredApps = [];
  bool _loading = true;
  bool _accessibilityEnabled = false;
  Future<void> _editCost(BlockedApp app) async {
    final controller = TextEditingController(text: '${app.unlockCostMinutes}');
    final result = await showDialog<int>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        title: Text(
          'Editar "${app.appName}"',
          style: const TextStyle(color: Colors.white),
        ),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          autofocus: true,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            labelText: 'Custo para desbloquear (min)',
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
              Navigator.pop(ctx, (n != null && n > 0) ? n : null);
            },
            child: const Text('Salvar'),
          ),
        ],
      ),
    );
    if (result == null) return;
    await context.read<BlockedAppsProvider>().updateCost(
      app.packageName,
      result,
    );
  }

  Future<void> _confirmRemove(BlockedApp app) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        title: const Text(
          'Remover bloqueio?',
          style: TextStyle(color: Colors.white),
        ),
        content: Text(
          'Desbloquear "${app.appName}"?',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              foregroundColor: Colors.black,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Remover'),
          ),
        ],
      ),
    );
    if (ok == true && mounted) {
      await context.read<BlockedAppsProvider>().removeApp(app.packageName);
    }
  }

  @override
  void initState() {
    super.initState();
    _checkAccessibility();
    _loadApps();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Revalida ao voltar das configurações do Android
    _checkAccessibility();
  }

  Future<void> _checkAccessibility() async {
    try {
      final enabled = await BlockerService.isAccessibilityEnabled();
      if (mounted) {
        setState(() => _accessibilityEnabled = enabled);
      }
    } catch (_) {
      if (mounted) {
        setState(() => _accessibilityEnabled = false);
      }
    }
  }

  Future<void> _openAccessibilitySettings() async {
    await BlockerService.openAccessibilitySettings();
    // Ao voltar do settings, o didChangeDependencies revalida
  }

  Future<void> _loadApps() async {
    try {
      final apps = await DeviceApps.getInstalledApplications(
        includeSystemApps: false,
        onlyAppsWithLaunchIntent: true,
        includeAppIcons: true,
      );
      apps.sort((a, b) {
        final an = (a as ApplicationWithIcon).appName.toLowerCase();
        final bn = (b as ApplicationWithIcon).appName.toLowerCase();
        return an.compareTo(bn);
      });
      if (!mounted) return;
      setState(() {
        _installedApps = apps;
        _filteredApps = apps;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Erro ao listar apps: $e')));
    }
  }

  void _filter(String term) {
    setState(() {
      _filteredApps = term.isEmpty
          ? _installedApps
          : _installedApps.where((a) {
              final name = (a as ApplicationWithIcon).appName.toLowerCase();
              return name.contains(term.toLowerCase());
            }).toList();
    });
  }

  Future<void> _selectApp(Application app) async {
    final withIcon = app as ApplicationWithIcon;
    final provider = context.read<BlockedAppsProvider>();

    if (provider.isBlocked(app.packageName)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('"${withIcon.appName}" já está bloqueado')),
      );
      return;
    }

    final cost = await showDialog<int>(
      context: context,
      builder: (ctx) {
        final controller = TextEditingController(text: '15');
        return AlertDialog(
          backgroundColor: const Color(0xFF1E1E1E),
          title: Text(
            'Bloquear "${withIcon.appName}"',
            style: const TextStyle(color: Colors.white),
          ),
          content: TextField(
            controller: controller,
            keyboardType: TextInputType.number,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              labelText: 'Custo para desbloquear (min)',
              labelStyle: TextStyle(color: Colors.grey),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, null),
              child: const Text(
                'Cancelar',
                style: TextStyle(color: Colors.grey),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.greenAccent,
                foregroundColor: Colors.black,
              ),
              onPressed: () {
                final n = int.tryParse(controller.text);
                Navigator.pop(ctx, (n != null && n > 0) ? n : 15);
              },
              child: const Text('Bloquear'),
            ),
          ],
        );
      },
    );

    if (cost == null) return;

    await provider.addApp(
      BlockedApp(
        packageName: app.packageName,
        appName: withIcon.appName,
        unlockCostMinutes: cost,
      ),
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('"${withIcon.appName}" bloqueado!')),
      );
    }
  }

  // ===== Banner de ativação =====
  Widget _buildAccessibilityBanner() {
    if (_accessibilityEnabled) {
      return Container(
        margin: const EdgeInsets.fromLTRB(16, 8, 16, 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.greenAccent.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.greenAccent.withValues(alpha: 0.3)),
        ),
        child: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.greenAccent, size: 20),
            SizedBox(width: 8),
            Expanded(
              child: Text(
                'Bloqueio real ativo',
                style: TextStyle(
                  color: Colors.greenAccent,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.orange.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.orangeAccent.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(
                Icons.warning_amber_rounded,
                color: Colors.orangeAccent,
                size: 20,
              ),
              SizedBox(width: 8),
              Text(
                'Bloqueio real desativado',
                style: TextStyle(
                  color: Colors.orangeAccent,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Ative o serviço de acessibilidade do Experge para que os apps '
            'sejam bloqueados de verdade quando você tentar abri-los.',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orangeAccent,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 10),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              onPressed: _openAccessibilitySettings,
              icon: const Icon(Icons.settings_accessibility, size: 18),
              label: const Text(
                'Ativar bloqueio agora',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BlockedAppsProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Text(
          'Distrações',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            tooltip: 'Revalidar bloqueio',
            onPressed: _checkAccessibility,
            icon: const Icon(Icons.refresh, color: Colors.white),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildAccessibilityBanner(),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: TextField(
              style: const TextStyle(color: Colors.white),
              onChanged: _filter,
              decoration: InputDecoration(
                hintText: 'Buscar app instalado...',
                hintStyle: const TextStyle(color: Colors.grey),
                prefixIcon: const Icon(Icons.search, color: Colors.grey),
                filled: true,
                fillColor: const Color(0xFF1E1E1E),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          if (provider.apps.isNotEmpty) ...[
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Bloqueados',
                  style: TextStyle(
                    color: Colors.greenAccent,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
            SizedBox(
              height: 40,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                itemCount: provider.apps.length,
                itemBuilder: (context, i) {
                  final app = provider.apps[i];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: GestureDetector(
                      onTap: () => _editCost(app),
                      child: Chip(
                        backgroundColor: const Color(0xFF1E1E1E),
                        label: Text(
                          '${app.appName} (${app.unlockCostMinutes}min)',
                          style: const TextStyle(color: Colors.white),
                        ),
                        deleteIcon: const Icon(
                          Icons.close,
                          size: 18,
                          color: Colors.white,
                        ),
                        onDeleted: () => _confirmRemove(app),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 8),
          ],
          const Divider(color: Colors.white12),
          Expanded(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(color: Colors.greenAccent),
                  )
                : _filteredApps.isEmpty
                ? const Center(
                    child: Text(
                      'Nenhum app encontrado',
                      style: TextStyle(color: Colors.grey),
                    ),
                  )
                : ListView.builder(
                    itemCount: _filteredApps.length,
                    itemBuilder: (context, i) {
                      final app = _filteredApps[i] as ApplicationWithIcon;
                      final blocked = provider.isBlocked(app.packageName);
                      return ListTile(
                        leading: app.icon != null
                            ? Image.memory(app.icon!, width: 40, height: 40)
                            : const Icon(
                                Icons.android,
                                color: Colors.greenAccent,
                                size: 40,
                              ),
                        title: Text(
                          app.appName,
                          style: const TextStyle(color: Colors.white),
                        ),
                        subtitle: Text(
                          app.packageName,
                          style: const TextStyle(
                            color: Colors.grey,
                            fontSize: 11,
                          ),
                        ),
                        trailing: blocked
                            ? IconButton(
                                icon: const Icon(
                                  Icons.lock_open,
                                  color: Colors.orangeAccent,
                                ),
                                tooltip: 'Desbloquear',
                                onPressed: () => _confirmRemove(
                                  provider.getByPackage(app.packageName)!,
                                ),
                              )
                            : IconButton(
                                icon: const Icon(
                                  Icons.lock_open,
                                  color: Colors.greenAccent,
                                ),
                                tooltip: 'Bloquear',
                                onPressed: () => _selectApp(app),
                              ),
                        onTap: blocked
                            ? () => _confirmRemove(
                                provider.getByPackage(app.packageName)!,
                              )
                            : () => _selectApp(app),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
