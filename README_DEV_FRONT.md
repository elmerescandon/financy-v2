# Frontend Development Guidelines

## Architecture Principles

### Component Design Philosophy

#### Single Responsibility Principle

- Each component serves one clear purpose
- Split complex components into focused sub-components
- Use composition over inheritance patterns

#### Testability First

- Design components with testing in mind
- Separate business logic from UI rendering
- Use dependency injection for external dependencies

#### Progressive Enhancement

- Core functionality works without JavaScript
- Enhanced UX with React hydration
- Graceful degradation for unsupported features

### Project Structure Standards

**Directory Organization**:

```
src/components/
├── ui/                    # Base UI components (shadcn/ui)
├── feature-name/          # Feature-specific components
│   ├── ComponentName.tsx  # Main component
│   ├── index.ts          # Barrel exports
│   ├── utils.ts          # Helper functions
│   ├── types.ts          # Local type definitions
│   └── __tests__/        # Tests in same directory
│       ├── ComponentName.test.tsx
│       ├── utils.test.ts
│       └── __mocks__/
└── shared/               # Reusable cross-feature components
```

## Component Development Standards

### Component Structure Template

**Standard Component Implementation**:

```tsx
"use client"; // Only when necessary (interactivity, hooks, context)

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/utils/formats";
import type { ComponentProps } from "./types";

interface ComponentNameProps {
  // Props interface - always define explicitly
  data: ComponentProps[];
  onAction: (id: string) => Promise<void>;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function ComponentName({
  data,
  onAction,
  loading = false,
  className,
  children,
}: ComponentNameProps) {
  // 1. Hooks declarations (in order: state, effects, custom hooks)
  const [localState, setLocalState] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // 2. Event handlers
  const handleAction = async (id: string) => {
    try {
      setError(null);
      await onAction(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  };

  // 3. Computed values
  const filteredData = data.filter((item) => item.isActive);

  // 4. Early returns for loading/error states
  if (loading) {
    return <ComponentNameSkeleton />;
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-destructive">Error: {error}</p>
          <Button onClick={() => setError(null)} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 5. Main render
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Component Title</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredData.map((item) => (
          <div key={item.id}>
            <span>{item.name}</span>
            <Button onClick={() => handleAction(item.id)}>Action</Button>
          </div>
        ))}
        {children}
      </CardContent>
    </Card>
  );
}

// Export skeleton component for loading states
export function ComponentNameSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Hook Usage Standards

**State Management Patterns**:

```tsx
// ✅ Good: Use appropriate hook for the job
const [items, setItems] = useState<Item[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// ✅ Good: Use context for shared state
const { expenses, createExpense } = useExpenseContext();

// ❌ Avoid: Prop drilling for shared state
// Pass context data through multiple component layers
```

**Effect Patterns**:

```tsx
// ✅ Good: Dependency array and cleanup
useEffect(() => {
  let cancelled = false;

  async function fetchData() {
    try {
      const result = await api.getData();
      if (!cancelled) setData(result);
    } catch (err) {
      if (!cancelled) setError(err.message);
    }
  }

  fetchData();

  return () => {
    cancelled = true;
  };
}, [dependency]);

// ❌ Avoid: Missing dependencies or cleanup
useEffect(() => {
  fetchData(); // Missing dependency
});
```

### Form Component Standards

**React Hook Form Integration**:

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define schema at component level
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().min(0.01, "Amount must be positive"),
  category_id: z.string().uuid("Select a category"),
});

type FormData = z.infer<typeof formSchema>;

interface FormComponentProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export default function FormComponent({
  initialData,
  onSubmit,
  onCancel,
}: FormComponentProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      category_id: "",
      ...initialData,
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // Set server errors
      form.setError("root", {
        message: error instanceof Error ? error.message : "Submission failed",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### Context Integration Patterns

**Using Existing Contexts**:

```tsx
import { useExpenseContext } from "@/lib/context/ExpenseContext";

export default function ExpenseComponent() {
  const { expenses, loading, error, createExpense, updateFilters } =
    useExpenseContext();

  // Handle loading state
  if (loading) return <ComponentSkeleton />;

  // Handle error state
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div>
      {expenses.map((expense) => (
        <ExpenseItem key={expense.id} expense={expense} />
      ))}
    </div>
  );
}
```

**Creating New Contexts**:

```tsx
// types.ts
interface FeatureContextType {
  data: Item[];
  loading: boolean;
  error: string | null;
  createItem: (data: CreateItemData) => Promise<void>;
  updateItem: (id: string, data: UpdateItemData) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

// FeatureContext.tsx
("use client");

import { createContext, useContext, useState, useEffect } from "react";
import { FeatureService } from "@/lib/supabase/feature";

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export function FeatureProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createItem = async (itemData: CreateItemData) => {
    try {
      setError(null);
      const newItem = await FeatureService.create(itemData);
      setData((prev) => [newItem, ...prev]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Create failed";
      setError(message);
      throw new Error(message);
    }
  };

  // ... other methods

  return (
    <FeatureContext.Provider
      value={{
        data,
        loading,
        error,
        createItem,
        updateItem,
        deleteItem,
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatureContext() {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error("useFeatureContext must be used within FeatureProvider");
  }
  return context;
}
```

## UI & Styling Guidelines

### Shadcn/ui Component Usage

**Consistent Component Import**:

```tsx
// ✅ Good: Import from @/components/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ❌ Avoid: Direct radix imports
import * as Dialog from "@radix-ui/react-dialog";
```

**Proper Variant Usage**:

```tsx
// ✅ Good: Use semantic variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="default">Submit</Button>

// ✅ Good: Use proper sizing
<Button size="sm">Small Action</Button>
<Button size="default">Regular Action</Button>
<Button size="lg">Primary Action</Button>
```

### Tailwind CSS Standards

**Class Organization**:

```tsx
// ✅ Good: Organized class names
className =
  "flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-accent transition-colors";

// ✅ Good: Use clsx for conditional classes
import { clsx } from "clsx";

<div
  className={clsx(
    "base-classes",
    "layout-classes",
    "typography-classes",
    "color-classes",
    "interaction-classes",
    {
      "conditional-classes": condition,
      "error-classes": hasError,
    }
  )}
/>;
```

**Responsive Design**:

```tsx
// ✅ Good: Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card className="p-4 sm:p-6">Content</Card>
</div>

// ✅ Good: Responsive typography
<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
  Responsive Heading
</h1>
```

### Animation & Interaction

**Framer Motion Integration**:

```tsx
import { motion, AnimatePresence } from 'framer-motion'

// ✅ Good: Subtle, purposeful animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2 }}
>
  <Card>Content</Card>
</motion.div>

// ✅ Good: List animations
<AnimatePresence>
  {items.map(item => (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ItemComponent item={item} />
    </motion.div>
  ))}
</AnimatePresence>
```

## Testing Standards

### Test File Structure

**Testing Organization**:

```
__tests__/
├── ComponentName.test.tsx     # Component tests
├── utils.test.ts             # Utility function tests
├── integration.test.tsx      # Integration tests
└── __mocks__/               # Mock files
    ├── handlers.ts          # MSW handlers
    └── data.ts             # Test data
```

### Component Testing Template

**Component Test Implementation**:

```tsx
// ComponentName.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentName } from "../ComponentName";
import { mockData } from "./__mocks__/data";

// Mock external dependencies
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}));

describe("ComponentName", () => {
  const defaultProps = {
    data: mockData,
    onAction: jest.fn(),
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders component with data", () => {
    render(<ComponentName {...defaultProps} />);

    expect(screen.getByText("Component Title")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /action/i })).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<ComponentName {...defaultProps} loading={true} />);

    expect(screen.getByTestId("component-skeleton")).toBeInTheDocument();
  });

  it("handles user interactions", async () => {
    const user = userEvent.setup();
    const mockOnAction = jest.fn().mockResolvedValue(undefined);

    render(<ComponentName {...defaultProps} onAction={mockOnAction} />);

    await user.click(screen.getByRole("button", { name: /action/i }));

    await waitFor(() => {
      expect(mockOnAction).toHaveBeenCalledWith(mockData[0].id);
    });
  });

  it("handles errors gracefully", async () => {
    const mockOnAction = jest
      .fn()
      .mockRejectedValue(new Error("Action failed"));

    render(<ComponentName {...defaultProps} onAction={mockOnAction} />);

    await userEvent.click(screen.getByRole("button", { name: /action/i }));

    await waitFor(() => {
      expect(screen.getByText(/error: action failed/i)).toBeInTheDocument();
    });
  });
});
```

### Integration Testing with Context

**Context Integration Testing**:

```tsx
// integration.test.tsx
import { render, screen } from "@testing-library/react";
import { ExpenseProvider } from "@/lib/context/ExpenseContext";
import { ExpensePage } from "../ExpensePage";

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ExpenseProvider>{children}</ExpenseProvider>
);

describe("ExpensePage Integration", () => {
  it("integrates with expense context", async () => {
    render(<ExpensePage />, { wrapper: TestWrapper });

    // Test full integration flow
    expect(screen.getByRole("table")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });
  });
});
```

### Utility Function Testing

**Utility Test Implementation**:

```tsx
// utils.test.ts
import { formatAmount, calculatePercentage } from "../utils";

describe("Utility Functions", () => {
  describe("formatAmount", () => {
    it("formats PEN currency correctly", () => {
      expect(formatAmount(1234.56)).toMatch(/S\/.*1.*234.*56/);
    });

    it("handles zero amount", () => {
      expect(formatAmount(0)).toMatch(/S\/.*0/);
    });

    it("handles negative amounts", () => {
      expect(formatAmount(-100)).toMatch(/-.*S\/.*100/);
    });
  });

  describe("calculatePercentage", () => {
    it("calculates percentage correctly", () => {
      expect(calculatePercentage(25, 100)).toBe(25);
    });

    it("handles division by zero", () => {
      expect(calculatePercentage(10, 0)).toBe(0);
    });
  });
});
```

## Data Flow & State Management

### Component State vs Context State

**State Decision Matrix**:

**Use Local State For:**

- UI-only state (form inputs, modals, toggles)
- Component-specific loading states
- Temporary data that doesn't need sharing

**Use Context State For:**

- Shared application data (expenses, budgets, goals)
- User authentication state
- Global UI state (theme, language)

### Error Handling Patterns

**Component-Level Error Handling**:

```tsx
// Component-level error handling
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  try {
    setError(null);
    await action();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Action failed";
    setError(message);
    console.error("Component action error:", err);
  }
};

// Context-level error handling
const contextValue = {
  data,
  loading,
  error,
  createItem: async (data) => {
    try {
      setError(null);
      const result = await service.create(data);
      setData((prev) => [...prev, result]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Create failed";
      setError(message);
      throw new Error(message); // Re-throw for component handling
    }
  },
};
```

### Loading State Management

**Multiple Loading States Pattern**:

```tsx
// Multiple loading states
interface LoadingStates {
  initial: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

const [loading, setLoading] = useState<LoadingStates>({
  initial: true,
  creating: false,
  updating: false,
  deleting: false,
});

// Optimistic updates
const handleUpdate = async (id: string, data: UpdateData) => {
  // Optimistic update
  setItems((prev) =>
    prev.map((item) => (item.id === id ? { ...item, ...data } : item))
  );

  try {
    await service.update(id, data);
  } catch (err) {
    // Revert optimistic update
    setItems((prev) =>
      prev.map((item) => (item.id === id ? originalItem : item))
    );
    throw err;
  }
};
```

## Performance Optimization

### React Optimization Patterns

**Memoization Strategies**:

```tsx
// Memoization for expensive calculations
const expensiveValue = useMemo(() => {
  return data.reduce((sum, item) => sum + item.amount, 0);
}, [data]);

// Callback memoization
const handleItemClick = useCallback(
  (id: string) => {
    onItemSelect(id);
  },
  [onItemSelect]
);

// Component memoization
const MemoizedItem = memo(({ item, onSelect }: ItemProps) => {
  return <div onClick={() => onSelect(item.id)}>{item.name}</div>;
});
```

### Bundle Optimization

**Code Splitting Patterns**:

```tsx
// Dynamic imports for large components
const LazyChart = lazy(() => import('./Chart'))

// Code splitting by route
const LazyPage = lazy(() => import('./ExpensivePage'))

// Usage with suspense
<Suspense fallback={<ComponentSkeleton />}>
  <LazyChart data={chartData} />
</Suspense>
```

## Mobile & Accessibility

### Responsive Design Patterns

**Mobile-Friendly Implementation**:

```tsx
// Mobile-friendly component structure
<Card className="w-full">
  <CardHeader className="pb-3">
    <CardTitle className="text-base sm:text-lg">Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="order-2 sm:order-1">Content A</div>
      <div className="order-1 sm:order-2">Content B</div>
    </div>
  </CardContent>
</Card>
```

### Accessibility Standards

**Accessibility Implementation**:

```tsx
// Proper ARIA labels and roles
<Button
  aria-label="Delete expense"
  aria-describedby="delete-help"
  onClick={handleDelete}
>
  <TrashIcon className="h-4 w-4" />
  <span className="sr-only">Delete</span>
</Button>

// Keyboard navigation support
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction()
    }
  }}
  onClick={handleAction}
>
  Interactive Element
</div>

// Focus management
useEffect(() => {
  if (isOpen) {
    focusRef.current?.focus()
  }
}, [isOpen])
```

---

## Quick Reference Checklist

### Component Development Checklist:

- [ ] Single responsibility component design
- [ ] TypeScript interfaces defined for all props
- [ ] Error boundaries and loading states handled
- [ ] Accessibility attributes included
- [ ] Mobile responsiveness considered
- [ ] Context integration implemented correctly

### Testing Requirements:

- [ ] Component renders without crashing
- [ ] All user interactions tested
- [ ] Error states handled gracefully
- [ ] Loading states display correctly
- [ ] Integration with context providers works

### Performance Checklist:

- [ ] Memoization applied where needed
- [ ] Component exported from index.ts
- [ ] No console.logs or debugging code
- [ ] Bundle optimization considered
- [ ] Documentation comments added for complex logic

---

This comprehensive frontend development guide ensures consistency, maintainability, and quality across all frontend components in the Financy v2 project.
