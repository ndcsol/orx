import { defineConfig } from "vite";

export default defineConfig({
  root: "tests/e2e",
  base: "./", // Ensure relative paths work
  server: {
    port: 5173, // Single port for all test cases
    open: false,
    host: "localhost",
    fs: {
      strict: false
    }
  }
});
