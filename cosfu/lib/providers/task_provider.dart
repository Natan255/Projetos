import 'dart:convert';
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/task.dart';
import 'credit_provider.dart';
import 'rewards_provider.dart';

class TaskProvider with ChangeNotifier {
  List<Task> _tasks = [];
  CreditProvider? _creditProvider;
  RewardsProvider? _rewardsProvider;

  List<Task> get tasks => List.unmodifiable(_tasks);
  int get completedTasksCount => _tasks.where((t) => t.isCompleted).length;

  TaskProvider() {
    _loadTasks();
  }

  void attachProviders(CreditProvider credit, RewardsProvider rewards) {
    _creditProvider = credit;
    _rewardsProvider = rewards;
  }

  Future<void> _loadTasks() async {
    final prefs = await SharedPreferences.getInstance();
    final tasksJson = prefs.getString('tasks');
    if (tasksJson != null) {
      final List<dynamic> decoded = jsonDecode(tasksJson);
      _tasks = decoded.map((item) => Task.fromMap(item)).toList();
      notifyListeners();
    }
  }

  Future<void> addTask(String title) async {
    final trimmed = title.trim();
    if (trimmed.isEmpty) return;
    _tasks.add(Task(id: DateTime.now().toIso8601String(), title: trimmed));
    await _saveTasks();
    notifyListeners();
  }

  Future<void> toggleTaskStatus(String id) async {
    final index = _tasks.indexWhere((t) => t.id == id);
    if (index == -1) return;

    final task = _tasks[index];
    final wasCompleted = task.isCompleted;
    task.isCompleted = !task.isCompleted;

    // 1º: atualiza a UI imediatamente
    notifyListeners();

    // 2º: persiste em background
    await _saveTasks();

    // 3º: credita/deduz em background, sem travar a UI
    final reward = _rewardsProvider?.creditsPerTask ?? 0;
    if (reward > 0) {
      if (!wasCompleted && task.isCompleted) {
        unawaited(_creditProvider?.addCredits(reward) ?? Future.value());
      } else if (wasCompleted && !task.isCompleted) {
        unawaited(_creditProvider?.spendCredits(reward) ?? Future.value());
      }
    }
  }

  Future<void> removeTask(String id) async {
    _tasks.removeWhere((t) => t.id == id);
    await _saveTasks();
    notifyListeners();
  }

  Future<void> forceSave() async {
    await _saveTasks();
  }

  Future<void> _saveTasks() async {
    final prefs = await SharedPreferences.getInstance();
    final encoded = jsonEncode(_tasks.map((t) => t.toMap()).toList());
    await prefs.setString('tasks', encoded);
  }
}
