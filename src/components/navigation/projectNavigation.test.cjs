/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const ts = require("typescript");
const exportsValue = {};
const source = fs.readFileSync(path.join(__dirname, "ProjectNavigationContext.tsx"), "utf8");
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, { exports: exportsValue, require(name) { if (name === "react") return { createContext: () => ({}) }; return {}; } });
const resolve = exportsValue.resolveProjectNavigation;
test("project routes select the correct workspace item including child routes", () => {
  for (const [suffix, active] of [["", "projectOverview"], ["/invitations", "projectOverview"], ["/settings", "projectOverview"], ["/guests", "projectOverview"], ["/guests/detail", "projectOverview"], ["/collaborators", "collaborators"]]) {
    const value = resolve(`/dashboard/projects/project${suffix}`, null);
    assert.equal(value.projectId, "project"); assert.equal(value.activeId, active);
  }
});
test("server-resolved product context survives management tabs and never leaks to unrelated routes", () => {
  for (const kind of ["invitations", "photo-walls", "albums"]) {
    const context = { prefix: `/dashboard/${kind}/item`, projectId: "owner-project" };
    assert.equal(resolve(context.prefix, context).projectId, "owner-project");
    assert.equal(resolve(`${context.prefix}/settings`, context).activeId, "projectOverview");
    assert.equal(resolve(`/dashboard/${kind}/other`, context).projectId, undefined);
    assert.equal(resolve("/dashboard/profile", context).projectId, undefined);
    assert.equal(resolve("/dashboard/projects/another/guests", context).projectId, "another");
  }
});
