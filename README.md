# Performance Analytics Dashboard

A high-performance React and TypeScript data visualization dashboard designed to handle and visualize large datasets efficiently.

## Project Overview

The Performance Analytics Dashboard provides an interactive interface for analyzing large datasets through real-time statistics and visualizations.

The dashboard supports large datasets and uses Web Worker-based data generation to maintain UI responsiveness.

## Features

- Interactive dataset size selection
- Supports datasets up to 500,000 records
- Total value calculation
- Average value calculation
- Value-over-time line chart
- Category distribution bar chart
- Region distribution bar chart
- Responsive dashboard interface
- Web Worker-based data processing
- Optimized React rendering using `useMemo`
- Real-time dashboard updates

## Technologies Used

- React
- TypeScript
- Vite
- Recharts
- Lucide React
- Web Workers
- CSS

## Project Structure

```text
performance-dashboard/
├── public/
├── src/
│   ├── components/
│   ├── data/
│   │   └── generateData.ts
│   ├── types/
│   │   └── data.ts
│   ├── utils/
│   ├── workers/
│   │   └── dataWorker.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── package.json
├── index.html
└── README.md
