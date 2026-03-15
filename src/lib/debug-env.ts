/** Debug environment helpers for optional global page navigation in local development. */
export function isDebugGlobalNavEnabled() {
  return process.env.NEXT_PUBLIC_DEBUG_GLOBAL_NAV === "true";
}
