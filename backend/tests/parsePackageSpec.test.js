import test from "node:test";
import assert from "node:assert/strict";
import { parsePackageSpec } from "../utils/parsePackageSpec.js";

test("parsePackageSpec splits name and version", () => {
  assert.deepEqual(parsePackageSpec("axios@1.14.1"), {
    name: "axios",
    version: "1.14.1",
  });
});

test("parsePackageSpec handles scoped packages with versions", () => {
  assert.deepEqual(parsePackageSpec("@babel/core@7.24.0"), {
    name: "@babel/core",
    version: "7.24.0",
  });
});

test("parsePackageSpec keeps bare package names unchanged", () => {
  assert.deepEqual(parsePackageSpec("axios"), {
    name: "axios",
    version: null,
  });
});
