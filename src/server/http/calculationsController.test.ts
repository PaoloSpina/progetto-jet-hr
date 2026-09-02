import type { StoredSalaryCalculation } from "@/domain/salary/salary.types";
import { buildCalculationsHandlers } from "@/server/http/calculationsController";

const storedCalculation: StoredSalaryCalculation = {
  id: "calc_1",
  grossAnnualSalary: 35000,
  monthlyPayments: 13,
  employeeContributions: 3216.5,
  taxableIncome: 31783.5,
  grossIrpef: 7994.23,
  employmentDeduction: 1578.55,
  additionalEmploymentDeduction: 1000,
  netIrpef: 6415.68,
  regionalTax: 459.31,
  municipalTax: 254.27,
  employeeTaxFreeBonus: 0,
  totalTaxes: 7129.26,
  totalTaxesAndContributions: 10345.76,
  netAnnualSalary: 24654.24,
  netMonthlySalary: 1896.48,
  effectiveTaxRate: 29.56,
  createdAt: "2026-08-31T10:15:00.000Z",
};

describe("calculationsController", () => {
  it("creates a calculation for a valid POST request", async () => {
    const createCalculation = vi.fn().mockResolvedValue(storedCalculation);
    const handlers = buildCalculationsHandlers({
      createCalculation,
      listRecentCalculations: vi.fn(),
    });

    const response = await handlers.POST(
      new Request("http://localhost/api/calculations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grossAnnualSalary: 35000,
          monthlyPayments: 13,
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(createCalculation).toHaveBeenCalledWith({
      grossAnnualSalary: 35000,
      monthlyPayments: 13,
    });
    await expect(response.json()).resolves.toEqual({ calculation: storedCalculation });
  });

  it("rejects a non-positive RAL", async () => {
    const createCalculation = vi.fn();
    const handlers = buildCalculationsHandlers({
      createCalculation,
      listRecentCalculations: vi.fn(),
    });

    const response = await handlers.POST(
      new Request("http://localhost/api/calculations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grossAnnualSalary: 0,
          monthlyPayments: 13,
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(createCalculation).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: "La RAL deve essere maggiore di zero.",
    });
  });

  it("rejects unsupported monthlyPayments", async () => {
    const createCalculation = vi.fn();
    const handlers = buildCalculationsHandlers({
      createCalculation,
      listRecentCalculations: vi.fn(),
    });

    const response = await handlers.POST(
      new Request("http://localhost/api/calculations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grossAnnualSalary: 35000,
          monthlyPayments: 15,
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(createCalculation).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: "Le mensilita' devono essere 12, 13 o 14.",
    });
  });
});
