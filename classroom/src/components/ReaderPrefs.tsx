// src/components/ReaderPrefs.tsx
import React, { useEffect, useState } from "react";

export type ReaderPrefsShape = {
  fontScale?: number;
  lineHeight?: number;
  letterSpacing?: number;
};

export default function ReaderPrefs({
  initialPrefs,
  onSave,
}: {
  initialPrefs?: ReaderPrefsShape;
  onSave?: (p: ReaderPrefsShape) => void;
}) {
  const [fontScale, setFontScale] = useState<number>(
    initialPrefs?.fontScale ?? 1.45
  );
  const [lineHeight, setLineHeight] = useState<number>(
    initialPrefs?.lineHeight ?? 1.9
  );
  const [letterSpacing, setLetterSpacing] = useState<number>(
    initialPrefs?.letterSpacing ?? 0.02
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        "m3_reader_prefs_v1",
        JSON.stringify({ fontScale, lineHeight, letterSpacing })
      );
    } catch {}
    onSave?.({ fontScale, lineHeight, letterSpacing });
  }, [fontScale, lineHeight, letterSpacing]);

  return (
    <div>
      <label className="block text-xs mb-2">
        Font scale: <strong>{fontScale.toFixed(2)}x</strong>
      </label>
      <input
        type="range"
        min={1}
        max={2}
        step={0.05}
        value={fontScale}
        onChange={(e) => setFontScale(Number(e.target.value))}
        className="w-full"
      />

      <label className="block text-xs mt-3 mb-2">
        Line height: <strong>{lineHeight.toFixed(2)}</strong>
      </label>
      <input
        type="range"
        min={1.2}
        max={2.8}
        step={0.05}
        value={lineHeight}
        onChange={(e) => setLineHeight(Number(e.target.value))}
        className="w-full"
      />

      <label className="block text-xs mt-3 mb-2">
        Letter spacing: <strong>{letterSpacing.toFixed(3)}em</strong>
      </label>
      <input
        type="range"
        min={0}
        max={0.08}
        step={0.005}
        value={letterSpacing}
        onChange={(e) => setLetterSpacing(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
