import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class RewardsProvider with ChangeNotifier {
  int _creditsPerTask = 5;
  int get creditsPerTask => _creditsPerTask;

  RewardsProvider() {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    _creditsPerTask = prefs.getInt('credits_per_task') ?? 5;
    notifyListeners();
  }

  Future<void> setCreditsPerTask(int credits) async {
    if (credits < 0) return;
    _creditsPerTask = credits;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('credits_per_task', credits);
    notifyListeners();
  }

  Future<void> forceSave() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('credits_per_task', _creditsPerTask);
  }
}
