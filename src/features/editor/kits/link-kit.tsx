
import { LinkPlugin } from "@platejs/link/react";

import { LinkElement } from "@/features/editor/nodes/link-node";
import { LinkFloatingToolbar } from "@/features/editor/nodes/link-toolbar";

export const LinkKit = [
  LinkPlugin.configure({
    render: {
      node: LinkElement,
      afterEditable: () => <LinkFloatingToolbar />,
    },
  }),
];
