#!/usr/bin/env node
// scripts/replace-process-env.cjs
// Replaces `process.env.VITE_XXX` -> `import.meta.env.VITE_XXX` in src/**.{js,ts,jsx,tsx}
// Usage:
//   node ./scripts/replace-process-env.cjs --dry   # dry run (no file writes)
//   node ./scripts/replace-process-env.cjs         # perform replacements
//
// This script intentionally only targets process.env.VITE_* to avoid risky global changes.

const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const dry = argv.includes("--dry") || argv.includes("-n");
const root = process.cwd();
const targetDir = path.join(root, "src");
const exts = [".js", ".ts", ".jsx", ".tsx"];

/** Recursively collect files under dir matching extensions */
function collectFiles(dir) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip node_modules and .git
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      results.push(...collectFiles(full));
    } else if (entry.isFile()) {
      if (exts.includes(path.extname(entry.name))) results.push(full);
    }
  }
  return results;
}

/** Replace occurrences in text */
function replaceText(original) {
  const regex = /process\.env\.((?:VITE_[A-Za-z0-9_]+))/g;
  let changed = false;
  const updated = original.replace(regex, (m, varname) => {
    changed = true;
    return `import.meta.env.${varname}`;
  });
  return { changed, updated };
}

function main() {
  if (!fs.existsSync(targetDir)) {
    console.error(`Directory not found: ${targetDir}`);
    process.exit(1);
  }

  const files = collectFiles(targetDir);
  if (!files.length) {
    console.log("No JS/TS files found under src/");
    return;
  }

  const changedFiles = [];
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");
      const { changed, updated } = replaceText(content);
      if (changed) {
        changedFiles.push(file);
        if (!dry) {
          fs.writeFileSync(file, updated, "utf8");
        }
      }
    } catch (err) {
      console.error("Failed processing", file, err.message || err);
    }
  }

  console.log(`Scanned ${files.length} files under src/`);
  if (!changedFiles.length) {
    console.log("No process.env.VITE_* occurrences found.");
  } else {
    if (dry) {
      console.log(`[DRY RUN] Would update ${changedFiles.length} files:`);
    } else {
      console.log(`Updated ${changedFiles.length} files:`);
    }
    for (const f of changedFiles) console.log(" -", path.relative(root, f));
  }

  if (dry) {
    console.log("\nRun without --dry to apply changes (review with git diff).");
  } else {
    console.log("\nDone. Review changes with 'git diff' or your editor.");
  }
}

main();
