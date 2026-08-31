# RAL -> Netto

Prototipo full-stack per stimare il netto di un dipendente italiano a partire dalla RAL, con frontend Next.js, backend server-side, logica di dominio separata e persistenza PostgreSQL tramite Prisma.

## Stack

- Next.js 16
- React 19
- TypeScript
- PostgreSQL
- Prisma ORM
- Vitest

## Prerequisiti

- Node.js 24+
- npm 11+
- PostgreSQL raggiungibile localmente o da remoto

## Configurazione ambiente

1. Crea un file `.env` partendo da `.env.example`.
2. Imposta `DATABASE_URL` con una connessione PostgreSQL reale.

Esempio:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ral_netto_prototype?schema=public"
```

## Installazione dipendenze

```bash
npm install
```

## Prisma

Genera il client Prisma:

```bash
npm run db:generate
```

Esegui la migration iniziale:

```bash
npm run db:migrate
```

Apri Prisma Studio se vuoi ispezionare i record:

```bash
npm run db:studio
```

## Avvio in sviluppo

```bash
npm run dev
```

L'app espone:

- `GET /api/calculations`
- `POST /api/calculations`

## Test

```bash
npm test
```

## Qualita' codice

```bash
npm run lint
npm run typecheck
```

## Build produzione

```bash
npm run build
```

## Schema database

Tabella principale:

- `SalaryCalculation`

Campi:

- `id`
- `grossAnnualSalary`
- `monthlyPayments`
- `employeeContributions`
- `taxableIncome`
- `grossIrpef`
- `employmentDeduction`
- `netIrpef`
- `regionalTax`
- `municipalTax`
- `totalTaxesAndContributions`
- `netAnnualSalary`
- `netMonthlySalary`
- `effectiveTaxRate`
- `createdAt`

## Note sul prototipo

- Il calcolo e' centralizzato in `src/domain/salary/calculateSalary.ts`.
- Le aliquote e le regole semplificate sono in `src/domain/salary/taxConfig.ts`.
- Il backend valida sempre l'input prima del calcolo.
- Ogni calcolo valido viene salvato nel database.
- Lo storico legge gli ultimi 10 risultati ordinati per `createdAt DESC`.

## Limitazioni deliberate

- Simulazione semplificata, non sostituisce un cedolino o un consulente del lavoro.
- Nessuna autenticazione o raccolta di dati personali.
- Nessuna modifica o cancellazione dello storico.
