# 🎨 Theming & Styling System

## CSS Architecture

### Global Styles Location
`src/index.css` - Contains all CSS variables, base styles, and custom utilities.

### CSS Variable Tokens
All colors use HSL format for consistency.

```css
:root {
  /* Core colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  
  /* Brand colors */
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  
  /* UI colors */
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  
  /* Border & Input */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  
  /* Charts */
  --chart-1 through --chart-5
  
  /* Sizing */
  --radius: 0.75rem;
}
```

### Dark Mode Variables
```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... inverted color scheme */
}
```

## Theme Modes

### 1. Light/Dark Theme
Controlled by `ThemeProvider` and `useTheme` hook.
```typescript
const { theme, setTheme } = useTheme();
setTheme('dark'); // 'light' | 'dark' | 'system'
```

### 2. Neo-Brutalism Design Mode
A bold, high-contrast design system with:
- Zero border radius
- Thick black borders
- Hard shadows
- Vibrant colors
- Monospace typography

Controlled by `DesignModeProvider` and `useDesignMode` hook.
```typescript
const { isNeoBrutalism, toggleDesignMode } = useDesignMode();
```

#### Neo-Brutalism CSS Variables
```css
.neo-brutalism {
  --radius: 0;
  --border: 0 0% 0%;
  --primary: 51 100% 50%;      /* Bright yellow */
  --secondary: 280 100% 70%;   /* Bright purple */
  --accent: 160 100% 50%;      /* Bright cyan */
}
```

#### Neo-Brutalism Utility Classes
```css
.nb-card       /* Card with thick border and hard shadow */
.nb-button     /* Button with shadow, hover lift effect */
.nb-input      /* Input with hard shadow */
.nb-badge      /* Badge with border and shadow */
.nb-heading    /* Bold uppercase heading */
.nb-shadow-sm/md/lg/xl  /* Shadow sizes */
.nb-border     /* 3px border */
.nb-pattern-dots/grid/stripes  /* Background patterns */
```

## Tailwind Configuration

### tailwind.config.ts
Extends default Tailwind with shadcn theme:
```typescript
theme: {
  extend: {
    colors: {
      border: "hsl(var(--border))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      // ... etc
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
  }
}
```

## Component Styling Guidelines

### ✅ DO: Use Semantic Tokens
```tsx
<div className="bg-background text-foreground border-border">
<Button className="bg-primary text-primary-foreground">
```

### ❌ DON'T: Use Direct Colors
```tsx
// WRONG - Don't do this
<div className="bg-white text-black">
<Button className="bg-blue-500">
```

### Conditional Neo-Brutalism Styling
```tsx
const { isNeoBrutalism } = useDesignMode();

<Card className={isNeoBrutalism ? "nb-card" : ""}>
<Button className={isNeoBrutalism ? "nb-button" : ""}>
```

## Animations

### Available Animations
```css
.animate-float     /* Vertical float */
.animate-glow      /* Glowing effect */
.animate-fade-in   /* Fade in (from tailwindcss-animate) */
.animate-nb-bounce /* Neo-brutalism bounce */
.animate-nb-shake  /* Neo-brutalism shake */
```

### Custom Keyframes
Defined in `index.css`:
- `@keyframes shimmer`
- `@keyframes float`
- `@keyframes glow`
- `@keyframes nb-bounce`
- `@keyframes nb-shake`

## Fonts

### Font Families
```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'Space Mono', monospace;
```

Loaded via Google Fonts in `index.css`.

### Usage
```tsx
<p className="font-sans">Regular text</p>
<code className="font-mono">Code text</code>
<div className="font-mono-nb">Neo-brutalism mono</div>
```

## Glass Morphism
```css
.glass       /* Light glass effect */
.glass-dark  /* Dark glass effect */
```

## Gradient Utilities
```css
.gradient-text    /* Purple gradient text */
.gradient-border  /* Gradient border effect */
.nb-gradient-text /* Neo-brutalism gradient */
```
