# Lineup Maker (축구 라인업 자동 생성기)

Lineup Maker is a mobile-friendly web application designed to automate and simplify squad allocation for soccer clubs. By automatically distributing players fairly across quarters and allowing intuitive drag-and-drop manual adjustments, organizers can ensure everyone gets equitable playtime without the hassle.

## Features

- **CSV Roster Upload**: Easily import players using `2026명단.csv` formats (powered by PapaParse).
- **Quarter Availability**: Players can selectively declare which quarters (1Q ~ 4Q) they are available for.
- **Fair Auto-Generation Algorithm**:
  - Distributes total play counts fairly to minimize the difference in playtime (max difference of 1).
  - Handles Goalkeeper (GK) scarcity by automatically drafting field players into GK as needed, without unfair duplication.
  - Balances teams based on skill level (Low, Medium, High).
  - Supports a dedicated **Elite Quarter (2Q)** prioritizing "High" skill players.
- **Drag-and-Drop Pitch UI**: Visually swap active players and substitutes smoothly using modern drag-and-drop gestures optimized for mobile.
- **Export & Share**: Share the generated lineup easily via text payload or download it as an image.

## Tech Stack

- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Interactions**: `@dnd-kit/core` (Drag and Drop)
- **Data Parsing**: `papaparse` (CSV processing)

## Prerequisites

- [Conda](https://docs.conda.io/en/latest/miniconda.html) (Recommended for environment isolation)
- [Node.js](https://nodejs.org/) (v20)
- npm (Node Package Manager)

## Setup & Local Development Environment

1. **Clone the repository** (if applicable):
   ```bash
   git clone <your-repo-url>
   cd lineupmaker
   ```

2. **Create a Conda environment** (Ensures isolated Node.js version 20):
   ```bash
   conda create -n lineupmaker nodejs=20
   ```

3. **Activate the Conda environment**:
   ```bash
   conda activate lineupmaker
   ```

4. **Install library dependencies**:
   ```bash
   npm install
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **View the application**:
   Open a web browser and navigate to `http://localhost:3000`.

## License
MIT License
