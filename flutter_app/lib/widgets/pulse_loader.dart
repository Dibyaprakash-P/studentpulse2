import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class PulseLoader extends StatefulWidget {
  const PulseLoader({super.key});
  @override
  State<PulseLoader> createState() => _PulseLoaderState();
}

class _PulseLoaderState extends State<PulseLoader> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat(reverse: true);
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(48),
        child: AnimatedBuilder(
          animation: _ctrl,
          builder: (_, __) => Opacity(
            opacity: 0.4 + _ctrl.value * 0.6,
            child: Container(
              width: 48, height: 48,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                gradient: const LinearGradient(colors: [AppColors.primary, AppColors.gradientEnd]),
              ),
              child: const Icon(Icons.monitor_heart_rounded, color: Colors.white, size: 24),
            ),
          ),
        ),
      ),
    );
  }
}
