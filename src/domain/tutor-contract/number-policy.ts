import { NUMBER_TOLERANCE } from "./constants";
import type { AeroSnapshot } from "./types";

/** Literales numéricos en texto (enteros/decimales, signo opcional). */
const NUMBER_RE = /-?\d+(?:\.\d+)?/g;

/**
 * Enteros 1–4 (pasos enumerados) y años 2000–2099 (disclaimer/contexto).
 * APO-IA-1.1 H-I1 — números inocuos.
 */
export function isInnocuousTutorNumber(n: number): boolean {
  if (Number.isInteger(n) && n >= 1 && n <= 4) return true;
  if (Number.isInteger(n) && n >= 2000 && n <= 2099) return true;
  return false;
}

export function extractNumbersFromText(text: string): number[] {
  const out: number[] = [];
  for (const m of text.matchAll(NUMBER_RE)) {
    const n = Number(m[0]);
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}

function forceTolerance(value: number, isLbf: boolean): number {
  const rel = Math.abs(value) * NUMBER_TOLERANCE.forceRel;
  const abs = isLbf ? NUMBER_TOLERANCE.forceAbsLbf : NUMBER_TOLERANCE.forceAbsN;
  return Math.max(rel, abs);
}

function matchesBand(n: number, center: number, tol: number): boolean {
  return Math.abs(n - center) <= tol;
}

/** ¿El número aparece en el snapshot dentro de tolerancias APO-IA-1.1? */
export function numberMatchesSnapshot(n: number, snapshot: AeroSnapshot): boolean {
  const t = NUMBER_TOLERANCE;
  if (matchesBand(n, snapshot.alphaDeg, t.alphaDeg)) return true;
  if (matchesBand(n, snapshot.criticalAlphaDeg, t.criticalAlphaDeg)) return true;
  if (matchesBand(n, snapshot.cl, t.cl)) return true;
  if (matchesBand(n, snapshot.cd, t.cd)) return true;
  if (matchesBand(n, snapshot.lOverD, t.lOverD)) return true;
  if (matchesBand(n, snapshot.iasKt, t.iasKt)) return true;
  if (n === snapshot.flapsDeg) return true;
  if (matchesBand(n, snapshot.liftN, forceTolerance(snapshot.liftN, false))) return true;
  if (matchesBand(n, snapshot.dragN, forceTolerance(snapshot.dragN, false))) return true;
  if (matchesBand(n, snapshot.liftLbf, forceTolerance(snapshot.liftLbf, true))) return true;
  if (matchesBand(n, snapshot.dragLbf, forceTolerance(snapshot.dragLbf, true))) return true;
  return false;
}

export interface NumberPolicyResult {
  ok: boolean;
  offenders: number[];
}

/**
 * Anti-alucinación numérica (H-I1): todo literal numérico del texto del tutor
 * debe coincidir con el snapshot (± tolerancia) o ser inocuo.
 */
export function assertTutorNumbersMatchSnapshot(
  text: string,
  snapshot: AeroSnapshot,
): NumberPolicyResult {
  const offenders: number[] = [];
  for (const n of extractNumbersFromText(text)) {
    if (isInnocuousTutorNumber(n)) continue;
    if (numberMatchesSnapshot(n, snapshot)) continue;
    offenders.push(n);
  }
  return { ok: offenders.length === 0, offenders };
}

export function tutorResponseTextBlob(parts: {
  titulo: string;
  explicacion: string;
  alerta_seguridad: string;
  siguiente_paso: string;
}): string {
  return [parts.titulo, parts.explicacion, parts.alerta_seguridad, parts.siguiente_paso].join(
    "\n",
  );
}
