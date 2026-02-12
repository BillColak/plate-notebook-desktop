import { BaseCodeDrawingPlugin } from "@platejs/code-drawing";

import { CodeDrawingElement } from "@/features/editor/nodes/code-drawing-node";

export const BaseCodeDrawingKit = [
  BaseCodeDrawingPlugin.configure({
    node: { component: CodeDrawingElement },
  }),
];
