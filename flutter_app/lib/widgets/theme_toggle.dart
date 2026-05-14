import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import '../theme/app_theme.dart';

class ThemeToggle extends StatelessWidget {
  final bool showLabel;
  const ThemeToggle({super.key, this.showLabel = false});

  @override
  Widget build(BuildContext context) {
    final tp = Provider.of<ThemeProvider>(context);
    final isDark = tp.themeMode == ThemeMode.dark;
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            tp.toggleTheme();
          },
          borderRadius: BorderRadius.circular(20),
          splashColor: AppColors.primary.withValues(alpha: 0.15),
          highlightColor: AppColors.primary.withValues(alpha: 0.08),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface3 : AppColors.lightSurface3,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: Icon(
                  isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                  key: ValueKey(isDark),
                  size: 18,
                  color: isDark ? AppColors.warning : AppColors.accent,
                ),
              ),
              if (showLabel) ...[
                const SizedBox(width: 6),
                Text(isDark ? 'Dark' : 'Light',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                    )),
              ],
            ]),
          ),
        ),
      ),
    );
  }
}
