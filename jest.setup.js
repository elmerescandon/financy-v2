import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
  }),
}));
