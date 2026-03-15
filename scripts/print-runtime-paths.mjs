import path from "path";

function resolveRuntimePath(inputPath) {
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(process.cwd(), inputPath);
}

const uploadsDir = resolveRuntimePath(process.env.UPLOADS_DIR || "uploads");
const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
const backupDir = process.env.UPLOADS_BACKUP_DIR
  ? resolveRuntimePath(process.env.UPLOADS_BACKUP_DIR)
  : null;

console.log(
  JSON.stringify(
    {
      cwd: process.cwd(),
      databaseUrl,
      uploadsDir,
      uploadsBackupDir: backupDir,
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000",
    },
    null,
    2,
  ),
);
