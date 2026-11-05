import 'dart:async';

import 'package:flutter/material.dart';

import 'credit_provider.dart';

enum TimerStatus { initial, running, paused, completed }

enum TimerMode { focus, breakTime }

class TimerProvider with ChangeNotifier {
  CreditProvider? _creditProvider;

  // Configurações
  int _focusDuration = 25 * 60;
  int _breakDuration = 5 * 60;
  int _targetCycles = 4;
  double _creditMultiplier = 1.0; // <-- AGORA DENTRO DA CLASSE

  // Estado atual
  int _remainingSeconds = 25 * 60;
  int _cyclesCompleted = 0;
  TimerStatus _status = TimerStatus.initial;
  TimerMode _mode = TimerMode.focus;
  Timer? _timer;
  DateTime? _endTime;

  // -------- Getters --------
  int get remainingSeconds => _remainingSeconds;
  TimerStatus get status => _status;
  TimerMode get mode => _mode;
  int get focusDuration => _focusDuration;
  int get breakDuration => _breakDuration;
  int get cyclesCompleted => _cyclesCompleted;
  int get targetCycles => _targetCycles;
  double get creditMultiplier => _creditMultiplier;

  String get timerText {
    final minutes = (_remainingSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (_remainingSeconds % 60).toString().padLeft(2, '0');
    return "$minutes:$seconds";
  }

  // -------- Configurações --------
  void setFocusDuration(int minutes) {
    if (minutes <= 0) return;
    _focusDuration = minutes * 60;
    if (_status == TimerStatus.initial && _mode == TimerMode.focus) {
      _remainingSeconds = _focusDuration;
    }
    notifyListeners();
  }

  void setBreakDuration(int minutes) {
    if (minutes < 0) return;
    _breakDuration = minutes * 60;
    if (_status == TimerStatus.initial && _mode == TimerMode.breakTime) {
      _remainingSeconds = _breakDuration;
    }
    notifyListeners();
  }

  void setTargetCycles(int cycles) {
    if (cycles <= 0) return;
    _targetCycles = cycles;
    notifyListeners();
  }

  void setCreditMultiplier(double multiplier) {
    if (multiplier <= 0) return;
    _creditMultiplier = multiplier;
    notifyListeners();
  }

  void setCreditProvider(CreditProvider provider) {
    _creditProvider = provider;
  }

  // -------- Controles --------
  void startTimer() {
    if (_status == TimerStatus.running) return;
    if (_remainingSeconds <= 0) resetTimer();

    _status = TimerStatus.running;
    _endTime = DateTime.now().add(Duration(seconds: _remainingSeconds));

    _timer?.cancel();
    _timer = Timer.periodic(const Duration(milliseconds: 250), (_) {
      final left = _endTime!.difference(DateTime.now()).inSeconds;
      if (left <= 0) {
        _remainingSeconds = 0;
        _completeCycle();
      } else if (left != _remainingSeconds) {
        _remainingSeconds = left;
        notifyListeners();
      }
    });
    notifyListeners();
  }

  void pauseTimer() {
    _timer?.cancel();
    _timer = null;
    _status = TimerStatus.paused;
    notifyListeners();
  }

  void resetTimer() {
    _timer?.cancel();
    _timer = null;
    _status = TimerStatus.initial;
    _mode = TimerMode.focus;
    _remainingSeconds = _focusDuration;
    notifyListeners();
  }

  void _completeCycle() {
    _timer?.cancel();
    _timer = null;

    if (_mode == TimerMode.focus) {
      final minutes = _focusDuration ~/ 60;
      final credits = (minutes * _creditMultiplier).round();
      _creditProvider?.addCredits(credits);
      _cyclesCompleted++;

      if (_cyclesCompleted >= _targetCycles) {
        _status = TimerStatus.completed;
        _mode = TimerMode.focus;
        _remainingSeconds = _focusDuration;
      } else {
        _mode = TimerMode.breakTime;
        _remainingSeconds = _breakDuration;
        _status = TimerStatus.initial;
      }
    } else {
      _mode = TimerMode.focus;
      _remainingSeconds = _focusDuration;
      _status = TimerStatus.initial;
    }
    notifyListeners();
  }

  void resetCycles() {
    _cyclesCompleted = 0;
    _status = TimerStatus.initial;
    _mode = TimerMode.focus;
    _remainingSeconds = _focusDuration;
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}