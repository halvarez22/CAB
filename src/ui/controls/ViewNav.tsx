import { COPY_ES } from "../../data/copy/es";
import { useFlightStore } from "../../domain/flight-state";

export function ViewNav() {
  const view = useFlightStore((s) => s.view);
  const setView = useFlightStore((s) => s.setView);

  return (
    <nav
      className="view-nav glass-panel"
      aria-label="Vistas"
      data-testid="view-nav"
    >
      <button
        type="button"
        data-testid="nav-tunnel"
        className={view === "tunnel" ? "is-active" : undefined}
        aria-pressed={view === "tunnel"}
        onClick={() => setView("tunnel")}
      >
        {COPY_ES.views.tunnel}
      </button>
      <button
        type="button"
        data-testid="nav-theory"
        className={view === "theory" ? "is-active" : undefined}
        aria-pressed={view === "theory"}
        onClick={() => setView("theory")}
      >
        {COPY_ES.views.theory}
      </button>
    </nav>
  );
}
