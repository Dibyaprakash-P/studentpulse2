import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../utils/responsive.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/pulse_loader.dart';

class OverviewPage extends StatefulWidget {
  const OverviewPage({super.key});
  @override
  State<OverviewPage> createState() => _OverviewPageState();
}

class _OverviewPageState extends State<OverviewPage> {
  Map<String, dynamic>? _weekly;
  Map<String, dynamic>? _prediction;
  Map<String, dynamic>? _gamification;
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final api = Provider.of<AuthProvider>(context, listen: false).api;
    try {
      final results = await Future.wait([
        api.getWeeklySummary(),
        api.getLatestPrediction().catchError((_) => <String, dynamic>{}),
        api.getGamificationProfile().catchError((_) => <String, dynamic>{}),
      ]);
      if (mounted) setState(() { _weekly = results[0]; _prediction = results[1]; _gamification = results[2]; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const PulseLoader();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isMobile = Responsive.isMobile(context);
    final avg = _weekly?['averages'] as Map<String, dynamic>?;

    final stats = [
      {'label': 'Study Hours', 'value': '${(avg?['study_hours'] ?? 0).toStringAsFixed(1)}h', 'icon': Icons.menu_book_rounded, 'color': AppColors.primary},
      {'label': 'Sleep Hours', 'value': '${(avg?['sleep_hours'] ?? 0).toStringAsFixed(1)}h', 'icon': Icons.bedtime_rounded, 'color': Color(0xFF8B5CF6)},
      {'label': 'Stress Level', 'value': '${(avg?['stress_level'] ?? 0).toStringAsFixed(1)}/10', 'icon': Icons.psychology_rounded, 'color': AppColors.warning},
      {'label': 'Burnout Risk', 'value': _prediction != null && _prediction!.containsKey('burnout_probability')
          ? '${((_prediction!['burnout_probability'] ?? 0) * 100).toStringAsFixed(0)}%' : 'N/A',
        'icon': Icons.local_fire_department_rounded,
        'color': (_prediction?['burnout_probability'] ?? 0) > 0.6 ? AppColors.danger : AppColors.success},
    ];

    final dailyData = _weekly?['daily_data'] as List? ?? [];
    final chartSpots = <FlSpot>[];
    for (int i = 0; i < dailyData.length && i < 7; i++) {
      chartSpots.add(FlSpot(i.toDouble(), (dailyData[i]['productivity'] ?? 5).toDouble()));
    }
    if (chartSpots.isEmpty) chartSpots.add(const FlSpot(0, 5));

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Welcome back! 👋', style: Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height: 4),
      Text('Here\'s your weekly wellness snapshot.', style: Theme.of(context).textTheme.bodyMedium),
      const SizedBox(height: 24),

      // Stats
      if (isMobile)
        GridView.count(crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 1.5,
          children: stats.map((s) => _buildStatCard(context, s, isDark)).toList())
      else
        Wrap(spacing: 16, runSpacing: 16, children: stats.map((s) =>
          SizedBox(width: 240, child: _buildStatCard(context, s, isDark))).toList()),
      const SizedBox(height: 28),

      // Productivity chart
      GlassCard(padding: const EdgeInsets.all(24), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Weekly Productivity', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 20),
        SizedBox(height: 200, child: LineChart(LineChartData(
          gridData: FlGridData(show: true, drawHorizontalLine: true, drawVerticalLine: false, horizontalInterval: 2,
            getDrawingHorizontalLine: (v) => FlLine(color: isDark ? Colors.white12 : Colors.black12, strokeWidth: 0.5)),
          titlesData: FlTitlesData(
            leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 28, interval: 2,
              getTitlesWidget: (v, _) => Text(v.toInt().toString(), style: TextStyle(fontSize: 10, color: Theme.of(context).textTheme.bodySmall?.color)))),
            bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 28,
              getTitlesWidget: (v, _) {
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                return Text(isMobile ? days[v.toInt() % 7][0] : days[v.toInt() % 7],
                  style: TextStyle(fontSize: 10, color: Theme.of(context).textTheme.bodySmall?.color));
              })),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          ),
          borderData: FlBorderData(show: false), minY: 0, maxY: 10,
          lineBarsData: [LineChartBarData(
            spots: chartSpots, isCurved: true, color: AppColors.primary, barWidth: 3,
            dotData: FlDotData(show: true, getDotPainter: (_, __, ___, ____) =>
              FlDotCirclePainter(radius: 4, color: AppColors.primary, strokeWidth: 2,
                strokeColor: isDark ? AppColors.darkBg : Colors.white)),
            belowBarData: BarAreaData(show: true, gradient: LinearGradient(
              begin: Alignment.topCenter, end: Alignment.bottomCenter,
              colors: [AppColors.primary.withValues(alpha: 0.25), AppColors.primary.withValues(alpha: 0.0)])),
          )],
        ))),
      ])),
      const SizedBox(height: 28),

      // Gamification
      if (_gamification != null && _gamification!.isNotEmpty)
        GlassCard(padding: const EdgeInsets.all(24), child: isMobile
          ? Wrap(spacing: 0, runSpacing: 16, alignment: WrapAlignment.spaceAround, children: [
              SizedBox(width: MediaQuery.of(context).size.width * 0.35, child: _quickStat(context, '🔥', 'Streak', '${_gamification!['current_streak'] ?? 0} days')),
              SizedBox(width: MediaQuery.of(context).size.width * 0.35, child: _quickStat(context, '⭐', 'XP', '${_gamification!['xp'] ?? 0}')),
              SizedBox(width: MediaQuery.of(context).size.width * 0.35, child: _quickStat(context, '🏆', 'Level', '${_gamification!['level'] ?? 1}')),
              SizedBox(width: MediaQuery.of(context).size.width * 0.35, child: _quickStat(context, '🎖️', 'Badges', '${(_gamification!['badges'] as List?)?.where((b) => b['earned'] == true).length ?? 0}')),
            ])
          : Row(children: [
              Expanded(child: _quickStat(context, '🔥', 'Streak', '${_gamification!['current_streak'] ?? 0} days')),
              Container(width: 1, height: 40, color: Theme.of(context).dividerColor),
              Expanded(child: _quickStat(context, '⭐', 'XP', '${_gamification!['xp'] ?? 0}')),
              Container(width: 1, height: 40, color: Theme.of(context).dividerColor),
              Expanded(child: _quickStat(context, '🏆', 'Level', '${_gamification!['level'] ?? 1}')),
              Container(width: 1, height: 40, color: Theme.of(context).dividerColor),
              Expanded(child: _quickStat(context, '🎖️', 'Badges', '${(_gamification!['badges'] as List?)?.where((b) => b['earned'] == true).length ?? 0}')),
            ])),
    ]);
  }

  Widget _buildStatCard(BuildContext context, Map<String, dynamic> s, bool isDark) {
    return GlassCard(
      borderColor: (s['color'] as Color).withValues(alpha: 0.2),
      padding: const EdgeInsets.all(16),
      child: Row(children: [
        Container(width: 42, height: 42,
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: (s['color'] as Color).withValues(alpha: 0.12)),
          child: Icon(s['icon'] as IconData, color: s['color'] as Color, size: 20)),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(s['label'] as String, style: Theme.of(context).textTheme.bodySmall, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(s['value'] as String, style: Theme.of(context).textTheme.titleLarge),
        ])),
      ]),
    );
  }

  Widget _quickStat(BuildContext context, String emoji, String label, String value) {
    return Column(children: [
      Text(emoji, style: const TextStyle(fontSize: 22)),
      const SizedBox(height: 6),
      Text(value, style: Theme.of(context).textTheme.titleMedium),
      Text(label, style: Theme.of(context).textTheme.bodySmall),
    ]);
  }
}
