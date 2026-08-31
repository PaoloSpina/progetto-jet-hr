CREATE TABLE "SalaryCalculation" (
    "id" TEXT NOT NULL,
    "grossAnnualSalary" DECIMAL(12,2) NOT NULL,
    "monthlyPayments" INTEGER NOT NULL,
    "employeeContributions" DECIMAL(12,2) NOT NULL,
    "taxableIncome" DECIMAL(12,2) NOT NULL,
    "grossIrpef" DECIMAL(12,2) NOT NULL,
    "employmentDeduction" DECIMAL(12,2) NOT NULL,
    "netIrpef" DECIMAL(12,2) NOT NULL,
    "regionalTax" DECIMAL(12,2) NOT NULL,
    "municipalTax" DECIMAL(12,2) NOT NULL,
    "totalTaxesAndContributions" DECIMAL(12,2) NOT NULL,
    "netAnnualSalary" DECIMAL(12,2) NOT NULL,
    "netMonthlySalary" DECIMAL(12,2) NOT NULL,
    "effectiveTaxRate" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryCalculation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SalaryCalculation_createdAt_idx" ON "SalaryCalculation"("createdAt");
