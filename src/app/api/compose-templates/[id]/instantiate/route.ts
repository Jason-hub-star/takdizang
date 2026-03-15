/** Instantiate a saved compose template into a fresh compose project. */
import { jsonError, jsonNotFound, jsonOk } from "@/lib/api-response";
import { instantiateTemplateProject } from "@/features/workspace-hub/template-instantiation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : undefined;

    const project = await instantiateTemplateProject(id, name);
    if (!project) {
      return jsonNotFound("Compose template");
    }

    return jsonOk({ project }, 201);
  } catch (error) {
    console.error("POST /api/compose-templates/[id]/instantiate error:", error);
    return jsonError("Internal server error", 500);
  }
}
