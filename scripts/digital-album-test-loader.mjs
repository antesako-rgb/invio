import { readFileSync, existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const root = new URL("../src/", import.meta.url);
registerHooks({
  resolve(specifier, context, next) {
    if (
      specifier.startsWith("@/") ||
      (context.parentURL?.startsWith(root.href) && specifier.startsWith("."))
    ) {
      const base = specifier.startsWith("@/")
        ? new URL(specifier.slice(2), root)
        : new URL(specifier, context.parentURL);
      for (const suffix of ["", ".ts", ".tsx"])
        if (existsSync(fileURLToPath(base.href + suffix)))
          return { url: base.href + suffix, shortCircuit: true };
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith(root.href) && /\.tsx?$/.test(url))
      return {
        format: "module",
        source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ESNext,
            jsx: ts.JsxEmit.ReactJSX,
          },
        }).outputText,
        shortCircuit: true,
      };
    return next(url, context);
  },
});
