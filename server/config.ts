import "dotenv/config";

function required(name: string, value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return normalized;
}

const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET?.trim();
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY?.trim() ??
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (isProduction && !jwtSecret) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

if (isProduction && jwtSecret && jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters in production");
}

const frontendUrl =
  process.env.FRONTEND_URL?.trim() ??
  (isProduction ? "" : "http://localhost:5173");

export const config = {
  isProduction,
  port: Number(process.env.PORT) || 3001,
  jwtSecret: jwtSecret ?? "prismdesign-dev-secret",
  frontendOrigins: required("FRONTEND_URL", frontendUrl)
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
  supabaseUrl: required("SUPABASE_URL", process.env.SUPABASE_URL),
  supabaseSecretKey: required(
    "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY",
    supabaseSecretKey,
  ),
};
