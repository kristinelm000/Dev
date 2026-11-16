# Competence & Training Matrix

A responsive Model-Driven App page prototype for digitizing the project competence and training workbooks. Open `index.html` in a browser to explore the sample matrix, filters, status editor, employee and requirement detail panels, outstanding-training view, add dialogs, and CSV export.

The sample data is shaped around the attached workbooks: discipline-grouped project members, procedure/training columns, and cells representing required items or completed dates. The UI starts in **Demo data** mode; edits in demo mode are held in memory for the current page session.

For a Model-Driven App HTML web resource, publish the HTML, CSS, JavaScript, and configuration script as solution web resources, and replace the relative `styles.css` / `app.js` paths in `index.html` with the corresponding resource URLs in that solution.

## Dataverse connection

The page uses `Xrm.WebApi` when it runs inside a Model-Driven App and a `window.CTM_CONFIG` schema mapping is supplied. The actual Dataverse table and column logical names and Choice integers are environment-specific, so configure them from the target environment rather than using the sample values below. Add the configuration script before `app.js` in `index.html` (or inline it there):

```js
window.CTM_CONFIG = {
  entities: {
    projects: "publisher_project",
    projectsSet: "publisher_projects",
    employees: "publisher_projectmember",
    employeesSet: "publisher_projectmembers",
    requirements: "publisher_trainingrequirement",
    requirementsSet: "publisher_trainingrequirements",
    records: "publisher_competencerecord"
  },
  fields: {
    projects: { id: "publisher_projectid", name: "publisher_name", code: "publisher_projectcode", reference: "publisher_documentreference", stage: "publisher_stage" },
    employees: { id: "publisher_projectmemberid", name: "publisher_name", role: "publisher_role", discipline: "publisher_discipline", active: "publisher_projectactive" },
    requirements: { id: "publisher_trainingrequirementid", name: "publisher_name", category: "publisher_category", description: "publisher_description", mandatory: "publisher_mandatory", disciplines: "publisher_applicabledisciplines" },
    records: { id: "publisher_competencerecordid", status: "publisher_status", completionDate: "publisher_completiondate", plannedDate: "publisher_planneddate", responsible: "publisher_responsibleperson", comments: "publisher_comments", evidence: "publisher_evidencereference" }
  },
  lookups: {
    recordProject: { value: "_publisher_project_value", bind: "publisher_Project" },
    employee: { value: "_publisher_projectmember_value", bind: "publisher_ProjectMember" },
    requirement: { value: "_publisher_trainingrequirement_value", bind: "publisher_TrainingRequirement" },
    employeeProject: { bind: "publisher_Project" },
    requirementProject: { bind: "publisher_Project" }
  },
  statuses: {
    toDataverse: { completed: 100000000, required: 100000001, planned: 100000002, notApplicable: 100000003, exempt: 100000004 },
    fromDataverse: {
      100000000: "completed", 100000001: "required", 100000002: "planned",
      100000003: "notApplicable", 100000004: "exempt"
    }
  }
};
```

Replace **every** `publisher_*` name and example Choice integer with the real schema values. The `bind` properties are Dataverse navigation property names (without `@odata.bind`); `value` properties are the corresponding Web API lookup value names. `entities.*Set` values are the entity-set collection names used in lookup bindings. Choice values must map to the five statuses in `app.js`. `applicableDisciplines` is stored as a semicolon-separated text value by this page; adapt the mapping if the Dataverse column uses another representation. Ensure the app user has read, create, and update privileges for the mapped tables.

This prototype reads the mapped project, employee, requirement, and competence-record tables, and saves status and date edits through `Xrm.WebApi`. It expects project, employee, and requirement lookups on each competence record; project lookups on employee and requirement records are optional. Confirm those relationships and table ownership with the Dataverse solution before publishing.
