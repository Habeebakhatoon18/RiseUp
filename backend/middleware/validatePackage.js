const PACKAGE_NAME_REGEX =
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i;
const MAX_PACKAGE_NAME_LENGTH = 214;

export function validatePackage(req, res, next) {
  const packageName = req.body?.package?.trim();

  if (!packageName) {
    return res.status(400).json({ error: "Missing required field: package" });
  }

  if (packageName.length > MAX_PACKAGE_NAME_LENGTH) {
    return res.status(400).json({ error: "Package name is too long" });
  }

  if (!PACKAGE_NAME_REGEX.test(packageName)) {
    return res.status(400).json({ error: "Invalid npm package name format" });
  }

  req.packageName = packageName;
  next();
}
