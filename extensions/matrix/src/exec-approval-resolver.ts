import { resolveApprovalOverGateway } from "recall/plugin-sdk/approval-gateway-runtime";
import type { ExecApprovalReplyDecision } from "recall/plugin-sdk/approval-runtime";
import type { RecallConfig } from "recall/plugin-sdk/config-contracts";
import { isApprovalNotFoundError } from "recall/plugin-sdk/error-runtime";

export { isApprovalNotFoundError };

export async function resolveMatrixApproval(params: {
  cfg: RecallConfig;
  approvalId: string;
  decision: ExecApprovalReplyDecision;
  senderId?: string | null;
  gatewayUrl?: string;
}): Promise<void> {
  await resolveApprovalOverGateway({
    cfg: params.cfg,
    approvalId: params.approvalId,
    decision: params.decision,
    senderId: params.senderId,
    gatewayUrl: params.gatewayUrl,
    clientDisplayName: `Matrix approval (${params.senderId?.trim() || "unknown"})`,
  });
}
