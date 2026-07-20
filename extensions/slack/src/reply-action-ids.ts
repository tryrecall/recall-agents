// Slack plugin module implements reply action ids behavior.
export const SLACK_REPLY_BUTTON_ACTION_ID = "steelengine:reply_button";
export const SLACK_REPLY_LINK_ACTION_ID = "steelengine:reply_link";
export const SLACK_REPLY_SELECT_ACTION_ID = "steelengine:reply_select";
export const SLACK_CALLBACK_BUTTON_ACTION_ID = "steelengine:callback_button";
export const SLACK_CALLBACK_SELECT_ACTION_ID = "steelengine:callback_select";
export const SLACK_APPROVAL_BUTTON_ACTION_ID = "steelengine:approval_button";
export const SLACK_APPROVAL_SELECT_ACTION_ID = "steelengine:approval_select";
export const SLACK_QUESTION_BUTTON_ACTION_ID = "steelengine:question_button";

export function isSlackQuestionActionId(actionId: string): boolean {
  return (
    actionId === SLACK_QUESTION_BUTTON_ACTION_ID ||
    actionId.startsWith(`${SLACK_QUESTION_BUTTON_ACTION_ID}:`)
  );
}

export function isSlackApprovalActionId(actionId: string): boolean {
  return (
    actionId === SLACK_APPROVAL_BUTTON_ACTION_ID ||
    actionId === SLACK_APPROVAL_SELECT_ACTION_ID ||
    actionId.startsWith(`${SLACK_APPROVAL_BUTTON_ACTION_ID}:`) ||
    actionId.startsWith(`${SLACK_APPROVAL_SELECT_ACTION_ID}:`)
  );
}

export function isSlackCallbackActionId(actionId: string): boolean {
  return (
    actionId === SLACK_CALLBACK_BUTTON_ACTION_ID ||
    actionId === SLACK_CALLBACK_SELECT_ACTION_ID ||
    actionId.startsWith(`${SLACK_CALLBACK_BUTTON_ACTION_ID}:`) ||
    actionId.startsWith(`${SLACK_CALLBACK_SELECT_ACTION_ID}:`)
  );
}
