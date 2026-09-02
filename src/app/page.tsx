import { SalaryCalculator } from "@/components/SalaryCalculator";
import { listRecentSalaryCalculations } from "@/server/services/salaryCalculationService";

export const dynamic = "force-dynamic";

async function loadRecentCalculations() {
  if (!process.env.DATABASE_URL) {
    return {
      calculations: [],
      historyMessage: "Configura DATABASE_URL per abilitare persistenza reale e storico dei calcoli.",
    };
  }

  try {
    const calculations = await listRecentSalaryCalculations(10);

    return {
      calculations,
      historyMessage: null,
    };
  } catch {
    return {
      calculations: [],
      historyMessage: "Lo storico non e' disponibile al momento. Verifica connessione e configurazione del database.",
    };
  }
}

export default async function HomePage() {
  const { calculations, historyMessage } = await loadRecentCalculations();

  return (
    <main>
      <div className="hero-shell">
        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">RAL -&gt; Netto</p>
            <div className="hero-content">
              <h1>Da RAL a stipendio netto</h1>
              <p className="hero-subtitle">Calcolatore stipendio italiano</p>
              <p className="hero-description">
                Calcola una stima dello stipendio netto annuale e mensile partendo dalla tua
                Retribuzione Annua Lorda.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="page-shell">
        <div className="stack">
          <section className="section-card" aria-label="Assunzioni della simulazione">
            <p className="section-eyebrow">Assunzioni della simulazione</p>
            <ul className="plain-list">
              <li>Dipendente a tempo indeterminato</li>
              <li>Impiegato</li>
              <li>Residenza: Milano</li>
              <li>Nessuna agevolazione particolare</li>
              <li>Nessun familiare a carico</li>
              <li>Nessun altro reddito</li>
            </ul>
          </section>

          <SalaryCalculator
            initialCalculations={calculations}
            initialHistoryMessage={historyMessage}
          />
        </div>

        <section className="info-grid" aria-label="Informazioni importanti">
          <article className="info-card">
            <h2>Disclaimer</h2>
            <p>
              Il calcolo e&apos; una simulazione semplificata e ha esclusivamente finalita&apos;
              informative. Il netto effettivo puo&apos; variare in base al contratto, alle
              detrazioni, alle addizionali, alla situazione personale e ad altri elementi
              fiscali e contributivi.
            </p>
          </article>
          <article className="info-card">
            <h2>Approccio del prototipo</h2>
            <p>
              La UI invia i dati al backend server-side di Next.js. Il risultato autorevole
              viene calcolato nel dominio applicativo e salvato su PostgreSQL tramite Prisma.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
