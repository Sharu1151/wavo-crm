import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

// Placeholder screen routes imports
// In production, these correspond to actual feature UI files.
class DummyLoginScreen extends StatelessWidget {
  const DummyLoginScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Login Screen')));
}

class DummyDashboardScreen extends StatelessWidget {
  const DummyDashboardScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Dashboard Screen')));
}

class DummyCustomerScreen extends StatelessWidget {
  const DummyCustomerScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Customers Screen')));
}

class DummyLeadsScreen extends StatelessWidget {
  const DummyLeadsScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Kanban Leads Screen')));
}

final GoRouter appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const DummyLoginScreen(),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const DummyDashboardScreen(),
    ),
    GoRoute(
      path: '/customers',
      builder: (context, state) => const DummyCustomerScreen(),
    ),
    GoRoute(
      path: '/leads',
      builder: (context, state) => const DummyLeadsScreen(),
    ),
  ],
);
