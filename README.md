# Competence & Training Matrix

A responsive competence and training management page built as a standalone prototype for a Model-Driven App experience.

## Run

Open `index.html` in a modern browser. No build step or package installation is required.

## Prototype data

This repository did not contain an application shell, Dataverse schema, or existing data-access layer. The page therefore uses clearly labelled sample projects and records, with edits saved to this browser's `localStorage`. It does not connect to Dataverse. The data access and persistence functions in `app.js` are isolated so they can be replaced with the host application's Dataverse integration when its table schema and environment are available. Status values are represented by a fixed choice list in the prototype.

The page includes project-scoped summaries and filters, a frozen employee column in the horizontally scrollable matrix, editable status/date/evidence records, employee and requirement detail drawers, centered add/edit dialogs, and a sortable outstanding-training view with CSV export.
