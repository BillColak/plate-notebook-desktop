import { BaseMentionPlugin } from "@platejs/mention";

import { MentionElementStatic } from "@/features/editor/nodes/mention-node-static";

export const BaseMentionKit = [
  BaseMentionPlugin.withComponent(MentionElementStatic),
];
