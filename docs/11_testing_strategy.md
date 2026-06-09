# Testing Strategy - Wavo CRM

This document outlines the testing methodologies, tools, and coverage benchmarks used to ensure the reliability and speed of Wavo CRM.

---

## 1. Testing Matrix & Classifications

Wavo CRM employs a multi-tiered testing strategy spanning unit tests, API integration tests, Flutter UI tests, and load testing.

```
       +---------------------------------------------+
       |             LOAD TESTING (k6)               |  Test peak limits (500+ RPS)
       +----------------------+----------------------+
                              |
                              v
       +---------------------------------------------+
       |           UI / E2E TESTING (Patrol)         |  Automate screen flows on device
       +----------------------+----------------------+
                              |
                              v
       +---------------------------------------------+
       |         API INTEGRATION (Supertest)         |  Test database and endpoints
       +----------------------+----------------------+
                              |
                              v
       +---------------------------------------------+
       |          UNIT TESTING (Jest/Dart)           |  Validate services, models, BLoCs
       +---------------------------------------------+
```

| Type | Focus | Tools Used | Coverage Target |
| :--- | :--- | :--- | :--- |
| **Unit Testing** | Individual classes, services, controllers, BLoCs, and Dart entities. | NestJS: Jest/Vitest <br> Flutter: `flutter_test` | 80%+ code coverage |
| **Integration Testing** | Database transactions, repository queries, and Redis queue job handling. | NestJS: Supertest with Prisma test database. | 70%+ endpoint coverage |
| **End-to-End UI Testing** | Multi-screen navigation, form validations, dark/light theme shifts. | Flutter: `integration_test` & Patrol | Core user journeys |
| **Performance Testing** | Web page loading speeds, API response under load, queue throttling. | Lighthouse, K6, Artillery | response < 250ms under load |

---

## 2. Unit Testing Structure

### 2.1 Backend Unit Test (Jest)
Mocking Prisma repositories to test the isolation of customer business logic:
```typescript
describe('CustomersService', () => {
  let service: CustomersService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = { customer: { create: vi.fn() } };
    service = new CustomersService(prismaMock);
  });

  it('should prevent creating customer without E.164 phone format', async () => {
    await expect(
      service.create({ mobileNumber: '12345', fullName: 'John' }, 'business-uuid')
    ).rejects.toThrow();
  });
});
```

### 2.2 Frontend Unit Test (Flutter BLoC Test)
Using `bloc_test` to verify state emissions:
```dart
blocTest<CustomerBloc, CustomerState>(
  'emits [CustomerLoading, CustomerLoaded] when FetchCustomers event is added',
  build: () => CustomerBloc(getCustomersUseCase: mockUseCase),
  act: (bloc) => bloc.add(FetchCustomersEvent()),
  expect: () => [
    CustomerLoadingState(),
    CustomerLoadedState(customers: mockCustomerList),
  ],
);
```

---

## 3. API & End-to-End Integration Testing
*   **Database Isolation:** Integration tests run against an ephemeral PostgreSQL database container launched inside Docker before tests start and torn down after.
*   **Mocking Gateways:** Third-party integrations (WhatsApp API, Stripe payment gateway, SMTP servers) are stubbed using Mock Servers or Wiremock to verify response handling for successes and failures.

---

## 4. End-to-End UI Testing
*   **Golden Tests:** Flutter uses Golden Tests to capture pixel-perfect screenshots of screens across multiple device layouts (iPhone 14, Android Pixel 7, and Desktop Web), verifying styling does not break when updating dependencies.
*   **Form Automations:** Scripts simulate typing, button clicks, and drag-and-drop actions on the Kanban pipeline to verify state updates.

---

## 5. Performance & Load Testing (k6 Script)
Before release, API endpoints are stress tested using **K6** simulating heavy workloads:
*   **Target Load Scenario:** 10,000 concurrent users performing active reads/writes over a 10-minute interval.
*   **Success Criteria:**
    *   Zero failed HTTP requests (99.9% success rate).
    *   P95 response latency below 350ms.
    *   No memory leaks on Fargate container instances.
