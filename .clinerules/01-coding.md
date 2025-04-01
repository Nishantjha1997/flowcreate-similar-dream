
# Coding Standards

## Technology Stack
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Tanstack React Query
- **Routing**: React Router DOM

## Component Structure
- Components should be small and focused (aim for 50 lines or less)
- Create new files for each component rather than adding to existing files
- Use shadcn/ui components where possible

## Design Patterns
- Use ThemeProvider for dark/light mode theming
- Responsive design is required for all components
- Use Toast components for user notifications

## Code Style
- Use TypeScript for type safety
- Follow existing project conventions
- Use Tailwind for all styling (no CSS files)
- Import components from "@/components/..." using the alias path

## Error Handling
- Avoid try/catch blocks unless specifically requested
- Let errors bubble up to be visible in the console for debugging

## Performance Considerations
- Keep bundle size minimal
- Use code splitting where appropriate
- Optimize image loading

## Resume Builder Specific
- Follow the template pattern for new resume templates
- Use the customization panel structure for new customization options
- Implement live preview updates for all changes
