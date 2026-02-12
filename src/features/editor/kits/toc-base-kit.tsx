import { BaseTocPlugin } from "@platejs/toc";

import { TocElementStatic } from "@/features/editor/nodes/toc-node-static";

export const BaseTocKit = [BaseTocPlugin.withComponent(TocElementStatic)];
