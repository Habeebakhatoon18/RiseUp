/**
 * Parse npm install-style specs: axios, axios@1.14.1, @scope/pkg@2.0.0
 */
export function parsePackageSpec(spec) {
  const trimmed = spec?.trim();
  if (!trimmed) {
    return { name: "", version: null };
  }

  if (trimmed.startsWith("@")) {
    const slashIndex = trimmed.indexOf("/");
    if (slashIndex === -1) {
      return { name: trimmed, version: null };
    }

    const versionAt = trimmed.indexOf("@", slashIndex + 1);
    if (versionAt !== -1) {
      return {
        name: trimmed.slice(0, versionAt),
        version: trimmed.slice(versionAt + 1),
      };
    }

    return { name: trimmed, version: null };
  }

  const versionAt = trimmed.lastIndexOf("@");
  if (versionAt > 0) {
    return {
      name: trimmed.slice(0, versionAt),
      version: trimmed.slice(versionAt + 1),
    };
  }

  return { name: trimmed, version: null };
}
