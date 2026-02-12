import { useCallback, useEffect, useRef, useState } from "react";
import { Code, Eye } from "lucide-react";

interface MermaidBlockProps {
  code: string;
}

let mermaidModule: typeof import("mermaid") | null = null;
let mermaidInitialized = false;

async function getMermaid() {
  if (!mermaidModule) {
    mermaidModule = await import("mermaid");
    if (!mermaidInitialized) {
      mermaidModule.default.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
        fontFamily: "ui-monospace, monospace",
      });
      mermaidInitialized = true;
    }
  }
  return mermaidModule.default;
}

export function MermaidBlock({ code }: MermaidBlockProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showCode, setShowCode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`);

  const renderDiagram = useCallback(async () => {
    if (!code.trim()) {
      setSvg("");
      setError("");
      return;
    }
    try {
      const mermaid = await getMermaid();
      const { svg: renderedSvg } = await mermaid.render(
        idRef.current,
        code.trim()
      );
      setSvg(renderedSvg);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to render diagram");
      setSvg("");
    }
  }, [code]);

  useEffect(() => {
    if (!showCode) {
      renderDiagram();
    }
  }, [renderDiagram, showCode]);

  return (
    <div className="my-2 rounded-lg border border-border bg-muted/30 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/50">
        <span className="text-xs font-medium text-muted-foreground">
          Mermaid Diagram
        </span>
        <button
          type="button"
          onClick={() => setShowCode(!showCode)}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {showCode ? (
            <>
              <Eye className="h-3 w-3" /> Preview
            </>
          ) : (
            <>
              <Code className="h-3 w-3" /> Code
            </>
          )}
        </button>
      </div>
      {showCode ? (
        <pre className="p-3 overflow-auto text-sm font-mono bg-muted/20">
          <code>{code}</code>
        </pre>
      ) : error ? (
        <div className="p-3 text-sm text-red-400">
          <p className="font-medium">Diagram Error</p>
          <p className="text-xs mt-1 opacity-70">{error}</p>
        </div>
      ) : svg ? (
        <div
          ref={containerRef}
          className="p-3 flex justify-center overflow-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="p-3 text-sm text-muted-foreground">Rendering...</div>
      )}
    </div>
  );
}

/**
 * Checks if a code block element should render as mermaid.
 * Use this in the code block renderer to detect mermaid language.
 */
export function isMermaidCodeBlock(lang: string | undefined): boolean {
  return lang?.toLowerCase() === "mermaid";
}
