import {
  calculateNetSalary,
  SalaryCalculationDomainError,
} from "@/domain/salary/calculateSalary";
import type { MonthlyPayments } from "@/domain/salary/salary.types";

describe("calculateNetSalary", () => {
  it.each([
    { grossAnnualSalary: 20000, monthlyPayments: 13 as MonthlyPayments },
    { grossAnnualSalary: 30000, monthlyPayments: 13 as MonthlyPayments },
    { grossAnnualSalary: 40000, monthlyPayments: 12 as MonthlyPayments },
    { grossAnnualSalary: 60000, monthlyPayments: 14 as MonthlyPayments },
    { grossAnnualSalary: 100000, monthlyPayments: 13 as MonthlyPayments },
  ])("returns a plausible estimate for %#", ({ grossAnnualSalary, monthlyPayments }) => {
    const result = calculateNetSalary({ grossAnnualSalary, monthlyPayments });

    expect(result.netAnnualSalary).toBeGreaterThan(0);
    expect(result.netAnnualSalary).toBeLessThan(result.grossAnnualSalary);
    expect(result.netMonthlySalary).toBeCloseTo(
      result.netAnnualSalary / result.monthlyPayments,
      2,
    );
    expect(result.totalTaxesAndContributions).toBeCloseTo(
      result.grossAnnualSalary - result.netAnnualSalary,
      2,
    );

    for (const value of Object.values(result)) {
      if (typeof value === "number") {
        expect(Number.isNaN(value)).toBe(false);
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("changes only the monthly net amount when mensilita differ", () => {
    const annual = 35000;
    const annual13 = calculateNetSalary({ grossAnnualSalary: annual, monthlyPayments: 13 });
    const annual14 = calculateNetSalary({ grossAnnualSalary: annual, monthlyPayments: 14 });

    expect(annual13.netAnnualSalary).toBe(annual14.netAnnualSalary);
    expect(annual13.totalTaxesAndContributions).toBe(annual14.totalTaxesAndContributions);
    expect(annual13.netMonthlySalary).not.toBe(annual14.netMonthlySalary);
  });

  it.each([
    { grossAnnualSalary: 0, monthlyPayments: 13 as MonthlyPayments },
    { grossAnnualSalary: -5000, monthlyPayments: 13 as MonthlyPayments },
    { grossAnnualSalary: Number.NaN, monthlyPayments: 13 as MonthlyPayments },
    { grossAnnualSalary: 35000, monthlyPayments: 11 as 11 },
  ])("rejects invalid inputs %#", (input) => {
    expect(() => calculateNetSalary(input as never)).toThrow(SalaryCalculationDomainError);
  });
});
