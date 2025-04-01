
# React Framework Guidelines

## Component Patterns
- Use functional components with hooks
- Keep components small and focused
- Use the dependency array in useEffect properly
- Memoize expensive calculations with useMemo
- Memoize callbacks with useCallback when needed

## Props and PropTypes
- Use TypeScript interfaces for prop definitions
- Define proper prop types for all components
- Use default props where appropriate
- Destructure props in function parameters

## State Management
- Use useState for simple component state
- Use useReducer for complex state logic
- Use useContext for shared state across components
- Consider React Query for server state

## Side Effects
- Use useEffect for side effects
- Clean up side effects in the return function
- Group related effects together
- Avoid infinite loops with proper dependency arrays

## Rendering
- Avoid unnecessary re-renders
- Use PureComponent or React.memo where appropriate
- Lift state up when needed
- Use keys properly in lists

## Error Handling
- Implement error boundaries for critical sections
- Handle async errors properly
- Provide meaningful error messages to users

## Performance
- Use React.lazy for code splitting
- Use windowing for long lists (react-window)
- Optimize context to prevent unnecessary re-renders
- Profile performance with React DevTools
