import 'package:flutter/foundation.dart' show kIsWeb, defaultTargetPlatform;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:window_manager/window_manager.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'services/api_service.dart';
import 'theme/app_theme.dart';
import 'screens/splash_screen.dart';
import 'screens/auth_screen.dart';
import 'screens/server_config_screen.dart';
import 'screens/dashboard/dashboard_shell.dart';
import 'screens/parent/parent_dashboard.dart';

bool get _isDesktopPlatform {
  if (kIsWeb) return false;
  return [
    TargetPlatform.windows,
    TargetPlatform.macOS,
    TargetPlatform.linux,
  ].contains(defaultTargetPlatform);
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load the saved server URL before anything else
  await ApiService.loadSavedUrl();

  // Desktop window configuration
  if (_isDesktopPlatform) {
    await windowManager.ensureInitialized();
    const windowOptions = WindowOptions(
      size: Size(1280, 820),
      minimumSize: Size(800, 600),
      center: true,
      backgroundColor: Colors.transparent,
      title: 'Student Pulse',
      titleBarStyle: TitleBarStyle.normal,
    );
    await windowManager.waitUntilReadyToShow(windowOptions, () async {
      await windowManager.show();
      await windowManager.focus();
    });
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const StudentPulseApp(),
    ),
  );
}

class StudentPulseApp extends StatelessWidget {
  const StudentPulseApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    return MaterialApp(
      title: 'Student Pulse',
      debugShowCheckedModeBanner: false,
      theme: buildLightTheme(),
      darkTheme: buildDarkTheme(),
      themeMode: themeProvider.themeMode,
      initialRoute: '/',
      routes: {
        '/': (_) => const SplashScreen(),
        '/login': (_) => const AuthScreen(),
        '/server-config': (_) => const ServerConfigScreen(),
        '/dashboard': (_) => const DashboardShell(),
        '/parent': (_) => const ParentDashboard(),
      },
    );
  }
}
