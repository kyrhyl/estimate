# Testing Guide

## Overview
This project uses Jest and React Testing Library for comprehensive testing.

## Available Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Test File Naming
- Component tests: `ComponentName.test.tsx`
- Hook tests: `hookName.test.ts`
- Utility tests: `utilityName.test.ts`

### Test Organization
```
src/
  components/
    structural/
      ColumnTab.test.tsx      # Component tests
      useBuildingState.test.ts # Hook tests
```

## Writing Tests

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import MyComponent from './MyComponent'

test('renders correctly', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})

test('handles user interaction', () => {
  render(<MyComponent />)
  fireEvent.click(screen.getByText('Click me'))
  expect(screen.getByText('Clicked!')).toBeInTheDocument()
})
```

### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from './useMyHook'

test('hook works correctly', () => {
  const { result } = renderHook(() => useMyHook())

  act(() => {
    result.current.someAction()
  })

  expect(result.current.state).toBe(expectedValue)
})
```

## Best Practices

1. **Test Behavior, Not Implementation**: Test what users see and do, not internal code
2. **Use Descriptive Test Names**: `should show error when invalid input`
3. **Keep Tests Independent**: Each test should work in isolation
4. **Test Edge Cases**: Empty states, error conditions, loading states
5. **Mock External Dependencies**: API calls, timers, etc.

## Current Test Coverage

- ✅ `useBuildingState` hook - State management and updates
- ✅ `ColumnTab` component - Rendering and user interactions

## Adding New Tests

1. Create test file: `ComponentName.test.tsx`
2. Import necessary testing utilities
3. Write descriptive test cases
4. Run tests: `npm test`
5. Ensure all tests pass before committing

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Manual workflow triggers

All tests must pass for code to be merged.