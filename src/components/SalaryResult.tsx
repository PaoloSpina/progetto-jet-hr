import { SalaryChart } from "@/components/SalaryChart";
import { TaxBreakdown } from "@/components/TaxBreakdown";
import type { StoredSalaryCalculation } from "@/domain/salary/salary.types";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatPercentage } from "@/lib/formatPercentage";

type SalaryResultProps = {
  calculation: StoredSalaryCalculation | null;
};

export function SalaryResult({ calculation }: SalaryResultProps) {
  if (!calculation) {
    return (
      <div className="result-empty">
        <div>
          <p className="section-eyebrow">Risultato</p>
          <h2>Il riepilogo comparira&apos; qui</h2>
          <p className="helper-text">
            Dopo il submit, il backend calcolera&apos; la stima e salvera&apos; il risultato nel
            database prima di restituirlo alla UI.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <article className="result-card result-summary">
        <p className="section-eyebrow">Stima risultato</p>
        <h2>Netto annuale e mensile</h2>

        <div className="summary-grid">
          <div className="metric-card">
            <p className="metric-label">Netto annuale stimato</p>
            <p className="metric-value positive">{formatCurrency(calculation.netAnnualSalary)}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Netto mensile stimato</p>
            <p className="metric-value">{formatCurrency(calculation.netMonthlySalary)}</p>
          </div>
        </div>

        <p className="helper-text">
          Tasse e contributi incidono per circa {formatPercentage(calculation.effectiveTaxRate)}{" "}
          della RAL.
        </p>
      </article>

      <TaxBreakdown calculation={calculation} />
      <SalaryChart calculation={calculation} />
    </div>
  );
}
