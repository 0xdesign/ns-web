# Design System

This document defines the design system for the Creative Technologists community platform.

## Typography

### Philosophy

The typography system follows an **editorial design approach** with minimal, intentional type choices. We use serif fonts for headings (emotional, editorial feel) and sans-serif for body text (clarity, readability).

### Type Scale

We use only **4 typography classes** to maintain consistency and simplicity:

#### `.display` - Hero Headings
- **Font**: Instrument Serif (Georgia fallback)
- **Weight**: 400 (Regular)
- **Size**: 96px (all breakpoints)
- **Line Height**: 0.9 (tight, editorial)
- **Letter Spacing**: -0.02em
- **Usage**: Main hero headings only

#### `.heading` - Section Headings
- **Font**: Instrument Serif (Georgia fallback)
- **Weight**: 400 (Regular)
- **Size**: 34px (all breakpoints)
- **Line Height**: 1.2
- **Letter Spacing**: -0.01em
- **Usage**: All section headings, feature titles, FAQ headings

#### `.body` - Body Text
- **Font**: Geist Sans (system-ui fallback)
- **Weight**: 400 (Regular)
- **Size**: 16px (all breakpoints)
- **Line Height**: 1.6
- **Letter Spacing**: 0
- **Usage**: All body copy, paragraphs, descriptions

#### `.small` - Captions & Meta
- **Font**: Geist Sans (system-ui fallback)
- **Weight**: 400 (Regular)
- **Size**: 14px
- **Line Height**: 1.5
- **Letter Spacing**: 0
- **Usage**: Captions, metadata, small labels (use sparingly)

### Implementation

```css
/* globals.css */
@layer utilities {
  .display {
    font-family: var(--font-instrument-serif), Georgia, serif;
    font-size: 96px;
    font-weight: 400;
    line-height: 0.9;
    letter-spacing: -0.02em;
  }

  .heading {
    font-family: var(--font-instrument-serif), Georgia, serif;
    font-size: 34px;
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -0.01em;
  }

  .body {
    font-family: var(--font-geist-sans), system-ui, sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.6;
    letter-spacing: 0;
  }

  .small {
    font-family: var(--font-geist-sans), system-ui, sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0;
  }
}
```

## Layout

### Content Containers

#### `.content-container` - Optimal Reading Width
- **Mobile**: 80% width (left-aligned)
- **Desktop (768px+)**:
  - Min-width: 33% (~50 characters)
  - Max-width: 560px (~70 characters per line)
- **Purpose**: Ensures optimal readability (50-75 characters per line)

**Implementation**:
```css
@layer utilities {
  .content-container {
    width: 80%;
  }

  @media (min-width: 768px) {
    .content-container {
      width: auto;
      min-width: 33%;
      max-width: 560px;
    }
  }
}
```

### Spacing

#### Section Padding
- **Mobile**: `px-4 py-20`
- **Small (640px+)**: `sm:px-6`
- **Medium (768px+)**: `md:px-8 md:py-32`
- **Large (1024px+)**: `lg:px-12 lg:py-40`

#### Content Spacing
- **Paragraph Spacing**: `space-y-5 md:space-y-6`
- **Feature Spacing**: `space-y-0` with `py-3` per item
- **Section Margin**: `mb-12 md:mb-16`

## Colors

### Base Colors
- **Background**: `bg-neutral-950` (near black)
- **Text**: `text-white`
- **Accent**: Dynamic prism colors (rainbow gradient)

### Opacity Tokens
- **Borders**: `border-white/30` (dashed lines)
- **Overlays**: `bg-black/20`, `bg-black/10`
- **Hover States**: `hover:bg-white/5`

## Components

### Glassmorphism Recipe

The platform uses a **layered glass effect** for depth:

```tsx
{/* Layer 1: Prism background */}
<div className="absolute inset-0">
  <Prism
    height={3.5}
    baseWidth={5.5}
    animationType="scroll"
    glow={1.5}
    noise={0.1}
    transparent={true}
    scale={2.5}
    mobileScale={1.8}
    colorFrequency={1.2}
    bloom={1.2}
    scrollSensitivity={1.5}
  />
</div>

{/* Layer 2: Noise texture */}
<div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;...')]" />

{/* Layer 3: Darkening overlays */}
<div className="absolute inset-0 pointer-events-none bg-black/20" />
<div className="absolute inset-0 pointer-events-none bg-black/10" />
```

### Animation Patterns

#### BlurIn Component
- **Delays**: Staggered by 30ms increments (0, 30, 60, 90, 120, 150, 180)
- **Duration**: 800ms
- **Blur Amount**:
  - Hero text: 10-15px
  - Features: 8px
  - CTA: 12px

**Usage**:
```tsx
<BlurIn delay={0} duration={800} amount={10}>
  <p>Content here</p>
</BlurIn>
```

## Responsive Breakpoints

Following Tailwind CSS defaults:

- **Mobile**: Default (< 640px)
- **Small**: `sm:` (640px+)
- **Medium**: `md:` (768px+)
- **Large**: `lg:` (1024px+)
- **Extra Large**: `xl:` (1280px+)

### Mobile-First Principle

All designs start mobile-first, then enhance for larger screens:

```tsx
// Mobile default, then tablet, then desktop
className="text-4xl md:text-6xl lg:text-7xl"
className="w-full md:w-auto"
className="flex-col md:flex-row"
```

## Accessibility

### Focus Styles
```css
*:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
  border-radius: inherit;
}
```

### Touch Targets
- Minimum size: 44x44px
- Interactive elements use proper semantic HTML
- Links are clearly underlined in body text

### Color Contrast
- White text on near-black background exceeds WCAG AAA standards
- Reduced opacity only for decorative elements, never primary content

## Assets & Performance

### Font Loading Strategy
- Next.js font optimization with `next/font/google`
- Preloaded via CSS variables (`--font-geist-sans`, `--font-instrument-serif`)
- Subset: `latin` only
- Display: `swap` (implied by Next.js)

### Scrollbar Styling
```css
/* Hidden scrollbar for member list */
.member-list-scroll::-webkit-scrollbar {
  display: none !important;
}

/* Glass scrollbar for general use */
.glass-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.glass-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.glass-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
```

## Naming Conventions

### CSS Classes
- **Typography**: Semantic names (`.display`, `.heading`, `.body`, `.small`)
- **Layout**: Descriptive utility (`.content-container`)
- **Components**: BEM-inspired for custom components
- **Utilities**: Tailwind defaults for spacing, colors, etc.

### Component Files
- PascalCase: `HomeClient.tsx`, `MemberSidebar.tsx`
- UI components in `./components/ui/`: `liquid-glass-button.tsx`, `blur-in.tsx`

## Design Principles

1. **Minimal Typography**: Use only 4 type classes, resist adding more
2. **Optimal Reading**: 50-75 characters per line (560px max-width)
3. **Mobile-First**: Design for 375px width first, enhance upward
4. **Editorial Feel**: Serif headings + sans-serif body for modern editorial aesthetic
5. **Intentional Animation**: Staggered blur-in for progressive disclosure
6. **Depth Through Layers**: Glassmorphism with prism + noise + overlays
7. **Accessibility First**: WCAG AAA contrast, 44px touch targets, focus states

## Future Considerations

- Document color tokens if palette expands beyond white/black
- Add component library documentation as UI grows
- Document interaction patterns (hovers, clicks, transitions)
- Add dark mode variant documentation (currently always dark)
