import { resolve } from "path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: "./src/anonymizer.ts",
      name: "Anonymizer",
      // the proper extensions will be added
      fileName: "dicom-web-anonymizer",
    },
    sourcemap: true,
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      input: "./src/anonymizer.ts",
      output: {
        dir: "dist",
        entryFileNames: "dicom-web-anonymizer.js",
        format: "umd",
        name: "Anonymizer",
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          dcmjs: "dcmjs",
          fs: "fs",
          "get-random-values": "getRandomValues",
        },
      },
      external: ["dcmjs", "fs", "get-random-values", "./public/*"],
    },
  },
  publicDir: false,
  plugins: [dts()],
  test: {
    environment: "jsdom",
    exclude: ["**/node_modules/**", "./src/**"],
    globals: true,
    fileParallelism: true,
  },
});
