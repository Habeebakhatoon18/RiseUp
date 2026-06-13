import axios from "axios";

const NPM_REGISTRY = "https://registry.npmjs.org";

export async function fetchPackageMetadata(packageName) {
  const encodedName = encodeURIComponent(packageName);
  const { data } = await axios.get(`${NPM_REGISTRY}/${encodedName}`, {
    timeout: 10_000,
    maxRedirects: 3,
    validateStatus: (status) => status === 200,
  });

  const latestVersion = data["dist-tags"]?.latest;
  const versionInfo = latestVersion ? data.versions?.[latestVersion] : null;

  if (!latestVersion || !versionInfo?.dist?.tarball) {
    throw new Error("Package metadata is incomplete");
  }

  return {
    latestVersion,
    scripts: versionInfo.scripts || {},
    tarballUrl: versionInfo.dist.tarball,
  };
}
