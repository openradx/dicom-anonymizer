import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "./src/anonymizer.ts"),
      name: "dicom-web-anonymizer3",
      // the proper extensions will be added
      fileName: "dicom-web-anonymizer",
    },
    sourcemap: true,
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["dcmjs"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          dcmjs: "dcmjs",
        },
      },
    },
  },
  plugins: [dts({ include: ["./types/dcm.d.ts"] })],
});
