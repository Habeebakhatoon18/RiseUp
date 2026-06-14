import axios from "axios";

const NPM_REGISTRY = "https://registry.npmjs.org";

export async function fetchPackageMetadata(packageName, requestedVersion = null) {
  const encodedName = encodeURIComponent(packageName);
  const { data } = await axios.get(`${NPM_REGISTRY}/${encodedName}`, {
    timeout: 10_000,
    maxRedirects: 3,
    validateStatus: (status) => status === 200,
  });

  const resolvedVersion = requestedVersion || data["dist-tags"]?.latest;
  const versionInfo = resolvedVersion ? data.versions?.[resolvedVersion] : null;

  if (!resolvedVersion || !versionInfo?.dist?.tarball) {
    throw new Error(
      requestedVersion
        ? `Version ${requestedVersion} not found for ${packageName}`
        : "Package metadata is incomplete"
    );
  }

  return {
    latestVersion: resolvedVersion,
    scripts: versionInfo.scripts || {},
    tarballUrl: versionInfo.dist.tarball,
  };
}
