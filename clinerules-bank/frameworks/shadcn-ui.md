
# shadcn/ui Guidelines

## Usage
- shadcn/ui components are available in src/components/ui/
- Import components from "@/components/ui/[component-name]"
- These components are based on Radix UI primitives
- The components are not editable - create wrapper components instead

## Available Components
- Basic UI: Button, Input, Textarea, Label, etc.
- Layout: Card, Sheet, Dialog, Drawer
- Navigation: Tabs, NavigationMenu, Breadcrumb
- Forms: Form, Select, Checkbox, RadioGroup, Switch
- Feedback: Toast, Alert, Progress
- Data Display: Table, Avatar, Badge, Skeleton

## Theming
- shadcn/ui components use CSS variables for theming
- Light/dark themes are defined in the index.css file
- Components automatically adapt to the current theme

## Customization
- To customize a component, create a new component that wraps the shadcn/ui component
- Do not edit the components directly in src/components/ui/
- Follow the component's documentation for available props

## Accessibility
- shadcn/ui components are built with accessibility in mind
- They properly manage focus, keyboard navigation, and ARIA attributes
- Ensure that customizations maintain accessibility features
