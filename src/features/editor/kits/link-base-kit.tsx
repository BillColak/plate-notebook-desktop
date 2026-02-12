import { BaseLinkPlugin } from "@platejs/link";

import { LinkElementStatic } from "@/features/editor/nodes/link-node-static";

export const BaseLinkKit = [BaseLinkPlugin.withComponent(LinkElementStatic)];
