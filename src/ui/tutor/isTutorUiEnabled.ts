/** Feature flag UI tutor (APO-IA-1.1). Solo afecta render; la key sigue en server. */
export function isTutorUiEnabled(
  env: Pick<ImportMetaEnv, "VITE_TUTOR_ENABLED"> = import.meta.env,
): boolean {
  return env.VITE_TUTOR_ENABLED === "true";
}
