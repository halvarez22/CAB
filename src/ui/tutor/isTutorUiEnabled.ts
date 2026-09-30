/**
 * Feature flag UI tutor (APO-IA-1.2).
 * Visible por defecto. Solo se oculta si VITE_TUTOR_ENABLED === "false".
 */
export function isTutorUiEnabled(
  env: Pick<ImportMetaEnv, "VITE_TUTOR_ENABLED"> = import.meta.env,
): boolean {
  return env.VITE_TUTOR_ENABLED !== "false";
}
