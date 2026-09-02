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
  // Nel caso standard senza altri redditi, l'imponibile semplificato è usato come
  // reddito complessivo per le fasce di detrazione.
  const config = TAX_CONFIG.employmentDeduction;
  const income = taxableIncome.toNumber();

  let deduction = new Decimal(0);

  if (income <= config.firstBandMax) {
    deduction = new Decimal(config.firstBandAmount);
  } else if (income <= config.secondBandMax) {
    deduction = new Decimal(config.secondBandBaseAmount).plus(
      new Decimal(config.secondBandVariableAmount).mul(
        new Decimal(config.secondBandMax).minus(income).div(config.secondBandDivisor),
      ),
    );
  } else if (income <= config.thirdBandMax) {
    deduction = new Decimal(config.thirdBandBaseAmount).mul(
      new Decimal(config.thirdBandMax).minus(income).div(config.thirdBandDivisor),
    );
  }

  if (
    income > config.additionalBandMinExclusive &&
    income <= config.additionalBandMax
  ) {
    deduction = deduction.plus(config.additionalAmount);
  }

  return roundCurrency(Decimal.max(deduction, 0));
}

function calculateAdditionalEmploymentDeduction(taxableIncome: Decimal) {
  // Nel caso standard senza altri redditi, l'imponibile semplificato è usato come
  // reddito complessivo per le fasce di detrazione.
  const config = TAX_CONFIG.additionalEmploymentDeduction;
  const income = taxableIncome.toNumber();

  if (income > config.fullAmountBandMinExclusive && income <= config.fullAmountBandMax) {
    return new Decimal(config.fullAmount);
  }

  if (income > config.fullAmountBandMax && income <= config.taperBandMax) {
    return roundCurrency(
      new Decimal(config.fullAmount).mul(
        new Decimal(config.taperBandMax).minus(income).div(config.taperBandDivisor),
      ),
    );
  }

  return new Decimal(0);
}

function calculateEmployeeTaxFreeBonus(grossAnnualSalary: Decimal) {
  const bracket = TAX_CONFIG.employeeTaxFreeBonus.brackets.find((item) =>
    grossAnnualSalary.lte(item.upTo),
  );

  return bracket ? roundCurrency(grossAnnualSalary.mul(bracket.rate)) : new Decimal(0);
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
    additionalEmploymentDeduction: values.additionalEmploymentDeduction.toNumber(),
    netIrpef: values.netIrpef.toNumber(),
    regionalTax: values.regionalTax.toNumber(),
    municipalTax: values.municipalTax.toNumber(),
    employeeTaxFreeBonus: values.employeeTaxFreeBonus.toNumber(),
    totalTaxes: values.totalTaxes.toNumber(),
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
    grossAnnualSalary.mul(TAX_CONFIG.employeeContributionRate),
  );
  const taxableIncome = roundCurrency(grossAnnualSalary.minus(employeeContributions));
  const grossIrpef = calculateProgressiveTax(taxableIncome, TAX_CONFIG.irpefBrackets);
  const employmentDeduction = Decimal.min(
    grossIrpef,
    calculateEmploymentDeduction(taxableIncome),
  );
  const additionalEmploymentDeduction = Decimal.min(
    Decimal.max(grossIrpef.minus(employmentDeduction), 0),
    calculateAdditionalEmploymentDeduction(taxableIncome),
  );
  const netIrpef = roundCurrency(
    Decimal.max(grossIrpef.minus(employmentDeduction).minus(additionalEmploymentDeduction), 0),
  );
  const regionalTax = calculateProgressiveTax(
    taxableIncome,
    TAX_CONFIG.lombardyRegionalTax.brackets,
  );
  const municipalTax =
    taxableIncome.lte(TAX_CONFIG.milanMunicipalTax.exemptionThreshold)
      ? new Decimal(0)
      : roundCurrency(taxableIncome.mul(TAX_CONFIG.milanMunicipalTax.rate));
  const employeeTaxFreeBonus = calculateEmployeeTaxFreeBonus(grossAnnualSalary);
  const totalTaxes = roundCurrency(netIrpef.plus(regionalTax).plus(municipalTax));

  const totalTaxesAndContributions = roundCurrency(
    employeeContributions.plus(totalTaxes),
  );
  const netAnnualSalary = roundCurrency(
    grossAnnualSalary.minus(totalTaxesAndContributions).plus(employeeTaxFreeBonus),
  );
  const netMonthlySalary = roundCurrency(netAnnualSalary.div(input.monthlyPayments));
  const effectiveTaxRate = roundCurrency(
    totalTaxesAndContributions.div(grossAnnualSalary).mul(100),
  );

  return toResult(input, {
    employeeContributions,
    taxableIncome,
    grossIrpef,
    employmentDeduction,
    additionalEmploymentDeduction,
    netIrpef,
    regionalTax,
    municipalTax,
    employeeTaxFreeBonus,
    totalTaxes,
    totalTaxesAndContributions,
    netAnnualSalary,
    netMonthlySalary,
    effectiveTaxRate,
  });
}
