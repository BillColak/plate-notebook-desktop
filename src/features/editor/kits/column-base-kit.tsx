import { BaseColumnItemPlugin, BaseColumnPlugin } from "@platejs/layout";

import {
  ColumnElementStatic,
  ColumnGroupElementStatic,
} from "@/features/editor/nodes/column-node-static";

export const BaseColumnKit = [
  BaseColumnPlugin.withComponent(ColumnGroupElementStatic),
  BaseColumnItemPlugin.withComponent(ColumnElementStatic),
];
