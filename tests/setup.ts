import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

function createCtxMock(): CanvasRenderingContext2D {
  const noop = () => {};
  return {
    setTransform: noop,
    clearRect: noop,
    fillRect: noop,
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    closePath: noop,
    fill: noop,
    stroke: noop,
    arc: noop,
    save: noop,
    restore: noop,
    setLineDash: noop,
    translate: noop,
    rotate: noop,
    scale: noop,
    canvas: document.createElement("canvas"),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
}

HTMLCanvasElement.prototype.getContext = function getContext() {
  return createCtxMock();
};

// Evitar bucles RAF abiertos en jsdom (usa timers nativos de jsdom si existen).
const nativeRaf = globalThis.requestAnimationFrame?.bind(globalThis);
const nativeCancel = globalThis.cancelAnimationFrame?.bind(globalThis);

globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
  if (nativeRaf) return nativeRaf(cb);
  return setTimeout(() => cb(performance.now()), 16) as unknown as number;
};

globalThis.cancelAnimationFrame = (id: number) => {
  if (nativeCancel) nativeCancel(id);
  else clearTimeout(id);
};
