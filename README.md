# Habit Tracker

A full-year habit tracking application built with Next.js, TypeScript, and Tailwind CSS.

<img width="1490" height="1490" alt="image" src="https://github.com/user-attachments/assets/b3f07361-1f64-49af-9e21-9313822a14a0" />


## Features

- Track habits for the entire year 2025 (365 days)
- Categorize habits (Health, Work, Learning, Personal)
- View statistics including streaks and completion rates
- Filter habits by category
- Export data to JSON or CSV
- Data persists in browser localStorage

## Getting Started

1. Install dependencies (already done):
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

- **Add a habit**: Enter a habit name, select a category, and click "Add Habit"
- **Track completion**: Click on the circles in the table to mark a day as complete/incomplete
- **View stats**: Statistics appear in each habit column showing streaks and completion rates
- **Export data**: Use the "Export JSON" or "Export CSV" buttons to download your data
- **Clear data**: The "Clear All Data" button removes all habits and completions

## Project Structure

```
habit-tracker/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── habit-tracker.tsx
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── select.tsx
├── package.json
└── tailwind.config.ts
```
