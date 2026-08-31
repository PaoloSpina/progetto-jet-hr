import type { StoredSalaryCalculation } from "@/domain/salary/salary.types";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatPercentage } from "@/lib/formatPercentage";

type SalaryChartProps = {
  calculation: StoredSalaryCalculation;
};

export function SalaryChart({ calculation }: SalaryChartProps) {
  const netShare = 100 - calculation.effectiveTaxRate;

  return (
    <article className="section-card" aria-labelledby="salary-chart-title">
      <p className="section-eyebrow">Incidenza</p>
      <h2 id="salary-chart-title">Netto vs tasse e contributi</h2>

      <div className="chart-card">
        <div className="chart-track" role="img" aria-label="Confronto tra netto e tasse">
          <div className="chart-segment net" style={{ width: `${netShare}%` }} />
          <div
            className="chart-segment taxes"
            style={{ width: `${calculation.effectiveTaxRate}%` }}
          />
        </div>

        <div className="chart-legend">
          <div className="legend-item">
            <strong>Netto</strong>
            <span>
              {formatCurrency(calculation.netAnnualSalary)} ({formatPercentage(netShare)})
            </span>
          </div>
          <div className="legend-item">
            <strong>Tasse e contributi</strong>
            <span>
              {formatCurrency(calculation.totalTaxesAndContributions)} (
              {formatPercentage(calculation.effectiveTaxRate)})
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
