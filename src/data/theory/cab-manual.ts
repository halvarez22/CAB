/**
 * Manual teórico CAB — DOC-CAB-AERO-01 (APO-CAB C-A4).
 * Contenido pedagógico versionado; números de operación vienen de buildTheorySnapshot.
 */

export type CabManualSectionId = "P1" | "P2" | "TCP" | "CRM";

export interface CabManualSection {
  id: CabManualSectionId;
  title: string;
  lead: string;
  /** Párrafos adicionales (p. ej. CRM / windshear). */
  paragraphs?: readonly string[];
  bullets?: readonly string[];
}

export interface CabManualMeta {
  docId: string;
  heading: string;
  audience: string;
}

export const CAB_MANUAL_META: CabManualMeta = {
  docId: "DOC-CAB-AERO-01",
  heading: "Colegio Aeronáutico del Bajío · Manual de Aerodinámica",
  audience:
    "Guía teórica y operativa aplicada a la formación de Pilotos Aviadores y Sobrecargos (TCP).",
};

export const CAB_MANUAL_SECTIONS: readonly CabManualSection[] = [
  {
    id: "P1",
    title: "Génesis de la Sustentación: Bernoulli y Newton",
    lead:
      "El perfil alar genera sustentación mediante dos fenómenos complementarios esenciales para el piloto:",
    bullets: [
      "Gradiente de presión (Bernoulli): el flujo de aire viaja a mayor velocidad sobre la curvatura del extradós, produciendo una zona de baja presión que «succiona» el ala hacia arriba.",
      "Deflexión hacia abajo (3.ª Ley de Newton): el perfil deflecta la masa de aire hacia abajo (downwash); la reacción del aire genera una fuerza ascendente equivalente.",
    ],
  },
  {
    id: "P2",
    title: "Ángulo Crítico y Pérdida (Stall)",
    lead:
      "La pérdida aerodinámica ocurre exclusivamente por exceder el ángulo de ataque crítico del perfil (valor efectivo en el panel de operación del túnel), independientemente de la velocidad aerodinámica.",
    bullets: [
      "Física del fenómeno: la capa límite no puede seguir la curvatura extrema del extradós y se despega formando remolinos caóticos.",
      "Procedimiento de recuperación: disminución inmediata del ángulo de ataque (palanca adelante) antes de aplicar potencia máxima.",
    ],
  },
  {
    id: "TCP",
    title: "Flaps y Turbulencia en Cabina de Pasajeros",
    lead:
      "Conocimiento esencial para el tripulante de cabina de pasajeros del CAB:",
    bullets: [
      "Despliegue de flaps (10° a 30°): incrementa la combadura del ala para permitir volar a menor velocidad en despegues y aterrizajes. El sonido y la vibración en cabina son normales.",
      "Regla de cabina estéril: en altitudes inferiores a 10 000 pies o fases críticas, no se interrumpe a los pilotos salvo emergencias reales de seguridad o fuego.",
    ],
  },
  {
    id: "CRM",
    title: "Coordinación de Tripulación (Crew Resource Management)",
    lead: "La sinergia entre pilotos y sobrecargos salva vidas:",
    paragraphs: [
      "Ante una turbulencia severa o aproximación frustrada por pérdida de sustentación momentánea (windshear), el sobrecargo asegura la cabina en segundos, protege a los pasajeros y mantiene comunicación estandarizada con la cabina de mando.",
    ],
  },
] as const;

export function getCabManualSection(
  id: CabManualSectionId,
): CabManualSection {
  const found = CAB_MANUAL_SECTIONS.find((s) => s.id === id);
  if (!found) {
    throw new Error(`Sección de manual CAB desconocida: ${id}`);
  }
  return found;
}
