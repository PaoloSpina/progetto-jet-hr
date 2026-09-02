// Configurazione fiscale del prototipo per il caso standard 2026: dipendente privato,
// residente a Milano e impiegato per l'intero anno.
export const TAX_CONFIG = {
  year: 2026,
  // Semplificazione del prototipo: il 9,19% non rappresenta tutti i possibili CCNL,
  // inquadramenti o trattamenti INPS.
  employeeContributionRate: 0.0919,
  maxGrossAnnualSalary: 500000,
  irpefBrackets: [
    { upTo: 28000, rate: 0.23 },
    { upTo: 50000, rate: 0.33 },
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
    additionalAmount: 65,
    additionalBandMinExclusive: 25000,
    additionalBandMax: 35000,
  },
  additionalEmploymentDeduction: {
    fullAmount: 1000,
    fullAmountBandMinExclusive: 20000,
    fullAmountBandMax: 32000,
    taperBandMax: 40000,
    taperBandDivisor: 8000,
  },
  employeeTaxFreeBonus: {
    // Semplificazione del prototipo: employmentIncome coincide con la RAL e il
    // beneficio è aggiunto al netto, senza ridurre l'imponibile IRPEF.
    brackets: [
      { upTo: 8500, rate: 0.071 },
      { upTo: 15000, rate: 0.053 },
      { upTo: 20000, rate: 0.048 },
    ],
  },
  lombardyRegionalTax: {
    region: "Lombardia",
    brackets: [
      { upTo: 15000, rate: 0.0123 },
      { upTo: 28000, rate: 0.0158 },
      { upTo: 50000, rate: 0.0172 },
      { upTo: Number.POSITIVE_INFINITY, rate: 0.0173 },
    ],
  },
  milanMunicipalTax: {
    city: "Milano",
    exemptionThreshold: 23000,
    rate: 0.008,
  },
} as const;
