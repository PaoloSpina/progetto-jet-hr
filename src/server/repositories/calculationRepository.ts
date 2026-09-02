import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  SalaryCalculationResult,
  StoredSalaryCalculation,
} from "@/domain/salary/salary.types";

type SalaryCalculationRecord = Awaited<ReturnType<typeof prisma.salaryCalculation.create>>;

export type SalaryCalculationRepository = {
  create(input: SalaryCalculationResult): Promise<StoredSalaryCalculation>;
  findRecent(limit: number): Promise<StoredSalaryCalculation[]>;
};

function toFixedDecimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

function serializeCalculation(record: SalaryCalculationRecord): StoredSalaryCalculation {
  return {
    id: record.id,
    grossAnnualSalary: record.grossAnnualSalary.toNumber(),
    monthlyPayments: record.monthlyPayments as StoredSalaryCalculation["monthlyPayments"],
    employeeContributions: record.employeeContributions.toNumber(),
    taxableIncome: record.taxableIncome.toNumber(),
    grossIrpef: record.grossIrpef.toNumber(),
    employmentDeduction: record.employmentDeduction.toNumber(),
    additionalEmploymentDeduction: record.additionalEmploymentDeduction.toNumber(),
    netIrpef: record.netIrpef.toNumber(),
    regionalTax: record.regionalTax.toNumber(),
    municipalTax: record.municipalTax.toNumber(),
    employeeTaxFreeBonus: record.employeeTaxFreeBonus.toNumber(),
    totalTaxes: record.totalTaxes.toNumber(),
    totalTaxesAndContributions: record.totalTaxesAndContributions.toNumber(),
    netAnnualSalary: record.netAnnualSalary.toNumber(),
    netMonthlySalary: record.netMonthlySalary.toNumber(),
    effectiveTaxRate: record.effectiveTaxRate.toNumber(),
    createdAt: record.createdAt.toISOString(),
  };
}

export function createCalculationRepository(): SalaryCalculationRepository {
  return {
    async create(input) {
      const record = await prisma.salaryCalculation.create({
        data: {
          grossAnnualSalary: toFixedDecimal(input.grossAnnualSalary),
          monthlyPayments: input.monthlyPayments,
          employeeContributions: toFixedDecimal(input.employeeContributions),
          taxableIncome: toFixedDecimal(input.taxableIncome),
          grossIrpef: toFixedDecimal(input.grossIrpef),
          employmentDeduction: toFixedDecimal(input.employmentDeduction),
          additionalEmploymentDeduction: toFixedDecimal(input.additionalEmploymentDeduction),
          netIrpef: toFixedDecimal(input.netIrpef),
          regionalTax: toFixedDecimal(input.regionalTax),
          municipalTax: toFixedDecimal(input.municipalTax),
          employeeTaxFreeBonus: toFixedDecimal(input.employeeTaxFreeBonus),
          totalTaxes: toFixedDecimal(input.totalTaxes),
          totalTaxesAndContributions: toFixedDecimal(input.totalTaxesAndContributions),
          netAnnualSalary: toFixedDecimal(input.netAnnualSalary),
          netMonthlySalary: toFixedDecimal(input.netMonthlySalary),
          effectiveTaxRate: toFixedDecimal(input.effectiveTaxRate),
        },
      });

      return serializeCalculation(record);
    },

    async findRecent(limit) {
      const records = await prisma.salaryCalculation.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      });

      return records.map((record) => serializeCalculation(record as SalaryCalculationRecord));
    },
  };
}
