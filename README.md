# ACCA AA – Audit and Assurance | Exam Platform

A professional, browser-based MCQ exam platform for ACCA Paper AA (Audit and Assurance), modelled on the ACCA specimen exam interface.

## 🔗 Live Link

> **[https://abdul206r-hue.github.io/mcq-quiz-website/](https://abdul206r-hue.github.io/mcq-quiz-website/)**

## Features

- 50 ACCA-standard Audit and Assurance MCQ questions
- Real-time 2-hour countdown timer
- Question flagging / bookmarking for review
- Colour-coded question navigator (answered · flagged · current · unanswered)
- Live progress bar
- Professional results page with animated score ring and per-question explanations
- Performance statistics and wrong-answer review
- Fully responsive — works on desktop and mobile

## Getting Started (local)

```bash
# Clone the repository
git clone https://github.com/abdul206r-hue/mcq-quiz-website.git
cd mcq-quiz-website

# Open in your browser — no build step needed
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

## Deployment

The site is automatically deployed to **GitHub Pages** via the
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) workflow
on every push to the `main` branch.

To enable GitHub Pages for this repository:
1. Go to **Settings → Pages**
2. Under *Source*, select **GitHub Actions**
3. Push (or merge a PR) to `main` — the workflow will deploy automatically

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, flexbox, grid) |
| Logic | Vanilla JavaScript (ES6+) |
| Data | Inline JS object (`data.js`) |
| Deployment | GitHub Pages via GitHub Actions |
