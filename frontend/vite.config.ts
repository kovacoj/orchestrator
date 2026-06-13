import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// The built React app is served by the experiment-lab FastAPI backend
// at the `/app/` mount point (see app/api/main.py). Using `base: '/app/'`
// ensures the generated asset URLs resolve correctly when mounted on a
// subpath. We emit straight into `experiment-lab/app/static_react/` so
// the backend ships with the bundle inside its own repo and no
// cross-repo path lookup is needed at runtime.
export default defineConfig({
  plugins: [react()],
  base: "/app/",
  build: {
    outDir: fileURLToPath(new URL("../experiment-lab/app/static_react", import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true,
  },
});
