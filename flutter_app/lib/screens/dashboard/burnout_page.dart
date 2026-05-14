import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../utils/responsive.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/pulse_loader.dart';

class BurnoutPage extends StatefulWidget {
  const BurnoutPage({super.key});
  @override
  State<BurnoutPage> createState() => _BurnoutPageState();
}

class _BurnoutPageState extends State<BurnoutPage> {
  Map<String, dynamic>? _prediction;
  Map<String, dynamic>? _weekly;
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final api = Provider.of<AuthProvider>(context, listen: false).api;
    try {
      final results = await Future.wait([
        api.getLatestPrediction().catchError((_) => <String, dynamic>{}),
        api.getWeeklySummary().catchError((_) => <String, dynamic>{}),
      ]);
      if (mounted) setState(() { _prediction = results[0]; _weekly = results[1]; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const PulseLoader();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isMobile = Responsive.isMobile(context);
    final prob = (_prediction?['burnout_probability'] ?? 0.0) * 100;
    final risk = _prediction?['risk_level'] ?? 'unknown';
    final factors = _prediction?['contributing_factors'] as List? ?? [];
    final recs = _prediction?['recommendations'] as List? ?? [];
    final col = (risk == 'high' || risk == 'critical') ? AppColors.danger : risk == 'moderate' ? AppColors.warning : AppColors.success;

    // Build chart data from weekly daily_data
    final dailyData = _weekly?['daily_data'] as List? ?? [];
    final stressSpots = <FlSpot>[];
    final energySpots = <FlSpot>[];
    for (int i = 0; i < dailyData.length && i < 7; i++) {
      stressSpots.add(FlSpot(i.toDouble(), (dailyData[i]['stress_level'] ?? 5).toDouble()));
      energySpots.add(FlSpot(i.toDouble(), (dailyData[i]['energy_level'] ?? 5).toDouble()));
    }
    if (stressSpots.isEmpty) { stressSpots.add(const FlSpot(0, 5)); energySpots.add(const FlSpot(0, 5)); }

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Burnout Analytics', style: Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height: 4),
      Text('AI-powered burnout analysis and prevention insights.', style: Theme.of(context).textTheme.bodyMedium),
      const SizedBox(height: 24),

      if (_prediction == null || _prediction!.isEmpty) ...[
        GlassCard(padding: const EdgeInsets.all(32), child: Center(child: Column(children: [
          const Text('🧠', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 16),
          Text('No predictions yet', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Text('Log your daily activity in the Tracker to get your first burnout prediction.', textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
        ]))),
      ] else ...[
        // Risk gauge + factors — stack vertically on mobile
        if (isMobile) ...[
          GlassCard(borderColor: col.withValues(alpha: 0.4), padding: const EdgeInsets.all(28),
            child: Column(children: [
              Stack(alignment: Alignment.center, children: [
                SizedBox(width: 140, height: 140, child: CircularProgressIndicator(value: prob / 100, strokeWidth: 12,
                  backgroundColor: isDark ? Colors.white10 : Colors.black12, color: col)),
                Column(mainAxisSize: MainAxisSize.min, children: [
                  Text('${prob.toStringAsFixed(0)}%', style: TextStyle(fontSize: 36, fontWeight: FontWeight.w700, color: col)),
                  Text(risk.toString().toUpperCase(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: col, letterSpacing: 2)),
                ]),
              ]),
              const SizedBox(height: 16),
              Text('Burnout Risk', style: Theme.of(context).textTheme.titleMedium),
            ])),
          if (factors.isNotEmpty) ...[
            const SizedBox(height: 16),
            _buildFactorsCard(context, factors),
          ],
        ] else
          Wrap(spacing: 16, runSpacing: 16, children: [
            SizedBox(width: 320, child: GlassCard(borderColor: col.withValues(alpha: 0.4), padding: const EdgeInsets.all(28),
              child: Column(children: [
                Stack(alignment: Alignment.center, children: [
                  SizedBox(width: 160, height: 160, child: CircularProgressIndicator(value: prob / 100, strokeWidth: 12,
                    backgroundColor: isDark ? Colors.white10 : Colors.black12, color: col)),
                  Column(mainAxisSize: MainAxisSize.min, children: [
                    Text('${prob.toStringAsFixed(0)}%', style: TextStyle(fontSize: 42, fontWeight: FontWeight.w700, color: col)),
                    Text(risk.toString().toUpperCase(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: col, letterSpacing: 2)),
                  ]),
                ]),
                const SizedBox(height: 16),
                Text('Burnout Risk', style: Theme.of(context).textTheme.titleMedium),
              ]))),
            if (factors.isNotEmpty)
              SizedBox(width: 400, child: _buildFactorsCard(context, factors)),
          ]),
        const SizedBox(height: 24),

        // Stress vs Energy chart
        GlassCard(padding: const EdgeInsets.all(24), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Stress vs Energy (7 Days)', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Wrap(spacing: 16, children: [
            Row(mainAxisSize: MainAxisSize.min, children: [
              Container(width: 12, height: 3, decoration: BoxDecoration(color: AppColors.danger, borderRadius: BorderRadius.circular(2))),
              const SizedBox(width: 6), Text('Stress', style: Theme.of(context).textTheme.bodySmall),
            ]),
            Row(mainAxisSize: MainAxisSize.min, children: [
              Container(width: 12, height: 3, decoration: BoxDecoration(color: AppColors.success, borderRadius: BorderRadius.circular(2))),
              const SizedBox(width: 6), Text('Energy', style: Theme.of(context).textTheme.bodySmall),
            ]),
          ]),
          const SizedBox(height: 16),
          SizedBox(height: 200, child: LineChart(LineChartData(
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
            borderData: FlBorderData(show: false), minY: 0, maxY: 10,
            lineBarsData: [
              LineChartBarData(spots: stressSpots, isCurved: true, color: AppColors.danger, barWidth: 2.5,
                dotData: const FlDotData(show: false),
                belowBarData: BarAreaData(show: true, gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter,
                  colors: [AppColors.danger.withValues(alpha: 0.2), AppColors.danger.withValues(alpha: 0.0)]))),
              LineChartBarData(spots: energySpots, isCurved: true, color: AppColors.success, barWidth: 2.5,
                dotData: const FlDotData(show: false),
                belowBarData: BarAreaData(show: true, gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter,
                  colors: [AppColors.success.withValues(alpha: 0.2), AppColors.success.withValues(alpha: 0.0)]))),
            ],
          ))),
        ])),
        const SizedBox(height: 24),

        // Recommendations
        if (recs.isNotEmpty)
          GlassCard(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              const Icon(Icons.lightbulb_outline, color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              Text('AI Recommendations', style: Theme.of(context).textTheme.titleMedium),
            ]),
            const SizedBox(height: 12),
            ...recs.map((r) => Padding(padding: const EdgeInsets.only(bottom: 10),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('💡'), const SizedBox(width: 12),
                Expanded(child: Text(r.toString(), style: Theme.of(context).textTheme.bodyMedium)),
              ]))),
          ])),
      ],
    ]);
  }

  Widget _buildFactorsCard(BuildContext context, List factors) {
    return GlassCard(padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.warning_amber_rounded, color: AppColors.warning, size: 20),
          const SizedBox(width: 8),
          Text('Risk Factors', style: Theme.of(context).textTheme.titleMedium),
        ]),
        const SizedBox(height: 12),
        ...factors.map((f) => Padding(padding: const EdgeInsets.only(bottom: 10),
          child: Row(children: [
            Container(width: 6, height: 6, decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.warning)),
            const SizedBox(width: 12),
            Expanded(child: Text(f.toString(), style: Theme.of(context).textTheme.bodyMedium)),
          ]))),
      ]));
  }
}
