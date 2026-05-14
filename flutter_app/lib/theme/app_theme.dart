import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Premium 3D-inspired color system — warm, grounded, and realistic.
class AppColors {
  // Primary brand palette
  static const primary = Color(0xFF4A6CF7);       // Rich indigo
  static const primaryLight = Color(0xFF7B93FA);
  static const primaryDark = Color(0xFF2D4AD4);
  static const accent = Color(0xFFFF6B35);          // Warm coral
  static const accentLight = Color(0xFFFFA07A);

  // Semantic colors
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFF59E0B);
  static const danger = Color(0xFFEF4444);
  static const info = Color(0xFF3B82F6);

  // Dark theme surfaces (layered depth)
  static const darkBg = Color(0xFF0F1117);
  static const darkSurface1 = Color(0xFF161821);    // Lowest cards
  static const darkSurface2 = Color(0xFF1C1F2E);    // Mid-elevation
  static const darkSurface3 = Color(0xFF242839);    // High-elevation
  static const darkBorder = Color(0xFF2A2E3F);
  static const darkBorderHover = Color(0xFF3D4259);
  static const darkText = Color(0xFFE8E9ED);
  static const darkTextMuted = Color(0xFF9395A5);
  static const darkTextDim = Color(0xFF5D5F72);

  // Light theme surfaces
  static const lightBg = Color(0xFFF4F5F9);
  static const lightSurface1 = Color(0xFFFFFFFF);
  static const lightSurface2 = Color(0xFFF8F9FC);
  static const lightSurface3 = Color(0xFFEEEFF5);
  static const lightBorder = Color(0xFFE2E4EB);
  static const lightBorderHover = Color(0xFFCACDD8);
  static const lightText = Color(0xFF1A1D2B);
  static const lightTextMuted = Color(0xFF6B6E82);
  static const lightTextDim = Color(0xFF9B9EB2);

  // Gradient pairs
  static const gradientStart = Color(0xFF4A6CF7);
  static const gradientEnd = Color(0xFF9B6DFF);
  static const warmGradientStart = Color(0xFFFF6B35);
  static const warmGradientEnd = Color(0xFFFF9A5C);
}

/// 3D-style card shadow presets
class AppShadows {
  static List<BoxShadow> card(bool isDark) => [
    BoxShadow(
      color: isDark
          ? Colors.black.withValues(alpha: 0.35)
          : Colors.black.withValues(alpha: 0.06),
      blurRadius: 24,
      offset: const Offset(0, 8),
      spreadRadius: -4,
    ),
    BoxShadow(
      color: isDark
          ? Colors.black.withValues(alpha: 0.25)
          : Colors.black.withValues(alpha: 0.03),
      blurRadius: 8,
      offset: const Offset(0, 2),
    ),
  ];

  static List<BoxShadow> elevated(bool isDark) => [
    BoxShadow(
      color: isDark
          ? Colors.black.withValues(alpha: 0.5)
          : Colors.black.withValues(alpha: 0.1),
      blurRadius: 40,
      offset: const Offset(0, 16),
      spreadRadius: -8,
    ),
    BoxShadow(
      color: isDark
          ? Colors.black.withValues(alpha: 0.3)
          : Colors.black.withValues(alpha: 0.04),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> subtle(bool isDark) => [
    BoxShadow(
      color: isDark
          ? Colors.black.withValues(alpha: 0.2)
          : Colors.black.withValues(alpha: 0.04),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];

  /// Colored glow shadow for accent elements
  static List<BoxShadow> glow(Color color) => [
    BoxShadow(
      color: color.withValues(alpha: 0.3),
      blurRadius: 20,
      offset: const Offset(0, 6),
      spreadRadius: -4,
    ),
  ];
}

ThemeData buildDarkTheme() {
  return ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.darkBg,
    primaryColor: AppColors.primary,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.primary,
      secondary: AppColors.accent,
      surface: AppColors.darkSurface1,
      error: AppColors.danger,
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
      headlineLarge: GoogleFonts.plusJakartaSans(fontSize: 32, fontWeight: FontWeight.w800, color: AppColors.darkText, letterSpacing: -0.5),
      headlineMedium: GoogleFonts.plusJakartaSans(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.darkText, letterSpacing: -0.3),
      headlineSmall: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.darkText),
      titleLarge: GoogleFonts.plusJakartaSans(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.darkText),
      titleMedium: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.darkText),
      bodyLarge: GoogleFonts.inter(fontSize: 16, color: AppColors.darkText),
      bodyMedium: GoogleFonts.inter(fontSize: 14, color: AppColors.darkTextMuted, height: 1.5),
      bodySmall: GoogleFonts.inter(fontSize: 12, color: AppColors.darkTextDim),
      labelLarge: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.darkText),
    ),
    cardColor: AppColors.darkSurface1,
    dividerColor: AppColors.darkBorder,
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.darkSurface1,
      foregroundColor: AppColors.darkText,
      elevation: 0,
      titleTextStyle: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w600, color: AppColors.darkText),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.darkSurface2,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.darkBorder)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.darkBorder)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
      hintStyle: GoogleFonts.inter(color: AppColors.darkTextDim, fontSize: 14),
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),
  );
}

ThemeData buildLightTheme() {
  return ThemeData(
    brightness: Brightness.light,
    scaffoldBackgroundColor: AppColors.lightBg,
    primaryColor: AppColors.primary,
    colorScheme: const ColorScheme.light(
      primary: AppColors.primary,
      secondary: AppColors.accent,
      surface: AppColors.lightSurface1,
      error: AppColors.danger,
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme).copyWith(
      headlineLarge: GoogleFonts.plusJakartaSans(fontSize: 32, fontWeight: FontWeight.w800, color: AppColors.lightText, letterSpacing: -0.5),
      headlineMedium: GoogleFonts.plusJakartaSans(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.lightText, letterSpacing: -0.3),
      headlineSmall: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.lightText),
      titleLarge: GoogleFonts.plusJakartaSans(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.lightText),
      titleMedium: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.lightText),
      bodyLarge: GoogleFonts.inter(fontSize: 16, color: AppColors.lightText),
      bodyMedium: GoogleFonts.inter(fontSize: 14, color: AppColors.lightTextMuted, height: 1.5),
      bodySmall: GoogleFonts.inter(fontSize: 12, color: AppColors.lightTextDim),
      labelLarge: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.lightText),
    ),
    cardColor: AppColors.lightSurface1,
    dividerColor: AppColors.lightBorder,
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.lightSurface1,
      foregroundColor: AppColors.lightText,
      elevation: 0,
      titleTextStyle: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w600, color: AppColors.lightText),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.lightSurface3,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.lightBorder)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.lightBorder)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
      hintStyle: GoogleFonts.inter(color: AppColors.lightTextDim, fontSize: 14),
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),
  );
}
