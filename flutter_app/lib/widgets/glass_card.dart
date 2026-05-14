import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Premium elevated card with realistic 3D depth and layered shadows.
class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  final Color? borderColor;
  final VoidCallback? onTap;
  final bool elevated;

  const GlassCard({
    super.key,
    required this.child,
    this.padding,
    this.borderColor,
    this.onTap,
    this.elevated = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? AppColors.darkSurface2 : AppColors.lightSurface1;
    final border = borderColor ?? (isDark ? AppColors.darkBorder : AppColors.lightBorder);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: padding ?? const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: border),
          boxShadow: elevated ? AppShadows.elevated(isDark) : AppShadows.card(isDark),
        ),
        child: child,
      ),
    );
  }
}
