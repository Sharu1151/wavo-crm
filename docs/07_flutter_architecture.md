# Flutter Architecture Specification - Wavo CRM

Wavo CRM's frontend is built with Flutter, configured to target Web, Mobile, and Desktop platforms using a unified codebase. The architecture relies on **Clean Architecture** patterns combined with **BLoC (Business Logic Component)** for state management and **GoRouter** for declarative routing.

---

## 1. Directory Structure
The frontend directory structure isolates features, decoupling business rules from the user interface.

```
frontend/
├── android/
├── ios/
├── web/
├── assets/
│   ├── fonts/                  # Google Fonts (Inter, Outfit)
│   └── images/                 # App logos, default avatars, placeholders
├── lib/
│   ├── main.dart               # Bootstraps app, sets up providers & routing
│   ├── core/                   # Global, feature-independent systems
│   │   ├── theme/              # Material 3 colors, spacing, and font config
│   │   ├── routing/            # GoRouter configurations, sub-routes, guards
│   │   ├── network/            # Dio HTTP client, interceptors, error wrappers
│   │   ├── error/              # Failure classes & global exception handler
│   │   └── utils/              # Data converters, date formatting helpers
│   ├── widgets/                # App-wide reusable Material 3 components
│   │   ├── wavo_button.dart    # Custom buttons with loading states
│   │   ├── wavo_input.dart     # Form fields with standard validations
│   │   └── wavo_card.dart      # Glassmorphic-style material cards
│   └── features/               # Domain-specific vertical features
│       ├── auth/               # User registration, login, and profile
│       ├── dashboard/          # Metrics, revenue reports, charts
│       ├── customers/          # Customer directory, timeline logs, tagging
│       └── leads/              # Kanban board, lead details, notes
│           ├── data/           # Remote data sources, models, repositories
│           ├── domain/         # Entities, use cases, repository contracts
│           └── presentation/   # UI Screens, Widgets, and BLoC managers
└── pubspec.yaml                # Project dependency configuration
```

---

## 2. Layered Architecture (Clean Architecture)
Each vertical feature is divided into three layers:

### 2.1 Data Layer
Responsible for interacting with external APIs or local databases.
*   **Models:** Data Transfer Objects (DTOs) with JSON serialization logic (using `freezed` or `json_serializable`) extending entities.
*   **Data Sources:** Raw HTTP client abstractions (Dio) or local database handlers (Hive/Isar).
*   **Repository Implementations:** Implements contracts defined in the Domain layer, handling caching strategies (e.g., fetch from API, cache locally, return cache on failure).

### 2.2 Domain Layer
The core of the feature containing pure Dart code with zero external framework dependencies.
*   **Entities:** Structural representations of business models (e.g., `CustomerEntity`, `LeadEntity`).
*   **Repository Interfaces:** Boundary contracts specifying CRUD interactions.
*   **Use Cases:** Single-responsibility business actions (e.g., `GetLeadPipeline`, `ConvertLeadToCustomer`).

### 2.3 Presentation Layer
Handles rendering views and capturing user interactions.
*   **Screens:** Scaffold-containing pages (e.g., `LeadKanbanScreen`).
*   **Widgets:** Extracted micro-layouts to prevent monolithic build functions.
*   **BLoCs (State Management):** Captures events (e.g., `FetchLeadsEvent`, `UpdateLeadStageEvent`), runs the corresponding Use Case, and emits immutable states (e.g., `LeadsLoadingState`, `LeadsLoadedState`, `LeadsErrorState`).

---

## 3. State Management (BLoC Pattern)
Every interactive page wraps around a `BlocProvider` or `BlocBuilder` to reactively update components.

```
       +---------------------------------------------+
       |                  UI Widgets                 |
       +-------+-----------------------------^-------+
               |                             |
  Trigger Event| (e.g. FetchCustomers)        | Emits State (e.g. CustomersLoaded)
               v                             |
       +-------------------------------------+-------+
       |                 BLoC                        |
       |  - Listens to incoming UI events            |
       |  - Executes corresponding use-case          |
       +-------+-----------------------------^-------+
               |                             |
       Execute |                             | Return Entity Data
               v                             |
       +-------+-----------------------------+-------+
               |                Use Cases            |
       +-------v-------------------------------------+
```

---

## 4. Routing Design (GoRouter)
The routing configuration implements path-based URL routes enabling deep linking on web.
*   **Guards:** A redirect callback evaluates the authentication state. If the user is unauthenticated, they are redirected to `/login`.
*   **Structure:**
    ```dart
    final goRouter = GoRouter(
      initialLocation: '/login',
      refreshListenable: AuthBlocNotifier(), // Listen to authentication changes
      routes: [
        GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
        ShellRoute(
          builder: (context, state, child) => MasterLayout(child: child), // Sidebar layout
          routes: [
            GoRoute(path: '/dashboard', builder: (context, state) => const DashboardScreen()),
            GoRoute(path: '/customers', builder: (context, state) => const CustomerListScreen()),
            GoRoute(
              path: '/customers/:id',
              builder: (context, state) => CustomerDetailScreen(id: state.pathParameters['id']!),
            ),
            GoRoute(path: '/leads', builder: (context, state) => const LeadsKanbanScreen()),
          ],
        ),
      ],
    );
    ```

---

## 5. Material 3 Theme Specifications
Custom themes follow a high-contrast dark mode palette reminiscent of Linear, styling widgets globally:
*   **Primary Color:** Deep Indigo (`Color(0xFF5E5CE6)`)
*   **Secondary Color:** Teal Accent (`Color(0xFF0A84FF)`)
*   **Background Dark:** Charcoal/Obsidian (`Color(0xFF0C0C0E)`)
*   **Card Background:** Dark Slate (`Color(0xFF16161A)`)
*   **Text Hierarchy:** Large titles styled in **Outfit** font, metadata/tables styled in **Inter**.
*   **Micro-Animations:** Employs subtle hover translations on cards ($1.02\times$ scale) and custom fading transitions between routes.
