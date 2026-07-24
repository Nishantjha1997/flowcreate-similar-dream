import { toast, type ExternalToast } from 'sonner';

/**
 * Toast copy convention (U-2b): every error names what failed, why (when
 * known), and the next step; every success is a short past-tense
 * confirmation. Centralized here so the resume and cover letter builders
 * stop mixing "Failed to X: <raw message>" with bare raw messages.
 */
export function toastActionFailed(
  action: string,
  reason?: string | null,
  nextStep?: string,
  options?: ExternalToast
) {
  const parts = [`Couldn't ${action}.`];
  if (reason) parts.push(reason.endsWith('.') ? reason : `${reason}.`);
  if (nextStep) parts.push(nextStep);
  toast.error(parts.join(' '), options);
}

export function toastActionDone(message: string, options?: ExternalToast) {
  toast.success(message, options);
}
