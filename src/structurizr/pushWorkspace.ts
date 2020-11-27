import { Workspace, StructurizrClient } from "structurizr-typescript"
import { IntegrationModel } from "../database/integration";

export const pushWorkspace = (workspace: Workspace, integration: IntegrationModel) => {
  const workspaceId = parseInt(integration.structurizrId);

  const client = new StructurizrClient(integration.structurizrKey, integration.structurizrSecret);

  return client.putWorkspace(workspaceId, workspace);
}