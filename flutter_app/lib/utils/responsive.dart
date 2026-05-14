import 'package:flutter/material.dart';

/// Responsive breakpoints matching typical device sizes.
class Responsive {
  static const double mobileBreak = 600;
  static const double tabletBreak = 900;
  static const double desktopBreak = 1200;

  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < mobileBreak;

  static bool isTablet(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    return w >= mobileBreak && w < desktopBreak;
  }

  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= desktopBreak;

  /// Returns true on phone/tablet form factors (< desktop breakpoint).
  static bool isCompact(BuildContext context) =>
      MediaQuery.of(context).size.width < tabletBreak;
}
