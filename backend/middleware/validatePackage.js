import { parsePackageSpec } from "../utils/parsePackageSpec.js";

const PACKAGE_NAME_REGEX =
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i;
const VERSION_REGEX = /^[a-z0-9.+~^\-*]+$/i;
const MAX_PACKAGE_NAME_LENGTH = 214;

export function validatePackage(req, res, next) {
  const rawInput = req.body?.package?.trim();
  const explicitVersion = req.body?.version?.trim() || null;

  if (!rawInput) {
    return res.status(400).json({ error: "Missing required field: package" });
  }

  const parsed = parsePackageSpec(rawInput);
  const packageName = parsed.name;
  const version = explicitVersion || parsed.version;

  if (!packageName) {
    return res.status(400).json({ error: "Invalid package specification" });
  }

  if (packageName.length > MAX_PACKAGE_NAME_LENGTH) {
    return res.status(400).json({ error: "Package name is too long" });
  }

  if (!PACKAGE_NAME_REGEX.test(packageName)) {
    return res.status(400).json({ error: "Invalid npm package name format" });
  }

  if (version && !VERSION_REGEX.test(version)) {
    return res.status(400).json({ error: "Invalid package version format" });
  }

  req.packageName = packageName;
  req.packageVersion = version;
  next();
}
