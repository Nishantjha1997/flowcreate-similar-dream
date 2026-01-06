# 📝 Development Guidelines

## Code Style

### TypeScript
- Use TypeScript for all new code
- Define interfaces for props and state
- Avoid `any` type - use proper typing
- Use type imports: `import type { X } from 'y'`

### React Best Practices
```typescript
// ✅ Functional components with hooks
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<StateType>(initial);
  
  return <div>{/* content */}</div>;
};

// ✅ Custom hooks for reusable logic
function useMyHook() {
  // Logic here
  return { data, actions };
}
```

### File Naming
- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useUserProfile.ts`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `types.ts` or `ComponentName.types.ts`

## Component Guidelines

### Size Limit
**Max 500 lines per file**. If approaching limit:
1. Extract sub-components
2. Create custom hooks for logic
3. Move utilities to separate files

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types
interface Props {
  title: string;
  onAction: () => void;
}

// 3. Component
export const MyComponent: React.FC<Props> = ({ title, onAction }) => {
  // 3a. Hooks
  const [state, setState] = useState(false);
  
  // 3b. Handlers
  const handleClick = () => {
    onAction();
  };
  
  // 3c. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Action</Button>
    </div>
  );
};
```

### Styling Rules
1. **Use Tailwind CSS** - No custom CSS files
2. **Use semantic tokens** - `bg-background`, `text-foreground`
3. **Never use direct colors** - No `bg-white`, `text-black`
4. **Support dark mode** - All components must work in both themes
5. **Support neo-brutalism** - Add conditional styling

```typescript
// ✅ Correct
<div className="bg-background text-foreground border-border">

// ❌ Wrong
<div className="bg-white text-black border-gray-200">
```

## State Management

### When to Use What
| Scenario | Solution |
|----------|----------|
| Server data (DB) | React Query |
| Auth state | AuthContext |
| Theme | ThemeContext |
| Form state | React Hook Form |
| Local UI state | useState |
| Complex local state | useReducer |

### React Query Patterns
```typescript
// Fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['users', id],
  queryFn: () => fetchUser(id),
});

// Mutations
const mutation = useMutation({
  mutationFn: updateUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

## Error Handling

### General Rule
Don't catch errors unless you're handling them meaningfully.

```typescript
// ✅ Let errors bubble for debugging
const data = await supabase.from('table').select();

// ✅ Handle when user feedback needed
try {
  await saveData();
  toast.success('Saved!');
} catch (error) {
  toast.error('Failed to save');
}
```

## Performance

### Lazy Loading
All page components use lazy loading:
```typescript
const MyPage = lazy(() => import('./pages/MyPage'));
```

### Memoization
Use when preventing expensive re-renders:
```typescript
const MemoizedComponent = memo(ExpensiveComponent);
const memoizedValue = useMemo(() => compute(a, b), [a, b]);
const memoizedFn = useCallback(() => doSomething(a), [a]);
```

### Image Optimization
- Use appropriate sizes
- Lazy load images below fold
- Use WebP format when possible

## Testing Checklist

Before submitting changes:
- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Works with neo-brutalism enabled
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Forms validate correctly
- [ ] Loading states shown
- [ ] Error states handled

## Git Practices

### Commit Messages
```
feat: add PDF export feature
fix: resolve login redirect issue
refactor: extract ProfileCard component
docs: update README
style: format code
```

### Branch Naming
```
feature/resume-pdf-export
fix/login-redirect
refactor/profile-components
```

## Documentation

### Required Comments
1. Complex business logic
2. Workarounds with explanation
3. Non-obvious implementations

### JSDoc for Public APIs
```typescript
/**
 * Generates a PDF from the resume preview
 * @param resumeData - The resume data to export
 * @param template - Template ID to use
 * @returns Promise<Blob> - The generated PDF
 */
export async function generatePDF(
  resumeData: ResumeData,
  template: string
): Promise<Blob> {
  // Implementation
}
```
