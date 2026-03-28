import { defineConfig } from "@rsbuild/core";
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginReact } from "@rsbuild/plugin-react";
import stylexPlugin from "unplugin-stylex/rspack";

export default defineConfig({
  html: {
    template: "./public/index.html",
  },
  output: {
    distPath: "./build",
  },
  tools: {
    rspack: {
      plugins: [
        stylexPlugin({
          dev: process.env.NODE_ENV === "development",
        }),
      ],
    },
  },
  plugins: [
    pluginReact({ fastRefresh: true }),
    pluginBabel({
      include: /\.(?:jsx|tsx|ts|js)$/,
      babelLoaderOptions(opts) {
        opts.plugins?.unshift("babel-plugin-react-compiler");
      },
    }),
  ],
});
