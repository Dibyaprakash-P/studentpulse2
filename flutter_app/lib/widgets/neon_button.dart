import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Premium button with 3D depth shadow and hover effects.
class NeonButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool loading;
  final Color? color;
  final bool outlined;
  final double? width;
  final IconData? icon;

  const NeonButton({
    super.key,
    required this.text,
    this.onPressed,
    this.loading = false,
    this.color,
    this.outlined = false,
    this.width,
    this.icon,
  });

  @override
  State<NeonButton> createState() => _NeonButtonState();
}

class _NeonButtonState extends State<NeonButton> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final btnColor = widget.color ?? AppColors.primary;
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: SizedBox(
        width: widget.width,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            boxShadow: widget.outlined
                ? []
                : [
                    BoxShadow(
                      color: btnColor.withValues(alpha: _hovered ? 0.45 : 0.3),
                      blurRadius: _hovered ? 24 : 16,
                      offset: const Offset(0, 6),
                      spreadRadius: _hovered ? -2 : -4,
                    ),
                  ],
          ),
          child: widget.outlined
              ? OutlinedButton(
                  onPressed: widget.loading ? null : widget.onPressed,
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: btnColor, width: 1.5),
                    foregroundColor: btnColor,
                    padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _buildChild(btnColor),
                )
              : ElevatedButton(
                  onPressed: widget.loading ? null : widget.onPressed,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: btnColor,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _buildChild(Colors.white),
                ),
        ),
      ),
    );
  }

  Widget _buildChild(Color textColor) {
    if (widget.loading) {
      return SizedBox(
        height: 20,
        width: 20,
        child: CircularProgressIndicator(strokeWidth: 2, color: textColor),
      );
    }
    if (widget.icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(widget.icon, size: 18, color: textColor),
          const SizedBox(width: 8),
          Text(widget.text, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: textColor)),
        ],
      );
    }
    return Text(widget.text, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: textColor));
  }
}
