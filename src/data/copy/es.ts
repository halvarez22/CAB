/** Copy UI en español — fuente única (HRU / U-First). */

export const COPY_ES = {
  /** Marca institucional CAB (APO-CAB C-A1). */
  brand: {
    organization: "Colegio Aeronáutico del Bajío",
    badge: "CAB",
    product: "Plataforma de Simulación y Laboratorio de Aerodinámica",
    audience: "Pilotos y Sobrecargos",
    logoAlt: "Emblema del Colegio Aeronáutico del Bajío",
  },
  /** Producto técnico (secundario al brand CAB). */
  appTitle: "AEROLAB",
  appSubtitle: "Túnel de Viento Didáctico",
  moduleLabel:
    "Colegio Aeronáutico del Bajío — Módulo Aerodinámica Básica · Pilotos y Sobrecargos",
  views: {
    tunnel: "Túnel Virtual",
    theory: "Manual CAB",
  },
  controls: {
    alpha: "Ángulo de ataque (α)",
    ias: "Velocidad del aire indicada (IAS)",
    flaps: "Configuración de flaps",
    flapsClean: "0° (Limpio)",
    flapsTakeoff: "10° (Despegue)",
    flapsApproach: "20° (Aproximación)",
    flapsLanding: "30° (Aterrizaje)",
    vectors: "Vectores",
    smoke: "Humo",
    vectorsOn: "Vectores: ON",
    vectorsOff: "Vectores: OFF",
    smokeOn: "Humo: ON",
    smokeOff: "Humo: OFF",
    pause: "Pausar",
    resume: "Reanudar",
    reset: "Reset",
    presetCruise: "Crucero",
    presetClimb: "Ascenso",
    presetStallDemo: "Demostrar pérdida",
    recoverAlpha: "Reducir α",
    resetToCruise: "Reset a crucero",
    audioOn: "Audio: ON",
    audioOff: "Audio: OFF",
    audioBlockedHint:
      "El navegador bloqueó el sonido. Vuelve a pulsar Audio tras interactuar con la página.",
  },
  audioDescriptions: {
    ambient_stable: "Ambiente de flujo estable",
    ambient_near_stall: "Ambiente cerca de la pérdida",
    ambient_stall: "Ambiente de pérdida",
    enter_stall: "Aviso de entrada en pérdida",
    recover_stable: "Aviso de recuperación a vuelo estable",
    stall_horn: "Alarma sonora de pérdida (stall horn)",
  },
  telemetry: {
    lift: "Sustentación (Lift)",
    drag: "Resistencia (Drag)",
    coefficients: "Coeficientes CL / CD",
    efficiency: "Eficiencia (L / D)",
    flowStatus: "Estado de flujo",
    relativeWind: "Viento relativo",
    profile: "Perfil",
    criticalAlpha: "Ángulo crítico",
    version: "Versión polar",
    unitN: "N",
    unitLbf: "lbf",
  },
  chart: {
    title: "Curva de sustentación (CL vs α)",
    axisAlpha: "α (°)",
    axisCl: "CL",
    criticalMarker: "Ángulo crítico",
    operatingPoint: "Punto de operación",
    stallZone: "Zona de pérdida",
  },
  legend: {
    lift: "Sustentación (L) — perpendicular",
    drag: "Resistencia (D) — paralela",
    resultant: "Resultante aerodinámica (R)",
  },
  flowStatus: {
    stable: "Flujo estable / Vuelo seguro",
    near_stall: "Cerca de la pérdida — reducir ángulo de ataque",
    stall: "Pérdida — reducir α o reset a crucero",
  },
  theory: {
    title: "Manual CAB — Aerodinámica",
    intro:
      "Este manual resume el modelo didáctico CAB. Los números del punto de operación provienen del perfil cargado y del motor aerodinámico (misma fuente que el túnel).",
    sectionProfile: "Perfil y datos de referencia",
    sectionForces: "Fuerzas aerodinámicas",
    sectionCurve: "Curva CL–α y pérdida",
    sectionOps: "Punto de operación actual",
    liftFormulaLabel: "Fórmula de sustentación (modelo didáctico)",
    liftFormula: "L = ½ · ρ · V² · S · CL",
    dragFormulaLabel: "Fórmula de resistencia (modelo didáctico)",
    dragFormula: "D = ½ · ρ · V² · S · CD",
    densityLabel: "Densidad del aire ρ",
    areaLabel: "Área de referencia S",
    criticalLabel: "Ángulo crítico α_crit (efectivo)",
    sourceLabel: "Fuente de calibración",
    calibratedLabel: "Fecha de calibración",
    currentAlpha: "α actual",
    currentCl: "CL actual",
    currentCd: "CD actual",
    currentLd: "L/D actual",
    currentStatus: "Estado de flujo",
    backToTunnel: "Volver al túnel",
    stallExplain:
      "Al superar el ángulo crítico efectivo, CL cae y el estado de flujo pasa a pérdida. El valor crítico y la polar se leen del perfil versionado y del motor (incl. flaps).",
  },
  tutor: {
    title: "Consulta al piloto experto",
    explainCta: "Consultar al piloto",
    questionLabel: "Escribe tu pregunta",
    questionPlaceholder:
      "Ej. ¿Qué pasa con la sustentación si aumento el ángulo de ataque?",
    questionHint: "Máximo 200 caracteres. Preguntas sobre aerodinámica del laboratorio.",
    questionRequired: "Escribe una pregunta para consultar al piloto.",
    loading: "El piloto está respondiendo…",
    unavailable:
      "Consulta no disponible por ahora; usa el Manual CAB o la telemetría.",
    unverifiable:
      "No pude verificar esa explicación; consulta el Manual CAB.",
    rateLimited:
      "Demasiadas consultas. Espera un momento e inténtalo de nuevo.",
    inputTooLong: "La pregunta supera el límite de 200 caracteres.",
    close: "Cerrar respuesta",
    labelTitulo: "Resumen",
    labelExplicacion: "Explicación",
    labelAlerta: "Alerta de seguridad",
    labelSiguiente: "Siguiente paso",
    disclaimer:
      "Respuesta didáctica de un piloto experto asistido por IA. No sustituye al Manual CAB ni a procedimientos de aeronave certificada. Los números provienen del modelo del túnel.",
  },
  disclaimer:
    "Modelo didáctico 2D. No representa el performance de una aeronave certificada ni sustituye un túnel de viento físico o un FTD.",
  phaseNote:
    "Tutor IA 1.2: prompt visible · piloto experto · conceptos del laboratorio.",
} as const;

/** Claves de descripción de cues (manifiesto → accesibilidad). */
export type AudioDescriptionKey = keyof typeof COPY_ES.audioDescriptions;
