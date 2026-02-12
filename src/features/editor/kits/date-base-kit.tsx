import { BaseDatePlugin } from "@platejs/date";

import { DateElementStatic } from "@/features/editor/nodes/date-node-static";

export const BaseDateKit = [BaseDatePlugin.withComponent(DateElementStatic)];
