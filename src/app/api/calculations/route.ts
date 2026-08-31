import { buildCalculationsHandlers } from "@/server/http/calculationsController";
import { salaryCalculationService } from "@/server/services/salaryCalculationService";

export const runtime = "nodejs";

const handlers = buildCalculationsHandlers(salaryCalculationService);

export const GET = handlers.GET;
export const POST = handlers.POST;
