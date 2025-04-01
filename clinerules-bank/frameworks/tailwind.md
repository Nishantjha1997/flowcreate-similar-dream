
# Tailwind CSS Guidelines

## General Usage
- Use Tailwind classes for all styling
- Avoid custom CSS files when possible
- Utilize the utility-first approach
- Follow the project's established design system

## Responsive Design
- Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:, 2xl:)
- Design for mobile-first, then add responsive variants
- Test on multiple screen sizes
- Use flex and grid for layouts

## Custom Theme
- The project extends Tailwind's theme in tailwind.config.ts
- Custom colors are defined for:
  - Primary, secondary, accent colors
  - Background, foreground, muted colors
  - Borders, inputs, cards
- Custom animations are available

## Dark Mode
- Dark mode is enabled using the "class" strategy
- Toggle between light/dark using the ThemeToggle component
- Test all components in both light and dark modes
- Use the appropriate color variables for theming

## Best Practices
- Group related utilities with @apply in component classes
- Use consistent spacing utilities
- Use custom variants when needed
- Extract common patterns to component classes in index.css
- Use Tailwind's color opacity modifiers (text-primary/80)
