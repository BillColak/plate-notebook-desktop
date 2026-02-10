
import { useEffect, useState } from "react";

import { createNote } from "@/actions/notes";

const LEGACY_STORAGE_KEY = "plate-editor-content";

export function MigrationBanner() {
  const [hasLegacyData, setHasLegacyData] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        JSON.parse(stored);
        setHasLegacyData(true);
      }
    } catch {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }, []);

  if (!hasLegacyData) {
    return null;
  }

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!stored) {
        return;
      }

      const content = JSON.parse(stored) as unknown[];
      await createNote(null);

      localStorage.removeItem(LEGACY_STORAGE_KEY);
      setHasLegacyData(false);
    } catch {
      setIsMigrating(false);
    }
  };

  const handleDismiss = () => {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    setHasLegacyData(false);
  };

  return (
    <div className="flex items-center gap-3 border-border border-b bg-muted/50 px-4 py-2 text-sm">
      <span>📦 Found existing editor content from a previous session.</span>
      <button
        className="rounded bg-primary px-3 py-1 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        disabled={isMigrating}
        onClick={handleMigrate}
        type="button"
      >
        {isMigrating ? "Importing..." : "Import as note"}
      </button>
      <button
        className="text-muted-foreground hover:text-foreground"
        onClick={handleDismiss}
        type="button"
      >
        Dismiss
      </button>
    </div>
  );
}
