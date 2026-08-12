# Product: Pakistan Times — 14 August AI Photobooth

An AI-powered photobooth web app for Pakistan's Independence Day (14 August). Users take a webcam selfie, choose a historic scene from Pakistan's founding era, answer a short personality quiz, and receive a vintage newspaper front page featuring themselves alongside Pakistan's founding leaders.

## Core Flow

Landing → Capture (webcam/upload) → Choose Scene (5 historic moments) → Quiz (name, role, alter-ego, star form, cause) → Generating → Result (download/share/print/regenerate).

## Key Capabilities

- AI image generation places the user's face into a vintage group photograph with Pakistan's founders (identity-locked to preserve the user's exact appearance).
- AI text generation writes a 1940s-style newspaper personality article based on quiz answers.
- The final output is a printable A4 newspaper layout rendered client-side and exportable as PNG.
- Two generation modes: "auto" (real-time AI calls) and "manual" (backoffice job queue for operator-assisted generation).
- A `#backoffice` hash route provides an admin interface for manual job processing.
- A `#demo` hash route renders sample data without AI calls for layout testing.
