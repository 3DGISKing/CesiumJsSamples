/* eslint-disable import/no-extraneous-dependencies */

import { resolve } from "path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const cesiumSource = "node_modules/cesium/Build/Cesium";
const cesiumBaseUrl = "cesiumStatic";

export default defineConfig(({ command }) => ({
    define:
        command === "serve"
            ? {
                  // Remove Below Define CESIUM_BASE_URL for Build
                  // Define relative base path in cesium for loading assets
                  // https://vitejs.dev/config/shared-options.html#define
                  CESIUM_BASE_URL: JSON.stringify(`/${cesiumBaseUrl}`)
              }
            : {},
    plugins: [
        // remove viteStaticCopy for build
        ...(command === "serve"
            ? [
                  viteStaticCopy({
                      targets: [
                          { src: `${cesiumSource}/ThirdParty`, dest: cesiumBaseUrl },
                          { src: `${cesiumSource}/Workers`, dest: cesiumBaseUrl },
                          { src: `${cesiumSource}/Assets`, dest: cesiumBaseUrl },
                          { src: `${cesiumSource}/Widgets`, dest: cesiumBaseUrl }
                      ]
                  })
              ]
            : [])
    ],
    build: {
        outDir: "./dist",
        emptyOutDir: false, // also necessary
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "ViteBoilerPlate",
            // the proper extensions will be added
            fileName: (format, entryName) => `vite-boilerplate.${format}.js`,
            formats: ["umd", "es"] // / Supports UMD for global use & ES module for modern bundling
        },
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ["cesium"],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    cesium: "Cesium"
                },
                assetFileNames: "vite-boilerplate.[ext]" // Generalized asset naming
            }
        },
        minify: "terser", // Optimize file size
        sourcemap: true // Enable source maps for debugging
    }
}));
