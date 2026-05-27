import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/villa-lead-tracker/",
  plugins: [react()],
});
