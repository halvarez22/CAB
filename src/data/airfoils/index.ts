import naca2412 from "../airfoils/naca2412.json";
import type { AirfoilData } from "../../domain/types";

export const NACA2412: AirfoilData = naca2412 as AirfoilData;

export function getDefaultAirfoil(): AirfoilData {
  return NACA2412;
}
