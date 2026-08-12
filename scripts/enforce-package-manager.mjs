const userAgent = process.env.npm_config_user_agent ?? '';
const minimumPnpmVersion = [10, 32, 1];
const match = userAgent.match(/^pnpm\/(\d+)\.(\d+)\.(\d+)(?:\s|$)/);

function isAtLeastMinimumVersion(version) {
  for (let index = 0; index < minimumPnpmVersion.length; index += 1) {
    if (version[index] > minimumPnpmVersion[index]) return true;
    if (version[index] < minimumPnpmVersion[index]) return false;
  }

  return true;
}

if (!match || !isAtLeastMinimumVersion(match.slice(1).map(Number))) {
  console.error(
    'This project requires pnpm 10.32.1 or newer. Install a supported version and run `pnpm install`.',
  );
  process.exit(1);
}
