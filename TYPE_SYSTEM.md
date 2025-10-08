# Type System

This project uses a Material Design-inspired type scale with the **Geist Sans** font family.

## Available Classes

### Headings

| Class | Size | Weight | Line Height | Letter Spacing | Use Case |
|-------|------|--------|-------------|----------------|----------|
| `.heading-1` | 96px | 300 (Light) | 1.1 | -0.04em | Hero titles, landing pages |
| `.heading-2` | 60px | 300 (Light) | 1.15 | -0.03em | Major section headers |
| `.heading-3` | 48px | 400 (Regular) | 1.2 | -0.025em | Section titles |
| `.heading-4` | 34px | 400 (Regular) | 1.25 | -0.02em | Subsection headers |
| `.heading-5` | 24px | 400 (Regular) | 1.3 | -0.015em | Card titles, widget headers |
| `.heading-6` | 20px | 500 (Medium) | 1.4 | -0.01em | Small headers, labels |

### Responsive Headings

For mobile-first responsive designs:

| Class | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| `.heading-1-responsive` | 48px | 72px | 96px |
| `.heading-2-responsive` | 40px | 52px | 60px |

### Subtitles

| Class | Size | Weight | Line Height | Letter Spacing | Use Case |
|-------|------|--------|-------------|----------------|----------|
| `.subtitle-1` | 16px | 400 (Regular) | 1.5 | 0.009em | Section subtitles, descriptions |
| `.subtitle-2` | 14px | 500 (Medium) | 1.5 | 0.007em | Emphasized captions |

### Body Text

| Class | Size | Weight | Line Height | Letter Spacing | Use Case |
|-------|------|--------|-------------|----------------|----------|
| `.body-1` | 16px | 400 (Regular) | 1.6 | 0.031em | Primary body text |
| `.body-2` | 14px | 400 (Regular) | 1.6 | 0.018em | Secondary text, smaller paragraphs |

### Special Text Styles

| Class | Size | Weight | Transform | Letter Spacing | Use Case |
|-------|------|--------|-----------|----------------|----------|
| `.button-text` | 14px | 500 (Medium) | UPPERCASE | 0.089em | Buttons, CTAs |
| `.caption-text` | 12px | 400 (Regular) | - | 0.033em | Image captions, footnotes |
| `.overline-text` | 10px | 400 (Regular) | UPPERCASE | 0.15em | Labels, eyebrows |

## Usage Examples

### Basic Heading
```tsx
<h1 className="heading-1 text-white">
  Welcome to Our Platform
</h1>
```

### Responsive Heading (Mobile-First)
```tsx
<h1 className="heading-1-responsive text-white">
  A home for next-gen creators
</h1>
```

### Body Text
```tsx
<div className="body-1 text-gray-700">
  <p>Your paragraph content here.</p>
</div>
```

### Button with Text Style
```tsx
<button className="button-text bg-blue-500 text-white px-6 py-3 rounded">
  Get Started
</button>
```

### Section with Multiple Styles
```tsx
<section className="py-20">
  <span className="overline-text text-blue-500">Features</span>
  <h2 className="heading-3 text-gray-900 mt-2 mb-4">
    Transform your workflow
  </h2>
  <p className="body-1 text-gray-600">
    Discover powerful features designed to enhance your productivity.
  </p>
</section>
```

## Typography Principles

### Font Weights
- **300 (Light)**: Large display headings (H1, H2)
- **400 (Regular)**: Body text, most headings
- **500 (Medium)**: Buttons, emphasized text, H6, Subtitle 2

### Letter Spacing
- **Negative (-0.04em to -0.01em)**: All headings for tighter, modern appearance
- **Positive**: Small text, buttons, all-caps for readability

### Line Height
- **1.1-1.3**: Headings (tighter for visual impact)
- **1.5-1.6**: Body text (better readability)

### Text Transform
- **UPPERCASE**: Buttons, overlines, labels
- **Sentence case**: Everything else

## Combining with Tailwind

These classes work seamlessly with Tailwind utilities:

```tsx
<h2 className="heading-2 text-white mb-8">
  Section Title
</h2>

<p className="body-1 text-gray-600 max-w-2xl mx-auto">
  Centered body text with max width
</p>

<button className="button-text bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full">
  Call to Action
</button>
```

## Design Notes

- Based on Material Design type scale
- Optimized for Geist Sans font
- All letter spacing values calculated as em units for better scaling
- Mobile-first responsive variants available for H1 and H2
- Line heights optimized for reading comfort and visual hierarchy

## File Location

Type system defined in: `./app/globals.css`
