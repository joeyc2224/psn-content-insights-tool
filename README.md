# PSN Content Performance Dashboard


A lightweight internal analytics dashboard for analysing cycling content performance. It surfaces key video metrics and trends in a clear, interactive UI for non-technical users.

<img width="80%" alt="image" src="https://github.com/user-attachments/assets/bddca4e6-dcad-4cd7-97cc-ebf7676b0848" />

## Installation
### Prerequisites
- Node.js (LTS): https://nodejs.org/en/download

### Run locally
1. Clone the repository to your machine.
2. From the repository root, open a terminal and run:
```
npm install
npm run dev
```
3. Open the web app at http://localhost:5173

## What I built

I built a lightweight internal data dashboard that allows non-technical users to explore how PSN content is performing, without needing to rely on a full BI tool.

From the outset, I kept the brief in mind around creating a purpose-built interface that answers a small number of common questions quickly. I experimented with different layouts, charts, and metrics to find a balance between useful insight and simplicity, focusing on clarity rather than packing in as much data as possible.

The application is split into two main views:
- **Insights**, which provides a high-level overview of performance using key metrics and visualisations to highlight trends
- **Data**, which exposes a more detailed, sortable table of individual videos for users who want to dig into the raw numbers

Key features include:
- High-level KPI metrics to give an immediate snapshot of overall performance ([`KpiBar.tsx`](frontend/src/components/KpiBar.tsx))
- Charts showing differences between video types and channels ([`ViewsByChannelChart.tsx`](frontend/src/components/ViewsByChannelChart.tsx))
- An interactive time-series area chart showing views over time, split by video type ([`ViewsOverTimeChart.tsx`](frontend/src/components/ViewsOverTimeChart.tsx))
- A sortable and filterable video table to identify top-performing content ([`pages/Data.tsx`](frontend/src/pages/Data.tsx))
- Filters for channel, video type, and date range, with sensible last-30-days defaults applied ([`layouts/AppLayout.tsx`](frontend/src/layouts/AppLayout.tsx))
- Clickable table rows that open a modal with more detailed video information, including daily views and a direct link to the video on YouTube ([`VideoModal.tsx`](frontend/src/components/VideoModal.tsx))

The interactions are intentionally familiar, mirroring what a Looker Studio user might expect, while keeping the interface focused and easy to use.

The Insights page is structured in a modular way, with self-contained components, so additional charts or metrics can be added over time without disrupting the existing layout. All filters and breakdowns are driven directly from the data in the database rather than hard-coded values, meaning new channels or video types will automatically appear without requiring additional development work.

The frontend is built with React and Vite ([`/frontend`](frontend)), with a simple Node.js API ([`/api`](api)) providing the data and running SQL queries against a local SQLite database. The database is created automatically on start-up using the existing SQL schema (see [`bootstrapDb.js`](api/lib/bootstrapDb.js)). 

## SQL queries

The SQL queries used for data exploration can be found in [`sql/queries.sql`](sql/queries.sql).

They cover:
- Total views per video
- Video views by video type over time
- Top 5 videos by views in the past 28 days

## AI & Tooling Reflection
I used OpenAI Codex via the command line during development, which allowed it to work directly within the project files and helped speed up iteration and testing. I mainly used it to quickly scaffold parts of the React UI while experimenting, and to check the wiring and responses between API endpoints and the frontend.

I used Codex as a productivity aid rather than a replacement for writing and reasoning about the code. All generated code was reviewed and adapted manually, and nothing was used without fully understanding how it worked. All content and UI decisions were made by me over several iterations, with Codex used to support experimentation rather than drive the solution.

## Things I’d improve with more time
In a future iteration of the dashboard, I’d like to add more context to the views-over-time chart by plotting when videos were published, with interactive hover states to show which pieces of content may have driven spikes in views.

With more time, I would focus on improving the depth and context of the insights available in the dashboard. In particular, I would add the ability to compare performance across different time periods (for example, against the previous 30 days) and provide clearer indicators of change, such as percentage differences on key metrics.
