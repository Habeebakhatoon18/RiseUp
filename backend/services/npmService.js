import axios from "axios";

export async function fetchPackageMetadata(packageName) {
  const response = await axios.get(
    `https://registry.npmjs.org/${packageName}`
  );

  return {
    latestVersion: response.data["dist-tags"].latest,
  };
}