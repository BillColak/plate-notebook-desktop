import { BaseListPlugin } from "@platejs/list";
import { KEYS } from "platejs";

import { BaseIndentKit } from "@/features/editor/kits/indent-base-kit";
import { BlockListStatic } from "@/features/editor/nodes/block-list-static";

export const BaseListKit = [
  ...BaseIndentKit,
  BaseListPlugin.configure({
    inject: {
      targetPlugins: [
        ...KEYS.heading,
        KEYS.p,
        KEYS.blockquote,
        KEYS.codeBlock,
        KEYS.toggle,
      ],
    },
    render: {
      belowNodes: BlockListStatic,
    },
  }),
];
