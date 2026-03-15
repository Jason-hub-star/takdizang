import { cp, mkdir, stat } from "fs/promises";
import path from "path";

function resolveRuntimePath(inputPath) {
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(process.cwd(), inputPath);
}

const uploadsDir = resolveRuntimePath(process.env.UPLOADS_DIR || "uploads");
const backupRoot = process.env.UPLOADS_BACKUP_DIR
  ? resolveRuntimePath(process.env.UPLOADS_BACKUP_DIR)
  : null;

if (!backupRoot) {
  console.error("UPLOADS_BACKUP_DIR is required for backup:uploads");
  process.exit(1);
}

await stat(uploadsDir).catch(() => {
  console.error(`Uploads directory not found: ${uploadsDir}`);
  process.exit(1);
});

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const snapshotDir = path.join(backupRoot, `takdi-uploads-${timestamp}`);

await mkdir(snapshotDir, { recursive: true });
await cp(uploadsDir, path.join(snapshotDir, "uploads"), { recursive: true });

console.log(
  JSON.stringify(
    {
      uploadsDir,
      snapshotDir,
    },
    null,
    2,
  ),
);
