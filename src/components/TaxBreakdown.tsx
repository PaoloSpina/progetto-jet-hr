import type { StoredSalaryCalculation } from "@/domain/salary/salary.types";
import { formatCurrency } from "@/lib/formatCurrency";

type TaxBreakdownProps = {
  calculation: StoredSalaryCalculation;
};

export function TaxBreakdown({ calculation }: TaxBreakdownProps) {
  return (
    <article className="section-card" aria-labelledby="tax-breakdown-title">
      <p className="section-eyebrow">Dettaglio del calcolo</p>
      <h2 id="tax-breakdown-title">Stima fiscale e contributiva</h2>

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
          <dt>Ulteriore detrazione lavoro dipendente</dt>
          <dd>+ {formatCurrency(calculation.additionalEmploymentDeduction)}</dd>
        </div>
        <div className="breakdown-row">
          <dt>IRPEF netta</dt>
          <dd>- {formatCurrency(calculation.netIrpef)}</dd>
        </div>
        <div className="breakdown-row">
          <dt>Addizionale regionale Lombardia</dt>
          <dd>- {formatCurrency(calculation.regionalTax)}</dd>
        </div>
        <div className="breakdown-row">
          <dt>Addizionale comunale Milano</dt>
          <dd>- {formatCurrency(calculation.municipalTax)}</dd>
        </div>
        <div className="breakdown-row">
          <dt>Somma esente / beneficio lavoro dipendente</dt>
          <dd>+ {formatCurrency(calculation.employeeTaxFreeBonus)}</dd>
        </div>
        <div className="breakdown-row breakdown-row-total">
          <dt>Totale imposte</dt>
          <dd>- {formatCurrency(calculation.totalTaxes)}</dd>
        </div>
        <div className="breakdown-row breakdown-row-total">
          <dt>Totale tasse e contributi</dt>
          <dd>- {formatCurrency(calculation.totalTaxesAndContributions)}</dd>
        </div>
        <div className="breakdown-row breakdown-row-net">
          <dt>Netto annuale</dt>
          <dd>{formatCurrency(calculation.netAnnualSalary)}</dd>
        </div>
      </dl>
    </article>
  );
}
