// server/src/utils/extract_license.ts
/**
 * Conservative license/copyright extractor.
 * Looks for common license blocks or short copyright/license lines.
 * Returns null if nothing matched.
 */

export function extractLicenseFromText(
  text: string | null | undefined
): string | null {
  if (!text) return null;
  const s = String(text);

  // Normalize whitespace for matching
  const norm = s.replace(/\r\n/g, "\n");

  // Common license name patterns + some context capture (capped)
  const licensePatterns: RegExp[] = [
    /(?:MIT License)[\s\S]{0,1200}?Copyright[\s\S]{0,1200}?The above copyright notice/i,
    /(?:Apache License(?:,? Version 2\.0)?)?[\s\S]{0,1200}?http:\/\/www\.apache\.org\/licenses\/LICENSE-2\.0/i,
    /(?:JUPYTER|Jupyter)[\s\S]{0,800}?THIS SOFTWARE IS PROVIDED/i,
    /React Joyride[\s\S]{0,400}?Permission is hereby granted/i,
    /D3(?:\.js)?[\s\S]{0,800}?THIS SOFTWARE IS PROVIDED/i,
    /Lottie(?: Files)?[\s\S]{0,800}?Copyright(?: \(c\))?/i,
  ];

  for (const re of licensePatterns) {
    const m = norm.match(re);
    if (m && m[0]) {
      // Keep a sane cap on size
      return m[0].slice(0, 4000).trim();
    }
  }

  // Fallback: try to capture short Copyright / License lines
  const short = norm.match(/((?:Copyright|©|LICENSE|License)[\s\S]{0,300})/i);
  if (short && short[0]) {
    return short[0].slice(0, 2000).trim();
  }

  return null;
}
