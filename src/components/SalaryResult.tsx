"use client";

import { useLayoutEffect, useRef } from "react";
import { SalaryChart } from "@/components/SalaryChart";
import { TaxBreakdown } from "@/components/TaxBreakdown";
import type { StoredSalaryCalculation } from "@/domain/salary/salary.types";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatPercentage } from "@/lib/formatPercentage";

type SalaryResultProps = {
  calculation: StoredSalaryCalculation | null;
};

type FittedMetricValueProps = {
  children: string;
  className?: string;
};

function FittedMetricValue({ children, className = "" }: FittedMetricValueProps) {
  const valueRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const value = valueRef.current;

    if (!value) {
      return;
    }

    const fitValue = () => {
      value.style.fontSize = "";

      const availableWidth = value.clientWidth;
      const contentWidth = value.scrollWidth;

      if (availableWidth === 0 || contentWidth <= availableWidth) {
        return;
      }

      const currentFontSize = Number.parseFloat(window.getComputedStyle(value).fontSize);
      const fittedFontSize = Math.max(
        1,
        (currentFontSize * Math.max(availableWidth - 2, 1)) / contentWidth,
      );

      value.style.fontSize = `${fittedFontSize}px`;
    };

    fitValue();

    const observer = new ResizeObserver(fitValue);
    observer.observe(value);

    return () => observer.disconnect();
  }, [children]);

  return (
    <p ref={valueRef} className={`metric-value ${className}`}>
      {children}
    </p>
  );
}

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
            <FittedMetricValue className="positive">
              {formatCurrency(calculation.netAnnualSalary)}
            </FittedMetricValue>
          </div>
          <div className="metric-card">
            <p className="metric-label">Netto mensile stimato</p>
            <FittedMetricValue>{formatCurrency(calculation.netMonthlySalary)}</FittedMetricValue>
          </div>
        </div>

        <p className="result-insight">
          Tasse e contributi incidono per circa {formatPercentage(calculation.effectiveTaxRate)}{" "}
          della RAL.
        </p>
      </article>

      <TaxBreakdown calculation={calculation} />
      <SalaryChart calculation={calculation} />
    </div>
  );
}
