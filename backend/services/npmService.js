import axios from "axios";

export async function fetchPackageMetadata(packageName) {
  const { data } = await axios.get(
    `https://registry.npmjs.org/${packageName}`,
    {
      timeout: 5000,
    }
  );

  const latestVersion = data["dist-tags"].latest;
  const versionInfo = data.versions[latestVersion];

  return {
    latestVersion,
    scripts: versionInfo.scripts || {},
    tarballUrl: versionInfo.dist.tarball,
  };
}