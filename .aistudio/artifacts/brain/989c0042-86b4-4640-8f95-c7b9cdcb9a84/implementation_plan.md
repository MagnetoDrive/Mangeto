# Magneto Pro Lifetime Deal (LTD) Transition & Pricing Modernization

Transition Magneto Pro pricing entirely from recurring monthly/annual subscriptions to a high-converting **$79 One-Time Lifetime Deal (LTD)**, removing subscription mechanics and updating the workspace navbar button to clean "Pricing" (removing the "(Whop)" label).

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions were confirmed during interactive clarification and will govern the implementation:

- **Confirmed Pricing Model**: Single **$79 one-time Lifetime Deal (LTD)** replacing all recurring subscription plans ($19/mo, $49/mo, and annual toggles removed).
- **Free Tier Retained**: Keep the 2-project free evaluation so new visitors can test hook generation and the script builder without entering payment details.
- **Scarcity & Launch Badging**: Include an "Early Adopter Founder Pass" banner and a "Limited Lifetime Deal" badge highlighting that users pay once and get access forever with zero recurring fees.
- **In-App Checkout Flow**: Seamless in-app instant activation checkout modal with real-time digital license provisioning and lifetime access entitlement.
- **Navbar Button Label**: Update the top workspace navbar button from `Pricing (Whop)` to a clean, elegant `Pricing` button with a subtle `LTD` badge.

---

## 1. Overview & Core Concept

- **What It Delivers**: Replaces all monthly/annual recurring subscription tiers in `PricingPage.tsx`, `LandingPage.tsx`, `PricingLandingView.tsx`, and the workspace upgrade prompts with a single Lifetime Deal ($79 one-time payment).
- **Customer Value**: Founders, creators, and agency operators pay once and receive lifetime software entitlement—250 projects/month, full multi-aspect ratio storyboard planning, 5-channel marketing kits, Leonardo.ai and external AI visual prompt formatters, and browser teleprompter access forever without recurring subscription fatigue.
- **Zero Confusion**: Eliminates monthly/annual toggle switches, complex recurring billing explainer text, and subscription renewal notices.

---

## 2. User Experience & Visual Design

### A. Lifetime Deal Showcase Layout
- **Hero & Value Proposition**:
  - Crisp headline: *"Get Lifetime Access to Magneto Pro"*.
  - Subtitle: *"One payment. Zero recurring subscriptions. Generate scroll-stopping video hooks, teleprompter scripts, and B-roll visual prompt kits forever."*
  - Prominent price lockup: **$79** with a strikethrough comparison (e.g., ~~$299 Value~~) and clear unboxed metadata (`One-time payment · Lifetime updates included · 14-day guarantee`).
- **Two-Card Focused Layout**:
  1. **Free Exploration ($0)**: 2 test campaigns, no payment info required, allows testing the hook engine and teleprompter.
  2. **Magneto Pro Lifetime Pass ($79 one-time)**: Dominant focal carrier with high-contrast obsidian slate styling, emerald-tinted checkmarks, full feature breakdown, and single-click checkout.
- **Zero-Pill Typography & Anti-Slop Discipline**:
  - No candy badges, fake system clocks, or decorative pulse dots.
  - Clear editorial feature checklist with concrete deliverables (250 projects/mo allowance, multi-aspect ratio 9:16/1:1/16:9, Leonardo.ai & external AI prompt studio, teleprompter speech sync).

### B. Navbar Button Label Polish
- In `SavedProjects.tsx` (top workspace navigation), update the button:
  - Remove the separate `Whop` badge tag from the button label.
  - Render a clean, single-line control: `Pricing` with a small `LTD` badge or simple icon.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full Subscription Removal vs Hybrid Model**
  - *Chosen Approach*: Complete removal of monthly/annual recurring subscriptions, shifting 100% to the $79 LTD and Free Trial.
  - *Why*: User explicitly requested to remove subscriptions altogether. This maximizes conversion by removing friction and recurring commitment anxiety.
- **Decision 2: In-App Checkout Integration**
  - *Chosen Approach*: Use the embedded checkout modal configured with a one-time product plan ID (`VITE_WHOP_PLAN_LTD_ID` or fallback `plan_magneto_ltd_79`) with immediate receipt verification and Firestore license entitlement.
  - *Why*: Eliminates bounce rates caused by external browser redirects and provides instant account upgrade feedback.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Magneto Pro Workspace                   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ SavedProjects Navbar: "Pricing" [LTD]               │   │
│   └──────────────────────────┬──────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────┘
                               │ Click
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Pricing Page                           │
│                                                             │
│   ┌────────────────────────┐   ┌────────────────────────┐   │
│   │    Free Evaluation     │   │   Magneto Pro LTD      │   │
│   │          $0            │   │    $79 One-Time        │   │
│   │   2 campaign kits      │   │  Lifetime Entitlement  │   │
│   │   [Start Free]         │   │  [Get Lifetime Access] │   │
│   └────────────────────────┘   └───────────┬────────────┘   │
└────────────────────────────────────────────┼────────────────┘
                                             │ Trigger
                                             ▼
┌─────────────────────────────────────────────────────────────┐
│              In-App Instant Activation Modal                │
│                                                             │
│   • Embedded One-Time Checkout ($79)                        │
│   • Instant Webhook/Receipt Verification                    │
│   • Firestore User Doc Update: plan="lifetime", status="LTD"│
│   • Immediate Return to Workspace with 250 quota            │
└─────────────────────────────────────────────────────────────┘
```

### Component & File Changes
1. `src/components/SavedProjects.tsx`: Remove "Whop" wording from the pricing button; label as "Pricing" with optional "LTD" tag.
2. `src/pages/PricingPage.tsx`:
   - Remove monthly/annual toggle states and price formulas.
   - Replace Starter and Pro subscription cards with the comprehensive $79 Lifetime Deal card.
   - Update FAQ section to explain lifetime access, updates, and the 14-day money-back guarantee.
3. `src/components/WhopCheckoutModal.tsx` & embedded checkout handlers: Support LTD one-time plan ID.
4. `src/components/PricingLandingView.tsx` & `src/components/LandingPage.tsx`: Update pricing mentions, comparison tables, and FAQ answers to reflect the $79 Lifetime Deal.
5. `src/App.tsx`: Update the quota modal prompt text to offer the $79 Lifetime Deal instead of "$19/mo or $49/mo".
