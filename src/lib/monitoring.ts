/**
 * Monitoring seam for error reporting.
 * Currently a no-op, but ready for Sentry or other monitoring tools to be dropped in.
 */

export const captureError = (error: unknown, context?: Record<string, any>) => {
  // In production, this would send to Sentry/DataDog/etc.
  if (process.env.NODE_ENV === 'development') {
    console.error('[Monitoring] Captured error:', error, context);
  }
};
