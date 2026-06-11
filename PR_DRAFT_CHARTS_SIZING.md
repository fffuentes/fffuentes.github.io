PR: fix(charts): enforce responsive aspect ratios and remove fixed canvas heights

Summary:
This PR contains the chart sizing fixes implemented on branch feat/refactor-charts (commit 99026cf). Changes:
- Set Chart.js defaults: maintainAspectRatio: true, default aspectRatio: 1.6
- Per-type aspectRatio: doughnut/pie => 1, bar/line/mixed => 1.6
- Removed fixed canvas heights in css/styles.css and added .chart-panel min-height
- ChartFactory ensures per-type aspectRatio fallback and calls chart.resize() after init

Files changed:
- charts/chartConfig.js
- js/chartFactory.js
- css/styles.css
- js/app.js

Validation steps (manual):
1. Open dashboard on desktop/tablet/mobile.
2. Verify donut/pie charts are circular (no oval shapes).
3. Verify tooltips appear aligned under the cursor (test on HiDPI & zoom).
4. Resize window and confirm charts keep sensible proportions.

Rollback: backups created with .bak suffix for modified files in repo root.

Note: Do NOT merge until visual validation completes. This PR is a draft for review.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>