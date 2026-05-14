import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../utils/responsive.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/neon_button.dart';
import '../../widgets/theme_toggle.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});
  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  bool _linkLoading = false;
  String? _linkError;
  String? _linkSuccess;
  final _codeCtrl = TextEditingController();

  Future<void> _linkParent() async {
    if (_codeCtrl.text.trim().isEmpty) return;
    setState(() { _linkLoading = true; _linkError = null; _linkSuccess = null; });
    // This would call a link API if it exists
    setState(() { _linkLoading = false; _linkSuccess = 'Link request sent!'; });
  }

  @override
  void dispose() { _codeCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final isMobile = Responsive.isMobile(context);
    final initials = (user?['full_name'] ?? 'SP').toString().split(' ')
        .map((w) => w.isNotEmpty ? w[0] : '').join().toUpperCase();

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Profile', style: Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height: 4),
      Text('Manage your account and preferences.', style: Theme.of(context).textTheme.bodyMedium),
      const SizedBox(height: 24),

      // User card
      GlassCard(padding: EdgeInsets.all(isMobile ? 16 : 24), child: Row(children: [
        CircleAvatar(radius: isMobile ? 24 : 32, backgroundColor: AppColors.accent.withValues(alpha: 0.3),
          child: Text(initials, style: TextStyle(fontSize: isMobile ? 18 : 24, fontWeight: FontWeight.w700, color: Colors.white))),
        SizedBox(width: isMobile ? 14 : 20),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(user?['full_name'] ?? 'Student', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 4),
          Text(user?['email'] ?? '', style: Theme.of(context).textTheme.bodyMedium, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 4),
          Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
            child: Text((user?['role'] ?? 'student').toString().toUpperCase(),
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary, letterSpacing: 1))),
        ])),
      ])),
      const SizedBox(height: 24),

      // Theme setting
      GlassCard(padding: const EdgeInsets.all(20), child: Row(children: [
        const Icon(Icons.palette_rounded, color: AppColors.primary, size: 22),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Appearance', style: Theme.of(context).textTheme.titleMedium),
          Text('Toggle between dark and light mode', style: Theme.of(context).textTheme.bodySmall),
        ])),
        const ThemeToggle(showLabel: true),
      ])),
      const SizedBox(height: 24),

      // Server settings
      GlassCard(padding: const EdgeInsets.all(20), child: Row(children: [
        const Icon(Icons.dns_rounded, color: AppColors.primary, size: 22),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Server Connection', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 4),
          Text(ApiService.baseUrl, style: Theme.of(context).textTheme.bodySmall),
        ])),
        NeonButton(text: 'Configure', outlined: true,
          onPressed: () => Navigator.of(context).pushNamed('/server-config')),
      ])),
      const SizedBox(height: 24),

      // Account info
      GlassCard(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Account Details', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 16),
        _infoRow(context, Icons.person_outline, 'Name', user?['full_name'] ?? 'N/A'),
        _infoRow(context, Icons.email_outlined, 'Email', user?['email'] ?? 'N/A'),
        _infoRow(context, Icons.badge_outlined, 'Role', (user?['role'] ?? 'student').toString()),
        _infoRow(context, Icons.star_outline, 'Level', 'Level ${user?['level'] ?? 1}'),
        _infoRow(context, Icons.local_fire_department_outlined, 'Streak', '${user?['current_streak'] ?? 0} days'),
      ])),
      const SizedBox(height: 24),

      // Parent linking (for students)
      if (user?['role'] == 'student') ...[
        GlassCard(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const Icon(Icons.family_restroom, color: AppColors.accent, size: 22),
            const SizedBox(width: 10),
            Expanded(child: Text('Link Parent Account', style: Theme.of(context).textTheme.titleMedium)),
          ]),
          const SizedBox(height: 12),
          Text('Enter your parent\'s link code to connect accounts.', style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 12),
          if (isMobile)
            Column(children: [
              TextField(controller: _codeCtrl,
                decoration: const InputDecoration(hintText: 'Enter link code', prefixIcon: Icon(Icons.link))),
              const SizedBox(height: 12),
              NeonButton(text: 'Link', loading: _linkLoading, onPressed: _linkParent, width: double.infinity),
            ])
          else
            Row(children: [
              Expanded(child: TextField(controller: _codeCtrl,
                decoration: const InputDecoration(hintText: 'Enter link code', prefixIcon: Icon(Icons.link)))),
              const SizedBox(width: 12),
              NeonButton(text: 'Link', loading: _linkLoading, onPressed: _linkParent),
            ]),
          if (_linkError != null) Padding(padding: const EdgeInsets.only(top: 8),
            child: Text(_linkError!, style: const TextStyle(color: AppColors.danger, fontSize: 12))),
          if (_linkSuccess != null) Padding(padding: const EdgeInsets.only(top: 8),
            child: Text(_linkSuccess!, style: const TextStyle(color: AppColors.success, fontSize: 12))),
        ])),
        const SizedBox(height: 24),
      ],

      // Logout
      Center(child: NeonButton(text: 'Logout', color: AppColors.danger, outlined: true, width: isMobile ? double.infinity : 200,
        onPressed: () async {
          await auth.logout();
          if (context.mounted) Navigator.of(context).pushReplacementNamed('/login');
        })),
      const SizedBox(height: 24),
    ]);
  }

  Widget _infoRow(BuildContext context, IconData icon, String label, String value) {
    return Padding(padding: const EdgeInsets.only(bottom: 12), child: Row(children: [
      Icon(icon, size: 18, color: Theme.of(context).textTheme.bodySmall?.color),
      const SizedBox(width: 12),
      SizedBox(width: 60, child: Text(label, style: Theme.of(context).textTheme.bodySmall)),
      Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14), overflow: TextOverflow.ellipsis)),
    ]));
  }
}
