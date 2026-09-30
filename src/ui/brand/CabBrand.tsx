import { COPY_ES } from "../../data/copy/es";
import { CabLogo } from "./CabLogo";

/**
 * Marca institucional CAB — APO-CAB C-A1.
 * Textos solo desde COPY_ES.brand (HRU / U-First).
 */
export function CabBrand() {
  return (
    <div
      className="cab-brand glass-panel glass-panel--strong"
      data-testid="cab-brand"
      role="group"
      aria-label={COPY_ES.brand.logoAlt}
    >
      <div className="cab-brand__mark" aria-hidden="true">
        <CabLogo className="cab-brand__logo" />
      </div>
      <div className="cab-brand__text">
        <h1 className="cab-brand__title">
          <span className="cab-brand__org">{COPY_ES.brand.organization}</span>
          <span className="cab-brand__badge">{COPY_ES.brand.badge}</span>
        </h1>
        <p className="cab-brand__product">{COPY_ES.brand.product}</p>
        <p className="cab-brand__audience">{COPY_ES.brand.audience}</p>
      </div>
    </div>
  );
}
