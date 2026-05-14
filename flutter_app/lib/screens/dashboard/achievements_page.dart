import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../utils/responsive.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/pulse_loader.dart';

class AchievementsPage extends StatefulWidget {
  const AchievementsPage({super.key});
  @override
  State<AchievementsPage> createState() => _AchievementsPageState();
}

class _AchievementsPageState extends State<AchievementsPage> {
  Map<String, dynamic>? _data;
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final api = Provider.of<AuthProvider>(context, listen: false).api;
    try { _data = await api.getGamificationProfile(); } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const PulseLoader();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isMobile = Responsive.isMobile(context);
    final xp = _data?['xp'] ?? 0;
    final level = _data?['level'] ?? 1;
    final streak = _data?['current_streak'] ?? 0;
    final longestStreak = _data?['longest_streak'] ?? 0;
    final badges = _data?['badges'] as List? ?? [];
    final earned = badges.where((b) => b['earned'] == true).toList();
    final locked = badges.where((b) => b['earned'] != true).toList();

    // XP progress to next level (every 500 XP)
    final xpForLevel = 500;
    final xpProgress = (xp % xpForLevel) / xpForLevel;
    final xpToNext = xpForLevel - (xp % xpForLevel);

    // Badge glow colors
    Color badgeColor(String name) {
      final n = name.toLowerCase();
      if (n.contains('streak') || n.contains('fire')) return AppColors.warning;
      if (n.contains('sleep') || n.contains('night')) return Color(0xFF8B5CF6);
      if (n.contains('study') || n.contains('focus')) return AppColors.primary;
      if (n.contains('exercise') || n.contains('fitness')) return AppColors.success;
      return AppColors.primary;
    }

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Achievements', style: Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height: 4),
      Text('Track your progress, streaks, and badges.', style: Theme.of(context).textTheme.bodyMedium),
      const SizedBox(height: 24),

      // Level banner
      GlassCard(borderColor: AppColors.primary.withValues(alpha: 0.3), padding: EdgeInsets.all(isMobile ? 16 : 24),
        child: Row(children: [
          Container(width: isMobile ? 48 : 64, height: isMobile ? 48 : 64,
            decoration: BoxDecoration(shape: BoxShape.circle,
              gradient: const LinearGradient(colors: [AppColors.primary, AppColors.gradientEnd]),
              boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 12)]),
            child: Center(child: Text('$level', style: TextStyle(fontSize: isMobile ? 20 : 28, fontWeight: FontWeight.w700, color: Colors.white)))),
          SizedBox(width: isMobile ? 14 : 20),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Level $level', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 4),
            Text('$xp XP total • $xpToNext XP to next level', style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 8),
            ClipRRect(borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(value: xpProgress, minHeight: 8,
                backgroundColor: isDark ? Colors.white10 : Colors.black12,
                color: AppColors.primary)),
          ])),
        ])),
      const SizedBox(height: 24),

      // Streak stats — responsive
      if (isMobile)
        GridView.count(
          crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 2.0,
          children: [
            _streakCard(context, '🔥', '$streak days', 'Current Streak'),
            _streakCard(context, '🏆', '$longestStreak days', 'Longest Streak'),
            _streakCard(context, '🎖️', '${earned.length}/${badges.length}', 'Badges Earned'),
          ],
        )
      else
        Wrap(spacing: 16, runSpacing: 16, children: [
          SizedBox(width: 220, child: _streakCard(context, '🔥', '$streak days', 'Current Streak')),
          SizedBox(width: 220, child: _streakCard(context, '🏆', '$longestStreak days', 'Longest Streak')),
          SizedBox(width: 220, child: _streakCard(context, '🎖️', '${earned.length}/${badges.length}', 'Badges Earned')),
        ]),
      const SizedBox(height: 28),

      // Earned badges
      if (earned.isNotEmpty) ...[
        Text('Earned Badges', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        Wrap(spacing: 12, runSpacing: 12, children: earned.map((b) {
          final color = badgeColor(b['name'] ?? '');
          final badgeWidth = isMobile ? (MediaQuery.of(context).size.width - 56) / 2 : 160.0;
          return SizedBox(width: badgeWidth, child: GlassCard(borderColor: color.withValues(alpha: 0.4), padding: const EdgeInsets.all(16),
            child: Column(children: [
              Container(width: 48, height: 48,
                decoration: BoxDecoration(shape: BoxShape.circle, color: color.withValues(alpha: 0.15),
                  boxShadow: [BoxShadow(color: color.withValues(alpha: 0.3), blurRadius: 8)]),
                child: const Center(child: Text('🎖️', style: TextStyle(fontSize: 24)))),
              const SizedBox(height: 10),
              Text(b['name'] ?? '', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: color)),
              const SizedBox(height: 4),
              Text(b['description'] ?? '', textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),
            ])));
        }).toList()),
        const SizedBox(height: 28),
      ],

      // Locked badges
      if (locked.isNotEmpty) ...[
        Text('Locked Badges', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        Wrap(spacing: 12, runSpacing: 12, children: locked.map((b) {
          final badgeWidth = isMobile ? (MediaQuery.of(context).size.width - 56) / 2 : 160.0;
          return SizedBox(width: badgeWidth, child: GlassCard(padding: const EdgeInsets.all(16),
            child: Opacity(opacity: 0.5, child: Column(children: [
              Container(width: 48, height: 48,
                decoration: BoxDecoration(shape: BoxShape.circle, color: isDark ? Colors.white10 : Colors.black12),
                child: const Center(child: Text('🔒', style: TextStyle(fontSize: 24)))),
              const SizedBox(height: 10),
              Text(b['name'] ?? '', textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
              const SizedBox(height: 4),
              Text(b['description'] ?? '', textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),
            ]))));
        }).toList()),
      ],
    ]);
  }

  Widget _streakCard(BuildContext context, String emoji, String value, String label) {
    return GlassCard(padding: const EdgeInsets.all(16),
      child: Row(children: [
        Text(emoji, style: const TextStyle(fontSize: 24)),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(value, style: Theme.of(context).textTheme.titleMedium),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ])),
      ]));
  }
}
