import { BaseTogglePlugin } from "@platejs/toggle";

import { ToggleElementStatic } from "@/features/editor/nodes/toggle-node-static";

export const BaseToggleKit = [
  BaseTogglePlugin.withComponent(ToggleElementStatic),
];
