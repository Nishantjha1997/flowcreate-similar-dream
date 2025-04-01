
# Component Guidelines

## Component Creation
- Each new component should be created in its own file
- Components should be organized by feature or function
- Use proper naming conventions (PascalCase for components)

## UI Components
- Use the shadcn/ui library for consistent UI elements
- Available components include:
  - Button, Input, Textarea, Select
  - Dialog, Toast, Alert
  - Tabs, Accordion
  - Card, Avatar
  - And more from the shadcn/ui library

## Icons
- Use Lucide React icons
- Import icons directly: `import { Camera } from 'lucide-react'`
- Size and color can be customized via props: `<Camera size={24} color="blue" />`

## Theme Support
- All components must support both light and dark mode
- Use the ThemeProvider context for theme access
- Test all UI components in both theme modes

## Form Handling
- Use React Hook Form for complex forms
- Implement proper validation using zod schemas
- Provide clear feedback for form errors

## Accessibility
- Ensure all components have proper aria attributes
- Use semantic HTML elements
- Ensure keyboard navigation works correctly
- Maintain proper color contrast ratios
