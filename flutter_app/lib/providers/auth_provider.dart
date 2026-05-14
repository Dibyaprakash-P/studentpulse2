import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  Map<String, dynamic>? _user;
  bool _loading = true;
  String? _error;

  Map<String, dynamic>? get user => _user;
  bool get loading => _loading;
  bool get isAuthenticated => _user != null;
  String? get error => _error;
  ApiService get api => _api;

  AuthProvider() {
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    _loading = true;
    notifyListeners();
    final token = await _api.token;
    if (token != null) {
      _user = await _api.getSavedUser();
    }
    _loading = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _error = null;
    _loading = true;
    notifyListeners();
    try {
      final data = await _api.login(email, password);
      _user = data['user'];
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      rethrow;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> register(String email, String password, String fullName, String role) async {
    _error = null;
    _loading = true;
    notifyListeners();
    try {
      final data = await _api.register(email, password, fullName, role);
      _user = data['user'];
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      rethrow;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _api.clearToken();
    _user = null;
    _error = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
