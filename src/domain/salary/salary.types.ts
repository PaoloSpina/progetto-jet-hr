export type MonthlyPayments = 12 | 13 | 14;

export type SalaryCalculationInput = {
  grossAnnualSalary: number;
  monthlyPayments: MonthlyPayments;
};

export type SalaryCalculationResult = SalaryCalculationInput & {
  employeeContributions: number;
  taxableIncome: number;
  grossIrpef: number;
  employmentDeduction: number;
  netIrpef: number;
  regionalTax: number;
  municipalTax: number;
  totalTaxesAndContributions: number;
  netAnnualSalary: number;
  netMonthlySalary: number;
  effectiveTaxRate: number;
};

export type StoredSalaryCalculation = SalaryCalculationResult & {
  id: string;
  createdAt: string;
};
