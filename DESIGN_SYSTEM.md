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

### Liquid Glass Effect

The platform uses a **liquid glass effect** for interactive cards and buttons. This effect combines light refraction, distortion, and specular highlights to create a physically-accurate glass appearance.

#### Required: Global SVG Filter

The liquid glass effect requires a global SVG filter defined once in the root layout (`app/layout.tsx`):

```tsx
{/* Place before closing </body> tag */}
<svg
  aria-hidden="true"
  focusable="false"
  width="0"
  height="0"
  style={{ position: 'absolute', left: 0, top: 0, opacity: 0, pointerEvents: 'none' }}
>
  <defs>
    <filter
      id="glass-distortion"
      x="0%" y="0%" width="100%" height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.01 0.01"
        numOctaves="1"
        seed="5"
        result="turbulence"
      />
      <feGaussianBlur
        in="turbulence"
        stdDeviation="3"
        result="softMap"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="150"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </defs>
</svg>
```

**Filter Parameters**:
- `feTurbulence`: Creates fractal noise pattern for organic distortion
  - `baseFrequency="0.01"`: Low frequency for subtle warping (higher = more distortion)
  - `numOctaves="1"`: Single layer of noise (higher = more detail, more cost)
  - `seed="5"`: Randomization seed (change for different patterns)
- `feGaussianBlur`: Smooths the noise (`stdDeviation="3"`)
- `feDisplacementMap`: Warps pixels based on noise map
  - `scale="150"`: Distortion intensity (higher = more liquid warping)

#### Layer Structure

Each glass element uses **4 stacked layers** plus content:

```tsx
<div className="group relative rounded-xl overflow-hidden cursor-pointer">
  {/* Layer 1: Blur + Distortion (z-index: 0) */}
  <div
    className="absolute inset-0 rounded-xl pointer-events-none"
    style={{
      backdropFilter: 'blur(2px)',
      filter: 'url(#glass-distortion)',
      zIndex: 0
    }}
  />

  {/* Layer 2: Shine/Highlight (z-index: 1) */}
  <div
    className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300"
    style={{
      boxShadow: 'inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3)',
      zIndex: 1
    }}
  />

  {/* Layer 3: Brightness Overlay (z-index: 2) */}
  <div
    className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-[0.03]"
    style={{
      background: 'rgba(255, 255, 255, 1)',
      zIndex: 2
    }}
  />

  {/* Layer 4: Edge Glow Border (z-index: 3) */}
  <div
    className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 border border-transparent group-hover:border-white/12"
    style={{
      zIndex: 3
    }}
  />

  {/* Content (z-index: 20) */}
  <div className="relative px-4 py-3" style={{ zIndex: 20 }}>
    {/* Your content here */}
  </div>
</div>
```

**Layer Breakdown**:

1. **Blur + Distortion**: Foundation of glass effect
   - `backdrop-filter: blur(2px)` - Blurs content behind element
   - `filter: url(#glass-distortion)` - Warps pixels for liquid appearance
   - **Most important layer** for visual impact

2. **Shine/Highlight**: Specular reflection
   - Top-left highlight simulates light hitting glass surface
   - Static, provides baseline glass appearance
   - Uses `inset` box-shadow for internal reflection

3. **Brightness Overlay**: Hover luminosity
   - White layer with opacity transition (0 → 3% on hover)
   - Simulates light passing through glass on interaction
   - **Critical**: Uses overlay instead of `filter: brightness()` to prevent interference with Layer 1's `backdrop-filter`

4. **Edge Glow Border**: Fresnel effect
   - Simulates light reflecting at glass edges
   - Appears only on hover (`border-transparent` → `border-white/12`)
   - Represents physically-accurate edge illumination

**Z-Index Management**:
- Layers: 0 (blur) → 1 (shine) → 2 (brightness) → 3 (border)
- Content: Always `z-index: 20` to stay above all glass layers
- All glass layers use `pointer-events-none` to preserve interactivity

#### Hover Behavior

**Physics-Accurate Interaction**:
- Real glass doesn't scale or grow
- Light reflects differently when viewer angle changes
- Our hover simulates this with:
  - **Edge glow**: Fresnel reflection becomes visible
  - **Brightness**: More light passes through glass (3% luminosity increase)
  - **Smooth transition**: 300ms duration for natural feel

**CSS Requirements**:
- Parent must have `group` class for Tailwind group-hover
- Brightness must use **opacity-based overlay**, not `filter: brightness()`
  - Why: `filter` creates stacking context that breaks `backdrop-filter: blur()`
  - Solution: White layer with `opacity-0 group-hover:opacity-[0.03]`

#### Sizing Variants

**Small Cards** (member cards, list items):
- Blur: `blur(2px)`
- Border radius: `rounded-xl` (12px)
- Padding: `px-3.5 py-2.5`

**Large Buttons** (CTAs, primary actions):
- Blur: `blur(3px)` (larger surface needs more blur)
- Border radius: `rounded-md` (6px) or `rounded-lg` (8px)
- Padding: `px-8 py-3` or larger

**General Rule**: Larger glass surfaces need proportionally more blur to maintain effect.

#### Performance Considerations

**Cost**: Each glass element adds 4-5 GPU-accelerated layers
- 50 cards = 200-250 DOM elements with filters
- SVG filters are expensive (shared filter helps)
- backdrop-filter is GPU-intensive

**Optimization**:
- Use single global SVG filter (don't duplicate)
- Keep blur amounts minimal (2-3px, not 5-10px)
- Limit to ~50 visible elements maximum
- Test on mid-range devices (expect 40-50 FPS)

**Expected Performance**:
- Modern hardware: 50-60 FPS
- Mid-range devices: 40-50 FPS
- Older devices: 25-35 FPS

**Trade-off**: Visual impact prioritized over absolute performance. Effect is worth the cost for hero elements and interactive cards.

#### Background Requirements

**Prism Background**: Liquid glass is designed to show **dynamic prism colors** through the distortion:

```tsx
{/* Fixed background with prism */}
<div className="fixed inset-0 z-0">
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
  {/* Darkening overlays for legibility */}
  <div className="absolute inset-0 pointer-events-none bg-black/20" />
  <div className="absolute inset-0 pointer-events-none bg-black/10" />
</div>
```

**Why Prism?**: The distortion filter warps the colorful prism underneath, creating the "liquid" appearance. On static backgrounds, the effect is less pronounced.

#### Usage Guidelines

**When to Use**:
- Interactive cards (member cards, project cards)
- Primary CTAs (Apply button, Join button)
- Floating panels (sidebars, modals, overlays)
- Hero elements that need visual depth

**When NOT to Use**:
- Text-heavy content (reduces readability)
- Small UI elements (< 80px width)
- Non-interactive decorative elements
- Performance-critical views (lists with 100+ items)

**Accessibility**:
- Ensure text has `z-index: 20` (above all glass layers)
- Maintain WCAG AAA contrast (white text on dark glass)
- Don't rely on hover for critical information
- Provide focus states for keyboard navigation

### Liquid Glass Buttons

Buttons use a specialized variant of the liquid glass effect with additional depth and polish.

#### Button Layer Structure

Buttons combine liquid glass with traditional depth styling (shadows, borders, insets):

```tsx
<button className="relative group bg-transparent cursor-pointer">
  {/* Layer 1: Shadows & Borders (z-0) */}
  <div
    className="absolute top-0 left-0 z-0 h-full w-full rounded-full
      shadow-[0_0_4px_rgba(0,0,0,0.02),0_2px_4px_rgba(0,0,0,0.04),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.5),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.45),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.3),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.3),inset_0_0_4px_4px_rgba(0,0,0,0.06),inset_0_0_2px_2px_rgba(0,0,0,0.03),0_0_8px_rgba(255,255,255,0.08)]
    transition-all
    dark:shadow-[0_0_6px_rgba(0,0,0,0.02),0_2px_4px_rgba(0,0,0,0.04),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.05),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.45),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.3),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.3),inset_0_0_4px_4px_rgba(255,255,255,0.06),inset_0_0_2px_2px_rgba(255,255,255,0.03),0_0_8px_rgba(0,0,0,0.08)]"
  />

  {/* Layer 2: Background Tint (z-1) */}
  <div
    className="absolute top-0 left-0 h-full w-full rounded-full pointer-events-none"
    style={{
      background: 'rgba(255, 255, 255, 0.08)',
      zIndex: 1
    }}
  />

  {/* Layer 3: Blur + Distortion (-z-10) */}
  <div
    className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-full pointer-events-none"
    style={{
      backdropFilter: 'blur(3px)',
      filter: 'url(#glass-distortion)'
    }}
  />

  {/* Layer 4: Brightness Overlay (z-2) */}
  <div
    className="absolute inset-0 rounded-full pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-[0.03]"
    style={{
      background: 'rgba(255, 255, 255, 1)',
      zIndex: 2
    }}
  />

  {/* Layer 5: Edge Glow Border (z-3) */}
  <div
    className="absolute inset-0 rounded-full pointer-events-none transition-all duration-300 border border-transparent group-hover:border-white/12"
    style={{
      zIndex: 3
    }}
  />

  {/* Content (z-20) */}
  <div className="relative" style={{ zIndex: 20 }}>
    Button Text
  </div>
</button>
```

**Button-Specific Differences from Cards**:

1. **Border Radius**: `rounded-full` (pill shape) vs `rounded-xl` (cards)
2. **Shadow System**: Complex multi-layer box-shadows for depth and polish
   - Outer shadows: Subtle elevation (0-2px blur)
   - Inset shadows: Multiple layers for internal depth and borders
   - Light/dark mode variants for proper contrast
3. **Background Tint**: 8% white fill for prominence
4. **Blur Amount**: 3px (same as cards, but on larger surface)
5. **No Scale Transform**: Buttons don't scale on hover (physical accuracy)

**Shadow Anatomy**:
The shadow layer creates traditional button depth:
- **Outer shadows**: `0_0_4px`, `0_2px_4px` - subtle elevation
- **Inset highlights**: Top-left internal highlights for dimensionality
- **Inset depth**: Multiple inset shadows at different opacities create "carved" appearance
- **Glow**: Soft `0_0_8px` outer glow for separation from background

**Why Shadow + Glass?**:
Traditional depth styling (shadows/borders) provides **button affordance** and **polish**. Liquid glass adds **visual interest** and **brand identity**. The combination creates buttons that are:
- Clearly interactive (shadows indicate clickability)
- Visually distinctive (liquid refraction)
- Physically grounded (no floating, no scale tricks)

#### Button Variants

**Primary CTA** (Apply to join, hero actions):
- Size: `xxl` (h-14, px-10)
- All 5 glass layers
- White background tint (8%)
- Pill shape (`rounded-full`)

**Secondary Actions** (Navigation, less critical):
- Size: `lg` or `xl`
- Can omit background tint for subtlety
- Consider simpler shadow system

**Ghost/Link Buttons**:
- Skip liquid glass entirely
- Use simple hover states
- Maintain text clarity

#### Hover Behavior (Buttons)

Same physics-accurate interaction as cards:
- **No scale transform** - real glass doesn't grow
- **Edge glow** - Fresnel reflection at borders
- **Brightness** - 3% luminosity increase via white overlay
- **300ms transition** - natural feel

**Critical**: Brightness must use opacity-based overlay (not `filter: brightness()`) to avoid interference with backdrop-filter blur.

#### Button Component

Use `<LiquidButton>` from `./components/ui/liquid-glass-button.tsx`:

```tsx
import { LiquidButton } from '@/components/ui/liquid-glass-button'

// As button
<LiquidButton size="xxl" className="text-white font-medium">
  Apply to join
</LiquidButton>

// As Link (asChild pattern)
<LiquidButton asChild size="xxl" className="text-white font-medium">
  <Link href="/apply">Apply to join</Link>
</LiquidButton>
```

**Available Sizes**:
- `sm`: h-8, px-4
- `default`: h-9, px-4
- `lg`: h-10, px-6
- `xl`: h-12, px-8
- `xxl`: h-14, px-10 (hero CTAs)

**Variants**:
- `default`: Liquid glass (primary use case)
- `destructive`: Red variant with glass
- `outline`: Border variant
- `secondary`: Muted variant
- `ghost`: Minimal hover state
- `link`: Text-only with underline

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
