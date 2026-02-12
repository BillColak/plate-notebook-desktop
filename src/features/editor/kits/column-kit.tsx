
import { ColumnItemPlugin, ColumnPlugin } from "@platejs/layout/react";

import { ColumnElement, ColumnGroupElement } from "@/features/editor/nodes/column-node";

export const ColumnKit = [
  ColumnPlugin.withComponent(ColumnGroupElement),
  ColumnItemPlugin.withComponent(ColumnElement),
];
