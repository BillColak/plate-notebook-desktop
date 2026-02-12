
import { TocPlugin } from "@platejs/toc/react";

import { TocElement } from "@/features/editor/nodes/toc-node";

export const TocKit = [
  TocPlugin.configure({
    options: {
      // isScroll: true,
      topOffset: 80,
    },
  }).withComponent(TocElement),
];
