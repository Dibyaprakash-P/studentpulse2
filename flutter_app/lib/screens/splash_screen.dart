import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../utils/responsive.dart';
import '../widgets/neon_button.dart';
import '../widgets/theme_toggle.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _float;
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(seconds: 3))..repeat(reverse: true);
    _float = Tween<double>(begin: -8, end: 8).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() { _ctrl.dispose(); _scrollCtrl.dispose(); super.dispose(); }

  void _scrollToFeatures() {
    _scrollCtrl.animateTo(
      MediaQuery.of(context).size.height * 0.9,
      duration: const Duration(milliseconds: 800),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isMobile = Responsive.isMobile(context);
    final screenH = MediaQuery.of(context).size.height;

    return Scaffold(
      body: Stack(
        children: [
          // Subtle gradient orbs (background depth)
          Positioned(
            top: screenH * 0.05, left: -80,
            child: Container(
              width: 320, height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(colors: [
                  AppColors.primary.withValues(alpha: isDark ? 0.08 : 0.06),
                  Colors.transparent,
                ]),
              ),
            ),
          ),
          Positioned(
            bottom: screenH * 0.15, right: -60,
            child: Container(
              width: 280, height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(colors: [
                  AppColors.accent.withValues(alpha: isDark ? 0.07 : 0.05),
                  Colors.transparent,
                ]),
              ),
            ),
          ),

          // Main scrollable content
          CustomScrollView(
            controller: _scrollCtrl,
            slivers: [
              // ───── HERO SECTION ─────
              SliverToBoxAdapter(
                child: SizedBox(
                  height: screenH * 0.92,
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: isMobile ? 24 : 64),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Floating logo
                          AnimatedBuilder(
                            animation: _float,
                            builder: (_, child) => Transform.translate(
                              offset: Offset(0, _float.value),
                              child: child,
                            ),
                            child: Container(
                              width: isMobile ? 80 : 100,
                              height: isMobile ? 80 : 100,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(28),
                                gradient: const LinearGradient(
                                  begin: Alignment.topLeft, end: Alignment.bottomRight,
                                  colors: [AppColors.primary, AppColors.gradientEnd],
                                ),
                                boxShadow: AppShadows.glow(AppColors.primary),
                              ),
                              child: const Icon(Icons.monitor_heart_rounded, size: 44, color: Colors.white),
                            ),
                          ),
                          SizedBox(height: isMobile ? 28 : 40),

                          // Title
                          RichText(
                            textAlign: TextAlign.center,
                            text: TextSpan(children: [
                              TextSpan(text: 'Student ', style: GoogleFonts.plusJakartaSans(
                                fontSize: isMobile ? 36 : 52, fontWeight: FontWeight.w800,
                                color: isDark ? AppColors.darkText : AppColors.lightText,
                                letterSpacing: -1,
                              )),
                              TextSpan(text: 'Pulse', style: GoogleFonts.plusJakartaSans(
                                fontSize: isMobile ? 36 : 52, fontWeight: FontWeight.w800,
                                letterSpacing: -1,
                                foreground: Paint()..shader = const LinearGradient(
                                  colors: [AppColors.primary, AppColors.gradientEnd],
                                ).createShader(const Rect.fromLTWH(0, 0, 200, 60)),
                              )),
                            ]),
                          ),
                          const SizedBox(height: 16),

                          // Tagline
                          Text(
                            'Track your lifestyle. Predict burnout before it hits.\nYour AI-powered student wellness companion.',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.inter(
                              fontSize: isMobile ? 15 : 18,
                              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                              height: 1.7,
                            ),
                          ),
                          const SizedBox(height: 40),

                          // CTA buttons
                          Wrap(
                            spacing: 16, runSpacing: 12,
                            alignment: WrapAlignment.center,
                            children: [
                              NeonButton(
                                text: 'Get Started',
                                icon: Icons.arrow_forward_rounded,
                                onPressed: () => Navigator.of(context).pushReplacementNamed('/login'),
                              ),
                              NeonButton(
                                text: 'Explore Features',
                                outlined: true,
                                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                                onPressed: _scrollToFeatures,
                              ),
                            ],
                          ),
                          const SizedBox(height: 48),

                          // Scroll indicator
                          GestureDetector(
                            onTap: _scrollToFeatures,
                            child: Column(
                              children: [
                                Text('Scroll to explore', style: TextStyle(
                                  fontSize: 12, color: isDark ? AppColors.darkTextDim : AppColors.lightTextDim,
                                )),
                                const SizedBox(height: 8),
                                AnimatedBuilder(
                                  animation: _float,
                                  builder: (_, __) => Icon(
                                    Icons.keyboard_arrow_down_rounded,
                                    color: (isDark ? AppColors.darkTextDim : AppColors.lightTextDim)
                                        .withValues(alpha: 0.5 + (_float.value + 8) / 32),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

              // ───── FEATURES SECTION ─────
              SliverToBoxAdapter(
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: isMobile ? 20 : 64, vertical: 60),
                  child: Column(
                    children: [
                      _sectionTitle(context, isDark, 'Powerful Features', 'Everything you need to stay on top of your game.'),
                      const SizedBox(height: 40),
                      _buildFeaturesGrid(context, isDark, isMobile),
                    ],
                  ),
                ),
              ),

              // ───── HOW IT WORKS ─────
              SliverToBoxAdapter(
                child: Container(
                  color: isDark ? AppColors.darkSurface1 : AppColors.lightSurface2,
                  padding: EdgeInsets.symmetric(horizontal: isMobile ? 20 : 64, vertical: 60),
                  child: Column(
                    children: [
                      _sectionTitle(context, isDark, 'How It Works', 'Three simple steps to a healthier student life.'),
                      const SizedBox(height: 40),
                      _buildSteps(context, isDark, isMobile),
                    ],
                  ),
                ),
              ),

              // ───── ABOUT US ─────
              SliverToBoxAdapter(
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: isMobile ? 20 : 64, vertical: 60),
                  child: Column(
                    children: [
                      _sectionTitle(context, isDark, 'About Us', 'Built with ❤️ for students everywhere.'),
                      const SizedBox(height: 40),
                      _buildAboutUs(context, isDark, isMobile),
                    ],
                  ),
                ),
              ),

              // ───── FOOTER ─────
              SliverToBoxAdapter(
                child: Container(
                  color: isDark ? AppColors.darkSurface1 : AppColors.lightSurface2,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 28),
                  child: Column(
                    children: [
                      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Container(
                          width: 28, height: 28,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            gradient: const LinearGradient(colors: [AppColors.primary, AppColors.gradientEnd]),
                          ),
                          child: const Icon(Icons.monitor_heart_rounded, size: 16, color: Colors.white),
                        ),
                        const SizedBox(width: 8),
                        Text('Student Pulse', style: GoogleFonts.plusJakartaSans(
                          fontWeight: FontWeight.w700, fontSize: 16,
                          color: isDark ? AppColors.darkText : AppColors.lightText,
                        )),
                      ]),
                      const SizedBox(height: 12),
                      Text('© 2026 Student Pulse. All rights reserved.',
                        style: TextStyle(fontSize: 12, color: isDark ? AppColors.darkTextDim : AppColors.lightTextDim)),
                      const SizedBox(height: 20),
                      NeonButton(
                        text: 'Get Started Now',
                        icon: Icons.rocket_launch_rounded,
                        onPressed: () => Navigator.of(context).pushReplacementNamed('/login'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Theme toggle — sits above scroll view with explicit pointer absorption
          Positioned(
            top: MediaQuery.of(context).padding.top + 12,
            right: 16,
            child: IgnorePointer(
              ignoring: false,
              child: Container(
                // Ensure minimum 48x48 touch target per Material Design guidelines
                constraints: const BoxConstraints(minHeight: 40, minWidth: 40),
                child: const ThemeToggle(showLabel: true),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(BuildContext context, bool isDark, String title, String subtitle) {
    return Column(
      children: [
        Text(title, style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Text(subtitle, style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
      ],
    );
  }

  Widget _buildFeaturesGrid(BuildContext context, bool isDark, bool isMobile) {
    final features = [
      _F(Icons.psychology_rounded, 'AI Burnout Prediction', 'Machine learning models analyze your patterns and predict burnout risk before it happens.', AppColors.danger),
      _F(Icons.assignment_turned_in_rounded, 'Homework Tracker', 'Add homework, set deadlines, and never miss a submission. Track completion at a glance.', AppColors.primary),
      _F(Icons.note_alt_rounded, 'Smart Notes', 'Capture ideas, lecture notes, and reminders. Keep everything organized in one place.', AppColors.success),
      _F(Icons.folder_special_rounded, 'Project Manager', 'Add projects with deadlines, attach files, and track progress from start to finish.', AppColors.accent),
      _F(Icons.family_restroom_rounded, 'Parent Monitoring', 'Parents can link accounts to monitor their child\'s wellness, stress levels, and academic health.', Color(0xFF8B5CF6)),
      _F(Icons.emoji_events_rounded, 'Gamification & XP', 'Earn badges, maintain streaks, and level up as you build healthy habits consistently.', AppColors.warning),
      _F(Icons.trending_up_rounded, 'Productivity Analytics', 'Detailed weekly charts showing study time, sleep quality, and productivity trends.', AppColors.info),
      _F(Icons.devices_rounded, 'Cross-Platform', 'Available on Windows, Android, iOS, macOS, and Web. Your data syncs everywhere.', Color(0xFF06B6D4)),
    ];

    if (isMobile) {
      return Column(
        children: features.map((f) => Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: _featureCard(context, isDark, f),
        )).toList(),
      );
    }

    return Wrap(
      spacing: 20, runSpacing: 20,
      children: features.map((f) => SizedBox(
        width: 320,
        child: _featureCard(context, isDark, f),
      )).toList(),
    );
  }

  Widget _featureCard(BuildContext context, bool isDark, _F f) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface2 : AppColors.lightSurface1,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
        boxShadow: AppShadows.card(isDark),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          width: 48, height: 48,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            color: f.color.withValues(alpha: 0.12),
          ),
          child: Icon(f.icon, color: f.color, size: 24),
        ),
        const SizedBox(height: 16),
        Text(f.title, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Text(f.desc, style: Theme.of(context).textTheme.bodyMedium),
      ]),
    );
  }

  Widget _buildSteps(BuildContext context, bool isDark, bool isMobile) {
    final steps = [
      ('1', 'Track Daily', 'Log your study hours, sleep, stress, and mood in under 60 seconds.', Icons.edit_note_rounded),
      ('2', 'Get Insights', 'AI analyzes your patterns and shows productivity trends + burnout predictions.', Icons.insights_rounded),
      ('3', 'Improve', 'Follow personalized recommendations to build better habits and stay healthy.', Icons.trending_up_rounded),
    ];

    if (isMobile) {
      return Column(
        children: steps.map((s) => Padding(
          padding: const EdgeInsets.only(bottom: 20),
          child: _stepCard(context, isDark, s.$1, s.$2, s.$3, s.$4),
        )).toList(),
      );
    }

    return Row(
      children: steps.map((s) => Expanded(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          child: _stepCard(context, isDark, s.$1, s.$2, s.$3, s.$4),
        ),
      )).toList(),
    );
  }

  Widget _stepCard(BuildContext context, bool isDark, String num, String title, String desc, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface2 : AppColors.lightSurface1,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
        boxShadow: AppShadows.card(isDark),
      ),
      child: Column(children: [
        Container(
          width: 56, height: 56,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: const LinearGradient(colors: [AppColors.primary, AppColors.gradientEnd]),
            boxShadow: AppShadows.glow(AppColors.primary),
          ),
          child: Center(child: Text(num, style: GoogleFonts.plusJakartaSans(
            fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white,
          ))),
        ),
        const SizedBox(height: 20),
        Text(title, style: Theme.of(context).textTheme.titleMedium, textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Text(desc, style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
      ]),
    );
  }

  Widget _buildAboutUs(BuildContext context, bool isDark, bool isMobile) {
    return Container(
      width: isMobile ? double.infinity : 600,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface2 : AppColors.lightSurface1,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
        boxShadow: AppShadows.elevated(isDark),
      ),
      child: Column(children: [
        // Avatar
        Container(
          width: 80, height: 80,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: const LinearGradient(
              begin: Alignment.topLeft, end: Alignment.bottomRight,
              colors: [AppColors.accent, AppColors.warmGradientEnd],
            ),
            boxShadow: AppShadows.glow(AppColors.accent),
          ),
          child: Center(child: Text('DP', style: GoogleFonts.plusJakartaSans(
            fontSize: 28, fontWeight: FontWeight.w800, color: Colors.white,
          ))),
        ),
        const SizedBox(height: 20),
        Text('Dibyaprakash Patnaik', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 4),
        Text('Developer & Creator', style: Theme.of(context).textTheme.bodyMedium),
        const SizedBox(height: 20),
        Text(
          'Student Pulse was built to help students take control of their wellbeing. '
          'As a student myself, I understand the struggles of balancing academics, sleep, '
          'and mental health. This app uses AI to predict burnout and give actionable insights '
          'so you can thrive, not just survive.',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.7),
        ),
        const SizedBox(height: 24),
        // Contact
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface3 : AppColors.lightSurface3,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Column(children: [
            Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(Icons.email_rounded, size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              SelectableText(
                'dibyaprakashpatnaik@gmail.com',
                style: TextStyle(
                  fontSize: 14, fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                ),
              ),
            ]),
          ]),
        ),
      ]),
    );
  }
}

class _F {
  final IconData icon;
  final String title, desc;
  final Color color;
  const _F(this.icon, this.title, this.desc, this.color);
}
