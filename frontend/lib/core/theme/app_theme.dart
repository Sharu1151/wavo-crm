import 'package:flutter/material';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Colors
  static const Color primaryColor = Color(0xFF5E5CE6); // Indigo highlight
  static const Color secondaryColor = Color(0xFF0A84FF); // Blue accent
  static const Color backgroundDark = Color(0xFF0C0C0E); // Obsidian surface
  static const Color cardDark = Color(0xFF16161A); // Dark Slate surface
  static const Color textPrimaryDark = Color(0xFFF2F2F7);
  static const Color textSecondaryDark = Color(0xFFAEAEB2);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: backgroundDark,
      cardColor: cardDark,
      
      // Color Scheme
      colorScheme: const ColorScheme.dark(
        primary: primaryColor,
        secondary: secondaryColor,
        background: backgroundDark,
        surface: cardDark,
        onBackground: textPrimaryDark,
        onSurface: textPrimaryDark,
      ),

      // Text Theme matching Outfit (headers) and Inter (body)
      textTheme: TextTheme(
        headlineLarge: GoogleFonts.outfit(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: textPrimaryDark,
        ),
        titleMedium: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: textPrimaryDark,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.normal,
          color: textPrimaryDark,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          color: textSecondaryDark,
        ),
        labelSmall: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: textSecondaryDark,
        ),
      ),

      // AppBar Custom Theme
      appBarTheme: AppBarTheme(
        backgroundColor: backgroundDark,
        elevation: 0,
        titleTextStyle: GoogleFonts.outfit(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: textPrimaryDark,
        ),
        iconTheme: const IconThemeData(color: textPrimaryDark),
      ),

      // Card style margins
      cardTheme: CardTheme(
        color: cardDark,
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: const Color(0xFFF8F9FA),
      
      colorScheme: const ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        background: Color(0xFFF8F9FA),
        surface: Colors.white,
      ),

      textTheme: TextTheme(
        headlineLarge: GoogleFonts.outfit(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.black87),
        titleMedium: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.black87),
        bodyLarge: GoogleFonts.inter(fontSize: 16, color: Colors.black87),
        bodyMedium: GoogleFonts.inter(fontSize: 14, color: Colors.black54),
      ),
    );
  }
}
