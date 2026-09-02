import {
  calculateNetSalary,
  SalaryCalculationDomainError,
} from "@/domain/salary/calculateSalary";
import type { MonthlyPayments } from "@/domain/salary/salary.types";

describe("calculateNetSalary", () => {
  it.each([
    { grossAnnualSalary: 10000, monthlyPayments: 13 as MonthlyPayments },
    { grossAnnualSalary: 15000, monthlyPayments: 13 as MonthlyPayments },
    { grossAnnualSalary: 20000, monthlyPayments: 13 as MonthlyPayments },
    { grossAnnualSalary: 25000, monthlyPayments: 13 as MonthlyPayments },
    { grossAnnualSalary: 28000, monthlyPayments: 13 as MonthlyPayments },
    { grossAnnualSalary: 30000, monthlyPayments: 13 as MonthlyPayments },
    { grossAnnualSalary: 32000, monthlyPayments: 13 as MonthlyPayments },
    { grossAnnualSalary: 35000, monthlyPayments: 13 as MonthlyPayments },
    { grossAnnualSalary: 40000, monthlyPayments: 12 as MonthlyPayments },
    { grossAnnualSalary: 50000, monthlyPayments: 13 as MonthlyPayments },
    { grossAnnualSalary: 60000, monthlyPayments: 14 as MonthlyPayments },
    { grossAnnualSalary: 100000, monthlyPayments: 13 as MonthlyPayments },
  ])("returns finite and internally consistent fiscal components for %#", ({
    grossAnnualSalary,
    monthlyPayments,
  }) => {
    const result = calculateNetSalary({ grossAnnualSalary, monthlyPayments });

    expect(result.netAnnualSalary).toBeGreaterThan(0);
    expect(result.netMonthlySalary).toBeCloseTo(
      result.netAnnualSalary / result.monthlyPayments,
      2,
    );
    expect(result.totalTaxesAndContributions).toBeCloseTo(
      result.employeeContributions + result.totalTaxes,
      2,
    );
    expect(result.totalTaxes).toBeCloseTo(
      result.netIrpef + result.regionalTax + result.municipalTax,
      2,
    );
    expect(result.netAnnualSalary).toBeCloseTo(
      result.grossAnnualSalary - result.totalTaxesAndContributions + result.employeeTaxFreeBonus,
      2,
    );
    expect(result.netIrpef).toBeGreaterThanOrEqual(0);

    for (const value of Object.values(result)) {
      if (typeof value === "number") {
        expect(Number.isNaN(value)).toBe(false);
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("uses the progressive 2026 IRPEF brackets", () => {
    const result = calculateNetSalary({ grossAnnualSalary: 60000, monthlyPayments: 13 });

    expect(result.taxableIncome).toBe(54486);
    expect(result.grossIrpef).toBe(15628.98);
  });

  it("calculates the required components for the RAL 25,000 control case", () => {
    const result = calculateNetSalary({ grossAnnualSalary: 25000, monthlyPayments: 13 });

    expect(result.employeeContributions).toBe(2297.5);
    expect(result.taxableIncome).toBe(22702.5);
    expect(result.grossIrpef).toBe(5221.58);
    expect(result.employmentDeduction).toBe(2394.93);
    expect(result.additionalEmploymentDeduction).toBe(1000);
    expect(result.netIrpef).toBe(1826.65);
    expect(result.regionalTax).toBe(306.2);
    expect(result.municipalTax).toBe(0);
    expect(result.employeeTaxFreeBonus).toBe(0);
    expect(result.totalTaxes).toBe(2132.85);
    expect(result.totalTaxesAndContributions).toBe(4430.35);
    expect(result.netAnnualSalary).toBe(20569.65);
  });

  it("applies the employee tax-free bonus only up to RAL 20,000", () => {
    expect(
      calculateNetSalary({ grossAnnualSalary: 20000, monthlyPayments: 13 }).employeeTaxFreeBonus,
    ).toBe(960);
    expect(
      calculateNetSalary({ grossAnnualSalary: 20000.01, monthlyPayments: 13 })
        .employeeTaxFreeBonus,
    ).toBe(0);
  });

  it("includes the additional 65 euro in the ordinary deduction band", () => {
    const result = calculateNetSalary({ grossAnnualSalary: 28000, monthlyPayments: 13 });

    expect(result.taxableIncome).toBe(25426.8);
    expect(result.employmentDeduction).toBe(2210.55);
  });

  it("applies Milan's exemption threshold to the entire taxable income", () => {
    const exempt = calculateNetSalary({ grossAnnualSalary: 25000, monthlyPayments: 13 });
    const taxable = calculateNetSalary({ grossAnnualSalary: 25328.27, monthlyPayments: 13 });

    expect(exempt.taxableIncome).toBeLessThanOrEqual(23000);
    expect(exempt.municipalTax).toBe(0);
    expect(taxable.taxableIncome).toBeGreaterThan(23000);
    expect(taxable.municipalTax).toBeCloseTo(taxable.taxableIncome * 0.008, 2);
  });

  it.each([
    20000,
    20000.01,
    23000,
    23000.01,
    25000,
    25000.01,
    28000,
    28000.01,
    32000,
    32000.01,
    35000,
    35000.01,
    40000,
    40000.01,
    50000,
    50000.01,
  ])("handles fiscal threshold input RAL %f without invalid values", (grossAnnualSalary) => {
    const result = calculateNetSalary({ grossAnnualSalary, monthlyPayments: 13 });

    for (const value of Object.values(result)) {
      if (typeof value === "number") {
        expect(Number.isFinite(value)).toBe(true);
      }
    }
  });

  it("keeps annual net increasing across the standard RAL regression set", () => {
    const salaries = [
      10000,
      15000,
      20000,
      25000,
      28000,
      30000,
      32000,
      35000,
      40000,
      50000,
      60000,
      100000,
    ];
    const nets = salaries.map((grossAnnualSalary) =>
      calculateNetSalary({ grossAnnualSalary, monthlyPayments: 13 }).netAnnualSalary,
    );

    for (let index = 1; index < nets.length; index += 1) {
      expect(nets[index]).toBeGreaterThan(nets[index - 1]!);
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
