import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/blocked_app.dart';
import '../services/blocker_service.dart';
import 'credit_provider.dart';

class BlockedAppsProvider with ChangeNotifier {
  static const String _prefsKey = 'blocked_apps';
  List<BlockedApp> _apps = [];
  List<BlockedApp> get apps => List.unmodifiable(_apps);
  Timer? _expiryWatcher;
  bool _loaded = false;

  BlockedAppsProvider() {
    _load();
    _startExpiryWatcher();
  }

  Future<void> _load() async {
    if (_loaded) return; // ← NOVO: não sobrescreve depois de carregado
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_prefsKey);
    if (raw != null && _apps.isEmpty) {
      // ← NOVO: só se ainda não tem nada
      final List<dynamic> decoded = jsonDecode(raw);
      _apps = decoded.map((e) => BlockedApp.fromMap(e)).toList();
    }
    _loaded = true; // ← NOVO
    await _syncWithNative();
    notifyListeners();
  }

  bool isBlocked(String packageName) =>
      _apps.any((a) => a.packageName == packageName);

  BlockedApp? getByPackage(String packageName) {
    try {
      return _apps.firstWhere((a) => a.packageName == packageName);
    } catch (_) {
      return null;
    }
  }

  Future<void> addApp(BlockedApp app) async {
    if (isBlocked(app.packageName)) return;
    _apps.add(app);
    await _save();
    await _syncWithNative();
    notifyListeners();
  }

  Future<void> removeApp(String packageName) async {
    _apps.removeWhere((a) => a.packageName == packageName);
    await _save();
    await _syncWithNative();
    notifyListeners();
  }

  Future<void> updateCost(String packageName, int minutes) async {
    final index = _apps.indexWhere((a) => a.packageName == packageName);
    if (index == -1) return;
    _apps[index] = _apps[index].copyWith(unlockCostMinutes: minutes);
    await _save();
    await _syncWithNative();
    notifyListeners();
  }

  /// Gasta crédito e libera o app por `unlockCostMinutes`.
  Future<bool> tryUnlock(String packageName, CreditProvider credit) async {
    final index = _apps.indexWhere((a) => a.packageName == packageName);
    print('TRY_UNLOCK: index=$index, package=$packageName');
    if (index == -1) return false;

    final app = _apps[index];
    final success = await credit.spendCredits(app.unlockCostMinutes);
    print('TRY_UNLOCK: spendCredits=$success');
    if (!success) return false;

    final until = DateTime.now().add(Duration(minutes: app.unlockCostMinutes));
    print('TRY_UNLOCK: until=$until');

    _apps[index] = BlockedApp(
      packageName: app.packageName,
      appName: app.appName,
      unlockCostMinutes: app.unlockCostMinutes,
      unlockedUntil: until,
    );

    print('TRY_UNLOCK: isUnlocked=${_apps[index].isUnlocked}');
    await _save();
    print('TRY_UNLOCK: _save OK');
    await _syncWithNative();
    print('TRY_UNLOCK: _syncWithNative OK');
    notifyListeners();
    return true;
  }

  Future<void> forceSave() async {
    await _save();
    await _syncWithNative();
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = jsonEncode(_apps.map((a) => a.toMap()).toList());
    await prefs.setString(_prefsKey, raw);
  }

  Future<void> _syncWithNative() async {
    final unlocked = _apps.where((a) => a.isUnlocked).toList();
    print('SYNC: total=${_apps.length}, unlocked=${unlocked.length}');
    for (final a in _apps) {
      print(
        '  ${a.packageName}: isUnlocked=${a.isUnlocked}, until=${a.unlockedUntil}',
      );
    }
    await BlockerService.updateBlockedApps(_apps, unlocked);
  }

  /// A cada 30s, limpa os unlocks expirados e re-sincroniza com o Kotlin.
  void _startExpiryWatcher() {
    _expiryWatcher?.cancel();
    _expiryWatcher = Timer.periodic(const Duration(seconds: 30), (_) {
      bool changed = false;
      for (var i = 0; i < _apps.length; i++) {
        final app = _apps[i];
        if (app.unlockedUntil != null &&
            app.unlockedUntil!.isBefore(DateTime.now())) {
          _apps[i] = app.copyWith(clearUnlock: true);
          changed = true;
        }
      }
      if (changed) {
        _save();
        _syncWithNative();
        notifyListeners();
      }
    });
  }

  @override
  void dispose() {
    _expiryWatcher?.cancel();
    super.dispose();
  }
}
