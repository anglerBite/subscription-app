import { existsSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const defaultSdkRoots = {
  darwin: join(homedir(), "Library", "Android", "sdk"),
  linux: join(homedir(), "Android", "sdk"),
  win32: join(homedir(), "AppData", "Local", "Android", "Sdk"),
};

const expoBin =
  platform() === "win32"
    ? join(process.cwd(), "node_modules", ".bin", "expo.cmd")
    : join(process.cwd(), "node_modules", ".bin", "expo");

function getDefaultSdkRoot() {
  return defaultSdkRoots[platform()] ?? null;
}

function getSdkRoot() {
  const sdkRoot = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT;

  if (sdkRoot && existsSync(sdkRoot)) {
    return sdkRoot;
  }

  const defaultSdkRoot = getDefaultSdkRoot();

  if (defaultSdkRoot && existsSync(defaultSdkRoot)) {
    return defaultSdkRoot;
  }

  return null;
}

function getAdbPath(sdkRoot) {
  if (!sdkRoot) {
    return null;
  }

  const adbName = platform() === "win32" ? "adb.exe" : "adb";
  const adbPath = join(sdkRoot, "platform-tools", adbName);

  return existsSync(adbPath) ? adbPath : null;
}

function hasGlobalAdb() {
  const command = platform() === "win32" ? "where" : "which";
  const result = spawnSync(command, ["adb"], { stdio: "ignore" });

  return result.status === 0;
}

function printSetupHelp() {
  const defaultSdkRoot = getDefaultSdkRoot();

  console.error("");
  console.error("Android SDK / adb could not be found.");
  console.error("");
  console.error("Do one of the following before running `npm run android`:");
  console.error("1. Install Android Studio and the Android SDK.");
  if (defaultSdkRoot) {
    console.error(`2. Confirm the SDK exists at: ${defaultSdkRoot}`);
  }
  console.error("3. Set ANDROID_HOME to your SDK path.");
  console.error("4. Add `$ANDROID_HOME/platform-tools` to PATH.");
  console.error("");
  console.error("Example for zsh on macOS:");
  console.error('export ANDROID_HOME="$HOME/Library/Android/sdk"');
  console.error('export PATH="$ANDROID_HOME/platform-tools:$PATH"');
  console.error("");
  console.error("If you only want to start Metro, use `npm start` instead.");
  console.error("If you want a browser preview, use `npm run web`.");
}

const sdkRoot = getSdkRoot();
const adbPath = getAdbPath(sdkRoot);

if (!adbPath && !hasGlobalAdb()) {
  printSetupHelp();
  process.exit(1);
}

const child = spawn(expoBin, ["start", "--android"], {
  stdio: "inherit",
  env: {
    ...process.env,
    ...(sdkRoot ? { ANDROID_HOME: sdkRoot } : {}),
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

