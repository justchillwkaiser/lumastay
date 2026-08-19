---
name: Horizon Ethos
colors:
  surface: "#fbf9f9"
  surface-dim: "#dbdad9"
  surface-bright: "#fbf9f9"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f5f3f3"
  surface-container: "#efeded"
  surface-container-high: "#e9e8e7"
  surface-container-highest: "#e4e2e2"
  on-surface: "#1b1c1c"
  on-surface-variant: "#434843"
  inverse-surface: "#303031"
  inverse-on-surface: "#f2f0f0"
  outline: "#747873"
  outline-variant: "#c3c8c2"
  surface-tint: "#556157"
  primary: "#18241b"
  on-primary: "#ffffff"
  primary-container: "#2d3930"
  on-primary-container: "#95a397"
  inverse-primary: "#bccabd"
  secondary: "#5d5f5d"
  on-secondary: "#ffffff"
  secondary-container: "#e2e3e1"
  on-secondary-container: "#636563"
  tertiary: "#212121"
  on-tertiary: "#ffffff"
  tertiary-container: "#363636"
  on-tertiary-container: "#a09e9e"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#d8e6d9"
  primary-fixed-dim: "#bccabd"
  on-primary-fixed: "#131e16"
  on-primary-fixed-variant: "#3d4a40"
  secondary-fixed: "#e2e3e1"
  secondary-fixed-dim: "#c6c7c5"
  on-secondary-fixed: "#1a1c1b"
  on-secondary-fixed-variant: "#454746"
  tertiary-fixed: "#e5e2e1"
  tertiary-fixed-dim: "#c8c6c5"
  on-tertiary-fixed: "#1c1b1b"
  on-tertiary-fixed-variant: "#474746"
  background: "#fbf9f9"
  on-background: "#1b1c1c"
  surface-variant: "#e4e2e2"
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 72px
    fontWeight: "700"
    lineHeight: "1.1"
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: "700"
    lineHeight: "1.1"
    letterSpacing: -0.03em
  headline-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: "600"
    lineHeight: "1.2"
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "600"
    lineHeight: "1.3"
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: "1.6"
    letterSpacing: "0"
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.5"
    letterSpacing: "0"
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "700"
    lineHeight: "1"
    letterSpacing: 0.1em
  mono-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: "1.4"
    letterSpacing: "0"
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

The design system embodies the **International Typographic Style (Swiss UI)** adapted for a premium Malaysian hospitality context. It prioritizes clarity, objective presentation, and a rigid mathematical grid to convey a sense of architectural permanence and high-end service.

The personality is disciplined, sophisticated, and understated. By utilizing generous whitespace (negative space) as a structural element rather than a void, the UI directs absolute focus toward editorial property photography and essential information. The aesthetic avoids decorative trends in favor of functional minimalism, ensuring the user's journey is frictionless and serene.

## Colors

The palette is rooted in a high-contrast, neutral foundation to maintain an editorial feel.

- **Primary:** A muted Forest Green (#2D3930), used sparingly for primary call-to-actions and active states to provide a subtle link to Malaysian nature.
- **Secondary/Surface:** Off-White (#F7F7F5) serves as the primary background color to reduce ocular strain compared to pure white while maintaining a premium paper-like quality.
- **Tertiary/Ink:** Deep Charcoal (#1A1A1A) is used for primary headings and body text to ensure maximum legibility and authority.
- **Neutral:** A range of mid-tone greys for borders, captions, and secondary information, following a strict tonal scale.

## Typography

This design system utilizes **Inter** exclusively to achieve a uniform, neo-grotesque appearance. The hierarchy is driven by significant scale contrasts and weight shifts rather than color.

Large display type should be set with tight letter-spacing to emphasize the geometric construction of the letterforms. Captions and labels utilize uppercase styling with increased tracking (letter-spacing) to serve as functional anchors in the layout. All text must align strictly to a baseline grid to maintain the "Swiss" mathematical rigor.

## Layout & Spacing

The layout follows a strict **12-column modular grid** for desktop and a **4-column grid** for mobile.

- **Alignment:** All elements must snap to the grid lines. Flush-left, ragged-right alignment is preferred for text blocks to maintain the modernist aesthetic.
- **Whitespace:** Use aggressive padding (64px+) between major sections to isolate content and evoke a sense of luxury and breathing room.
- **Grids:** Property details and data should be presented in structured, multi-column grids with thin 1px dividers.
- **Adaptation:** On mobile, margins reduce significantly, but vertical rhythm (stacking) remains governed by the 8px base unit.

## Elevation & Depth

In keeping with the Swiss UI style, depth is conveyed through **layering and borders** rather than soft shadows.

- **Flat Layers:** Use subtle shifts in background tone (e.g., White against Off-White) to distinguish sections.
- **Borders:** Define containers with 1px solid borders in a light neutral tone (#E0E0E0).
- **No Shadows:** Avoid drop shadows entirely. If an element must float (like a sticky booking bar), use a sharp 1px top border or a high-contrast background color change to separate it from the content below.

## Shapes

The shape language is predominantly rectangular and architectural.

- **Corners:** A "Soft" setting (4px to 8px) is applied to buttons and input fields to prevent the UI from feeling overly aggressive, while maintaining a sharp, professional edge.
- **Media:** Property imagery should maintain 0px (sharp) corners when full-bleed, or a maximum of 4px when contained in a card, emphasizing the structural "grid" of the photograph itself.

## Components

- **Buttons:** Primary buttons are solid Forest Green with white centered text, no icons unless essential for direction. Secondary buttons are outlined (ghost) with 1px strokes.
- **Input Fields:** Minimalist underlines or 1px boxed frames with "label-caps" floating above. Error states use a muted brick red, maintaining the neutral aesthetic.
- **Data Grids:** Property specifications (sq ft, occupancy, amenities) are displayed in a disciplined table format with clear 1px horizontal dividers.
- **Progress Indicators:** Horizontal 2px lines for multi-step booking. The active step is indicated by a weight increase or a shift to the primary accent color.
- **Cards:** No shadows. Cards are defined by 1px borders or simple background color fills. Images within cards should be high-resolution and editorial in composition.
- **Dividers:** Use 1px solid lines (#E0E0E0) to separate logical sections of data without adding visual bulk.

## Pattern

- Swiss UI
- Reveal Navigation
- Spotlight Card
- Step Progression
- Microinteractions
- Optimistic UI
