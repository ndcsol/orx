import dotenv from 'dotenv'
import { defineConfig } from "@playwright/test";

dotenv.config()

export default defineConfig({
  webServer: {
    command: "vite --config vite.config.ts",
    port: 5173,
    //@ts-ignore
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
  use: {
    headless: true,
  },
  testMatch: ["**/*.spec.ts"],
});
