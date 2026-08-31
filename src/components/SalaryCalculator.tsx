"use client";

import { useState } from "react";
import { SalaryResult } from "@/components/SalaryResult";
import type { StoredSalaryCalculation } from "@/domain/salary/salary.types";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDateTime } from "@/lib/formatDateTime";

type SalaryCalculatorProps = {
  initialCalculations: StoredSalaryCalculation[];
  initialHistoryMessage: string | null;
};

type FormState = {
  grossAnnualSalary: string;
  monthlyPayments: "12" | "13" | "14";
};

type FieldErrors = {
  grossAnnualSalary?: string;
  monthlyPayments?: string;
};

function validateForm(values: FormState): FieldErrors {
  const errors: FieldErrors = {};
  const grossAnnualSalary = Number(values.grossAnnualSalary);

  if (!values.grossAnnualSalary.trim()) {
    errors.grossAnnualSalary = "Inserisci la RAL annua lorda.";
  } else if (!Number.isFinite(grossAnnualSalary) || grossAnnualSalary <= 0) {
    errors.grossAnnualSalary = "La RAL deve essere un numero maggiore di zero.";
  } else if (grossAnnualSalary > 500000) {
    errors.grossAnnualSalary =
      "Inserisci una RAL entro un limite ragionevole per il prototipo.";
  }

  if (!["12", "13", "14"].includes(values.monthlyPayments)) {
    errors.monthlyPayments = "Seleziona 12, 13 o 14 mensilita'.";
  }

  return errors;
}

export function SalaryCalculator({
  initialCalculations,
  initialHistoryMessage,
}: SalaryCalculatorProps) {
  const [formState, setFormState] = useState<FormState>({
    grossAnnualSalary: "",
    monthlyPayments: "13",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<StoredSalaryCalculation | null>(null);
  const [recentCalculations, setRecentCalculations] =
    useState<StoredSalaryCalculation[]>(initialCalculations);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors = validateForm(formState);
    setFieldErrors(nextFieldErrors);
    setSubmissionError(null);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/calculations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grossAnnualSalary: Number(formState.grossAnnualSalary),
          monthlyPayments: Number(formState.monthlyPayments),
        }),
      });

      const payload = (await response.json()) as
        | { calculation: StoredSalaryCalculation }
        | { error: string };

      if (!response.ok || !("calculation" in payload)) {
        setSubmissionError(
          "error" in payload
            ? payload.error
            : "Non siamo riusciti a completare il calcolo. Riprova tra poco.",
        );
        return;
      }

      setResult(payload.calculation);
      setRecentCalculations((current) => [payload.calculation, ...current].slice(0, 10));
    } catch {
      setSubmissionError(
        "Connessione non disponibile. Controlla la rete o la configurazione del backend.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="calculator-grid" aria-label="Calcolatore RAL netto">
      <div className="stack">
        <article className="section-card">
          <p className="section-eyebrow">Calcolatore</p>
          <h2>Inserisci i dati</h2>
          <p className="helper-text">
            L&apos;unico input variabile del prototipo e&apos; la RAL annua lorda insieme al
            numero di mensilita&apos;.
          </p>

          <form className="calculator-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="grossAnnualSalary">RAL annua lorda</label>
              <input
                id="grossAnnualSalary"
                name="grossAnnualSalary"
                type="number"
                inputMode="decimal"
                min="1"
                step="100"
                placeholder="Es. 35.000 €"
                value={formState.grossAnnualSalary}
                aria-invalid={Boolean(fieldErrors.grossAnnualSalary)}
                aria-describedby={
                  fieldErrors.grossAnnualSalary ? "grossAnnualSalary-error" : undefined
                }
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    grossAnnualSalary: event.target.value,
                  }))
                }
              />
              {fieldErrors.grossAnnualSalary ? (
                <p className="field-error" id="grossAnnualSalary-error">
                  {fieldErrors.grossAnnualSalary}
                </p>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="monthlyPayments">Numero di mensilita&apos;</label>
              <select
                id="monthlyPayments"
                name="monthlyPayments"
                value={formState.monthlyPayments}
                aria-invalid={Boolean(fieldErrors.monthlyPayments)}
                aria-describedby={
                  fieldErrors.monthlyPayments ? "monthlyPayments-error" : undefined
                }
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    monthlyPayments: event.target.value as FormState["monthlyPayments"],
                  }))
                }
              >
                <option value="12">12</option>
                <option value="13">13</option>
                <option value="14">14</option>
              </select>
              {fieldErrors.monthlyPayments ? (
                <p className="field-error" id="monthlyPayments-error">
                  {fieldErrors.monthlyPayments}
                </p>
              ) : null}
            </div>

            <button className="submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Calcolo in corso..." : "Calcola netto"}
            </button>

            {submissionError ? <p className="form-error">{submissionError}</p> : null}
          </form>
        </article>

        <article className="history-card" aria-labelledby="history-title">
          <p className="section-eyebrow">Storico</p>
          <h2 id="history-title">Ultimi calcoli</h2>

          {initialHistoryMessage ? (
            <p className="history-message" data-variant="info">
              {initialHistoryMessage}
            </p>
          ) : null}

          {recentCalculations.length === 0 ? (
            <p className="history-empty">Nessun calcolo salvato ancora.</p>
          ) : (
            <div className="history-grid">
              {recentCalculations.map((calculation) => (
                <article className="history-item" key={calculation.id}>
                  <h3>{formatCurrency(calculation.grossAnnualSalary)}</h3>
                  <div className="history-meta">
                    <span>
                      Netto annuale:{" "}
                      <strong>{formatCurrency(calculation.netAnnualSalary)}</strong>
                    </span>
                    <span>
                      Netto mensile:{" "}
                      <strong>{formatCurrency(calculation.netMonthlySalary)}</strong>
                    </span>
                    <span>
                      Mensilita&apos;: <strong>{calculation.monthlyPayments}</strong>
                    </span>
                    <span>
                      Data: <strong>{formatDateTime(calculation.createdAt)}</strong>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </div>

      <SalaryResult calculation={result} />
    </section>
  );
}
