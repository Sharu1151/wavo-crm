# Wireframes & Screen Layouts - Wavo CRM

This document describes the structure, grid alignments, design components, and responsive panels for Wavo CRM's core screens, taking design cues from **Linear** (sleek, high-density, command menus) and **Notion** (clean, spacious typography, card-based).

---

## 1. Global Navigation & Workspace Layout
A responsive master template split into a collapsible sidebar for larger views and a bottom navigation bar for mobile views.

```
+------------------------------------------------------------------------------------+
| BRAND LOGO [Wavo]  | Search (Ctrl + K)                    | Profile (Business) (v) |
+------------------------------------------------------------------------------------+
| (o) Dashboard       |                                                              |
| (•) Customers       |                    MAIN WORKSPACE WINDOW                     |
| (o) Leads (Kanban)  |                                                              |
| (o) Follow-Ups      |                    - Content renders dynamically             |
| (o) WA Helper       |                    - Adaptive columns                        |
| (o) Payments        |                    - Material 3 floating actions             |
| (o) AI Insights     |                                                              |
|                     |                                                              |
| [Settings] [Help]   |                                                              |
+------------------------------------------------------------------------------------+
```

*   **Responsive Adaptation:** On mobile screens, the sidebar retracts completely into a hamburger menu, and a bottom bar provides direct navigation links to `Dashboard`, `Leads`, `WhatsApp`, and `Notifications`.

---

## 2. Dashboard Interface (Metrics & Reporting)
The entry screen after user login. Displays key business indicators and performance graphs.

```
+------------------------------------------------------------------------------------+
| Dashboard                                                      [Date Range: 30D v] |
+------------------------------------------------------------------------------------+
|  +------------------+  +------------------+  +------------------+  +-------------+ |
|  | TOTAL CUSTOMERS  |  |   ACTIVE LEADS   |  | PENDING FOLLOWUP |  | MONTHLY REV | |
|  |      2,845       |  |       189        |  |        14        |  |  $8,240.00  | |
|  |  [+12% vs mth]   |  |   [34 in New]    |  |   [6 overdue!]   |  | [+8.5% MRR] | |
|  +------------------+  +------------------+  +------------------+  +-------------+ |
+------------------------------------------------------------------------------------+
|  +---------------------------------------+  +------------------------------------+ |
|  | REVENUE TRENDS (Line Chart)           |  | LEAD FUNNEL (Funnel Bar Chart)     | |
|  | $10K |       /\                       |  | New         ===================    | |
|  |  $8K |  /\  /  \                      |  | Contacted   =============          | |
|  |  $5K | /  \/    \                     |  | Interested  =========              | |
|  |   $0 +-----------\-------------->     |  | Proposal    ======                 | |
|  |     Jan  Feb  Mar  Apr                |  | Won         ===                    | |
|  +---------------------------------------+  +------------------------------------+ |
+------------------------------------------------------------------------------------+
```

---

## 3. Leads Kanban Board Screen
This board allows dragging leads horizontally across sales stages.

```
+------------------------------------------------------------------------------------+
| Leads Pipeline                                          [Assignee: All v] [+ Lead] |
+------------------------------------------------------------------------------------+
|  NEW (4)             |  CONTACTED (2)        |  INTERESTED (3)       | WON (1)     |
| +------------------+ | +-------------------+ | +-------------------+ | +---------+ |
| | John Doe         | | | Jane Smith        | | | ACME Corp         | | | TechCo  | |
| | Src: WA | Sc: 85 | | | Src: Web | Sc: 60 | | | Src: Ref | Sc: 92  | | | $4,500  | |
| | [Tag: Hot] (!!)  | | | [Tag: Follow-up]  | | | [Tag: VIP] (!!)   | | | [Win]   | |
| +------------------+ | +-------------------+ | +-------------------+ | +---------+ |
| | Bob Vance        | |                       | | Alpha Inc         | |             | |
| | Src: Form| Sc: 40 | |                       | | Src: WA | Sc: 78  | |             | |
| +------------------+ |                       | +-------------------+ |             | |
+------------------------------------------------------------------------------------+
```

*   **Lead Card Details:** Contains Lead Name, Source icon, AI Lead Score (`Sc: 85`), Tags, and due task indicators (`(!!)`).

---

## 4. Customer Detail Panel & Interaction Timeline
A three-column desktop view, scaling to single-scroll tabs on mobile.

```
+------------------------------------------------------------------------------------+
| [Back] Customer Profile: ACME Corp (Status: Active)                     [Edit Profile] |
+------------------------------------------------------------------------------------+
|  LEFT: CUSTOMER INFO   |  CENTER: CONVERSATION TIMELINE    |  RIGHT: REMINDERS & AI |
|                        |                                   |                        |
|  Name: ACME Corp       |  [Jun 09, 2026 - 15:30]           |  [AI Summary]          |
|  Email: info@acme.com  |  [Sent WA Template: Welcome]      |  "Client is seeking a  |
|  Phone: +14159990102   |  Status: DELIVERED                |  quote for 10 users.   |
|  Company: ACME Ltd     |                                   |  Probability: 85%."    |
|  Source: Inbound WA    |  [Jun 09, 2026 - 10:00]           |                        |
|                        |  [Log Task Complete]              |  [Next Follow-Up]      |
|  [Tags: VIP, B2B]      |  "Sent initial proposal document" |  Type: Call            |
|                        |  By: Sales Executive (Alex)       |  Due: Jun 10, 10:00 AM |
|  Notes:                |                                   |  Notes: Confirm price  |
|  "Prefers WA outreach" |  [Jun 08, 2026 - 18:22]           |                        |
|                        |  [Inbound WA Message]             |  [AI Suggested Reply]  |
|                        |  "Hey, send me pricing for plan B"|  "Sure, here is our    |
|                        |                                   |  pricing sheet..."     |
+------------------------------------------------------------------------------------+
```

---

## 5. WhatsApp Campaign Manager Layout
Design for scheduling automated broadcast template messages.

```
+------------------------------------------------------------------------------------+
| WhatsApp Helper > Campaigns                                          [+ Campaign]  |
+------------------------------------------------------------------------------------+
| Campaign Name: [ Independence Day Promo 2026                             ] |
|                                                                                    |
| Template Selection:                                                                |
| [ Welcome Template (Approved)                                                    v ] |
| Message Preview:                                                                   |
| +--------------------------------------------------------------------------------+ |
| | "Hi {{name}}! Welcome to {{business_name}}. Here is your discount code: {{code}}"| |
| +--------------------------------------------------------------------------------+ |
| Target Segment:                                                                    |
| [Tag: Retail-Client      x] [Tag: New-Inquiry         x] [+ Add Tag Filter]        |
|                                                                                    |
| Variable Mapping:                                                                  |
| - {{name}}          ---> Customer [Full Name]                                      |
| - {{business_name}} ---> Business [Name]                                          |
| - {{code}}          ---> Custom Value [ SAVE20 ]                                   |
|                                                                                    |
| Delivery Schedule:                                                                 |
| (•) Send Now    (o) Schedule for: [ 2026-07-04 ] [ 09:00 AM ]                      |
|                                                                                    |
| Target Count: 145 Recipients | Queue Limit: OK             [Launch Campaign]        |
+------------------------------------------------------------------------------------+
```
