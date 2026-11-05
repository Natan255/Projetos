import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/user_profile.dart';

class CreditProvider with ChangeNotifier {
  UserProfile _user = UserProfile();

  UserProfile get user => _user;
  int get credits => _user.credits;
  int get streakDays => _user.streakDays;

  CreditProvider() {
    _loadUserProfile();
  }

  Future<void> _loadUserProfile() async {
    final prefs = await SharedPreferences.getInstance();
    _user = UserProfile(
      credits: prefs.getInt('credits') ?? 0,
      streakDays: prefs.getInt('streak_days') ?? 0,
      lastActiveDate: prefs.getString('last_active_date'),
    );
    await _updateStreak();
    notifyListeners();
  }

  /// Atualiza streak com base na data do último uso.
  Future<void> _updateStreak() async {
    final now = DateTime.now();
    final today = _dateKey(now);

    if (_user.lastActiveDate == today) return;

    if (_user.lastActiveDate == null) {
      _user.streakDays = 1;
    } else {
      final last = DateTime.tryParse(_user.lastActiveDate!);
      if (last != null) {
        final diff = DateTime(
          now.year,
          now.month,
          now.day,
        ).difference(DateTime(last.year, last.month, last.day)).inDays;
        if (diff == 1) {
          _user.streakDays += 1;
        } else if (diff > 1) {
          _user.streakDays = 1; // streak quebrou
        }
      }
    }
    _user.lastActiveDate = today;
    await _saveUserProfile();
  }

  String _dateKey(DateTime d) =>
      '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  Future<void> addCredits(int amount) async {
    if (amount <= 0) return;
    _user.credits += amount;
    await _saveUserProfile();
    notifyListeners();
  }

  Future<bool> spendCredits(int amount) async {
    if (amount <= 0) return false;
    if (_user.credits >= amount) {
      _user.credits -= amount;
      await _saveUserProfile();
      notifyListeners();
      return true;
    }
    return false;
  }

  Future<void> _saveUserProfile() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('credits', _user.credits);
    await prefs.setInt('streak_days', _user.streakDays);
    if (_user.lastActiveDate != null) {
      await prefs.setString('last_active_date', _user.lastActiveDate!);
    }
  }

  Future<void> forceSave() async {
    await _saveUserProfile();
  }
}
