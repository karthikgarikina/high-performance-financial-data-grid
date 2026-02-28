# High-Performance Financial Data Grid

## 🚀 Project Overview

This project implements a high-performance virtualized data grid capable
of rendering **1,000,000 financial transaction rows** efficiently
without performance degradation.

It demonstrates:

-   Manual virtualization (no third-party virtualization libraries)
-   DOM performance optimization
-   Large-scale state management
-   Sorting and filtering on 1M rows
-   Row selection (single + multi)
-   Cell editing
-   Column pinning
-   Real-time debug performance panel
-   Full Docker containerization

------------------------------------------------------------------------

## 🏗 Tech Stack

-   React + Vite + TypeScript
-   Manual Virtualization (custom implementation)
-   Node.js (data generation script)
-   Docker + Docker Compose
-   Nginx (production static serving)


------------------------------------------------------------------------

## 📦 Project Structure

    High-Performance Financial Data/
    └── frontend/
        ├── public/
        │   └── transactions.json (will generate)
        ├── scripts/
        │   └── generate-data.cjs
        ├── src/
        │   └── components/
        │       └── DataGrid.tsx
        ├── Dockerfile
        ├── docker-compose.yml
        └── package.json

------------------------------------------------------------------------

# 🔥 Running The Project (Docker Only)

## Step 1 -- Clone repository

    git clone https://github.com/karthikgarikina/high-performance-financial-data-grid

## Step 2 -- Navigate to project root

    cd high-performance-financial-data-grid

## Step 3 -- Navigate to frontend

    cd frontend

## Step 4 -- Build and run

    docker compose up --build

This will:

1.  Install dependencies
2.  Generate 1,000,000 transaction records
3.  Build the Vite app
4.  Serve via Nginx
5.  Expose on port 8080

### Access Application:

    http://localhost:8080

------------------------------------------------------------------------

# 📊 Core Features Implemented

## 1️⃣ Virtualization (Manual Implementation)

-   Only visible rows rendered
-   DOM row count always \< 100
-   GPU-accelerated `transform: translateY()` positioning
-   Buffered rendering for smooth scroll

## 2️⃣ Debug Panel

Displays:

-   FPS
-   Rendered row count
-   Current scroll position

## 3️⃣ Sorting

-   Click column headers
-   Full dataset sorting
-   Toggle ASC / DESC
-   Works on 1,000,000 rows

## 4️⃣ Filtering

-   Merchant text filter
-   Case insensitive
-   Debounced input
-   Live result counter

## 5️⃣ Quick Status Filters

Buttons: - Completed - Pending

Filters entire dataset instantly.

## 6️⃣ Row Selection

-   Single click selection
-   Ctrl/Cmd multi-select
-   `data-selected="true"` attribute applied

## 7️⃣ Cell Editing

-   Double-click any cell
-   Inline input editing
-   Updates underlying dataset

## 8️⃣ Column Pinning

-   Toggle pin on ID column
-   Sticky positioning applied dynamically
-   Adds `pinned-column` class

------------------------------------------------------------------------

# ⚡ Performance Design Decisions

-   No virtualization libraries used
-   requestAnimationFrame for scroll updates
-   Debounced filtering
-   In-memory dataset handling
-   Efficient slicing logic

------------------------------------------------------------------------

# 🐳 Docker Details

-   Multi-stage build
-   Node builder stage
-   Nginx production serving
-   Healthcheck enabled
-   Accessible via port 8080

------------------------------------------------------------------------

# 📌 Submission Compliance Checklist

✔ Dockerized and runnable via single command\
✔ 1,000,000 dataset generation script\
✔ Virtualized grid rendering\
✔ DOM row count under 100\
✔ Debug performance panel\
✔ Sorting\
✔ Filtering\
✔ Quick filters\
✔ Row selection (single + multi)\
✔ Cell editing\
✔ Column pinning\
✔ All required data-test-id attributes present

------------------------------------------------------------------------

## 🎥 Video Demo

https://youtu.be/aXg3i-SYG6U

------------------------------------------------------------------------

# 🏁 Final Notes

This project is built to demonstrate enterprise-level frontend
performance engineering practices similar to:

-   Financial dashboards
-   Trading terminals
-   Analytics platforms
-   Spreadsheet-like interfaces

The focus is performance, scalability, and production-grade
architecture.

------------------------------------------------------------------------
