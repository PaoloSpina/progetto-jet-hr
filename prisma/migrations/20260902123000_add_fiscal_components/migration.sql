ALTER TABLE "SalaryCalculation"
  ADD COLUMN "additionalEmploymentDeduction" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "employeeTaxFreeBonus" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "totalTaxes" DECIMAL(12,2) NOT NULL DEFAULT 0;

ALTER TABLE "SalaryCalculation"
  ALTER COLUMN "additionalEmploymentDeduction" DROP DEFAULT,
  ALTER COLUMN "employeeTaxFreeBonus" DROP DEFAULT,
  ALTER COLUMN "totalTaxes" DROP DEFAULT;
