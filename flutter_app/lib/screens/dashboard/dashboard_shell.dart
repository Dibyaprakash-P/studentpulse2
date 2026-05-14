import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../utils/responsive.dart';
import '../../widgets/theme_toggle.dart';
import 'overview_page.dart';
import 'tracker_page.dart';
import 'homework_page.dart';
import 'notes_page.dart';
import 'projects_page.dart';
import 'burnout_page.dart';
import 'productivity_page.dart';
import 'achievements_page.dart';
import 'profile_page.dart';

class DashboardShell extends StatefulWidget {
  const DashboardShell({super.key});
  @override
  State<DashboardShell> createState() => _DashboardShellState();
}

class _DashboardShellState extends State<DashboardShell> {
  int _selected = 0;

  final _pages = const [
    OverviewPage(), TrackerPage(), HomeworkPage(), NotesPage(),
    ProjectsPage(), BurnoutPage(), ProductivityPage(),
    AchievementsPage(), ProfilePage(),
  ];

  final _navItems = const [
    {'icon': Icons.dashboard_rounded, 'label': 'Overview'},
    {'icon': Icons.edit_note_rounded, 'label': 'Tracker'},
    {'icon': Icons.assignment_rounded, 'label': 'Homework'},
    {'icon': Icons.note_alt_rounded, 'label': 'Notes'},
    {'icon': Icons.folder_special_rounded, 'label': 'Projects'},
    {'icon': Icons.psychology_rounded, 'label': 'Burnout'},
    {'icon': Icons.trending_up_rounded, 'label': 'Productivity'},
    {'icon': Icons.emoji_events_rounded, 'label': 'Achievements'},
    {'icon': Icons.person_rounded, 'label': 'Profile'},
  ];

  @override
  Widget build(BuildContext context) {
    final isCompact = Responsive.isCompact(context);
    return isCompact ? _buildMobileLayout(context) : _buildDesktopLayout(context);
  }

  // ─── MOBILE / TABLET (Bottom Navigation) ───────────────────────────
  Widget _buildMobileLayout(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    // On mobile show only first 5 items in bottom nav, rest in overflow
    final bottomItems = _navItems.take(5).toList();

    return Scaffold(
      appBar: AppBar(
        title: Row(children: [
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              gradient: const LinearGradient(colors: [AppColors.primary, AppColors.gradientEnd]),
            ),
            child: const Icon(Icons.monitor_heart_rounded, size: 16, color: Colors.white),
          ),
          const SizedBox(width: 10),
          Text(_navItems[_selected]['label'] as String),
        ]),
        actions: [
          // Streak chip
          Container(
            margin: const EdgeInsets.only(right: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Theme.of(context).dividerColor),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              const Text('🔥', style: TextStyle(fontSize: 12)),
              const SizedBox(width: 4),
              Builder(builder: (ctx) {
                final user = Provider.of<AuthProvider>(ctx).user;
                return Text('${user?['current_streak'] ?? 0}',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12));
              }),
            ]),
          ),
          const Padding(padding: EdgeInsets.only(right: 8), child: ThemeToggle()),
          // More menu for remaining items
          PopupMenuButton<int>(
            icon: const Icon(Icons.more_vert_rounded),
            onSelected: (i) => setState(() => _selected = i),
            itemBuilder: (_) => List.generate(_navItems.length, (i) => PopupMenuItem(
              value: i,
              child: Row(children: [
                Icon(_navItems[i]['icon'] as IconData, size: 20,
                    color: _selected == i ? AppColors.primary : null),
                const SizedBox(width: 12),
                Text(_navItems[i]['label'] as String,
                    style: TextStyle(fontWeight: _selected == i ? FontWeight.w600 : FontWeight.w400)),
              ]),
            )),
          ),
        ],
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        child: SingleChildScrollView(
          key: ValueKey(_selected),
          padding: const EdgeInsets.all(16),
          child: _pages[_selected],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface1 : AppColors.lightSurface1,
          border: Border(top: BorderSide(color: Theme.of(context).dividerColor)),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.06),
              blurRadius: 12, offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(bottomItems.length, (i) {
                final active = _selected == i;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selected = i),
                    behavior: HitTestBehavior.opaque,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Column(mainAxisSize: MainAxisSize.min, children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          decoration: BoxDecoration(
                            color: active ? AppColors.primary.withValues(alpha: 0.12) : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(bottomItems[i]['icon'] as IconData, size: 22,
                              color: active ? AppColors.primary : Theme.of(context).textTheme.bodyMedium?.color),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          bottomItems[i]['label'] as String,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                            color: active ? AppColors.primary : Theme.of(context).textTheme.bodySmall?.color,
                          ),
                          maxLines: 1, overflow: TextOverflow.ellipsis,
                        ),
                      ]),
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }

  // ─── DESKTOP / WIDE TABLET (Sidebar) ──────────────────────────────
  Widget _buildDesktopLayout(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final initials = (user?['full_name'] ?? 'SP').toString().split(' ').map((w) => w.isNotEmpty ? w[0] : '').join().toUpperCase();

    return Scaffold(
      body: Row(
        children: [
          // Sidebar
          Container(
            width: 240,
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface1 : AppColors.lightSurface1,
              border: Border(right: BorderSide(color: Theme.of(context).dividerColor)),
            ),
            child: Column(
              children: [
                // Logo
                Container(
                  height: 72, padding: const EdgeInsets.symmetric(horizontal: 20),
                  decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Theme.of(context).dividerColor))),
                  child: Row(children: [
                    Container(
                      width: 34, height: 34,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        gradient: const LinearGradient(colors: [AppColors.primary, AppColors.gradientEnd]),
                        boxShadow: AppShadows.glow(AppColors.primary),
                      ),
                      child: const Icon(Icons.monitor_heart_rounded, size: 18, color: Colors.white),
                    ),
                    const SizedBox(width: 12),
                    Text('Student Pulse', style: GoogleFonts.plusJakartaSans(
                      fontWeight: FontWeight.w700, fontSize: 16,
                      color: isDark ? AppColors.darkText : AppColors.lightText,
                    )),
                  ]),
                ),

                // Nav items
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.all(12),
                    children: List.generate(_navItems.length, (i) {
                      final active = _selected == i;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 2),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(12),
                            onTap: () => setState(() => _selected = i),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                color: active
                                    ? AppColors.primary.withValues(alpha: 0.1)
                                    : Colors.transparent,
                              ),
                              child: Row(children: [
                                Icon(_navItems[i]['icon'] as IconData, size: 20,
                                    color: active ? AppColors.primary : (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted)),
                                const SizedBox(width: 12),
                                Text(_navItems[i]['label'] as String,
                                    style: TextStyle(
                                      fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                                      fontSize: 14,
                                      color: active ? AppColors.primary : (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                                    )),
                              ]),
                            ),
                          ),
                        ),
                      );
                    }),
                  ),
                ),

                // User card at bottom
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(border: Border(top: BorderSide(color: Theme.of(context).dividerColor))),
                  child: Row(children: [
                    Container(
                      width: 36, height: 36,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        gradient: const LinearGradient(colors: [AppColors.accent, AppColors.warmGradientEnd]),
                      ),
                      child: Center(child: Text(initials, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white))),
                    ),
                    const SizedBox(width: 10),
                    Expanded(child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user?['full_name'] ?? 'Student', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis),
                        Text('Level ${user?['level'] ?? 1}', style: Theme.of(context).textTheme.bodySmall),
                      ],
                    )),
                    IconButton(icon: const Icon(Icons.logout_rounded, size: 18), onPressed: () async {
                      await auth.logout();
                      if (context.mounted) Navigator.of(context).pushReplacementNamed('/login');
                    }),
                  ]),
                ),
              ],
            ),
          ),

          // Main content
          Expanded(
            child: Column(
              children: [
                // Top header
                Container(
                  height: 72,
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurface1 : AppColors.lightSurface1,
                    border: Border(bottom: BorderSide(color: Theme.of(context).dividerColor)),
                  ),
                  child: Row(
                    children: [
                      Text(_navItems[_selected]['label'] as String,
                          style: Theme.of(context).textTheme.headlineSmall),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.04),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Theme.of(context).dividerColor),
                        ),
                        child: Row(children: [
                          const Text('🔥', style: TextStyle(fontSize: 14)),
                          const SizedBox(width: 6),
                          Text('${user?['current_streak'] ?? 0} Day Streak',
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                        ]),
                      ),
                      const SizedBox(width: 16),
                      const ThemeToggle(),
                    ],
                  ),
                ),

                // Page content
                Expanded(
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    child: SingleChildScrollView(
                      key: ValueKey(_selected),
                      padding: const EdgeInsets.all(28),
                      child: _pages[_selected],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
