/**
 * Monitoring seam for error reporting.
 * Currently a no-op, but ready for Sentry or other monitoring tools to be dropped in.
 */

export const captureError = (error: unknown, context?: Record<string, any>) => {
  // In production, this would send to Sentry/DataDog/etc. Always log for now
  // (there's nowhere else these errors currently go) - `process.env.NODE_ENV`
  // doesn't exist in a Vite browser bundle, so the old check here was dead.
  console.error('[Monitoring] Captured error:', error, context);
};
