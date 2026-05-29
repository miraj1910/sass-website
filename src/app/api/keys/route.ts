import { NextResponse, type NextRequest } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/rbac";
import { serverError, badRequest } from "@/lib/api-utils";
import { createApiKey, listApiKeys, revokeApiKey } from "@/lib/api-keys";
import { z } from "zod";

const createKeySchema = z.object({
  name: z.string().min(1).max(50),
  scopes: z.array(z.string()).optional(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

const revokeKeySchema = z.object({
  keyId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth({}, request);
    const keys = await listApiKeys(user.id);
    return NextResponse.json({ keys });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "api-keys.GET");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth({}, request);
    const json = await request.json();
    const parsed = createKeySchema.safeParse(json);
    if (!parsed.success) return badRequest(parsed.error);

    const result = await createApiKey({
      userId: user.id,
      name: parsed.data.name,
      scopes: parsed.data.scopes,
      expiresInDays: parsed.data.expiresInDays,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "api-keys.POST");
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth({}, request);
    const json = await request.json();
    const parsed = revokeKeySchema.safeParse(json);
    if (!parsed.success) return badRequest(parsed.error);

    await revokeApiKey(parsed.data.keyId, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "api-keys.DELETE");
  }
}
