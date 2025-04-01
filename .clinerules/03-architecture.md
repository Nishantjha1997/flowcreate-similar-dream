
# Architecture Guidelines

## Project Structure
- `/src/components`: UI components
- `/src/pages`: Page components for routing
- `/src/hooks`: Custom React hooks
- `/src/utils`: Utility functions
- `/src/lib`: Library code and helpers
- `/src/components/ui`: shadcn/ui components

## State Management
- Use React Query for server state
- Use React hooks (useState, useContext) for UI state
- Create custom hooks to encapsulate complex state logic

## Routing
- Use React Router DOM for routing
- Define routes in App.tsx
- Create page components in the `/pages` directory

## Data Fetching
- Use React Query for data fetching and caching
- Configure with proper settings:
  ```typescript
  const { data, isLoading, error } = useQuery({
    queryKey: ['data-key'],
    queryFn: fetchData,
  });
  ```

## Theme System
- The application uses a ThemeProvider for managing themes
- Themes can be "light", "dark", or "system"
- Theme preferences are stored in localStorage
