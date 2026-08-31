import Decimal from "decimal.js";
import type {
  SalaryCalculationInput,
  SalaryCalculationResult,
} from "@/domain/salary/salary.types";
import { TAX_CONFIG } from "@/domain/salary/taxConfig";

export class SalaryCalculationDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SalaryCalculationDomainError";
  }
}

function roundCurrency(value: Decimal.Value) {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

function ensureValidInput({ grossAnnualSalary, monthlyPayments }: SalaryCalculationInput) {
  if (!Number.isFinite(grossAnnualSalary)) {
    throw new SalaryCalculationDomainError("La RAL deve essere numerica.");
  }

  if (grossAnnualSalary <= 0) {
    throw new SalaryCalculationDomainError("La RAL deve essere maggiore di zero.");
  }

  if (grossAnnualSalary > TAX_CONFIG.maxGrossAnnualSalary) {
    throw new SalaryCalculationDomainError("La RAL supera il limite previsto per il prototipo.");
  }

  if (![12, 13, 14].includes(monthlyPayments)) {
    throw new SalaryCalculationDomainError("Le mensilita' devono essere 12, 13 o 14.");
  }
}

function calculateProgressiveTax(
  taxableIncome: Decimal,
  brackets: ReadonlyArray<{ upTo: number; rate: number }>,
) {
  let totalTax = new Decimal(0);
  let previousThreshold = 0;

  for (const bracket of brackets) {
    if (taxableIncome.lte(previousThreshold)) {
      break;
    }

    const upperBound = Decimal.min(taxableIncome, bracket.upTo);
    const taxableSlice = upperBound.minus(previousThreshold);

    if (taxableSlice.gt(0)) {
      totalTax = totalTax.plus(taxableSlice.mul(bracket.rate));
    }

    previousThreshold = bracket.upTo;
  }

  return roundCurrency(totalTax);
}

function calculateEmploymentDeduction(taxableIncome: Decimal) {
  const config = TAX_CONFIG.employmentDeduction;
  const income = taxableIncome.toNumber();

  if (income <= config.firstBandMax) {
    return roundCurrency(config.firstBandAmount);
  }

  if (income <= config.secondBandMax) {
    const deduction = new Decimal(config.secondBandBaseAmount).plus(
      new Decimal(config.secondBandVariableAmount).mul(
        new Decimal(config.secondBandMax).minus(income).div(config.secondBandDivisor),
      ),
    );

    return roundCurrency(Decimal.max(deduction, 0));
  }

  if (income <= config.thirdBandMax) {
    const deduction = new Decimal(config.thirdBandBaseAmount).mul(
      new Decimal(config.thirdBandMax).minus(income).div(config.thirdBandDivisor),
    );

    return roundCurrency(Decimal.max(deduction, 0));
  }

  return new Decimal(0);
}

function toResult(
  input: SalaryCalculationInput,
  values: Record<Exclude<keyof SalaryCalculationResult, keyof SalaryCalculationInput>, Decimal>,
): SalaryCalculationResult {
  return {
    ...input,
    employeeContributions: values.employeeContributions.toNumber(),
    taxableIncome: values.taxableIncome.toNumber(),
    grossIrpef: values.grossIrpef.toNumber(),
    employmentDeduction: values.employmentDeduction.toNumber(),
    netIrpef: values.netIrpef.toNumber(),
    regionalTax: values.regionalTax.toNumber(),
    municipalTax: values.municipalTax.toNumber(),
    totalTaxesAndContributions: values.totalTaxesAndContributions.toNumber(),
    netAnnualSalary: values.netAnnualSalary.toNumber(),
    netMonthlySalary: values.netMonthlySalary.toNumber(),
    effectiveTaxRate: values.effectiveTaxRate.toNumber(),
  };
}

export function calculateNetSalary(input: SalaryCalculationInput): SalaryCalculationResult {
  ensureValidInput(input);

  const grossAnnualSalary = new Decimal(input.grossAnnualSalary);
  const employeeContributions = roundCurrency(
    grossAnnualSalary.mul(TAX_CONFIG.employeeSocialSecurityRate),
  );
  const taxableIncome = roundCurrency(grossAnnualSalary.minus(employeeContributions));
  const grossIrpef = calculateProgressiveTax(taxableIncome, TAX_CONFIG.irpefBrackets);
  const employmentDeduction = Decimal.min(
    grossIrpef,
    calculateEmploymentDeduction(taxableIncome),
  );
  const netIrpef = roundCurrency(Decimal.max(grossIrpef.minus(employmentDeduction), 0));
  const regionalTax = calculateProgressiveTax(taxableIncome, TAX_CONFIG.regionalTax.brackets);
  const municipalTax =
    taxableIncome.lte(TAX_CONFIG.municipalTax.exemptionThreshold)
      ? new Decimal(0)
      : roundCurrency(taxableIncome.mul(TAX_CONFIG.municipalTax.rate));

  const totalTaxesAndContributions = roundCurrency(
    employeeContributions.plus(netIrpef).plus(regionalTax).plus(municipalTax),
  );
  const netAnnualSalary = roundCurrency(grossAnnualSalary.minus(totalTaxesAndContributions));
  const netMonthlySalary = roundCurrency(netAnnualSalary.div(input.monthlyPayments));
  const effectiveTaxRate = roundCurrency(
    totalTaxesAndContributions.div(grossAnnualSalary).mul(100),
  );

  return toResult(input, {
    employeeContributions,
    taxableIncome,
    grossIrpef,
    employmentDeduction,
    netIrpef,
    regionalTax,
    municipalTax,
    totalTaxesAndContributions,
    netAnnualSalary,
    netMonthlySalary,
    effectiveTaxRate,
  });
}
