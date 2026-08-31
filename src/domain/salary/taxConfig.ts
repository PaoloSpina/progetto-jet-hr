// Prototype fiscal configuration.
// These rules intentionally simplify the Italian tax domain and are centralized here so
// the UI and persistence layers remain independent from fiscal assumptions.
export const TAX_CONFIG = {
  employeeSocialSecurityRate: 0.0919,
  maxGrossAnnualSalary: 500000,
  irpefBrackets: [
    { upTo: 28000, rate: 0.23 },
    { upTo: 50000, rate: 0.35 },
    { upTo: Number.POSITIVE_INFINITY, rate: 0.43 },
  ],
  employmentDeduction: {
    firstBandMax: 15000,
    secondBandMax: 28000,
    thirdBandMax: 50000,
    firstBandAmount: 1955,
    secondBandBaseAmount: 1910,
    secondBandVariableAmount: 1190,
    secondBandDivisor: 13000,
    thirdBandBaseAmount: 1910,
    thirdBandDivisor: 22000,
  },
  regionalTax: {
    region: "Lombardia",
    brackets: [
      { upTo: 15000, rate: 0.0123 },
      { upTo: 28000, rate: 0.0158 },
      { upTo: 50000, rate: 0.0172 },
      { upTo: Number.POSITIVE_INFINITY, rate: 0.0173 },
    ],
  },
  municipalTax: {
    city: "Milano",
    exemptionThreshold: 23000,
    rate: 0.008,
  },
} as const;
