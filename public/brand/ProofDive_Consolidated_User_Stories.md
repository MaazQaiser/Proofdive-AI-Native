# ProofDive — Consolidated User Stories

**Product:** ProofDive
**Document type:** Consolidated User Story Specification
**Version:** 2.1 (Consolidated)
**Date:** 3 August 2026
**Original author:** Atiya Abid, Principal Business Analyst

---

## About this document

This document consolidates the two source user story documents into a single specification:

| Source | Contents |
| --- | --- |
| `ProofDive - User Stories.md` | Base specification — all five personas, core epics |
| `ProofDive_Payments_Commission_SocialLogin_FAQ_UserStories.md` | Payments & bundles, partner commissions, social login, AI FAQ Assistant, candidate profile, plus a **CRs** section carrying updated flows |
| `proofdive-feature-readiness_3.html` | Feature readiness tracker — the current scope of record. Applied in v2.1 to correct supersessions, add newly landed stories, and refine story scope. |

Where the two sources described the same story, **the newer flow supersedes the original**.
Superseded content has been removed rather than duplicated. Every story is tagged:

| Tag | Meaning |
| --- | --- |
| `UPDATED` | Flow replaces an earlier version of the same story |
| `NEW` | Story did not exist in the base document |
| `RE-SCOPED` | Retained, but narrowed because part of its scope moved to a newer story |
| `CONFLICT` | Overlaps or contradicts another story — resolve before build |
| `OUTLINE ONLY` | Scope agreed, full specification still outstanding |
| *(untagged)* | Carried forward unchanged from the base document |

Epics and stories have been **renumbered sequentially within each persona** to remove gaps and
collisions present in the sources. Appendix A maps every new ID back to its origin.

---

## Personas

| # | System User | Persona | Context |
| :---: | --- | --- | --- |
| 1 | **Super Admin** | ProofDive Admin | Platform owner managing the entire ProofDive ecosystem. |
| 2 | **Tenant Admin** | Organization Admin | Universities, institutions and training organizations preparing candidates. |
| 3 | **Tenant Admin** | Partner / Affiliate | Partners and affiliates referring users and earning commission. |
| 4 | **Tenant Admin** | Employer | Hiring organizations creating AI interview links against JDs. |
| 5 | **Primary User** | Candidate (B2C & B2B) | Individuals preparing for interviews and career opportunities. |

**Design prototypes**

1. **Old UI** — Candidate & Admin: <https://proff-dive.vercel.app>
2. **New Experience** — Candidate only: <https://proofdive-ai-native.vercel.app>

---

## Revision & Review Log

| # | Author | Date | Description of change |
| :---: | --- | --- | --- |
| 1 | Atiya Abid | 21 April 2026 | Initial version |
| 2 | Tayyab | April 2026 | Technical review |
| 3 | Zubair Nawaz | April 2026 | AI team review |
| 4 | Wassi Rehman | April 2026 | Client review |
| 5 | — | July 2026 | Payments, commissions, social login & AI FAQ stories added |
| 6 | — | 31 July 2026 | **Consolidation** — both documents merged; CR flows applied as the source of truth |
| 7 | — | 3 August 2026 | **v2.1** — aligned to feature readiness tracker: billing stories re-scoped and restored, Upgrade Plan CTA Touchpoints added, Analytics Report & AI Coach registered, story scope and flags refined |

---

## What changed in this consolidation

| Persona | ID | Story | Change |
| --- | --- | --- | --- |
| Super Admin | 7.1 | Set Price — Global & Add-On Rate Configuration | `NEW` — Payments 1.1 |
| Super Admin | 7.2 | Bundle Listing — Payments Module Overview | `NEW` — Payments 1.2 |
| Super Admin | 7.3 | Create New Bundle — Bundle Configuration | `NEW` — Payments 1.3 |
| Super Admin | 7.4 | View & Edit Bundle — Bundle Detail & Configuration Management | `NEW` — Payments 1.4 |
| Super Admin | 7.5 | Deactivate / Reactivate Bundle | `NEW` — Payments 1.5 |
| Super Admin | 7.6 | Discount Code Listing | `NEW` — Payments 1.6 |
| Super Admin | 7.7 | Generate Discount Code | `NEW` — Payments 1.7 |
| Super Admin | 7.8 | View & Manage Discount Code — Detail & Status Management | `NEW` — Payments 1.8 |
| Super Admin | 8.1 | View Commissions & Payouts Listing | `NEW` — Commission 1.1 |
| Super Admin | 8.2 | View Commission Detail | `NEW` — Commission 1.2 |
| Org / Tenant Admin | 4.1 | Manage Subscription | `CONFLICT` — Payments 2.1 |
| Org / Tenant Admin | 4.2 | Billing — Payment Methods & Invoices | `RE-SCOPED` — Base 4.3 — re-scoped |
| Org / Tenant Admin | 4.3 | Purchase Add-Ons — Org-wide Usage Top-Up | `NEW` — Payments 2.2 |
| Partner / Affiliate | 3.1 | View Commissions & Payouts | `NEW` — Commission 3.1 |
| Partner / Affiliate | 3.2 | Withdraw Funds | `NEW` — Commission 3.2 |
| Employer | 4.3 | Manage Billing & Subscription | `CONFLICT` — Base 4.3 — outside bundle model |
| Candidate | 1.3 | Social Sign Up — Google & LinkedIn | `NEW` — Social Login 1.3 |
| Candidate | 1.4 | Social Sign In — Google & LinkedIn | `NEW` — Social Login 1.4 |
| Candidate | 2.1 | Guided Candidate Onboarding Journey | `UPDATED` — CR — supersedes Base 2.1 |
| Candidate | 2.2 | Add New Role for Existing User | `OUTLINE ONLY` — Base 2.2 |
| Candidate | 3.1 | Candidate Dashboard & Readiness Progress | `UPDATED` — CR — supersedes Base 3.1 |
| Candidate | 5.1 | Create New Storyboard | `UPDATED` — CR — supersedes Base 6.1 |
| Candidate | 5.2 | Enrich Storyboard / Add Competency | `UPDATED` — CR — supersedes Base 6.2 |
| Candidate | 5.3 | Competency-Based Storyboard View | `UPDATED` — CR — supersedes Base 6.3 |
| Candidate | 5.4 | Download Storyboards | `UPDATED` — CR — supersedes Base 6.4 |
| Candidate | 6.1 | Access FAQ Bot — Avatar, Chat Shell, Root Menu | `NEW` — FAQ 5.1 |
| Candidate | 6.2 | Storyboard Info | `NEW` — FAQ 5.2 |
| Candidate | 6.3 | Mock Interview Info | `NEW` — FAQ 5.3 |
| Candidate | 6.4 | What's Next in My Roadmap | `NEW` — FAQ 5.4 |
| Candidate | 6.5 | View Latest Report | `NEW` — FAQ 5.5 |
| Candidate | 6.6 | Prepare for Another Role | `NEW` — FAQ 5.6 |
| Candidate | 6.7 | Contact Support | `NEW` — FAQ 5.7 |
| Candidate | 6.8 | Usage & Billing | `NEW` — FAQ 5.8 |
| Candidate | 9.1 | Manage Subscription — Catalog, Subscribe, Switch, Cancel | `UPDATED` — Payments 3.1 |
| Candidate | 9.2 | Upgrade Plan CTA Touchpoints | `NEW` — Payments 3.2 — new in readiness tracker v3 |
| Candidate | 9.3 | Purchase Add-Ons | `NEW` — Payments 3.3 (was 3.2) |
| Candidate | 9.4 | Billing — Payment Methods & Invoices | `RE-SCOPED` — Base 8.3 — re-scoped |
| Candidate | 10.1 | View & Edit My Profile | `UPDATED` — Profile 4.1 — supersedes Base 8.1 stub |

In addition:

- The base document's **AI FAQ Assistant** and **Mock Interview** epics existed only as
  placeholders containing template text. AI FAQ Assistant is now fully specified; Mock
  Interview remains outstanding and is flagged as such.
- Two labelling errors in the base document were corrected: Super Admin 9.1 was titled
  *"View & Edit Existing Competency Listings"* but specified profile management, and
  Org Admin's first Profile story was numbered *3.1* inside Epic 4.
- Formatting was normalised throughout (bullet glyphs, blockquote artefacts and escape
  characters from the original exports were converted to standard Markdown).

---

## Contents

- [1. Super Admin](#1-super-admin)
  - [Epic 1: Dashboard Module](#epic-1-dashboard-module)
    - [1.1 — Dashboard & Analytics](#11--dashboard--analytics)
  - [Epic 2: Organization (Tenant) Management](#epic-2-organization-tenant-management)
    - [2.1 — View & Edit Organization Listings](#21--view--edit-organization-listings)
    - [2.2 — Add New Organization](#22--add-new-organization)
    - [2.3 — Deactivate / Reactivate Organization](#23--deactivate--reactivate-organization)
  - [Epic 3: Partner Management](#epic-3-partner-management)
    - [3.1 — View & Edit Partner Listings](#31--view--edit-partner-listings)
    - [3.2 — Add New Partner](#32--add-new-partner)
    - [3.3 — Deactivate / Reactivate Partner](#33--deactivate--reactivate-partner)
  - [Epic 4: Employer Management](#epic-4-employer-management)
    - [4.1 — View & Edit Employer Listings](#41--view--edit-employer-listings)
    - [4.2 — Add New Employer](#42--add-new-employer)
    - [4.3 — Deactivate / Reactivate Employer](#43--deactivate--reactivate-employer)
  - [Epic 5: Content & Masterclass Management](#epic-5-content--masterclass-management)
    - [5.1 — View & Edit Existing Course Listings](#51--view--edit-existing-course-listings)
    - [5.2 — Add New Course Listings](#52--add-new-course-listings)
    - [5.3 — Deactivate / Reactivate Course](#53--deactivate--reactivate-course)
  - [Epic 6: Competency Framework Management](#epic-6-competency-framework-management)
    - [6.1 — View & Edit Existing Competency Listings](#61--view--edit-existing-competency-listings)
    - [6.2 — Update Competency as a New Version](#62--update-competency-as-a-new-version)
    - [6.3 — Deactivate / Reactivate Competency](#63--deactivate--reactivate-competency)
  - [Epic 7: Payments & Bundle Management](#epic-7-payments--bundle-management)
    - [7.1 — Set Price — Global & Add-On Rate Configuration](#71--set-price--global--add-on-rate-configuration-new)
    - [7.2 — Bundle Listing — Payments Module Overview](#72--bundle-listing--payments-module-overview-new)
    - [7.3 — Create New Bundle — Bundle Configuration](#73--create-new-bundle--bundle-configuration-new)
    - [7.4 — View & Edit Bundle — Bundle Detail & Configuration Management](#74--view--edit-bundle--bundle-detail--configuration-management-new)
    - [7.5 — Deactivate / Reactivate Bundle](#75--deactivate--reactivate-bundle-new)
    - [7.6 — Discount Code Listing](#76--discount-code-listing-new)
    - [7.7 — Generate Discount Code](#77--generate-discount-code-new)
    - [7.8 — View & Manage Discount Code — Detail & Status Management](#78--view--manage-discount-code--detail--status-management-new)
  - [Epic 8: Commissions & Payout Management](#epic-8-commissions--payout-management)
    - [8.1 — View Commissions & Payouts Listing](#81--view-commissions--payouts-listing-new)
    - [8.2 — View Commission Detail](#82--view-commission-detail-new)
  - [Epic 9: Support Request Management](#epic-9-support-request-management)
    - [9.1 — Manage Support Requests](#91--manage-support-requests)
  - [Epic 10: Notification Management](#epic-10-notification-management)
    - [10.1 — Receive Notifications](#101--receive-notifications)
  - [Epic 11: Profile Management](#epic-11-profile-management)
    - [11.1 — View & Edit My Profile](#111--view--edit-my-profile)
    - [11.2 — Reset Password](#112--reset-password)
    - [11.3 — View Audit Logs](#113--view-audit-logs)
- [2. Org / Tenant Admin](#2-org--tenant-admin)
  - [Epic 1: Login Module](#epic-1-login-module)
    - [1.1 — Account Activation & Login with Email & Password](#11--account-activation--login-with-email--password)
    - [1.2 — Forgot Password](#12--forgot-password)
  - [Epic 2: Dashboard & Analytics](#epic-2-dashboard--analytics)
    - [2.1 — B2B Admin Dashboard & Analytics](#21--b2b-admin-dashboard--analytics)
  - [Epic 3: User Management](#epic-3-user-management)
    - [3.1 — View User / Candidate Listings](#31--view-user--candidate-listings)
    - [3.2 — Add New User / Candidate — CSV & Manual Invite](#32--add-new-user--candidate--csv--manual-invite)
  - [Epic 4: Payments & Subscription Management](#epic-4-payments--subscription-management)
    - [4.1 — Manage Subscription](#41--manage-subscription-conflict)
    - [4.2 — Billing — Payment Methods & Invoices](#42--billing--payment-methods--invoices-re-scoped)
    - [4.3 — Purchase Add-Ons — Org-wide Usage Top-Up](#43--purchase-add-ons--org-wide-usage-top-up-new)
  - [Epic 5: Profile & Account Management](#epic-5-profile--account-management)
    - [5.1 — View & Edit My Profile Details](#51--view--edit-my-profile-details)
    - [5.2 — Reset Password](#52--reset-password)
    - [5.3 — Revoke Consent / Delete Account](#53--revoke-consent--delete-account)
    - [5.4 — Contact Support](#54--contact-support)
    - [5.5 — View Audit Logs](#55--view-audit-logs)
  - [Epic 6: Notification Management](#epic-6-notification-management)
    - [6.1 — Receive Notifications](#61--receive-notifications)
    - [6.2 — Receive Terms & Policy Updates](#62--receive-terms--policy-updates)
- [3. Partner / Affiliate](#3-partner--affiliate)
  - [Epic 1: Login Module](#epic-1-login-module)
    - [1.1 — Account Activation & Login with Email & Password](#11--account-activation--login-with-email--password)
    - [1.2 — Forgot Password](#12--forgot-password)
  - [Epic 2: Dashboard & Analytics](#epic-2-dashboard--analytics)
    - [2.1 — Partner Dashboard & Analytics — Signups, Earnings, Referral Code, Conversion Funnel](#21--partner-dashboard--analytics--signups-earnings-referral-code-conversion-funnel)
  - [Epic 3: Commissions & Payout Management](#epic-3-commissions--payout-management)
    - [3.1 — View Commissions & Payouts](#31--view-commissions--payouts-new)
    - [3.2 — Withdraw Funds](#32--withdraw-funds-new)
  - [Epic 4: Profile & Account Management](#epic-4-profile--account-management)
    - [4.1 — View & Edit My Profile Details](#41--view--edit-my-profile-details)
    - [4.2 — Reset Password](#42--reset-password)
    - [4.3 — Manage Billing & Subscription](#43--manage-billing--subscription)
    - [4.4 — Revoke Consent / Delete Account](#44--revoke-consent--delete-account)
    - [4.5 — Contact Support](#45--contact-support)
    - [4.6 — View Audit Logs](#46--view-audit-logs)
  - [Epic 5: Notification Management](#epic-5-notification-management)
    - [5.1 — Receive Notifications](#51--receive-notifications)
    - [5.2 — Receive Terms & Policy Updates](#52--receive-terms--policy-updates)
- [4. Employer](#4-employer)
  - [Epic 1: Login Module](#epic-1-login-module)
    - [1.1 — Account Activation & Login with Email & Password](#11--account-activation--login-with-email--password)
    - [1.2 — Forgot Password](#12--forgot-password)
  - [Epic 2: Dashboard Module](#epic-2-dashboard-module)
    - [2.1 — Employer Dashboard & Analytics](#21--employer-dashboard--analytics)
  - [Epic 3: Interview & JD Management](#epic-3-interview--jd-management)
    - [3.1 — View JD Listings & Candidate Reports](#31--view-jd-listings--candidate-reports)
    - [3.2 — Add New JD / Generate Interview Link](#32--add-new-jd--generate-interview-link)
  - [Epic 4: Profile & Account Management](#epic-4-profile--account-management)
    - [4.1 — View & Edit Profile Details](#41--view--edit-profile-details)
    - [4.2 — Reset Password](#42--reset-password)
    - [4.3 — Manage Billing & Subscription](#43--manage-billing--subscription-conflict)
    - [4.4 — Revoke Consent / Delete Account](#44--revoke-consent--delete-account)
    - [4.5 — Contact Support](#45--contact-support)
    - [4.6 — View Audit Logs](#46--view-audit-logs)
  - [Epic 5: Notifications Module](#epic-5-notifications-module)
    - [5.1 — Receive Notifications](#51--receive-notifications)
    - [5.2 — Receive Terms & Policy Updates](#52--receive-terms--policy-updates)
- [5. Candidate](#5-candidate)
  - [Epic 1: Login Module](#epic-1-login-module)
    - [1.1 — Candidate Sign In](#11--candidate-sign-in)
    - [1.2 — Candidate Sign Up](#12--candidate-sign-up)
    - [1.3 — Social Sign Up — Google & LinkedIn](#13--social-sign-up--google--linkedin-new)
    - [1.4 — Social Sign In — Google & LinkedIn](#14--social-sign-in--google--linkedin-new)
    - [1.5 — Forgot Password](#15--forgot-password)
  - [Epic 2: Candidate Onboarding](#epic-2-candidate-onboarding)
    - [2.1 — Guided Candidate Onboarding Journey](#21--guided-candidate-onboarding-journey-updated)
    - [2.2 — Add New Role for Existing User](#22--add-new-role-for-existing-user-outline-only)
  - [Epic 3: Dashboard](#epic-3-dashboard)
    - [3.1 — Candidate Dashboard & Readiness Progress](#31--candidate-dashboard--readiness-progress-updated)
  - [Epic 4: MasterClass & Training Module](#epic-4-masterclass--training-module)
    - [4.1 — Complete Training Course](#41--complete-training-course)
  - [Epic 5: Storyboard Module](#epic-5-storyboard-module)
    - [5.1 — Create New Storyboard](#51--create-new-storyboard-updated)
    - [5.2 — Enrich Storyboard / Add Competency](#52--enrich-storyboard--add-competency-updated)
    - [5.3 — Competency-Based Storyboard View](#53--competency-based-storyboard-view-updated)
    - [5.4 — Download Storyboards](#54--download-storyboards-updated)
  - [Epic 6: AI FAQ Assistant](#epic-6-ai-faq-assistant)
    - [6.1 — Access FAQ Bot — Avatar, Chat Shell, Root Menu](#61--access-faq-bot--avatar-chat-shell-root-menu-new)
    - [6.2 — Storyboard Info](#62--storyboard-info-new)
    - [6.3 — Mock Interview Info](#63--mock-interview-info-new)
    - [6.4 — What's Next in My Roadmap](#64--whats-next-in-my-roadmap-new)
    - [6.5 — View Latest Report](#65--view-latest-report-new)
    - [6.6 — Prepare for Another Role](#66--prepare-for-another-role-new)
    - [6.7 — Contact Support](#67--contact-support-new)
    - [6.8 — Usage & Billing](#68--usage--billing-new)
  - [Epic 7: Mock Interview Module](#epic-7-mock-interview-module)
  - [Epic 8: Analytics Report & AI Coach](#epic-8-analytics-report--ai-coach)
  - [Epic 9: Payments & Subscription Management](#epic-9-payments--subscription-management)
    - [9.1 — Manage Subscription — Catalog, Subscribe, Switch, Cancel](#91--manage-subscription--catalog-subscribe-switch-cancel-updated)
    - [9.2 — Upgrade Plan CTA Touchpoints](#92--upgrade-plan-cta-touchpoints-new)
    - [9.3 — Purchase Add-Ons](#93--purchase-add-ons-new)
    - [9.4 — Billing — Payment Methods & Invoices](#94--billing--payment-methods--invoices-re-scoped)
  - [Epic 10: Profile & Account Management](#epic-10-profile--account-management)
    - [10.1 — View & Edit My Profile](#101--view--edit-my-profile-updated)
    - [10.2 — Reset Password](#102--reset-password)
    - [10.3 — Revoke Consent / Delete Account](#103--revoke-consent--delete-account)
    - [10.4 — Contact Support](#104--contact-support)
    - [10.5 — View Audit Logs](#105--view-audit-logs)
  - [Epic 11: Notifications Module](#epic-11-notifications-module)
    - [11.1 — Receive Notifications](#111--receive-notifications)
    - [11.2 — Receive Terms & Policy Updates](#112--receive-terms--policy-updates)

- [Appendix A — Traceability Matrix](#appendix-a--traceability-matrix)
- [Appendix B — Open Points](#appendix-b--open-points)

---

# 1. Super Admin

Platform owner responsible for managing the entire ProofDive ecosystem — tenant onboarding, subscription and billing, bundles and pricing, platform configuration, competency frameworks, content governance, partner commissions, audit logs, feature access, analytics, and overall operational control.

## Epic 1: Dashboard Module

### 1.1 — Dashboard & Analytics

#### Requirement Statement

> _As a Super Admin user, I want to view platform-wide business, adoption, engagement, and revenue analytics, so that I can monitor the overall health, growth, and performance of the ProofDive platform._

#### Story Details

- The Super Admin Dashboard should provide a high-level overview of platform growth, user engagement, product usage, and revenue performance through KPI cards and analytics visualizations.
- The details are as follows:
- **KPI Cards**
  - **Total Organizations Onboarded**
    - Displays the total number of organizations onboarded onto the platform.
    - Includes:
      - Universities
      - Training Centers
      - Employers
  - **Total Active Users**
    - Displays the total number of active users across the platform.
    - Calculation Logic: Users who have logged in and/or completed at least one platform activity within the selected period.
  - **Total Mock Interviews Conducted**
    - Displays the total number of completed mock interviews across the platform.
    - Calculation Logic: Count of completed mock interview sessions.
  - **Total Storyboards Generated**
    - Displays the total number of storyboard generation activities across the platform.
    - Calculation Logic: Count of generated storyboard submissions.
  - **Monthly Recurring Revenue (MRR)**
    - Displays the total recurring subscription revenue generated by the platform.
    - Calculation Logic:
      - Sum of active recurring subscription revenue across all paying organizations.
- **Analytics**
  - **Tenant Growth Analytics**
    - Displays onboarding trends across the platform.
    - Visualization: Line Chart
    - Metrics Included
      - Universities Onboarded
      - Training Centers Onboarded
      - Employers Onboarded
    - Axis Details
      - X-Axis: Time Period (Daily / Weekly / Monthly)
      - Y-Axis: Number of Organizations
  - **Active User Trend**
    - Displays platform engagement trends.
    - Visualization: Multi-Bar Chart
    - Metrics Included
      - Active Users
      - Inactive Users
    - Axis Details
      - X-Axis: Time Period (Daily / Weekly / Monthly)
      - Y-Axis: Number of Users
  - **Platform Usage Trends**
    - Displays usage trends for core platform activities.
    - Visualization: Multi-Bar Chart
    - Metrics Included
      - Mock Interviews Conducted
      - Storyboards Generated
    - Axis Details
      - X-Axis: Time Period (Daily / Weekly / Monthly)
      - Y-Axis: Usage Count
  - **Revenue Analytics**
    - Displays subscription revenue trends.
    - Visualization: Line Chart
    - Metrics Included
      - Monthly Recurring Revenue (MRR)
      - Revenue Growth Trend
    - Axis Details
      - X-Axis: Time Period (Daily / Weekly / Monthly)
      - Y-Axis: Revenue Amount
- **Filters**
  - The Super Admin should be able to filter dashboard analytics by:
  - Date Range

#### Acceptance Criteria

- Super Admin can access Dashboard & Analytics successfully.
- All KPI cards display correct platform-wide metrics.
- Analytics charts display correctly.
- Date Range filter updates all dashboard metrics and charts.
- Revenue metrics are calculated correctly.
- Platform usage metrics reflect actual platform activity.

#### Alternate Scenarios

- No platform activity exists for the selected period.
- No revenue data exists for the selected period.
- Analytics data fails to load temporarily.

#### Non-functional Requirements

- Dashboard should load within acceptable response time.
- Analytics calculations should support platform-wide aggregation.
- Charts should render dynamically without page refresh.
- Metrics should remain accurate and consistent.

#### Validation Rules / Errors

- “No analytics data available.”
- “No activity found for selected date range.”
- “Revenue data unavailable.”
- “Unable to load dashboard analytics at the moment.”


---

## Epic 2: Organization (Tenant) Management

### 2.1 — View & Edit Organization Listings

#### Requirement Statement

> _As a Super Admin user, I want to view and manage all onboarded organizations so that I can review organization details, update configurations, and maintain organization subscriptions and settings._

#### Story Details

The Super Admin should be able to access an Organization Management section containing a listing of all onboarded organizations.

- **Organization Listing Details**
  - Each organization listing should display:
    - Organization Name
    - Organization Type
      - University
      - Training Center
      - Employer
    - Country
    - Assigned Subscription Plan
    - Subscription Status
      - Active
      - Expired
      - Expiring Soon
    - Organization Status
      - Active
      - Inactive
- **Actions Available**
  - The Super Admin should be able to:
    - View Details
    - Edit Organization
    - Activate Organization
    - Deactivate Organization
- **Search & Filters**
  - The Super Admin should be able to:
    - **Search: Organization Name**
    - **Filter By:**
      - Organization Type
      - Country
      - Subscription Status
      - Organization Status
- **Organization Detail Page**
  - When the Super Admin opens an organization record, the detail page should display:
    - **Organization Details**
      - Organization Name
      - Organization Type
      - Industry / Domain
      - Country
      - City
      - Region
      - Domain Details
      - Organization Logo
    - **Point of Contact**
      - Primary Contact Name
      - Email Address
      - Phone Number
      - Designation
    - **Competency Configuration**
      - Assigned Competency Framework
    - **Course Configuration**
      - Assigned Courses
    - **Subscription Configuration**
      - Assigned Plan
      - Number of Users
      - Subscription Start Date
      - Subscription Expiry Date
      - Applied Discount
    - **User Summary**
      - Total Users
      - Active Users
      - Inactive Users
- **Edit Organization Details**
  - The Super Admin should be able to update:
    - **Organization Details**
      - Organization Name
      - Industry / Domain
      - Country
      - City
      - Region
      - Domain Details
      - Organization Logo
    - **Point of Contact**
      - Primary Contact Name
      - Email Address
      - Phone Number
      - Designation
    - **Competency Configuration**
      - Change the assigned competency framework
    - **Course Configuration**
      - Update assigned courses
    - **Subscription Configuration**
      - Change the assigned plan
      - Update the number of users
      - Update subscription start/end dates
      - Apply or remove discount
- **Organization Status Management**
  - The Super Admin should be able to:
    - Reactivate Organization
    - Deactivate Organization

#### Acceptance Criteria

- Super Admin can access Organization Management successfully.
- All onboarded organizations display correctly in the listing.
- Search and filters work correctly.
- Super Admin can open an organization detail page successfully.
- Organization details display correctly.
- Super Admin can update organization information successfully.
- Super Admin can modify competency, course, and subscription configurations.
- Changes are reflected immediately after save.

#### Alternate Scenarios

- No organizations exist.
- Search returns no matching organizations.
- Selected filters return no results.
- Organization update fails temporarily.
- Subscription configuration update fails.

#### Non-functional Requirements

- Organization listings should load within an acceptable response time.
- Search and filters should update dynamically.
- Changes should be reflected in near real-time.
- Organization status changes should be enforced immediately.
- All organization updates should be logged for audit purposes.

#### Validation Rules / Errors

- “No organizations found.”
- “No matching organizations found.”
- “Organization Name already exists.”
- “Subscription Expiry Date must be greater than Subscription Start Date.”
- “Unable to save organization changes.”
- “Unable to update organization status.”
- “Unable to load organization details.”


### 2.2 — Add New Organization

#### Requirement Statement

> _As a Super Admin user, I want to onboard a new organization onto the platform so that the organization can access ProofDive with its configured competencies, courses, subscription plan, and users._

#### Story Details

The Super Admin should be able to onboard an organization through a guided multi-step workflow.

- **Step 1: Organization Details**
  - The Super Admin should provide the following information:
    - **Core Details**
      - Organization Name
      - Organization Type
        - University
        - Training Center
        - Employer
      - Industry / Domain
      - Country
      - City
      - Region
    - **White Labelling**
      - Organization Logo
      - Domain Details
    - **Point of Contact**
      - Primary Contact Name
      - Email Address
      - Phone Number (with Country Code)
      - Designation
  - Upon completion, the Super Admin clicks **Next**.
- **Step 2: Competency Configuration**
  - The Super Admin should select a competency framework from a dropdown list.
  - **Supported Options**
    - ProofDive Default Competency Framework (selected by default)
    - Previously Saved Custom Competency Frameworks
    - The Super Admin should also be able to click **"+"** to create a new competency version.
      - **Custom Competency Creation**
        - The system should:
          - Display the ProofDive default competency framework
          - Allow editing of all configured competency pillars
          - Require a unique competency version name
        - Upon saving:
          - The new competency version is added to the Competency dropdown
          - The new competency version is added to Competency Management
          - Duplicate competency version names should not be allowed
        - The Super Admin then selects the desired competency version and clicks **Next**.
- **Step 3: Course Configuration**
  - The system should display all available courses.
  - For MVP:
    - Course 1 (Selected by default)
    - Course 2 (Selected by default)
  - The Super Admin can review and click **Next**.
  - *Future versions may support:*
    - *Course-level selection*
    - *Module-level selection*
- **Step 4: Payment Plan Configuration**
  - The Super Admin should configure the organization's subscription.
  - **Subscription Details**
    - Pricing Plan Template
      - Selected from pre-configured plans available in Subscription Management
    - Discount (Optional)
    - Number of Users
    - Subscription Start Date
    - Subscription Expiry Date
  - **Subscription Renewal Notifications**
    - The organization should automatically receive:
      - Renewal reminder email 14 days before expiry
      - Renewal reminder email 7 days before expiry
    - Organizations will be instructed to contact ProofDive for renewal.
  - The Super Admin clicks **Next**.
- **Step 5: User Onboarding (Optional)**
  - The Super Admin may optionally upload organization users.
  - **Bulk User Upload**
    - Upload a CSV file containing user email addresses
    - The system should:
      - Create user records
      - Associate users with the organization
  - Invitation emails should only be triggered once:
    - Organization onboarding is completed
    - Organization Admin activates/logs into the platform
  - This step may be skipped.
  - The Super Admin clicks **Next**.
- **Step 6: Review & Send Invite**
  - The Super Admin should be able to review:
    - Organization Details
    - Competency Configuration
    - Course Configuration
    - Subscription Configuration
    - User Upload Summary
  - Upon clicking **Send Invite**:
  - The system should:
    - Create the organization
    - Create the Organization Admin account
    - Send onboarding invitation email to the Organization Admin
  - The invitation link should:
    - Auto-fill email address
    - Allow password setup
    - Follow the configured invitation expiry period (48 hours)
  - After login:
    - Organization Admin gains access to the platform and dashboard

#### Acceptance Criteria

- Super Admin can complete all onboarding steps successfully.
- Organization details are saved correctly.
- A competency framework can be selected successfully.
- Custom competency versions can be created and saved.
- Duplicate competency version names are not allowed.
- The subscription plan can be assigned successfully.
- User CSV upload can be processed successfully.
- The review screen displays all configured information.
- Organization Admin invitation is sent successfully.
- Organization and related configuration become active after onboarding.

#### Alternate Scenarios

- A duplicate organization name exists.
- A duplicate competency version name exists.
- Invalid CSV uploaded.
- Subscription configuration incomplete.
- Invitation email delivery fails.
- Organization creation fails during onboarding.

#### Non-functional Requirements

- The organization onboarding workflow should support step-by-step progress saving.
- CSV uploads should support scalable processing.
- Competency version creation should be reusable across organizations.
- Organization setup should be completed within acceptable response times.
- Invitation emails should be securely generated and delivered.

#### Validation Rules / Errors

- “Organization Name already exists.”
- “Competency version name already exists.”
- “Please upload a valid CSV file.”
- “Subscription Start Date is required.”
- “Subscription Expiry Date is required.”
- “Expiry Date must be greater than Start Date.”
- “Unable to create organization at the moment.”
- “Unable to send invitation email.”


### 2.3 — Deactivate / Reactivate Organization

#### Requirement Statement

> _As a Super Admin user, I want to activate or deactivate organizations so that I can control organization access to the platform while preserving their data and configurations._

#### Story Details

- The Super Admin should be able to activate or deactivate an organization from the Organization Management module.
- The action should be available from:
  - Organization Listing
  - Organization Detail Page
- **Deactivate Organization**
  - When the Super Admin deactivates an organization:
    - Organization Status changes to Inactive
    - Organization Admin can no longer log into the platform
    - All associated users under the organization can no longer access the platform
    - Existing data, reports, configurations, subscriptions, and audit history remain preserved
    - No new invitations can be accepted while the organization remains inactive
    - The system should display a confirmation prompt before deactivation.
- **Reactivate Organization**
  - When the Super Admin reactivates an organization:
    - Organization Status changes to Active
    - Organization Admin regains platform access
    - Associated users regain platform access
    - Existing configurations and subscriptions remain intact
    - The system should display a confirmation prompt before activation.

#### Acceptance Criteria

- Super Admin can deactivate an active organization successfully.
- Super Admin can reactivate an inactive organization successfully.
- Organization status updates correctly.
- User access is revoked immediately upon deactivation.
- User access is restored upon reactivation.
- Organization data remains preserved after deactivation.
- Status changes are recorded in audit logs.

#### Alternate Scenarios

- The organization is already active.
- The organization is already inactive.
- Status update fails temporarily.
- User access update fails temporarily.

#### Non-functional Requirements

- Status changes should take effect immediately.
- Organization data should remain intact during deactivation.
- Access control changes should be securely enforced.
- Status changes should be logged for audit purposes.

#### Validation Rules / Errors

- “Are you sure you want to deactivate this organization?”
- “Are you sure you want to activate this organization?”
- “Organization is already active.”
- “Organization is already inactive.”
- “Unable to update organization status at the moment.”
- “Organization status updated successfully.”


---

## Epic 3: Partner Management

### 3.1 — View & Edit Partner Listings

#### Requirement Statement

> _As a Super Admin user, I want to view and manage all onboarded Partners so that I can review partner information, update configurations, and manage referral partnerships effectively._

#### Story Details

- The Super Admin should be able to access a Partner Management section containing a listing of all onboarded Partners.
- **Partner Listing Details**
  - Each Partner listing should display:
    - Full Name
    - Email Address
    - Partner Type
      - University / Institution
      - Coach / Trainer
      - Influencer / Content Creator
      - Recruiter / Employer Partner
  - Referral Code
  - Commission Type
    - Percentage-Based
    - Fixed
    - Tiered
  - Partner Status
    - Active
    - Inactive
- **Actions Available**
  - The Super Admin should be able to:
    - View Details
    - Edit Partner
    - Activate Partner
    - Deactivate Partner
- **Search & Filters**
- The Super Admin should be able to:
  - Search
    - Full Name
    - Email Address
    - Referral Code
  - Filter By
    - Partner Type
    - Commission Type
    - Partner Status
- **Partner Detail Page**
  - When the Super Admin opens a Partner record, the detail page should display:
    - Basic Details
    - Full Name
    - Email Address
    - Phone Number
    - Country / Region
    - Entity Details
    - Entity Type
      - Individual
      - Company
        - Company Name (if applicable)
        - Website
    - Audience Type
      - Students
      - Professionals
      - Mixed
  - Partner Configuration
  - Expected User Volume
  - Referral Code
  - Commission Configuration
    - Assigned Commission Type
      - Percentage-Based
      - Fixed
      - Tiered
  - Partner Performance Summary
    - Total Referrals
    - Total Signups
    - Total Conversions
    - Total Earnings
- **Edit Partner Details**
  - The Super Admin should be able to update:
  - Basic Details
  - Full Name
  - Email Address
  - Phone Number
  - Country / Region
  - Entity Details
  - Company Name
  - Website
  - Audience Type
  - Partner Configuration
  - Partner Type
  - Expected User Volume
  - Commission Configuration
  - Commission Type
  - Associated Commission Settings

#### Acceptance Criteria

- Super Admin can access Partner Management successfully.
- All Partners display correctly in the listing.
- Search and filters work correctly.
- Super Admin can open the Partner detail page successfully.
- Partner details display correctly.
- Super Admin can update Partner information successfully.
- Partner performance summary displays correctly.
- Changes are reflected immediately after save.

#### Alternate Scenarios

- No Partners exist.
- Search returns no matching Partners.
- Selected filters return no results.
- Partner update fails temporarily.

#### Non-functional Requirements

- Partner listings should load within an acceptable response time.
- Search and filters should update dynamically.
- Changes should be reflected in near real-time.
- All Partner updates should be logged for audit purposes.

#### Validation Rules / Errors

- “No partners found.”
- “No matching partners found.”
- “Email address already exists.”
- “Referral code already exists.”
- “Unable to save partner changes.”
- “Unable to load partner details.”


### 3.2 — Add New Partner

#### Requirement Statement

> _As a Super Admin user, I want to onboard a new Partner/Affiliate into the platform, so that they can receive a referral code, access the platform, and start referring users to ProofDive._

#### Story Details

The Super Admin should be able to onboard a Partner through a guided multi-step workflow.

- **Step 1: Basic Details**
  - The Super Admin should provide:
    - Full Name
    - Email Address
    - Phone Number
    - Country / Region
  - The Partner will set their own password upon accepting the invitation.
- **Step 2: Entity Details**
  - The Super Admin should configure:
    - Entity Type
      - Individual
      - Company
        - If Company is selected:
          - Company Name
          - Website (Optional)
    - Audience Type
      - Students
      - Professionals
      - Mixed
- **Step 3: Partner Type Selection**
  - The Super Admin should select one of the following:
    - University / Institution
    - Coach / Trainer
    - Influencer / Content Creator
    - Recruiter / Employer Partner
- **Step 4: Expected User Volume**
  - The Super Admin should specify the expected user volume associated with the partner.
- **Step 5: Commission Structure**
  - The Super Admin should configure the commission model.
  - Supported Types:
    - Percentage-Based (%)
    - Fixed
    - Tiered
  - The selected commission structure will be associated with the partner account.
- **Step 6: Review Details**
  - The Super Admin should review all entered information.
  - Upon confirmation, the Super Admin clicks:
    - Generate Referral Code & Send Invite
- **Referral Code & Invitation**
  - Upon successful completion:
    - The system should:
      - Create the Partner account
      - Generate a unique referral code
      - Add the Partner to the Partner Management listing
      - Send an invitation email to the Partner
  - The invitation email should:
    - Redirect the Partner to the platform
    - Auto-fill the Partner's email address
    - Allow password setup
    - Require acceptance of Terms & Conditions and Privacy Policy
    - Follow the configured invitation expiry period (48 hours)
  - Upon first login:
    - The Partner gains access to their dashboard
    - The generated referral code is displayed within the dashboard

#### Acceptance Criteria

- Super Admin can complete all onboarding steps successfully.
- The partner account is created successfully.
- A unique referral code is generated successfully.
- Partner is added to the Partner Management listing.
- The invitation email was sent successfully.
- The partner can access account setup through the invitation link.
- The partner can set a password and log in successfully.
- The referral code is visible in the Partner dashboard after login.

#### Alternate Scenarios

- Partner email already exists.
- Duplicate referral code generation attempt.
- Invitation email delivery fails.
- Partner invitation expires before use.
- Partner account creation fails.

#### Non-functional Requirements

- Referral codes must be unique across the platform.
- Invitation emails should be securely generated and delivered.
- Partner onboarding should complete within acceptable response time.
- Partner details and commission configurations should be securely stored.
- All onboarding actions should be logged for audit purposes.

#### Validation Rules / Errors

- “Email address already exists.”
- “Please enter a valid email address.”
- “Please enter a valid phone number.”
- “Unable to generate referral code.”
- “Unable to create partner account.”
- “Unable to send invitation email.”
- “Invitation link has expired.”
- “Referral code generated successfully.”


### 3.3 — Deactivate / Reactivate Partner

#### Requirement Statement

> _As a Super Admin user, I want to deactivate or reactivate a Partner account so that I can control partner access and referral activity while preserving partner data and history._

#### Story Details

- The Super Admin should be able to deactivate or reactivate a Partner from the Partner Management module.
- The action should be available from:
  - Partner Listing
  - Partner Detail Page
- **Deactivate Partner**
  - When the Super Admin deactivates a Partner:
    - Partner Status changes to Inactive
    - The partner can no longer log into the platform
    - Partner referral code/link becomes inactive
    - New users cannot sign up using the Partner’s referral code
    - Existing referral history, earnings, commissions, and audit logs remain preserved
- If someone uses an inactive referral code, the system should display:
  - “This referral code is no longer active.”
- **Reactivate Partner**
  - When the Super Admin reactivates a Partner:
    - Partner Status changes to Active
    - Partner regains platform access
    - Partner referral code/link becomes active again
    - New referrals can be tracked again using the same referral code

#### Acceptance Criteria

- Super Admin can deactivate an active Partner successfully.
- Super Admin can reactivate an inactive Partner successfully.
- Partner status updates correctly.
- Partner access is revoked immediately upon deactivation.
- Referral code becomes inactive when Partner is deactivated.
- Referral code becomes active again when Partner is reactivated.
- Existing partner data remains preserved.
- Status changes are recorded in audit logs.

#### Alternate Scenarios

- Partner is already active.
- The partner is already inactive.
- Status update fails temporarily.
- Referral code activation/deactivation fails temporarily.

#### Non-functional Requirements

- Status changes should take effect immediately.
- Partner data should remain preserved during deactivation.
- Referral tracking should be securely disabled/enabled based on Partner status.
- Status changes should be logged for audit purposes.

#### Validation Rules / Errors

- “Are you sure you want to deactivate this Partner?”
- “Are you sure you want to reactivate this Partner?”
- “Partner is already active.”
- “Partner is already inactive.”
- “Unable to update Partner status at the moment.”
- “This referral code is no longer active.”


---

## Epic 4: Employer Management

### 4.1 — View & Edit Employer Listings

#### Requirement Statement

> _As a Super Admin user, I want to view and manage all onboarded Employers, so that I can review employer details, update allowed information, and manage employer access._

#### Story Details

- The Super Admin should be able to access an Employer Management section containing a listing of all onboarded employers.
- The listing should show only key employer information, while complete details should be available on the individual Employer Detail Page.
- **Employer Listing Details**
  - Each Employer listing should display:
    - Employer Name
    - Company Name
    - Industry / Domain
    - Country
    - Assigned Subscription Plan
    - Employer Status
    - Active
    - Inactive
- **Actions Available**
  - The Super Admin should be able to:
    - View Details
    - Edit Employer
    - Deactivate Employer
    - Reactivate Employer
- **Search & Filters**
  - The Super Admin should be able to:
    - Search By
      - Employer Name
      - Company Name
      - Admin Email
    - Filter By
      - Industry / Domain
      - Country
      - Assigned Subscription Plan
      - Employer Status
- **Employer Detail Page**
  - When the Super Admin opens an Employer listing, the detail page should display:
    - **Company Information**
      - Employer Name (Editable)
      - Company Name (Editable)
      - Company Logo (Editable)
      - Website (Editable)
      - Industry / Domain (Editable)
      - Company Size (Editable)
      - Primary Contact Details
      - Contact Person Name (Editable)
      - Designation (Editable)
      - Email Address (Editable)
      - Phone Number (Editable)
    - **Location Information**
      - Country (Editable)
      - Region / City (Editable)
    - **Hiring Context**
      - Hiring For Industry (Editable)
      - Expected Hiring Volume (Editable)
      - Platform Usage Intent (Editable)
        - Employer Screening
        - Candidate Assessment
        - Hiring
    - **Admin Account Details**
      - Employer Admin Name (Editable)
      - Employer Admin Email (Editable)
    - **Competency Configuration**
      - Assigned Competency Model (Read-only)
        - ProofDive Default Competency Framework
    - **Subscription & Access Configuration**
      - Assigned Subscription Plan (Editable)
      - Mock Interview Allocation (Editable)
      - JD Allocation (Editable)
      - Expected User Volume (Editable)
      - Subscription Start Date (Editable)
      - Subscription Expiry Date (Editable)

#### Acceptance Criteria

- Super Admin can access Employer Management successfully.
- Employer listing displays key employer information only.
- Super Admin can search and filter employer listings.
- Super Admin can open the Employer Detail Page successfully.
- Detail page displays all onboarding-configured employer information.
- Super Admin can edit allowed fields successfully.
- Super Admin can deactivate/reactivate employers successfully.
- Updates reflect immediately after save.

#### Alternate Scenarios

- No employers exist.
- Search returns no matching employers.
- Selected filters return no results.
- Employer detail page fails to load.
- Employer update fails temporarily.
- Employer status update fails temporarily.

#### Non-functional Requirements

- Employer listings should load within acceptable response time.
- Search and filters should update dynamically.
- Employer updates should reflect in near real-time.
- Employer access changes should be securely enforced.
- All employer updates should be logged for audit purposes.

#### Validation Rules / Errors

- “No employers found.”
- “No matching employers found.”
- “Please enter a valid email address.”
- “Please enter a valid phone number.”
- “Subscription Expiry Date must be greater than Subscription Start Date.”
- “Unable to load employer details.”
- “Unable to save employer changes.”
- “Unable to update employer status.”


### 4.2 — Add New Employer

#### Requirement Statement

> _As a Super Admin user, I want to onboard a new Employer organization, so that they can access the platform, assess candidates, and manage hiring activities using ProofDive._

#### Story Details

- The Super Admin should be able to onboard an Employer through a guided multi-step workflow.
- **Step 1: Enter Employer Details**
  - The Super Admin should provide:
  - **Company Information**
    - Employer Name
    - Company Name
    - Company Logo
    - Website
    - Industry / Domain
    - Company Size
  - **Primary Contact Details**
    - Contact Person Name
    - Designation
    - Email Address
    - Phone Number
  - **Location Information**
    - Country
    - Region / City
  - **Hiring Context**
    - Hiring For Industry
    - Expected Hiring Volume
    - Platform Usage Intent
      - Employer Screening
      - Candidate Assessment
      - Hiring
  - **Admin Account Details**
    - Employer Admin Name
    - Employer Admin Email
  - The Employer Admin will set their password upon accepting the invitation.

- **Step 2: Configure Competency Model**
  - For MVP:
    - ProofDive Default Competency Framework should be assigned automatically.
    - No customization is available during Employer onboarding.
  - The Super Admin clicks Next.
- **Step 3: Configure Subscription & Access**
  - The Super Admin should configure the Employer's subscription and platform access.
  - **Subscription Plan**
    - The Super Admin should:
      - Select a Subscription Plan from a dropdown list
      - The dropdown should display plans previously configured in the Subscription & Pricing Management module
        OR
      - Click "+" to create a new subscription configuration
      - In such case:
        - **Access Configuration**
          - The Super Admin should be able to configure:
            - **Mock Interview Allocation**
              - Total number of mock interviews included
            - **Job Description (JD) Allocation**
              - Total number of JDs the Employer can create
            - **Expected User Volume**
              - Maximum number of users/candidates covered under the subscription
            - Subscription **Start Date**
            - Subscription **Expiry Date**
  - **Plan Assignment**
    - Upon selection or creation:
      - The configured subscription is assigned to the Employer
      - Usage limits become available within the Employer account
      - Usage consumption will be tracked against the assigned allocation
  - The Super Admin clicks Next.
- **Step 4: Review Details**
  - The Super Admin should review:
    - Employer Details
    - Competency Configuration
    - Subscription Configuration
    - Access & Usage Settings
  - The Super Admin clicks Next.
- **Step 5: Send Access / Invite**
  - Upon confirmation:
    - The system should:
      - Create Employer account
      - Create Employer Admin account
      - Assign subscription and access configuration
      - Send onboarding invitation email
      - The invitation email should:
      - Redirect Employer Admin to the platform
      - Auto-fill email address
      - Allow password setup
      - Require acceptance of Terms & Conditions and Privacy Policy
      - Remain valid for 48 hours
  - Upon first login:
    - Employer Admin gains access to the Employer Dashboard and platform features based on assigned permissions and subscription.

#### Acceptance Criteria

- Super Admin can initiate Employer onboarding successfully.
- Employer details can be entered and saved successfully.
- Default ProofDive competency framework is assigned automatically.
- Super Admin can select an existing subscription plan successfully.
- Super Admin can create a new subscription configuration if required.
- Mock Interview Allocation, JD Allocation, and Expected User Volume can be configured successfully.
- Subscription Start Date and Expiry Date can be configured successfully.
- The review screen displays all configured information correctly.
- Employer account and Employer Admin account are created successfully.
- Invitation email is sent successfully.
- The invitation link remains valid for 48 hours.
- Employer Admin can set passwords and access the platform successfully.

#### Alternate Scenarios

- Super Admin can initiate Employer onboarding successfully.
- Employer details can be entered and saved successfully.
- Default ProofDive competency framework is assigned automatically.
- Super Admin can select an existing subscription plan successfully.
- Super Admin can create a new subscription configuration if required.
- Mock Interview Allocation, JD Allocation, and Expected User Volume can be configured successfully.
- Subscription Start Date and Expiry Date can be configured successfully.
- The review screen displays all configured information correctly.
- Employer account and Employer Admin account are created successfully.
- Invitation email is sent successfully.
- The invitation link remains valid for 48 hours.
- Employer Admin can set passwords and access the platform successfully.

#### Non-functional Requirements

- Employer onboarding should complete within acceptable response time.
- Invitation emails should be securely generated and delivered.
- Subscription configurations should be securely stored.
- Invitation links should expire automatically after 48 hours.
- All onboarding actions should be logged for audit purposes.

#### Validation Rules / Errors

- “Employer organization already exists.”
- “Email address already exists.”
- “Please enter a valid email address.”
- “Please enter a valid phone number.”
- “Subscription plan is required.”
- “Subscription Start Date is required.”
- “Subscription Expiry Date is required.”
- “Subscription Expiry Date must be greater than Subscription Start Date.”
- “Unable to create an employer account.”
- “Unable to send invitation email.”
- “The invitation link has expired.”
- “Unable to save subscription configuration.”


### 4.3 — Deactivate / Reactivate Employer

#### Requirement Statement

> _As a Super Admin user, I want to activate or deactivate Employer accounts, so that I can control employer access to the platform while preserving their data and subscription configurations._

#### Story Details

- The Super Admin should be able to activate or deactivate an Employer from the Employer Management module.
- The action should be available from:
  - Employer Listing
  - Employer Detail Page
  - Deactivate Employer
- When an Employer is deactivated:
  - Employer Status changes to Inactive
  - Employer Admin can no longer access the platform
  - Employer users lose access to the platform
  - Existing employer data, candidate reports, configurations, and subscriptions remain preserved
  - Reactivate Employer
- When an Employer is reactivated:
  - Employer Status changes to Active
  - Employer Admin regains platform access
  - Employer users regain platform access
  - Existing configurations and subscriptions remain intact

#### Acceptance Criteria

- Super Admin can deactivate an active Employer successfully.
- Super Admin can reactivate an inactive Employer successfully.
- Employer status updates correctly.
- Access is revoked immediately upon deactivation.
- Access is restored upon reactivation.
- Existing employer data remains preserved.
- Status changes are recorded in audit logs.

#### Alternate Scenarios

- The employer is already active.
- The employer is already inactive.
- Status update fails temporarily.

#### Non-functional Requirements

- Status changes should take effect immediately.
- Employer data should remain preserved during deactivation.
- Access control changes should be securely enforced.
- Status changes should be logged for audit purposes.

#### Validation Rules / Errors

- “Are you sure you want to deactivate this employer?”
- “Are you sure you want to reactivate this employer?”
- “Employer is already active.”
- “Employer is already inactive.”
- “Unable to update Employer status at the moment.”
- “Employer status updated successfully.”


---

## Epic 5: Content & Masterclass Management

### 5.1 — View & Edit Existing Course Listings

#### Requirement Statement

> _As a Super Admin user, I want to view and manage all existing courses, so that I can update course content, manage course availability, and maintain the learning library._

#### Story Details

- The Super Admin should be able to access a Course Listings section containing all created courses.
- **Course Listing Details**
  - Each course listing should display:
    - Course Title
    - Duration
    - Status
    - Draft
    - Unpublished
    - Live
    - Last Updated Date
- **Actions Available**
  - The Super Admin should be able to:
    - View Course
    - Edit Course
    - Publish Course
    - Deactivate Course
    - Reactivate Course
- **Search & Filters**
  - The Super Admin should be able to:
  - Search By: Course Title
  - Filter By:
    - Course Status
      - Draft
      - Unpublished
      - Live
- **Course Detail & Edit Page**
  - When the Super Admin opens a course, they should be able to view and update the course at any level.
    - Course Details
      - Course Title (Editable)
      - Description (Editable)
    - Modules
      - View Existing Modules
      - Add New Modules
      - Edit Existing Modules
      - Remove Modules
    - Learning Content
      - Upload Additional Videos
      - Replace Existing Videos
    - Assessments
      - Add MCQs
      - Edit MCQs
      - Delete MCQs
      - Add AI Case Studies
      - Edit AI Case Studies
      - Delete AI Case Studies
  - The editing experience should be modular, allowing the Super Admin to update only the required section without recreating the entire course.
- **Course Status Management**
  - Publish Course
    - When a course is published:
      - Status changes to Live
      - Course becomes available to assigned users
  - Deactivate Course
    - When a course is deactivated:
      - Status changes to Unpublished
      - Course is no longer available to users
      - Existing learner progress remains preserved
  - Reactivate Course
    - When a course is reactivated:
      - Status changes to Live
      - Course becomes available again

#### Acceptance Criteria

- Super Admin can access Course Listings successfully.
- All courses display correctly in the listing.
- Search and filters work correctly.
- Super Admin can open a course successfully.
- Course details can be edited successfully.
- Modules can be added, edited, or removed.
- Learning content can be updated successfully.
- Assessments can be added, edited, or removed.
- The course can be published successfully.
- The course can be deactivated successfully.
- The course can be reactivated successfully.
- Changes are reflected immediately after saving.

#### Alternate Scenarios

- No courses exist.
- Search returns no matching courses.
- Selected filters return no results.
- Course update fails temporarily.
- Course publication fails.
- Content upload fails.

#### Non-functional Requirements

- Course listings should load within acceptable response time.
- Search and filters should update dynamically.
- Content uploads should support large media files.
- Course changes should reflect in near real-time.
- All course modifications should be logged for audit purposes.

#### Validation Rules / Errors

- “No courses found.”
- “No matching courses found.”
- “Course Title is required.”
- “At least one module is required.”
- “Unable to save course changes.”
- “Unable to publish the course.”
- “Unable to update course status.”
- “Course updated successfully.”


### 5.2 — Add New Course Listings

#### Requirement Statement

> _As a Super Admin user, I want to create and publish training courses with modules, learning content, and assessments, so that users can complete structured learning journeys and be evaluated on their understanding and competency development._

#### Story Details

- The Super Admin should be able to create a new course from the Content & Masterclass Management module.
- The course creation process should follow a guided workflow.
- **Step 1: Enter Course Details**
  - The Super Admin clicks Add New Course and provides:
    - Course Information
      - Course Title *(Mandatory)*
      - Description *(Mandatory)*
  - The Super Admin should then click Add Module.
  - At least one module is required before a course can be published.
- **Step 2: Configure Modules**
  - The Super Admin should be able to add one or more modules to the course.
  - For each module:
    - Module Content
    - Upload Video Content *(mp4 permissible)*
  - Additional modules may be added as required.
- **Step 3: Configure Assessments**
  - The Super Admin should be able to add assessments within each module.
  - Supported Assessment Types:
    - MCQ Assessment
    - AI Case Study Assessment
  - At least one assessment (MCQ or AI Case Study) must be added somewhere within the course before publishing.
  - **MCQ Assessment**
    - The Super Admin clicks Add MCQ and configures:
      - Checkpoint Duration: Time at which the assessment should appear during the module
      - Question
      - Option 1
      - Option 2
      - Option 3
      - Correct Option
    - The Super Admin should be able to add multiple MCQs within a module.
  - **AI Case Study Assessment**
    - The Super Admin clicks Add AI Case Study and configures:
      - Checkpoint Duration: Time at which the assessment should appear during the module
      - AI Prompt: Instructions for generating the case study scenario
      - Competency Mapping: Competencies to be evaluated
      - Passing Criteria: Minimum evaluation criteria required for successful completion
      - **Example**: AI Case Study Configuration
        - **Checkpoint Duration:** 08:00
          - (The case study will appear 8 minutes into the module.)
        - **AI Prompt:**
          - "Generate a case study where the learner is acting as a Product Manager at an e-commerce company facing a sudden drop in customer retention. Ask the learner to explain how they would analyze the problem, prioritize actions, and recommend a solution."
        - **Competency Mapping:**
          - Analytical Thinking
          - Prioritization
          - Decision-Making Agility
        - **Passing Criteria:**
          - Overall score of 3.5/5 or higher
          - Must score at least 3/5 in Analytical Thinking
        - **Response should include:**
          - Problem identification
          - Logical analysis
          - Prioritized recommendations
          - Clear reasoning for the proposed solution
    - When a learner attempts the case study:
      - The AI engine generates the assessment based on the configured prompt.
      - Responses are evaluated against the mapped competencies.
      - The competency engine calculates the evaluation score.
      - If the learner does not meet the passing criteria:
      - AI-generated improvement suggestions should be provided.
    - The Super Admin should be able to add multiple AI Case Studies within a module.
- **Step 4: Review Course**
  - The Super Admin should be able to review:
    - Course Details
    - Modules
    - Uploaded Content
    - MCQ Assessments
    - AI Case Study Assessments
    - Course Save Options
  - At this stage, the Super Admin should be able to:
    - Save as Draft
      - The course is saved for future editing.
      - Status = Draft
    - Save
      - The course is saved but not visible to learners.
      - Status = Unpublished
    - Publish
      - The course becomes available to assigned users.
      - Status = Live
  - Upon publishing:
    - The course should appear in the Course Listings page.
    - Learners can access the course based on their assigned permissions.

#### Acceptance Criteria

- Super Admin can create a new course successfully.
- Course Title and Description can be added successfully.
- Super Admin can add one or more modules.
- Video content can be uploaded successfully.
- Super Admin can add MCQ assessments.
- Super Admin can add AI Case Study assessments.
- Multiple assessments can be configured within a module.
- The course can be saved as Draft.
- The course can be saved as Unpublished.
- The course can be published successfully.
- Published courses appear in the course listings.
- AI Case Studies evaluate responses against configured competencies.
- AI improvement suggestions are generated when passing criteria are not met.

#### Alternate Scenarios

- Course saved as Draft.
- Course saved as Unpublished.
- No modules added.
- No assessments configured.
- Video upload fails.
- AI assessment configuration incomplete.
- Course publication fails.

#### Non-functional Requirements

- Video uploads should support large file handling.
- Course save operations should support auto-recovery of entered data.
- Assessment configurations should be stored securely.
- AI evaluation should return results within acceptable response times.
- Course publishing should update course availability immediately.

#### Validation Rules / Errors

- “Course Title is required.”
- “Description is required.”
- “At least one module is required to publish the course.”
- “At least one assessment is required to publish the course.”
- “Please upload valid video content.” (i.e. mp4)
- “Checkpoint duration is required.”
- “AI Prompt is required.”
- “Competency Mapping is required.”
- “Passing Criteria is required.”
- “Unable to upload content.”
- “Unable to publish the course.”
- “Course saved as Draft successfully.”
- “The course was published successfully.”


### 5.3 — Deactivate / Reactivate Course

#### Requirement Statement

> _As a Super Admin user, I want to activate or deactivate courses, so that I can control course availability while preserving course content and learner progress._

#### Story Details

- The Super Admin should be able to activate or deactivate a course from the Course Listings page or the Course Detail Page.
- **Deactivate Course**
  - When a course is deactivated:
    - Course Status changes to Unpublished
    - New learners can no longer access the course
    - Existing course content remains preserved
    - Existing learner progress and completion records remain preserved
- **Reactivate Course**
  - When a course is reactivated:
    - Course Status changes to Live
    - The course becomes available to users again
    - Existing course content and learner progress remain intact

#### Acceptance Criteria

- Super Admin can deactivate a Live course successfully.
- Super Admin can reactivate an Unpublished course successfully.
- Course status updates correctly.
- Existing course content remains preserved.
- Existing learner progress remains preserved.
- Status changes are recorded in audit logs.

#### Alternate Scenarios

- Course is already Live.
- Course is already Unpublished.
- Course status update fails temporarily.

#### Non-functional Requirements

- Status changes should take effect immediately.
- Course content and learner records should remain preserved.
- Status changes should be securely enforced.
- All status updates should be logged for audit purposes.

#### Validation Rules / Errors

- “Are you sure you want to deactivate this course?”
- “Are you sure you want to reactivate this course?”
- “The course is already Live.”
- “The course is already unpublished.”
- “Unable to update course status at the moment.”
- “Course status updated successfully.”


---

## Epic 6: Competency Framework Management

### 6.1 — View & Edit Existing Competency Listings

#### Requirement Statement

> _As a Super Admin user, I want to view and manage all existing courses, so that I can update course content, manage course availability, and maintain the learning library._

#### Story Details

- The Super Admin should be able to access a Competency Listings section containing all competency framework versions.
- **Competency Listing Details**
  - Each competency listing should display:
    - Competency Name
    - Version Number
    - Status
      - Active
      - Draft
    - Last Updated Date
- **Actions Available**
  - The Super Admin should be able to:
    - View Competency
    - Edit Competency
    - Create New Version
- **Search & Filters**
  - The Super Admin should be able to:
    - Search By
      - Competency Name
    - Filter By
      - Status
      - Active
      - Draft
- **Competency Detail Page**
  - When the Super Admin opens a competency version, the system should display:
    - Competency Name
    - Version Number
    - Competency Groups
    - Competency Descriptions
    - Competency Rubrics
  - The page should be view-only unless Edit is selected.
- **Edit Competency Version**
  - When the Super Admin clicks Edit on an existing competency version:
    - The system should:
      - Create a Draft copy of the selected version
      - Open the copied version in edit mode
      - Preserve the original version unchanged
        - Example:
          - Default Version → 1.0
            - Edited Copy → 1.1
            - Another version from Default → 1.2
            - Another version from Default → 1.3
          - If Version 1.2 is edited:
            - New Draft Version → 1.2.1
            - Further version:
              - 1.2.2
              - 1.2.3
          - and so on.
- **Create New Version**
  - When the Super Admin clicks Create New Version from any competency:
    - The system should:
      - Create a draft copy of the selected competency version
      - Open it in edit mode
      - Allow competency descriptions and rubrics to be updated
      - Save the edited copy as a new child version
    - The parent competency version should remain unchanged.
- **Save Updated Version**
  - When Save is selected:
    - A new competency version is created
    - The new version is added to the Competency Listings page
    - Previous versions remain available for reference
    - Version history is preserved

#### Acceptance Criteria

- Super Admin can access Competency Listings successfully.
- All competency versions display correctly.
- Search and filters work correctly.
- Super Admin can view competency details successfully.
- Editing a competency creates a new draft version.
- Original competency versions remain unchanged.
- New competency versions are added to the listing successfully.
- Version numbering follows the defined hierarchy.
- Version history is preserved.

#### Alternate Scenarios

- No competency versions exist.
- Search returns no matching competency.
- Save operation fails temporarily.
- Duplicate version generation fails.

#### Non-functional Requirements

- Competency version history should be preserved.
- Original versions should never be overwritten.
- Version creation should complete within acceptable response times.
- All competency changes should be logged for audit purposes.

#### Validation Rules / Errors

- “No competency versions found.”
- “No matching competency found.”
- “Unable to create a competency version.”
- “Unable to save competency changes.”
- “Competency version created successfully.”
- “No changes detected.”


### 6.2 — Update Competency as a New Version

#### Requirement Statement

> _As a Super Admin user, I want to create a new version of the competency framework based on the default competency model, so that I can customize competency descriptions, rubrics, and evaluation criteria while maintaining version control._

#### Story Details

- The Super Admin should be able to access the Competency Management module and create a new competency version.
- The platform should maintain the original ProofDive competency framework while allowing customized versions to be created and managed separately.
- **Create New Version**
  - The Super Admin clicks Create New Version.
  - The system should:
    - Create a draft copy of the default competency framework
    - Open the copied version in edit mode
    - Allow modification of competency descriptions, rubrics, and evaluation criteria
    - Preserve the original competency framework without modification
- **Version Details**
  - The Super Admin should provide:
    - Competency Name (Mandatory)
  - The Competency Name must be unique across all competency versions.
- **Competency Editing**
  - The copied competency framework should display all existing competency groups and competencies.
  - For MVP, competency titles remain fixed and cannot be changed.
  - The Super Admin should be able to edit:
    - Competency Description
    - Competency Rubric
    - Competency Rules / Evaluation Guidance
    - Example Competency Groups:
      - **Power of Thinking**
        - Analytical Thinking
        - Prioritization
        - Decision-Making Agility
      - **Power of Action**
        - Ownership
        - Initiative & Follow-through
        - Embraces Change
      - **Power of People**
        - Influence
        - Collaboration & Inclusion
        - Grows Capability
      - **Power of Mastery**
        - Functional Knowledge
        - Execution
        - Innovation
- **Review Version**
  - Once editing is complete, the Super Admin clicks Review.
  - The Review page should display:
    - Competency Name
    - All competency groups
    - All competency descriptions and rubrics
  - The Super Admin should be able to:
    - Continue Editing
    - Save Version
- **Save Version**
  - When Save is selected:
    - The system should:
      - Create a new competency version
      - Preserve the original competency framework
      - Add the new version to the Competency Listings page as a separate entry
    - The new version should be available for assignment during:
      - Organization Onboarding
      - Employer Onboarding
      - Future configuration workflows
  - Alternatively, the super admin can also save as draft while editing to complete later on.

#### Acceptance Criteria

- Super Admin can create a new competency version successfully.
- Default competency framework is duplicated automatically.
- Competency descriptions and rubrics can be modified.
- Competency titles remain fixed.
- Competency Name is required.
- Duplicate Competency Names are not allowed.
- Super Admin can review competency changes before saving.
- Super Admin can continue editing from the review screen.
- The saved version appears in Competency Listings as a separate entry.
- The original competency framework remains unchanged.

#### Alternate Scenarios

- Competency Name already exists.
- Super Admin leaves required fields blank.
- Save operation fails temporarily.
- Super Admin returns from Review to continue editing.

#### Non-functional Requirements

- Version creation should preserve the original competency framework.
- Competency versions should support future reuse across organizations and employers.
- Changes should be saved and processed within acceptable response times.
- All version creation and updates should be logged for audit purposes.

#### Validation Rules / Errors

- “Competency Name is required.”
- “Competency Name already exists.”
- “Please complete all required competency information.”
- “Unable to save the competency version.”
- “Competency version saved successfully.”
- “No changes detected.”


### 6.3 — Deactivate / Reactivate Competency

#### Requirement Statement

> _As a Super Admin user, I want to activate or deactivate competency versions, so that I can control which competency frameworks are available for assignment while preserving version history._

#### Story Details

- The Super Admin should be able to activate or deactivate competency versions from the Competency Listings page or the Competency Detail Page.
- **Deactivate Competency Version**
  - When a competency version is deactivated:
    - Status changes to Draft
    - The competency version can no longer be assigned to new Organizations or Employers
    - Existing Organizations or Employers already using the competency version remain unaffected
    - Version history remains preserved
- **Reactivate Competency Version**
  - When a competency version is reactivated:
    - Status changes to Active
    - The competency version becomes available for assignment again
    - Existing version history remains intact

#### Acceptance Criteria

- Super Admin can deactivate an active competency version successfully.
- Super Admin can reactivate a draft competency version successfully.
- Status updates correctly.
- Existing assignments remain unaffected.
- Version history remains preserved.
- Status changes are recorded in audit logs.

#### Alternate Scenarios

- The competency version is already Active.
- The competency version is already Draft.
- Status update fails temporarily.

#### Non-functional Requirements

- Status changes should take effect immediately.
- Existing assignments should remain unaffected.
- Competency version history should remain preserved.
- All status changes should be logged for audit purposes.

#### Validation Rules / Errors

- “Are you sure you want to deactivate this competency version?”
- “Are you sure you want to reactivate this competency version?”
- “Competency version is already Active.”
- “Competency version is already Draft.”
- “Unable to update competency status at the moment.”
- “Competency status updated successfully.”


---

## Epic 7: Payments & Bundle Management

Global rate configuration, bundle catalogue management, and discount codes. Bundles defined here drive the subscription options available to B2B Admins and B2C Candidates.

### 7.1 — Set Price — Global & Add-On Rate Configuration `NEW`

#### Requirement Statement

> _As a Super Admin, I want to configure global bundle-inclusion pricing and separate add-on pricing for Mock Interviews, Storyboards, and Masterclasses by client type, so that bundle pricing is calculated consistently and additional purchases are charged at consistent, pre-approved rates._

#### Story Details

- The Super Admin should be able to access “Set Price” as its own section within the Payments module, separate from Bundle Listing and Discount Code Listing.
- The page has two separate sections: **Global Rates** and **Add-On Rates**.
- **Global Rates**
  - A price for each of the following combinations:
    - Mock Interview: B2C, B2B
    - Storyboard: B2C, B2B
    - Masterclass: B2C, B2B
  - Six rates in this section.
  - These are the rates that prefill for each item when a Super Admin includes it in a bundle during Create New Bundle. The prefilled value is editable per bundle; a Super Admin can override any item’s rate for that specific bundle.
  - For Masterclass specifically: the Masterclass Price is an absolute value, prefilled from this Global Rate. For proportional reduction, this absolute price is divided equally across the total number of Modules within that Masterclass, giving each Module a fixed price share. Selecting or deselecting a Module adds or removes that Module’s fixed share from the Masterclass Price; the price of remaining selected Modules is not redivided when a Module is toggled.
- **Add-On Rates**
  - A price for each of the following combinations:
    - Mock Interview: B2C, B2B
    - Storyboard: B2C, B2B
    - Masterclass: B2C, B2B
  - Six rates in this section, independent of the Global Rates values.
  - These are the rates charged when a subscriber purchases that item as an add-on beyond their bundle allocation.
- **Editing (applies to both sections)**
  - Each rate: currency input field, editable individually.
  - Displays as read-only text by default (e.g. “$5.00”). Currency input, minimum $0.01, 2 decimal places.
  - An edit icon next to each rate makes that field editable, in place.
  - The Super Admin can edit one or more rates before saving.
  - Editing a rate does not trigger confirmation on its own; edits are held locally until Save is clicked.
  - Cancelling an individual rate’s edit (before Save) reverts just that rate to its previous value, without affecting other pending edits.
  - If an Item/Client Type combination has no rate configured, that combination is unavailable for its corresponding use (bundle inclusion for Global Rates, top-up purchase for Add-On Rates) until a price is set.
- **Save Changes**
  - A single Save action commits all edited rates across both sections at once.
  - Save triggers a confirmation dialog, since this affects pricing platform-wide.
  - If the Super Admin cancels the confirmation dialog, no changes are applied and all rates revert to their previous values.
- **Rate Change Effective Timing**
  - Global Rates changes: apply starting each subscriber’s next billing cycle; the current cycle’s price is unaffected.
  - Add-On Rates changes: apply immediately, including to purchase flows already in progress.
  - A per-bundle override entered directly in Create New Bundle or View & Edit Bundle applies immediately if the bundle is newly created (no existing subscribers). For an existing bundle being edited, a per-bundle override applies starting the next billing cycle, the same as an unedited Global Rate change would.

#### Acceptance Criteria

- Super Admin can access Set Price successfully.
- Global Rates and Add-On Rates display as two distinct sections with independent values.
- All 12 rates display correctly as read-only, reflecting their currently configured values.
- Using the edit icon makes only that specific rate editable, without affecting other rates.
- Editing an individual rate does not trigger a confirmation dialog.
- The confirmation dialog only fires when the Super Admin clicks the overall Save.
- Confirming the dialog applies all edited rates (both sections) at once; cancelling discards all pending edits across all rates.
- An Item/Client Type combination with no rate configured is correctly unavailable for its corresponding use until priced.
- Global Rates changes apply to existing subscribers only from their next billing cycle onward.
- Add-On Rates changes apply immediately, including to in-progress purchase flows.
- A Super Admin can override any item’s Global Rate on a per-bundle basis in Create New Bundle or View & Edit Bundle.
- Toggling a Masterclass Module adds/removes that Module’s fixed price share without redividing the remaining selected Modules’ prices.

#### Alternate Scenarios

- Super Admin attempts to save with an invalid rate (e.g. $0.00 or negative): save is blocked with a validation message.
- A user attempts to purchase a Mock Interview, Storyboard, or Masterclass add-on for a combination with no Add-On Rate configured: purchase option is unavailable/disabled for that item.
- A Super Admin attempts to include an item in a bundle for a combination with no Global Rate configured: item is unavailable for selection until its rate is set.
- Super Admin edits multiple rates across both sections, then cancels the Save confirmation dialog: all pending edits are discarded, reverting to previous values.
- Super Admin cancels an individual rate’s edit (before clicking Save): only that rate reverts, other pending edits remain intact.
- Save fails temporarily.

#### Business Rules

- An Item/Client Type combination cannot be included in a bundle unless its Global Rate is configured.
- An Item/Client Type combination cannot be purchased as an additional/top-up item unless its Add-On Rate is configured.
- Global Rates and Add-On Rates are independent values; changing one does not affect the other.
- A Super Admin may override any item’s Global Rate on a per-bundle basis at creation or edit time. Where no override is entered, the bundle uses the current Global Rate.
- Global Rates changes apply prospectively to existing subscribers, taking effect at their next billing cycle.
- Add-On Rates changes apply immediately and universally, including to purchase sessions already in progress.
- A per-bundle Global Rate override applies immediately for a newly created bundle with no existing subscribers, and from the next billing cycle for an existing bundle being edited.
- A Masterclass Price is an absolute value; it is divided equally across its total Module count solely to determine each Module’s fixed share for proportional reduction when Modules are toggled.

#### Validation Rules / Errors

- Rate (per Item/Client Type, either section):
  - Default: no value set
  - Condition: Minimum $0.01, 2 decimal places, required before that combination is usable
  - Error: “Please enter a valid price.”
  - Treatment: field highlighted in red with error message below
- Save Confirmation:
  - “Are you sure you want to update these rates? Add-on rate changes will apply immediately; global rate changes will apply from each subscriber’s next billing cycle.”

#### Non-functional Requirements

- Add-On Rate updates must propagate and take effect immediately across all active purchase flows.
- Global Rate updates must apply automatically at each subscriber’s next billing cycle without manual intervention.
- Set Price should load within an acceptable response time.
- All pricing changes should be logged for audit purposes.


### 7.2 — Bundle Listing — Payments Module Overview `NEW`

#### Requirement Statement

> _As a Super Admin, I want to view all payment bundles and their performance at a glance, so that I can monitor payments performance and locate bundles across the platform._

#### Story Details

- The Super Admin should be able to access a dedicated Payments module.
- **Summary Cards (Top of Page)**
  - The Payments page should display 4 summary cards:
    - **Total Active Bundles**: count of bundles currently in Active status
    - **Earnings**: total revenue across all bundles
    - **Total Subscribers**: total count of organizations/users currently subscribed across all bundles
    - **New Subscribers This Month**: count of new subscribers acquired in the current calendar month
  - Each card, when interacted with, expands in place to show a breakdown as hard numbers (not a graph):
    - Earnings: broken down by Client Type (B2C, B2B) and by Add-On purchases
    - Total Subscribers: broken down by Client Type (B2C, B2B)
    - New Subscribers This Month: broken down by Client Type (B2C, B2B)
  - Total Active Bundles does not expand; it is a single count.
- **Bundle Listing**
  - Below the summary cards, the Super Admin should see a listing of all bundles.
  - Each bundle is shown as a row with nested sub-rows, one sub-row per Billing Cycle the bundle has enabled (Monthly, Quarterly, Yearly), so a bundle offering more than one cadence appears once with its cadences segregated underneath rather than duplicated as separate bundle rows.
  - Fields, in display order:
    - Bundle Name
    - Type (B2C/B2B)
    - Billing Cycle *(sub-row item, one per enabled cadence: Monthly/Quarterly/Yearly)*
    - Price *(sub-row item, the price corresponding to that cadence)*
    - Last Updated *(a newly created bundle’s Last Updated is its creation date; no separate Date Created field)*
    - Status (Draft/Active/Inactive)
  - Clicking the Bundle Name opens that bundle’s View Details page.
- **Search**
  - The Super Admin should be able to search across all fields (Bundle Name, Type, Billing Cycle, Status).
- **Filters**
  - Filter By: Type, Status, Billing Cycle
- **Actions Available**
  - The Super Admin should be able to:
    - Edit Bundle
    - Deactivate/Reactivate Bundle
    - Duplicate
  - This story only establishes that these actions are available from the listing. The behavior of Edit Bundle and Deactivate/Reactivate is defined in their own stories.

#### Acceptance Criteria

- Super Admin can access the Payments module successfully.
- All 4 summary cards display accurate, correctly calculated values.
- Earnings, Total Subscribers, and New Subscribers This Month cards expand on interaction to show a Client Type breakdown as hard numbers.
- Earnings breakdown additionally separates Add-On purchase revenue.
- Total Active Bundles displays as a single count with no expand behavior.
- All existing bundles display correctly in the listing, one row per bundle with nested sub-rows per active Billing Cycle.
- A bundle with multiple active Billing Cycles shows no duplicate bundle-level rows.
- Clicking a Bundle Name opens that bundle’s View Details page.
- Search returns correct results across all fields.
- Filters return correct results for Type, Status, and Billing Cycle.
- Edit Bundle, Deactivate/Reactivate, and Duplicate actions are all available from the listing.

#### Alternate Scenarios

- No bundles exist: listing displays an empty state.
- Search returns no matching bundles.
- Selected filters return no results.
- Summary card data fails to load.
- A card is interacted with but its breakdown fails to load.

#### Business Rules

- Total Active Bundles, Earnings, Total Subscribers, and New Subscribers This Month figures reflect only bundles that have had at least one subscriber, where applicable.
- A bundle with multiple enabled Billing Cycles is represented as one row with one sub-row per cycle, never as multiple bundle rows.

#### Validation Rules / Errors

- Search:
  - Default: N/A
  - Condition: N/A
  - Error: “No matching bundles found.”
  - Treatment: empty state message displayed in place of the listing
- Filters:
  - Default: N/A
  - Condition: N/A
  - Error: “No bundles found for the selected filters.”
  - Treatment: empty state message displayed in place of the listing

#### Non-functional Requirements

- Summary cards and bundle listing should load within an acceptable response time.
- Card breakdowns should expand without noticeable delay when interacted with.
- Search and filters should update results dynamically.


### 7.3 — Create New Bundle — Bundle Configuration `NEW`

#### Requirement Statement

> _As a Super Admin, I want to create new payment bundles with configured items, pricing, and billing cycles, so that I can package and monetize Mock Interviews, Storyboards, and Masterclasses for different client types._

#### Story Details

- The Super Admin should be able to access “Create New Bundle” from the Bundle Listing page.
- **Bundle Details**
  - Bundle Name: text field **(Mandatory)**
    - Must be unique across all existing bundles regardless of status
  - Description: text field **(Optional)**
  - Type: dropdown **(Mandatory)**
    - Placeholder: “Select Type”
    - No pre-selected default
    - Options: B2C, B2B
- **Included Items**
  - Each item type has an include/exclude toggle. Quantity/selection fields only appear when the toggle is enabled.
  - **Mock Interview**
    - Include checkbox **(Optional, off by default)**
    - Quantity: numeric input field **(Mandatory when included)** (Minimum 1, no upper limit)
    - Unit Price: currency input field, prefilled from the Global Rate configured in Set Price for the selected Type **(Mandatory when included)** (Minimum $0.01, 2 decimal places)
      - The Super Admin can override the prefilled value for this bundle only
  - **Storyboard**
    - Include checkbox **(Optional, off by default)**
    - Quantity: numeric input field **(Mandatory when included)** (Minimum 1, no upper limit)
    - Unit Price: currency input field, prefilled from the Global Rate configured in Set Price for the selected Type **(Mandatory when included)** (Minimum $0.01, 2 decimal places)
      - The Super Admin can override the prefilled value for this bundle only
  - **Masterclass**
    - Include toggle **(Optional, off by default)**
    - Masterclass selection: multi-select dropdown **(Mandatory when included)**, populated from published Masterclasses in Content & Masterclass Management
      - Upon selecting a Masterclass, all Modules within it are pre-selected by default
      - Masterclass Price is an absolute value, prefilled from the Global Rate configured in Set Price for the selected Type
      - For proportional reduction, this absolute price is divided equally across the Masterclass’s total Module count to determine each Module’s fixed share
      - The Super Admin can deselect individual Modules; deselecting a Module subtracts that Module’s fixed share from the Masterclass Price. Reselecting a Module adds its fixed share back. Remaining Modules’ shares are not redivided.
    - Masterclass Price: currency display **(Mandatory when included)** (Minimum $0.01, 2 decimal places)
      - The Super Admin can override this price for this bundle only
  - At least one item type must be included before the bundle can be saved.
- **Billing Cycle & Pricing**
  - Billing Cycle: checkboxes **(Mandatory, at least one must be selected)**: Monthly, Quarterly, Yearly
  - For each selected Billing Cycle:
    - Price: auto-calculated (display) from included item Unit Prices/Masterclass Price and quantities
      - The Super Admin can override the calculated price with any value for that Billing Cycle
- **Draft Preview**
  - Before saving, the Super Admin is shown a preview of the configured bundle (all entered/calculated fields) for review.
  - From the preview, two actions are available:
    - **Save as Draft**: saves the bundle with Draft status
    - **Save & Activate**: saves the bundle with Active status, immediately available for subscription

#### Acceptance Criteria

- Super Admin can access the Create New Bundle form from the Bundle Listing page.
- Bundle Name and Type must be provided before the bundle can proceed to preview.
- At least one item (Mock Interview, Storyboard, or Masterclass) must be included.
- Quantity and Unit Price fields become mandatory only when their corresponding item is included.
- Mock Interview and Storyboard Unit Prices correctly prefill from the Set Price Global Rate for the selected Type, and can be overridden per bundle.
- Masterclass selection correctly pre-selects all Modules by default, with Masterclass Price prefilling as an absolute value from the Global Rate.
- Deselecting a Module correctly subtracts that Module’s fixed share from the Masterclass Price; reselecting adds it back; remaining Modules’ shares are not redivided.
- Masterclass Price can be overridden per bundle.
- At least one Billing Cycle must be selected before the bundle can proceed to preview.
- Price for each selected Billing Cycle auto-calculates correctly based on included item prices and quantities, and can be overridden.
- The draft preview accurately reflects all configured fields before saving.
- Save as Draft saves the bundle with Draft status.
- Save & Activate saves the bundle with Active status and makes it immediately available for subscription.
- Duplicate Bundle Names are rejected.

#### Alternate Scenarios

- A Super Admin opens Create New Bundle from the Bundle Listing page. They enter “Career Starter” as the Bundle Name and select B2C as the Type. Under Included Items, they toggle on Mock Interview and set the Quantity to 2; the Unit Price prefills at $15 from the Global Rate, but the Super Admin overrides it to $12 for this bundle, bringing the Mock Interview subtotal to $24. They toggle on Storyboard, set the Quantity to 3; the Unit Price prefills at $10, and they leave it as is, bringing the Storyboard subtotal to $30. They toggle on Masterclass and select “Resume Writing 101,” which prefills its Masterclass Price at $80, its absolute Global Rate value (divided across its 4 Modules, each worth a fixed $20 share, all selected by default). The Super Admin deselects 1 Module they don’t want included, subtracting its $20 share and reducing the Masterclass Price to $60. The system calculates a Monthly total of $114 ($24 + $30 + $60), which the Super Admin accepts without overriding the bundle-level total. They check both Monthly and Yearly under Billing Cycle, and enter $1,140 as the Yearly price. They click through to the draft preview, review the configuration, and click Save & Activate. The bundle is created with Active status and becomes immediately available for subscription. Because this bundle is newly created with no existing subscribers, the Mock Interview override of $12 applies immediately rather than waiting for a next billing cycle.
- No item included: proceeding to preview is blocked with a validation message.
- No Billing Cycle selected: proceeding to preview is blocked with a validation message.
- Duplicate Bundle Name entered: proceeding to preview is blocked with a validation message.
- Masterclass deselected after Modules were customized: previously deselected Modules reset to default (all selected) if the Masterclass is removed and re-added.
- Bundle-level Billing Cycle price left at the calculated value: system uses the auto-calculated price.
- Super Admin uses the Duplicate action from Bundle Listing on an existing bundle: a new bundle is created with all fields (items, quantities, prices, overrides, Billing Cycles) copied from the source, Bundle Name suffixed with “_” and the next available number in a sequence shared across all duplicates of that original bundle (e.g. “Interview Prep Bundle_0,” then “_1,” regardless of which existing copy was duplicated from). The duplicate always saves as Draft, regardless of the source bundle’s status.

#### Business Rules

- A bundle must include at least one item type (Mock Interview, Storyboard, or Masterclass).
- Bundle Name must be unique across all bundles regardless of Status (Draft or Active).
- A bundle must have at least one Billing Cycle selected (Monthly, Quarterly, and/or Yearly).
- Mock Interview, Storyboard, and Masterclass prices prefill from the Global Rate configured in Set Price for the bundle’s Type, and may be overridden per bundle.
- A per-bundle price override applies immediately if the bundle is newly created (no existing subscribers). For an existing bundle being edited, a price override applies starting the next billing cycle, the same as an unedited Global Rate change would.
- A Masterclass Price is an absolute value; it is divided equally across its total Module count solely to determine each Module’s fixed share for proportional reduction when Modules are toggled.
- Duplicating a bundle always produces a Draft, regardless of the source bundle’s status, named with the source’s Bundle Name plus an incrementing “_N” suffix shared across all duplicates of that original.
- Inactive status is not selectable at bundle creation; it is only reachable later via Deactivate/Reactivate Bundle.

#### Validation Rules / Errors

- Bundle Name:
  - Default: N/A
  - Condition: Mandatory, must be unique across all bundles
  - Error: “Bundle name already exists. Please choose a different name.”
  - Treatment: field highlighted in red with error message below
- Type:
  - Default: N/A (blank, placeholder “Select Type”)
  - Condition: Mandatory
  - Error: “Please select a bundle type.”
  - Treatment: field highlighted in red with error message below
- Quantity (Mock Interview / Storyboard):
  - Default: N/A
  - Condition: Mandatory when item is included, minimum 1, numeric only
  - Error: “Please enter a valid quantity (minimum 1).”
  - Treatment: field highlighted in red with error message below
- Masterclass Selection:
  - Default: N/A
  - Condition: Mandatory when Masterclass is included, at least one Masterclass must be selected
  - Error: “Please select at least one masterclass.”
  - Treatment: field highlighted in red with error message below
- Unit Price / Masterclass Price:
  - Default: prefilled from Set Price Global Rate
  - Condition: Mandatory when item is included, minimum $0.01, 2 decimal places
  - Error: “Please enter a valid price.”
  - Treatment: field highlighted in red with error message below
- Bundle-level (no items included):
  - Default: N/A
  - Condition: At least one item type must be included
  - Error: “Please include at least one item (Mock Interview, Storyboard, or Masterclass) in the bundle.”
  - Treatment: form-level error banner displayed above the Included Items section
- Billing Cycle:
  - Default: N/A (none selected)
  - Condition: At least one Billing Cycle must be selected
  - Error: “Please select at least one billing cycle.”
  - Treatment: form-level error banner displayed above the Billing Cycle section

#### Non-functional Requirements

- Bundle creation must save successfully within an acceptable response time.
- Auto-calculated Billing Cycle prices must update in real time as the Super Admin makes selections.
- Bundle data must be validated server-side in addition to client-side validation.


### 7.4 — View & Edit Bundle — Bundle Detail & Configuration Management `NEW`

#### Requirement Statement

> _As a Super Admin, I want to view a bundle’s full configuration and performance, and edit its details, so that I can manage individual bundle offerings and keep their configuration current._

#### Story Details

- The Super Admin opens a bundle’s detail page by clicking its Bundle Name from Bundle Listing.
- **Bundle Detail Page (View)**
  - The detail page displays all configured fields for the bundle:
    - Bundle Name
    - Description
    - Type (B2C/B2B)
    - Included Items, with Quantity and Unit Price/Masterclass Price for each included item
    - For an included Masterclass: selected Modules and each Module’s fixed price share
    - Billing Cycle(s) enabled and the Price for each
    - Status (Draft/Active/Inactive)
  - **Subscriber Listing**
    - A listing of all subscribers to this bundle. Each row displays:
      - Name/Email
      - Time of Purchase
      - Billing Cycle
      - Status
    - Each subscriber row shows that subscriber’s Add-On purchases nested underneath, as additional line items:
      - Item (Mock Interview, Storyboard, or Masterclass)
      - Quantity
      - Price paid
      - Date purchased
    - **Search**
      - The Super Admin can search the Subscriber Listing by Name/Email.
- **Edit Bundle**
  - The Super Admin can edit any field available in Create New Bundle (Bundle Name, Description, Included Items and their quantities/prices, Masterclass and Module selection, Billing Cycle and Price), with one exception:
    - Type is only editable while Status is Draft. Once the bundle has moved out of Draft, Type becomes read-only.
  - Edits go through the same Draft Preview step as Create New Bundle.
    - If the bundle being edited is currently Draft: the preview offers both Save as Draft and Save & Activate, same as creation.
    - If the bundle being edited is currently Active: the preview offers a single Save action, since the bundle is already active.
  - Changes made to an Active bundle apply going forward only; existing subscribers are unaffected by changes to items, pricing, or included content until their next renewal cycle, consistent with the pricing timing rules established in Set Price and Create New Bundle.

#### Acceptance Criteria

- Super Admin can open a bundle’s detail page by clicking its Bundle Name from Bundle Listing.
- Detail page displays all configured fields, including Masterclass Module selections and their fixed price shares.
- Subscriber Listing displays accurate subscriber records (Name/Email, Time of Purchase, Billing Cycle, Status).
- Each subscriber’s Add-On purchases display correctly nested under their row, with Item, Quantity, Price paid, and Date purchased.
- Subscriber Listing search returns correct results by Name/Email.
- Super Admin can edit an existing bundle and save changes successfully.
- Type field is editable only when Status is Draft, and becomes read-only once Status changes.
- Editing a Draft bundle offers both Save as Draft and Save & Activate on the preview.
- Editing an Active bundle offers a single Save action on the preview.
- Edits to an Active bundle do not retroactively affect existing subscribers until their next renewal cycle.
- All other fields besides Type remain editable regardless of the bundle’s subscriber history.

#### Alternate Scenarios

- No subscribers exist for a bundle: Subscriber Listing displays an empty state.
- Subscriber Listing search returns no matching subscribers.
- Attempt to edit Type while Status is not Draft: field is disabled/read-only, no error needed since the action isn’t available.
- Bundle update fails temporarily.
- Detail page or Subscriber Listing data fails to load.

#### Business Rules

- Type can only be modified while the bundle is in Draft status.
- Edits to item content, pricing, or Billing Cycle configuration on an Active bundle apply prospectively; they do not change what existing subscribers already have access to until renewal.
- No field besides Type is locked based on subscriber history.
- Editing a Draft bundle preserves the Save as Draft / Save & Activate choice; editing an Active bundle only offers Save.

#### Validation Rules / Errors

- Subscriber Listing Search:
  - Default: N/A
  - Condition: N/A
  - Error: “No matching subscribers found.”
  - Treatment: empty state message displayed in place of the listing
- Edit Save:
  - Default: N/A
  - Condition: Same validation rules as Create New Bundle apply
  - Error: “Unable to save bundle changes.”
  - Treatment: form-level error banner displayed above the form

#### Non-functional Requirements

- Bundle detail page and Subscriber Listing should load within an acceptable response time.
- All bundle edits should be logged for audit purposes.
- Subscriber Listing search should update results dynamically.


### 7.5 — Deactivate / Reactivate Bundle `NEW`

#### Requirement Statement

> _As a Super Admin, I want to deactivate and reactivate payment bundles, so that I can control bundle availability while preserving existing subscriber access._

#### Story Details

- The Super Admin should be able to deactivate or reactivate a bundle from the Bundle Listing page or the Bundle Detail Page.
- **Deactivate Bundle**
  - When a bundle is deactivated:
    - Bundle Status changes to Inactive
    - The bundle is no longer available for new purchases
    - Existing subscribers retain full access to the bundle’s items until their current subscription cycle ends
- **Reactivate Bundle**
  - When the Super Admin attempts to reactivate an Inactive bundle:
    - The system should validate that all included items are still valid (e.g. all selected Masterclasses/Modules still exist and are Active/Live, and all included items still have a configured Global Rate in Set Price)
    - If validation passes:
      - Bundle Status changes to Active
      - The bundle becomes available for new purchases again
    - If validation fails:
      - Reactivation is blocked
      - The Super Admin is shown which item(s) are no longer valid
      - The Super Admin must update the bundle (e.g. remove or replace the invalid item) before reactivating

#### Acceptance Criteria

- Super Admin can deactivate an Active bundle successfully from either Bundle Listing or the Bundle Detail Page.
- Super Admin can reactivate an Inactive bundle successfully, provided all included items are still valid.
- Reactivation is correctly blocked when an included item is no longer valid, with the invalid item(s) identified to the Super Admin.
- Bundle Status updates correctly for both Deactivate and Reactivate actions.
- Existing subscribers retain access after deactivation until their cycle ends.

#### Alternate Scenarios

- Bundle is already Active: Reactivate action is unavailable.
- Bundle is already Inactive: Deactivate action is unavailable.
- Reactivation attempted with an invalid item (e.g. a removed/unpublished Masterclass still selected, or an item with no configured Global Rate): reactivation is blocked, invalid item(s) flagged.
- Status update fails temporarily.

#### Business Rules

- Reactivation requires all included items to still be valid and available (Masterclasses/Modules still Active/Live, Global Rates still configured); the bundle cannot return to Active status otherwise.
- Deactivating a bundle does not affect existing subscribers’ access until their current subscription cycle ends.

#### Validation Rules / Errors

- Reactivate Bundle:
  - Default: N/A
  - Condition: All included items (Masterclasses/Modules, Global Rates) must still be valid and Active
  - Error: “This bundle cannot be reactivated. The following item(s) are no longer available: [invalid item name(s)]. Please update the bundle before reactivating.”
  - Treatment: reactivation blocked, invalid item(s) highlighted within the bundle’s item list
- Confirmation Prompts:
  - “Are you sure you want to deactivate this bundle?”
  - “Are you sure you want to reactivate this bundle?”

#### Non-functional Requirements

- Status changes should take effect immediately.
- Existing subscriber data and access should remain preserved through deactivation.
- All status changes should be logged for audit purposes.
- Status validation checks should complete within an acceptable response time.


### 7.6 — Discount Code Listing `NEW`

#### Requirement Statement

> _As a Super Admin, I want to view all generated discount codes at a glance, so that I can monitor discount code performance and locate codes across the platform._

#### Story Details

- The Super Admin should be able to access a Discount Code Listing page from within the Payments module.
- **Discount Code Listing**
  - Each row should display:
    - Code
    - Discount Type
    - Value (e.g. “25%”, “$10.00”, “Free Access”)
    - Applies To (bundle type(s))
    - Usage (Used / Limit, e.g. “12 / 50”, “12 / Unlimited”, “1 / 1” for one-time use)
    - Validity (Start Date - Expiry Date)
    - Status (Active, Expired, Deactivated)
  - Clicking the Code opens that discount code’s View Details page.
- **Search**
  - The Super Admin should be able to search across all fields.
- **Filters**
  - Filter By: Discount Type, Status
- **Actions Available**
  - The Super Admin should be able to:
    - Deactivate/Reactivate
  - This story only establishes that this action is available from the listing. Its behavior is defined in its own story.

#### Acceptance Criteria

- Super Admin can access the Discount Code Listing successfully.
- All existing discount codes display correctly in the listing, with Discount Type and Value shown as separate columns.
- Clicking a Code opens that code’s View Details page.
- Search returns correct results across all fields.
- Filters return correct results for Discount Type and Status.
- Deactivate/Reactivate action is available from the listing.

#### Alternate Scenarios

- No discount codes exist: listing displays an empty state.
- Search returns no matching codes.
- Selected filters return no results.

#### Business Rules

- No specific business rules apply to this story.

#### Validation Rules / Errors

- Search:
  - Default: N/A
  - Condition: N/A
  - Error: “No matching discount codes found.”
  - Treatment: empty state message displayed in place of the listing
- Filters:
  - Default: N/A
  - Condition: N/A
  - Error: “No discount codes found for the selected filters.”
  - Treatment: empty state message displayed in place of the listing

#### Non-functional Requirements

- Discount code listing should load within an acceptable response time.
- Search and filters should update results dynamically.


### 7.7 — Generate Discount Code `NEW`

#### Requirement Statement

> _As a Super Admin, I want to generate discount codes targeted by client type, so that I can offer promotional pricing to B2C or B2B customers._

#### Story Details

- The Super Admin should be able to access “Generate Discount Code” from the Discount Code Listing page.
- **Code Details**
  - Code: alphanumeric input field **(Mandatory)**
    - Auto-generated by default (8 characters, alphanumeric)
    - The Super Admin can override with a custom code
    - Must be unique against all existing Active discount codes
  - Discount Type: dropdown **(Mandatory)**
    - Placeholder: “Select Discount Type”
    - No pre-selected default
    - Options: Percentage, Fixed Amount, Free Access
  - **Percentage** (shown when Discount Type = Percentage)
    - Value: numeric input field **(Mandatory)** (1-100%, whole numbers only)
  - **Fixed Amount** (shown when Discount Type = Fixed Amount)
    - Value: currency input field **(Mandatory)** (Minimum $0.01, 2 decimal places)
    - Maximum allowed value is dynamic: capped at the full price of the bundle it’s redeemed against
      - Since Applies To targets Client Type rather than specific bundles, and bundles of that Client Type can have different prices, the cap is enforced per bundle at the time of redemption (a fixed amount discount cannot reduce any single bundle below $0.00)
  - **Free Access** (shown when Discount Type = Free Access)
    - No additional value field required
    - Grants 100% off for a single billing cycle only; price reverts to normal on the following cycle
- **Applies To**
  - Client Type: checkboxes **(Mandatory, at least one must be selected)**: B2C, B2B
    - Selecting a Client Type covers all current and future bundles of that type
- **Usage Limit**
  - Radio button **(Mandatory)**: Unlimited / Max Redemptions / One-time Use
    - If Max Redemptions is selected:
      - Max Redemptions Count: numeric input field **(Mandatory when selected)** (Minimum 1)
- **Validity**
  - Start Date: date picker **(Mandatory)**
  - Expiry Date: date picker **(Mandatory)**
    - Must be later than Start Date
- **Draft Preview**
  - Before saving, the Super Admin is shown a preview of the configured discount code for review.
  - From the preview, the Super Admin clicks “Generate Code” to save.
- Upon saving, the discount code Status is automatically set to Active if the current date falls within the Start Date/Expiry Date window.
- If a discount is applied at checkout, it always replaces/overrides the base price entirely; it cannot stack with other discounts.

#### Acceptance Criteria

- Super Admin can access Generate Discount Code from the Discount Code Listing page.
- Code auto-generates by default and can be overridden manually.
- Duplicate codes (matching an existing Active code) are rejected.
- Discount Type, Applies To (Client Type), Usage Limit, and Validity dates must be provided before proceeding to preview.
- At least one Client Type must be selected under Applies To.
- Max Redemptions Count is only required and enforced when Usage Limit = Max Redemptions.
- Expiry Date must be later than Start Date.
- The draft preview accurately reflects all configured fields before saving.
- Discount code saves successfully upon clicking Generate Code, and is automatically Active if within its validity window.
- Free Access correctly grants 100% off for one billing cycle only, reverting afterward.
- Fixed Amount discount is correctly capped at the full price of the bundle it’s redeemed against, never producing a negative price.

#### Alternate Scenarios

- Duplicate code entered: proceeding to preview is blocked with a validation message.
- No Client Type selected under Applies To: proceeding to preview is blocked with a validation message.
- Expiry Date entered before or equal to Start Date: proceeding to preview is blocked with a validation message.
- Max Redemptions selected but count left blank: proceeding to preview is blocked with a validation message.
- Code created with a Start Date in the future: Status remains inactive until the Start Date is reached.
- Fixed Amount value entered exceeds a bundle’s price at redemption: discount is capped at that bundle’s full price at redemption.

#### Business Rules

- A discount code must apply to at least one Client Type (B2C and/or B2B).
- Discount codes always override the base price; they never stack with other discounts.
- Free Access applies for exactly one billing cycle; the price reverts to normal on the next cycle.
- Selecting a Client Type automatically includes any bundles of that type created later.
- Codes generated with a future Start Date remain inactive until that date is reached.
- A Fixed Amount discount cannot exceed the price of the bundle it is applied to at redemption. If the entered value exceeds a given bundle’s price, the discount is capped at that bundle’s full price at redemption (resulting in a final price of $0.00 for that bundle), rather than the transaction going negative.
- Discount codes do not have a Draft status; they save directly via Generate Code and are Active or inactive based on their validity window.

#### Validation Rules / Errors

- Code:
  - Default: auto-generated 8-character alphanumeric code
  - Condition: Mandatory, unique against all existing Active codes
  - Error: “This code already exists. Please choose a different code.”
  - Treatment: field highlighted in red with error message below
- Discount Type:
  - Default: N/A (blank, placeholder “Select Discount Type”)
  - Condition: Mandatory
  - Error: “Please select a discount type.”
  - Treatment: field highlighted in red with error message below
- Percentage Value:
  - Default: N/A
  - Condition: Mandatory when Discount Type = Percentage, 1-100, whole numbers only
  - Error: “Please enter a valid percentage between 1 and 100.”
  - Treatment: field highlighted in red with error message below
- Fixed Amount Value:
  - Default: N/A
  - Condition: Mandatory when Discount Type = Fixed Amount, minimum $0.01, capped dynamically at the full price of the applicable bundle at redemption
  - Error: “Please enter a valid amount.”
  - Treatment: field highlighted in red with error message below
- Applies To:
  - Default: N/A (none selected)
  - Condition: At least one Client Type must be selected
  - Error: “Please select at least one client type.”
  - Treatment: form-level error banner displayed above the Applies To section
- Max Redemptions Count:
  - Default: N/A
  - Condition: Mandatory when Usage Limit = Max Redemptions, minimum 1
  - Error: “Please enter a valid redemption limit (minimum 1).”
  - Treatment: field highlighted in red with error message below
- Expiry Date:
  - Default: N/A
  - Condition: Must be later than Start Date
  - Error: “Expiry date must be later than the start date.”
  - Treatment: field highlighted in red with error message below

#### Non-functional Requirements

- Discount code creation must save successfully within an acceptable response time.
- Code uniqueness checks must be validated server-side in addition to client-side validation.
- Discount code status transitions (based on Start/Expiry Date) must be evaluated in near real-time.


### 7.8 — View & Manage Discount Code — Detail & Status Management `NEW`

#### Requirement Statement

> _As a Super Admin, I want to view a discount code’s full details and redemption activity, and manage its status, so that I can track code performance and control which codes remain redeemable._

#### Story Details

- The Super Admin opens a discount code’s detail page by clicking its Code from Discount Code Listing.
- **Discount Code Detail Page**
  - The detail page displays all configured fields for the code:
    - Code
    - Discount Type
    - Value
    - Client Type
    - Usage Limit
    - Validity (Start Date - Expiry Date)
    - Status (Active, Expired, Deactivated)
  - **Redemption Log**
    - Organization/User
    - Date Redeemed
- **Deactivate Discount Code**
  - When a discount code is deactivated:
    - Status changes to Deactivated
    - The code can no longer be redeemed
    - Redemptions that already occurred remain unaffected
- **Reactivate Discount Code**
  - When the Super Admin attempts to reactivate a Deactivated code:
    - If the code’s Expiry Date has already passed, or Max Redemptions has already been reached:
      - The Super Admin is prompted to extend the Expiry Date and/or increase the Max Redemptions Count before reactivation can proceed
      - Reactivation is blocked until at least one of the applicable constraints (Expiry Date or Max Redemptions) is updated to a valid future/higher value
    - If neither constraint is currently exceeded:
      - Status changes back to Active immediately

#### Acceptance Criteria

- Super Admin can open a discount code’s detail page by clicking its Code from Discount Code Listing.
- Detail page displays accurate information, including the Redemption Log.
- Super Admin can deactivate an Active code successfully; already-redeemed instances remain unaffected.
- Super Admin can reactivate a Deactivated code when Expiry Date and Max Redemptions are both still valid.
- Reactivation is correctly blocked, with a prompt to extend Expiry Date/increase Max Redemptions, when either constraint has been exceeded.

#### Alternate Scenarios

- Code is already Active: Reactivate action is unavailable.
- Code is already Deactivated: Deactivate action is unavailable.
- Reactivate attempted on a code past its Expiry Date: reactivation blocked, Super Admin prompted to extend the Expiry Date.
- Reactivate attempted on a code that reached Max Redemptions: reactivation blocked, Super Admin prompted to increase the Max Redemptions Count.
- Reactivate attempted on a code both past Expiry and at Max Redemptions: Super Admin prompted to update both before reactivation proceeds.
- Status update fails temporarily.

#### Business Rules

- Reactivating a code past its Expiry Date or at its Max Redemptions limit requires the Super Admin to first extend the Expiry Date and/or increase the Max Redemptions Count.
- Deactivating a code does not retroactively affect redemptions that already occurred.
- Discount codes cannot be deleted; Deactivated codes and their Redemption Log remain permanently in the system.

#### Validation Rules / Errors

- Reactivate (Expiry Passed):
  - Default: N/A
  - Condition: Expiry Date must be in the future to reactivate
  - Error: “This code’s expiry date has passed. Please extend the expiry date to reactivate.”
  - Treatment: reactivation blocked, Expiry Date field opened for editing inline
- Reactivate (Max Redemptions Reached):
  - Default: N/A
  - Condition: Usage must be below Max Redemptions Count to reactivate
  - Error: “This code has reached its redemption limit. Please increase the limit to reactivate.”
  - Treatment: reactivation blocked, Max Redemptions Count field opened for editing inline
- Confirmation Prompts:
  - “Are you sure you want to deactivate this discount code?”
  - “Are you sure you want to reactivate this discount code?”

#### Non-functional Requirements

- Discount code detail page should load within an acceptable response time.
- Redemption Log entries should reflect near real-time as redemptions occur.
- All status changes should be logged for audit purposes.


---

## Epic 8: Commissions & Payout Management

Platform-wide oversight of partner commission activity and payouts.

### 8.1 — View Commissions & Payouts Listing `NEW`

#### Requirement Statement

> _As a Super Admin, I want to view a platform-wide listing of partner commissions and payouts, so that I can monitor commission activity and partner earnings across the platform._

#### Story Details

- The Super Admin should be able to access a Commissions & Payouts section containing a platform-wide listing of all Partners’ commission activity.
- **KPI Cards**
  - Total Commissions Generated
    - Total commission value generated across the platform, scoped to the selected Date Range filter.
  - Tiered
    - Total commission value generated by Partners on a Tiered commission structure, scoped to the selected Date Range filter.
  - Percentage-Based
    - Total commission value generated by Partners on a Percentage-Based commission structure, scoped to the selected Date Range filter.
  - Fixed
    - Total commission value generated by Partners on a Fixed commission structure, scoped to the selected Date Range filter.
- **Listing Details**
  - Each listing row represents one Partner and should display:
    - Partner Name
    - Partner Type — displays the Partner’s assigned value (e.g. University/Institution, Coach/Trainer, Influencer/Content Creator, Recruiter/Employer Partner)
    - Commission Type — displays the Partner’s assigned value (e.g. Percentage-Based, Fixed, Tiered)
    - Total Earned
- **Actions Available**
  - The Super Admin should be able to:
    - View Detail (opens the Partner’s individual commission detail page)
    - Export/Download Listing
- **Search & Filters**
  - The Super Admin should be able to:
    - Search Partners using basic free-text search
    - Filter By
- Date Range
- Commission Type
- Partner Type
    - The listing should visibly display which filter values are currently selected/applied.

#### Acceptance Criteria

- Super Admin can access the Commissions & Payouts listing successfully.
- All KPI cards display accurate totals scoped to the selected Date Range.
- Tiered, Percentage-Based, and Fixed KPI cards correctly sum only Partners assigned to that commission type.
- All Partners with commission activity display correctly in the listing.
- Listing displays one row per Partner, aggregating that Partner’s Total Earned.
- Search and filters return correctly matching results.
- Currently applied filter values are visibly displayed above/alongside the listing.
- Super Admin can open a Partner’s detail page successfully from the listing.
- Super Admin can export/download the listing successfully.

#### Alternate Scenarios

- No Partners with commission activity exist: listing displays an empty state.
- Search returns no matching Partners.
- Selected filters return no matching data.
- No data available for the selected Date Range: KPI cards display zero.
- Export/download action fails temporarily.
- Listing data fails to load temporarily.

#### Business Rules

- Listing rows aggregate all commission activity per Partner; individual invoice line items are only available on the Partner’s detail page.
- KPI cards reflect platform-wide totals across all Partners, scoped to the selected Date Range.
- Tiered/Percentage-Based/Fixed KPI cards are mutually exclusive breakdowns of Total Commissions Generated, based on each Partner’s assigned Commission Type.
- Only Partners with at least one commission record appear in the listing.

#### Validation Rules / Errors

- “No partners with commission activity found.”
- “No matching partners found.”
- “No data available for the selected filters.”
- “Unable to load commissions and payouts listing at the moment.”
- “Unable to export listing at this time. Please try again.”

#### Non-functional Requirements

- Listing and KPI data should load within an acceptable response time.
- KPI calculations should support scalable, real-time aggregation across all Partners.
- Search and filters should update the listing dynamically without a full page reload.
- Export/download should generate accurately and securely.


### 8.2 — View Commission Detail `NEW`

#### Requirement Statement

> _As a Super Admin, I want to view detailed commission information for an individual Partner, so that I can review their monthly earnings and invoice history._

#### Story Details

- The Super Admin should be able to access this page via the “View Detail” action from the Commissions & Payouts Listing.
- **Partner Profile Recap**
  - The page should display the same partner profile information as the Partner Detail Page (3.1 View & Edit Partner Listings):
    - Basic Details
- Full Name
- Email Address
- Phone Number
- Country / Region
    - Entity Details
- Entity Type — displays the Partner’s assigned value (e.g. Individual, Company)
  - Company Name (if applicable)
  - Website
- Audience Type — displays the Partner’s assigned value (e.g. Students, Professionals, Mixed)
    - Partner Configuration
- Partner Type — displays the Partner’s assigned value (e.g. University/Institution, Coach/Trainer, Influencer/Content Creator, Recruiter/Employer Partner)
- Expected User Volume
- Referral Code
    - Commission Configuration
- Assigned Commission Type — displays the Partner’s assigned value (e.g. Percentage-Based, Fixed, Tiered)
    - Partner Performance Summary
- Total Referrals
- Total Signups
- Total Conversions
- Total Earnings
- **Monthly Invoice Listing**
  - Each row represents one monthly period and should display:
    - Invoice #
    - Date
    - Amount
    - Month/Period
    - Actions
- **Filters**
  - The Super Admin should be able to filter the monthly invoice listing by:
    - Date Range
- **Actions Available**
  - The Super Admin should be able to, per row:
    - View/Download that invoice
  - The Super Admin should also be able to:
    - Bulk Download all invoices for the Partner

#### Acceptance Criteria

- Super Admin can open a Partner’s Commission Detail page successfully from the listing.
- Partner profile recap displays correctly and matches the Partner Detail Page.
- Monthly invoice listing displays all periods with correct Invoice #, Date, Amount, and Month/Period.
- Date Range filter updates the monthly invoice listing correctly.
- Super Admin can view/download an individual invoice successfully.
- Super Admin can bulk download all invoices for the Partner successfully.

#### Alternate Scenarios

- Partner has no commission/invoice history: monthly invoice listing displays an empty state.
- Selected Date Range filter returns no matching periods.
- Individual invoice download fails temporarily.
- Bulk invoice download fails temporarily.
- Detail page fails to load temporarily.

#### Business Rules

- Each row in the monthly invoice listing represents one period’s commission activity.
- This page is read-only with respect to commission rate/structure; commission configuration changes are made through the existing Edit Partner flow (3.1 View & Edit Partner Listings).
- Super Admin cannot trigger a withdrawal from this page; withdrawal initiation is a Partner-side action.

#### Validation Rules / Errors

- “No commission or invoice history found for this partner.”
- “No matching periods found for the selected date range.”
- “Unable to download invoice at this time. Please try again.”
- “Unable to download invoices at this time. Please try again.”
- “Unable to load partner commission details at the moment.”

#### Non-functional Requirements

- Detail page and invoice data should load within an acceptable response time.
- Date Range filtering should update the listing dynamically without a full page reload.
- Bulk invoice downloads should generate accurately and securely.

Partner


---

## Epic 9: Support Request Management

### 9.1 — Manage Support Requests

#### Requirement Statement

> _As a Super Admin user, I want to view and manage support requests submitted by platform users, so that I can track incoming requests, perform the necessary actions, and mark requests as resolved once completed._

#### Story Details

- The Super Admin should be able to access a Support Request Management module containing all support requests submitted through the platform.
- Requests should be displayed as a listing, with the most recently submitted requests appearing at the top.
- **Supported Requests**
  - Admin Support Request
  - Partner Support Requests
  - Employer Support Request
  - Subscription / Plan / Add-on Request
  - Revoke Consent / User Deletion Request
  - B2C Candidate Support Request
- **Request Listing Details**
  - Each request should display:
    - One-liner of request
    - Requested By (Email Address)
    - Requested At (Timestamp)
    - Status
      - Open
      - Resolved
- **Actions Available**
  - The Super Admin should be able to:
    - View Request Details
    - Mark as Resolved
    - Mark All as Resolved
    - Request Details
  - When a request is opened, the Super Admin should be able to view:
    - Request Type
    - Request Title
    - Request Description
    - Requested By (Email)
    - Requested At (Timestamp)
    - Current Status
- **Search & Filters**
  - The Super Admin should be able to:
    - Search By
      - Request Title
      - Requested By (Email)
    - Filter By
      - Request Type
      - Status
      - Open
      - Resolved
    - Sort By
      - Newest First (Default)
      - Oldest First

#### Acceptance Criteria

- Super Admin can access Support Request Management successfully.
- Requests are displayed with newest requests at the top by default.
- Request details can be viewed successfully.
- Search, filters, and sorting work correctly.
- Individual requests can be marked as resolved.
- Multiple requests can be marked as resolved using Mark All as Resolved.
- Request status updates correctly after resolution.

#### Alternate Scenarios

- No support requests exist.
- Search returns no matching requests.
- Selected filters return no results.
- Status update fails temporarily.

#### Non-functional Requirements

- Requests should load within acceptable response time.
- Status updates should reflect immediately.
- Request history should remain available after resolution.
- All request actions should be logged for audit purposes.

#### Validation Rules / Errors

- “No support requests found.”
- “No matching requests found.”
- “Request marked as resolved successfully.”
- “Unable to update request status.”
- “Unable to load request details.”
- “All requests marked as resolved successfully.”


---

## Epic 10: Notification Management

### 10.1 — Receive Notifications

#### Requirement Statement

> _As a Super Admin user, I want to receive important platform notifications, so that I can stay informed about onboarding activities, subscription requests, support requests, and platform events requiring attention._

#### Story Details

- The platform should support In-App Notifications for the Super Admin.
- The Super Admin should receive notifications for:
  - New Organization onboarded
  - New Employer onboarded
  - New Partner onboarded
  - New Support Request submitted
  - Subscription / Add-on Request submitted
  - Revoke Consent / User Deletion Request submitted
  - Subscription expiring soon
  - Organization subscription expired
- Each notification should display:
  - Notification Message
  - Timestamp
- Notifications should appear with the most recent notifications displayed first.

#### Acceptance Criteria

- Super Admin receives notifications for relevant platform events.
- Notifications display the correct message and timestamp.
- Notifications appear in reverse chronological order (newest first).
- Notifications are accessible from the notification center.

#### Alternate Scenarios

- No notifications available.
- Notification delivery delayed temporarily.

#### Non-functional Requirements

- Notifications should be generated in near real-time.
- Notification history should remain available for reference.
- Notifications should load within acceptable response time.

#### Validation Rules / Errors

- “No notifications available.”
- “Unable to load notifications.”
- “Notification delivery failed.”


---

## Epic 11: Profile Management

### 11.1 — View & Edit My Profile

#### Requirement Statement

> _As a Super Admin user, I want to view and update my profile information, so that I can keep my account details accurate and maintain access to the platform._

#### Story Details

- The Super Admin should be able to access a dedicated My Profile section.
- The profile should display the following information:
  - **Account Details**
    - Full Name (Editable)
    - Email Address (Read-only)
  - **Security**
    - Change Password option available
- The Super Admin should be able to update their name and save changes.

#### Acceptance Criteria

- Super Admin can access My Profile successfully.
- Profile details display correctly.
- Super Admin can update Full Name successfully.
- Email Address is displayed as read-only.
- Super Admin can access Change Password functionality.
- Updated information reflects successfully after save.

#### Alternate Scenarios

- Super Admin enters invalid information.
- Profile update fails temporarily.

#### Non-functional Requirements

- Profile information should load within acceptable response time (~2 seconds).
- Profile updates should reflect in near real-time.
- Sensitive account information should be securely stored.
- Profile changes should be logged for audit purposes.

#### Validation Rules / Errors

- “Full Name is required.”
- “Unable to save profile changes.”
- “Profile updated successfully.”


### 11.2 — Reset Password

#### Requirement Statement

> _As a Super Admin user, I want to reset my password if I forget it, so that I can securely regain access to my account._

#### Story Details

- The Super Admin should be able to reset their password through a simple Forgot Password flow.
- The flow should include:
  - “Forgot Password?” option on the login screen
  - Enter registered Email Address
  - System sends password reset link to email
  - Clicking the link redirects the user to the Reset Password screen
  - Super Admin sets a new password
  - Super Admin confirms the new password
  - The Super Admin can log in successfully using the updated password
- Password Rules
  - The new password must:
    - Be at least 8 characters long
  - Contain:
    - One uppercase letter
    - One lowercase letter
    - One number
    - One special character

#### Acceptance Criteria

- Super Admin can access the Forgot Password flow from the Login screen.
- Password reset email has been sent successfully.
- Reset link redirects the user to the Reset Password page.
- Password validation rules are enforced.
- Password and Confirm Password must match.
- Super Admin can log in successfully using the new password.

#### Alternate Scenarios

- Invalid/unregistered email entered.
- Expired or invalid reset link.
- Weak password entered.
- Password and Confirm Password mismatch.

#### Non-functional Requirements

- Reset links should be secure and time-bound.
- Passwords should be encrypted and securely stored.
- The password reset process should follow security best practices.

#### Validation Rules / Errors

- “Email address not found.”
- “Reset link has expired.”
- “Password does not meet security requirements.”
- “Password and Confirm Password do not match.”


### 11.3 — View Audit Logs

#### Requirement Statement

> _As a Super Admin user, I want to view activity logs related to my actions and account activity, so that I can track important actions and maintain visibility of changes performed on the platform._

#### Story Details

- The Super Admin should be able to access the Audit Logs section displaying a list of activity records.
- Each log entry should display:
  - One-line description of activity performed
  - Performed By
  - Timestamp
  - Search & Filters
- Super Admin should be able to:
  - Search logs
  - Filter logs by:
    - Date Range
    - Activity Type
    - Clear Logs
- Super Admin should be able to:
  - Remove individual log entries using “X.”
  - Clear all logs
  - Example Logs
    - “[User] onboarded ABC University and sent organization admin invitation.”
    - “[User] created competency framework version 1.3 from the default competency model.”
    - “[User] published the course ‘Interview Storytelling Fundamentals’.”
    - “[User] deactivated Partner ‘John Smith’ and disabled associated referral code.”
    - “[User] updated subscription allocation for XYZ Employer (500 Mock Interviews, 20 JDs).”

#### Acceptance Criteria

- Super Admin can access Audit Logs successfully.
- Audit logs display activity description, performed by, and timestamp.
- Search and filters update logs accordingly.
- The Super Admin can clear individual logs.
- Super Admin can clear all logs successfully.

#### Alternate Scenarios

- No logs available.
- Search/filter returns no results.
- Clear log action fails temporarily.

#### Non-functional Requirements

- Audit logs should load within acceptable response time.
- Logs should maintain chronological accuracy.
- Search and filters should update results dynamically.

#### Validation Rules / Errors

- “No audit logs found.”
- “Unable to clear audit log at the moment.”
- “Unable to load audit logs.”


---

# 2. Org / Tenant Admin

Universities, institutions, or training organizations using ProofDive for candidate readiness and interview preparation. Responsible for onboarding candidates, monitoring progress and performance, reviewing reports, and managing organizational users, subscription and access.

## Epic 1: Login Module

### 1.1 — Account Activation & Login with Email & Password

#### Requirement Statement

> _As a B2B Admin user, I want to securely activate my account and log into the platform so that I can access my Admin dashboard and begin managing my activities on the platform._

#### Story Details

- Super Admin can onboard/create an Admin account.
- Once onboarded, the Admin receives an email invitation with an activation link.
- Clicking the link redirects the Admin to the platform.
- Admin email is auto-filled and non-editable during first-time setup.
- Admin sets a password following platform password best practices:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
  - Password strength indicator displayed
  - Prevent the use of common/weak passwords
- Admin must confirm the password before proceeding.
- After successful password setup, the Admin can log in using:
  - Email
  - Password
- Admin must accept:
  - Terms & Conditions
  - Privacy Policy
- Upon successful authentication, Admin is redirected to the Admin Dashboard.

#### Acceptance Criteria

- Admin receives onboarding email successfully.
- Activation link opens the account setup screen.
- The email field is auto-populated.
- Password validation rules and strength checks are enforced.
- Password and confirm password must match.
- Terms & Conditions and Privacy Policy acceptance is mandatory.
- Successful login redirects the user to the Partner Dashboard.
- Invalid credentials display proper error messages.

#### Alternate Scenarios

- Expired or invalid activation link.
- Weak password entered.
- Password and confirm password mismatch.
- User attempts to log in with incorrect credentials.
- Terms & Conditions checkbox not selected.
- Account temporarily locked after multiple failed attempts. (3 attempts)

#### Non-functional Requirements

- Passwords must be encrypted and securely stored.
- Authentication response time should be under 3 seconds.
- The system should support secure session management.
- Activation links should expire after a configurable duration.
- The platform should follow OWASP authentication best practices.

#### Validation Rules / Errors

- “Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.”
- “Password and Confirm Password do not match.”
- “Invalid email or password.”
- “Please accept Terms & Conditions and Privacy Policy.”
- “Activation link has expired.”


### 1.2 — Forgot Password

#### Requirement Statement

> _As a B2B Admin user, I want to reset my password if I forget it, so that I can securely regain access to my account and dashboard._

#### Story Details

- The Admin can click on “Forgot Password?” from the login screen.
- Admin is prompted to enter their registered email address.
- The system validates whether the email exists.
- If valid, the system sends a secure password reset email with a time-bound reset link.
- Clicking the link redirects the Admin to the Reset Password screen.
- The Admin can create a new password following the platform's password best practices:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
  - Password strength indicator displayed
- The Admin must confirm the new password.
- Upon successful reset, the Admin can log in using the updated password.

#### Acceptance Criteria

- The Admin can access the Forgot Password flow from the login screen.
- Password reset email is triggered successfully.
- The reset link redirects the user to the secure reset password page.
- Password policy validations are enforced.
- Password and confirm password must match.
- The Admin can successfully log in with the new password after resetting.
- Expired or invalid reset links display appropriate error messages.

#### Alternate Scenarios

- Unregistered email entered.
- The reset link has expired or is invalid.
- Weak password entered.
- Password and confirm password mismatch.
- User attempts to reuse old password (if enabled by policy).

#### Non-functional Requirements

- Reset links must be encrypted and time-bound.
- The password reset process should follow OWASP security standards.
- Passwords must be securely encrypted and stored.
- Email delivery should occur within an acceptable response time.

#### Validation Rules / Errors

- “Email address not found.”
- “Reset link has expired.”
- “Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.”
- “Password and Confirm Password do not match.”
- “New password cannot match previous password.”


---

## Epic 2: Dashboard & Analytics

### 2.1 — B2B Admin Dashboard & Analytics

#### Requirement Statement

> _As a B2B Admin user, I want to view organization-wide readiness, engagement, training, and subscription analytics so that I can monitor workforce preparedness, identify competency gaps, and track platform usage against my subscription plan._

#### Story Details

- The B2B Admin Dashboard should provide high-level analytics and readiness insights through KPI cards, trend charts, and usage visualizations.
- **Total Invited Users**
  - Displays organization-wide user invitation and engagement trends.
  - **Visualization:** Multiple Bar Chart over time
  - **Metrics Included**
    - Total Invited Users
    - Active Users
    - Inactive Users
  - **Axis Details**
    - **X-Axis:** Time Period (Daily / Weekly / Monthly)
    - **Y-Axis:** Number of Users
  - **Calculation Logic**
    - Active Users: Users who logged in and/or completed at least one activity
    - Inactive Users: Invited users with no platform engagement
- **Mock Interview Performance Summary**
  - Displays mock interview activity and interview quality trends.
  - **Visualization**
    - Mixed Bar + Line Chart over time
      - Bars: Total Mock Interviews Conducted
      - Line: Average Interview Score
  - **Additional Highlights**
    - Highest Performing Areas
    - Lowest Performing Areas
  - **Axis Details**
    - **X-Axis:** Time Period (Daily / Weekly / Monthly)
    - **Left Y-Axis:** Number of Mock Interviews Conducted
    - **Right Y-Axis:** Average Interview Score (1–5)
  - **Calculation Logic:** Aggregated from all completed mock interview reports within the organization
- **Subscription Plan Overview**
  - Displays real-time subscription consumption and remaining usage against the purchased plan/bundle.
  - **Visualization:** Interactive Pie / Donut Chart
  - **Metrics Included**
    - Total Usage Limit
    - Usage Consumed
    - Remaining Usage
  - **Hover Breakdown**
    - On hover, the chart should display:
      - Module Name
      - Total Allocated Usage
      - Usage Consumed
      - Remaining Usage
      - Example:
      - Mock Interviews
        - Allocated: 1000
        - Used: 650
        - Remaining: 350
  - **Calculation Logic:** Real-time consumption tracking against configured subscription allocation
- **Organization Readiness Overview**
  - Displays overall readiness distribution across the organization.
  - **Visualization:** Stacked Bar Chart over time
  - **Metrics Included**
    - % Ready
    - % Getting There
    - % Needs Work
  - **Axis Details**
    - **X-Axis:** Time Period (Daily / Weekly / Monthly)
    - **Y-Axis:** Percentage of Users (%)
  - **Calculation Logic**
    - Based on readiness score bands:
      - Ready → 4.5–5.0
      - Getting There → 3.0–4.4
      - Needs Work → 1.0–2.9
- **Competency Gap Overview**
  - Displays organizational competency weaknesses and performance trends.
  - **Visualization:** Horizontal Bar Chart
  - **Metrics Included**
    - Lowest Performing Competencies
    - Competency-wise Average Scores
  - **Axis Details**
    - **X-Axis:** Average Competency Score (1–5)
    - **Y-Axis:** Competency Names
  - **Calculation Logic:** Derived from aggregated competency scoring across mock interviews and readiness assessments
- Filters: Date Range

#### Acceptance Criteria

- B2B Admin can access Dashboard & Analytics successfully.
- All dashboard visualizations and KPI metrics display correctly.
- Charts display correct axis labels and trend data.
- Date Range filter updates analytics dynamically.
- Subscription usage reflects real-time consumption accurately.
- Readiness and competency calculations remain consistent across dashboard views.
- Hover breakdown displays module-wise usage details correctly.

#### Primary / Positive Scenario

1. B2B Admin logs into the platform.
2. System displays Dashboard & Analytics.
3. Admin views:
  - User engagement trends
  - Mock interview performance
  - Readiness overview
  - Competency gaps
  - Subscription usage
4. Admin applies Date Range filter.
5. Dashboard updates all charts and metrics accordingly.
6. Admin hovers over the Subscription Plan chart to view the module-wise breakdown.

#### Alternate Scenarios

- No invited users available yet.
- No mock interviews completed yet.
- No competency/readiness data available.
- Subscription usage data temporarily unavailable.
- Selected date range returns no data.
- Analytics service temporarily unavailable.

#### Non-functional Requirements

- Non-Functional Requirements
- Dashboard should load within an acceptable response time.
- Analytics should support scalable organization-wide aggregation.
- Visualizations should render dynamically without a full page reload.
- Real-time usage tracking should remain accurate.
- Metrics calculations should remain consistent across reports and dashboards.

#### Validation Rules / Errors

- “No analytics data available.”
- “No interview activity found.”
- “No competency data available.”
- “Subscription usage data unavailable.”
- “No data found for selected date range.”
- “Unable to load dashboard analytics at the moment.”


---

## Epic 3: User Management

### 3.1 — View User / Candidate Listings

#### Requirement Statement

> _As a B2B Admin user, I want to view the list of users/candidates added to my organization, so that I can track their invitation status, manage access, and resend invitations when needed._

#### Story Details

- The B2B Admin should be able to access a User Management section where all invited/added users are listed.
- Each user listing should display:
  - User Name
  - Email Address
  - Status
  - Date Invited / Added
  - Last Login Date
  - Actions
  - **User Statuses**
    - **Invited**: User has been added to the platform, and the invitation email has been sent, but the user has not yet completed account setup/login.
    - **Active**: User has completed account setup and is actively using the platform (logged in and/or engaged with platform activities).
    - **Inactive**: User account exists, and setup may be completed, but the user has not shown recent platform engagement/activity for a defined period.
    - **Deactivated**: User access has been manually disabled by the B2B Admin. The user can no longer log into or access the platform until reactivated.
- **Actions Available**
  - The B2B Admin should be able to:
    - Deactivate User
    - Reactivate User
    - Resend Invitation
- **Action Behavior**
  - Deactivate User: User can no longer access the platform.
  - Reactivate User: Restores platform access for a previously deactivated user.
  - Resend Invitation: Sends a new invitation email to users who have not completed setup/login.
- **Search & Filters**
  - The B2B Admin should be able to:
  - Search users by Email Address
  - Filter users by:
    - Status
    - Date Invited / Added
    - Last Login Date

#### Acceptance Criteria

- B2B Admin can access User/Candidate Listings successfully.
- The system displays all users added under the organization.
- Each listing displays user details and current status.
- B2B Admin can deactivate an active user.
- B2B Admin can reactivate a deactivated user.
- B2B Admin can resend the invitation successfully.
- The re-sent invitation link follows the configured invitation expiry rule.
- B2B Admin can search users by email address.
- B2B Admin can filter users by status, Date Invited / Added, and Last Login Date.
- Search and filter results update the user listing correctly.

#### Alternate Scenarios

- No users have been added yet.
- Resend invitation fails temporarily.
- User status update fails temporarily.
- User is already activated, so resend invitation is not applicable.
- Search by email returns no matching user.
- Selected filters return no users.
- Filtered results fail to load temporarily.

#### Non-functional Requirements

- User listing should load within an acceptable response time of 2 seconds.
- Status updates should be reflected in near real time.
- Access changes should be securely enforced.
- User actions should be logged for audit purposes.

#### Validation Rules / Errors

- “No users found.”
- “Unable to update user status.”
- “Invitation resent successfully.”
- “Unable to resend the invitation at the moment.”
- “This action does not apply to the selected user.”
- “No matching users found.”
- “No users found for selected filters.”
- “Unable to apply filters at the moment.”


### 3.2 — Add New User / Candidate — CSV & Manual Invite

#### Requirement Statement

> _As a B2B Admin user, I want to add and invite users/candidates into the platform so that they can access ProofDive, complete onboarding, and begin their interview readiness journey._

#### Story Details

- The B2B Admin should be able to add users through two methods:
- **Bulk Upload via CSV**
  - The B2B Admin should be able to:
    - Upload a CSV file containing candidate email addresses
    - System validates uploaded emails
    - Upon clicking “Next/Add Users”:
    - Users are created in the system
    - Invitation emails are triggered automatically
- **Manual User Addition**
  - The B2B Admin should also be able to:
  - Add one or multiple email addresses manually
  - Send invitations directly from the platform
- **Invitation Flow**
  - Invited users should receive an email invitation.
  - Upon clicking the invite link:
    - User is redirected to ProofDive login/setup page
    - Email address is auto-filled
    - User sets password
    - User logs into the platform successfully
  - **Invitation Link Validity**
    - Invitation links should remain valid for 48 hours
    - After expiration, the user should no longer be able to access the setup flow using the same link
    - B2B Admin should be able to resend the invitation if required
  - After first login:
    - User begins guided onboarding flow automatically
- **Password Rules**
  - Password must:
    - Be at least 8 characters long
    - Contain:
      - One uppercase letter
      - One lowercase letter
      - One number
      - One special character

#### Acceptance Criteria

- B2B Admin can upload CSV successfully.
- System validates email addresses before processing.
- B2B Admin can manually add one or multiple users.
- Invitation emails are triggered successfully.
- Invite links redirect users to the account setup flow.
- The email field is auto-filled during setup.
- Users can set a password and log in successfully.
- Guided onboarding starts after the first login.

#### Alternate Scenarios

- Invalid email format in CSV/manual entry.
- Duplicate email already exists.
- CSV upload fails temporarily.
- The invitation email delivery is delayed temporarily.
- The invite link has expired or is invalid.
- User attempts to access the expired invitation link after 48 hours.

#### Non-functional Requirements

- Bulk uploads should support scalable processing.
- Invitation emails should be securely generated.
- Uploaded CSV processing should complete within acceptable response time.
- User invitation flow should follow secure authentication practices.

#### Validation Rules / Errors

- “Please upload a valid CSV file.”
- “Invalid email address detected.”
- “User already exists.”
- “Unable to process upload at the moment.”
- “Invitation link has expired.”
- “Please request a new invitation link.”
- “Password does not meet security requirements.”


---

## Epic 4: Payments & Subscription Management

Supersedes the original generic *Manage Billing & Subscription* story. Subscription is now driven by the Bundle catalogue and seat-count model defined by the Super Admin in Super Admin Epic 7.

### 4.1 — Manage Subscription `CONFLICT`

#### Requirement Statement

> _As a B2B Admin user, I want to view my organization’s active subscription, so that my organization has the right plan for its needs, automatically scaled to my current team size._

#### Story Details

- The B2B Admin should be able to access a dedicated Payments & Subscription section.

- **Subscription Overview** displays:

  - Active Bundle Name

  - Current Billing Cycle (the single cycle this subscription is actually on)

  - Price per Account (at the current Billing Cycle)

  - Current Account Count (read-only, pulled live from User Management)

  - Total Price (Price per Account × Current Account Count)

  - Next Billing Date

  - Included Items per account (Mock Interviews, Storyboards, Masterclass modules, as configured on the Bundle)

#### Acceptance Criteria

- B2B Admin can access the Payments & Subscription section successfully.

- Subscription Overview correctly displays the active Bundle's details, current account count, and price.

- Total Price is always correctly calculated as Price per Account × Current Account Count.

- Account count and pricing update automatically as accounts are added or removed in User Management, without requiring any action in Payments.

- A newly added account is charged in full immediately at the Bundle's current per-account price.

- No Bundle Catalog, Subscribe, or Switch action is accessible to the B2B Admin anywhere in this section.

#### Alternate Scenarios

- Organization has zero accounts: Total Price displays as the Bundle's per-account price × 0\.

#### Business Rules

- The organization's Bundle is set exclusively by the Super Admin at onboarding. The B2B Admin has no ability to select, browse, switch, or purchase a Bundle.

- Coverage is dynamically tied to the organization's current account count; price recalculates automatically as accounts are added or removed.

- A new account added mid-cycle gains access to the active Bundle immediately, and the organization is charged the full per-account price immediately (no proration).

- Billing Cycles are prepaid in full at the start of each cycle. Removing or deactivating an account mid-cycle does not reduce the current cycle's charge and does not trigger a refund; the lower Current Account Count is only reflected in the next cycle's recalculated Total Price.

#### Non-functional Requirements

- Subscription Overview should load within an acceptable response time.


### 4.2 — Billing — Payment Methods & Invoices `RE-SCOPED`

> **Re-scoped.** This story is retained for payment methods and invoice history only. Its original *Subscription Overview* section is now covered by 4.1, and *Purchase Module Add-Ons* by 4.3.

#### Requirement Statement

> _As a B2B Admin user, I want to manage my payment methods and view my invoice and payment history, so that I can keep billing details current and reconcile what my organization has been charged._

#### Story Details

- The B2B Admin should be able to access a dedicated Billing & Subscription section.
- The module should be integrated with Stripe for payment management.
- **Payment Method Management**
- The B2B Admin should be able to:
  - View saved payment method/card details
  - Add a new card
  - Remove an existing card
  - Set/update default payment method
- **Invoice & Payment History**
  - The B2B Admin should be able to:
    - View the list of invoices/payments made
    - View invoice details:
      - Invoice Number
      - Payment Date
      - Amount
      - Payment Status
    - Download invoices/receipts
- **Filters**
  - The B2B Admin should be able to filter invoices by:
  - Date Range

#### Acceptance Criteria

- B2B Admin can access the Billing & Subscription section successfully.
- Stripe-integrated payment methods display correctly.
- B2B Admin can add a new card successfully.
- B2B Admin can remove an existing card successfully.
- Invoice/payment history displays correctly.
- Date filters update invoice listing accordingly.
- B2B Admin can download invoices successfully.

#### Alternate Scenarios

- Invalid card details entered.
- Stripe payment method update fails.
- No invoices available for selected date range.
- Invoice download temporarily unavailable.
- Payment fails during checkout.

#### Non-functional Requirements

- Payment information must be securely handled via Stripe.
- Sensitive card information should not be stored directly in the platform.
- Billing data should load within acceptable response time.
- Invoice history should support scalable retrieval and filtering.
- Subscription allocations should update immediately after successful payment.

#### Validation Rules / Errors

- “Please enter valid card details.”
- “Please enter a valid quantity.”
- “Unable to add payment method at the moment.”
- “Unable to process payment at the moment.”
- “No invoices found for selected date range.”
- “Invoice download failed. Please try again.”
- “Unable to update subscription allocation. Please contact support.”


### 4.3 — Purchase Add-Ons — Org-wide Usage Top-Up `NEW`

#### Requirement Statement

> _As a B2B Admin user, I want to purchase additional Mock Interview, Storyboard, and/or Masterclass usage for every account in my organization in a single transaction, so that my team isn’t limited by their current Bundle’s included allocation._

#### Story Details

- Accessible via a “Purchase Add-Ons” action from the Payments & Subscription section.

- **Select Items**: checkbox multi-select — Mock Interview, Storyboard, Masterclass (Mandatory, minimum 1 selected)

- For each selected item, its own configuration section appears:

  - Mock Interview / Storyboard: Enter Quantity — numeric input, minimum 1 (Mandatory) — granted to each account individually

  - Masterclass: displays the full list of modules, all selected by default, each individually deselectable; at least one module must remain selected (Mandatory). Price for this item recalculates dynamically as modules are deselected: full Add-On Rate minus the proportional share of each deselected module

- **Review**: displays a line item per selected item type (Item, Quantity or selected Modules, Price per Account), Current Account Count, and a Total Price that sums (Price per Account × Current Account Count) across all selected items

- Proceeds to Stripe checkout using the organization’s saved payment method

- Upon successful completion: every account that exists in the organization at the moment of purchase immediately receives the additional quantity/module access for each purchased item, added on top of whatever they currently have from the active Bundle

#### Acceptance Criteria

- B2B Admin can access the Purchase Add-Ons flow from the Payments & Subscription section.

- At least one item type must be selected to proceed.

- Multiple item types can be selected and configured within the same transaction.

- For Mock Interview/Storyboard, quantity entry correctly requires a minimum of 1\.

- For Masterclass, module deselection correctly recalculates that item’s price on a proportional basis.

- Review correctly displays a line item per selected item type.

- Total Price is correctly calculated as the sum of (Price per Account × Current Account Count) across all selected items.

- B2B Admin can complete payment successfully via Stripe.

- Upon confirmation, every account existing in the organization at that moment receives the additional usage/modules for each purchased item immediately.

- Accounts added to the organization after this purchase do not receive any of this transaction’s add-ons.

#### Alternate Scenarios

- Admin deselects all items: action is blocked, minimum one item must remain selected.

- Admin deselects all Masterclass modules while Masterclass is selected: blocked, minimum one module must remain selected.

- Payment fails during checkout: none of the selected add-ons are applied to any account.

#### Business Rules

- Multiple item types (Mock Interview, Storyboard, Masterclass) can be purchased together in a single transaction.

- Add-on purchases use the Add-On Rate configured by the Super Admin, not the Global Rate used for Bundle composition.

- Masterclass Add-On pricing follows the same fixed per-module share model used elsewhere: the Add-On Rate is divided into fixed shares per module, and deselecting a module reduces the price by that module’s share.

- Add-on purchases apply only to accounts existing in the organization at the moment of purchase; they are a one-time top-up and do not extend to accounts added afterward.

- Add-on usage is applied immediately upon successful payment; it is not tied to or delayed by the Billing Cycle.

- Add-on purchases apply uniformly to all current accounts; there is no per-account selection or destination choice in Payments.

#### Validation Rules / Errors

- Select Items:

  - Condition: Mandatory, minimum 1

  - Error: “Please select at least one item.”

- Enter Quantity (Mock Interview/Storyboard):

  - Condition: Mandatory, minimum 1

  - Error: “Please enter a valid quantity.”

- Select Modules (Masterclass):

  - Condition: at least 1 module required

  - Error: “Please select at least one module.”

- Payment Method:

  - Error: “Please enter valid card details.”

  - Error: “Unable to process payment at the moment.”

#### Non-functional Requirements

- Payment information must be securely handled via Stripe; sensitive card information is not stored directly on the platform.

- Add-on price recalculation on quantity/module changes should feel instantaneous to the user.

- Add-on purchases should be logged for audit purposes.


---

## Epic 5: Profile & Account Management

### 5.1 — View & Edit My Profile Details

#### Requirement Statement

> _As a B2B Admin user, I want to view my organization and account details configured during onboarding and update permitted information, so that I can keep my profile information accurate while reviewing my organization setup._

#### Story Details

- The B2B Admin should be able to access a dedicated **My Profile** section.
- The profile should display the onboarding information configured by the Super Admin.
- Some fields will be editable while others will remain read-only.
- The fields and details to each section are listed below:
- **Organization Details**
  - Organization Name (Editable)
  - Organization Type (Read-only)
    - University
    - Training Center
    - Employer
  - Industry (Read-only)
  - Country (Read-only)
  - City (Read-only)
  - Region (Read-only)
- **Point of Contact Details**
  - Primary Contact Name (Editable)
  - Email Address (Read-only)
  - Phone Number (Editable)
    - Must follow a valid phone number format
    - Must contain the correct country code
  - Designation (Editable)
- **Branding Details**
  - Organization Logo (Editable)
- **Account Details**
  - Password
    - Change Password option available

#### Acceptance Criteria

- B2B Admin can access My Profile successfully.
- All onboarding-configured profile details display correctly.
- Editable fields can be updated successfully.
- Read-only fields cannot be modified.
- Phone number validation ensures:
  - Valid phone number format
  - Correct country code
- Organization logos can be updated successfully.
- B2B Admin can access the Change Password option successfully.
- Updated profile information reflects successfully after save.

#### Alternate Scenarios

- Invalid phone number entered.
- Invalid logo file uploaded.
- B2B Admin attempts to edit read-only fields.
- Save action fails temporarily.

#### Non-functional Requirements

- Profile data should load within acceptable response time - 2 seconds.
- Sensitive account information should be securely stored.
- Profile updates should reflect in near real-time.
- The system should maintain audit logs for profile updates.
- Validation checks should occur before saving updated information.

#### Validation Rules / Errors

- “Please enter a valid phone number.”
- “Phone number country code is invalid.”
- “Invalid file format.”
- “You do not have permission to edit this field.”
- “Unable to save profile changes at the moment.”


### 5.2 — Reset Password

#### Requirement Statement

> _As a B2B Admin user, I want to reset my password if I forget it, so that I can securely regain access to my account._

#### Story Details

- The B2B Admin should be able to reset their password through a simple Forgot Password flow.
- The flow should include:
  - “Forgot Password?” option on the login screen
  - Enter registered Email Address
  - System sends password reset link to email
  - Clicking the link redirects the user to the Reset Password screen
  - B2B Admin sets a new password
  - B2B Admin confirms the new password
  - The B2B Admin can log in successfully using the updated password
- Password Rules
  - The new password must:
    - Be at least 8 characters long
  - Contain:
    - One uppercase letter
    - One lowercase letter
    - One number
    - One special character

#### Acceptance Criteria

- B2B Admin can access the Forgot Password flow from the Login screen.
- Password reset email has been sent successfully.
- Reset link redirects the user to the Reset Password page.
- Password validation rules are enforced.
- Password and Confirm Password must match.
- B2B Admin can log in successfully using the new password.

#### Alternate Scenarios

- Invalid/unregistered email entered.
- Expired or invalid reset link.
- Weak password entered.
- Password and Confirm Password mismatch.

#### Non-functional Requirements

- Reset links should be secure and time-bound.
- Passwords should be encrypted and securely stored.
- The password reset process should follow security best practices.

#### Validation Rules / Errors

- “Email address not found.”
- “Reset link has expired.”
- “Password does not meet security requirements.”
- “Password and Confirm Password do not match.”


### 5.3 — Revoke Consent / Delete Account

#### Requirement Statement

> _As a B2B Admin user, I want to revoke my consent and request account deletion, so that my personal data can be removed in compliance with GDPR and privacy regulations._

#### Story Details

- The B2B Admin should be able to access a Delete Account / Revoke Consent option from Profile & Account Settings.
- The flow should allow the B2B Admin to:
  - Request account deletion
  - Revoke consent for data processing
  - View a confirmation warning before proceeding
  - Confirm deletion request
- Once confirmed:
  - The account will be marked for deletion
  - B2B Admin access will be disabled
  - Associated personal data will be deleted/anonymized as per GDPR policy
- The system should also:
  - Display a confirmation message once the request is submitted
  - Maintain audit logs for compliance purposes

#### Acceptance Criteria

- B2B Admin can access the Delete Account option successfully.
- Confirmation warning is displayed before deletion.
- The B2B Admin must explicitly confirm the deletion request.
- Account access is revoked after a successful request.
- Personal data is deleted/anonymized as per GDPR policy.
- System logs deletion request for audit/compliance tracking.

#### Alternate Scenarios

- System temporarily unable to process deletion request.
- Account already scheduled for deletion.

#### Non-functional Requirements

- Account deletion should comply with GDPR/privacy regulations.
- Sensitive user data should be securely deleted or anonymized.
- The system should maintain compliance audit logs.
- Deletion requests should be processed securely.

#### Validation Rules / Errors

- “Please confirm account deletion to proceed.”
- “Unable to process deletion request at the moment.”
- “Your account is already scheduled for deletion.”


### 5.4 — Contact Support

#### Requirement Statement

> _As a B2B Admin user, I want to contact the ProofDive support team through the platform so that I can raise issues, ask questions, or request assistance when needed._

#### Story Details

- The B2B Admin should be able to access a Contact Support option from the platform.
- The flow should include:
  - A free-text input box where the B2B Admin can describe their issue/request
  - A “Send” button to submit the support request
- The submitted message should be sent to the configured ProofDive support email
- The support request should include:
  - B2B Admin Name
  - B2B Admin Email
  - Submitted Message
  - Submission Timestamp
- After successful submission:
  - The system displays a confirmation message to the B2B Admin

#### Acceptance Criteria

- B2B Admin can access Contact Support successfully.
- The partner can enter a support message in the free text field.
- Support request is sent successfully to ProofDive support email.
- A confirmation message is displayed after successful submission.
- Empty support requests cannot be submitted.

#### Alternate Scenarios

- Empty message submitted.
- Support request fails due to a temporary system issue.
- Email service temporarily unavailable.

#### Non-functional Requirements

- Support requests should be transmitted securely.
- The submission process should be completed within an acceptable response time.
- The system should maintain logs of submitted support requests.

#### Validation Rules / Errors

- “Please enter your message before sending.”
- “Unable to send support request at the moment.”
- “Your support request has been submitted successfully.”


### 5.5 — View Audit Logs

#### Requirement Statement

> _As a B2B Admin user, I want to view activity logs related to my actions and account activity, so that I can track important actions and maintain visibility of changes performed on the platform._

#### Story Details

- The B2B Admin should be able to access the Audit Logs section displaying a list of activity records.
- Each log entry should display:
  - One-line description of activity performed
  - Performed By
  - Timestamp
  - Search & Filters
- B2B Admin should be able to:
  - Search logs
  - Filter logs by:
    - Date Range
    - Activity Type
    - Clear Logs
- B2B Admin should be able to:
  - Remove individual log entries using “X.”
  - Clear all logs
  - Example Logs
    - “[User] invited 120 users to the organization.”
    - “[User] uploaded a CSV file containing 250 candidate emails.”
    - “[User] deactivated user john.doe@example.com.”
    - “[User] purchased 500 additional Mock Interview credits.”
    - “[User] updated organization profile details.”

#### Acceptance Criteria

- B2B Admin can access Audit Logs successfully.
- Audit logs display activity description, performed by, and timestamp.
- Search and filters update logs accordingly.
- The B2B Admin can clear individual logs.
- B2B Admin can clear all logs successfully.

#### Alternate Scenarios

- No logs available.
- Search/filter returns no results.
- Clear log action fails temporarily.

#### Non-functional Requirements

- Audit logs should load within acceptable response time.
- Logs should maintain chronological accuracy.
- Search and filters should update results dynamically.

#### Validation Rules / Errors

- “No audit logs found.”
- “Unable to clear audit log at the moment.”
- “Unable to load audit logs.”


---

## Epic 6: Notification Management

### 6.1 — Receive Notifications

#### Requirement Statement

> _As a B2B Admin user, I want to receive important platform notifications, so that I can stay informed about user activity, subscription updates, and organization-related events._

#### Story Details

- The platform should support both:
  - Email Notifications
  - In-App Notifications
- The B2B Admin should receive email notifications for:
  - Account invitation/sign-up email
  - Password reset/change requests
  - Invoice/payment confirmations
  - Add-on purchase confirmations
- The B2B Admin should receive in-app notifications for:
  - New user successfully onboarded
  - Invoice generated/ready
  - Additional credits/add-ons successfully purchased
  - Subscription usage limit reached or nearing limit
- Each notification should display:
  - Notification message
  - Timestamp

#### Acceptance Criteria

- B2B Admin receives an onboarding invitation email successfully.
- B2B Admin receives password reset/change email successfully.
- In-app notifications display when:
- New user is onboarded
- Invoice is generated
- Add-on purchase is completed
- Usage limits are reached/near exhaustion
- Notifications display the correct message and timestamp.

#### Alternate Scenarios

- Notification delivery delayed temporarily.
- No notifications available.
- Email delivery service temporarily unavailable.

#### Non-functional Requirements

- Notifications should be delivered within an acceptable response time.
- Email notifications should be securely triggered through a configured email service.
- Notification timestamps should reflect accurate activity time.

#### Validation Rules / Errors

- “Unable to load notifications.”
- “Notification delivery failed.”
- “No notifications available.”


### 6.2 — Receive Terms & Policy Updates

#### Requirement Statement

> _As a B2B Admin user, I want to receive notifications regarding policy or terms updates, so that I remain compliant with platform requirements._

#### Story Details

- The platform should notify the B2B Admin whenever there are updates to:
  - Terms & Conditions
  - Privacy Policy
  - Platform Policies
- Notifications may be delivered through:
  - In-App Notifications
  - Email Notifications
- Each notification should include:
  - Update title/summary
  - Effective date
  - Link to view updated policy/terms
- The B2B Admin should be able to view and acknowledge the updated policy when required.

#### Acceptance Criteria

- The B2B Admin receives notification when terms or policies are updated.
- The notification displays the update summary and effective date.
- The B2B Admin can access/view the updated policy document.
- Email notification is triggered successfully when applicable.
- System records acknowledgement if required.

#### Alternate Scenarios

- Notification delivery delayed temporarily.
- The B2B Admin does not acknowledge the policy update immediately.
- Email notification service temporarily unavailable.

#### Non-functional Requirements

- Notifications should be delivered within an acceptable response time.
- Policy update records should be securely maintained.
- Notification timestamps should reflect the accurate update time.

#### Validation Rules / Errors

- “Unable to load policy update.”
- “Notification delivery failed.”
- “No policy updates available.”


---

# 3. Partner / Affiliate

External partners, influencers, trainers, universities, or affiliates responsible for referring users, promoting the platform, managing partner-linked candidates, tracking commissions, monitoring engagement metrics, and accessing profit-sharing and payout insights.

## Epic 1: Login Module

### 1.1 — Account Activation & Login with Email & Password

#### Requirement Statement

> _As a Partner/Affiliate user, I want to securely activate my account and log into the platform so that I can access my partner dashboard and begin managing my activities on the platform._

#### Story Details

- Super Admin can onboard/create a Partner account.
- Once onboarded, the Partner receives an email invitation with an activation link.
- Clicking the link redirects the Partner to the platform.
- Partner email is auto-filled and non-editable during first-time setup.
- Partner sets a password following platform password best practices:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
  - Password strength indicator displayed
  - Prevent the use of common/weak passwords
- Partner must confirm the password before proceeding.
- After successful password setup, the Partner can log in using:
  - Email
  - Password
- Partner must accept:
  - Terms & Conditions
  - Privacy Policy
- Upon successful authentication, Partner is redirected to the Partner Dashboard.

#### Acceptance Criteria

- Partner receives onboarding email successfully.
- Activation link opens the account setup screen.
- Email field is auto-populated.
- Password validation rules and strength checks are enforced.
- Password and confirm password must match.
- Terms & Conditions and Privacy Policy acceptance is mandatory.
- Successful login redirects the user to the Partner Dashboard.
- Invalid credentials display proper error messages.

#### Alternate Scenarios

- Expired or invalid activation link.
- Weak password entered.
- Password and confirm password mismatch.
- User attempts to log in with incorrect credentials.
- Terms & Conditions checkbox not selected.
- Account temporarily locked after multiple failed attempts.

#### Non-functional Requirements

- Passwords must be encrypted and securely stored.
- Authentication response time should be under 3 seconds.
- The system should support secure session management.
- Activation links should expire after a configurable duration.
- The platform should follow OWASP authentication best practices.

#### Validation Rules / Errors

- “Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.”
- “Password and Confirm Password do not match.”
- “Invalid email or password.”
- “Please accept Terms & Conditions and Privacy Policy.”
- “Activation link has expired.”


### 1.2 — Forgot Password

#### Requirement Statement

> _As a Partner/Affiliate user, I want to reset my password if I forget it, so that I can securely regain access to my account and dashboard._

#### Story Details

- The partner can click on “Forgot Password?” from the login screen.
- User is prompted to enter their registered email address.
- The system validates whether the email exists.
- If valid, the system sends a secure password reset email with a time-bound reset link.
- Clicking the link redirects the user to the Reset Password screen.
- The user can create a new password following the platform's password best practices:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
  - Password strength indicator displayed
- User must confirm the new password.
- Upon successful reset, the user can log in using the updated password.

#### Acceptance Criteria

- The partner can access the Forgot Password flow from the login screen.
- Password reset email is triggered successfully.
- The reset link redirects the user to the secure reset password page.
- Password policy validations are enforced.
- Password and confirm password must match.
- The partner can successfully log in with the new password after resetting.
- Expired or invalid reset links display appropriate error messages.

#### Alternate Scenarios

- Unregistered email entered.
- Reset link expired or invalid.
- Weak password entered.
- Password and confirm password mismatch.
- User attempts to reuse old password (if enabled by policy).

#### Non-functional Requirements

- Reset links must be encrypted and time-bound.
- The password reset process should follow OWASP security standards.
- Passwords must be securely encrypted and stored.
- Email delivery should occur within an acceptable response time.

#### Validation Rules / Errors

- “Email address not found.”
- “Reset link has expired.”
- “Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.”
- “Password and Confirm Password do not match.”
- “New password cannot match previous password.”


---

## Epic 2: Dashboard & Analytics

### 2.1 — Partner Dashboard & Analytics — Signups, Earnings, Referral Code, Conversion Funnel

#### Requirement Statement

> _As a Partner/Affiliate user, I want to view analytics and performance insights related to my referral activity, so that I can track engagement, conversions, earnings, and overall partner performance._

#### Story Details

- The Partner Dashboard should provide a high-level overview of referral and conversion performance through analytics widgets, summary cards, and funnel insights.
- **Dashboard Metrics**
  - Total Signups
    - Total users who registered through the partner’s referral source/link.
  - Total Earnings
    - Total commission/value earned by the partner from successful conversions.
    - Calculated based on the configured partner commission model.
  - Referral Code
    - Unique system-generated referral code assigned to the partner.
    - Copy functionality available.
  - Total Referrals
    - Total users who clicked or used the referral code.
    - Includes both converted and non-converted users.
  - Conversion Funnel
    - Visual funnel showing user journey and drop-off points.
      - **Funnel Stages:**
        - Referral Code Used
        - User Signed Up
        - User Completed Onboarding
        - User Completed Mock Interview
        - User Converted to Paid / Active User
- **Filters**
  - Apply filters such as:
    - Date range
    - Conversion status

#### Acceptance Criteria

- Partner can successfully view all dashboard summary metrics.
- The total signups count reflects users registered through the partner referral source.
- Total Earnings are calculated accurately according to the configured commission logic.
- Referral Code is displayed and can be copied successfully.
- Total Referrals count includes both converted and non-converted users.
- Funnel visualization displays all configured funnel stages correctly.
- Applying filters dynamically updates dashboard analytics and funnel data.
- Dashboard data is displayed based on the selected date range and conversion status filters.

#### Alternate Scenarios

- Partner has no referrals yet → dashboard displays empty state.
- No paid conversions available → earnings remain zero.
- Selected filters return no matching data.
- Analytics service temporarily unavailable.
- Referral code copy action fails temporarily.

#### Non-functional Requirements

- Dashboard should load within an acceptable response time.
- Analytics should support scalable data aggregation.
- Funnel calculations should remain accurate and consistent.
- Filters should refresh dashboard data without a full page reload.
- The system should support responsive dashboard views across devices.

#### Validation Rules / Errors

- “No analytics data available for selected filters.”
- “Unable to load dashboard analytics.”
- “Invalid date range selected.”
- “Referral code could not be copied. Please try again.”


---

## Epic 3: Commissions & Payout Management

Partner-facing view of earnings, invoices and withdrawals. Mirrors the Super Admin oversight view in Super Admin Epic 8.

### 3.1 — View Commissions & Payouts `NEW`

#### Requirement Statement

> _As a Partner/Affiliate user, I want to view my commission earnings and invoice history, so that I can track how much I’ve earned and what’s available to withdraw._

#### Story Details

- The Partner should be able to access a Commissions & Payouts section displaying their earnings activity.
- **KPI Cards**
  - Total Earnings
    - Lifetime commission earned from all conversions to date.
  - Available Balance
    - Total Earnings minus Total Withdrawn; amount currently available to withdraw to the Partner’s payment method.
  - Total Withdrawn
    - Lifetime sum of completed withdrawals by the Partner.
  - Last Withdrawal Date
    - Date of the Partner’s most recent completed withdrawal.
- **Monthly Invoice Listing**
  - Each row represents one monthly period and should display:
    - Invoice #
    - Date
    - Amount
    - Month/Period
    - Actions
- **Filters**
  - The Partner should be able to filter the monthly invoice listing by:
    - Date Range (defaults to Monthly on page load; Partner can also select All Time)
- **Actions Available**
  - The Partner should be able to, per row:
    - View/Download that invoice
  - The Partner should also be able to:
    - Bulk Download all invoices

#### Acceptance Criteria

- Partner can access the Commissions & Payouts Overview successfully.
- All KPI cards display accurate values reflecting the Partner’s own commission activity.
- Available Balance correctly reflects Total Earnings minus Total Withdrawn.
- Monthly invoice listing displays all periods with correct Invoice #, Date, Amount, and Month/Period.
- Overview defaults to a Monthly Date Range filter on load.
- Partner can select All Time from the Date Range filter.
- Partner can view/download an individual invoice successfully.
- Partner can bulk download all invoices successfully.

#### Alternate Scenarios

- Partner has no commission/invoice history: monthly invoice listing displays an empty state, KPI cards display zero, Last Withdrawal Date displays as not available.
- Selected Date Range filter returns no matching periods.
- Individual invoice download fails temporarily.
- Bulk invoice download fails temporarily.
- Overview fails to load temporarily.

#### Business Rules

- Each row in the monthly invoice listing represents one period’s commission activity.
- Available Balance is calculated as Total Earnings minus Total Withdrawn.
- A Partner can only view their own commission and invoice data.

#### Validation Rules / Errors

- “No commission or invoice history found.”
- “No matching periods found for the selected filters.”
- “Unable to download invoice at this time. Please try again.”
- “Unable to download invoices at this time. Please try again.”
- “Unable to load commissions and payouts at the moment.”

#### Non-functional Requirements

- Overview and invoice data should load within an acceptable response time.
- Filtering should update the listing dynamically without a full page reload.
- Bulk invoice downloads should generate accurately and securely.
- KPI calculations should remain accurate and consistent with underlying commission records.


### 3.2 — Withdraw Funds `NEW`

#### Requirement Statement

> _As a Partner/Affiliate user, I want to withdraw my available commission balance to my preferred payment method, so that I can access my earnings on my own schedule._

#### Story Details

- The Partner should be able to trigger a withdrawal from the Commissions & Payouts Overview, using their Available Balance.
- **Withdraw Form**
  - Amount
    - Alphanumeric input field **(Mandatory)**
    - Must be greater than zero and no more than the current Available Balance.
  - Payment Method
    - The Partner should be able to select an existing saved payment method (as configured in 4.3 Manage Billing & Subscription).
    - The Partner should also be able to add a new payment method directly within this flow.
    - A payment method added here is saved to the Partner’s account and reflected in 4.3 Manage Billing & Subscription, and vice versa; both draw from the same saved payment methods list.
    - All payments and withdrawals are processed through Stripe.
- **Confirmation**
  - The Partner should review the requested Amount and selected Payment Method before submitting.
  - Upon confirmation, the Partner clicks:
    - Withdraw
- **Withdrawal History**
  - A separate Withdrawal History list, distinct from the Monthly Invoice Listing, should display all completed withdrawals submitted by the Partner.
  - Each row should display:
    - Request Date
    - Amount
    - Payment Method

#### Acceptance Criteria

- Partner can access the Withdraw Funds flow successfully from the Overview.
- Partner cannot submit a withdrawal for an amount of zero or less.
- Partner cannot submit a withdrawal exceeding their current Available Balance.
- Partner can select an existing saved payment method successfully.
- Partner can add a new payment method within this flow successfully.
- A payment method added in this flow appears in 4.3 Manage Billing & Subscription.
- Upon a successful withdrawal, Available Balance is reduced immediately, Total Withdrawn increases, Last Withdrawal Date updates, and a new entry appears in Withdrawal History.
- Upon a failed withdrawal, Available Balance remains unchanged and no entry is added to Withdrawal History.

#### Alternate Scenarios

- Amount entered is zero or negative: system blocks submission.
- Amount entered exceeds Available Balance: system blocks submission.
- No saved payment method exists and Partner does not add one: system blocks submission.
- New payment method addition fails temporarily.
- Withdrawal fails at the time of processing: Partner is shown an error and Available Balance remains unchanged.
- Withdrawal History has no prior entries: displays an empty state.

#### Business Rules

- Withdrawals are processed instantly via Stripe; there is no pending/processing state.
- A withdrawal amount must be greater than zero and cannot exceed the Available Balance at the time of submission.
- Payment methods are shared between this flow and 4.3 Manage Billing & Subscription; there is only one saved payment methods list per Partner.
- Available Balance is only reduced once a withdrawal completes successfully; a failed withdrawal has no effect on Available Balance.

#### Validation Rules / Errors

- “Please enter an amount greater than zero.”
- “Requested amount exceeds your available balance.”
- “Please select or add a payment method to continue.”
- “Unable to add payment method at this time. Please try again.”
- “Unable to process withdrawal at this time. Please try again.”
- “No withdrawals found.”

#### Non-functional Requirements

- Withdrawal submission should complete within an acceptable response time.
- Available Balance and Withdrawal History should update in near real-time upon submission.
- Payment method information must be securely handled via Stripe.
- Withdrawal History should support scalable retrieval as history grows.


---

## Epic 4: Profile & Account Management

### 4.1 — View & Edit My Profile Details

#### Requirement Statement

> _As a Partner/Affiliate user, I want to view and manage my profile details, so that I can keep my personal and business information up to date and review my onboarding configuration details._

#### Story Details

- The Partner should be able to access a dedicated Profile & Account Management section where onboarding-related details are displayed.
- Some fields will be editable by the Partner, while others will remain read-only as configured by the Super Admin during onboarding.
- The details displayed are as follows:
- **Basic Details**
- Full Name (Editable)
- Email Address
- Phone Number
  - Must follow a valid phone number format
  - Must contain the correct country code as per the configured Country
- Country / Region
- **Entity Details**
- Entity Type
- Supported Values:
  - Individual
  - Company
- Company Name
- Website
- Audience Type
  - Supported Values:
    - Students
    - Professionals
    - Mixed
- **Partner Type**
  - Supported Partner Types:
    - University / Institution
    - Coach / Trainer
    - Influencer / Content Creator
    - Recruiter / Employer Partner
- **Commission Structure**
  - The configured commission structure assigned during onboarding will be displayed.
  - Supported Commission Types:
    - Percentage-Based (%)
    - Fixed
    - Tiered
- **Payout Details**
  - The configured payout details assigned during onboarding will be displayed.
  - Payout Frequency
    - Supported Values:
      - Weekly
      - Monthly
      - Quarterly
  - Payment Method
    - Default: Stripe

#### Acceptance Criteria

- Partner can access the Profile & Account Management section successfully.
- All onboarding-configured details display correctly.
- Full Name and Phone Number can be updated successfully.
- Email Address, Country/Region, Entity Details, Partner Type, Commission Structure, and Payout Details remain read-only.
- Phone Number validation ensures:
  - Valid phone number format
  - Correct country code as per the configured Country
- Supported values for Entity Type, Audience Type, Partner Type, Commission Structure, and Payout Frequency display correctly.
- The website field displays only if configured during onboarding.
- Updated editable information is reflected successfully after saving.

#### Alternate Scenarios

- Invalid phone number entered.
- Incorrect country code entered for the configured Country/Region.
- Partner attempts to edit read-only fields.
- Website value was not configured during onboarding.
- Save action fails due to a temporary system issue.

#### Non-functional Requirements

- Profile data should load within an acceptable response time.
- Sensitive account information should be securely stored.
- Profile updates should be reflected in near real time.
- The system should maintain audit logs for profile updates.
- Validation checks should occur before saving updated details.

#### Validation Rules / Errors

- “Please enter a valid phone number.”
- “Phone number country code does not match configured country/region.”
- “You do not have permission to edit this field.”
- “Unable to save profile changes at the moment.”
- “Required field cannot be left empty.”


### 4.2 — Reset Password

#### Requirement Statement

> _As a Partner/Affiliate user, I want to reset my password if I forget it, so that I can securely regain access to my account._

#### Story Details

- The Partner should be able to reset their password through a simple Forgot Password flow.
- The flow should include:
  - “Forgot Password?” option on the login screen
  - Enter registered Email Address
  - System sends password reset link to email
  - Clicking the link redirects the user to the Reset Password screen
  - Partner sets a new password
  - Partner confirms the new password
  - The partner can log in successfully using the updated password
- Password Rules
  - The new password must:
    - Be at least 8 characters long
  - Contain:
    - One uppercase letter
    - One lowercase letter
    - One number
    - One special character

#### Acceptance Criteria

- Partner can access the Forgot Password flow from the Login screen.
- Password reset email has been sent successfully.
- Reset link redirects the user to the Reset Password page.
- Password validation rules are enforced.
- Password and Confirm Password must match.
- Partner can log in successfully using the new password.

#### Alternate Scenarios

- Invalid/unregistered email entered.
- Expired or invalid reset link.
- Weak password entered.
- Password and Confirm Password mismatch.

#### Non-functional Requirements

- Reset links should be secure and time-bound.
- Passwords should be encrypted and securely stored.
- The password reset process should follow security best practices.

#### Validation Rules / Errors

- “Email address not found.”
- “Reset link has expired.”
- “Password does not meet security requirements.”
- “Password and Confirm Password do not match.”


### 4.3 — Manage Billing & Subscription

#### Requirement Statement

> _As a Partner/Affiliate user, I want to manage my billing details and view payment history, so that I can maintain my payment method and track invoices/payments associated with my subscription._

#### Story Details

- The Partner should be able to access a dedicated Billing & Subscription section.
- The module should be integrated with Stripe for payment management.
- The Partner should be able to:
- **Payment Method Management**
  - View saved payment method/card details
  - Add a new card
  - Remove an existing card
  - Set/update default payment method
- **Invoice & Payment History**
  - View the list of invoices/payments made
  - View invoice details:
    - Invoice Number
    - Payment Date
    - Amount
    - Payment Status
    - Download invoices
- **Filters**
  - The partner should be able to filter invoices by:
    - Date Range

#### Acceptance Criteria

- Partner can access the Billing & Subscription section successfully.
- Stripe-integrated payment methods display correctly.
- The partner can add a new card successfully.
- Partner can remove an existing card successfully.
- Invoice/payment history displays correctly.
- Date filters update the invoice list accordingly.
- The partner can download the invoice/receipt successfully.

#### Alternate Scenarios

- Invalid card details entered.
- Stripe payment method update fails.
- No invoices available for the selected date range.
- Invoice download temporarily unavailable.

#### Non-functional Requirements

- Payment information must be securely handled via Stripe.
- Sensitive card information should not be stored directly in the platform.
- Billing data should load within an acceptable response time.
- Invoice history should support scalable retrieval and filtering.

#### Validation Rules / Errors

- “Please enter valid card details.”
- “Unable to add payment method at the moment.”
- “No invoices found for selected date range.”
- “Invoice download failed. Please try again.”


### 4.4 — Revoke Consent / Delete Account

#### Requirement Statement

> _As a Partner/Affiliate user, I want to revoke my consent and request account deletion, so that my personal data can be removed in compliance with GDPR and privacy regulations._

#### Story Details

- The Partner should be able to access a Delete Account / Revoke Consent option from Profile & Account Settings.
- The flow should allow the Partner to:
  - Request account deletion
  - Revoke consent for data processing
  - View a confirmation warning before proceeding
  - Confirm deletion request
- Once confirmed:
  - The account will be marked for deletion
  - Partner access will be disabled
  - Associated personal data will be deleted/anonymized as per GDPR policy
- The system should also:
  - Display a confirmation message once the request is submitted
  - Maintain audit logs for compliance purposes

#### Acceptance Criteria

- Partner can access the Delete Account option successfully.
- Confirmation warning is displayed before deletion.
- The partner must explicitly confirm the deletion request.
- Account access is revoked after a successful request.
- Personal data is deleted/anonymized as per GDPR policy.
- System logs deletion request for audit/compliance tracking.

#### Alternate Scenarios

- System temporarily unable to process deletion request.
- Account already scheduled for deletion.

#### Non-functional Requirements

- Account deletion should comply with GDPR/privacy regulations.
- Sensitive user data should be securely deleted or anonymized.
- The system should maintain compliance audit logs.
- Deletion requests should be processed securely.

#### Validation Rules / Errors

- “Please confirm account deletion to proceed.”
- “Unable to process deletion request at the moment.”
- “Your account is already scheduled for deletion.”


### 4.5 — Contact Support

#### Requirement Statement

> _As a Partner/Affiliate user, I want to contact the ProofDive support team through the platform so that I can raise issues, ask questions, or request assistance when needed._

#### Story Details

- The Partner should be able to access a Contact Support option from the platform.
- The flow should include:
  - A free-text input box where the Partner can describe their issue/request
  - A “Send” button to submit the support request
- The submitted message should be sent to the configured ProofDive support email
- The support request should include:
  - Partner Name
  - Partner Email
  - Submitted Message
  - Submission Timestamp
- After successful submission:
  - The system displays a confirmation message to the Partner

#### Acceptance Criteria

- Partners can access Contact Support successfully.
- The partner can enter a support message in the free text field.
- Support request is sent successfully to ProofDive support email.
- A confirmation message is displayed after successful submission.
- Empty support requests cannot be submitted.

#### Alternate Scenarios

- Empty message submitted.
- Support request fails due to temporary system issue.
- Email service temporarily unavailable.

#### Non-functional Requirements

- Support requests should be transmitted securely.
- The submission process should be completed within an acceptable response time.
- The system should maintain logs of submitted support requests.

#### Validation Rules / Errors

- “Please enter your message before sending.”
- “Unable to send support request at the moment.”
- “Your support request has been submitted successfully.”


### 4.6 — View Audit Logs

#### Requirement Statement

> _As a Partner/Affiliate user, I want to view activity logs related to my actions and account activity, so that I can track important actions and maintain visibility of changes performed on the platform._

#### Story Details

- The Partner should be able to access an Audit Logs section displaying a list of activity records.
- Each log entry should display:
  - One-line description of activity performed
  - Performed By
  - Timestamp
  - Search & Filters
- Partner should be able to:
  - Search logs
  - Filter logs by:
    - Date Range
    - Activity Type
    - Clear Logs
- Partner should be able to:
  - Remove individual log entries using “X.”
  - Clear all logs
  - Example Logs
    - “[User] updated Pro Plan limits for ABC University.”
    - “[User] invited 120 candidates.”
    - “[User] generated interview link for Product Manager JD.”
    - “[User] accepted AI interview recording consent”
    - “[User] updated payout details.”
    - “[User] changed scoring threshold from 4.3 to 4.5.”

#### Acceptance Criteria

- Partner can access Audit Logs successfully.
- Audit logs display activity description, performed by, and timestamp.
- Search and filters update logs accordingly.
- The partner can clear individual logs.
- Partner can clear all logs successfully.

#### Alternate Scenarios

- No logs available.
- Search/filter returns no results.
- Clear log action fails temporarily.

#### Non-functional Requirements

- Audit logs should load within acceptable response time.
- Logs should maintain chronological accuracy.
- Search and filters should update results dynamically.

#### Validation Rules / Errors

- “No audit logs found.”
- “Unable to clear audit log at the moment.”
- “Unable to load audit logs.”


---

## Epic 5: Notification Management

### 5.1 — Receive Notifications

#### Requirement Statement

> _As a Partner/Affiliate user, I want to receive important platform notifications, so that I can stay informed about account activity, invoices, and referral-based onboarding updates._

#### Story Details

- The platform should support both:
  - Email Notifications
  - In-App Notifications
- The Partner should receive email notifications for:
  - Account invitation/sign-up email
  - Password reset/change requests
  - In-App Notifications
- The Partner should receive in-app notifications for:
  - Invoice generated/ready
  - New user onboarded using referral code
- Each notification should display:
  - Notification message
  - Timestamp

#### Acceptance Criteria

- Partner receives onboarding invitation email successfully.
- Partner receives password reset/change email successfully.
- In-app notifications display when:
- The invoice is generated
- New referral user signs up/onboards
- Notifications display the correct message and timestamp.

#### Alternate Scenarios

- Notification delivery delayed temporarily.
- No notifications available.
- Email delivery service temporarily unavailable.

#### Non-functional Requirements

- Notifications should be delivered within an acceptable response time.
- Email notifications should be securely triggered through a configured email service.
- Notification timestamps should reflect accurate activity time.

#### Validation Rules / Errors

- “Unable to load notifications.”
- “Notification delivery failed.”
- “No notifications available.”


### 5.2 — Receive Terms & Policy Updates

#### Requirement Statement

> _As a Partner/Affiliate user, I want to receive notifications regarding policy or terms updates, so that I remain compliant with platform requirements._

#### Story Details

- The platform should notify the Partner whenever there are updates to:
  - Terms & Conditions
  - Privacy Policy
  - Platform Policies
- Notifications may be delivered through:
  - In-App Notifications
  - Email Notifications
- Each notification should include:
  - Update title/summary
  - Effective date
  - Link to view updated policy/terms
- The Partner should be able to view and acknowledge the updated policy when required.

#### Acceptance Criteria

- The partner receives notification when terms or policies are updated.
- The notification displays the update summary and effective date.
- The partner can access/view the updated policy document.
- Email notification is triggered successfully when applicable.
- System records acknowledgement if required.

#### Alternate Scenarios

- Notification delivery delayed temporarily.
- The partner does not acknowledge the policy update immediately.
- Email notification service temporarily unavailable.

#### Non-functional Requirements

- Notifications should be delivered within an acceptable response time.
- Policy update records should be securely maintained.
- Notification timestamps should reflect the accurate update time.

#### Validation Rules / Errors

- “Unable to load policy update.”
- “Notification delivery failed.”
- “No policy updates available.”


---

# 4. Employer

Hiring organizations and recruiters leveraging ProofDive to create AI-powered interview links against specific job descriptions (JDs), distributed through their own hiring channels. Employers review candidate interview submissions, access competency-based evaluation reports, and sift candidate insights to support shortlisting decisions.

## Epic 1: Login Module

### 1.1 — Account Activation & Login with Email & Password

#### Requirement Statement

> _As an Employer user, I want to securely activate my account and log into the platform so that I can access my employer dashboard and begin managing my activities on the platform._

#### Story Details

- Super Admin can onboard/create an Employer account.
- Once onboarded, the Employer receives an email invitation with an activation link.
- Clicking the link redirects the Employer to the platform.
- Employer email is auto-filled and non-editable during first-time setup.
- Employer sets a password following platform password best practices:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
  - Password strength indicator displayed
  - Prevent the use of common/weak passwords
- Employer must confirm the password before proceeding.
- After successful password setup, the Employer can log in using:
  - Email
  - Password
- Employer must accept:
  - Terms & Conditions
  - Privacy Policy
- Upon successful authentication, the Employer is redirected to the Employer Dashboard.

#### Acceptance Criteria

- Employer receives onboarding email successfully.
- Activation link opens the account setup screen.
- The email field is auto-populated.
- Password validation rules and strength checks are enforced.
- Password and confirm password must match.
- Terms & Conditions and Privacy Policy acceptance is mandatory.
- Successful login redirects the user to the Employer Dashboard.
- Invalid credentials display proper error messages.

#### Alternate Scenarios

- Expired or invalid activation link.
- Weak password entered.
- Password and confirm password mismatch.
- User attempts to log in with incorrect credentials.
- Terms & Conditions checkbox not selected.
- Account temporarily locked after multiple failed attempts.

#### Non-functional Requirements

- Passwords must be encrypted and securely stored.
- Authentication response time should be under 3 seconds.
- The system should support secure session management.
- Activation links should expire after a configurable duration.
- The platform should follow OWASP authentication best practices.

#### Validation Rules / Errors

- “Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.”
- “Password and Confirm Password do not match.”
- “Invalid email or password.”
- “Please accept Terms & Conditions and Privacy Policy.”
- “Activation link has expired.”


### 1.2 — Forgot Password

#### Requirement Statement

> _As an Employer user, I want to reset my password if I forget it, so that I can securely regain access to my account and dashboard._

#### Story Details

- The Employer can click on “Forgot Password?” from the login screen.
- User is prompted to enter their registered email address.
- The system validates whether the email exists.
- If valid, the system sends a secure password reset email with a time-bound reset link.
- Clicking the link redirects the user to the Reset Password screen.
- The user can create a new password following the platform's password best practices:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
  - Password strength indicator displayed
- User must confirm the new password.
- Upon successful reset, the user can log in using the updated password.

#### Acceptance Criteria

- The Employer can access the Forgot Password flow from the login screen.
- Password reset email is triggered successfully.
- The reset link redirects the user to the secure reset password page.
- Password policy validations are enforced.
- Password and confirm password must match.
- The Employer can successfully log in with the new password after resetting.
- Expired or invalid reset links display appropriate error messages.

#### Alternate Scenarios

- Unregistered email entered.
- The reset link has expired or is invalid.
- Weak password entered.
- Password and confirm password mismatch.
- User attempts to reuse old password (if enabled by policy).

#### Non-functional Requirements

- Reset links must be encrypted and time-bound.
- The password reset process should follow OWASP security standards.
- Passwords must be securely encrypted and stored.
- Email delivery should occur within an acceptable response time.

#### Validation Rules / Errors

- “Email address not found.”
- “Reset link has expired.”
- “Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.”
- “Password and Confirm Password do not match.”
- “New password cannot match previous password.”


---

## Epic 2: Dashboard Module

### 2.1 — Employer Dashboard & Analytics

#### Requirement Statement

> _As an Employer user, I want to view candidate and interview analytics on my dashboard, so that I can quickly assess candidate quality, hiring readiness, and overall interview performance for my open positions._

#### Story Details

- The Employer Dashboard should provide a high-level analytics overview through summary cards, quick candidate insights, and interview performance metrics.
- **Top Summary (Hero Metrics)**
  - The dashboard should display high-level summary metrics such as:
    - Total Candidates
    - Total Interviews Conducted
    - Total Active Positions
    - Average Candidate Score
    - Global JD Filter Toggle
- Employer should be able to:
  - Filter dashboard analytics globally by Job Description / Position
- View analytics for:
  - Specific JD
  - All Positions
  - Candidate Quality Distribution
    - The dashboard should display candidate distribution based on scoring categories.
    - Scoring Criteria:
      - 4.5 – 5.0 → Ready
      - Candidate is performing at a strong level and is interview-ready.
      - 3.0 – 4.4 → Getting There
      - Candidate shows potential but requires improvement/refinement.
      - 1.0 – 2.9 → Needs Work
      - Candidate requires significant improvement in key competency areas.
- The dashboard should display:
  - % Ready
  - % Getting There
  - % Needs Work
- **Top Candidates (Quick List)**
  - The dashboard should display a quick list, with a JD toggle of top-performing candidates including:
    - Candidate Name
    - Candidate Score
    - Timestamp
- **Success Drivers Snapshot**
  - The dashboard should display average competency/success driver scores for:
    - Thinking
    - Action
    - People
    - Mastery
    - Total Interviews
- Dashboard should display:
  - Total interviews conducted within selected time range
  - Action Button – Start New Position
  - Employer should be able to click:
    - “Start New Position”
  - This action should redirect the Employer to:
    - Add New Job Description (JD)
    - Generate Interview Link flow
    - Copy Link

#### Acceptance Criteria

- Employer can access Dashboard & Analytics successfully.
- Dashboard displays all configured analytics widgets.
- JD filter updates dashboard metrics dynamically.
- Candidate Quality Distribution reflects configured scoring criteria accurately.
- Top Candidates list displays top scored candidates correctly.
- “Start New Position” redirects user to JD creation flow successfully.

#### Alternate Scenarios

- No candidate/interview data available yet.
- Selected JD has no associated interviews.
- Analytics temporarily unavailable.
- No top candidates available for selected filter.

#### Non-functional Requirements

- Dashboard should load within acceptable response time.
- Analytics should support scalable aggregation of candidate/interview data.
- Filters should update dashboard dynamically without full page reload.
- Metrics and scoring calculations should remain consistent across reports.

#### Validation Rules / Errors

- “No analytics data available.”
- “No candidates found for selected position.”
- “Unable to load dashboard analytics.”
- “Unable to start new position at the moment.”


---

## Epic 3: Interview & JD Management

### 3.1 — View JD Listings & Candidate Reports

#### Requirement Statement

> _As an Employer user, I want to manage my Job Descriptions and access candidate interview reports for each position, so that I can track applicants, review candidate performance, and control whether a position is accepting further interview submissions._

#### Story Details

- When the Employer accesses the Interview & JD Management module, the system should display a listing of all created Job Descriptions (JDs).
- **JD Listing Details**
  - Each JD listing should display:
    - JD Title
    - Timestamp of JD Posted
    - Number of Applicants
    - JD Status:
      - Active
      - Disabled
      - Enable/Disable Toggle/Button
      - Copy Interview Link (only for Active JDs)
  - The Employer should be able to open/select an individual JD listing.
- **JD Activation Management**
  - The Employer should be able to:
    - Disable a JD
    - Re-enable a previously disabled JD
- **Disable JD Behavior**
  - When a JD is disabled:
    - The associated interview link becomes inactive
    - No new candidates should be able to attempt the interview
    - Existing reports and submissions remain accessible to the Employer
    - If a candidate opens a disabled JD interview link, the system should display a message such as:
      - *“Sorry, submissions for this role have been closed.”*
- **Copy Interview Link**
  - For Active JDs:
    - Employers should be able to copy the interview link directly from the JD listing
    - The system should display confirmation once copied successfully
  - Disabled JDs should not allow interview link copying.
- **JD Detail Page**
  - When a JD listing is opened, the system should display a detailed candidate reports listing for that specific JD.
  - The listing should only include candidates who completed interviews using that JD’s interview link.
  - **Candidate Report Listing Details**
    - Each candidate row should display:
      - Candidate Name
      - Candidate Email
      - Report
      - Overall Score
      - Report Generated Timestamp
    - **Actions Available**
      - The Employer should be able to:
        - View/download individual candidate reports
        - Bulk download all reports for the selected JD as a ZIP file
      - Sort reports by Overall Score:
        - Ascending
        - Descending
      - Search candidate reports using basic free-text search

#### Acceptance Criteria

- Employers can access Interview & JD Management successfully.
- System displays a listing of created JDs.
- Each JD listing displays:
  - JD Title
  - Timestamp
  - Number of Applicants
  - JD Status
- An employer can enable/disable a JD successfully.
- Active JDs display the “Copy Interview Link” action.
- Disabled JDs do not allow interview link copying.
- Disabled JDs deactivate associated interview links.
- Candidates accessing disabled links see a closure message.
- Employer can open an individual JD successfully.
- The JD detail page displays candidate reports associated with that JD only.
- Employers can search, sort, and download reports successfully.
- Employer can bulk download reports as a ZIP file successfully.

#### Alternate Scenarios

- No JDs available.
- Selected JD has no applicants/reports.
- Search returns no results.
- Report download fails temporarily.
- ZIP generation fails temporarily.
- JD status update fails temporarily.
- Copy interview link action fails temporarily.

#### Non-functional Requirements

- JD and report listings should load within an acceptable response time.
- Search and sorting should update dynamically.
- The JD enable/disable action should reflect immediately.
- Interview links should remain securely accessible.
- Bulk ZIP downloads should generate accurately and securely.
- Reports should only be accessible to authorized Employer users.

#### Validation Rules / Errors

- “No job descriptions available.”
- “No candidate reports found for this JD.”
- “No matching candidates found.”
- “Unable to update JD status at the moment.”
- “Unable to copy interview link.”
- “Unable to download report at the moment.”
- “Unable to generate ZIP file. Please try again.”
- “Sorry, submissions for this role have been closed.”


### 3.2 — Add New JD / Generate Interview Link

#### Requirement Statement

> _As an Employer user, I want to generate a unique interview link against a Job Description, so that I can attach it to my original job posting and receive candidate interview reports directly within the platform._

#### Story Details

- The Employer should be able to create a new Job Description (JD) and generate a dedicated mock interview link for candidates.
- **JD Creation Flow**
  - When the Employer clicks:
  - “Add New JD”
  - The system should display a form requiring:
    - JD Title
    - JD Description
  - After entering the required details, the Employer should be able to click: “Generate Interview Link.”
- **Interview Link Generation**
  - Upon successful generation:
    - The system creates a unique mock interview link tied to that JD
    - System displays:
      - Generated Interview Link
      - Copy Link button
    - The Employer should be able to:
      - Copy the generated interview link
      - Add the link to the original external/internal job posting for candidate applications
- **JD Listing Creation**
  - Once the interview link is generated:
    - A new JD entry should automatically appear in the JD Listings module
    - The JD listing should include:
      - JD Title
      - Timestamp of JD Creation
      - Number of Applicants
      - JD Status
      - Copy Interview Link action
  - The Employer should also be able to:
    - Open the JD detail page
    - View reports of all candidates who completed interviews using that JD’s interview link

#### Acceptance Criteria

- The employer can access the Add New JD flow successfully.
- The employer can enter the JD Title and JD Description.
- The system generates a unique interview link successfully.
- Copy Link functionality works successfully.
- The newly created JD appears automatically in JD Listings.
- The employer can open the JD detail page successfully.
- Candidate reports populate against the corresponding JD once interviews are completed.

#### Alternate Scenarios

- Required JD details are missing.
- Interview link generation fails temporarily.
- Copy link action fails temporarily.
- JD listing creation fails temporarily.

#### Non-functional Requirements

- Interview link generation should complete within an acceptable response time.
- Generated interview links should be unique and securely accessible.
- JD creation and listing updates should reflect in near real-time.
- Only authorized Employer users should be able to access JD reports.

#### Validation Rules / Errors

- “JD Title is required.”
- “JD Description is required.”
- “Unable to generate interview link at the moment.”
- “Unable to copy interview link.”
- “Unable to create JD listing. Please try again.”


---

## Epic 4: Profile & Account Management

### 4.1 — View & Edit Profile Details

#### Requirement Statement

> _As an Employer user, I want to view my organization and account details configured during onboarding and update permitted information, so that I can keep my profile information accurate while reviewing my configured employer setup._

#### Story Details

- The Employer should be able to access a dedicated **My Profile** section from the platform.
- The profile should display the onboarding information configured by the Super Admin.
- Some fields will be editable while others will remain read-only.
- **Employer & Company Details**
  - Employer Name (Editable)
  - Company Name (Read-only)
  - Company Logo (Editable)
  - Website (Editable - valid URL format)
  - Industry (Read-only)
  - Company Size (Read-only)
- **Contact & Location Details**
  - Contact Person Name (Editable)
  - Designation (Editable)
  - Email Address (Read-only)
  - Phone Number (Editable)
    - Must follow a valid phone number format
    - Must contain the correct country code as per the configured Country
  - Country (Read-only)
  - Region / City (Editable)
- **Employer Configuration Details**
  - Employer Type (Read-only)
    - Startup
    - Enterprise
    - Recruitment Agency
    - Consultancy
    - SMB
  - Hiring For Industry (Read-only)
  - Expected Hiring Volume (Read-only)
  - Platform Usage Intent (Read-only)
    - Employer Screening
    - Candidate Assessment
    - Hiring
- **Admin Account Details**
  - Employer Admin Name (Editable)
  - Admin Email (Read-only)
  - Password
    - Change Password option available
- **Subscription Details**
  - Assigned Bundle / Plan (Read-only)
    - Request the Add-on option available
  - Enabled Modules (Read-only)
  - Usage Limits (Read-only)

#### Acceptance Criteria

- The employer can access My Profile successfully.
- All onboarding-configured profile details display correctly.
- Editable fields can be updated successfully.
- Read-only fields cannot be modified.
- Website field validates proper URL format.
- Phone number validation ensures:
- Valid phone number format
- Correct country code as per the configured Country
- The employer can access the Change Password option successfully.
- The employer can request add-ons against the current subscription plan.

#### Alternate Scenarios

- Invalid phone number entered.
- Invalid website URL entered.
- Employer attempts to edit read-only fields.
- Save action fails temporarily.
- Add-on request submission fails temporarily.

#### Non-functional Requirements

- Profile data should load within an acceptable response time.
- Sensitive account information should be securely stored.
- Profile updates should be reflected in near real time.
- The system should maintain audit logs for profile updates.
- Validation checks should occur before saving updated information.

#### Validation Rules / Errors

- “Please enter a valid phone number.”
- “Phone number country code does not match configured country.”
- “Please enter a valid website URL.”
- “You do not have permission to edit this field.”
- “Unable to save profile changes at the moment.”
- “Unable to submit add-on request at the moment.”


### 4.2 — Reset Password

#### Requirement Statement

> _As an Employer user, I want to reset my password if I forget it, so that I can securely regain access to my account._

#### Story Details

- The Employer should be able to reset their password through a simple Forgot Password flow.
- The flow should include:
  - “Forgot Password?” option on the login screen
  - Enter registered Email Address
  - System sends password reset link to email
  - Clicking the link redirects the user to the Reset Password screen
  - Employer sets a new password
  - Employer confirms the new password
  - The Employer can log in successfully using the updated password
- Password Rules
  - The new password must:
    - Be at least 8 characters long
  - Contain:
    - One uppercase letter
    - One lowercase letter
    - One number
    - One special character

#### Acceptance Criteria

- The employer can access the Forgot Password flow from the Login screen.
- Password reset email has been sent successfully.
- Reset link redirects the user to the Reset Password page.
- Password validation rules are enforced.
- Password and Confirm Password must match.
- The employer can log in successfully using the new password.

#### Alternate Scenarios

- Invalid/unregistered email entered.
- Expired or invalid reset link.
- Weak password entered.
- Password and Confirm Password mismatch.

#### Non-functional Requirements

- Reset links should be secure and time-bound.
- Passwords should be encrypted and securely stored.
- The password reset process should follow security best practices.

#### Validation Rules / Errors

- “Email address not found.”
- “Reset link has expired.”
- “Password does not meet security requirements.”
- “Password and Confirm Password do not match.”


### 4.3 — Manage Billing & Subscription `CONFLICT`

#### Requirement Statement

> _As an Employer user, I want to manage my billing details, payment methods, invoices, and purchase additional interviews, so that I can maintain my subscription and continue conducting candidate interviews without interruption._

#### Story Details

- **Payment Method Management**
  - The Employer should be able to:
    - View saved payment method/card details
    - Add a new card
    - Remove an existing card
    - Set/update default payment method
- **Invoice & Payment History**
  - The Employer should be able to:
    - View the list of invoices/payments made
    - View invoice details:
      - Invoice Number
      - Payment Date
      - Amount
      - Payment Status
      - Download invoices/receipts
- **Filters**
  - The Employer should be able to filter invoices by:
    - Date Range
- **Purchase Additional Interviews (Add-Ons)**
  - The Employer should be able to purchase additional interview credits/add-ons.
  - The flow should include:
    - Enter the number of interviews to purchase
    - The system dynamically calculates the total amount based on per-interview pricing configured by the Super Admin
    - Employer clicks “Next” to proceed
    - Employer completes payment through Stripe
    - Purchased interview credits are added to the Employer account upon successful payment

#### Acceptance Criteria

- The employer can access the Billing & Subscription section successfully.
- Stripe-integrated payment methods display correctly.
- Employers can add/remove/update payment methods successfully.
- Invoice/payment history displays correctly.
- Date filters update the invoice listing accordingly.
- The employer can download invoices successfully.
- The system dynamically calculates the add-on amount based on configured interview pricing.
- The employer can complete the add-on purchase successfully.
- Purchased interview credits reflect successfully after payment.

#### Alternate Scenarios

- Invalid card details entered.
- Stripe payment fails.
- No invoices available for the selected date range.
- Invoice download temporarily unavailable.
- Invalid interview quantity entered.
- Payment succeeds, but the credits update is delayed temporarily.

#### Non-functional Requirements

- Payment information must be securely handled via Stripe.
- Sensitive card information should not be stored directly in the platform.
- Billing data should load within an acceptable response time.
- Invoice history should support scalable retrieval and filtering.
- Dynamic pricing calculations should reflect configured pricing accurately.

#### Validation Rules / Errors

- “Please enter valid card details.”
- “Please enter a valid number of interviews.”
- “Unable to process payment at the moment.”
- “Unable to add payment method at the moment.”
- “No invoices found for selected date range.”
- “Invoice download failed. Please try again.”


### 4.4 — Revoke Consent / Delete Account

#### Requirement Statement

> _As an Employer user, I want to revoke my consent and request account deletion, so that my personal data can be removed in compliance with GDPR and privacy regulations._

#### Story Details

- The Employer should be able to access a Delete Account / Revoke Consent option from Profile & Account Settings.
- The flow should allow the Employer to:
  - Request account deletion
  - Revoke consent for data processing
  - View a confirmation warning before proceeding
  - Confirm deletion request
- Once confirmed:
  - The account will be marked for deletion
  - Employer access will be disabled
  - Associated personal data will be deleted/anonymized as per GDPR policy
- The system should also:
  - Display a confirmation message once the request is submitted
  - Maintain audit logs for compliance purposes

#### Acceptance Criteria

- The employer can access the Delete Account option successfully.
- Confirmation warning is displayed before deletion.
- The Employer must explicitly confirm the deletion request.
- Account access is revoked after a successful request.
- Personal data is deleted/anonymized as per GDPR policy.
- System logs deletion request for audit/compliance tracking.

#### Alternate Scenarios

- System temporarily unable to process deletion request.
- Account already scheduled for deletion.

#### Non-functional Requirements

- Account deletion should comply with GDPR/privacy regulations.
- Sensitive user data should be securely deleted or anonymized.
- The system should maintain compliance audit logs.
- Deletion requests should be processed securely.

#### Validation Rules / Errors

- “Please confirm account deletion to proceed.”
- “Unable to process deletion request at the moment.”
- “Your account is already scheduled for deletion.”


### 4.5 — Contact Support

#### Requirement Statement

> _As an Employer user, I want to contact the ProofDive support team through the platform so that I can raise issues, ask questions, or request assistance when needed._

#### Story Details

- The Employer should be able to access a Contact Support option from the platform.
- The flow should include:
  - A free-text input box where the Employer can describe their issue/request
  - A “Send” button to submit the support request
- The submitted message should be sent to the configured ProofDive support email
- The support request should include:
  - Employer Name
  - Employer Email
  - Submitted Message
  - Submission Timestamp
- After successful submission:
  - The system displays a confirmation message to the Employer

#### Acceptance Criteria

- The Employer can access Contact Support successfully.
- The Employer can enter a support message in the free text field.
- Support request is sent successfully to ProofDive support email.
- Confirmation message is displayed after successful submission.
- Empty support requests cannot be submitted.

#### Alternate Scenarios

- Empty message submitted.
- Support request fails due to a temporary system issue.
- Email service temporarily unavailable.

#### Non-functional Requirements

- Support requests should be transmitted securely.
- The submission process should be completed within an acceptable response time.
- The system should maintain logs of submitted support requests.

#### Validation Rules / Errors

- “Please enter your message before sending.”
- “Unable to send support request at the moment.”
- “Your support request has been submitted successfully.”


### 4.6 — View Audit Logs

#### Requirement Statement

> _As an Employer user, I want to view activity logs related to my actions and account activity, so that I can track important actions and maintain visibility of changes performed on the platform._

#### Story Details

- The Employer should be able to access an Audit Logs section displaying a list of activity records.
- Each log entry should display:
  - One-line description of activity performed
  - Performed By
  - Timestamp
  - Search & Filters
- Employers should be able to:
  - Search logs
  - Filter logs by:
    - Date Range
    - Activity Type
    - Clear Logs
- Employers should be able to:
  - Remove individual log entries using “X.”
  - Clear all logs
  - Example Logs
    - “[User] created a new JD for Senior Product Manager.”
    - “[User] generated interview link for Software Engineer JD.”
    - “[User] copied interview link for Marketing Associate JD.”
    - “[User] disabled interview submissions for Product Designer JD.”
    - “[User] re-enabled interview submissions for Data Analyst JD.”
    - “[User] downloaded candidate report for John Doe.”
    - “[User] bulk downloaded candidate reports for Business Analyst JD.”
    - “[User] purchased 50 additional interview credits.”

#### Acceptance Criteria

- The Employer can access Audit Logs successfully.
- Audit logs display activity description, performed by, and timestamp.
- Search and filters update logs accordingly.
- The Employer can clear individual logs.
- The Employer can clear all logs successfully.

#### Alternate Scenarios

- No logs available.
- Search/filter returns no results.
- Clear log action fails temporarily.

#### Non-functional Requirements

- Audit logs should load within an acceptable response time.
- Logs should maintain chronological accuracy.
- Search and filters should update results dynamically.

#### Validation Rules / Errors

- “No audit logs found.”
- “Unable to clear audit log at the moment.”
- “Unable to load audit logs.”


---

## Epic 5: Notifications Module

### 5.1 — Receive Notifications

#### Requirement Statement

> _As an Employer user, I want to receive important platform notifications so that I can stay informed about candidate activity, billing updates, and platform-related actions._

#### Story Details

- The platform should support:
  - In-App Notifications
  - Email Notifications
  - Email Notifications
- The Employer should receive email notifications for:
  - Account invitation/sign-up
  - Password reset/change requests
  - Invoice/payment confirmations
  - Add-on purchase confirmations
  - In-App Notifications
  - Terms and conditions or policy updates
- The Employer should receive in-app notifications for:
  - New candidate interview submission
  - New candidate report generated
  - Invoice generated/ready
  - Additional interview credits successfully added
  - Subscription/add-on updates
- Each notification should display:
  - Notification message
  - Timestamp

#### Acceptance Criteria

- Employer receives email notifications successfully for account and billing-related actions.
- Employer receives in-app notifications for candidate and subscription activities.
- Notifications display the correct message and timestamp.
- New notifications appear in real-time or near real-time.

#### Alternate Scenarios

- Notification delivery delayed temporarily.
- No notifications available.
- Email service temporarily unavailable.

#### Non-functional Requirements

- Notifications should be delivered within an acceptable response time.
- Email notifications should be securely triggered through a configured email service.
- Notification timestamps should reflect accurate activity time.
- The notification system should support scalable delivery handling.

#### Validation Rules / Errors

- “Unable to load notifications.”
- “Notification delivery failed.”
- “No notifications available.”


### 5.2 — Receive Terms & Policy Updates

#### Requirement Statement

> _As an Employer user, I want to receive notifications regarding policy or terms updates, so that I remain compliant with platform requirements._

#### Story Details

- The platform should notify the Employer whenever there are updates to:
  - Terms & Conditions
  - Privacy Policy
  - Platform Policies
- Notifications may be delivered through:
  - In-App Notifications
  - Email Notifications
- Each notification should include:
  - Update title/summary
  - Effective date
  - Link to view updated policy/terms
- The Employer should be able to view and acknowledge the updated policy when required.

#### Acceptance Criteria

- The Employer receives notification when terms or policies are updated.
- The notification displays the update summary and effective date.
- The Employer can access/view the updated policy document.
- Email notification is triggered successfully when applicable.
- System records acknowledgement if required.

#### Alternate Scenarios

- Notification delivery delayed temporarily.
- The Employer does not acknowledge the policy update immediately.
- Email notification service temporarily unavailable.

#### Non-functional Requirements

- Notifications should be delivered within an acceptable response time.
- Policy update records should be securely maintained.
- Notification timestamps should reflect the accurate update time.

#### Validation Rules / Errors

- “Unable to load policy update.”
- “Notification delivery failed.”
- “No policy updates available.”


---

# 5. Candidate

Individual users preparing for interviews and career opportunities through AI-driven storyboarding, competency mapping, mock interviews, AI coaching, readiness scoring, personalised learning journeys by role, progress tracking, and performance improvement recommendations. Candidates may join independently (B2C) or via institutions, employers or partners (B2B).

## Epic 1: Login Module

### 1.1 — Candidate Sign In

#### Requirement Statement

> _As a Candidate, I want to securely sign into ProofDive using email/password or social authentication providers so that I can access the platform._

#### Story Details

- **Sign In Methods**
  - The platform shall support the following authentication methods:
    - Email & Password login
    - Continue with Google
    - Continue with LinkedIn
- **Login Form Fields**
  - The sign-in form shall include:
    - Social Logins
      - Gmail
      - Linkedin
    - Email field
    - Password field
    - Sign In CTA button
    - Forgot Password link
    - Sign Up redirect link
- **Authentication**
  - The platform shall:
    - Validate email format (example@domain.com)
    - Validate the required password against the email
  - Authenticate credentials securely
  - Support Google and LinkedIn OAuth login
  - Create a secure session upon successful login
- **Redirects**
  - Upon successful login:
    - Existing users shall be redirected to Dashboard/Home
    - New social login users may be redirected to onboarding/profile setup
    - The platform shall also support:
      - Forgot Password flow
      - Sign Up flow

#### Acceptance Criteria

- **Email Login Success:** Given a registered candidate enters valid credentials when they click “Sign In,” then the system shall authenticate the user and redirect them to the dashboard.
- **Invalid Credentials:** Given a candidate enters incorrect credentials when they attempt to log in, then the system shall display an appropriate authentication error message.
- **Required Field Validation:** Given that the email or password field is empty when the user attempts to log in, validation errors shall appear against the required fields.
- **Google Login:** Given a candidate selects “Continue with Google”, when authentication succeeds, then the user shall be successfully logged in to the platform.
- **LinkedIn Login:** Given a candidate selects “Continue with LinkedIn”, when authentication succeeds, then the user shall be successfully logged in to the platform.
- **Forgot Password Navigation:** Given the candidate clicks “Forgot password?”, when the action is triggered, then the system shall redirect the user to the password recovery flow.
- **Sign Up Navigation:** Given the candidate clicks “Sign up,” when the action is triggered, then the system shall redirect the user to the registration flow.

#### Alternate Scenarios

- **Incorrect Password**
  - Candidate enters incorrect password
  - Candidate clicks Sign In
  - System rejects authentication
  - An error message is displayed
- **Invalid Email Format**
  - Candidate enters an improperly formatted email
  - Candidate attempts to log in
  - System validates email format
  - Validation error is displayed
- **OAuth Failure**
  - Candidate initiates Google/LinkedIn login
  - OAuth provider fails or is canceled
  - The system displays an authentication failure message
  - Candidate remains on the login screen

#### Non-functional Requirements

- Authentication responses should complete within acceptable response thresholds
- Passwords must be securely encrypted and never stored in plain text
- OAuth authentication shall follow provider security best practices
- Session tokens must be securely managed
- The platform shall support a responsive login experience across devices
- The login system shall support scalability for concurrent authentication requests

#### Validation Rules / Errors

- The email field is mandatory
  - Error Message: “Email is required”
- Email must follow a valid email format
  - Accepted Format: example@domain.com
  - Error Message: “Please enter a valid email address.”
- The password field is mandatory
  - Error Message: “Password is required”
- Social authentication failure/cancellation
  - Error Message: “Unable to authenticate. Please try again.”
- Session expired during the authentication flow
  - Error Message: “Your session has expired. Please sign in again.”


### 1.2 — Candidate Sign Up

#### Requirement Statement

> _As a Candidate, I want to create a ProofDive account using email/password or social authentication so that I can begin my journey on the platform._

#### Story Details

- **Sign Up Methods**
  - The platform shall support:
    - Email & Password registration
    - Continue with Google
    - Continue with LinkedIn
- **Sign Up Form**
  - The registration screen shall include:
    - Google sign-up button
    - LinkedIn sign-up button
    - Email field
    - Password field
    - Create Account button
    - Login redirect link
- **Registration Validation**
  - The platform shall:
    - Validate email format (example@domain.com)
    - Validate password requirements
    - Prevent duplicate account registration using the same email
    - Authenticate and create accounts securely
    - Password requirements:
      - Minimum 8 characters
      - At least 1 uppercase letter
      - At least 1 lowercase letter
      - At least 1 number
      - At least 1 special character
- **Social Authentication**
  - The platform shall support:
    - Google OAuth sign-up
    - LinkedIn OAuth sign-up
  - Upon successful authentication:
    - New users shall be redirected to onboarding/profile setup
    - Existing users attempting to sign up may be redirected to the login/dashboard
- **Session Management**
  - Upon successful account creation:
    - A secure, authenticated session shall be created
    - User shall remain logged in based on platform session policies

#### Acceptance Criteria

- **Email Login Success:** Given a registered candidate enters valid credentials when they click “Sign In,” then the system shall authenticate the user and redirect them to the dashboard.
- **Invalid Credentials:** Given a candidate enters incorrect credentials when they attempt to log in, then the system shall display an appropriate authentication error message.
- **Required Field Validation:** Given that the email or password field is empty when the user attempts to log in, then validation errors shall appear against the required fields.
- **Google Login:** Given a candidate selects “Continue with Google”, when authentication succeeds, then the user shall be successfully logged in to the platform.
- **LinkedIn Login:** Given a candidate selects “Continue with LinkedIn”, when authentication succeeds, then the user shall be successfully logged in to the platform.
- **Forgot Password Navigation:** Given the candidate clicks “Forgot password?”, when the action is triggered, then the system shall redirect the user to the password recovery flow.
- **Sign Up Navigation:** Given the candidate clicks “Sign up”, when the action is triggered, then the system shall redirect the user to the registration flow.

#### Alternate Scenarios

- **Incorrect Password**
  - Candidate enters incorrect password
  - Candidate clicks Sign In
  - System rejects authentication
  - An error message is displayed
- **Invalid Email Format**
  - Candidate enters an improperly formatted email
  - Candidate attempts to log in
  - System validates email format
  - Validation error is displayed
- **OAuth Failure**
  - Candidate initiates Google/LinkedIn login
  - OAuth provider fails or is canceled
  - The system displays an authentication failure message
  - Candidate remains on the login screen

#### Non-functional Requirements

- Authentication responses should complete within acceptable response thresholds
- Passwords must be securely encrypted and never stored in plain text
- OAuth authentication shall follow provider security best practices
- Session tokens must be securely managed
- The platform shall support a responsive login experience across devices
- The login system shall support scalability for concurrent authentication requests

#### Validation Rules / Errors

- The email field is mandatory
  - Error Message: “Email is required”
- Email must follow a valid email format
  - Accepted Format: example@domain.com
  - Error Message: “Please enter a valid email address.”
- The password field is mandatory
  - Error Message: “Password is required”
- Social authentication failure/cancellation
  - Error Message: “Unable to authenticate. Please try again.”
- Session expired during the authentication flow
  - Error Message: “Your session has expired. Please sign in again.”


### 1.3 — Social Sign Up — Google & LinkedIn `NEW`

#### Requirement Statement

> _As a Candidate, I want to create a ProofDive account using my Google or LinkedIn credentials, so that I can begin my journey on the platform without creating a separate password._

#### Story Details

- Continue with Google button: always visible on the Sign Up screen.
- Continue with LinkedIn button: always visible on the Sign Up screen.
- Provider Consent Screen: Candidate is redirected to the selected provider’s own consent screen to authorize access to their profile.
- **Data Retrieved from Provider**
  - Email Address **(Mandatory)**, auto-populated, not editable by the Candidate at signup.
  - Full Name **(Mandatory)**, auto-populated, not editable by the Candidate at signup.
- New Account Creation: If no ProofDive account exists for the retrieved email, the platform shall create a new Candidate account using the retrieved Email Address and Full Name, with no password set.
- **Terms & Conditions / Privacy Policy Consent Screen**
  - Shown to the Candidate immediately after successful Google or LinkedIn authentication, only when a new account is being created.
  - Not shown when linking to an existing account, since consent was already captured at that account’s original signup.
  - Candidate must accept Terms & Conditions and Privacy Policy **(Mandatory)** before proceeding to the Guided Candidate Onboarding Journey.
  - Candidate is blocked from proceeding until consent is given.
- **Existing Password Account Match**
  - If the retrieved email matches an existing email/password Candidate account, the platform shall prompt the Candidate to enter their existing password before linking the Google or LinkedIn account to that account.
  - Password Verification Field: password input field **(Mandatory when this scenario is triggered)**.
- Existing Social Account Match (Other Provider): If the retrieved email matches an existing Candidate account created via the other social provider (Google or LinkedIn), the platform shall automatically link the new provider to that account without requiring additional verification.
- Session Management: Upon successful account creation or linking, a secure, authenticated session shall be created.
- **Redirects**
  - New accounts: Terms & Conditions/Privacy Policy consent screen, then redirected to the Guided Candidate Onboarding Journey.
  - Linked existing accounts: redirected based on onboarding completion status (Dashboard/Home if onboarding already completed); no consent screen shown.

#### Acceptance Criteria

- Given a new Candidate selects Continue with Google or Continue with LinkedIn, when the provider consent is granted, then a new ProofDive account is created using the retrieved email and full name.
- Given a new social signup account is created, when authentication succeeds, then the Candidate is shown the Terms & Conditions/Privacy Policy consent screen before being redirected to onboarding.
- Given the Candidate does not accept the Terms & Conditions/Privacy Policy, when they attempt to proceed, then they are blocked from continuing to onboarding.
- Given the retrieved email matches an existing email/password account, when the Candidate enters the correct password, then the Google or LinkedIn account is linked to the existing account, the Candidate is logged in, and no consent screen is shown.
- Given the retrieved email matches an existing email/password account, when the Candidate enters an incorrect password, then the account is not linked and an error message is displayed.
- Given the retrieved email matches an existing account created via the other social provider, when authentication succeeds, then the new provider is automatically linked without additional verification, the Candidate is logged in, and no consent screen is shown.
- Given the Candidate cancels or denies consent on the provider’s screen, when they return to ProofDive, then no account is created and the Candidate remains on the Sign Up screen.

#### Alternate Scenarios

- Provider Consent Denied: Candidate cancels or denies consent on the Google or LinkedIn consent screen, the system displays an authentication failure message and the Candidate remains on the Sign Up screen.
- OAuth Provider Failure: The Google or LinkedIn service is unavailable or times out during authentication, the system displays an authentication failure message.
- Incorrect Password During Linking: Candidate enters an incorrect password when prompted to link an existing email/password account, the system displays an error and the accounts remain unlinked.
- Consent Declined: Candidate declines to accept the Terms & Conditions/Privacy Policy on the consent screen, the Candidate cannot proceed to onboarding and remains on the consent screen.
- Duplicate Attempt: Candidate already has a fully linked Google or LinkedIn account and attempts to sign up again with the same provider, the system redirects them to Sign In instead of creating a duplicate account.

#### Business Rules

- Only Email Address and Full Name are retrieved from Google or LinkedIn at signup. No additional profile data is requested or stored.
- A Candidate account is uniquely identified by email address across all authentication methods (email/password, Google, LinkedIn).
- Linking to an existing email/password account requires password verification, since the platform cannot independently confirm ownership of a self-registered email.
- Linking to an existing account created via the other social provider does not require additional verification, since both Google and LinkedIn assert a verified email address for the Candidate.
- No password is set on an account created purely via social signup unless the Candidate later sets one.
- Terms & Conditions/Privacy Policy consent is required once, at the point of new account creation, regardless of signup method (email/password or social). It is never required again at sign-in.

#### Validation Rules / Errors

- Password Verification Field (shown only when the retrieved email matches an existing email/password account):
  - Default: N/A
  - Condition: Entered password must match the password on file for the existing account
  - Error: “Incorrect password. Please try again.”
  - Treatment: Field highlighted in red with error message displayed below
- Social authentication failure/cancellation:
  - Default: N/A
  - Condition: Provider consent denied, cancelled, or provider authentication fails
  - Error: “Unable to authenticate. Please try again.”
  - Treatment: Error message displayed on the Sign Up screen; Candidate remains on the Sign Up screen
- Session expired during the authentication flow:
  - Default: N/A
  - Condition: Session expires mid-flow before authentication completes
  - Error: “Your session has expired. Please sign in again.”
  - Treatment: Candidate redirected to Sign Up/Sign In screen
- Terms & Conditions/Privacy Policy Consent:
  - Default: Unchecked/not accepted
  - Condition: Candidate must accept before proceeding
  - Error: “Please accept the Terms & Conditions and Privacy Policy to continue.”
  - Treatment: Candidate remains on the consent screen; Continue action disabled until accepted

#### Non-functional Requirements

- OAuth authentication responses should complete within acceptable response thresholds, consistent with the existing Sign In/Sign Up flows.
- OAuth authentication shall follow Google and LinkedIn OAuth/OIDC security best practices.
- Session tokens must be securely managed.
- Password verification during account linking must occur over a secure, encrypted channel.


### 1.4 — Social Sign In — Google & LinkedIn `NEW`

#### Requirement Statement

> _As a Candidate, I want to sign into ProofDive using my linked Google or LinkedIn account, so that I can access the platform without re-entering a password._

#### Story Details

- Continue with Google button: OAuth button **(Mandatory)**, always visible on the Sign In screen.
- Continue with LinkedIn button: OAuth button **(Mandatory)**, always visible on the Sign In screen.
- Provider Consent/Authentication: Candidate authenticates with the selected provider. No ProofDive password is requested at this step unless an account-linking scenario below is triggered.
- Returning User Match: If the retrieved email matches an existing, already-linked Google or LinkedIn account, the platform shall authenticate the Candidate directly and create a secure session.
- **Existing Password Account Match (Not Yet Linked)**
  - If the retrieved email matches an existing email/password account that has not yet been linked to this provider, the platform shall prompt the Candidate to enter their existing password before linking and logging in.
  - Password Verification Field: password input field **(Mandatory when this scenario is triggered)**.
- Existing Social Account Match (Other Provider, Not Yet Linked): If the retrieved email matches an existing account linked to the other social provider only, the platform shall automatically link the new provider to that account and log the Candidate in without additional verification.
- No Matching Account: If no ProofDive account exists for the retrieved email, the platform shall treat this as a new signup and follow the Social Sign Up flow, including the Terms & Conditions/Privacy Policy consent screen and redirect to onboarding.
- Session Management: A secure, authenticated session shall be created upon successful authentication or linking.
- **Redirects**
  - Returning Candidates: redirected to Dashboard/Home.
  - Candidates completing onboarding for the first time (no matching account found): redirected to the Guided Candidate Onboarding Journey, via the Social Sign Up flow.

#### Acceptance Criteria

- Given a returning Candidate with an already-linked Google account selects Continue with Google, when authentication succeeds, then they are logged in and redirected to Dashboard/Home.
- Given a returning Candidate with an already-linked LinkedIn account selects Continue with LinkedIn, when authentication succeeds, then they are logged in and redirected to Dashboard/Home.
- Given the retrieved email matches an existing email/password account not yet linked, when the Candidate enters the correct password, then the account is linked and the Candidate is logged in.
- Given the retrieved email matches an existing email/password account not yet linked, when the Candidate enters an incorrect password, then the account is not linked and an error is displayed.
- Given the retrieved email matches an account linked only to the other social provider, when authentication succeeds, then the new provider is automatically linked and the Candidate is logged in without additional verification.
- Given no account exists for the retrieved email, when authentication succeeds, then a new account is created per the Social Sign Up flow and the Candidate is redirected to onboarding after accepting the Terms & Conditions/Privacy Policy.
- Given the Candidate cancels or denies consent on the provider’s screen, when they return to ProofDive, then no session is created and the Candidate remains on the Sign In screen.

#### Alternate Scenarios

- Provider Consent Denied: Candidate cancels or denies consent on the Google or LinkedIn consent screen, the system displays an authentication failure message and the Candidate remains on the Sign In screen.
- OAuth Provider Failure: The Google or LinkedIn service is unavailable or times out during authentication, the system displays an authentication failure message.
- Incorrect Password During Linking: Candidate enters an incorrect password when prompted to link an existing email/password account, the system displays an error and the accounts remain unlinked.
- Session Expired Mid-Flow: Candidate’s session expires during the authentication flow, the system displays a session expiry message and redirects to Sign In.

#### Business Rules

- A Candidate account is uniquely identified by email address across all authentication methods (email/password, Google, LinkedIn).
- Linking to an existing email/password account requires password verification, since the platform cannot independently confirm ownership of a self-registered email.
- Linking to an existing account created via the other social provider does not require additional verification, since both Google and LinkedIn assert a verified email address for the Candidate.
- A retrieved email with no matching ProofDive account is treated as a new signup, not a failed sign-in.
- Terms & Conditions/Privacy Policy consent is never requested during sign-in; it applies only at new account creation.

#### Validation Rules / Errors

- Password Verification Field (shown only when the retrieved email matches an existing, unlinked email/password account):
  - Default: N/A
  - Condition: Entered password must match the password on file for the existing account
  - Error: “Incorrect password. Please try again.”
  - Treatment: Field highlighted in red with error message displayed below
- Social authentication failure/cancellation:
  - Default: N/A
  - Condition: Provider consent denied, cancelled, or provider authentication fails
  - Error: “Unable to authenticate. Please try again.”
  - Treatment: Error message displayed on the Sign In screen; Candidate remains on the Sign In screen
- Session expired during the authentication flow:
  - Default: N/A
  - Condition: Session expires mid-flow before authentication completes
  - Error: “Your session has expired. Please sign in again.”
  - Treatment: Candidate redirected to Sign In screen

#### Non-functional Requirements

- OAuth authentication responses should complete within acceptable response thresholds, consistent with the existing Sign In flow.
- OAuth authentication shall follow Google and LinkedIn OAuth/OIDC security best practices.
- Session tokens must be securely managed.
- Password verification during account linking must occur over a secure, encrypted channel.


### 1.5 — Forgot Password

#### Requirement Statement

> _As a Super Admin, I want to reset my password if I forget it, so I can regain access to the system._

#### Story Details

- The system must send a password reset link to the registered email.
- Passwords must be reset with minimum security standards (e.g., 8 characters, alphanumeric, one special character).
- Forgot Password Link:
  - Super Admin clicks Forgot Password? below the password field.
  - The system prompts Super Admin to enter the registered email.
- Reset Email:
  - The system sends a password reset link to the registered email.
  - Super Admin clicks the link and enters a new password.

#### Acceptance Criteria

- Email Validation: Ensure the email format is correct before submitting.
- Reset Email: A reset email is sent successfully.
- New Password: Super Admin enters and confirms the new password.

#### Alternate Scenarios

- Email Not Registered:
  - Action: Super Admin enters a non-registered email.
  - Outcome: The system shows an error: “Email not found.”

#### Non-functional Requirements

- Link Expiry: The password reset link should expire in 30 minutes.
- Security: The system must enforce strong password policies.

#### Validation Rules / Errors

- Password Requirements: New passwords must be:
  - At least 8 characters long
  - One uppercase letter
  - One lowercase letter
  - One number
  - One special character (!, @, #, $, %)


---

## Epic 2: Candidate Onboarding

This epic covers the guided onboarding journey completed by:

- Every newly registered candidate, after signing up / logging in
- Existing candidates, whenever they add a new target role / journey

The onboarding flow collects role-specific context to personalise the candidate's storyboard generation, guided preparation journey, competency mapping, and interview readiness experience.

### 2.1 — Guided Candidate Onboarding Journey `UPDATED`

#### Requirement Statement

> _As a Candidate, I want to complete an onboarding journey after account creation so that ProofDive can personalise my preparation journey based on my profile, target role, and recommended competencies._

#### Story Details

- Onboarding Introduction
  - The platform shall:
    - Support a conversational onboarding experience
    - Allow user responses via:
- Typing
- Voice-to-text input
- Upload (where applicable, i.e. Job Description & Resume)
- Onboarding Steps
  - **Step 1 - Candidate Name** *(Mandatory)*
    - Input methods: Typing, Voice-to-text
  - **Step 2 - Target Role Selection** *(Mandatory)*
    - Candidates may:
- Enter the target role manually
- Use voice-to-text input
- Select from the finalized Target Role list, with an “Other” option for manual entry
  - **Step 3 - Experience Level Selection** *(Mandatory)*
    - Candidates select one predefined experience category, which determines the conditional sub-flow:
- Fresh Grad: Last school/university *(Optional)*
- Undergrad: Last school/university *(Optional)*
- Diploma Holder: Last school/university *(Optional)*
- Experienced Professional: Experience bracket (1-5 years / 5-10 years / 10+ years), Last workplace *(Optional)*
  - **Step 4 - Add Industry** *(Optional)*
    - Candidates may select from the finalized Industry list (with “Other” option) or enter a custom industry manually
  - **Step 5 - Add Job Description** *(Mandatory)*
    - Candidates may:
- Type or paste the JD manually
- Use voice-to-text
- Upload the JD document/PDF
    - If no JD is available, the system offers a Generate JD button. Selecting it generates a draft JD based on the candidate’s Target Role, which the candidate can review and edit before proceeding. The generated JD shall be clearly labeled as system-generated.
  - **Step 6 - Add Resume** *(Optional)*
    - Candidates may upload: DOC, DOCX, PDF
  - **Step 7 - Role Intelligence & Competency Recommendation**
    - The system analyzes the JD (and Resume, if provided) against the Success Drivers Framework and recommends one competency from each Success Driver (Power of Thinking, Power of Action, Power of People, Power of Mastery), forming the Core Four.
    - Each recommended competency displays a rationale for why it was selected.
    - The candidate can review the full list of competencies under each Success Driver, deselect a recommended competency, and select a different one from the same driver. Alternates do not display a rationale.
    - The candidate confirms the Core Four to proceed. The proceed button remains disabled until all four Success Driver slots have a selection.
- Guided Intake Completion
  - Upon completion, the Candidate proceeds directly to the Storyboard Module with the Core Four already confirmed.
- Guided Journey Initialization
  - Upon successful onboarding completion:
    - A role-specific preparation journey shall be created
    - Candidate context, including the confirmed Core Four, shall be saved against the target role
  - For existing users:
    - A separate onboarding journey shall be created for every new target role added
    - Existing role journeys and data shall remain unaffected
    - Users will be able to toggle between these journeys after successfully adding another

#### Acceptance Criteria

- Candidate can complete onboarding using typing and/or voice-to-text input.
- Candidate must enter Name and Target Role before proceeding.
- Candidate must select one predefined Experience Category.
- System displays a conditional onboarding flow based on the selected experience category.
- Candidate must provide a Job Description, either manually or via Generate JD, before proceeding.
- Candidate can upload JD/Resume using DOC, DOCX, or PDF format.
- System recommends one competency per Success Driver, each with a rationale.
- Candidate can swap any recommended competency for another from the same Success Driver.
- Proceed button stays disabled until all four Success Driver slots have a selection.
- Upon successful onboarding, the Candidate lands directly in the Storyboard Module with the confirmed Core Four attached.
- Existing users adding a new target role shall get a separate onboarding journey.

#### Alternate Scenarios

- User skips mandatory fields: System prevents progression.
- User uploads unsupported file format: System rejects upload.
- Voice-to-text fails: User continues via manual typing.
- Existing user adds duplicate target role: System warns/restricts duplicate creation.
- File upload fails: User is prompted to retry upload.
- User has no JD: User selects Generate JD, reviews and edits the generated draft before proceeding.
- Generate JD fails: No draft appears; user can click Generate JD again.
- User deselects a recommended competency: Proceed button stays disabled until an alternate from the same Success Driver is selected.

#### Business Rules

- Job Description remains mandatory; a system-generated JD is an accepted substitute for a candidate-provided one, but must be clearly labeled as system-generated at all times it is displayed.
- Resume upload is optional.
- The Core Four must contain exactly one competency per Success Driver; a candidate cannot proceed with more or fewer than four.
- Rationale is only shown for the AI-recommended competency, not for alternates.

#### Non-functional Requirements

- Onboarding flow shall support desktop and mobile responsiveness.
- Voice-to-text responses shall process in near real-time.
- Uploaded files shall be securely stored.
- Candidate onboarding progress shall persist during the session.
- Existing journeys shall remain unaffected when adding new target roles.
- Competency recommendation shall complete within acceptable response time.


### 2.2 — Add New Role for Existing User `OUTLINE ONLY`

The platform shall allow existing users to initiate the onboarding journey again when adding a new target role, creating a separate role-specific preparation journey while preserving existing journeys and data.


---

## Epic 3: Dashboard

### 3.1 — Candidate Dashboard & Readiness Progress `UPDATED`

#### Requirement Statement

> _As a Candidate, I want to view my interview readiness dashboard and guided preparation journey so that I can track my progress, improve my storytelling, and prepare effectively for interviews._

#### Story Details

- **Dashboard Overview**
  - The platform shall display:
    - Current target role context
    - Overall Interview Readiness Score
    - Pillar-wise readiness breakdown
    - Guided preparation journey
    - Competency Bank for the selected target role
  - **Global Multi-Role**
    - Candidates can add more roles in addition to current by selecting the global dropdown and hitting the “+”, which triggers the onboarding flow for the new target role.
    - For candidates with multiple target roles:
- The dashboard shall support target role switching
- Dashboard data shall refresh role-wise
- Scores, journeys, and the Competency Bank shall remain role-specific
- **Dashboard States**
  - **New User Dashboard State**
    - For newly onboarded users with no completed preparation activity:
- Dashboard shall appear in blank/empty state format
- Readiness scores and pillar scores may initially remain unavailable
- Empty Competency Bank state shall be shown
- User shall be prompted to begin the guided preparation journey
    - The guided preparation journey shall include:
- Prepare Yourself (Course/Training Module)
- Craft Your Experience (Storyboard Module)
- Test It Out! (Mock Interview Module)
- Analytics Report & AI Coach
    - The platform may visually highlight the recommended first step for the user
  - **Returning User Dashboard State**
    - For returning users:
- Dashboard shall restore progress based on previously completed activities
- Guided journey shall resume from the last incomplete stage
- Existing readiness scores and analytics shall remain visible
- Competency Bank shall display previously classified experiences/stories
  - The platform shall additionally:
    - Recommend competency-specific courses/modules
    - Recommend improvement areas based on weakest scoring pillars
    - Encourage users toward activities that improve overall readiness score
    - Recommendations may be based on: Power of Thinking, Power of Action, Power of People, Power of Mastery
- **Primary Dashboard Routes**
  - Option 1: Build My Story
    - The platform shall allow candidates to start crafting role-specific experiences/stories, entering the Storyboard Module directly
  - Option 2: Guided Preparation Journey
    - The platform shall guide candidates through: Prepare Yourself, Craft Your Experience, Test It Out!, Analytics Report & AI Coach
    - The platform may visually represent progress state, current stage, completed stages, and recommended next step
- **Interview Readiness Score**
  - The platform shall display: aggregate interview readiness score, readiness status label, supporting readiness guidance
  - Readiness Criteria: 4.5-5.0 Ready, 3.0-4.4 Getting There, 1.0-2.9 Needs Work
- **Pillar Breakdown**
  - The platform shall display readiness scores across: Power of Thinking, Power of Action, Power of People, Power of Mastery
  - Each pillar includes: Score, Tooltip/description, Progress indicator
- **Competency Bank**
  - The platform shall maintain a Competency Bank for the active target role
  - The Competency Bank shall:
    - Store all classified competency evidence
    - Display total competency count
    - Allow navigation into the Storyboard Module
    - Remain isolated per target role
  - For new users, the Competency Bank will initially appear empty

#### Acceptance Criteria

- New users shall see the dashboard in an empty/preparation state.
- Returning users shall resume from their last incomplete guided journey stage.
- Dashboard shall display readiness score and pillar breakdown.
- The platform shall recommend improvement areas based on the weakest pillars.
- Candidate can access Storyboard, Training, Mock Interview, and Analytics flows.
- Competency Bank shall display classified competencies for the active target role.
- Dashboard shall refresh dynamically when switching target roles.

#### Alternate Scenarios

- New user has no competencies classified yet: Empty Competency Bank state is shown.
- No mock interviews completed yet: Readiness score remains unavailable/default.
- User switches target role: Dashboard refreshes with role-specific data.
- User abandons guided journey midway: Journey resumes from last incomplete step.

#### Validation Rules / Errors

- No competencies added yet:
  - “No competencies added yet.”
- No readiness score available:
  - “Complete your first mock interview to generate readiness insights.”

#### Non-functional Requirements

- Dashboard shall support responsive behavior across devices.
- Dashboard widgets and analytics shall load within acceptable response thresholds.
- Readiness calculations shall update dynamically after interviews/training completion.
- Guided journey progress shall persist securely between sessions.


---

## Epic 4: MasterClass & Training Module

### 4.1 — Complete Training Course

#### Requirement Statement

> _As a Candidate, I want to complete interactive training courses consisting of videos, quizzes, case studies, and assessments, so that I can improve my interview readiness and strengthen the competencies required for my target role._

#### Story Details

- The Candidate should be able to access the Masterclass & Training Module from the platform.
- **Course Library**
  - The module should display available training courses.
  - Each course should display:
    - Course Title
    - Brief Description
    - Estimated Duration
    - Course Progress Bar (% Completed)
- For returning Candidates, the platform should recommend courses or specific modules based on:
  - Previous mock interview performance
  - Storyboard competency gaps
  - Analytics insights
- For new Candidates, recommendations should be based on:
  - Selected Target Role
  - Default competency expectations for that role
- **Course Details**
  - When a Candidate selects a course, the Course Details page should display:
    - Course Title
    - Description
    - Total Duration
    - Number of Chapters
    - Number of Checkpoints
    - Overall Course Progress
    - List of Chapters
  - Each chapter should display:
    - Chapter Name
    - Short Description
    - Estimated Duration
    - Individual Progress Indicator
  - The Candidate can start the course by clicking Start Course.
- **Course Flow**
  - Each chapter should guide the Candidate through the following sequence:
    - Video Lesson
    - MCQ Quiz
    - AI Case Study
    - Final Chapter Assessment
  - The Candidate must complete each step before progressing to the next.
- **Video Lesson**
  - The Candidate should be able to watch the instructional video.
  - Once complete, they may click Mark Video as Watched to unlock the next checkpoint.
- **MCQ Quiz**
  - The Candidate should complete the multiple-choice quiz associated with the chapter.
  - Requirements:
    - Only one answer may be selected per question.
    - The Submit Quiz button remains disabled until every question has been answered.
    - Upon submission, the system should:
      - Calculate the score
      - Highlight correct and incorrect responses
      - Display the correct answer for incorrectly answered questions
  - After submission, the Candidate may proceed to the next stage.
- **AI Case Study**
  - The Candidate should complete a text-based case study related to the chapter.
  - The Candidate enters their response into a text field.
  - Upon submission, the AI-powered competency engine should:
    - Evaluate the response
    - Score it out of 5
    - Determine whether expectations have been met
    - If improvement is required:
    - Provide personalised improvement suggestions, or
    - Display an example of a stronger answer
  - The Candidate may then continue to the final assessment.
- **Final Chapter Assessment**
  - At the end of the chapter, the Candidate should complete a written assessment covering the chapter content.
  - The response should be evaluated by the competency engine.
  - The system should:
    - Score the submission
    - Provide competency-based feedback
    - Highlight strengths and weaknesses
    - Suggest improvements where applicable
    - Provide an example or corrective answer when appropriate
- **Course Progress & Resume Behaviour**
  - Progress should be tracked automatically throughout the course.
  - If the Candidate exits the course:
    - Completed chapters remain completed.
    - An in-progress chapter is not saved partially.
    - The Candidate must restart that chapter from the beginning upon returning.
  - Course and chapter progress bars should update accordingly.

#### Acceptance Criteria

- The candidate can browse available training courses.
- Recommended courses/modules are displayed appropriately.
- Course and chapter progress bars update correctly.
- The candidate can view chapter details and start a course.
- Video lessons can be marked as watched.
- MCQ quizzes require all questions to be answered before submission.
- Quiz results highlight incorrect answers and display correct answers.
- AI case studies are evaluated and scored automatically.
- Final assessments are evaluated by the competency engine with feedback and suggestions.
- Completed chapters remain saved.
- Partially completed chapters restart from the beginning when resumed.

#### Alternate Scenarios

- No recommended courses are available.
- Video content fails to load.
- Quiz submission fails temporarily.
- AI evaluation service is temporarily unavailable.
- The candidate exits the course before completing the current chapter.
- Network interruption occurs during assessment submission.

#### Non-functional Requirements

- Video playback should load within acceptable response times.
- AI evaluation responses should be generated within an acceptable processing time.
- Progress tracking should persist reliably across sessions.
- Assessment submissions should be securely stored.
- Course recommendations should update dynamically based on Candidate performance.

#### Validation Rules / Errors

- “Please answer all questions before submitting the quiz.”
- “Video could not be loaded. Please try again.”
- “Unable to evaluate your response at the moment.”
- “Assessment submission failed. Please try again.”
- “Your progress has been saved.”
- “Incomplete chapters must be restarted to continue.”


---

## Epic 5: Storyboard Module

**Updated flow:** Core Four competencies confirmed at onboarding → per-competency experience entry → AI Consultant probes (max 5 per competency) → evidence classification into the Competency Bank → single TMAY question once all four are classified → *Craft Storyboard* → one TMAY narrative plus four CAR examples.

### 5.1 — Create New Storyboard `UPDATED`

#### Requirement Statement

> _As a Candidate, I want to build a storyboard for my confirmed Core Four competencies by describing my experiences through AI-guided conversations, so that I can generate compelling, interview-ready stories tailored to my target role._

#### Story Details

- The Candidate enters the Storyboard Module directly from onboarding, with the Core Four competencies already confirmed.
- The Candidate works through the four competencies sequentially; one competency must be fully captured, enriched, and classified before the next becomes available.
- **Per-Competency Flow** (repeated for each of the four competencies):
  - **Experience Entry**
    - The Candidate enters a description of an experience relevant to the competency
    - Input methods: Typing, Voice-to-text
  - **AI Consultant**
    - The AI asks adaptive follow-up questions and probes to extract the Context, Action, and Result of the experience from the Candidate’s responses, up to a maximum of 5 questions
    - As the Candidate answers, a live Story Draft updates continuously, showing how responses are shaping the narrative
    - The AI determines whether sufficient evidence has been collected after each answer; if not, and the 5-question cap has not been reached, it asks another question
    - If the 5-question cap is reached, the flow proceeds to classification regardless of the sufficiency determination
  - **Evidence Classification**
    - The system classifies the captured experience against the competency framework, producing a score, confidence level, and matched signals
    - The classified experience is stored in the Competency Bank
- **TMAY Question**
  - Once all four competencies are captured and classified, the system asks a single “Tell Me About Yourself” question
  - The Candidate answers using Typing or Voice-to-text
- **Story Generation**
  - Once the TMAY question is answered, the Candidate can click Craft Storyboard to generate the full storyboard
  - The system generates: one TMAY narrative and four CAR examples, one per competency
  - Each CAR example must be anchored in the one real primary experience captured for that competency; the system does not invent, inflate, or stitch together unrelated evidence
  - CAR examples target 240-260 words, with a hard cap of 280 words
  - The TMAY narrative targets 180-220 words, with a hard cap of 240 words

#### Acceptance Criteria

- Candidate can enter an experience description for each of the four competencies.
- Candidate can respond using typed input or Voice-to-text throughout.
- AI Consultant asks up to 5 adaptive follow-up questions/probes per competency to extract Context, Action, and Result.
- Live Story Draft updates as Consultant responses are provided.
- Candidate cannot begin a new competency until the current one is fully classified.
- Classified experiences are stored in the Competency Bank.
- System asks the TMAY question only after all four competencies are classified.
- Candidate can click Craft Storyboard to generate the storyboard after answering the TMAY question.
- Generated TMAY and CAR examples are anchored in the Candidate’s real captured experiences.
- Generated CAR examples and TMAY narrative respect their specified word targets and hard caps.

#### Alternate Scenarios

- Candidate reaches the 5-question cap for a competency before the AI determines sufficient evidence: System proceeds to classification with the evidence collected.
- Candidate exits mid-competency: Progress is saved as a draft and resumed later.
- Story generation fails temporarily: Candidate is notified and can retry.

#### Business Rules

- Exactly one experience is captured per Core Four competency in this story; capturing additional experiences per competency is out of scope here.
- Competencies must be completed in sequence; the next competency is inaccessible until the current one is classified.
- The TMAY question is only presented once, after all four competencies are classified, and is asked before any CAR example is generated.
- Generated stories must be evidence-backed only; no hallucinated or stitched content is permitted.

#### Non-functional Requirements

- Live Story Draft updates should occur with minimal latency.
- Experience drafts should be automatically saved to prevent data loss.
- AI conversation context should persist across sessions.
- Voice-to-text processing should provide near real-time transcription.
- Storyboard generation should complete within acceptable response times.


### 5.2 — Enrich Storyboard / Add Competency `UPDATED`

#### Requirement Statement

> _As a Candidate, I want to add competencies beyond my original Core Four and generate additional CAR examples for them, so that I can continuously build out a fuller, more complete storyboard for my target role._

#### Story Details

- The Candidate can open their existing Target Role within the Storyboard Module.
- For each Target Role, the system displays: the existing storyboard, the Competency Bank, Last Updated timestamp, and an Edit option.
- The Candidate can choose to add a new competency using an “Add Competency” action.
- **Competency Selection**
  - The Candidate is shown the full list of competencies from the framework
  - Competencies already used (the original Core Four, and any previously added via enrichment) are shown greyed out and cannot be selected
  - The Candidate selects one available competency to add
- **Per-Competency Flow** (same as the original Core Four capture):
  - Experience Entry: the Candidate describes an experience relevant to the newly selected competency
  - AI Consultant: adaptive follow-up questions and probes, up to a maximum of 5, extracting Context, Action, and Result from the Candidate’s responses
  - Live Story Draft updates continuously as responses are provided
  - Evidence Classification: the system classifies the experience, producing a score, confidence level, and matched signals, and stores it in the Competency Bank
- **Generate Additional CAR Example**
  - Once the newly added competency is classified, the Candidate can generate a new CAR example for it
  - Only the new CAR example is generated; the four original Core Four CAR examples and the TMAY narrative remain unchanged
  - The new CAR example follows the same generation rules as the original four (evidence-anchored, no hallucinated or stitched content, 240-260 word target with a 280-word hard cap)
- The Candidate may repeat this process to add further competencies, up to the total number of competencies available in the framework.

#### Acceptance Criteria

- Candidate can access an existing Target Role’s storyboard and Competency Bank.
- Candidate can select “Add Competency” and see the full competency list with used competencies greyed out.
- Candidate cannot select an already-used competency.
- Candidate can complete Experience Entry, AI Consultant, and Evidence Classification for the newly selected competency.
- Live Story Draft updates during the AI Consultant step for the new competency.
- Newly classified competency is stored in the Competency Bank.
- Candidate can generate a new CAR example for the newly added competency only.
- Original four CAR examples and the TMAY narrative remain unchanged after enrichment.
- Candidate can repeat the enrichment process for additional competencies until all available competencies are used.

#### Alternate Scenarios

- Candidate exits mid-enrichment before completing the newly added competency: Progress is saved as a draft and resumed later.
- Candidate reaches the 5-question cap before the AI determines sufficient evidence: System proceeds to classification with the evidence collected.
- CAR example generation for the new competency fails temporarily: Candidate is notified and can retry.
- All competencies in the framework have been used: Add Competency option is no longer available.

#### Business Rules

- A competency can only be used once per Target Role; it cannot be selected again once already used via Core Four or a prior enrichment round.
- Enrichment only generates a CAR example for the newly added competency; it never regenerates the original four or the TMAY narrative.
- The number of competencies a Candidate can add is bounded only by the total competencies available in the framework.

#### Non-functional Requirements

- Live Story Draft updates should occur with minimal latency.
- Experience drafts should be automatically saved to prevent data loss.
- AI conversation context should persist across sessions.
- Newly generated CAR examples should complete within acceptable response times.


### 5.3 — Competency-Based Storyboard View `UPDATED`

#### Requirement Statement

> _As a Candidate, I want to view my generated competency-based storyboard with development guidance for each example, review and refine individual competency sections, and save versions over time, so that I can prepare the strongest possible interview narrative for my target role._

#### Story Details

- Clicking Craft Storyboard (6.1) or generating a new CAR example (6.2) takes the Candidate directly to the full Competency-Based Storyboard view; there is no separate Readiness Overview screen.
- **Competency-Based Storyboard**
  - The storyboard is organized by competency and includes:
    - Overall Story Score (calculated as the average of all competency scores)
    - Individual Competency Scores
    - AI-generated narrative for each competency, in CAR format
    - Classification rationale explaining why each score was assigned
- **Introduction Section**
  - The “My Introduction” section (TMAY narrative) is directly editable by the Candidate
  - Edits to this section update only the Introduction and do not trigger AI restructuring of any competency section
- **Competency Sections**
  - Each competency section displays:
    - Competency Name
    - Individual Competency Score
    - AI-generated CAR narrative
    - **Development Insights**: matched signals, missing next-level signals, one development recommendation, a MasterClass recommendation, and an AI Coach action
    - **Reuse Guidance**: related competencies this example may also support, and three question types the example can answer
  - The Candidate can edit any competency section by providing additional prompts or instructions
  - The AI uses those prompts to restructure and enrich only the selected competency section, preserving intended meaning while improving clarity and quality
- **Lock Competency Section**
  - Each competency section provides a Lock option
  - When a section is locked, it is considered finalized: future storyboard regenerations preserve the locked content unchanged, and additional competencies or regenerated versions do not overwrite it
  - Unlocked sections may continue to evolve based on newly added competencies and AI refinements
- **Storyboard Versioning**
  - Every time the storyboard is regenerated, whether from adding a new competency (6.2) or enriching an unlocked competency section, the system creates a new storyboard version
  - Previous storyboard versions remain preserved and accessible
  - The latest version incorporates newly added competencies and updated narratives while respecting any sections the Candidate has locked
- **Storyboard Generation Limit**
  - A Candidate may generate and save up to three storyboard versions as part of their allocated platform usage
  - A version is counted whenever the storyboard is regenerated after adding a new competency or enriching an unlocked competency section
  - Once the limit is reached, the system prevents further storyboard generation until the Candidate purchases a Storyboard Version Add-on, after which additional generation credits become available
- **Save Storyboard**
  - The Candidate can Save Storyboard to preserve the current version for future reference
  - The Candidate may continue enriching competencies and generate newer versions without affecting previously saved versions

#### Acceptance Criteria

- Craft Storyboard (6.1) or a new CAR example generation (6.2) opens the full Competency-Based Storyboard view directly.
- Overall Story Score and individual competency scores display correctly.
- Each competency section shows its CAR narrative, classification rationale, Development Insights, and Reuse Guidance.
- My Introduction section is directly editable, and edits do not trigger restructuring elsewhere.
- Competency sections can be refined through AI prompts, with restructuring applied only to the selected section.
- Candidate can lock individual competency sections, and locked sections remain unchanged in future versions.
- Regenerating the storyboard creates a new version while preserving previous versions.
- The Candidate can generate up to three storyboard versions before needing the Storyboard Version Add-on.
- The Candidate can save the current storyboard version successfully.

#### Alternate Scenarios

- Candidate edits only selected competency sections.
- Candidate locks one or more competency sections before regenerating.
- Candidate attempts to generate a fourth storyboard version after consuming all allocated versions: system prompts purchase of the Storyboard Version Add-on.
- Storyboard generation or regeneration fails temporarily.

#### Business Rules

- Introduction edits never trigger AI restructuring of competency sections.
- Locked competency sections are immutable across all future regenerations until unlocked.
- Version counting applies only to regenerations triggered by adding a competency (6.2) or editing an unlocked section, not to viewing an existing version.

#### Validation Rules / Errors

- “Section locked successfully.”
- “This section is locked and cannot be modified.”
- “Storyboard saved successfully.”
- “Failed to save storyboard. Please try again.”
- “Unable to regenerate storyboard at this time.”
- “You have used all available storyboards included in your plan.”
- “Purchase a Storyboard Version Add-on to generate additional storyboard versions.”
- “Additional storyboard has been added successfully.”

#### Non-functional Requirements

- Storyboard generation and regeneration should complete within acceptable response times.
- Competency scores should recalculate automatically upon regeneration.
- Locked sections should remain immutable across future versions.
- Storyboard versions should be version-controlled and historically retrievable.
- Storyboard data and Candidate edits should be automatically persisted.


### 5.4 — Download Storyboards `UPDATED`

#### Requirement Statement

> _As a Candidate, I want to download my generated storyboard as a PDF report, so that I can review, share, or use it for interview preparation offline._

#### Story Details

- The Candidate should be able to download any generated storyboard version as a PDF document.
- From the Storyboard page, the Candidate can click Download Storyboard.
- Upon selection, the system generates a PDF containing the current storyboard version.
- The downloaded report should include:
  - Candidate Name
  - Target Role
  - Storyboard Version
  - Download Timestamp
  - Overall Story Score
  - Individual Competency Scores
  - My Introduction
  - Each competency section
- The downloaded PDF should reflect the selected storyboard version exactly as displayed on the platform.
- Previously generated storyboard versions should also be available for download individually.

#### Acceptance Criteria

- The candidate can download a generated storyboard successfully.
- The storyboard is exported in PDF format.
- PDF contains the latest content for the selected storyboard version.
- Overall Story Score and competency-wise scores are included.
- All competency narratives and the Introduction section are included.
- Previously saved storyboard versions can also be downloaded.

#### Alternate Scenarios

- The storyboard has not yet been generated.
- PDF generation fails temporarily.
- Selected storyboard version is unavailable.

#### Validation Rules / Errors

- “Please generate a storyboard before downloading.”
- “Unable to generate PDF at this time.”
- “Selected storyboard version could not be found.”
- “Storyboard downloaded successfully.”

#### Non-functional Requirements

- PDF generation should complete within an acceptable response time.
- Downloaded reports should preserve formatting and readability.
- Generated PDFs should accurately reflect the selected storyboard version.


---

## Epic 6: AI FAQ Assistant

Replaces the placeholder AI FAQ / Training Coach epic in the base document with fully specified stories.

### 6.1 — Access FAQ Bot — Avatar, Chat Shell, Root Menu `NEW`

#### Requirement Statement

> _As a Candidate, I want to access a hardcoded FAQ bot from anywhere in the platform, so that I can quickly get guidance and navigate to relevant features without needing to search for them._

#### Story Details

- **Avatar**
  - Avatar Icon: reuses the existing onboarding bot’s avatar asset and visual style.
  - Position: fixed, bottom-right corner of the screen.
  - Availability: displayed globally, on every page within the Candidate panel.
  - Hover State: displays an invitational speech bubble above the avatar.
    - Speech Bubble Text: “Need a quick hand?”
  - Click Interaction: opens the Chat Box. The avatar is hidden and replaced by the Chat Box while it is open.
- **Chat Box**
  - **Header**
    - Close Button (X icon): always available at the top of the Chat Box header. Closes the Chat Box and restores the avatar, regardless of which screen (Root Menu or an Answer View) is currently displayed.
  - **Greeting Message**
    - Displayed only on the Candidate’s very first-ever interaction with the FAQ Bot, never repeated on any subsequent open.
    - Text: “Hey [Candidate Name], what can I help you with today?” (Personalized using Candidate Name)
  - **Root Menu**
    - Displayed as selectable pills, directly beneath the greeting on first-ever open, or directly beneath the Chat Box header on all subsequent opens.
    - Input Type: pill/button selection only, free text typing is not supported.
    - Menu Items (displayed in this order):
- What’s next in my roadmap?
- Storyboard Info
- Mock Interview Info
- View Latest Report
- Prepare for Another Role
- Usage & Billing
- Contact Support
  - **Answer View**
    - Displayed when a Candidate selects a Root Menu item (content defined per item in Stories 5.2 to 5.8).
    - Back to Menu Button: returns the Candidate to the Root Menu.
    - Close Button: closes the Chat Box.
    - Button Placement: all buttons and pills associated with an answer (CTA buttons, sub-menu follow-up pills, Back to Menu buttons, Close buttons) are displayed below the answer text, stacked vertically underneath it. No button or pill is ever displayed beside or alongside the answer text.
  - **Session Persistence**
    - If the Candidate closes the Chat Box and reopens it within the same browser tab/window session, the Chat Box resumes on the exact screen last viewed (Root Menu or a specific Answer View).
    - A page refresh or a new browser tab/window resets the Chat Box to the Root Menu, without repeating the greeting message.

#### Acceptance Criteria

- Candidate can open the FAQ Bot by clicking the avatar from any page within the Candidate panel.
- The avatar is replaced by the Chat Box while the Chat Box is open, and reappears once the Chat Box is closed.
- The personalized greeting message is displayed only on the Candidate’s first-ever interaction with the FAQ Bot.
- The Root Menu displays all 7 quick action items as pills, in the defined order, on every open after the first.
- Candidate can close the Chat Box at any time using the header Close button, regardless of the screen currently displayed.
- Reopening the Chat Box within the same browser tab/window session resumes the exact screen last viewed.
- Refreshing the page or opening a new browser tab/window resets the Chat Box to the Root Menu.
- Hovering over the avatar displays the invitational speech bubble.
- Candidate can only interact with the FAQ Bot via pill/button selection, free text input is not available.

#### Alternate Scenarios

- First-ever open: Greeting message is displayed above the Root Menu.
- Subsequent opens (same or later session): Root Menu is displayed directly, without the greeting message.
- Session reset (page refresh or new browser tab/window): Chat Box returns to the Root Menu, greeting message is not repeated.
- Candidate closes the Chat Box from an Answer View: Chat Box remembers the Answer View and resumes there when reopened within the same session.
- Candidate attempts to click the avatar while the Chat Box is already open: not possible, since the avatar is hidden while the Chat Box is open.

#### Business Rules

- The FAQ Bot is available to the Candidate persona only.
- The FAQ Bot avatar reuses the existing onboarding bot’s avatar asset and visual style.
- The FAQ Bot supports pill/button selection only, free text input is out of scope for this hardcoded version.

#### Validation Rules / Errors

- No specific validation rules apply to this story.

#### Non-functional Requirements

- Chat Box open, close, and navigation interactions must complete within 300 milliseconds.
- Avatar and Chat Box must render correctly across desktop and mobile viewport widths.
- Session-based resume state must persist reliably for the duration of the browser tab/window session.


### 6.2 — Storyboard Info `NEW`

#### Requirement Statement

> _As a Candidate, I want to ask the FAQ Bot about the Storyboard Module, so that I can understand what it does and quickly find answers to common questions before navigating there myself._

#### Story Details

- **Storyboard Info (Root Menu Item)**
  - Answer Text: “The Storyboard Module helps you turn your real experiences into structured, interview-ready stories for your target role. Add your experiences, and get a competency-scored story built using the CAR (Cause, Action, Result) framework.”
  - CTA Button: “Go to Storyboard” (navigates the Candidate to the Storyboard Module).
  - Storyboard Sub-Menu: displayed as pills below the Answer Text, containing the following follow-up questions:
    - How do I add an experience?
    - How many storyboards can I create?
    - Can I edit my storyboard after it’s generated?
    - Can I download my storyboard?
    - Is my storyboard specific to my target role?
- **Follow-up Answers (text + CTA)**
  - “How do I add an experience?”: “You can add an experience by typing it in or using voice-to-text. Once submitted, it’s saved to your Experience Bank for that target role.”
  - “How many storyboards can I create?”: “You can generate and save up to 3 storyboard versions for each target role.”
  - “Can I edit my storyboard after it’s generated?”: “Yes. You can edit any competency section by adding more detail, and lock sections you’re happy with so they stay unchanged in future versions.”
  - “Can I download my storyboard?”: “Yes, you can save and download your storyboard as a PDF.”
  - “Is my storyboard specific to my target role?”: “Yes, each target role you’re preparing for has its own separate Experience Bank and storyboard.”
  - Each follow-up answer above is shown with the same CTA Button: “Go to Storyboard”.
- **Navigation**
  - CTA Button: “Go to Storyboard” (shown on the main Storyboard Info answer and on every follow-up answer, navigates the Candidate to the Storyboard Module). Displayed below the answer text, never beside it.
  - Back to Storyboard Menu Button: shown after any follow-up answer, returns Candidate to the Storyboard Sub-Menu (with the main explainer and CTA still visible). Displayed below the follow-up answer text.
  - Back to Main Menu Button: shown after any follow-up answer, returns Candidate to the Root Menu (per Story 5.1). Displayed below the follow-up answer text.

#### Acceptance Criteria

- Candidate can select “Storyboard Info” from the Root Menu and view the explainer text with a CTA to navigate to the Storyboard Module.
- Candidate can select any of the 5 follow-up questions from the Storyboard Sub-Menu and view its corresponding answer.
- Candidate can return to the Storyboard Sub-Menu from any follow-up answer without losing the main explainer/CTA.
- Candidate can return to the Root Menu from any point within the Storyboard flow.
- Clicking the “Go to Storyboard” CTA navigates the Candidate to the Storyboard Module.

#### Alternate Scenarios

- Candidate selects a follow-up question, then selects “Back to Storyboard Menu”: Storyboard Sub-Menu is displayed again with the main explainer and CTA intact.
- Candidate selects “Back to Main Menu” from any point in this flow: Root Menu is displayed per Story 5.1.

#### Business Rules

- Every answer within the Storyboard Info flow (main explainer and all 5 follow-ups) includes the “Go to Storyboard” CTA.
- The Storyboard Info explainer and its follow-up answers are identical for every Candidate, regardless of target role or progress.

#### Validation Rules / Errors

- No specific validation rules apply to this story.

#### Non-functional Requirements

- No specific non-functional requirements apply beyond those defined in Story 5.1.


### 6.3 — Mock Interview Info `NEW`

#### Requirement Statement

> _As a Candidate, I want to ask the FAQ Bot about the Mock Interview Module, so that I can understand what it does and quickly find answers to common questions before navigating there myself._

#### Story Details

- **Mock Interview Info (Root Menu Item)**
  - Answer Text: “Mock Interview puts you through a realistic, timed interview with an AI interviewer that asks adaptive follow-up questions. You’ll get a full transcript, a score across key competencies, and personalized feedback on what worked and what to improve.”
  - CTA Button: “Go to Mock Interview” (navigates the Candidate to the Mock Interview Module).
  - Mock Interview Sub-Menu: displayed as pills below the Answer Text, containing the following follow-up questions:
    - How long does a mock interview take?
    - Can I retake a mock interview?
    - What feedback do I get afterward?
    - Is there a transcript of my interview?
- **Follow-up Answers (text + CTA)**
  - “How long does a mock interview take?”: “A mock interview takes about 30 minutes.”
  - “Can I retake a mock interview?”: “Yes, you can retry or reattempt a mock interview anytime.”
  - “What feedback do I get afterward?”: “You’ll get a competency-based score, plus specific feedback on what you did well and what could be improved.”
  - “Is there a transcript of my interview?”: “Yes, your interview is transcribed live as you go.”
  - Each follow-up answer above is shown with the same CTA Button: “Go to Mock Interview”.
- **Navigation**
  - CTA Button: “Go to Mock Interview” (shown on the main Mock Interview Info answer and on every follow-up answer, navigates the Candidate to the Mock Interview Module). Displayed below the answer text, never beside it.
  - Back to Mock Interview Menu Button: shown after any follow-up answer, returns Candidate to the Mock Interview Sub-Menu (with the main explainer and CTA still visible). Displayed below the follow-up answer text.
  - Back to Main Menu Button: shown after any follow-up answer, returns Candidate to the Root Menu (per Story 5.1). Displayed below the follow-up answer text.

#### Acceptance Criteria

- Candidate can select “Mock Interview Info” from the Root Menu and view the explainer text with a CTA to navigate to the Mock Interview Module.
- Candidate can select any of the 4 follow-up questions from the Mock Interview Sub-Menu and view its corresponding answer.
- Candidate can return to the Mock Interview Sub-Menu from any follow-up answer without losing the main explainer/CTA.
- Candidate can return to the Root Menu from any point within the Mock Interview flow.
- Clicking the “Go to Mock Interview” CTA (from the main answer or any follow-up) navigates the Candidate to the Mock Interview Module.

#### Alternate Scenarios

- Candidate selects a follow-up question, then selects “Back to Mock Interview Menu”: Mock Interview Sub-Menu is displayed again with the main explainer and CTA intact.
- Candidate selects “Back to Main Menu” from any point in this flow: Root Menu is displayed per Story 5.1.

#### Business Rules

- Every answer within the Mock Interview Info flow (main explainer and all 4 follow-ups) includes the “Go to Mock Interview” CTA.
- The Mock Interview Info explainer and its follow-up answers are identical for every Candidate, regardless of target role or progress.

#### Validation Rules / Errors

- No specific validation rules apply to this story.

#### Non-functional Requirements

- No specific non-functional requirements apply beyond those defined in Story 5.1.


### 6.4 — What's Next in My Roadmap `NEW`

#### Requirement Statement

> _As a Candidate, I want to ask the FAQ Bot what my next recommended step is, so that I can quickly see where to focus without leaving the bot to check my dashboard._

#### Story Details

- **What’s Next in My Roadmap (Root Menu Item)**
  - Answer Text: dynamically sourced from the Candidate’s current “Recommended next step” (the same recommendation already shown on their Dashboard’s Journey Progress Module), for their currently active Target Role.
    - Example: “Your next step is to complete your Interview Essentials course.”
    - Example: “Your next step is to add another experience to your Storyboard.”
    - Example: “Your next step is to take your first Mock Interview.”
  - CTA Button: label and destination are both determined by the same recommended-step data (e.g., “Go to Training”, “Go to Storyboard”, “Go to Mock Interview”, “Go to Analytics Report”).
  - No sub-menu of follow-up questions for this item.
  - Button Placement: the CTA button is displayed below the answer text, never beside it.
- **Navigation**
  - Back to Main Menu Button: shown after the answer, returns Candidate to the Root Menu (per Story 5.1). Displayed below the answer text.

#### Acceptance Criteria

- Candidate can select “What’s Next in My Roadmap” from the Root Menu and view their current recommended next step.
- The displayed recommendation matches exactly what is shown on the Candidate’s Dashboard for their active Target Role at the time of asking, no separate computation or logic is introduced.
- The CTA button label and destination correctly reflect the specific recommended step (Training, Storyboard, Mock Interview, or Analytics Report).
- Candidate can return to the Root Menu after viewing the answer.

#### Alternate Scenarios

- New Candidate with no completed activity: recommendation defaults to the same first-step guidance already shown on their Dashboard (e.g., starting their first course), consistent with the “new user dashboard state” behavior, no separate empty state is needed for this FAQ item.
- Candidate has multiple Target Roles: the recommendation reflects whichever Target Role is currently active/selected for the Candidate at the platform level.

#### Business Rules

- This FAQ item reuses the existing “Recommended next step” logic and data from the Dashboard, it does not introduce a separate recommendation engine or duplicate that computation.
- The recommendation always reflects the Candidate’s currently active Target Role.

#### Validation Rules / Errors

- No specific validation rules apply to this story.

#### Non-functional Requirements

- The displayed recommendation must stay consistent with the Dashboard’s Recommended Next Step at the time the Candidate opens this FAQ item.


### 6.5 — View Latest Report `NEW`

#### Requirement Statement

> _As a Candidate, I want to ask the FAQ Bot about my latest readiness report, so that I can understand what it shows and quickly navigate to it._

#### Story Details

- **View Latest Report (Root Menu Item)**
  - Answer Text (Candidate has at least one completed Mock Interview): “Your report shows your overall readiness score (Ready, Getting There, or Needs Work), plus a breakdown of your scores across each competency: Thinking, Action, People, and Mastery.”
  - CTA Button: “View My Latest Report” (navigates the Candidate to their actual latest report).
  - Report Sub-Menu: displayed as pills below the Answer Text, containing the following follow-up questions:
    - What does my readiness score mean?
    - What are the competency scores based on?
    - Does my report update after each mock interview?
- **Follow-up Answers (text + CTA)**
  - “What does my readiness score mean?”: “Your score falls into one of three bands: 4.5-5.0 is Ready, 3.0-4.4 is Getting There, and 1.0-2.9 is Needs Work.”
  - “What are the competency scores based on?”: “Your competency scores are based on four pillars: Power of Thinking, Power of Action, Power of People, and Power of Mastery.”
  - “Does my report update after each mock interview?”: “Yes, your report reflects your most recently completed Mock Interview and your current Storyboard progress.”
  - Each follow-up answer above is shown with the same CTA Button: “View My Latest Report”.
- **Empty State (Candidate has no completed Mock Interview yet)**
  - Answer Text: “You don’t have a report yet, complete your first Mock Interview to generate one.”
  - CTA Button: “Go to Mock Interview” (navigates the Candidate to the Mock Interview Module instead).
  - Report Sub-Menu is not shown in this state.
- **Navigation**
  - Both CTA Buttons (“View My Latest Report” and “Go to Mock Interview”) are displayed below their respective answer text, never beside it.
  - Back to Report Menu Button: shown after any follow-up answer, returns Candidate to the Report Sub-Menu (with the main explainer and CTA still visible). Displayed below the follow-up answer text.
  - Back to Main Menu Button: shown after any follow-up answer or the empty state, returns Candidate to the Root Menu (per Story 5.1). Displayed below the answer text.

#### Acceptance Criteria

- Candidate with at least one completed Mock Interview sees the report explainer with a CTA to their actual latest report.
- Candidate with no completed Mock Interview sees the empty-state message with a CTA to Mock Interview instead, and no Report Sub-Menu.
- Candidate can select any of the 3 follow-up questions and view its corresponding answer, each with the “View My Latest Report” CTA.
- Candidate can return to the Report Sub-Menu from any follow-up answer without losing the main explainer/CTA.
- Candidate can return to the Root Menu from any point within this flow.

#### Alternate Scenarios

- Candidate has no completed Mock Interview: Empty State is shown instead of the standard explainer and sub-menu.
- Candidate selects a follow-up question, then selects “Back to Report Menu”: Report Sub-Menu is displayed again with the main explainer and CTA intact.
- Candidate selects “Back to Main Menu” from any point in this flow: Root Menu is displayed per Story 5.1.

#### Business Rules

- The Report Sub-Menu and its follow-up questions are only shown when the Candidate has at least one completed Mock Interview.
- Every non-empty-state answer within this flow includes the “View My Latest Report” CTA.

#### Validation Rules / Errors

- No specific validation rules apply to this story.

#### Non-functional Requirements

- No specific non-functional requirements apply beyond those defined in Story 5.1.


### 6.6 — Prepare for Another Role `NEW`

#### Requirement Statement

> _As a Candidate, I want to ask the FAQ Bot about preparing for another role, so that I can understand what it does and start that process directly._

#### Story Details

- **Prepare for Another Role (Root Menu Item)**
  - Answer Text: “Preparing for another role starts a fresh onboarding journey for that new target role. Your existing roles, storyboards, and progress stay untouched, and you can switch between roles anytime.”
  - CTA Button: “Add Another Role” (directly launches the Add New Role onboarding flow, per Story 2.2).
  - Prepare for Another Role Sub-Menu: displayed as pills below the Answer Text, containing the following follow-up question:
    - What do I need to provide to add a new role?
- **Follow-up Answers (text + CTA)**
  - “What do I need to provide to add a new role?”: “Adding a new role follows the same guided onboarding process: selecting your target role, indicating your experience level, and providing a job description with your resume.”
  - This follow-up answer is shown with the same CTA Button: “Add Another Role”.
- **Navigation**
  - CTA Button: “Add Another Role” is displayed below the answer text on both the main answer and the follow-up answer, never beside it.
  - Back to Prepare for Another Role Menu Button: shown after the follow-up answer, returns Candidate to the sub-menu (with the main explainer and CTA still visible). Displayed below the follow-up answer text.
  - Back to Main Menu Button: shown after the follow-up answer, returns Candidate to the Root Menu (per Story 5.1). Displayed below the follow-up answer text.

#### Acceptance Criteria

- Candidate can select “Prepare for Another Role” from the Root Menu and view the explainer text with a CTA that directly launches the Add New Role onboarding flow.
- Candidate can select the follow-up question and view its corresponding answer, with the “Add Another Role” CTA.
- Candidate can return to the sub-menu from the follow-up answer without losing the main explainer/CTA.
- Candidate can return to the Root Menu from any point within this flow.

#### Alternate Scenarios

- Candidate selects the follow-up question, then selects “Back to Prepare for Another Role Menu”: sub-menu is displayed again with the main explainer and CTA intact.
- Candidate selects “Back to Main Menu” from any point in this flow: Root Menu is displayed per Story 5.1.

#### Business Rules

- The “Add Another Role” CTA hooks directly into the existing Add New Role onboarding flow (Story 2.2), no separate onboarding logic is introduced here.

#### Validation Rules / Errors

- No specific validation rules apply to this story.

#### Non-functional Requirements

- No specific non-functional requirements apply beyond those defined in Story 5.1.


### 6.7 — Contact Support `NEW`

#### Requirement Statement

> _As a Candidate, I want to ask the FAQ Bot how to reach support, so that I can quickly get to the Contact Support page when I need help beyond what the bot can answer._

#### Story Details

- **Contact Support (Root Menu Item)**
  - Answer Text: “Need help beyond what I can answer? Our support team can help with account issues, billing questions, or anything else you’re stuck on.”
  - CTA Button: “Contact Support” (navigates the Candidate to the Contact Support page).
  - No sub-menu of follow-up questions for this item.
  - Button Placement: the CTA button is displayed below the answer text, never beside it.
- **Navigation**
  - Back to Main Menu Button: shown after the answer, returns Candidate to the Root Menu (per Story 5.1). Displayed below the answer text.

#### Acceptance Criteria

- Candidate can select “Contact Support” from the Root Menu and view the explainer text with a CTA to navigate to the Contact Support page.
- Clicking the “Contact Support” CTA navigates the Candidate to the Contact Support page.
- Candidate can return to the Root Menu after viewing the answer.

#### Alternate Scenarios

- Candidate selects “Back to Main Menu” after viewing this answer: Root Menu is displayed per Story 5.1.

#### Business Rules

- The “Contact Support” CTA navigates to the existing Contact Support page, no separate support logic or ticketing is introduced by this FAQ item.

#### Validation Rules / Errors

- No specific validation rules apply to this story.

#### Non-functional Requirements

- No specific non-functional requirements apply beyond those defined in Story 5.1.


### 6.8 — Usage & Billing `NEW`

#### Requirement Statement

> _As a Candidate, I want to ask the FAQ Bot for a snapshot of my usage and billing, so that I can quickly check my credits and plan status without leaving the bot._

#### Story Details

- **Usage & Billing (Root Menu Item)**
  - Answer Content: dynamically sourced from the Candidate’s current Credits, Usage & Plan Visibility data, displaying:
    - Usage by Feature
    - Assigned Package / Plan Name
    - Plan Expiry
  - CTA Button: “View Usage & Billing” (navigates the Candidate to the Credits & Usage / Billing page).
  - No sub-menu of follow-up questions for this item.
  - Button Placement: the CTA button is displayed below the answer content, never beside it.
- **Navigation**
  - Back to Main Menu Button: shown after the answer, returns Candidate to the Root Menu (per Story 5.1). Displayed below the answer content.

#### Acceptance Criteria

- Candidate can select “Usage & Billing” from the Root Menu and view a snapshot containing all 3 fields listed above.
- The displayed data matches exactly what is shown on the Candidate’s actual Credits & Usage / Billing page at the time of asking, no separate computation or duplicate data source is introduced.
- Clicking the “View Usage & Billing” CTA navigates the Candidate to the Credits & Usage / Billing page.
- Candidate can return to the Root Menu after viewing the answer.

#### Alternate Scenarios

- Candidate selects “Back to Main Menu” after viewing this answer: Root Menu is displayed per Story 5.1.

#### Business Rules

- This FAQ item reuses the existing Credits, Usage & Plan Visibility data, it does not introduce a separate computation or data source.

#### Validation Rules / Errors

- No specific validation rules apply to this story.

#### Non-functional Requirements

- The displayed snapshot must stay consistent with the Candidate’s actual Credits & Usage / Billing page at the time the Candidate opens this FAQ item.


---

## Epic 7: Mock Interview Module

> **Status: not yet specified.** The base document carried this epic as a
> placeholder containing template text only (no real story details). The stories below are
> the agreed scope headings; they require full specification before development.

- **7.1 — Start AI Mock Interview**
- **7.2 — Participate in Audio / Video Interviews**
- **7.3 — Receive Dynamic Follow-Up Questions**
- **7.4 — View Live Transcriptions**
- **7.5 — Receive AI Feedback & Recommendations**
- **7.6 — Retry Mock Interviews**

## Epic 8: Analytics Report & AI Coach

> **Status: not yet specified.** This module appears in the feature readiness tracker
> with no source story and no written specification. It needs to be scoped and written before
> it can be estimated.

Known context from elsewhere in this document:

- The Candidate Dashboard (3.1) surfaces an **Overall Interview Readiness Score** and a
  pillar-wise breakdown, and recommends improvement areas based on the weakest pillars.
- The AI FAQ Assistant (6.5) offers a **View Latest Report** answer that navigates the
  Candidate to their latest readiness report.
- Mock Interview (Epic 7) is expected to produce a score across competencies plus feedback.

Whoever writes this epic will need to confirm whether the "report" referenced by 3.1 and 6.5
is this module, or a separate artefact.

## Epic 9: Payments & Subscription Management

Plan selection is driven by the Bundle catalogue defined by the Super Admin in Super Admin Epic 7. Payment methods and invoice history remain in 9.4, retained from the original billing story.

### 9.1 — Manage Subscription — Catalog, Subscribe, Switch, Cancel `UPDATED`

#### Requirement Statement

> _As a Candidate user, I want to view my current plan and select or switch the Bundle I’m subscribed to, so that I can access the platform features that fit my interview preparation needs._

#### Story Details

- The Candidate should be able to access a dedicated Payments & Subscription section.

- **Subscription Overview** displays:

  - If no paid Bundle is active: “Current Plan: Free,” with a prompt to browse plans.

  - If a paid Bundle is active: Bundle Name, Billing Cycle, Price, Next Billing Date, Included Items (Mock Interviews, Storyboards, Masterclass modules, as configured on the Bundle).

  - If a cancellation is pending: an indicator showing paid access continues until the end of the current cycle, after which the account reverts to Free.

- **Bundle Catalog**, accessible from Subscription Overview:

  - Lists all Bundles with Type “B2C” and Status “Active”

  - Each listing displays: Bundle Name, Included Items, Price per Billing Cycle (only the cycle(s) the Super Admin enabled for that specific Bundle)

  - “Subscribe” action if the Candidate is on Free; “Switch to this Bundle” action if already on a different paid Bundle

- **Subscribe / Switch Bundle** flow:

  - Select Billing Cycle: radio button, showing only the Billing Cycle option(s) enabled for the selected Bundle (Mandatory)

  - Review: displays Bundle Name, Billing Cycle, Price

  - Proceeds to Stripe checkout using the Candidate’s saved payment method, or entry of a new card

  - Upon successful completion: the selected Bundle becomes active immediately, replacing whatever was active before (Free or a previous paid Bundle) immediately, with no carryover

  - If selected while a cancellation is pending: the pending cancellation is cleared and the new Bundle takes over immediately, same as a normal switch

- **Cancel Subscription** (available only while a paid Bundle is active):

  - Confirmation prompt explaining that paid access continues through the end of the current Billing Cycle, billing will not renew, and the account will revert to Free once the cycle ends

  - Upon confirmation: the subscription is marked for cancellation; no further billing occurs

#### Acceptance Criteria

- Candidate can access the Payments & Subscription section successfully.

- Subscription Overview correctly reflects Free, active paid Bundle, or pending-cancellation state.

- Bundle Catalog displays only Active B2C-type Bundles, each showing only its own enabled Billing Cycle(s).

- Candidate can select an available Billing Cycle and complete payment successfully via Stripe.

- Upon confirmation, the new Bundle becomes active immediately and is reflected in Subscription Overview without delay.

- Candidate can cancel a paid Bundle successfully.

- Paid access correctly continues through the end of the current Billing Cycle after cancellation.

- Account correctly reverts to Free once the cycle ends following cancellation.

- Selecting a new Bundle during a pending cancellation correctly clears that cancellation and proceeds as a switch.

#### Alternate Scenarios

- Payment fails during checkout: the subscribe/switch does not take effect, Candidate is returned to the Review step.

- Candidate attempts to cancel with no active paid Bundle: action is unavailable.

- Candidate has zero free allocation remaining at the point they revert to Free (having used it up prior to their first subscription).

#### Business Rules

- The free baseline is a one-time, system-level allocation granted at account creation; it is not part of the Bundle framework and is not renewable.

- Subscribing to a paid Bundle for the first time replaces the free baseline immediately; any portion of the free allocation already used is not restored, and remaining free allocation does not carry into the paid Bundle.

- Switching between paid Bundles takes effect immediately, replacing the previous Bundle’s entitlements right away, with no continuation period — consistent with the B2B Admin model.

- Cancelling a paid Bundle does not revoke access immediately; the Candidate keeps paid access through the end of the Billing Cycle already paid for, with no refund.

- Once the post-cancellation cycle ends, the Candidate reverts to the free baseline, reflecting whatever portion of the original one-time free allocation was left unused before they first subscribed — not reset or renewed.

#### Validation Rules / Errors

- Select Billing Cycle:

  - Condition: Mandatory

  - Error: “Please select a billing cycle.”

- Payment Method:

  - Error: “Please enter valid card details.”

  - Error: “Unable to process payment at the moment.”

#### Non-functional Requirements

- Payment information must be securely handled via Stripe; sensitive card information is not stored directly on the platform.

- Subscription Overview and Bundle Catalog should load within an acceptable response time.

- Subscribe, switch, and cancellation actions should be logged for audit purposes.


### 9.2 — Upgrade Plan CTA Touchpoints `NEW`

> **Status: outline only.** Added to the feature readiness tracker as *PAY 3.2*.
> The four touchpoints below are the agreed scope; no story details, acceptance criteria
> or validation rules have been written yet.

#### Requirement Statement

> _As a Candidate on the Free plan or approaching a usage limit, I want to be prompted to
> upgrade at the moment the limit becomes relevant, so that I can continue without hunting
> for the subscription page._

#### Scope — Touchpoints to be specified

- **Upgrade modal** — the shared modal presented when an upgrade is triggered
- **Usage limit prompts** — shown at the point a Storyboard, Mock Interview or Masterclass
  allocation is exhausted
- **Dashboard widget** — a persistent upgrade entry point on the Candidate dashboard
- **One-time nudge** — a single non-repeating prompt, trigger and dismissal rules to be defined

#### Open Questions

- What triggers each touchpoint, and can more than one fire at once?
- Does the one-time nudge reset on plan change, or never repeat?
- Do all four route into the Bundle Catalog (9.1), or straight to Purchase Add-Ons (9.3)?


### 9.3 — Purchase Add-Ons `NEW`

#### Requirement Statement

> _As a Candidate user, I want to purchase additional Mock Interview, Storyboard, and/or Masterclass usage, so that I’m not limited by my current plan’s included allocation, whether I’m on the Free baseline or a paid Bundle._

#### Story Details

- Accessible via a “Purchase Add-Ons” action from the Payments & Subscription section, available regardless of whether the Candidate is on Free or a paid Bundle.

- Also reachable in-context from the Storyboard Generation flow (Story 6.3): when the Candidate reaches their allocated storyboard version limit, the prompt to purchase a Storyboard Version Add-on opens this same flow with Storyboard pre-selected.

- **Select Items**: checkbox multi-select — Mock Interview, Storyboard, Masterclass (Mandatory, minimum 1 selected)

- For each selected item, its own configuration section appears:

  - Mock Interview / Storyboard: Enter Quantity — numeric input, minimum 1 (Mandatory)

  - Masterclass: displays the full list of modules, all selected by default, each individually deselectable; at least one module must remain selected (Mandatory). Price for this item recalculates dynamically as modules are deselected: full Add-On Rate minus the proportional share of each deselected module

- **Review**: displays a line item per selected item type (Item, Quantity or selected Modules, Price), and a Total Price summing all selected items

- Proceeds to Stripe checkout using the Candidate’s saved payment method, or entry of a new card

- Upon successful completion: the purchased quantity/module access for each item is added to the Candidate’s account immediately, on top of whatever they currently have from their Free baseline or active paid Bundle

#### Acceptance Criteria

- Candidate can access Purchase Add-Ons from the Payments & Subscription section, on Free or any paid Bundle.

- Candidate can access the same flow via the in-context prompt in Storyboard Generation, with Storyboard pre-selected.

- At least one item type must be selected to proceed.

- Multiple item types can be selected and configured within the same transaction.

- For Mock Interview/Storyboard, quantity entry correctly requires a minimum of 1\.

- For Masterclass, module deselection correctly recalculates that item’s price proportionally.

- Review correctly displays a line item per selected item type and an accurate Total Price.

- Candidate can complete payment successfully via Stripe.

- Upon confirmation, purchased usage/modules are added to the Candidate’s account immediately.

#### Alternate Scenarios

- Candidate deselects all items: action is blocked, minimum one item must remain selected.

- Candidate deselects all Masterclass modules while Masterclass is selected: blocked, minimum one module must remain selected.

- Payment fails during checkout: none of the selected add-ons are applied.

- Candidate reaches the Storyboard limit mid-generation, is redirected into this flow with Storyboard pre-selected, completes purchase, and resumes generation.

#### Business Rules

- Multiple item types (Mock Interview, Storyboard, Masterclass) can be purchased together in a single transaction.

- Add-on purchases use the Add-On Rate (B2C) configured by the Super Admin, not the Global Rate used for Bundle composition.

- Masterclass Add-On pricing follows the fixed per-module share model: the Add-On Rate is divided into fixed shares per module, and deselecting a module reduces the price by that module’s share.

- Add-on purchases are available regardless of subscription status; the Candidate does not need an active paid Bundle to buy add-ons.

- Add-on usage is applied immediately upon successful payment; it is not tied to or delayed by any Billing Cycle.

#### Validation Rules / Errors

- Select Items:

  - Condition: Mandatory, minimum 1

  - Error: “Please select at least one item.”

- Enter Quantity (Mock Interview/Storyboard):

  - Condition: Mandatory, minimum 1

  - Error: “Please enter a valid quantity.”

- Select Modules (Masterclass):

  - Condition: at least 1 module required

  - Error: “Please select at least one module.”

- Payment Method:

  - Error: “Please enter valid card details.”

  - Error: “Unable to process payment at the moment.”

#### Non-functional Requirements

- Payment information must be securely handled via Stripe; sensitive card information is not stored directly on the platform.

- Add-on price recalculation on quantity/module changes should feel instantaneous to the user.

- Add-on purchases should be logged for audit purposes.


### 9.4 — Billing — Payment Methods & Invoices `RE-SCOPED`

> **Re-scoped.** This story is retained for payment methods and invoice history only. Its original *Purchase Additional Interviews* section is now covered by 9.3, and plan selection by 9.1.

#### Requirement Statement

> _As a Candidate user, I want to manage my payment methods and view my invoice and payment history, so that I can keep my billing details current and track what I have been charged._

#### Story Details

- **Payment Method Management**
  - The Candidate should be able to:
    - View saved payment method/card details
    - Add a new card
    - Remove an existing card
    - Set/update default payment method
- **Invoice & Payment History**
  - The Candidate should be able to:
    - View the list of invoices/payments made
    - View invoice details:
      - Invoice Number
      - Payment Date
      - Amount
      - Payment Status
      - Download invoices/receipts
- **Filters**
  - The Candidate should be able to filter invoices by:
    - Date Range

#### Acceptance Criteria

- The Candidate can access the Billing & Subscription section successfully.
- Stripe-integrated payment methods display correctly.
- Candidates can add/remove/update payment methods successfully.
- Invoice/payment history displays correctly.
- Date filters update the invoice listing accordingly.
- The Candidate can download invoices successfully.

#### Alternate Scenarios

- Invalid card details entered.
- Stripe payment fails.
- No invoices available for the selected date range.
- Invoice download temporarily unavailable.

#### Non-functional Requirements

- Payment information must be securely handled via Stripe.
- Sensitive card information should not be stored directly in the platform.
- Billing data should load within an acceptable response time.
- Invoice history should support scalable retrieval and filtering.
- Dynamic pricing calculations should reflect configured pricing accurately.

#### Validation Rules / Errors

- “Please enter valid card details.”
- “Please enter a valid number of interviews.”
- “Unable to process payment at the moment.”
- “Unable to add payment method at the moment.”
- “No invoices found for selected date range.”
- “Invoice download failed. Please try again.”


---

## Epic 10: Profile & Account Management

### 10.1 — View & Edit My Profile `UPDATED`

#### Requirement Statement

> _As a Candidate, I want to view and edit my profile details captured during onboarding, so that I can keep my information accurate as I progress through the platform._

#### Story Details

- The Candidate should be able to access a dedicated **My Profile** section from the platform.
- The profile should display the information captured during the Guided Candidate Onboarding Journey.
- All editable fields are directly editable within My Profile; the edit workflow follows the same View Profile Details / Edit Profile Details pattern used elsewhere on the platform.
- **Personal Details**
  - Candidate Name: text field (Editable)
  - Email Address: text field (Editable)
- **Target Role**
  - Target Role: view-only field, displays the Candidate’s current target role.
  - Target Role cannot be changed from My Profile. Adding an additional target role is a separate action, performed only through the Global Multi-Role option on the Dashboard or the Add New Role flow; it is out of scope for this story.
- **Experience Details**
  - Experience Category: single-select (Editable)
    - Fresh Grad
    - Undergrad
    - Diploma Holder
    - Experienced Professional
  - Experience Bracket: single-select (Editable), shown only when Experience Category is “Experienced Professional”
    - 1-5 years
    - 5-10 years
    - 10+ years
  - Last School/University Attended: text field (Editable, Optional), shown for Fresh Grad, Undergrad, and Diploma Holder
  - Last Workplace: text field (Editable, Optional), shown for Experienced Professional
  - Industry: text field/dropdown (Editable, Optional)
- **Job Description & Resume**
  - Job Description: view-only, displays the currently saved JD with a link that navigates the Candidate to the Storyboard Module to update it. Not directly editable within My Profile.
  - Resume: view-only, displays the currently uploaded file name with a link that navigates the Candidate to the Storyboard Module to replace it. Not directly editable within My Profile.
- **Account Security**
  - Password: Update Password option available, requiring current password, new password, and confirm new password.
  - For Candidates who signed up via Google or LinkedIn (no platform password set), the Update Password option is replaced with an explanatory message instead of the password fields: “Password management isn’t available because you signed in with [Google/LinkedIn]. To manage your password, visit your [Google/LinkedIn] account settings.”

#### Acceptance Criteria

- The Candidate can access My Profile successfully.
- All onboarding-captured profile details display correctly.
- The Candidate can edit Name, Email, Experience Category, Experience Bracket, School/University, Last Workplace, and Industry successfully.
- Target Role displays correctly and cannot be edited from My Profile.
- The Experience Bracket field appears only when Experience Category is set to Experienced Professional.
- The School/University field appears only for Fresh Grad, Undergrad, and Diploma Holder.
- The Last Workplace field appears only for Experienced Professional.
- Job Description and Resume display correctly with a working link to the Storyboard Module.
- The Candidate can update their password successfully when a platform password exists.
- Candidates who signed up via Google or LinkedIn see the explanatory message instead of password fields.

#### Alternate Scenarios

- Candidate clears a mandatory field (Name, Email, or Experience Category) and attempts to save: save is blocked with a validation message.
- Candidate switches Experience Category from Experienced Professional to another category: the Experience Bracket field is hidden and the School/University field appears instead.
- Candidate enters an invalid email format: save is blocked with a validation message.
- Candidate enters a new password that does not meet security requirements: save is blocked with a validation message.
- Candidate enters mismatched New Password and Confirm Password values: save is blocked with a validation message.
- Candidate enters an incorrect current password: password update is blocked with an error message.
- Save action fails temporarily.
- Candidate clicks the Job Description or Resume link: Candidate is redirected to the Storyboard Module.

#### Business Rules

- Job Description and Resume are not editable within My Profile; updates to these are made through the Storyboard Module only.
- Target Role is read-only within My Profile; it cannot be changed here. Adding a new target role is not performed from My Profile; it remains accessible only through the Dashboard’s Global Multi-Role option or the Add New Role flow.
- Candidates without a platform password (social login only) cannot use the Update Password option and instead see an explanatory message.

#### Validation Rules / Errors

- Name:
  - Condition: required
  - Error: “Please enter your name”
- Email Address:
  - Condition: required, valid email format
  - Error: “Please enter a valid email address.”
- Experience Category:
  - Condition: required
  - Error: “Please select your experience level”
- Experience Bracket:
  - Condition: required when Experience Category is Experienced Professional
  - Error: “Please select your experience bracket”
- New Password:
  - Condition: minimum 8 characters, one uppercase letter, one lowercase letter, one number, one special character
  - Error: “Password does not meet security requirements.”
- Confirm New Password:
  - Condition: must match New Password
  - Error: “Password and Confirm Password do not match.”
- Current Password:
  - Condition: must match existing password
  - Error: “Current password is incorrect.”
- Save action:
  - Error: “Unable to save profile changes at the moment.”

#### Non-functional Requirements

- Profile data should load within an acceptable response time.
- Sensitive account information, including password data, must be securely stored and never displayed in plain text.
- Profile updates should be reflected in near real time.
- Validation checks should occur before saving updated information.


### 10.2 — Reset Password

#### Requirement Statement

> _As Candidate User, I want to reset my password if I forget it, so that I can securely regain access to my account._

#### Story Details

- The Candidate should be able to reset their password through a simple Forgot Password flow.
- The flow should include:
  - “Forgot Password?” option on the login screen
  - Enter registered Email Address
  - System sends password reset link to email
  - Clicking the link redirects the user to the Reset Password screen
  - Candidate sets a new password
  - Candidate confirms the new password
  - The Candidate can log in successfully using the updated password
- Password Rules
  - The new password must:
    - Be at least 8 characters long
  - Contain:
    - One uppercase letter
    - One lowercase letter
    - One number
    - One special character

#### Acceptance Criteria

- The Candidate can access the Forgot Password flow from the Login screen.
- Password reset email has been sent successfully.
- Reset link redirects the user to the Reset Password page.
- Password validation rules are enforced.
- Password and Confirm Password must match.
- The Candidate can log in successfully using the new password.

#### Alternate Scenarios

- Invalid/unregistered email entered.
- Expired or invalid reset link.
- Weak password entered.
- Password and Confirm Password mismatch.

#### Non-functional Requirements

- Reset links should be secure and time-bound.
- Passwords should be encrypted and securely stored.
- The password reset process should follow security best practices.

#### Validation Rules / Errors

- “Email address not found.”
- “Reset link has expired.”
- “Password does not meet security requirements.”
- “Password and Confirm Password do not match.”


### 10.3 — Revoke Consent / Delete Account

#### Requirement Statement

> _As a Candidate user, I want to revoke my consent and request account deletion, so that my personal data can be removed in compliance with GDPR and privacy regulations._

#### Story Details

- The Candidate should be able to access a Delete Account / Revoke Consent option from Profile & Account Settings.
- The flow should allow the Candidate to:
  - Request account deletion
  - Revoke consent for data processing
  - View a confirmation warning before proceeding
  - Confirm deletion request
- Once confirmed:
  - The account will be marked for deletion
  - Candidate access will be disabled
  - Associated personal data will be deleted/anonymized as per GDPR policy
- The system should also:
  - Display a confirmation message once the request is submitted
  - Maintain audit logs for compliance purposes

#### Acceptance Criteria

- The Candidate can access the Delete Account option successfully.
- Confirmation warning is displayed before deletion.
- The Candidate must explicitly confirm the deletion request.
- Account access is revoked after a successful request.
- Personal data is deleted/anonymized as per GDPR policy.
- System logs deletion request for audit/compliance tracking.

#### Alternate Scenarios

- System temporarily unable to process deletion requests.
- Account already scheduled for deletion.

#### Non-functional Requirements

- Account deletion should comply with GDPR/privacy regulations.
- Sensitive user data should be securely deleted or anonymized.
- The system should maintain compliance audit logs.
- Deletion requests should be processed securely.

#### Validation Rules / Errors

- “Please confirm account deletion to proceed.”
- “Unable to process deletion requests at the moment.”
- “Your account is already scheduled for deletion.”


### 10.4 — Contact Support

#### Requirement Statement

> _As a Candidate user, I want to contact the ProofDive support team through the platform so that I can raise issues, ask questions, or request assistance when needed._

#### Story Details

- The Candidate should be able to access a Contact Support option from the platform.
- The flow should include:
  - A free-text input box where the Candidate can describe their issue/request
  - A “Send” button to submit the support request
- The submitted message should be sent to the configured ProofDive support email
- The support request should include:
  - Candidate Name
  - Candidate Email
  - Submitted Message
  - Submission Timestamp
- After successful submission:
  - The system displays a confirmation message to the Candidate

#### Acceptance Criteria

- The Candidate can access Contact Support successfully.
- The Candidate can enter a support message in the free text field.
- Support request is sent successfully to ProofDive support email.
- Confirmation message is displayed after successful submission.
- Empty support requests cannot be submitted.

#### Alternate Scenarios

- Empty message submitted.
- Support request fails due to a temporary system issue.
- Email service temporarily unavailable.

#### Non-functional Requirements

- Support requests should be transmitted securely.
- The submission process should be completed within an acceptable response time.
- The system should maintain logs of submitted support requests.

#### Validation Rules / Errors

- “Please enter your message before sending.”
- “Unable to send support request at the moment.”
- “Your support request has been submitted successfully.”


### 10.5 — View Audit Logs

#### Requirement Statement

> _As a Candidate user, I want to view activity logs related to my actions and account activity, so that I can track important actions and maintain visibility of changes performed on the platform._

#### Story Details

- The Candidate should be able to access an Audit Logs section displaying a list of activity records.
- Each log entry should display:
  - One-line description of activity performed
  - Performed By
  - Timestamp
  - Search & Filters
- Candidates should be able to:
  - Search logs
  - Filter logs by:
    - Date Range
    - Activity Type
    - Clear Logs
- Candidates should be able to:
  - Remove individual log entries using “X.”
  - Clear all logs
  - Example Logs
    - “[User] created a new JD for Senior Product Manager.”
    - “[User] generated interview link for Software Engineer JD.”
    - “[User] copied interview link for Marketing Associate JD.”
    - “[User] disabled interview submissions for Product Designer JD.”
    - “[User] re-enabled interview submissions for Data Analyst JD.”
    - “[User] downloaded candidate report for John Doe.”
    - “[User] bulk downloaded candidate reports for Business Analyst JD.”
    - “[User] purchased 50 additional interview credits.”

#### Acceptance Criteria

- The Candidate can access Audit Logs successfully.
- Audit logs display activity description, performed by, and timestamp.
- Search and filters update logs accordingly.
- The Candidate can clear individual logs.
- The Candidate can clear all logs successfully.

#### Alternate Scenarios

- No logs available.
- Search/filter returns no results.
- Clear log action fails temporarily.

#### Non-functional Requirements

- Audit logs should load within an acceptable response time.
- Logs should maintain chronological accuracy.
- Search and filters should update results dynamically.

#### Validation Rules / Errors

- “No audit logs found.”
- “Unable to clear audit log at the moment.”
- “Unable to load audit logs.”


---

## Epic 11: Notifications Module

### 11.1 — Receive Notifications

#### Requirement Statement

> _As a Candidate user, I want to receive important platform notifications so that I can stay informed about candidate activity, billing updates, and platform-related actions._

#### Story Details

- The platform should support:
  - In-App Notifications
  - Email Notifications
  - Email Notifications
- The Candidate should receive email notifications for:
  - Account invitation/sign-up
  - Password reset/change requests
  - Invoice/payment confirmations
  - Add-on purchase confirmations
  - In-App Notifications
  - Terms and conditions or policy updates
- The Candidate should receive in-app notifications for:
  - New candidate interview submission
  - New candidate report generated
  - Invoice generated/ready
  - Additional interview credits successfully added
  - Subscription/add-on updates
- Each notification should display:
  - Notification message
  - Timestamp

#### Acceptance Criteria

- Candidate receives email notifications successfully for account and billing-related actions.
- Candidate receives in-app notifications for candidate and subscription activities.
- Notifications display the correct message and timestamp.
- New notifications appear in real-time or near real-time.

#### Alternate Scenarios

- Notification delivery delayed temporarily.
- No notifications available.
- Email service temporarily unavailable.

#### Non-functional Requirements

- Notifications should be delivered within an acceptable response time.
- Email notifications should be securely triggered through a configured email service.
- Notification timestamps should reflect accurate activity time.
- The notification system should support scalable delivery handling.

#### Validation Rules / Errors

- “Unable to load notifications.”
- “Notification delivery failed.”
- “No notifications available.”


### 11.2 — Receive Terms & Policy Updates

#### Requirement Statement

> _As a Candidate user, I want to receive notifications regarding policy or terms updates, so that I remain compliant with platform requirements._

#### Story Details

- The platform should notify the Candidate whenever there are updates to:
  - Terms & Conditions
  - Privacy Policy
  - Platform Policies
- Notifications may be delivered through:
  - In-App Notifications
  - Email Notifications
- Each notification should include:
  - Update title/summary
  - Effective date
  - Link to view updated policy/terms
- The Candidate should be able to view and acknowledge the updated policy when required.

#### Acceptance Criteria

- The Candidate receives notification when terms or policies are updated.
- The notification displays the update summary and effective date.
- The Candidate can access/view the updated policy document.
- Email notification is triggered successfully when applicable.
- System records acknowledgement if required.

#### Alternate Scenarios

- Notification delivery delayed temporarily.
- The Candidate does not acknowledge the policy update immediately.
- Email notification service temporarily unavailable.

#### Non-functional Requirements

- Notifications should be delivered within an acceptable response time.
- Policy update records should be securely maintained.
- Notification timestamps should reflect the accurate update time.

#### Validation Rules / Errors

- “Unable to load policy update.”
- “Notification delivery failed.”
- “No policy updates available.”


---

# Appendix A — Traceability Matrix

Maps every story in this document back to its origin.

| Persona | New ID | Story | Origin | Status |
| --- | --- | --- | --- | --- |
| Super Admin | 1.1 | Dashboard & Analytics | Base doc — Base 1.1 | Carried forward |
| Super Admin | 2.1 | View & Edit Organization Listings | Base doc — Base 2.1 | Carried forward |
| Super Admin | 2.2 | Add New Organization | Base doc — Base 2.2 | Carried forward |
| Super Admin | 2.3 | Deactivate / Reactivate Organization | Base doc — Base 2.3 | Carried forward |
| Super Admin | 3.1 | View & Edit Partner Listings | Base doc — Base 3.1 | Carried forward |
| Super Admin | 3.2 | Add New Partner | Base doc — Base 3.3 | Carried forward |
| Super Admin | 3.3 | Deactivate / Reactivate Partner | Base doc — Base 3.4 | Carried forward |
| Super Admin | 4.1 | View & Edit Employer Listings | Base doc — Base 4.1 | Carried forward |
| Super Admin | 4.2 | Add New Employer | Base doc — Base 4.2 | Carried forward |
| Super Admin | 4.3 | Deactivate / Reactivate Employer | Base doc — Base 4.3 | Carried forward |
| Super Admin | 5.1 | View & Edit Existing Course Listings | Base doc — Base 5.1 | Carried forward |
| Super Admin | 5.2 | Add New Course Listings | Base doc — Base 5.2 | Carried forward |
| Super Admin | 5.3 | Deactivate / Reactivate Course | Base doc — Base 5.3 | Carried forward |
| Super Admin | 6.1 | View & Edit Existing Competency Listings | Base doc — Base 6.1 | Carried forward |
| Super Admin | 6.2 | Update Competency as a New Version | Base doc — Base 6.2 | Carried forward |
| Super Admin | 6.3 | Deactivate / Reactivate Competency | Base doc — Base 6.3 | Carried forward |
| Super Admin | 7.1 | Set Price — Global & Add-On Rate Configuration | Payments/CR doc — Payments 1.1 | New |
| Super Admin | 7.2 | Bundle Listing — Payments Module Overview | Payments/CR doc — Payments 1.2 | New |
| Super Admin | 7.3 | Create New Bundle — Bundle Configuration | Payments/CR doc — Payments 1.3 | New |
| Super Admin | 7.4 | View & Edit Bundle — Bundle Detail & Configuration Management | Payments/CR doc — Payments 1.4 | New |
| Super Admin | 7.5 | Deactivate / Reactivate Bundle | Payments/CR doc — Payments 1.5 | New |
| Super Admin | 7.6 | Discount Code Listing | Payments/CR doc — Payments 1.6 | New |
| Super Admin | 7.7 | Generate Discount Code | Payments/CR doc — Payments 1.7 | New |
| Super Admin | 7.8 | View & Manage Discount Code — Detail & Status Management | Payments/CR doc — Payments 1.8 | New |
| Super Admin | 8.1 | View Commissions & Payouts Listing | Payments/CR doc — Commission 1.1 | New |
| Super Admin | 8.2 | View Commission Detail | Payments/CR doc — Commission 1.2 | New |
| Super Admin | 9.1 | Manage Support Requests | Base doc — Base 7.1 | Carried forward |
| Super Admin | 10.1 | Receive Notifications | Base doc — Base 8.1 | Carried forward |
| Super Admin | 11.1 | View & Edit My Profile | Base doc — Base 9.1 | Carried forward |
| Super Admin | 11.2 | Reset Password | Base doc — Base 9.2 | Carried forward |
| Super Admin | 11.3 | View Audit Logs | Base doc — Base 9.3 | Carried forward |
| Org / Tenant Admin | 1.1 | Account Activation & Login with Email & Password | Base doc — Base 1.1 | Carried forward |
| Org / Tenant Admin | 1.2 | Forgot Password | Base doc — Base 1.2 | Carried forward |
| Org / Tenant Admin | 2.1 | B2B Admin Dashboard & Analytics | Base doc — Base 2.1 | Carried forward |
| Org / Tenant Admin | 3.1 | View User / Candidate Listings | Base doc — Base 3.1 | Carried forward |
| Org / Tenant Admin | 3.2 | Add New User / Candidate — CSV & Manual Invite | Base doc — Base 3.2 | Carried forward |
| Org / Tenant Admin | 4.1 | Manage Subscription | Payments/CR doc — Payments 2.1 | Conflict — see Appendix B |
| Org / Tenant Admin | 4.2 | Billing — Payment Methods & Invoices | Base doc — Base 4.3 — re-scoped | Retained, re-scoped |
| Org / Tenant Admin | 4.3 | Purchase Add-Ons — Org-wide Usage Top-Up | Payments/CR doc — Payments 2.2 | New |
| Org / Tenant Admin | 5.1 | View & Edit My Profile Details | Base doc — Base 4.1 (labelled 3.1 in source) | Carried forward |
| Org / Tenant Admin | 5.2 | Reset Password | Base doc — Base 4.2 | Carried forward |
| Org / Tenant Admin | 5.3 | Revoke Consent / Delete Account | Base doc — Base 4.4 | Carried forward |
| Org / Tenant Admin | 5.4 | Contact Support | Base doc — Base 4.5 | Carried forward |
| Org / Tenant Admin | 5.5 | View Audit Logs | Base doc — Base 4.6 | Carried forward |
| Org / Tenant Admin | 6.1 | Receive Notifications | Base doc — Base 5.1 | Carried forward |
| Org / Tenant Admin | 6.2 | Receive Terms & Policy Updates | Base doc — Base 5.2 | Carried forward |
| Partner / Affiliate | 1.1 | Account Activation & Login with Email & Password | Base doc — Base 1.1 | Carried forward |
| Partner / Affiliate | 1.2 | Forgot Password | Base doc — Base 1.2 | Carried forward |
| Partner / Affiliate | 2.1 | Partner Dashboard & Analytics — Signups, Earnings, Referral Code, Conversion Funnel | Base doc — Base 2.1 | Carried forward |
| Partner / Affiliate | 3.1 | View Commissions & Payouts | Payments/CR doc — Commission 3.1 | New |
| Partner / Affiliate | 3.2 | Withdraw Funds | Payments/CR doc — Commission 3.2 | New |
| Partner / Affiliate | 4.1 | View & Edit My Profile Details | Base doc — Base 4.1 | Carried forward |
| Partner / Affiliate | 4.2 | Reset Password | Base doc — Base 4.2 | Carried forward |
| Partner / Affiliate | 4.3 | Manage Billing & Subscription | Base doc — Base 4.3 | Carried forward |
| Partner / Affiliate | 4.4 | Revoke Consent / Delete Account | Base doc — Base 4.4 | Carried forward |
| Partner / Affiliate | 4.5 | Contact Support | Base doc — Base 4.5 | Carried forward |
| Partner / Affiliate | 4.6 | View Audit Logs | Base doc — Base 4.6 | Carried forward |
| Partner / Affiliate | 5.1 | Receive Notifications | Base doc — Base 5.1 | Carried forward |
| Partner / Affiliate | 5.2 | Receive Terms & Policy Updates | Base doc — Base 5.2 | Carried forward |
| Employer | 1.1 | Account Activation & Login with Email & Password | Base doc — Base 1.1 | Carried forward |
| Employer | 1.2 | Forgot Password | Base doc — Base 1.2 | Carried forward |
| Employer | 2.1 | Employer Dashboard & Analytics | Base doc — Base 2.1 | Carried forward |
| Employer | 3.1 | View JD Listings & Candidate Reports | Base doc — Base 3.1 | Carried forward |
| Employer | 3.2 | Add New JD / Generate Interview Link | Base doc — Base 3.2 | Carried forward |
| Employer | 4.1 | View & Edit Profile Details | Base doc — Base 4.1 | Carried forward |
| Employer | 4.2 | Reset Password | Base doc — Base 4.2 | Carried forward |
| Employer | 4.3 | Manage Billing & Subscription | Base doc — Base 4.3 — outside bundle model | Conflict — see Appendix B |
| Employer | 4.4 | Revoke Consent / Delete Account | Base doc — Base 4.4 | Carried forward |
| Employer | 4.5 | Contact Support | Base doc — Base 4.5 | Carried forward |
| Employer | 4.6 | View Audit Logs | Base doc — Base 4.6 | Carried forward |
| Employer | 5.1 | Receive Notifications | Base doc — Base 5.1 | Carried forward |
| Employer | 5.2 | Receive Terms & Policy Updates | Base doc — Base 5.2 | Carried forward |
| Candidate | 1.1 | Candidate Sign In | Base doc — Base 1.1 | Carried forward |
| Candidate | 1.2 | Candidate Sign Up | Base doc — Base 1.2 | Carried forward |
| Candidate | 1.3 | Social Sign Up — Google & LinkedIn | Payments/CR doc — Social Login 1.3 | New |
| Candidate | 1.4 | Social Sign In — Google & LinkedIn | Payments/CR doc — Social Login 1.4 | New |
| Candidate | 1.5 | Forgot Password | Base doc — Base 1.3 | Carried forward |
| Candidate | 2.1 | Guided Candidate Onboarding Journey | Payments/CR doc — CR — supersedes Base 2.1 | Updated flow applied |
| Candidate | 2.2 | Add New Role for Existing User | Base doc — Base 2.2 | Outline only |
| Candidate | 3.1 | Candidate Dashboard & Readiness Progress | Payments/CR doc — CR — supersedes Base 3.1 | Updated flow applied |
| Candidate | 4.1 | Complete Training Course | Base doc — Base 5.1 | Carried forward |
| Candidate | 5.1 | Create New Storyboard | Payments/CR doc — CR — supersedes Base 6.1 | Updated flow applied |
| Candidate | 5.2 | Enrich Storyboard / Add Competency | Payments/CR doc — CR — supersedes Base 6.2 | Updated flow applied |
| Candidate | 5.3 | Competency-Based Storyboard View | Payments/CR doc — CR — supersedes Base 6.3 | Updated flow applied |
| Candidate | 5.4 | Download Storyboards | Payments/CR doc — CR — supersedes Base 6.4 | Updated flow applied |
| Candidate | 6.1 | Access FAQ Bot — Avatar, Chat Shell, Root Menu | Payments/CR doc — FAQ 5.1 | New |
| Candidate | 6.2 | Storyboard Info | Payments/CR doc — FAQ 5.2 | New |
| Candidate | 6.3 | Mock Interview Info | Payments/CR doc — FAQ 5.3 | New |
| Candidate | 6.4 | What's Next in My Roadmap | Payments/CR doc — FAQ 5.4 | New |
| Candidate | 6.5 | View Latest Report | Payments/CR doc — FAQ 5.5 | New |
| Candidate | 6.6 | Prepare for Another Role | Payments/CR doc — FAQ 5.6 | New |
| Candidate | 6.7 | Contact Support | Payments/CR doc — FAQ 5.7 | New |
| Candidate | 6.8 | Usage & Billing | Payments/CR doc — FAQ 5.8 | New |
| Candidate | 7.1–7.6 | Mock Interview Module | Base — placeholder | Outline only |
| Candidate | 8 | Analytics Report & AI Coach | Readiness tracker v3 — no source story | No spec |
| Candidate | 9.1 | Manage Subscription — Catalog, Subscribe, Switch, Cancel | Payments/CR doc — Payments 3.1 | Updated flow applied |
| Candidate | 9.2 | Upgrade Plan CTA Touchpoints | Readiness tracker v3 — Payments 3.2 — new in readiness tracker v3 | New |
| Candidate | 9.3 | Purchase Add-Ons | Payments/CR doc — Payments 3.3 (was 3.2) | New |
| Candidate | 9.4 | Billing — Payment Methods & Invoices | Base doc — Base 8.3 — re-scoped | Retained, re-scoped |
| Candidate | 10.1 | View & Edit My Profile | Payments/CR doc — Profile 4.1 — supersedes Base 8.1 stub | Updated flow applied |
| Candidate | 10.2 | Reset Password | Base doc — Base 8.2 | Carried forward |
| Candidate | 10.3 | Revoke Consent / Delete Account | Base doc — Base 8.4 | Carried forward |
| Candidate | 10.4 | Contact Support | Base doc — Base 8.5 | Carried forward |
| Candidate | 10.5 | View Audit Logs | Base doc — Base 8.6 | Carried forward |
| Candidate | 11.1 | Receive Notifications | Base doc — Base 9.1 | Carried forward |
| Candidate | 11.2 | Receive Terms & Policy Updates | Base doc — Base 9.2 | Carried forward |

---

# Appendix B — Open Points

Items needing a decision before build. Items 1–3 are new in v2.1.

1. **Upgrade Plan CTA Touchpoints (Candidate 9.2)** — landed in the readiness tracker as
   PAY 3.2 with four touchpoints named but no specification written. Needs story details,
   trigger rules and acceptance criteria before it can be estimated.
2. **Analytics Report & AI Coach (Candidate Epic 8)** — appears in the readiness tracker with
   no source story at all. The Dashboard (3.1) and AI FAQ (6.5) both reference a "latest
   report"; confirm whether that is this module or a separate artefact, then scope it.
3. **Do the new Purchase Add-On stories cover everything the old ones did?** The original
   billing stories included per-unit add-on pricing calculations that do not appear in the new
   Bundle-driven add-on stories (4.3 and 9.3). Confirm nothing was lost in the change of model.
4. **Mock Interview Module (Candidate Epic 7)** — still unspecified. Stories 7.1–7.6 have
   agreed titles but no story details, acceptance criteria or validation rules. The AI FAQ
   (6.3) already makes promises about it ("about 30 minutes", "retake anytime").
5. **Org Admin Manage Subscription (4.1)** — flagged as a conflict in the readiness tracker.
   Confirm what it conflicts with: most likely the overlap between seat-based B2B subscription
   and the retained billing story (4.2).
6. **Employer billing (Employer 4.3)** — flagged "outside bundle model". The identical Partner
   story (Partner 4.3) is *not* flagged. Confirm whether that asymmetry is deliberate — do
   Partners subscribe to Bundles, or only earn commission?
7. **Storyboard rules contradict each other** — 5.2 says the original four CAR examples
   "remain unchanged" when a competency is added; 5.3 says unlocked sections "continue to
   evolve". These cannot both hold.
8. **Storyboard version limit** — 5.3 fixes it at three versions; Create Bundle (7.3) lets
   Super Admin set Storyboard quantity with "no upper limit". Confirm which governs.
9. **AI FAQ describes the superseded storyboard flow** — Epic 6 is the only place still using
   "Experience Bank" and still saying CAR means "Cause, Action, Result" where the storyboard
   stories say "Context, Action, Result". The FAQ answer text needs rewriting.
10. **Competing terminology for the same concept** — Power of Thinking / Action / People /
    Mastery is called *Success Drivers* in onboarding, *Pillars* on the dashboard, and
    *Competency Groups* in Super Admin. Pick one.
11. **Super Admin cannot configure Success Drivers** — onboarding (2.1) requires exactly one
    competency per Success Driver, but Competency Framework Management has no screen to define
    them, and no rule for what happens to a confirmed Core Four when a new framework version
    is published.
12. **Free plan is never defined** — stories refer to reverting to "Free" and to a one-time
    free allocation, but no story states what a Free candidate actually gets.
13. **Social accounts have no password** — social sign-up creates accounts "with no password
    set", yet Reset Password and Forgot Password still exist. Define the behaviour.
14. **Add New Role for Existing User (Candidate 2.2)** — one descriptive paragraph only; needs
    full specification, particularly how a second role interacts with Core Four confirmation
    and the Competency Bank.
15. **Design links** — only Super Admin and Candidate had live prototype links in the source;
    Org Admin, Partner and Employer links are still placeholders.
