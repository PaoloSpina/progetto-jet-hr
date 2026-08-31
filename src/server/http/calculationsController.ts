import { NextResponse } from "next/server";
import { z } from "zod";
import type {
  MonthlyPayments,
  SalaryCalculationInput,
  StoredSalaryCalculation,
} from "@/domain/salary/salary.types";

export type SalaryCalculationService = {
  createCalculation(input: SalaryCalculationInput): Promise<StoredSalaryCalculation>;
  listRecentCalculations(limit: number): Promise<StoredSalaryCalculation[]>;
};

const calculationSchema = z.object({
  grossAnnualSalary: z
    .number({ error: "La RAL deve essere numerica." })
    .positive("La RAL deve essere maggiore di zero.")
    .max(500000, "La RAL supera il limite previsto per il prototipo."),
  monthlyPayments: z
    .number({ error: "Le mensilita' devono essere numeriche." })
    .refine((value) => [12, 13, 14].includes(value), {
      message: "Le mensilita' devono essere 12, 13 o 14.",
    }),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function buildCalculationsHandlers(service: SalaryCalculationService) {
  return {
    async GET() {
      try {
        const calculations = await service.listRecentCalculations(10);
        return NextResponse.json({ calculations });
      } catch {
        return jsonError("Non siamo riusciti a leggere lo storico dei calcoli.", 500);
      }
    },

    async POST(request: Request) {
      let payload: unknown;

      try {
        payload = await request.json();
      } catch {
        return jsonError("Il body della richiesta non e' un JSON valido.");
      }

      const parsedInput = calculationSchema.safeParse(payload);

      if (!parsedInput.success) {
        const firstIssue = parsedInput.error.issues[0];
        return jsonError(firstIssue?.message ?? "Input non valido.");
      }

      try {
        const calculation = await service.createCalculation({
          grossAnnualSalary: parsedInput.data.grossAnnualSalary,
          monthlyPayments: parsedInput.data.monthlyPayments as MonthlyPayments,
        });

        return NextResponse.json({ calculation }, { status: 201 });
      } catch {
        return jsonError(
          "Non siamo riusciti a salvare il calcolo. Verifica la configurazione del database e riprova.",
          500,
        );
      }
    },
  };
}
