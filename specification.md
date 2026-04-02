# EXBanka Frontend — Project Specification

_Last updated: 2026-04-02 (added securities/portfolio/orders: types, fixtures, API, hooks, components, pages, routing)_

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Routes](#4-routes)
5. [Pages](#5-pages)
6. [Components](#6-components)
7. [State Management](#7-state-management)
8. [API Layer](#8-api-layer)
9. [Custom Hooks](#9-custom-hooks)
10. [Types & Interfaces](#10-types--interfaces)
11. [Validation Schemas](#11-validation-schemas)
12. [Test Coverage](#12-test-coverage)

---

## 1. Project Overview

**EXBanka** is a banking platform frontend. It provides role-based access for two roles:

- **Admin (`EmployeeAdmin`)** — full management: list, create, edit employees and clients, manage accounts, loans, and payments
- **User (`EmployeeBasic`)** — view own profile only

The app communicates with a backend API at `http://localhost:8080` via REST.

All users (employees and clients) authenticate via a single `/login` route. The JWT `system_type` field (`"employee"` | `"client"`) determines the portal they are redirected to after login: employees are sent to `/admin/accounts`, clients are sent to `/home`.

---

## 2. Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | React | 19 |
| Language | TypeScript | ~5.9 |
| Build | Vite | ^7.3 |
| UI | Shadcn UI + Tailwind CSS | ^4 |
| Server state | TanStack Query (React Query) | v5 |
| Global state | Redux Toolkit | ^2.11 |
| Routing | React Router | v7 |
| HTTP client | Axios | ^1.13 |
| Form handling | React Hook Form + Zod | ^7 / ^4 |
| Testing | Jest + React Testing Library | ^30 / ^16 |
| Linting | ESLint + Prettier | ^9 / ^3 |
| Git hooks | Husky + lint-staged | ^9 / ^16 |

---

## 3. Project Structure

```
src/
├── __tests__/
│   ├── fixtures/
│   │   ├── auth-fixtures.ts          # Mock auth data factories
│   │   ├── employee-fixtures.ts      # Mock employee data factories
│   │   ├── security-fixtures.ts      # createMockStock, createMockFutures, createMockForex
│   │   ├── order-fixtures.ts         # createMockOrder
│   │   └── portfolio-fixtures.ts     # createMockHolding
│   ├── mocks/
│   │   └── select-mock.tsx           # Shadcn Select mock for tests
│   └── utils/
│       ├── test-utils.tsx            # renderWithProviders(), createQueryWrapper()
│       ├── setupTests.ts             # Jest global setup
│       └── fileMock.ts               # Asset import stub
│
├── components/
│   ├── ui/                           # Shadcn UI primitives (do not modify)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── pagination.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   ├── table.tsx
│   │   └── tabs.tsx
│   ├── auth/
│   │   ├── AuthFormCard.tsx          # Shared card wrapper for all auth forms
│   │   ├── AuthFormCard.test.tsx
│   │   ├── LoginForm.tsx             # Email/password login form
│   │   ├── LoginForm.test.tsx
│   │   ├── PasswordResetRequestForm.tsx  # Email input to request reset
│   │   ├── PasswordResetRequestForm.test.tsx
│   │   ├── PasswordResetForm.tsx     # Token + new password form
│   │   ├── PasswordResetForm.test.tsx
│   │   ├── ActivationForm.tsx        # Token + initial password form
│   │   └── ActivationForm.test.tsx
│   ├── employees/
│   │   ├── EmployeeForm.tsx          # Thin wrapper: delegates to Create or Edit form
│   │   ├── EmployeeForm.test.tsx
│   │   ├── EmployeeCreateForm.tsx    # Create employee form (~131 lines)
│   │   ├── EmployeeEditForm.tsx      # Edit/view employee form (~143 lines)
│   │   ├── PhoneInput.tsx            # Country code + phone number input
│   │   ├── PhoneInput.test.tsx
│   │   ├── EmployeeProfileTab.tsx    # "Me" tab: current user's read-only profile
│   │   ├── EmployeeProfileTab.test.tsx
│   │   ├── EmployeeTable.tsx         # Employee list table
│   │   ├── EmployeeTable.test.tsx
│   │   ├── EmployeeFilters.tsx       # Category + text filter bar
│   │   ├── EmployeeFilters.test.tsx
│   │   ├── EmployeeStatusBadge.tsx   # Active/Inactive badge
│   │   ├── EmployeeStatusBadge.test.tsx
│   │   └── employeeConstants.ts     # Re-export shim (imports from lib/utils/constants)
│   ├── layout/
│   │   ├── AppLayout.tsx             # Sidebar + main content wrapper
│   │   ├── AuthLayout.tsx            # Full-screen GIF background + centered Outlet
│   │   └── Sidebar.tsx               # Nav links, user email, logout
│   │   └── Sidebar.test.tsx
│   ├── cards/
│   │   ├── CardVisual.tsx + .test.tsx    # Credit-card-shaped visual: gradient, chip, brand logo, status overlay
│   │   ├── CardBrandLogo.tsx + .test.tsx # SVG brand logos: Visa, Mastercard, DinaCard, Amex
│   │   ├── CardItem.tsx + .test.tsx      # User-facing card tile using CardVisual
│   │   ├── CardGrid.tsx + .test.tsx      # Responsive grid of CardItem components
│   │   ├── CardRequestForm.tsx + .test.tsx  # Account selector for card request
│   │   ├── AuthorizedPersonForm.tsx + .test.tsx  # Authorized person form (all fields incl. date_of_birth, gender)
│   │   └── VerificationCodeInput.tsx + .test.tsx  # SMS/OTP code input for card confirmation
│   ├── payments/
│   │   ├── NewPaymentForm.tsx + .test.tsx       # Payment form; "Payment Purpose" label; uses SavedRecipientSelect (~146 lines)
│   │   ├── SavedRecipientSelect.tsx              # Extracted select for saved recipients (onSelect: string => void)
│   │   ├── PaymentConfirmation.tsx + .test.tsx  # Confirmation step; props: {formData, currency, onConfirm, onBack, submitting, error}
│   │   ├── PaymentHistoryTable.tsx + .test.tsx  # Payment history table; PDF button uses e.stopPropagation()
│   │   ├── RecipientForm.tsx + .test.tsx        # Props: {onSubmit, onCancel?, submitting, isEditing?, defaultValues?}; button label: "Save"/"Add"
│   │   ├── RecipientList.tsx                    # Table of recipients with Edit/Delete buttons
│   │   └── AddRecipientPrompt.tsx               # Prompt to save new recipient after payment success
│   ├── transfers/
│   │   ├── CreateTransferForm.tsx + .test.tsx   # Transfer form; same-currency transfers allowed
│   │   ├── TransferPreview.tsx                  # Confirmation/preview step for transfers
│   │   └── TransferHistoryTable.tsx + .test.tsx # Transfer history; columns: Date, From, To, Amount, Final, Rate, Commission
│   ├── verification/
│   │   └── VerificationStep.tsx + .test.tsx     # OTP/SMS verification step (used by payments and transfers)
│   ├── admin/
│   │   ├── AdminCardItem.tsx + .test.tsx  # Admin card tile using CardVisual + block/unblock/deactivate buttons
│   │   ├── AccountTable.tsx + .test.tsx   # Admin account list table
│   │   ├── ClientTable.tsx + .test.tsx    # Admin client list table
│   │   ├── EditClientForm.tsx + .test.tsx # Admin edit client form
│   ├── securities/
│   │   ├── SecuritiesTable.tsx + .test.tsx   # Stock listing table with Buy button per row
│   │   └── BuyOrderDialog.tsx + .test.tsx    # Buy order form: qty, limit/stop, account, options
│   ├── portfolio/
│   │   ├── HoldingsTable.tsx + .test.tsx     # Holdings table with Sell button per row
│   │   └── SellOrderDialog.tsx + .test.tsx   # Sell order form: qty, limit/stop, account, options
│   ├── orders/
│   │   ├── OrderStatusBadge.tsx + .test.tsx  # Colored badge: pending/approved/declined
│   │   └── OrdersTable.tsx + .test.tsx       # Orders table; optional Approve/Decline actions
│   └── shared/
│       ├── ProtectedRoute.tsx        # Auth + permission guard
│       ├── ProtectedRoute.test.tsx
│       ├── FormField.tsx             # Reusable label + input + error wrapper
│       ├── PaginationControls.tsx    # Previous/Next + "Page X of Y" controls
│       ├── ErrorMessage.tsx          # Styled error paragraph
│       └── LoadingSpinner.tsx        # Animated spinner (data-testid="loading-spinner")
│
├── pages/
│   ├── LoginPage.tsx + .test.tsx
│   ├── PasswordResetRequestPage.tsx + .test.tsx
│   ├── PasswordResetPage.tsx + .test.tsx
│   ├── ActivationPage.tsx + .test.tsx
│   ├── EmployeeListPage.tsx + .test.tsx
│   ├── CreateEmployeePage.tsx + .test.tsx
│   ├── EditEmployeePage.tsx + .test.tsx
│   ├── HomePage.tsx + .test.tsx
│   ├── AccountListPage.tsx + .test.tsx
│   ├── AccountDetailsPage.tsx + .test.tsx
│   ├── AdminAccountsPage.tsx + .test.tsx
│   ├── AdminAccountCardsPage.tsx + .test.tsx
│   ├── AdminClientsPage.tsx + .test.tsx
│   ├── AdminLoanRequestsPage.tsx + .test.tsx
│   ├── AdminLoansPage.tsx + .test.tsx
│   ├── CardListPage.tsx + .test.tsx
│   ├── CardRequestPage.tsx + .test.tsx
│   ├── CreateAccountPage.tsx + .test.tsx
│   ├── CreateClientPage.tsx + .test.tsx
│   ├── CreateTransferPage.tsx + .test.tsx
│   ├── EditClientPage.tsx + .test.tsx
│   ├── ExchangeCalculatorPage.tsx + .test.tsx
│   ├── ExchangeRatesPage.tsx + .test.tsx
│   ├── InternalTransferPage.tsx + .test.tsx
│   ├── LoanApplicationPage.tsx + .test.tsx
│   ├── LoanDetailsPage.tsx + .test.tsx
│   ├── LoanListPage.tsx + .test.tsx
│   ├── NewPaymentPage.tsx + .test.tsx
│   ├── PaymentHistoryPage.tsx + .test.tsx
│   ├── PaymentRecipientsPage.tsx + .test.tsx
│   ├── TransferHistoryPage.tsx + .test.tsx
│   ├── SecuritiesPage.tsx + .test.tsx        # Stock listing + BuyOrderDialog; accessible to all auth users
│   ├── PortfolioPage.tsx + .test.tsx         # Holdings + SellOrderDialog + P&L summary; all auth users
│   └── AdminOrdersPage.tsx + .test.tsx       # All orders with Approve/Decline; requires orders.approve
│
├── store/
│   ├── index.ts                      # Redux store configuration
│   ├── slices/
│   │   ├── authSlice.ts              # Auth domain: login, logout, token refresh
│   │   └── authSlice.test.ts
│   └── selectors/
│       ├── authSelectors.ts          # Memoized reselect selectors
│       └── authSelectors.test.ts
│
├── hooks/
│   ├── useAppDispatch.ts             # Typed Redux dispatch
│   ├── useAppSelector.ts             # Typed Redux selector
│   ├── useEmployees.ts + .test.ts    # React Query: fetch employees with server-side filters
│   ├── useEmployee.ts + .test.ts     # React Query: fetch single employee
│   ├── useMutationWithRedirect.ts + .test.ts  # Mutation + invalidate + navigate
│   └── usePagination.ts + .test.ts   # Client-side pagination over an array
│
├── lib/
│   ├── api/
│   │   ├── axios.ts                  # Axios instance + interceptors (token refresh)
│   │   ├── auth.ts + .test.ts        # Auth API calls
│   │   ├── employees.ts + .test.ts   # Employee CRUD API calls
│   │   ├── accounts.ts               # Account API calls (+ getBankAccounts)
│   │   ├── cards.ts                  # Card API calls
│   │   ├── clients.ts                # Client CRUD API calls
│   │   ├── exchange.ts + .test.ts    # Exchange rates API calls
│   │   ├── loans.ts                  # Loan API calls
│   │   ├── payments.ts               # Payment API calls
│   │   ├── transfers.ts              # Transfer API calls
│   │   ├── verification.ts           # Verification API calls
│   │   ├── roles.ts + .test.ts       # Roles & permissions API calls
│   │   ├── interestRateTiers.ts + .test.ts  # Interest rate tiers API calls
│   │   ├── bankMargins.ts + .test.ts # Bank margins API calls
│   │   ├── securities.ts             # getStocks, getStock, getFutures, getFuture, getForex, getForexPair
│   │   ├── orders.ts                 # createOrder, getMyOrders, cancelOrder, getAllOrders, approveOrder, declineOrder
│   │   └── portfolio.ts              # getPortfolio, getPortfolioSummary
│   └── utils/
│       ├── constants.ts              # EMPLOYEE_ROLES, GENDERS, COUNTRY_CODES, formatRoleLabel
│       ├── banking.ts                # CARD_BRANDS, CARD_STATUSES, CARD_STATUS_LABELS, CARD_STATUS_VARIANT, CARD_LIMITS
│       ├── format.ts + .test.ts      # maskCardNumber (spaced format), formatAccountNumber, formatCurrency
│       ├── dateFormatter.ts + .test.ts  # todayISO, formatDateDisplay, formatDateLocale
│       ├── jwt.ts + .test.ts         # JWT decode utility
│       ├── trading.ts + .test.ts     # inferOrderType, calculateApproxPrice
│       └── validation.ts + .test.ts  # Zod schemas
│
├── types/
│   ├── auth.ts                       # Auth-related TypeScript interfaces
│   ├── employee.ts                   # Employee-related TypeScript interfaces
│   ├── account.ts                    # Account-related TypeScript interfaces
│   ├── authorized-person.ts          # Authorized person interfaces
│   ├── card.ts                       # CardStatus ('ACTIVE'|'BLOCKED'|'DEACTIVATED'), CardType, CardBrand ('VISA'|'MASTERCARD'|'DINACARD'|'AMEX'), Card interface
│   ├── client.ts                     # Client-related TypeScript interfaces
│   ├── exchange.ts                   # Exchange rate interfaces
│   ├── filters.ts                    # Shared filter interfaces
│   ├── loan.ts                       # Loan-related TypeScript interfaces
│   ├── payment.ts                    # Payment-related TypeScript interfaces
│   ├── transfer.ts                   # Transfer-related TypeScript interfaces
│   ├── verification.ts               # Verification interfaces
│   ├── roles.ts                      # Role, Permission, CreateRolePayload interfaces
│   ├── interestRateTiers.ts          # InterestRateTier, CreateTierPayload interfaces
│   ├── bankMargins.ts                # BankMargin interface
│   ├── security.ts                   # SecurityType, Stock, Futures, Forex, list response types, SecurityFilters
│   ├── order.ts                      # OrderType, OrderDirection, OrderStatus, Order, CreateOrderRequest, OrderFilters
│   └── portfolio.ts                  # HoldingType, Holding, PortfolioListResponse, PortfolioSummary
│
├── contexts/                         # Reserved for theme/locale (currently empty)
├── assets/
│   └── people-walking.gif            # Auth page background
├── assets.d.ts                       # GIF/image type declaration
├── App.tsx                           # Route definitions
└── main.tsx                          # React DOM entry + providers
```

---

## 4. Routes

### Public Routes (AuthLayout)

| Route | Page | Notes |
|---|---|---|
| `/login` | LoginPage | Unified login for employees and clients; redirects based on `userType` from Redux state |
| `/password-reset-request` | PasswordResetRequestPage | Sends reset email |
| `/password-reset?token=...` | PasswordResetPage | Completes reset with URL token |
| `/activate?token=...` | ActivationPage | Sets initial password for new accounts |

### Protected Routes — Employee Portal (AppLayout + ProtectedRoute)

| Route | Page | Required Permission |
|---|---|---|
| `/employees` | EmployeeListPage | `employees.read` |
| `/employees/new` | CreateEmployeePage | `employees.create` |
| `/employees/:id` | EditEmployeePage | `employees.update` |
| `/admin/accounts` | AdminAccountsPage | admin |
| `/admin/accounts/:id/cards` | AdminAccountCardsPage | admin |
| `/admin/clients` | AdminClientsPage | admin |
| `/admin/clients/new` | CreateClientPage | admin |
| `/admin/clients/:id` | EditClientPage | admin |
| `/admin/loan-requests` | AdminLoanRequestsPage | admin |
| `/admin/loans` | AdminLoansPage | admin |
| `/admin/exchange-rates` | ExchangeRatesPage | admin |
| `/admin/orders` | AdminOrdersPage | `orders.approve` |

### Protected Routes — All Authenticated Users (AppLayout + ProtectedRoute)

| Route | Page | Notes |
|---|---|---|
| `/securities` | SecuritiesPage | Stock listing; clients use personal accounts, employees use bank accounts |
| `/portfolio` | PortfolioPage | Personal holdings; clients use personal accounts, employees use bank accounts |

### Protected Routes — Client Portal (AppLayout + ProtectedRoute)

| Route | Page | Notes |
|---|---|---|
| `/home` | HomePage | Client dashboard |
| `/accounts` | AccountListPage | Client account list |
| `/accounts/:id` | AccountDetailsPage | Account details |
| `/cards` | CardListPage | Client card list |
| `/cards/request` | CardRequestPage | Request a new card |
| `/create-account` | CreateAccountPage | Open a new account |
| `/transfer` | CreateTransferPage | Initiate a transfer |
| `/internal-transfer` | InternalTransferPage | Internal transfer between own accounts |
| `/payment-history` | PaymentHistoryPage | Payment history |
| `/payment-recipients` | PaymentRecipientsPage | Manage payment recipients |
| `/new-payment` | NewPaymentPage | Create a new payment |
| `/loans` | LoanListPage | Client loan list |
| `/loans/:id` | LoanDetailsPage | Loan details |
| `/loan-application` | LoanApplicationPage | Apply for a loan |
| `/exchange-calculator` | ExchangeCalculatorPage | Currency exchange calculator |
| `/transfer-history` | TransferHistoryPage | Transfer history |

**Catch-all:** `*` redirects to `/login`.

---

## 5. Pages

### LoginPage
- Renders `LoginForm`. Background GIF is provided by `AuthLayout`.
- Handles unified login for both employees and clients via a single `/login` route.
- After successful login, reads `userType` from Redux state (derived from JWT `system_type` field): redirects employees to `/admin/accounts`, clients to `/home`.

### PasswordResetRequestPage
- Renders `PasswordResetRequestForm`.
- On success, shows a confirmation message.

### PasswordResetPage
- Reads `?token` from URL query params and passes it to `PasswordResetForm`.
- On success, shows a confirmation message.

### ActivationPage
- Reads `?token` from URL query params and passes it to `ActivationForm`.
- On success, shows a confirmation message.

### EmployeeListPage
- Two tabs: **Employees** and **Me**.
- **Employees tab:**
  - Fetches employees via `useEmployees(apiFilters)` with **server-side filtering and pagination**.
  - Filter state (`category` + `value`) and `page` are kept in local React state.
  - `apiFilters` is built from state: `{ page, page_size: 20, [category]: value }`.
  - Changing filter resets page to 1.
  - `totalPages` derived from `data.total_count / PAGE_SIZE`.
  - Renders `EmployeeFilters` + `EmployeeTable` + `PaginationControls`.
- **Me tab:**
  - Rendered by `EmployeeProfileTab` — fetches and displays the current user's read-only profile.

### CreateEmployeePage
- Admin-only (requires `employees.create`).
- Renders `EmployeeForm` in create mode.
- On success, invalidates `['employees']` query and navigates to `/employees`.

### EditEmployeePage
- Fetches employee by `:id` via `useEmployee(id)`.
- Renders `EmployeeForm` in edit mode.
- If the employee is an admin (`EmployeeAdmin` role), form is read-only.
- On success, invalidates `['employees']` query and navigates to `/employees`.

### SecuritiesPage
- Accessible to all authenticated users (no `requiredRole`).
- Fetches stocks via `useStocks()`, trading accounts via `useTradingAccounts()`.
- Renders `SecuritiesTable`; clicking **Buy** opens `BuyOrderDialog` for the selected stock.
- On order submit: calls `createOrder()`, closes dialog on success.

### PortfolioPage
- Accessible to all authenticated users.
- Fetches holdings via `usePortfolio()`, summary via `usePortfolioSummary()`, accounts via `useTradingAccounts()`.
- Displays total value and P&L summary above the `HoldingsTable`.
- Clicking **Sell** opens `SellOrderDialog` for the selected holding.

### AdminOrdersPage
- Requires `orders.approve` permission (employees only).
- Fetches all orders via `useAllOrders()`.
- Renders `OrdersTable` with `onApprove` and `onDecline` callbacks.
- Approve/Decline buttons call `approveOrder(id)` / `declineOrder(id)`.

---

## 6. Components

### Auth Components

**AuthFormCard** (`components/auth/AuthFormCard.tsx`)
- Shared card wrapper used by all four auth forms.
- Renders a `Card` with `border-t-4 border-t-primary`.
- Props: `title`, `children`, `error?`, `isSuccess?`, `successContent?`
- When `isSuccess=true`: renders `successContent` instead of the form.

**LoginForm** (`components/auth/LoginForm.tsx`, ~82 lines)
- Fields: email, password
- Validation: `loginSchema` (Zod)
- Dispatches `loginThunk`; shows error message on failure
- Link to `/password-reset-request`

**PasswordResetRequestForm** (~76 lines)
- Field: email
- On submit: calls `requestPasswordReset(email)` API
- On success: replaces form with confirmation message + back-to-login link

**PasswordResetForm** (~87 lines)
- Fields: new_password, confirm_password
- Validation: `passwordResetSchema` (8+ chars, 2+ digits, 1+ uppercase, 1+ lowercase, must match)
- On submit: calls `resetPassword({token, new_password, confirm_password})`
- On success: confirmation message

**ActivationForm** (~82 lines)
- Fields: password, confirm_password
- Validation: `activationSchema`
- On submit: calls `activateAccount({token, password, confirm_password})`
- On success: confirmation message

---

### Employee Components

**EmployeeForm** (~24 lines) — thin wrapper
- Delegates to `EmployeeCreateForm` (when no `employee` prop) or `EmployeeEditForm` (when `employee` prop present).

**EmployeeCreateForm** (~131 lines)
- All fields, date of birth required, converts DOB string to Unix timestamp on submit.
- Imports constants from `lib/utils/constants`, date helpers from `lib/utils/dateFormatter`.

**EmployeeEditForm** (~143 lines)
- Read-only fields: first_name, email, username, date_of_birth.
- Editable: last_name, gender, phone (via `PhoneInput`), address, position, department, role, active, jmbg.
- Shows admin warning banner when `readOnly=true`.

**PhoneInput** (`components/employees/PhoneInput.tsx`)
- Country code dropdown (30+ countries from `lib/utils/constants`) + phone number text input.

**EmployeeProfileTab** (`components/employees/EmployeeProfileTab.tsx`)
- "Me" tab content: fetches current user's employee record via `useEmployee(currentUser.id)`.
- Displays a read-only `EmployeeForm` with loading/error states.

**EmployeeTable** (~47 lines)
- Renders a Shadcn `Table` with columns: Name, Email, Position, Phone, Status.
- Each row is clickable → calls `onRowClick(id)`.
- Status column uses `EmployeeStatusBadge`.

**EmployeeFilters** (~85 lines)
- Category dropdown: **Name**, Email, Position (aligned with API `EmployeeFilters` fields).
- Text search input with clear (X) button.
- Calls `onFilterChange({category, value})` or `onFilterChange(null)` to clear.

**EmployeeStatusBadge** (~13 lines)
- `active: true` → green "Active" badge
- `active: false` → gray "Inactive" badge

---

### Layout Components

**AppLayout** (~14 lines) — `Sidebar` on the left, `<Outlet />` on the right

**AuthLayout** (~14 lines) — full-screen background GIF wrapper with centered `<Outlet />`; all auth pages render inside this layout without duplicating the background.

**Sidebar** (~41 lines)
- Logo: "EXBanka"
- Nav link: Employees → `/employees`
- Displays current user's email
- Logout button → dispatches `logoutThunk` → redirects to `/login`
- **Trading section** (both client and employee nav): Securities → `/securities`, My Portfolio → `/portfolio`
- **Employee nav only**: Order Review → `/admin/orders` (shown only if `hasOrdersApprove`)

---

### Securities Components

**SecuritiesTable** (`components/securities/SecuritiesTable.tsx`)
- Columns: Ticker, Name, Exchange, Ask, Bid, Price, Volume, + Buy button per row.
- Props: `securities: Stock[]`, `onBuy: (s: Stock) => void`
- Empty state: "No securities available."

**BuyOrderDialog** (`components/securities/BuyOrderDialog.tsx`)
- Props: `open`, `onOpenChange`, `security: Stock`, `accounts: Account[]`, `onSubmit: (CreateOrderRequest) => void`, `loading`
- Fields: Quantity (number), Limit Price (optional), Stop Price (optional), Account (select), All or None (checkbox), Margin (checkbox), After Hours (checkbox)
- Derives `order_type` via `inferOrderType(limitValue, stopValue)`
- Displays approx price = `calculateApproxPrice(orderType, 'buy', ask, bid, contract_size, qty, ...)`
- Submit disabled when `quantity <= 0` or no account selected

---

### Portfolio Components

**HoldingsTable** (`components/portfolio/HoldingsTable.tsx`)
- Columns: Ticker, Name, Type, Quantity, Purchase Price, Current Price, + Sell button per row.
- Props: `holdings: Holding[]`, `onSell: (h: Holding) => void`
- Empty state: "No holdings found."

**SellOrderDialog** (`components/portfolio/SellOrderDialog.tsx`)
- Props: `open`, `onOpenChange`, `holding: Holding`, `accounts: Account[]`, `onSubmit: (CreateOrderRequest) => void`, `loading`
- Fields: Quantity (capped by `holding.quantity`), Limit Price, Stop Price, Account, All or None, Margin
- Submit disabled when `quantity <= 0 || quantity > holding.quantity`

---

### Orders Components

**OrderStatusBadge** (`components/orders/OrderStatusBadge.tsx`)
- Props: `status: OrderStatus`
- `pending` → yellow badge, `approved` → green badge, `declined` → red badge

**OrdersTable** (`components/orders/OrdersTable.tsx`)
- Columns: Ticker, Direction, Type, Quantity, Status (OrderStatusBadge), User
- Optional `onApprove: (id) => void` and `onDecline: (id) => void` — when both present, shows Approve/Decline buttons per row
- Empty state: "No orders found."

---

### Shared Components

**ProtectedRoute** (~28 lines)
- Reads `isAuthenticated` from Redux
- Optionally checks a `permission` prop via `selectHasPermission`
- Unauthenticated → redirect to `/login`
- Missing permission → redirect to `/`

**FormField** (`components/shared/FormField.tsx`)
- Reusable wrapper: `Label` + children + optional error message (`text-destructive`).
- Props: `label`, `id`, `error?`, `children`.

**PaginationControls** (`components/shared/PaginationControls.tsx`)
- Renders Previous / Next buttons and "Page X of Y" text.
- Renders nothing when `totalPages <= 1`.

**ErrorMessage** (~7 lines) — styled `<p>` with destructive text color

**LoadingSpinner** (~8 lines) — animated border-spinning div; has `data-testid="loading-spinner"`

---

## 7. State Management

### Redux Store (`store/index.ts`)

Single reducer: `auth` from `authSlice`.

### authSlice (`store/slices/authSlice.ts`)

**State shape:**
```typescript
interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  userType: 'employee' | 'client' | null
  status: 'idle' | 'loading' | 'authenticated' | 'error'
  error: string | null
}
```

**Async thunks:**

| Thunk | Action | Side Effects |
|---|---|---|
| `loginThunk(LoginRequest)` | Calls `authApi.login()`, decodes JWT, derives `userType` from JWT `system_type` field, sets user + tokens | Saves tokens to `sessionStorage` |
| `logoutThunk()` | Calls `authApi.logout(refreshToken)` | Clears `sessionStorage`, resets state |

**Sync reducers:**

| Reducer | Purpose |
|---|---|
| `setTokens(AuthTokens)` | Hydrates state from stored tokens (used on app init); also sets `userType` from JWT `system_type` |
| `clearAuth()` | Resets state to initial |

**Auth Selectors (`store/selectors/authSelectors.ts`) — memoized with reselect:**

| Selector | Returns |
|---|---|
| `selectIsAuthenticated` | `status === 'authenticated'` |
| `selectIsAdmin` | `user.role === 'EmployeeAdmin'` |
| `selectCurrentUser` | `AuthUser \| null` |
| `selectHasPermission(state, perm)` | `boolean` — checks `user.permissions[]` |

---

## 8. API Layer

### Axios Client (`lib/api/axios.ts`)

- Base URL: `http://localhost:8080`
- **Request interceptor:** attaches `Authorization: Bearer <access_token>` from `sessionStorage`
- **Response interceptor:** on 401, attempts token refresh via `/api/auth/refresh`, retries original request. If refresh fails, clears session and redirects to `/login`.

### Auth API (`lib/api/auth.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `login(credentials)` | POST | `/api/auth/login` |
| `logout(refreshToken)` | POST | `/api/auth/logout` |
| `requestPasswordReset(email)` | POST | `/api/auth/password/reset-request` |
| `resetPassword(payload)` | POST | `/api/auth/password/reset` |
| `activateAccount(payload)` | POST | `/api/auth/activate` |

### Employee API (`lib/api/employees.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getEmployees(filters?)` | GET | `/api/employees` — supports `name`, `email`, `position`, `page`, `page_size` query params |
| `getEmployee(id)` | GET | `/api/employees/{id}` |
| `createEmployee(payload)` | POST | `/api/employees` |
| `updateEmployee(id, payload)` | PUT | `/api/employees/{id}` |

### Roles API (`lib/api/roles.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getRoles()` | GET | `/api/roles` |
| `getRole(id)` | GET | `/api/roles/{id}` |
| `createRole(payload)` | POST | `/api/roles` |
| `updateRolePermissions(id, permissionCodes)` | PUT | `/api/roles/{id}/permissions` |
| `getPermissions()` | GET | `/api/permissions` |
| `setEmployeeRoles(employeeId, roleNames)` | PUT | `/api/employees/{id}/roles` |
| `setEmployeePermissions(employeeId, permissionCodes)` | PUT | `/api/employees/{id}/permissions` |

### Interest Rate Tiers API (`lib/api/interestRateTiers.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getInterestRateTiers()` | GET | `/api/interest-rate-tiers` |
| `createTier(payload)` | POST | `/api/interest-rate-tiers` |
| `updateTier(id, payload)` | PUT | `/api/interest-rate-tiers/{id}` |
| `deleteTier(id)` | DELETE | `/api/interest-rate-tiers/{id}` |
| `applyTier(id)` | POST | `/api/interest-rate-tiers/{id}/apply` |

### Bank Margins API (`lib/api/bankMargins.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getBankMargins()` | GET | `/api/bank-margins` |
| `updateBankMargin(id, margin)` | PUT | `/api/bank-margins/{id}` |

### Accounts API — additions (`lib/api/accounts.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getBankAccounts()` | GET | `/api/bank-accounts` |

### Securities API (`lib/api/securities.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getStocks(filters?)` | GET | `/api/securities/stocks` |
| `getStock(id)` | GET | `/api/securities/stocks/{id}` |
| `getFutures(filters?)` | GET | `/api/securities/futures` |
| `getFuture(id)` | GET | `/api/securities/futures/{id}` |
| `getForex(filters?)` | GET | `/api/securities/forex` |
| `getForexPair(id)` | GET | `/api/securities/forex/{id}` |

### Orders API (`lib/api/orders.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `createOrder(payload)` | POST | `/api/me/orders` |
| `getMyOrders(filters?)` | GET | `/api/me/orders` |
| `cancelOrder(id)` | POST | `/api/me/orders/{id}/cancel` |
| `getAllOrders(filters?)` | GET | `/api/orders` |
| `approveOrder(id)` | POST | `/api/orders/{id}/approve` |
| `declineOrder(id)` | POST | `/api/orders/{id}/decline` |

### Portfolio API (`lib/api/portfolio.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getPortfolio(securityType?, page?, pageSize?)` | GET | `/api/me/portfolio` |
| `getPortfolioSummary()` | GET | `/api/me/portfolio/summary` |

---

## 9. Custom Hooks

| Hook | Type | Purpose |
|---|---|---|
| `useAppDispatch` | Redux | Typed `AppDispatch` hook |
| `useAppSelector` | Redux | Typed `RootState` selector hook |
| `useEmployees(filters?)` | React Query | Fetch employees with server-side filters; query key: `['employees', filters]` |
| `useEmployee(id)` | React Query | Fetch single employee; query key: `['employee', id]`; disabled when `id <= 0` |
| `useMutationWithRedirect(options)` | React Query | `useMutation` + query invalidation + `navigate` on success |
| `usePagination(items, pageSize)` | Local state | Slice an array into pages; returns `{ page, setPage, totalPages, paginatedItems }` |
| `useStocks(filters?)` | React Query | Fetch stock listings; query key: `['securities', 'stocks', filters]` |
| `useFutures(filters?)` | React Query | Fetch futures listings; query key: `['securities', 'futures', filters]` |
| `useForex(filters?)` | React Query | Fetch forex pairs; query key: `['securities', 'forex', filters]` |
| `useMyOrders(filters?)` | React Query | Fetch current user's orders; query key: `['my-orders', filters]` |
| `useCreateOrder()` | React Query | POST new order; invalidates `['my-orders']` and `['portfolio']` on success |
| `useCancelOrder()` | React Query | Cancel own order; invalidates `['my-orders']` |
| `useAllOrders(filters?)` | React Query | Fetch all orders (admin); query key: `['all-orders', filters]` |
| `useApproveOrder()` | React Query | Approve an order; invalidates `['all-orders']` |
| `useDeclineOrder()` | React Query | Decline an order; invalidates `['all-orders']` |
| `usePortfolio(securityType?, page?)` | React Query | Fetch user holdings; query key: `['portfolio', securityType, page]` |
| `usePortfolioSummary()` | React Query | Fetch portfolio summary; query key: `['portfolio', 'summary']` |
| `useTradingAccounts()` | React Query | Returns client accounts for clients, bank accounts for employees |

---

## 10. Types & Interfaces

### Auth Types (`types/auth.ts`)

```typescript
LoginRequest         { email: string; password: string }
AuthTokens           { access_token: string; refresh_token: string }
PasswordResetPayload { token: string; new_password: string; confirm_password: string }
AccountActivationPayload { token: string; password: string; confirm_password: string }
AuthUser             { id: number; email: string; role: string; permissions: string[];
                       system_type: 'employee' | 'client' | null }
```

### Employee Types (`types/employee.ts`)

```typescript
Employee {
  id: number; first_name: string; last_name: string
  date_of_birth: number          // Unix timestamp
  gender: string; email: string; phone: string; address: string
  username: string; position: string; department: string
  active: boolean; role: string; permissions: string[]; jmbg?: string
}

CreateEmployeeRequest { first_name, last_name, date_of_birth (required), gender?, email,
                        phone?, address?, username, position?, department?, role, active?, jmbg? }

UpdateEmployeeRequest { last_name?, gender?, phone?, address?, position?,
                        department?, role?, active?, jmbg? }

EmployeeListResponse  { employees: Employee[]; total_count: number }
EmployeeFilters       { email?, name?, position?, page?, page_size? }
FilterCategory        = 'name' | 'email' | 'position'
```

### Role & Permission Types (`types/roles.ts`)

```typescript
Permission           { id: number; code: string; description: string; category: string }
Role                 { id: number; name: string; description: string; permissions: string[] }
CreateRolePayload    { name: string; description?: string; permission_codes?: string[] }
```

### Interest Rate Tier Types (`types/interestRateTiers.ts`)

```typescript
InterestRateTier     { id: number; amount_from: number; amount_to: number;
                       fixed_rate: number; variable_base: number }
CreateTierPayload    { amount_from: number; amount_to: number;
                       fixed_rate: number; variable_base: number }
```

### Bank Margin Types (`types/bankMargins.ts`)

```typescript
BankMargin           { id: number; loan_type: string; margin: number;
                       active: boolean; created_at: string; updated_at: string }
```

### Security Types (`types/security.ts`)

```typescript
SecurityType = 'stock' | 'futures' | 'forex' | 'option'
Stock        { id, ticker, name, exchange_acronym, ask, bid, price, volume, contract_size, maintenance_margin?, change?, change_percent? }
Futures      { id, ticker, name, exchange_acronym, ask, bid, price, volume, contract_size, maintenance_margin?, settlement_date? }
Forex        { id, base_currency, quote_currency, exchange_rate, ask, bid, liquidity? }
StockListResponse    { stocks: Stock[]; total_count: number }
FuturesListResponse  { futures: Futures[]; total_count: number }
ForexListResponse    { forex_pairs: Forex[]; total_count: number }
SecurityFilters      { page?, page_size?, search?, exchange_acronym?, min_price?, max_price? }
```

### Order Types (`types/order.ts`)

```typescript
OrderType      = 'market' | 'limit' | 'stop' | 'stop_limit'
OrderDirection = 'buy' | 'sell'
OrderStatus    = 'pending' | 'approved' | 'declined'
Order          { id, user_email?, listing_id?, holding_id?, asset_ticker?, asset_name?,
                 order_type, direction, quantity, contract_size, price_per_unit?,
                 limit_value?, stop_value?, all_or_none, margin, status,
                 approved_by?, is_done, remaining_portions, after_hours, last_modification, account_id? }
CreateOrderRequest { listing_id?, holding_id?, direction, order_type, quantity,
                     limit_value?, stop_value?, all_or_none?, margin?, account_id? }
OrderFilters   { page?, page_size?, status?, direction? }
```

### Portfolio Types (`types/portfolio.ts`)

```typescript
HoldingType    = 'stock' | 'futures' | 'option'
Holding        { id, listing_id, ticker, name, security_type, quantity,
                 purchase_price, current_price, bid, contract_size, maintenance_margin? }
PortfolioListResponse  { holdings: Holding[]; total_count: number }
PortfolioSummary       { total_value: string; total_profit_loss: string }
```

### Trading Utilities (`lib/utils/trading.ts`)

```typescript
inferOrderType(limitValue?, stopValue?): OrderType
// Returns 'stop_limit' if both set, 'stop' if stop only, 'limit' if limit only, 'market' otherwise

calculateApproxPrice(orderType, direction, ask, bid, contractSize, qty, limitValue?, stopValue?): number
// pricePerUnit: limit/stop_limit → limitValue, stop → stopValue, market → ask (buy) or bid (sell)
// returns contractSize * pricePerUnit * quantity
```

### Shared Constants (`lib/utils/constants.ts`)

```typescript
EMPLOYEE_ROLES   // array of { value, label } — roles selectable in forms
GENDERS          // flat string array — ['Male', 'Female', 'Other', 'Misha']
COUNTRY_CODES    // array of { code, label } — 30+ countries for PhoneInput
formatRoleLabel(role: string): string
```

### Banking Constants (`lib/constants/banking.ts`)

```typescript
CARD_BRANDS          // [{ value: 'VISA'|'MASTERCARD'|'DINACARD'|'AMEX', label }]
CARD_STATUSES        // [{ value: 'ACTIVE'|'BLOCKED'|'DEACTIVATED', label }]
CARD_STATUS_LABELS   // Record<string, string> — display label per status
CARD_STATUS_VARIANT  // Record<string, 'default'|'secondary'|'destructive'> — badge variant per status
CARD_LIMITS          // { PERSONAL: 2, BUSINESS_PER_PERSON: 1 }
```

### Format Utilities (`lib/utils/format.ts`)

```typescript
maskCardNumber(cardNumber: string): string  // '4111111111111111' → '4111 **** **** 1111'
formatAccountNumber(accountNumber: string): string  // 18-digit → 'XXX-XXXXXXXXXX-XX'
formatCurrency(amount: number, currency: string): string
```

### Date Utilities (`lib/utils/dateFormatter.ts`)

```typescript
todayISO(): string                     // "YYYY-MM-DD" of today
formatDateDisplay(ts: number): string  // Unix timestamp → "dd/mm/yyyy"
formatDateLocale(ts: number): string   // Unix timestamp → locale string, "—" if falsy
```

---

## 11. Validation Schemas

All defined in `lib/utils/validation.ts` using Zod.

| Schema | Used In | Key Rules |
|---|---|---|
| `passwordSchema` | Shared | 8–32 chars, 2+ digits, 1+ uppercase, 1+ lowercase |
| `emailSchema` | Shared | Valid email format |
| `loginSchema` | LoginForm | `{email, password}` |
| `passwordResetSchema` | PasswordResetForm | `{token, new_password, confirm_password}` — passwords must match |
| `activationSchema` | ActivationForm | `{token, password, confirm_password}` — passwords must match |
| `createEmployeeSchema` | EmployeeCreateForm | All required fields + JMBG 13-digit regex |
| `updateEmployeeSchema` | EmployeeEditForm | All optional; JMBG `/^\d{13}$/` if provided |
| `authorizedPersonSchema` | AuthorizedPersonForm | first_name, last_name, date_of_birth (required), gender (optional), email, phone, address |

---

## 12. Test Coverage

_Measured: 2026-04-02 — 121 test suites, 537 tests (all passing)._

### Overall Coverage

| Metric | Coverage |
|---|---|
| **Statements** | **75.48%** |
| **Branches** | **59.50%** |
| **Functions** | **54.65%** |
| **Lines** | **77.54%** |

> Testing covers approximately **~67% of the project** (average across all four metrics). The lower coverage reflects newly added API modules (`securities.ts`, `orders.ts`, `portfolio.ts`) which have no unit tests, reducing the overall average.

### Coverage by Module

| Module | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| `components/auth` | 100% | 75% | 100% | 100% |
| `components/employees` | ~93% | ~77% | ~79% | ~94% |
| `components/layout` | ~95% | 100% | ~67% | ~95% |
| `components/shared` | 100% | 100% | 100% | 100% |
| `hooks` | ~70% | ~40% | ~50% | ~72% |
| `lib/api` | 46.52% | 0% | 40.62% | 51.62% |
| `lib/api/auth.ts` | 100% | 100% | 100% | 100% |
| `lib/api/roles.ts` | 100% | 100% | 100% | 100% |
| `lib/api/interestRateTiers.ts` | 100% | 100% | 100% | 100% |
| `lib/api/bankMargins.ts` | 100% | 100% | 100% | 100% |
| `lib/api/exchange.ts` | 100% | 100% | 100% | 100% |
| `lib/utils` | 92.52% | 82.14% | 76.19% | 93.61% |
| `pages` | 79.77% | 58.33% | 46.78% | 82.07% |
| `pages/LoginPage.tsx` | 100% | 83.33% | 100% | 100% |
| `store` | 100% | 100% | 100% | 100% |
| `store/selectors` | 100% | 50% | 100% | 100% |
| `store/slices/authSlice.ts` | 97.82% | 50% | 100% | 97.82% |

### Notable Coverage Gaps

| File | Gap |
|---|---|
| `lib/api/axios.ts` | 20% statements — axios interceptors (token refresh flow) untested |
| `lib/api/accounts.ts` | 23.33% statements — most account API calls untested |
| `lib/api/loans.ts` | 19.04% statements — most loan API calls untested |
| `lib/api/payments.ts` | 21.21% statements — most payment API calls untested |
| `store/slices/authSlice.ts` | Branch 50% — error path in `logoutThunk` uncovered |
| `store/selectors/authSelectors.ts` | Branch 50% — null-user path in one selector |
| `hooks/usePayments.ts` | 31.03% statements — query hooks untested |
| `hooks/useRecipientAutofill.ts` | 30% statements — autofill hook untested |

### Test Infrastructure

- **`renderWithProviders(ui, options?)`** — wraps component with Redux store, QueryClient, MemoryRouter
- **`createQueryWrapper()`** — QueryClient provider factory for hook tests
- **`createMockAuthUser(overrides?)`** — generates mock `AuthUser` objects
- **`createMockAuthState(overrides?)`** — generates mock `AuthState` objects
- **`createMockEmployee(overrides?)`** — generates mock `Employee` objects
