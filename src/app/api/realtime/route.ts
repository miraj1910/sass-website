import { type NextRequest } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/rbac";
import { addClient, removeClient } from "@/lib/realtime";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth({}, request);

    const teamId = user.teamId ?? undefined;

    let clientId = "";

    const stream = new ReadableStream({
      start(controller) {
        clientId = `sse_${user.id}_${Date.now()}`;

        addClient({
          id: clientId,
          userId: user.id,
          teamId,
          controller,
        });

        controller.enqueue(
          new TextEncoder().encode(`event: connected\ndata: {"clientId":"${clientId}"}\n\n`),
        );
      },
      cancel() {
        removeClient(clientId);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
