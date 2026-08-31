const percentageFormatter = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatPercentage(value: number) {
  return `${percentageFormatter.format(value)}%`;
}
