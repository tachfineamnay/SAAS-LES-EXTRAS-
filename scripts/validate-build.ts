import { access, readFile } from "node:fs/promises";
import path from "node:path";

type PackageJson = {
  scripts?: Record<string, string>;
};

type ScriptCheck = {
  file: string;
  required: string[];
};

const scriptChecks: ScriptCheck[] = [
  {
    file: "package.json",
    required: ["build", "prisma:seed"],
  },
  {
    file: "apps/api/package.json",
    required: ["build", "start", "prisma:seed"],
  },
  {
    file: "apps/web/package.json",
    required: ["build", "start"],
  },
];

const requiredFiles = [
  "docker-compose.coolify.yml",
  "apps/api/Dockerfile",
  "apps/web/Dockerfile",
  "apps/api/.env.example",
  "apps/web/.env.example",
  "apps/api/src/health.controller.ts",
];

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readPackageJson(targetPath: string): Promise<PackageJson | null> {
  try {
    const raw = await readFile(targetPath, "utf8");
    return JSON.parse(raw) as PackageJson;
  } catch {
    return null;
  }
}

async function checkScripts(rootDir: string): Promise<number> {
  let errors = 0;

  for (const check of scriptChecks) {
    const absolutePath = path.join(rootDir, check.file);
    const parsed = await readPackageJson(absolutePath);

    if (!parsed) {
      console.error(`[MISSING] Cannot read ${check.file}`);
      errors += 1;
      continue;
    }

    for (const scriptName of check.required) {
      if (!parsed.scripts?.[scriptName]) {
        console.error(`[MISSING] Script "${scriptName}" in ${check.file}`);
        errors += 1;
      } else {
        console.log(`[OK] ${check.file} -> script "${scriptName}"`);
      }
    }
  }

  return errors;
}

async function checkCriticalFiles(rootDir: string): Promise<number> {
  let errors = 0;

  for (const filePath of requiredFiles) {
    const absolutePath = path.join(rootDir, filePath);
    const exists = await fileExists(absolutePath);

    if (!exists) {
      console.error(`[MISSING] ${filePath}`);
      errors += 1;
      continue;
    }

    console.log(`[OK] ${filePath}`);
  }

  return errors;
}

async function checkHealthEndpoint(): Promise<void> {
  const baseUrl = (
    process.env.API_BASE_URL ?? "http://localhost:3001/api"
  ).replace(/\/$/, "");
  const healthUrl = `${baseUrl}/health`;

  try {
    const response = await fetch(healthUrl, { method: "GET" });

    if (!response.ok) {
      console.warn(
        `[WARN] Health check responded with HTTP ${response.status} at ${healthUrl}`,
      );
      return;
    }

    let message = "";
    try {
      const payload = (await response.json()) as {
        status?: string;
        service?: string;
      };
      message = payload.status ? ` status=${payload.status}` : "";
      if (payload.service) {
        message += ` service=${payload.service}`;
      }
    } catch {
      message = "";
    }

    console.log(`[OK] Health check reachable at ${healthUrl}${message}`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown error";
    console.warn(`[WARN] Health check unreachable at ${healthUrl} (${reason})`);
  }
}

async function main(): Promise<void> {
  const rootDir = process.cwd();
  console.log("== validate-build pre-flight ==");
  console.log(`Workspace: ${rootDir}`);

  const scriptErrors = await checkScripts(rootDir);
  const fileErrors = await checkCriticalFiles(rootDir);
  await checkHealthEndpoint();

  const totalErrors = scriptErrors + fileErrors;
  if (totalErrors > 0) {
    console.error(`Validation failed with ${totalErrors} blocking issue(s).`);
    process.exit(1);
  }

  console.log("Validation succeeded (no blocking issue found).");
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Validation crashed: ${message}`);
  process.exit(1);
});
