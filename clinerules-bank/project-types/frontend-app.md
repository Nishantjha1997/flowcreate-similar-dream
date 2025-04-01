
# Frontend Application Guidelines

## Project Structure
- Organize by feature rather than by type
- Keep related files close to each other
- Use consistent naming conventions
- Follow the established directory structure:
  - `/src/components`: Reusable UI components
  - `/src/pages`: Page components
  - `/src/hooks`: Custom React hooks
  - `/src/utils`: Utility functions
  - `/src/lib`: Third-party library integrations
  - `/src/assets`: Static assets

## State Management
- Choose the right tool for the job:
  - Component state for local concerns
  - Context API for shared state
  - React Query for server state
- Document state management decisions

## Routing
- Use React Router for navigation
- Implement lazy loading for routes
- Use route protection where needed
- Keep route definitions centralized

## Performance
- Implement code splitting
- Optimize asset loading
- Use React.memo and useMemo appropriately
- Monitor and improve Lighthouse scores

## Accessibility
- Follow WCAG 2.1 guidelines
- Use semantic HTML elements
- Implement proper keyboard navigation
- Provide appropriate ARIA attributes
- Test with screen readers

## Deployment
- Set up CI/CD pipelines
- Use environment variables for configuration
- Implement proper error logging
- Configure caching correctly
