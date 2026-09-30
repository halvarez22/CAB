/**
 * Smoke opcional (no CI): GROQ_API_KEY=... pnpm exec vite-node scripts/smoke-tutor.mts
 */
import { runTutorExplain } from "../src/domain/tutor-contract/pipeline";

const apiKey = process.env.GROQ_API_KEY ?? "";
const model = process.env.GROQ_MODEL;
if (!apiKey) {
  console.error("Falta GROQ_API_KEY");
  process.exit(1);
}

const result = await runTutorExplain({
  snapshot: {
    alphaDeg: 4,
    iasKt: 100,
    flapsDeg: 0,
    cl: 0.67,
    cd: 0.043,
    liftN: 2389,
    dragN: 154,
    liftLbf: 537,
    dragLbf: 35,
    lOverD: 15.5,
    status: "stable",
    criticalAlphaDeg: 15.5,
  },
  groq: { apiKey, model },
});

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 2);
