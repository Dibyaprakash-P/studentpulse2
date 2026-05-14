import 'dart:async';
import 'dart:convert';
import 'dart:io' show SocketException;

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  /// Persistent storage key for the saved server URL.
  static const String _prefsKey = 'sp_server_url';

  /// ──────────────────────────────────────────────────────────────────────
  /// PUBLIC BACKEND URL — deployed on Render.com (free tier).
  /// This is the ONLY URL you need to change after deploying the backend.
  /// Replace with YOUR Render URL after deployment.
  /// ──────────────────────────────────────────────────────────────────────
  static const String _deployedApiUrl =
      'https://student-pulse-api.onrender.com';

  /// Fallback for local development only.


  /// Determines the default API URL based on platform.
  /// - Web: uses the deployed URL (since the site is on Netlify)
  /// - Mobile/Desktop: uses the deployed URL (accessible worldwide)
  static String get _defaultUrl {
    // In production, all platforms use the deployed cloud URL.
    // For local dev, you can override via the server config screen.
    return _deployedApiUrl;
  }

  /// Runtime-override for the server URL (set via settings).
  static String? _customUrl;

  /// Set a custom backend URL and persist it.
  static Future<void> setCustomUrl(String url) async {
    _customUrl = url;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefsKey, url);
  }

  /// Clear the custom URL (revert to default deployed URL).
  static Future<void> clearCustomUrl() async {
    _customUrl = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_prefsKey);
  }

  /// Load the saved custom URL from persistent storage.
  /// Call this once at app startup (before any API calls).
  static Future<void> loadSavedUrl() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_prefsKey);
    if (saved != null && saved.isNotEmpty) {
      _customUrl = saved;
    }
  }

  /// The effective base URL for all API requests.
  String get _baseUrl => _customUrl ?? _defaultUrl;

  /// Public getter for UI display.
  static String get baseUrl => _customUrl ?? _defaultUrl;

  /// Whether we're using a custom (non-default) URL.
  static bool get isUsingCustomUrl => _customUrl != null;

  /// Timeout for all HTTP requests (increased for free-tier cold starts)
  static const Duration _timeout = Duration(seconds: 30);

  String? _token;

  Future<String?> get token async {
    if (_token != null) return _token;
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('sp_access_token');
    return _token;
  }

  Future<Map<String, String>> _headers() async {
    final t = await token;
    return {
      'Content-Type': 'application/json',
      if (t != null) 'Authorization': 'Bearer $t',
    };
  }

  Future<void> _saveToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('sp_access_token', token);
  }

  Future<void> _saveUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('sp_user', jsonEncode(user));
  }

  Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('sp_access_token');
    await prefs.remove('sp_user');
  }

  Future<Map<String, dynamic>?> getSavedUser() async {
    final prefs = await SharedPreferences.getInstance();
    final s = prefs.getString('sp_user');
    if (s == null) return null;
    return jsonDecode(s);
  }

  /// Converts raw exceptions into user-friendly error messages.
  String _friendlyError(Object e) {
    final msg = e.toString();
    // Connection / network errors
    if (msg.contains('SocketException') ||
        msg.contains('Connection refused') ||
        msg.contains('Connection timed out') ||
        msg.contains('Network is unreachable') ||
        msg.contains('No address associated') ||
        msg.contains('ClientException') ||
        msg.contains('HandshakeException') ||
        e is SocketException) {
      return 'Unable to connect to server. '
          'Please check your internet connection and try again.';
    }
    if (e is TimeoutException || msg.contains('TimeoutException')) {
      return 'Server is starting up (this can take ~30 seconds on free hosting). '
          'Please try again in a moment.';
    }
    if (msg.contains('FormatException')) {
      return 'Received an unexpected response from the server.';
    }
    // Strip "Exception: " prefix
    return msg.replaceFirst('Exception: ', '');
  }

  Future<dynamic> _request(String method, String path, {dynamic body}) async {
    final uri = Uri.parse('$_baseUrl$path');
    final headers = await _headers();

    http.Response response;
    try {
      switch (method) {
        case 'POST':
          response = await http
              .post(uri, headers: headers, body: body != null ? jsonEncode(body) : null)
              .timeout(_timeout);
          break;
        case 'PUT':
          response = await http
              .put(uri, headers: headers, body: body != null ? jsonEncode(body) : null)
              .timeout(_timeout);
          break;
        case 'DELETE':
          response = await http.delete(uri, headers: headers).timeout(_timeout);
          break;
        default:
          response = await http.get(uri, headers: headers).timeout(_timeout);
      }
    } catch (e) {
      throw Exception(_friendlyError(e));
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return {};
      return jsonDecode(response.body);
    } else {
      // Parse the server error response
      try {
        final errBody = response.body.isNotEmpty ? jsonDecode(response.body) : {};
        final detail = errBody['detail'];
        if (detail is String) {
          throw Exception(detail);
        } else if (detail is List && detail.isNotEmpty) {
          // FastAPI validation error format
          throw Exception(detail.first['msg'] ?? 'Validation error');
        }
      } catch (e) {
        if (e is Exception && e.toString().contains('Exception:')) rethrow;
      }
      // Fallback generic error
      throw Exception('Something went wrong (${response.statusCode}). Please try again.');
    }
  }

  // ── Auth ──────────────────────────────────────────────────

  Future<Map<String, dynamic>> register(String email, String password, String fullName, String role) async {
    final data = await _request('POST', '/auth/register', body: {
      'email': email, 'password': password, 'full_name': fullName, 'role': role,
    });
    await _saveToken(data['access_token']);
    await _saveUser(data['user']);
    return data;
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final data = await _request('POST', '/auth/login', body: {
      'email': email, 'password': password,
    });
    await _saveToken(data['access_token']);
    await _saveUser(data['user']);
    return data;
  }

  // ── Tracking ──────────────────────────────────────────────

  Future<Map<String, dynamic>> logActivity(Map<String, dynamic> formData) async {
    return await _request('POST', '/tracking/activities', body: formData);
  }

  Future<List<dynamic>> getActivityHistory({int days = 30}) async {
    final data = await _request('GET', '/tracking/activities?limit=$days');
    return data is List ? data : [];
  }

  // ── ML ────────────────────────────────────────────────────

  Future<Map<String, dynamic>> predictBurnout(Map<String, dynamic> input) async {
    return await _request('POST', '/ml/predict-burnout', body: input);
  }

  Future<Map<String, dynamic>> getLatestPrediction() async {
    return await _request('GET', '/ml/predict-latest');
  }

  // ── Analytics ─────────────────────────────────────────────

  Future<Map<String, dynamic>> getWeeklySummary() async {
    return await _request('GET', '/analytics/weekly-summary');
  }

  Future<Map<String, dynamic>> getMonthlyTrends() async {
    return await _request('GET', '/analytics/monthly-trends');
  }

  // ── Gamification ──────────────────────────────────────────

  Future<Map<String, dynamic>> getGamificationProfile() async {
    return await _request('GET', '/gamification/profile');
  }

  // ── Parent ────────────────────────────────────────────────

  Future<Map<String, dynamic>> generateLinkCode() async {
    return await _request('POST', '/auth/generate-link-code');
  }

  Future<List<dynamic>> getLinkedStudents() async {
    final data = await _request('GET', '/auth/linked-students');
    return data is List ? data : [];
  }

  // ── Server Health Check ───────────────────────────────────

  /// Quick health check to verify the server is reachable.
  static Future<bool> checkHealth() async {
    try {
      final url = _customUrl ?? _defaultUrl;
      final response = await http
          .get(Uri.parse('$url/health'))
          .timeout(const Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
