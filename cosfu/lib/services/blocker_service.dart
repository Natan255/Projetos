import 'package:flutter/services.dart';

import '../models/blocked_app.dart';

class BlockerService {
  static const MethodChannel _channel = MethodChannel(
    'com.example.cosfu/blocker',
  );

  /// Envia a lista atualizada de apps bloqueados para o serviço nativo.
  static Future<void> updateBlockedApps(
    List<BlockedApp> apps,
    List<BlockedApp> unlocked,
  ) async {
    final blockedPackages = apps
        .where((a) => !a.isUnlocked)
        .map((a) => a.packageName)
        .toList();

    final unlockedMap = <String, int>{};
    for (final app in unlocked) {
      unlockedMap[app.packageName] = app.unlockedUntil!.millisecondsSinceEpoch;
    }

    await _channel.invokeMethod('updateBlockedApps', {
      'blocked': blockedPackages,
      'unlockedUntil': unlockedMap,
    });
  }

  /// Verifica se o serviço de acessibilidade está ativado.
  static Future<bool> isAccessibilityEnabled() async {
    final result = await _channel.invokeMethod<bool>('isAccessibilityEnabled');
    return result ?? false;
  }

  /// Abre a tela de configurações de acessibilidade do Android.
  static Future<void> openAccessibilitySettings() async {
    await _channel.invokeMethod('openAccessibilitySettings');
  }

  /// Atualiza o custo global (opcional).
  static Future<void> updateCost(int minutes) async {
    await _channel.invokeMethod('updateAppCost', {'cost': minutes});
  }

  static Future<bool> isBlockerRunning() async {
      final result = await _channel.invokeMethod<bool>('isBlockerRunning');
      return result ?? false;

  }

  /// Abre as configurações do app no Android (para desativar otimização de bateria).
  static Future<void> openAppSettings() async {
    await _channel.invokeMethod('openAppSettings');
  }
}