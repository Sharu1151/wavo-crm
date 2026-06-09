import 'package:flutter/material';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/theme/app_theme.dart';
import 'core/routing/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // In production: initialize dependency injection bindings (GetIt) and local DB caches (Hive)
  // await Hive.initFlutter();
  // setupLocator();
  
  runApp(const WavoCRMApp());
}

class WavoCRMApp extends StatelessWidget {
  const WavoCRMApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Wavo CRM',
      debugShowCheckedModeBanner: false,
      
      // 1. Material 3 Theme configurations
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark, // Default to a premium dark theme
      
      // 2. Navigation Routes Configuration (GoRouter)
      routerConfig: appRouter,
    );
  }
}
