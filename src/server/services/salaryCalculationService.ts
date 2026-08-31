import type { SalaryCalculationInput } from "@/domain/salary/salary.types";
import { calculateNetSalary } from "@/domain/salary/calculateSalary";
import { createCalculationRepository } from "@/server/repositories/calculationRepository";

const repository = createCalculationRepository();

export const salaryCalculationService = {
  async createCalculation(input: SalaryCalculationInput) {
    const calculation = calculateNetSalary(input);
    return repository.create(calculation);
  },
  async listRecentCalculations(limit: number) {
    return repository.findRecent(limit);
  },
};

export async function listRecentSalaryCalculations(limit: number) {
  return salaryCalculationService.listRecentCalculations(limit);
}
