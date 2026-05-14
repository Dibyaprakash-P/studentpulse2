import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../utils/responsive.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/neon_button.dart';

class TrackerPage extends StatefulWidget {
  const TrackerPage({super.key});
  @override
  State<TrackerPage> createState() => _TrackerPageState();
}

class _TrackerPageState extends State<TrackerPage> {
  bool _loading = false, _submitted = false;
  Map<String, dynamic>? _prediction;
  String? _error;

  // Fields matching backend ActivityCreate schema
  double _sleepHours = 7, _studyHours = 4, _gamingHours = 1;
  int _assignmentWorkload = 5, _waterIntakeGlasses = 6;
  double _attendancePct = 85, _screenTimeHours = 3;
  int _socialInteraction = 5, _stressLevel = 5;
  int _energyLevel = 5, _physicalActivityMins = 30;

  String _mood = '😊';
  final _moods = const ['😴', '😰', '😐', '😊', '🤩'];

  // Map mood emoji to a numeric level (1-10)
  int _moodToLevel(String mood) {
    switch (mood) {
      case '😴': return 2;
      case '😰': return 3;
      case '😐': return 5;
      case '😊': return 7;
      case '🤩': return 9;
      default: return 5;
    }
  }

  Future<void> _submit() async {
    setState(() { _loading = true; _error = null; });
    final api = Provider.of<AuthProvider>(context, listen: false).api;
    try {
      // Get today's date in YYYY-MM-DD format
      final now = DateTime.now();
      final activityDate = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';

      // Build payload matching backend ActivityCreate schema exactly
      final d = {
        'activity_date': activityDate,
        'sleep_hours': _sleepHours,
        'study_hours': _studyHours,
        'gaming_hours': _gamingHours,
        'assignment_workload': _assignmentWorkload,
        'attendance_pct': _attendancePct,
        'screen_time_hours': _screenTimeHours,
        'water_intake_glasses': _waterIntakeGlasses,
        'social_interaction': _socialInteraction,
        'mood_level': _moodToLevel(_mood),
        'stress_level': _stressLevel,
        'energy_level': _energyLevel,
        'physical_activity_mins': _physicalActivityMins,
      };
      await api.logActivity(d);
      final pred = await api.predictBurnout(d);
      setState(() { _submitted = true; _prediction = pred; });
    } catch (e) {
      setState(() { _error = e.toString().replaceFirst('Exception: ', ''); });
    } finally { if (mounted) setState(() => _loading = false); }
  }

  void _reset() => setState(() { _submitted = false; _prediction = null; _error = null; });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isMobile = Responsive.isMobile(context);
    if (_submitted && _prediction != null) return _result(context, isDark);

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Daily Check-in', style: Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height: 4),
      Text('Log your daily metrics for AI burnout predictions.', style: Theme.of(context).textTheme.bodyMedium),
      const SizedBox(height: 24),
      if (_error != null) ...[
        Container(width: double.infinity, padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: AppColors.danger.withValues(alpha: 0.1),
            border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)), borderRadius: BorderRadius.circular(12)),
          child: Text(_error!, style: const TextStyle(color: AppColors.danger, fontSize: 13))),
        const SizedBox(height: 16),
      ],
      // Mood selector
      GlassCard(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('How are you feeling?', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 16),
        Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: _moods.map((m) {
          final sel = _mood == m;
          return GestureDetector(onTap: () => setState(() => _mood = m),
            child: AnimatedContainer(duration: const Duration(milliseconds: 200),
              width: isMobile ? 48 : 56, height: isMobile ? 48 : 56,
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(16),
                color: sel ? AppColors.primary.withValues(alpha: 0.15) : Colors.transparent,
                border: Border.all(color: sel ? AppColors.primary : (isDark ? Colors.white12 : Colors.black12), width: sel ? 2 : 1),
                boxShadow: sel ? [BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 8)] : null),
              child: Center(child: Text(m, style: TextStyle(fontSize: sel ? (isMobile ? 22 : 28) : (isMobile ? 18 : 22))))));
        }).toList()),
      ])),
      const SizedBox(height: 20),
      // Sliders — use LayoutBuilder for responsive width
      LayoutBuilder(builder: (context, constraints) {
        final sliderWidth = isMobile ? constraints.maxWidth : 310.0;
        return Wrap(spacing: 16, runSpacing: 16, children: [
          _sl(context, 'Sleep Hours', '😴', _sleepHours, 0, 14, (v) => setState(() => _sleepHours = v), 'h', isDark, sliderWidth),
          _sl(context, 'Study Hours', '📚', _studyHours, 0, 16, (v) => setState(() => _studyHours = v), 'h', isDark, sliderWidth),
          _sl(context, 'Gaming Hours', '🎮', _gamingHours, 0, 12, (v) => setState(() => _gamingHours = v), 'h', isDark, sliderWidth),
          _sl(context, 'Screen Time', '📱', _screenTimeHours, 0, 16, (v) => setState(() => _screenTimeHours = v), 'h', isDark, sliderWidth),
          _slInt(context, 'Physical Activity', '🏃', _physicalActivityMins, 0, 240, (v) => setState(() => _physicalActivityMins = v), 'min', isDark, sliderWidth),
          _slInt(context, 'Assignment Load', '📝', _assignmentWorkload, 1, 10, (v) => setState(() => _assignmentWorkload = v), '', isDark, sliderWidth),
          _sl(context, 'Attendance', '📊', _attendancePct, 0, 100, (v) => setState(() => _attendancePct = v), '%', isDark, sliderWidth),
          _slInt(context, 'Water Intake', '💧', _waterIntakeGlasses, 0, 20, (v) => setState(() => _waterIntakeGlasses = v), ' gl', isDark, sliderWidth),
          _slInt(context, 'Social Interaction', '👥', _socialInteraction, 1, 10, (v) => setState(() => _socialInteraction = v), '', isDark, sliderWidth),
          _slInt(context, 'Stress Level', '😰', _stressLevel, 1, 10, (v) => setState(() => _stressLevel = v), '', isDark, sliderWidth),
          _slInt(context, 'Energy Level', '⚡', _energyLevel, 1, 10, (v) => setState(() => _energyLevel = v), '', isDark, sliderWidth),
        ]);
      }),
      const SizedBox(height: 28),
      Center(child: NeonButton(text: _loading ? 'Analyzing...' : 'Log & Predict 🧠', loading: _loading, onPressed: _submit, width: isMobile ? double.infinity : 280)),
      const SizedBox(height: 24),
    ]);
  }

  Widget _result(BuildContext context, bool isDark) {
    // Backend returns 'burnout_percentage' (0-100), not 'burnout_probability'
    final prob = (_prediction!['burnout_percentage'] ?? 0.0).toDouble();
    final risk = _prediction!['risk_level'] ?? 'unknown';
    final rawFactors = _prediction!['contributing_factors'] as List? ?? [];
    final rawRecs = _prediction!['recommendations'] as List? ?? [];
    final col = (risk == 'high' || risk == 'critical') ? AppColors.danger : risk == 'moderate' ? AppColors.warning : AppColors.success;
    final isMobile = Responsive.isMobile(context);

    // Extract display text from factor/rec objects (they're maps with detail/text keys)
    final factors = rawFactors.map((f) {
      if (f is Map) return f['detail'] ?? f['factor'] ?? f.toString();
      return f.toString();
    }).toList();
    final recs = rawRecs.map((r) {
      if (r is Map) return r['text'] ?? r.toString();
      return r.toString();
    }).toList();

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        IconButton(icon: const Icon(Icons.arrow_back_rounded), onPressed: _reset),
        const SizedBox(width: 8),
        Expanded(child: Text('Burnout Prediction', style: Theme.of(context).textTheme.headlineMedium)),
      ]),
      const SizedBox(height: 24),
      Center(child: GlassCard(borderColor: col.withValues(alpha: 0.4), padding: const EdgeInsets.all(32),
        child: Column(children: [
          Stack(alignment: Alignment.center, children: [
            SizedBox(width: isMobile ? 120 : 140, height: isMobile ? 120 : 140, child: CircularProgressIndicator(value: prob / 100, strokeWidth: 10,
              backgroundColor: isDark ? Colors.white10 : Colors.black12, color: col)),
            Column(mainAxisSize: MainAxisSize.min, children: [
              Text('${prob.toStringAsFixed(0)}%', style: TextStyle(fontSize: isMobile ? 28 : 36, fontWeight: FontWeight.w700, color: col)),
              Text(risk.toString().toUpperCase(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: col, letterSpacing: 2)),
            ]),
          ]),
          const SizedBox(height: 16),
          Text('Burnout Risk Score', style: Theme.of(context).textTheme.titleMedium),
        ]))),
      const SizedBox(height: 24),
      if (factors.isNotEmpty) GlassCard(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Contributing Factors', style: Theme.of(context).textTheme.titleMedium), const SizedBox(height: 12),
        ...factors.map((f) => Padding(padding: const EdgeInsets.only(bottom: 8),
          child: Row(children: [Container(width: 8, height: 8, decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.warning)),
            const SizedBox(width: 12), Expanded(child: Text(f.toString(), style: Theme.of(context).textTheme.bodyMedium))]))),
      ])),
      if (factors.isNotEmpty) const SizedBox(height: 16),
      if (recs.isNotEmpty) GlassCard(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('AI Recommendations', style: Theme.of(context).textTheme.titleMedium), const SizedBox(height: 12),
        ...recs.map((r) => Padding(padding: const EdgeInsets.only(bottom: 8),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('💡', style: TextStyle(fontSize: 16)), const SizedBox(width: 12),
            Expanded(child: Text(r.toString(), style: Theme.of(context).textTheme.bodyMedium))]))),
      ])),
      const SizedBox(height: 28),
      Center(child: NeonButton(text: 'Log Another Entry', onPressed: _reset, width: isMobile ? double.infinity : 220, outlined: true)),
      const SizedBox(height: 24),
    ]);
  }

  /// Slider for double values (study hours, sleep hours, etc.)
  Widget _sl(BuildContext ctx, String label, String emoji, double val, double min, double max, ValueChanged<double> onC, String suf, bool isDark, double width) {
    final displayVal = max > 10 ? val.toStringAsFixed(0) : val.toStringAsFixed(1);
    return SizedBox(width: width, child: GlassCard(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Text(emoji, style: const TextStyle(fontSize: 18)), const SizedBox(width: 8),
          Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
          Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
            child: Text('$displayVal$suf',
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.primary))),
        ]),
        const SizedBox(height: 8),
        SliderTheme(data: SliderThemeData(activeTrackColor: AppColors.primary, inactiveTrackColor: isDark ? Colors.white12 : Colors.black12,
          thumbColor: AppColors.primary, overlayColor: AppColors.primary.withValues(alpha: 0.15), trackHeight: 4),
          child: Slider(value: val, min: min, max: max, divisions: max <= 10 ? max.toInt() : (max * 2).toInt(), onChanged: onC)),
      ])));
  }

  /// Slider for integer values (stress level, energy, etc.)
  Widget _slInt(BuildContext ctx, String label, String emoji, int val, int min, int max, ValueChanged<int> onC, String suf, bool isDark, double width) {
    return SizedBox(width: width, child: GlassCard(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Text(emoji, style: const TextStyle(fontSize: 18)), const SizedBox(width: 8),
          Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
          Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
            child: Text('$val$suf',
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.primary))),
        ]),
        const SizedBox(height: 8),
        SliderTheme(data: SliderThemeData(activeTrackColor: AppColors.primary, inactiveTrackColor: isDark ? Colors.white12 : Colors.black12,
          thumbColor: AppColors.primary, overlayColor: AppColors.primary.withValues(alpha: 0.15), trackHeight: 4),
          child: Slider(value: val.toDouble(), min: min.toDouble(), max: max.toDouble(), divisions: max - min, onChanged: (v) => onC(v.round()))),
      ])));
  }
}
