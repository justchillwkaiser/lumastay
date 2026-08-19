import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Explicit cleanup: RTL auto-cleanup relies on afterEach being a global,
// which is not the case here (globals disabled in vitest 4 projects mode).
afterEach(() => cleanup());
