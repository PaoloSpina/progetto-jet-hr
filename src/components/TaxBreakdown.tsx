import type { StoredSalaryCalculation } from "@/domain/salary/salary.types";
import { formatCurrency } from "@/lib/formatCurrency";

type TaxBreakdownProps = {
  calculation: StoredSalaryCalculation;
};

export function TaxBreakdown({ calculation }: TaxBreakdownProps) {
  return (
    <article className="section-card" aria-labelledby="tax-breakdown-title">
      <p className="section-eyebrow">Dettaglio del calcolo</p>
      <h2 id="tax-breakdown-title">Scomposizione fiscale</h2>

      <dl className="breakdown-list">
        <div className="breakdown-row">
          <dt>RAL</dt>
          <dd>{formatCurrency(calculation.grossAnnualSalary)}</dd>
        </div>
        <div className="breakdown-row">
          <dt>Contributi previdenziali</dt>
          <dd>- {formatCurrency(calculation.employeeContributions)}</dd>
        </div>
        <div className="breakdown-row">
          <dt>Imponibile fiscale</dt>
          <dd>{formatCurrency(calculation.taxableIncome)}</dd>
        </div>
        <div className="breakdown-row">
          <dt>IRPEF lorda</dt>
          <dd>- {formatCurrency(calculation.grossIrpef)}</dd>
        </div>
        <div className="breakdown-row">
          <dt>Detrazione da lavoro dipendente</dt>
          <dd>+ {formatCurrency(calculation.employmentDeduction)}</dd>
        </div>
        <div className="breakdown-row">
          <dt>IRPEF netta</dt>
          <dd>- {formatCurrency(calculation.netIrpef)}</dd>
        </div>
        <div className="breakdown-row">
          <dt>Addizionale regionale</dt>
          <dd>- {formatCurrency(calculation.regionalTax)}</dd>
        </div>
        <div className="breakdown-row">
          <dt>Addizionale comunale</dt>
          <dd>- {formatCurrency(calculation.municipalTax)}</dd>
        </div>
        <div className="breakdown-row">
          <dt>Totale tasse e contributi</dt>
          <dd>- {formatCurrency(calculation.totalTaxesAndContributions)}</dd>
        </div>
        <div className="breakdown-row">
          <dt>Netto annuale</dt>
          <dd>{formatCurrency(calculation.netAnnualSalary)}</dd>
        </div>
      </dl>
    </article>
  );
}
