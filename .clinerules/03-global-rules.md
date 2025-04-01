
# 🌍 Global Project Rules

## 🔄 Project Awareness & Context
- Always check the current state of the project before implementing new features
- Understand the resume builder architecture, goals, style, and constraints
- Check TASK.md before starting a new task. If the task isn't listed, add it with a brief description and today's date
- Use consistent naming conventions, file structure, and architecture patterns

## 🧱 Code Structure & Modularity
- Never create a file longer than 500 lines of code. If a file approaches this limit, refactor by splitting it into modules or helper files
- Organize code into clearly separated modules, grouped by feature or responsibility
- Use clear, consistent imports (prefer relative imports within features)

## 🧪 Testing & Reliability
- Implement proper error handling for user interactions
- Ensure responsive design works on all device sizes
- Test both light and dark themes for all components
- Verify that resume preview accurately reflects customization changes

## ✅ Task Completion
- Mark completed tasks in TASK.md immediately after finishing them
- Add new sub-tasks or TODOs discovered during development to TASK.md under a "Discovered During Work" section

## 📎 Style & Conventions
- Use TypeScript for all components
- Follow React best practices and hooks guidelines
- Apply consistent Tailwind styling
- Use shadcn/ui components where applicable

## 🚀 Performance Guidelines
- Optimize image loading and rendering
- Use React Query for data fetching with proper caching
- Implement code splitting for better initial load times
- Minimize unnecessary re-renders
