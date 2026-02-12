import { BaseCalloutPlugin } from "@platejs/callout";

import { CalloutElementStatic } from "@/features/editor/nodes/callout-node-static";

export const BaseCalloutKit = [
  BaseCalloutPlugin.withComponent(CalloutElementStatic),
];
