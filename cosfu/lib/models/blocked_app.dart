class BlockedApp {
  final String packageName;
  final String appName;
  final int unlockCostMinutes;
  final DateTime? unlockedUntil;

  BlockedApp({
    required this.packageName,
    required this.appName,
    this.unlockCostMinutes = 15,
    this.unlockedUntil,
  });

  bool get isUnlocked =>
      unlockedUntil != null && unlockedUntil!.isAfter(DateTime.now());

  int get remainingMinutes {
    if (!isUnlocked) return 0;
    return unlockedUntil!.difference(DateTime.now()).inMinutes + 1;
  }

  Map<String, dynamic> toMap() => {
        'packageName': packageName,
        'appName': appName,
        'unlockCostMinutes': unlockCostMinutes,
        'unlockedUntil': unlockedUntil?.toIso8601String(),
      };

  factory BlockedApp.fromMap(Map<String, dynamic> map) => BlockedApp(
        packageName: map['packageName'] ?? '',
        appName: map['appName'] ?? '',
        unlockCostMinutes: map['unlockCostMinutes'] ?? 15,
        unlockedUntil: map['unlockedUntil'] != null
            ? DateTime.tryParse(map['unlockedUntil'])
            : null,
      );

  BlockedApp copyWith({
    int? unlockCostMinutes,
    DateTime? unlockedUntil,
    bool clearUnlock = false,
  }) {
    return BlockedApp(
      packageName: packageName,
      appName: appName,
      unlockCostMinutes: unlockCostMinutes ?? this.unlockCostMinutes,
      unlockedUntil:
          clearUnlock ? null : (unlockedUntil ?? this.unlockedUntil),
    );
  }
}