import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()], // componentTagger() was removed from here
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
