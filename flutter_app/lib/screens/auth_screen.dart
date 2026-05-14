import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';
import '../widgets/neon_button.dart';
import '../widgets/theme_toggle.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});
  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _isLogin = true;
  bool _loading = false;
  bool _obscure = true;
  String? _error;

  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  String _role = 'student';
  final _formKey = GlobalKey<FormState>();

  List<_PwdRule> get _pwdRules => [
    _PwdRule('At least 8 characters', _passwordCtrl.text.length >= 8),
    _PwdRule('At least 1 digit (0-9)', RegExp(r'\d').hasMatch(_passwordCtrl.text)),
    _PwdRule('At least 1 symbol (!@#\$...)', RegExp(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/~`]').hasMatch(_passwordCtrl.text)),
  ];

  String? _validatePassword(String? val) {
    if (val == null || val.isEmpty) return 'Password is required';
    if (val.length < 8) return 'Minimum 8 characters';
    if (!RegExp(r'\d').hasMatch(val)) return 'Must contain at least 1 digit';
    if (!RegExp(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/~`]').hasMatch(val)) return 'Must contain at least 1 symbol';
    return null;
  }

  String _mapErrorMessage(String raw) {
    final msg = raw.replaceAll(RegExp(r'^Exception:\s*'), '');
    // Map backend messages to user-friendly versions
    if (msg.contains('Invalid email or password')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (msg.contains('Email already registered') || msg.contains('already registered')) {
      return 'This email is already registered. Please log in instead.';
    }
    if (msg.contains('Unable to connect') || msg.contains('Connection')) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    if (msg.contains('taking too long') || msg.contains('timed out')) {
      return 'Server is not responding. Please try again later.';
    }
    return msg;
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });

    final auth = Provider.of<AuthProvider>(context, listen: false);
    try {
      if (_isLogin) {
        await auth.login(_emailCtrl.text.trim(), _passwordCtrl.text);
      } else {
        await auth.register(_emailCtrl.text.trim(), _passwordCtrl.text, _nameCtrl.text.trim(), _role);
      }
      if (mounted) {
        // Use role from server response, fallback to form selection
        final userRole = auth.user?['role'] ?? _role;
        Navigator.of(context).pushReplacementNamed(userRole == 'parent' ? '/parent' : '/dashboard');
      }
    } catch (e) {
      if (mounted) {
        setState(() { _error = _mapErrorMessage(e.toString()); });
      }
    } finally {
      if (mounted) setState(() { _loading = false; });
    }
  }

  @override
  void dispose() { _emailCtrl.dispose(); _passwordCtrl.dispose(); _nameCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;

    return Scaffold(
      body: Stack(
        children: [
          // Gradient orbs
          Positioned(top: MediaQuery.of(context).size.height * 0.15, left: -60,
            child: Container(width: 300, height: 300, decoration: BoxDecoration(shape: BoxShape.circle,
              gradient: RadialGradient(colors: [AppColors.primary.withValues(alpha: 0.06), Colors.transparent])))),
          Positioned(bottom: MediaQuery.of(context).size.height * 0.1, right: -60,
            child: Container(width: 260, height: 260, decoration: BoxDecoration(shape: BoxShape.circle,
              gradient: RadialGradient(colors: [AppColors.accent.withValues(alpha: 0.05), Colors.transparent])))),

          // Theme toggle
          Positioned(
            top: MediaQuery.of(context).padding.top + 12,
            right: 16,
            child: IgnorePointer(
              ignoring: false,
              child: Container(
                constraints: const BoxConstraints(minHeight: 40, minWidth: 40),
                child: const ThemeToggle(showLabel: true),
              ),
            ),
          ),

          // Back button & Server settings
          Positioned(top: MediaQuery.of(context).padding.top + 12, left: 16,
            child: Row(
              children: [
                MouseRegion(
                  cursor: SystemMouseCursors.click,
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => Navigator.of(context).pushReplacementNamed('/'),
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(Icons.arrow_back_rounded, size: 20, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                MouseRegion(
                  cursor: SystemMouseCursors.click,
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => Navigator.of(context).pushNamed('/server-config'),
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(Icons.dns_rounded, size: 20, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                      ),
                    ),
                  ),
                ),
              ],
            )),

          Center(
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(horizontal: isMobile ? 16 : 24, vertical: 48),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 440),
                child: GlassCard(
                  elevated: true,
                  padding: EdgeInsets.all(isMobile ? 24 : 36),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Logo
                        Container(
                          width: 56, height: 56,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            gradient: const LinearGradient(colors: [AppColors.primary, AppColors.gradientEnd]),
                            boxShadow: AppShadows.glow(AppColors.primary),
                          ),
                          child: const Icon(Icons.monitor_heart_rounded, color: Colors.white, size: 28),
                        ),
                        const SizedBox(height: 20),

                        // Title
                        RichText(text: TextSpan(children: [
                          TextSpan(text: 'Student ', style: GoogleFonts.plusJakartaSans(fontSize: isMobile ? 24 : 28, fontWeight: FontWeight.w800, color: isDark ? AppColors.darkText : AppColors.lightText)),
                          TextSpan(text: 'Pulse', style: GoogleFonts.plusJakartaSans(
                            fontSize: isMobile ? 24 : 28, fontWeight: FontWeight.w800,
                            foreground: Paint()..shader = const LinearGradient(colors: [AppColors.primary, AppColors.gradientEnd]).createShader(const Rect.fromLTWH(0, 0, 100, 32)),
                          )),
                        ])),
                        const SizedBox(height: 8),
                        Text(_isLogin ? 'Welcome back! Ready to track?' : 'Start your wellness journey today.',
                            style: Theme.of(context).textTheme.bodyMedium),
                        const SizedBox(height: 28),

                        // Error
                        if (_error != null) ...[
                          Container(
                            width: double.infinity, padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.danger.withValues(alpha: 0.08),
                              border: Border.all(color: AppColors.danger.withValues(alpha: 0.2)),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(children: [
                                  const Icon(Icons.error_outline_rounded, size: 18, color: AppColors.danger),
                                  const SizedBox(width: 8),
                                  Expanded(child: Text(_error!, style: const TextStyle(color: AppColors.danger, fontSize: 13))),
                                ]),
                                if (_error!.contains('connect') || _error!.contains('server') || _error!.contains('Server')) ...[
                                  const SizedBox(height: 8),
                                  GestureDetector(
                                    onTap: () => Navigator.of(context).pushNamed('/server-config'),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(Icons.settings_rounded, size: 14, color: AppColors.primary),
                                        SizedBox(width: 4),
                                        Text('Configure Server', style: TextStyle(
                                          color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.w600,
                                          decoration: TextDecoration.underline,
                                        )),
                                      ],
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Name (register)
                        if (!_isLogin) ...[
                          TextFormField(
                            controller: _nameCtrl,
                            decoration: const InputDecoration(hintText: 'Full Name', prefixIcon: Icon(Icons.person_outline_rounded)),
                            validator: (v) => v == null || v.trim().isEmpty ? 'Name is required' : null,
                          ),
                          const SizedBox(height: 14),
                        ],

                        // Email
                        TextFormField(
                          controller: _emailCtrl,
                          decoration: const InputDecoration(hintText: 'Email', prefixIcon: Icon(Icons.email_outlined)),
                          keyboardType: TextInputType.emailAddress,
                          validator: (v) {
                            if (v == null || v.trim().isEmpty) return 'Email is required';
                            if (!RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(v)) return 'Invalid email';
                            return null;
                          },
                        ),
                        const SizedBox(height: 14),

                        // Password
                        TextFormField(
                          controller: _passwordCtrl,
                          obscureText: _obscure,
                          decoration: InputDecoration(
                            hintText: 'Password',
                            prefixIcon: const Icon(Icons.lock_outline_rounded),
                            suffixIcon: IconButton(
                              icon: Icon(_obscure ? Icons.visibility_off_rounded : Icons.visibility_rounded, size: 20),
                              onPressed: () => setState(() => _obscure = !_obscure),
                            ),
                          ),
                          onChanged: (_) => setState(() {}),
                          validator: _isLogin ? (v) => v == null || v.isEmpty ? 'Password is required' : null : _validatePassword,
                        ),
                        const SizedBox(height: 8),

                        // Password rules
                        if (!_isLogin && _passwordCtrl.text.isNotEmpty)
                          Container(
                            width: double.infinity, padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.03),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: _pwdRules.map((r) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 2),
                                child: Row(children: [
                                  Icon(r.passed ? Icons.check_circle_rounded : Icons.circle_outlined,
                                      size: 16, color: r.passed ? AppColors.success : AppColors.darkTextDim),
                                  const SizedBox(width: 8),
                                  Flexible(child: Text(r.label, style: TextStyle(
                                    fontSize: 12, color: r.passed ? AppColors.success : Theme.of(context).textTheme.bodySmall?.color,
                                  ))),
                                ]),
                              )).toList(),
                            ),
                          ),
                        const SizedBox(height: 14),

                        // Role
                        if (!_isLogin) ...[
                          DropdownButtonFormField<String>(
                            initialValue: _role,
                            decoration: const InputDecoration(hintText: 'I am a...', prefixIcon: Icon(Icons.school_outlined)),
                            dropdownColor: Theme.of(context).cardColor,
                            items: const [
                              DropdownMenuItem(value: 'student', child: Text('Student')),
                              DropdownMenuItem(value: 'parent', child: Text('Parent')),
                            ],
                            onChanged: (v) => setState(() => _role = v ?? 'student'),
                          ),
                          const SizedBox(height: 20),
                        ],

                        const SizedBox(height: 8),

                        // Submit
                        NeonButton(
                          text: _loading ? 'Please wait...' : _isLogin ? 'Log In' : 'Create Account',
                          loading: _loading, onPressed: _submit, width: double.infinity,
                        ),
                        const SizedBox(height: 24),

                        // Toggle
                        Divider(color: Theme.of(context).dividerColor),
                        const SizedBox(height: 16),
                        Wrap(
                          alignment: WrapAlignment.center,
                          children: [
                            Text(_isLogin ? "Don't have an account? " : 'Already have an account? ',
                                style: Theme.of(context).textTheme.bodyMedium),
                            GestureDetector(
                              onTap: () => setState(() { _isLogin = !_isLogin; _error = null; }),
                              child: Text(_isLogin ? 'Sign Up' : 'Log In',
                                  style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
                            ),
                          ],
                        ),
                      ],
                    ),
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

class _PwdRule {
  final String label;
  final bool passed;
  _PwdRule(this.label, this.passed);
}
