/**
 * Build-time diagnostic: prints which database credentials the build sees
 * (username + host only — never the password), so misconfigured or shadowed
 * environment variables are visible in the deploy log.
 */
for (const key of ["DATABASE_URL", "DIRECT_URL"]) {
  const value = process.env[key];
  if (!value) {
    console.log(`[env-check] ${key}: MISSING`);
    continue;
  }
  try {
    const u = new URL(value);
    console.log(
      `[env-check] ${key}: user=${u.username} host=${u.host} db=${u.pathname.slice(1)} params=${u.search || "(none)"}`
    );
  } catch {
    console.log(`[env-check] ${key}: set but not a parseable URL (${value.length} chars)`);
  }
}
