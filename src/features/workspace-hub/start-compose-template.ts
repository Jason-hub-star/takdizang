import { instantiateComposeTemplate } from "@/lib/api-client";

export interface StartedComposeTemplate {
  projectId: string;
  destination: string;
}

export async function startComposeTemplate(templateId: string): Promise<StartedComposeTemplate> {
  const response = await instantiateComposeTemplate(templateId);
  return {
    projectId: response.project.id,
    destination: `/projects/${response.project.id}/compose`,
  };
}
