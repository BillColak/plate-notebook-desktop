
import { createPlatePlugin } from "platejs/react";

import { FixedToolbar } from "@/features/toolbar/fixed-toolbar";
import { FixedToolbarButtons } from "@/features/toolbar/fixed-toolbar-buttons";

export const FixedToolbarKit = [
  createPlatePlugin({
    key: "fixed-toolbar",
    render: {
      beforeEditable: () => (
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>
      ),
    },
  }),
];
