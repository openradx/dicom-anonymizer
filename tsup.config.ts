import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/*.ts", '!src/loader.ts'],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  splitting: false,
  clean: true,
});
