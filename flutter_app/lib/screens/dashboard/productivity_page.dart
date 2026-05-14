import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../utils/responsive.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/pulse_loader.dart';

class ProductivityPage extends StatefulWidget {
  const ProductivityPage({super.key});
  @override
  State<ProductivityPage> createState() => _ProductivityPageState();
}

class _ProductivityPageState extends State<ProductivityPage> {
  Map<String, dynamic>? _weekly;
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final api = Provider.of<AuthProvider>(context, listen: false).api;
    try {
      _weekly = await api.getWeeklySummary();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const PulseLoader();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isMobile = Responsive.isMobile(context);
    final avg = _weekly?['averages'] as Map<String, dynamic>? ?? {};
    final dailyData = _weekly?['daily_data'] as List? ?? [];

    // Productivity bar data
    final barGroups = <BarChartGroupData>[];
    for (int i = 0; i < dailyData.length && i < 7; i++) {
      barGroups.add(BarChartGroupData(x: i, barRods: [
        BarChartRodData(toY: (dailyData[i]['productivity'] ?? 5).toDouble(), width: isMobile ? 14 : 20,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
          gradient: const LinearGradient(begin: Alignment.bottomCenter, end: Alignment.topCenter, colors: [AppColors.primary, AppColors.primaryLight])),
      ]));
    }

    // Time distribution
    final timeItems = [
      {'label': 'Study', 'value': avg['study_hours'] ?? 0, 'color': AppColors.primary, 'icon': '📚'},
      {'label': 'Sleep', 'value': avg['sleep_hours'] ?? 0, 'color': Color(0xFF8B5CF6), 'icon': '😴'},
      {'label': 'Screen', 'value': avg['screen_time'] ?? 0, 'color': AppColors.warning, 'icon': '📱'},
      {'label': 'Exercise', 'value': avg['physical_activity'] ?? 0, 'color': AppColors.success, 'icon': '🏃'},
      {'label': 'Social', 'value': avg['social_time'] ?? 0, 'color': AppColors.info, 'icon': '👥'},
    ];

    // Grade based on avg productivity
    final prodAvg = (avg['productivity'] ?? 5).toDouble();
    String grade;
    Color gradeColor;
    if (prodAvg >= 8) { grade = 'A+'; gradeColor = AppColors.success; }
    else if (prodAvg >= 7) { grade = 'A'; gradeColor = AppColors.success; }
    else if (prodAvg >= 6) { grade = 'B+'; gradeColor = AppColors.primary; }
    else if (prodAvg >= 5) { grade = 'B'; gradeColor = AppColors.info; }
    else if (prodAvg >= 4) { grade = 'C'; gradeColor = AppColors.warning; }
    else { grade = 'D'; gradeColor = AppColors.danger; }

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Productivity', style: Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height: 4),
      Text('Track your efficiency and time allocation.', style: Theme.of(context).textTheme.bodyMedium),
      const SizedBox(height: 24),

      // Grade + avg stats — responsive
      if (isMobile)
        GridView.count(
          crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 1.3,
          children: [
            GlassCard(borderColor: gradeColor.withValues(alpha: 0.3), padding: const EdgeInsets.all(16),
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Text(grade, style: TextStyle(fontSize: 36, fontWeight: FontWeight.w700, color: gradeColor)),
                Text('Productivity', style: Theme.of(context).textTheme.bodySmall),
                Text('Avg ${prodAvg.toStringAsFixed(1)}/10', style: Theme.of(context).textTheme.bodySmall),
              ])),
            GlassCard(padding: const EdgeInsets.all(16),
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Text('${(avg['focus_level'] ?? 0).toStringAsFixed(1)}', style: Theme.of(context).textTheme.headlineLarge?.copyWith(color: AppColors.primary)),
                Text('Avg Focus', style: Theme.of(context).textTheme.bodySmall),
              ])),
          ],
        )
      else
        Wrap(spacing: 16, runSpacing: 16, children: [
          SizedBox(width: 200, child: GlassCard(borderColor: gradeColor.withValues(alpha: 0.3), padding: const EdgeInsets.all(24),
            child: Column(children: [
              Text(grade, style: TextStyle(fontSize: 48, fontWeight: FontWeight.w700, color: gradeColor)),
              const SizedBox(height: 4),
              Text('Productivity Grade', style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 8),
              Text('Avg ${prodAvg.toStringAsFixed(1)}/10', style: Theme.of(context).textTheme.bodyMedium),
            ]))),
          SizedBox(width: 200, child: GlassCard(padding: const EdgeInsets.all(24),
            child: Column(children: [
              Text('${(avg['focus_level'] ?? 0).toStringAsFixed(1)}', style: Theme.of(context).textTheme.headlineLarge?.copyWith(color: AppColors.primary)),
              const SizedBox(height: 4), Text('Avg Focus', style: Theme.of(context).textTheme.bodySmall),
            ]))),
          SizedBox(width: 200, child: GlassCard(padding: const EdgeInsets.all(24),
            child: Column(children: [
              Text('${(avg['motivation'] ?? 0).toStringAsFixed(1)}', style: Theme.of(context).textTheme.headlineLarge?.copyWith(color: Color(0xFF8B5CF6))),
              const SizedBox(height: 4), Text('Avg Motivation', style: Theme.of(context).textTheme.bodySmall),
            ]))),
        ]),
      const SizedBox(height: 24),

      // Chart
      if (barGroups.isNotEmpty)
        GlassCard(padding: const EdgeInsets.all(24), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Daily Productivity (7 Days)', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 20),
          SizedBox(height: 200, child: BarChart(BarChartData(
            gridData: FlGridData(show: true, drawVerticalLine: false, horizontalInterval: 2,
              getDrawingHorizontalLine: (v) => FlLine(color: isDark ? Colors.white12 : Colors.black12, strokeWidth: 0.5)),
            titlesData: FlTitlesData(
              leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 28, interval: 2,
                getTitlesWidget: (v, _) => Text(v.toInt().toString(), style: TextStyle(fontSize: 10, color: Theme.of(context).textTheme.bodySmall?.color)))),
              bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 28,
                getTitlesWidget: (v, _) { const d = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                  return Text(isMobile ? d[v.toInt() % 7][0] : d[v.toInt() % 7], style: TextStyle(fontSize: 10, color: Theme.of(context).textTheme.bodySmall?.color)); })),
              rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            ),
            borderData: FlBorderData(show: false), maxY: 10,
            barGroups: barGroups,
          ))),
        ])),
      const SizedBox(height: 24),

      // Time distribution
      GlassCard(padding: const EdgeInsets.all(24), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Average Time Distribution', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 16),
        ...timeItems.map((item) {
          final val = (item['value'] as num).toDouble();
          return Padding(padding: const EdgeInsets.only(bottom: 14), child: Row(children: [
            Text(item['icon'] as String, style: const TextStyle(fontSize: 20)),
            const SizedBox(width: 12),
            SizedBox(width: isMobile ? 50 : 70, child: Text(item['label'] as String, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13))),
            Expanded(child: ClipRRect(borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(value: val / 16, minHeight: 8,
                backgroundColor: isDark ? Colors.white10 : Colors.black12, color: item['color'] as Color))),
            const SizedBox(width: 12),
            SizedBox(width: 40, child: Text('${val.toStringAsFixed(1)}h', textAlign: TextAlign.right,
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: item['color'] as Color))),
          ]));
        }),
      ])),
    ]);
  }
}
