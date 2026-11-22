# VisionForge

## Run locally

Double-click `start-visionforge.cmd`, or run `npm start` from this folder in your own PowerShell window. Keep that window open, then visit `http://localhost:3000` in a normal local browser.

The Codex in-app browser is sandboxed from the development-server process, so it cannot open this project through `localhost`.

## Prove the Harbor integration

After Docker Desktop is running and Harbor is installed, execute:

```powershell
.\scripts\run-harbor-verification.ps1
```

This runs the generated `vf_42_spatial` package with Harbor's Oracle agent. Its verifier compares `/app/answer.txt` with the VisionForge ground truth and writes the Harbor reward (1 for a correct answer) to the job result.
