import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';
import '../widgets/neon_button.dart';
import 'package:http/http.dart' as http;

/// Screen that lets users configure the backend server URL.
/// Default is the cloud-deployed URL; advanced users can override for local dev.
class ServerConfigScreen extends StatefulWidget {
  const ServerConfigScreen({super.key});
  @override
  State<ServerConfigScreen> createState() => _ServerConfigScreenState();
}

class _ServerConfigScreenState extends State<ServerConfigScreen> {
  final _urlCtrl = TextEditingController();
  bool _testing = false;
  String? _status;
  bool _success = false;
  bool _showAdvanced = false;

  @override
  void initState() {
    super.initState();
    _urlCtrl.text = ApiService.baseUrl;
    // Auto-test current connection on open
    _testCurrent();
  }

  Future<void> _testCurrent() async {
    setState(() { _testing = true; _status = 'Checking server connection...'; _success = false; });
    final ok = await ApiService.checkHealth();
    if (mounted) {
      setState(() {
        _testing = false;
        _success = ok;
        _status = ok
            ? 'Connected to ${ApiService.baseUrl}'
            : 'Cannot reach server. It may be starting up (takes ~30s on free hosting). Tap Test again.';
      });
    }
  }

  Future<bool> _testConnection(String url) async {
    try {
      final cleanUrl = url.trimRight().replaceAll(RegExp(r'/+$'), '');
      final response = await http
          .get(Uri.parse('$cleanUrl/health'))
          .timeout(const Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<void> _testAndSave() async {
    final url = _urlCtrl.text.trim();
    if (url.isEmpty) {
      setState(() { _status = 'Please enter a server URL'; _success = false; });
      return;
    }

    setState(() { _testing = true; _status = 'Testing connection...'; _success = false; });

    final ok = await _testConnection(url);
    if (ok) {
      final cleanUrl = url.replaceAll(RegExp(r'/+$'), '');
      await ApiService.setCustomUrl(cleanUrl);
      setState(() { _testing = false; _status = 'Connected successfully!'; _success = true; });
    } else {
      setState(() {
        _testing = false;
        _status = 'Could not reach server at $url.\n'
            'If using cloud hosting, the server may need ~30 seconds to wake up.\n'
            'Tap "Test & Save" again to retry.';
        _success = false;
      });
    }
  }

  Future<void> _resetToDefault() async {
    await ApiService.clearCustomUrl();
    _urlCtrl.text = ApiService.baseUrl;
    setState(() { _status = 'Reset to default cloud server.'; _success = false; });
    _testCurrent();
  }

  void _proceed() {
    if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
    } else {
      Navigator.of(context).pushReplacementNamed('/');
    }
  }

  @override
  void dispose() { _urlCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Stack(
        children: [
          // Background orbs
          Positioned(
            top: 60, left: -60,
            child: Container(
              width: 280, height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(colors: [
                  AppColors.primary.withValues(alpha: isDark ? 0.07 : 0.05),
                  Colors.transparent,
                ]),
              ),
            ),
          ),
          Positioned(
            bottom: 80, right: -40,
            child: Container(
              width: 240, height: 240,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(colors: [
                  AppColors.accent.withValues(alpha: isDark ? 0.06 : 0.04),
                  Colors.transparent,
                ]),
              ),
            ),
          ),

          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: GlassCard(
                  elevated: true,
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Icon
                      Container(
                        width: 64, height: 64,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(18),
                          gradient: const LinearGradient(colors: [AppColors.primary, AppColors.gradientEnd]),
                          boxShadow: AppShadows.glow(AppColors.primary),
                        ),
                        child: const Icon(Icons.cloud_done_rounded, color: Colors.white, size: 32),
                      ),
                      const SizedBox(height: 24),

                      Text('Server Connection', style: GoogleFonts.plusJakartaSans(
                        fontSize: 22, fontWeight: FontWeight.w800,
                        color: isDark ? AppColors.darkText : AppColors.lightText,
                      )),
                      const SizedBox(height: 8),
                      Text(
                        'Your app connects to the cloud server automatically. '
                        'No configuration needed!',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Current server display
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.03),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: _success
                                ? AppColors.success.withValues(alpha: 0.3)
                                : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(children: [
                              Container(
                                width: 8, height: 8,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: _success ? AppColors.success
                                      : (_testing ? AppColors.warning : AppColors.danger),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                _success ? 'Connected' : (_testing ? 'Checking...' : 'Disconnected'),
                                style: TextStyle(
                                  fontSize: 13, fontWeight: FontWeight.w600,
                                  color: _success ? AppColors.success
                                      : (_testing ? AppColors.warning : AppColors.danger),
                                ),
                              ),
                            ]),
                            const SizedBox(height: 8),
                            Text(
                              ApiService.baseUrl,
                              style: TextStyle(
                                fontSize: 12,
                                fontFamily: 'monospace',
                                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                              ),
                            ),
                            if (ApiService.isUsingCustomUrl) ...[
                              const SizedBox(height: 4),
                              Text(
                                '(Custom URL)',
                                style: TextStyle(fontSize: 11, color: AppColors.accent),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Status
                      if (_status != null) ...[
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: (_success ? AppColors.success : AppColors.warning).withValues(alpha: 0.08),
                            border: Border.all(color: (_success ? AppColors.success : AppColors.warning).withValues(alpha: 0.2)),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(
                                _success ? Icons.check_circle_rounded : (_testing ? Icons.sync_rounded : Icons.info_outline_rounded),
                                size: 18,
                                color: _success ? AppColors.success : AppColors.warning,
                              ),
                              const SizedBox(width: 8),
                              Expanded(child: Text(_status!, style: TextStyle(
                                fontSize: 13,
                                color: _success ? AppColors.success : (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                              ))),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Free hosting note
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.info.withValues(alpha: 0.06),
                          border: Border.all(color: AppColors.info.withValues(alpha: 0.15)),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(Icons.info_outline_rounded, size: 16, color: AppColors.info),
                            const SizedBox(width: 8),
                            Expanded(child: Text(
                              'The server uses free hosting and may take ~30 seconds '
                              'to wake up on the first request. Just wait and retry!',
                              style: TextStyle(
                                fontSize: 12,
                                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                                height: 1.5,
                              ),
                            )),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Test connection button
                      NeonButton(
                        text: _testing ? 'Testing...' : 'Test Connection',
                        icon: Icons.refresh_rounded,
                        loading: _testing,
                        onPressed: _testing ? null : _testCurrent,
                        width: double.infinity,
                      ),

                      if (_success) ...[
                        const SizedBox(height: 12),
                        NeonButton(
                          text: 'Continue to App',
                          icon: Icons.arrow_forward_rounded,
                          onPressed: _proceed,
                          width: double.infinity,
                        ),
                      ],

                      const SizedBox(height: 24),

                      // Advanced toggle
                      GestureDetector(
                        onTap: () => setState(() => _showAdvanced = !_showAdvanced),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              _showAdvanced ? Icons.expand_less : Icons.expand_more,
                              size: 18,
                              color: isDark ? AppColors.darkTextDim : AppColors.lightTextDim,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Advanced: Use Custom Server',
                              style: TextStyle(
                                fontSize: 13,
                                color: isDark ? AppColors.darkTextDim : AppColors.lightTextDim,
                              ),
                            ),
                          ],
                        ),
                      ),

                      if (_showAdvanced) ...[
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _urlCtrl,
                          decoration: InputDecoration(
                            hintText: 'https://your-server.onrender.com',
                            prefixIcon: const Icon(Icons.link_rounded),
                            suffixIcon: _urlCtrl.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear_rounded, size: 18),
                                    onPressed: () => setState(() => _urlCtrl.clear()),
                                  )
                                : null,
                          ),
                          keyboardType: TextInputType.url,
                          onChanged: (_) => setState(() {}),
                        ),
                        const SizedBox(height: 12),
                        Row(children: [
                          Expanded(child: NeonButton(
                            text: 'Test & Save',
                            icon: Icons.check_rounded,
                            loading: _testing,
                            onPressed: _testing ? null : _testAndSave,
                          )),
                          const SizedBox(width: 10),
                          Expanded(child: NeonButton(
                            text: 'Reset Default',
                            icon: Icons.restore_rounded,
                            outlined: true,
                            onPressed: _resetToDefault,
                          )),
                        ]),
                      ],

                      const SizedBox(height: 16),
                      TextButton(
                        onPressed: _proceed,
                        child: Text(
                          'Go Back',
                          style: TextStyle(
                            fontSize: 13,
                            color: isDark ? AppColors.darkTextDim : AppColors.lightTextDim,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
