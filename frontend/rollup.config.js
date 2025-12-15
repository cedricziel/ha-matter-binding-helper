import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/matter-binding-panel.ts",
  output: {
    file: "../custom_components/matter_binding_helper/frontend/matter-binding-panel.js",
    format: "es",
    sourcemap: !production,
  },
  plugins: [
    resolve({
      browser: true,
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      outDir: "../custom_components/matter_binding_helper/frontend",
    }),
    production && terser(),
  ],
};
