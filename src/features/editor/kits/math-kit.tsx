
import { EquationPlugin, InlineEquationPlugin } from "@platejs/math/react";

import {
  EquationElement,
  InlineEquationElement,
} from "@/features/editor/nodes/equation-node";

export const MathKit = [
  InlineEquationPlugin.withComponent(InlineEquationElement),
  EquationPlugin.withComponent(EquationElement),
];
