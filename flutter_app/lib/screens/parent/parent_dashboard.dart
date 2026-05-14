import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../utils/responsive.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/neon_button.dart';
import '../../widgets/pulse_loader.dart';
import '../../widgets/theme_toggle.dart';

class ParentDashboard extends StatefulWidget {
  const ParentDashboard({super.key});
  @override
  State<ParentDashboard> createState() => _ParentDashboardState();
}

class _ParentDashboardState extends State<ParentDashboard> {
  List<dynamic> _students = [];
  String? _linkCode;
  bool _loading = true;
  bool _genLoading = false;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final api = Provider.of<AuthProvider>(context, listen: false).api;
    try { _students = await api.getLinkedStudents(); } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _generateCode() async {
    setState(() => _genLoading = true);
    final api = Provider.of<AuthProvider>(context, listen: false).api;
    try {
      final data = await api.generateLinkCode();
      setState(() { _linkCode = data['link_code']?.toString(); });
    } catch (_) {}
    if (mounted) setState(() => _genLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final isCompact = Responsive.isCompact(context);
    return isCompact ? _buildMobileLayout(context) : _buildDesktopLayout(context);
  }

  Widget _buildContent(BuildContext context) {
    if (_loading) return const PulseLoader();

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Your Students', style: Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height: 4),
      Text('Monitor your children\'s wellness and burnout risk.', style: Theme.of(context).textTheme.bodyMedium),
      const SizedBox(height: 24),

      // Link code generation
      GlassCard(borderColor: AppColors.accent.withValues(alpha: 0.3), padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const Icon(Icons.link, color: AppColors.accent, size: 22),
            const SizedBox(width: 10),
            Text('Link a Student', style: Theme.of(context).textTheme.titleMedium),
          ]),
          const SizedBox(height: 12),
          Text('Generate a link code and share it with your child to connect accounts.', style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 12),
          Wrap(spacing: 12, runSpacing: 12, children: [
            NeonButton(text: _genLoading ? 'Generating...' : 'Generate Link Code', loading: _genLoading,
              color: AppColors.accent, onPressed: _generateCode),
            if (_linkCode != null)
              Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.accent.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.accent.withValues(alpha: 0.3))),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.key, size: 18, color: AppColors.accent),
                  const SizedBox(width: 8),
                  SelectableText(_linkCode!, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.accent, letterSpacing: 2)),
                ])),
          ]),
        ])),
      const SizedBox(height: 24),

      // Student cards
      if (_students.isEmpty)
        GlassCard(padding: const EdgeInsets.all(32), child: Center(child: Column(children: [
          const Text('👨‍👧‍👦', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 16),
          Text('No linked students yet', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Text('Generate a link code above and share it with your child.', textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
        ])))
      else
        Wrap(spacing: 16, runSpacing: 16, children: _students.map((s) {
          final risk = s['burnout_risk'] ?? 'unknown';
          final riskCol = risk == 'high' ? AppColors.danger : risk == 'moderate' ? AppColors.warning : AppColors.success;
          return SizedBox(width: Responsive.isMobile(context) ? double.infinity : 350, child: GlassCard(padding: const EdgeInsets.all(20),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                CircleAvatar(radius: 20, backgroundColor: AppColors.primary.withValues(alpha: 0.2),
                  child: Text((s['full_name'] ?? 'S')[0].toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary))),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(s['full_name'] ?? 'Student', style: Theme.of(context).textTheme.titleMedium),
                  Text(s['email'] ?? '', style: Theme.of(context).textTheme.bodySmall),
                ])),
                Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: riskCol.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
                  child: Text(risk.toString().toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: riskCol))),
              ]),
              const SizedBox(height: 12),
              Wrap(spacing: 16, runSpacing: 4, children: [
                _miniStat(context, '🔥', '${s['current_streak'] ?? 0}d streak'),
                _miniStat(context, '⭐', 'Level ${s['level'] ?? 1}'),
                _miniStat(context, '📊', '${s['xp'] ?? 0} XP'),
              ]),
            ])));
        }).toList()),
    ]);
  }

  // ─── MOBILE LAYOUT ─────────────────────────────────────────────────
  Widget _buildMobileLayout(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    return Scaffold(
      appBar: AppBar(
        title: Row(children: [
          Container(
            width: 28, height: 28,
            decoration: BoxDecoration(
              shape: BoxShape.circle, border: Border.all(color: AppColors.accent),
              boxShadow: [BoxShadow(color: AppColors.accent.withValues(alpha: 0.4), blurRadius: 6)],
            ),
            child: const Center(child: Text('SP', style: TextStyle(color: AppColors.accent, fontSize: 9, fontWeight: FontWeight.w700))),
          ),
          const SizedBox(width: 10),
          const Text('Parent Portal'),
        ]),
        actions: [
          const ThemeToggle(),
          IconButton(icon: const Icon(Icons.logout, size: 20), onPressed: () async {
            await auth.logout();
            if (context.mounted) Navigator.of(context).pushReplacementNamed('/login');
          }),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: _buildContent(context),
      ),
    );
  }

  // ─── DESKTOP LAYOUT ────────────────────────────────────────────────
  Widget _buildDesktopLayout(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Row(children: [
        // Sidebar
        Container(width: 220,
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface1 : AppColors.lightSurface1,
            border: Border(right: BorderSide(color: Theme.of(context).dividerColor))),
          child: Column(children: [
            Container(height: 72, padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Theme.of(context).dividerColor))),
              child: Row(children: [
                Container(width: 32, height: 32,
                  decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppColors.accent),
                    boxShadow: [BoxShadow(color: AppColors.accent.withValues(alpha: 0.4), blurRadius: 8)]),
                  child: const Center(child: Text('SP', style: TextStyle(color: AppColors.accent, fontSize: 11, fontWeight: FontWeight.w700)))),
                const SizedBox(width: 10),
                Text('Parent Portal', style: Theme.of(context).textTheme.titleMedium),
              ])),
            const Spacer(),
            Container(padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(border: Border(top: BorderSide(color: Theme.of(context).dividerColor))),
              child: Row(children: [
                CircleAvatar(radius: 18, backgroundColor: AppColors.accent.withValues(alpha: 0.3),
                  child: const Text('P', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white))),
                const SizedBox(width: 10),
                Expanded(child: Text(auth.user?['full_name'] ?? 'Parent', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis)),
                IconButton(icon: const Icon(Icons.logout, size: 18), onPressed: () async {
                  await auth.logout();
                  if (context.mounted) Navigator.of(context).pushReplacementNamed('/login');
                }),
              ])),
          ])),

        // Content
        Expanded(child: Column(children: [
          Container(height: 72, padding: const EdgeInsets.symmetric(horizontal: 28),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface1 : AppColors.lightSurface1,
              border: Border(bottom: BorderSide(color: Theme.of(context).dividerColor))),
            child: Row(children: [
              Text('Parent Dashboard', style: Theme.of(context).textTheme.headlineSmall),
              const Spacer(),
              const ThemeToggle(),
            ])),
          Expanded(child: SingleChildScrollView(padding: const EdgeInsets.all(28),
            child: _buildContent(context))),
        ])),
      ]),
    );
  }

  Widget _miniStat(BuildContext context, String emoji, String text) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Text(emoji, style: const TextStyle(fontSize: 14)),
      const SizedBox(width: 4),
      Text(text, style: Theme.of(context).textTheme.bodySmall),
    ]);
  }
}
