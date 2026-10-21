# FixNear Architecture & System Design Specification

## 1. System Overview
FixNear is a full-stack on-demand home services marketplace designed for the Indian market (currency: INR ₹, timezone: Asia/Kolkata). It facilitates seamless booking between homeowners/tenants ("Customers") and skilled tradespeople ("Providers" or "Pros"), managed through an "Administrator" portal.

```mermaid
flowchart TD
    subgraph Client ["Frontend (React + Vite + TypeScript + Tailwind)"]
        UI_Cust[Customer Portal]
        UI_Prov[Provider Portal]
        UI_Admin[Admin Dashboard]
        UI_AI[AI Booking Assistant]
    end

    subgraph API_Gateway ["REST API (Node.js + Express + TypeScript)"]
        Auth_Mid[Auth & Role Verification]
        Router_Serv[Services & Categories API]
        Router_Book[Booking Engine & Slot Lock]
        Router_Pay[Razorpay Payment & Webhooks]
        Router_AI[Gemini AI Problem Classifier]
        Router_Notif[Notification & Alert Engine]
    end

    subgraph Data_Storage ["Database & Cloud Storage (Supabase)"]
        DB[(PostgreSQL with RLS)]
        Storage[(Supabase Storage: Docs & Photos)]
        Realtime[Supabase Realtime Bus]
    end

    subgraph External_Services ["External Services"]
        Razorpay[Razorpay Payment Gateway]
        Gemini[Google Gemini API]
        Maps[OpenStreetMap / Leaflet Engine]
    end

    UI_Cust -->|REST /api/v1| Auth_Mid
    UI_Prov -->|REST /api/v1| Auth_Mid
    UI_Admin -->|REST /api/v1| Auth_Mid

    Auth_Mid --> Router_Serv
    Auth_Mid --> Router_Book
    Auth_Mid --> Router_Pay
    Auth_Mid --> Router_AI
    Auth_Mid --> Router_Notif

    Router_Book --> DB
    Router_Serv --> DB
    Router_Pay --> DB
    Router_Pay <--> Razorpay
    Router_AI <--> Gemini
    Router_Book --> Storage
    Router_Book --> Realtime
    UI_Cust <--> Maps
```

---

## 2. Booking State Machine & Transaction Lifecycle

Every booking follows a strictly validated server-side state transition machine:

```mermaid
stateDiagram-v2
    [*] --> pending: Customer creates booking
    pending --> confirmed: Payment authorized / Provider slot reserved
    confirmed --> provider_assigned: Provider accepts job
    provider_assigned --> provider_en_route: Provider marks "On the way"
    provider_en_route --> in_progress: Provider arrives & starts work
    in_progress --> completed: Job finished & final invoice settled
    completed --> [*]

    pending --> cancelled: Customer cancels / Expired
    confirmed --> cancellation_requested: Customer requests cancel
    cancellation_requested --> cancelled: Approved by Admin/Policy
    provider_assigned --> cancelled: Provider declines / Reassigned
    in_progress --> disputed: Issue raised by Customer or Pro
    disputed --> completed: Resolved by Admin
    disputed --> cancelled: Resolved with refund
```

---

## 3. Database Schema Entity Relationship

1. **`profiles`**: User metadata, role (`customer`, `provider`, `admin`), phone, full name.
2. **`customer_addresses`**: Saved locations with coordinates (`lat`, `lng`), city, pincode.
3. **`provider_profiles`**: Pro skills, rating, verification status, service radius, commission rate.
4. **`provider_documents`**: Verification artifacts (Aadhaar, Govt ID, trade certificates).
5. **`service_categories`**: Electrician, Plumber, Carpenter, AC Service, Cleaning, Painting, etc.
6. **`services`**: Specific services with base price (INR), estimated duration, description.
7. **`provider_services`**: Many-to-many link between providers and specific services offered.
8. **`provider_availability`**: Daily recurring or scheduled working windows.
9. **`bookings`**: Central ledger with reference number, dates, status, pricing summary.
10. **`booking_status_history`**: Audit trail of all transitions with timestamps and actors.
11. **`booking_attachments`**: Customer photos of problem, completion photos.
12. **`booking_price_breakdowns`**: Itemized invoice (base, addons, taxes, platform fee, discount).
13. **`payments`**: Razorpay order ID, payment ID, signature, status, verification flag.
14. **`refunds`**: Detailed refund records linked to payment and cancellation.
15. **`provider_earnings`**: Net earnings per job after platform commission deduction.
16. **`provider_payouts`**: Payout tracking and bank settlement status.
17. **`reviews`**: 1 to 5 star ratings and written reviews from customers.
18. **`notifications`**: Persistent in-app notifications with unread states.
19. **`support_tickets`**: Customer and provider support tickets with priority and resolution.
20. **`admin_audit_logs`**: Tamper-evident admin action logging.
