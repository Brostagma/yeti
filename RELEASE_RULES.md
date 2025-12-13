# Release Rules for Agent

This document outlines the strict standards that MUST be followed for every new release of the Yeti application.

## 1. Release Artifacts

- **Allowed Artifacts**:
  - Windows: `Yeti-Setup-<version>.exe`
  - macOS: `Yeti-<version>-x64.dmg` and `Yeti-<version>-arm64.dmg`
- **Forbidden Artifacts**:
  - `.zip` files (Do NOT publish zip files for any platform).
  - Source code (Do NOT attach source code archives to the release assets, although GitHub may auto-generate source code links, do not manually upload source archives).

## 2. Update Mechanism

- **Testing**: Before finalizing a release version (e.g., moving from 0.3.0 to 0.3.1), the update mechanism MUST be tested on the current version.
- **Error Handling**: The update process must provide clear, user-friendly error messages. Avoid generic "Network Error" messages. Use `try-catch` blocks to capture and display specific error details.
- **Stability**: Stay on the current version (e.g., 0.3.0) until the update process is verified to be working correctly. Do not increment the version number prematurely.

## 3. Configuration Checks

- **electron-builder.json**:
  - Ensure `mac.target` does NOT include `zip`.
  - Ensure `win.target` is set to `nsis` (or equivalent installer).
  - Ensure `linux` targets are removed or disabled if not supported.
- **GitHub Workflows**:
  - Ensure the release workflow (`.github/workflows/release.yml`) is configured to build only the allowed artifacts.

## 4. General

- These rules must be read and followed before every release attempt.
- Any deviation from these rules requires explicit user approval.
