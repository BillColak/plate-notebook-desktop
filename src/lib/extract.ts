interface PlateNode {
  type?: string;
  text?: string;
  children?: PlateNode[];
}

/**
 * Recursively extract all text from a Plate.js document tree.
 * Walks every node, collecting leaf text content.
 */
export function extractPlainText(nodes: unknown[]): string {
  const parts: string[] = [];

  function walk(node: PlateNode) {
    if (typeof node !== "object" || node === null) {
      return;
    }

    if ("text" in node && typeof node.text === "string") {
      parts.push(node.text);
      return;
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        walk(child);
      }
    }

    // Add newlines after block elements
    if (
      node.type &&
      typeof node.type === "string" &&
      !["a", "mention"].includes(node.type)
    ) {
      parts.push("\n");
    }
  }

  for (const node of nodes) {
    walk(node as PlateNode);
  }
  return parts.join("").trim();
}

/**
 * Extract the note title from the first H1 element.
 * Falls back to "Untitled" if no H1 is found.
 */
export function extractTitle(nodes: unknown[]): string {
  if (!Array.isArray(nodes)) {
    return "Untitled";
  }

  const h1 = nodes.find(
    (node) =>
      typeof node === "object" &&
      node !== null &&
      "type" in node &&
      (node as PlateNode).type === "h1"
  ) as PlateNode | undefined;

  if (h1?.children) {
    return (
      h1.children
        .filter(
          (c): c is PlateNode & { text: string } =>
            typeof c === "object" &&
            c !== null &&
            "text" in c &&
            typeof c.text === "string"
        )
        .map((c) => c.text)
        .join("")
        .trim() || "Untitled"
    );
  }

  return "Untitled";
}

/**
 * Extract #tags from plain text content.
 * Matches #word patterns, returns lowercase unique set.
 */
const TAG_REGEX = /(?:^|\s)#([a-zA-Z][\w-]{0,49})\b/g;

export function extractInlineTags(text: string): string[] {
  const found = new Set<string>();
  let match: RegExpExecArray | null = TAG_REGEX.exec(text);

  while (match !== null) {
    const captured = match[1];

    if (captured) {
      found.add(captured.toLowerCase());
    }
    match = TAG_REGEX.exec(text);
  }

  // Reset lastIndex for reuse
  TAG_REGEX.lastIndex = 0;

  return Array.from(found);
}
