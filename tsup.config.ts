import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    skipNodeModulesBundle: true,
    external: [
        "react",
        "react-dom",
        "use-sync-external-store"
    ],
    esbuildOptions(options) {
        options.banner = { js: '"use client";' };
        options.platform = "browser";
        options.target = "esnext";
        options.format = "esm";
        options.mainFields = ["module", "browser", "main"];
        options.conditions = ["import", "module", "browser"];
        
    },
});
