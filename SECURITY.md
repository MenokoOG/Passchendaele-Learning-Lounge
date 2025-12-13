# SECURITY.md

> **Security reporting and disclosure policy for this project**

---

## Table of contents

* [Reporting a Vulnerability](https://chatgpt.com/c/693d046c-a850-832a-ae92-65222aa07654#reporting-a-vulnerability)
  * [Encrypting sensitive reports (PGP/GPG)](https://chatgpt.com/c/693d046c-a850-832a-ae92-65222aa07654#encrypting-sensitive-reports-pgpgpgp)
* [Response &amp; disclosure timeline](https://chatgpt.com/c/693d046c-a850-832a-ae92-65222aa07654#response--disclosure-timeline)
* [What we provide to reporters](https://chatgpt.com/c/693d046c-a850-832a-ae92-65222aa07654#what-we-provide-to-reporters)
* [Safe harbor / researcher guidelines](https://chatgpt.com/c/693d046c-a850-832a-ae92-65222aa07654#safe-harbor--researcher-guidelines)
* [If you cannot use the preferred channels](https://chatgpt.com/c/693d046c-a850-832a-ae92-65222aa07654#if-you-cannot-use-the-preferred-channels)
* [After disclosure](https://chatgpt.com/c/693d046c-a850-832a-ae92-65222aa07654#after-disclosure)
* [Contact / maintainers](https://chatgpt.com/c/693d046c-a850-832a-ae92-65222aa07654#contact--maintainers)

---

## Reporting a vulnerability

If you discover a security vulnerability affecting this project, please report it privately. Preferred reporting channels (in order):

1. GitHub Security Advisory for this repository.
2. Email: `security@yourdomain.com` (replace with the maintainer's security email if available).
3. If neither is available, follow the instructions in **If you cannot use the preferred channels** below.

When you contact us, include:

* A concise title and summary of the issue.
* Step-by-step reproduction steps, victim/target version(s), and any test data required to reproduce.
* Impact assessment (what an attacker can do if exploited).
* Any suggested mitigations or fixes if available.
* Your preferred contact method and whether you want public credit.

If your report contains sensitive information (proof-of-concept that leaks secrets, data samples, credentials, or personally identifiable information), **encrypt the report** before sending — see below.

---

### Encrypting sensitive reports (PGP / GPG)

If the maintainer publishes a PGP/GPG public key, use it to encrypt the report before sending.

**Example (encrypt using a published `KEY_ID` or name):**

```bash
# Encrypt to a binary OpenPGP file (suitable as an attachment)
gpg --output report.asc --encrypt --recipient "KEY_ID_OR_NAME" report.txt

# Or produce an ASCII-armored (text) file suitable for pasting into an email
gpg --armor --output report.asc --encrypt --recipient "KEY_ID_OR_NAME" report.txt
```

Attach `report.asc` to your email, or paste the armored output into the message body if you used `--armor`.

**If you do not know the maintainer's key ID / name:** search published keys on common keyservers or check the maintainer’s profile or website for a canonical PGP key. If no public key is available, request a secure channel in your initial advisory (for example, through a GitHub Security Advisory) and we will provide an encrypted channel or instructions.

---

## Response & disclosure timeline

We follow coordinated disclosure practices. Estimated timelines are:

* **Acknowledgement:** We will acknowledge receipt of your report within **72 hours (business days)** via the channel you used.
* **Triage:** We will triage and classify the issue (severity / impact) and provide periodic status updates.
* **Fix / Mitigation:** For critical / high-severity issues, we will prioritize a fix and coordinate release. **Target:** initial mitigation or patch within **30 days** for critical issues where feasible. Lower-severity issues will follow normal release schedules.
* **Disclosure:** We will coordinate any public disclosure with you. We will not publicly disclose a vulnerability until a fix or mitigation is available or until we agree on a disclosure timeline.

If you have a specific preferred disclosure date, include it in your report and we will attempt to accommodate reasonable requests.

> Note: Timelines are targets and may be adjusted for complex issues, regulatory constraints, or dependencies on third parties. We will keep reporters informed when timelines change.

---

## What we provide to reporters

We value coordinated, responsible reports. For qualifying reports we will provide:

* Confirmation of receipt and a point of contact for follow-up.
* Regular status updates during triage and remediation.
* Credit in release notes or in the repository (e.g., a `SECURITY` file or `HALL_OF_FAME`) for reporters who wish to be credited, unless they request anonymity.
* A coordinated public advisory and a fix or mitigation.
* CVE assignment where appropriate and requested.

---

## Safe harbor / researcher guidelines

We welcome good-faith security research. If you follow the guidelines below, we will **not** pursue legal action for the acts reasonably necessary to identify and report security vulnerabilities:

* Act in good faith and avoid privacy violations or service disruption.
* Limit testing to only the resources required to demonstrate the vulnerability. Do not attempt to access, modify, or exfiltrate unrelated user data.
* Avoid destructive actions (deleting data, introducing malware, interrupting services). If destructive testing is required to reproduce an issue, request explicit permission before doing so.
* If you discover sensitive user data during testing, cease active testing and notify us immediately with the minimum necessary evidence. Do not retain or distribute that data.
* If you are unsure whether a proposed test is safe, describe the steps in your initial contact and request permission or guidance.

We will not ask for preservation of evidence beyond what is reasonably necessary to triage and fix the issue.

---

## If you cannot use the preferred channels

If GitHub Security Advisories or the maintainer email are not available, you may:

* Open a private support request via GitHub (contact the repository owner).
* Send a private message on the maintainer’s GitHub profile (for example: `https://github.com/MenokoOG`) requesting a secure reporting channel.
* If neither option works, include a short summary of the issue and state that you have a security report to share privately; we will reply with instructions for a secure channel.

When contacting via alternative channels, be explicit that you are attempting responsible disclosure and do **not** include sensitive details until a secure channel has been established.

---

## After disclosure

* Once a fix or mitigation is available, we will publish an advisory or release notes that describe the issue, affected versions, and recommended mitigation steps.
* We will request CVE assignment where appropriate.
* If you requested credit and asked to be named, we will include your preferred name in acknowledgements consistent with your wishes (or remain anonymous if requested).

---

## Contact / maintainers

* Repository: `https://github.com/MenokoOG` (example maintainer profile)
* Security email (placeholder): `security@yourdomain.com` — replace with the project’s canonical security contact
* For git/GitHub Security Advisory reporting, use this repository’s Security Advisory UI.

---

## Closing notes

We appreciate responsible disclosure and the time taken by security researchers to help improve this project. If you have any questions about the reporting process or need assistance setting up encrypted communication, include a brief non-sensitive summary in your initial contact and we will respond with the next steps.
