// src/pages/Legal.tsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * Plain-language privacy + terms for a small, private learning site.
 * Statements below describe what this codebase actually stores.
 */
export function PrivacyPage() {
  return (
    <article className="prose enter">
      <h2 className="text-3xl font-black">Privacy</h2>
      <p>
        The lounge stores only what it needs to run accounts and your study
        tools.
      </p>
      <ul>
        <li>
          <strong>Account:</strong> username, email address and a hashed
          password (never the password itself), plus your role.
        </li>
        <li>
          <strong>Your work:</strong> notes, board tasks, calendar events,
          uploaded files and your reader preferences.
        </li>
        <li>
          <strong>Reading without an account:</strong> sources and lessons can
          be read without signing in. Display preferences are kept in your
          browser only.
        </li>
        <li>
          <strong>Third parties:</strong> fonts are loaded from Google Fonts.
          Source links open on the holding institution's own site, under its
          own privacy policy.
        </li>
      </ul>
      <p>
        To have an account removed, ask an administrator. See also the{" "}
        <Link to="/terms">terms of use</Link>.
      </p>
    </article>
  );
}

export function TermsPage() {
  return (
    <article className="prose enter">
      <h2 className="text-3xl font-black">Terms of use</h2>
      <ul>
        <li>
          The lounge is a study aid. Source material remains the copyright of
          the institutions that hold it; each record names its holder and links
          to the original. Check the source page before reusing anything.
        </li>
        <li>
          Text from Wikipedia and World History Encyclopedia carries its own
          open licence (see the note on each source) and must be attributed.
        </li>
        <li>
          Rewritten or simplified versions are aids to reading, not a
          replacement for the original. Quote the original.
        </li>
        <li>Use accounts and uploads responsibly. Administrators may remove content.</li>
      </ul>
      <p>
        See the <Link to="/privacy">privacy notice</Link>.
      </p>
    </article>
  );
}
