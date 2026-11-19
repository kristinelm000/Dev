# Competence & Training Matrix

A responsive project workspace prototype with a Competence & Training Matrix and a Project Assurance & Control Plan.

## Run

Open `index.html` or `assurance.html` in a modern browser. No build step or package installation is required.

## Competence matrix prototype

The competence page uses sample projects and records saved to this browser's `localStorage`; it is not connected to Dataverse.

## Assurance plan

The assurance page requires the Project Portal model-driven app so it can use the host `Xrm.WebApi` and current project context. It reads and writes the existing `cr952_projectactivity` table and its related Project, Person, Organisation, Discipline, and Activity Reference records. Choice values are read from Dataverse metadata at runtime. It does not seed, cache, or persist Project Activity data in browser storage, and it does not create Dataverse tables.

Opening `assurance.html` outside the model-driven app displays a connection notice instead of sample or local data.

When mapping rows from the Cuvette and Havsule workbooks, phase-tab names can be matched to the existing Project Phase Choice; activity titles, area headings, responsibility, focus/scope/objective, planned time, status, references and comments align with corresponding Project Activity fields. Responsible-party text can use an existing lookup only when it matches a Dataverse record; otherwise it belongs in the assignment text field. Workbook reason cells are often free text, while `cr952_reason` is a Choice, so only exact existing Choice labels are compatible. The page does not load workbook rows or create records; Dataverse remains its only runtime data source.
