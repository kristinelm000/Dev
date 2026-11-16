/* Demo records mirror the workbook structure; configure Dataverse before deployment. */
(function () {
  "use strict";

  const STATUS = {
    completed: { label: "Completed", className: "status-completed" },
    required: { label: "Outstanding", className: "status-required" },
    planned: { label: "Planned", className: "status-planned" },
    notApplicable: { label: "Not applicable", className: "status-na" },
    exempt: { label: "Exempt", className: "status-exempt" }
  };
  const projects = [
    { id: "ii01", code: "HBRN — II01", name: "Harbor North Redevelopment", reference: "II01-GA-HBRN-0001", stage: "Execution" },
    { id: "gg01", code: "HBRN — GG01", name: "Harbor North — Project Delivery", reference: "GG01-GA-HBRN-0001", stage: "Execution" }
  ];
  const requirements = [
    { id: "induction", name: "Project Induction Program", category: "Induction", description: "Introduction to the project, working practices and key contacts.", mandatory: true, disciplines: ["All"] },
    { id: "hse", name: "Project HSE Program", category: "HSES", description: "Project health, safety and environmental requirements.", mandatory: true, disciplines: ["All"] },
    { id: "quality", name: "Project Quality Plan (PQP)", category: "Quality", description: "Quality controls, assurance activities and project expectations.", mandatory: true, disciplines: ["All"] },
    { id: "pep", name: "Project Execution Plan (PEP)", category: "Project", description: "Project execution strategy, governance and delivery model.", mandatory: true, disciplines: ["All"] },
    { id: "pims", name: "PIMS R4 tool introduction", category: "Systems & tools", description: "Introduction to PIMS, including TQ, deviation, change and action workflows.", mandatory: true, disciplines: ["Project Management", "Commercial", "Quality", "Project Control & Economics", "DCC & LCI"] },
    { id: "interface", name: "PIMS Interface Management", category: "Systems & tools", description: "Using PIMS to manage project interfaces and their deliverables.", mandatory: true, disciplines: ["Project Management", "Facility", "Interface", "Project Control & Economics"] },
    { id: "inspection", name: "HSE Inspection Course", category: "HSES", description: "Practical project inspection course for personnel with inspection duties.", mandatory: false, disciplines: ["HSES", "Quality", "Facility", "Commissioning"] },
    { id: "proarc", name: "ProArc Document Management", category: "Systems & tools", description: "Document control and retrieval in the project management system.", mandatory: true, disciplines: ["All"] },
    { id: "procurement", name: "Procurement process — Company Representative", category: "Procurement", description: "Procurement process and representative responsibilities.", mandatory: false, disciplines: ["Procurement", "Commercial", "Facility"] },
    { id: "commissioning", name: "Commissioning readiness", category: "Operations", description: "Readiness activities and handover requirements for commissioning.", mandatory: true, disciplines: ["Commissioning", "Operations"] }
  ];
  const employees = [
    { id: "e01", name: "Rikke Tittel", role: "Project Manager", discipline: "Project Management", active: true },
    { id: "e02", name: "Anita Albriktsen", role: "Deputy Project Manager", discipline: "Project Management", active: true },
    { id: "e03", name: "Tina Meling", role: "Commercial Manager", discipline: "Commercial", active: true },
    { id: "e04", name: "Jan O. Leskovsky", role: "HSES Lead", discipline: "HSES", active: false },
    { id: "e05", name: "Jorun Holme", role: "Quality Manager", discipline: "Quality", active: true },
    { id: "e06", name: "Ole Dolven", role: "Technical Safety", discipline: "Facility", active: true },
    { id: "e07", name: "Mubinul Islam", role: "TMI Engineer", discipline: "Facility", active: true },
    { id: "e08", name: "Carla M. Zambrano", role: "Cost Controller", discipline: "Project Control & Economics", active: true },
    { id: "e09", name: "Mari Askeland", role: "Integrated Planner", discipline: "Project Control & Economics", active: true },
    { id: "e10", name: "Ingrid Ullestad", role: "DCC / LCI Lead", discipline: "DCC & LCI", active: true },
    { id: "e11", name: "Reinert Hansson", role: "SURF Lead", discipline: "Subsurface", active: true },
    { id: "e12", name: "Ole Wiig", role: "Supply Chain", discipline: "Procurement", active: true },
    { id: "e13", name: "Ove Helland", role: "Commissioning Manager", discipline: "Commissioning", active: true },
    { id: "e14", name: "Håvard Bø", role: "Interface Engineer", discipline: "Interface", active: true },
    { id: "e15", name: "Martijn Kragtwijk", role: "Project Engineer", discipline: "Project Management", active: true },
    { id: "e16", name: "TBA — Project Admin", role: "Project Administrator", discipline: "Project Management", active: true },
    { id: "e17", name: "Rafael Pacheco-Retana", role: "Operations Representative", discipline: "Operations", active: true },
    { id: "e18", name: "Angunn Øvrebø", role: "Document Controller", discipline: "DCC & LCI", active: true }
  ];

  const seed = [
    ["e01","induction","completed","2026-09-11"],["e01","hse","completed","2026-09-12"],["e01","quality","completed","2026-09-13"],["e01","pep","completed","2026-09-10"],["e01","pims","completed","2026-09-20"],["e01","interface","completed","2026-09-22"],["e01","inspection","notApplicable"],["e01","proarc","completed","2026-09-18"],["e01","procurement","notApplicable"],["e01","commissioning","notApplicable"],
    ["e02","induction","completed","2026-09-12"],["e02","hse","completed","2026-09-13"],["e02","quality","completed","2026-09-14"],["e02","pep","completed","2026-09-11"],["e02","pims","planned","2026-11-18"],["e02","interface","completed","2026-09-21"],["e02","inspection","notApplicable"],["e02","proarc","completed","2026-09-19"],["e02","procurement","notApplicable"],["e02","commissioning","notApplicable"],
    ["e03","induction","completed","2026-10-02"],["e03","hse","required"],["e03","quality","notApplicable"],["e03","pep","completed","2026-10-03"],["e03","pims","required"],["e03","interface","notApplicable"],["e03","inspection","notApplicable"],["e03","proarc","completed","2026-10-05"],["e03","procurement","planned","2026-11-27"],["e03","commissioning","notApplicable"],
    ["e04","induction","completed","2026-08-19"],["e04","hse","completed","2026-08-20"],["e04","quality","completed","2026-08-21"],["e04","pep","completed","2026-08-22"],["e04","pims","required"],["e04","interface","notApplicable"],["e04","inspection","planned","2026-11-14"],["e04","proarc","completed","2026-08-25"],["e04","procurement","notApplicable"],["e04","commissioning","notApplicable"],
    ["e05","induction","completed","2026-09-03"],["e05","hse","completed","2026-09-05"],["e05","quality","completed","2026-09-04"],["e05","pep","completed","2026-09-08"],["e05","pims","completed","2026-09-16"],["e05","interface","notApplicable"],["e05","inspection","required"],["e05","proarc","completed","2026-09-09"],["e05","procurement","notApplicable"],["e05","commissioning","notApplicable"],
    ["e06","induction","completed","2026-10-01"],["e06","hse","completed","2026-10-02"],["e06","quality","planned","2026-11-21"],["e06","pep","completed","2026-10-03"],["e06","pims","required"],["e06","interface","completed","2026-10-11"],["e06","inspection","completed","2026-10-15"],["e06","proarc","completed","2026-10-04"],["e06","procurement","completed","2026-10-17"],["e06","commissioning","notApplicable"],
    ["e07","induction","completed","2026-10-08"],["e07","hse","completed","2026-10-09"],["e07","quality","required"],["e07","pep","completed","2026-10-12"],["e07","pims","required"],["e07","interface","completed","2026-10-15"],["e07","inspection","required"],["e07","proarc","completed","2026-10-14"],["e07","procurement","notApplicable"],["e07","commissioning","notApplicable"],
    ["e08","induction","completed","2026-09-23"],["e08","hse","completed","2026-09-25"],["e08","quality","notApplicable"],["e08","pep","completed","2026-09-27"],["e08","pims","completed","2026-10-02"],["e08","interface","notApplicable"],["e08","inspection","notApplicable"],["e08","proarc","completed","2026-10-01"],["e08","procurement","notApplicable"],["e08","commissioning","notApplicable"],
    ["e09","induction","completed","2026-10-05"],["e09","hse","completed","2026-10-06"],["e09","quality","notApplicable"],["e09","pep","completed","2026-10-07"],["e09","pims","planned","2026-11-22"],["e09","interface","completed","2026-10-12"],["e09","inspection","notApplicable"],["e09","proarc","completed","2026-10-11"],["e09","procurement","notApplicable"],["e09","commissioning","notApplicable"],
    ["e10","induction","completed","2026-08-11"],["e10","hse","completed","2026-08-12"],["e10","quality","completed","2026-08-13"],["e10","pep","completed","2026-08-15"],["e10","pims","completed","2026-08-20"],["e10","interface","completed","2026-08-21"],["e10","inspection","exempt"],["e10","proarc","completed","2026-08-17"],["e10","procurement","notApplicable"],["e10","commissioning","notApplicable"],
    ["e11","induction","completed","2026-09-01"],["e11","hse","required"],["e11","quality","notApplicable"],["e11","pep","completed","2026-09-03"],["e11","pims","required"],["e11","interface","required"],["e11","inspection","notApplicable"],["e11","proarc","completed","2026-09-05"],["e11","procurement","notApplicable"],["e11","commissioning","notApplicable"],
    ["e12","induction","completed","2026-08-27"],["e12","hse","completed","2026-08-28"],["e12","quality","notApplicable"],["e12","pep","required"],["e12","pims","notApplicable"],["e12","interface","notApplicable"],["e12","inspection","notApplicable"],["e12","proarc","completed","2026-08-30"],["e12","procurement","completed","2026-09-02"],["e12","commissioning","notApplicable"],
    ["e13","induction","completed","2026-07-14"],["e13","hse","completed","2026-07-15"],["e13","quality","completed","2026-07-16"],["e13","pep","completed","2026-07-18"],["e13","pims","notApplicable"],["e13","interface","completed","2026-07-22"],["e13","inspection","completed","2026-07-24"],["e13","proarc","completed","2026-07-20"],["e13","procurement","notApplicable"],["e13","commissioning","planned","2026-12-01"],
    ["e14","induction","completed","2026-10-10"],["e14","hse","completed","2026-10-11"],["e14","quality","notApplicable"],["e14","pep","completed","2026-10-12"],["e14","pims","required"],["e14","interface","planned","2026-11-20"],["e14","inspection","notApplicable"],["e14","proarc","completed","2026-10-14"],["e14","procurement","notApplicable"],["e14","commissioning","notApplicable"],
    ["e15","induction","completed","2026-09-19"],["e15","hse","completed","2026-09-20"],["e15","quality","completed","2026-09-23"],["e15","pep","completed","2026-09-21"],["e15","pims","completed","2026-09-24"],["e15","interface","completed","2026-09-25"],["e15","inspection","notApplicable"],["e15","proarc","completed","2026-09-26"],["e15","procurement","notApplicable"],["e15","commissioning","notApplicable"],
    ["e16","induction","required"],["e16","hse","required"],["e16","quality","notApplicable"],["e16","pep","required"],["e16","pims","required"],["e16","interface","notApplicable"],["e16","inspection","notApplicable"],["e16","proarc","planned","2026-11-03"],["e16","procurement","notApplicable"],["e16","commissioning","notApplicable"],
    ["e17","induction","completed","2026-10-04"],["e17","hse","completed","2026-10-05"],["e17","quality","notApplicable"],["e17","pep","completed","2026-10-06"],["e17","pims","notApplicable"],["e17","interface","notApplicable"],["e17","inspection","notApplicable"],["e17","proarc","completed","2026-10-08"],["e17","procurement","notApplicable"],["e17","commissioning","required"],
    ["e18","induction","completed","2026-08-05"],["e18","hse","completed","2026-08-06"],["e18","quality","completed","2026-08-08"],["e18","pep","completed","2026-08-09"],["e18","pims","completed","2026-08-12"],["e18","interface","completed","2026-08-13"],["e18","inspection","exempt"],["e18","proarc","completed","2026-08-10"],["e18","procurement","notApplicable"],["e18","commissioning","notApplicable"]
  ];
  let records = seed.map((item, index) => ({
    id: "r" + (index + 1), projectId: "ii01", employeeId: item[0], requirementId: item[1], status: item[2],
    completionDate: item[2] === "completed" ? item[3] || "" : "", plannedDate: item[2] === "planned" ? item[3] || item[4] || "" : "",
    responsible: "", comments: "", evidence: ""
  }));
  records = records.concat(seed.slice(0, 90).map((item, index) => ({
    id: "g" + (index + 1), projectId: "gg01", employeeId: item[0], requirementId: item[1], status: item[2],
    completionDate: item[2] === "completed" ? item[3] || "" : "", plannedDate: item[2] === "planned" ? item[3] || item[4] || "" : "",
    responsible: "", comments: "", evidence: ""
  })));

  const config = window.CTM_CONFIG || null;
  const state = {
    projectId: "ii01",
    tab: "matrix",
    sort: { key: "plannedDate", direction: 1 },
    employees: employees.slice(),
    requirements: requirements.slice(),
    records: records.slice(),
    projects: projects.slice(),
    provider: null,
    modal: null,
    lastFocus: null
  };
  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));
  const cleanId = value => String(value || "").replace(/[{}]/g, "").toLowerCase();
  const escapeHtml = value => String(value == null ? "" : value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const getProject = () => state.projects.find(item => item.id === state.projectId) || state.projects[0];
  const getEmployee = id => state.employees.find(item => item.id === id);
  const getRequirement = id => state.requirements.find(item => item.id === id);
  const statusOf = status => STATUS[status] || STATUS.required;
  const isOutstanding = status => status === "required" || status === "planned";
  const requirementApplies = (requirement, employee) => !requirement.disciplines || requirement.disciplines.includes("All") || requirement.disciplines.includes(employee.discipline);
  const recordFor = (employeeId, requirementId) => state.records.find(item => item.projectId === state.projectId && item.employeeId === employeeId && item.requirementId === requirementId);
  const currentEmployees = () => state.employees.filter(employee => state.records.some(record => record.projectId === state.projectId && record.employeeId === employee.id));
  const activeEmployees = () => currentEmployees().filter(employee => employee.active);
  const currentRequirements = () => state.requirements.filter(requirement => state.records.some(record => record.projectId === state.projectId && record.requirementId === requirement.id));

  function initials(name) {
    return String(name || "").split(/[\s—-]+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  }
  function avatar(name, index) {
    return '<span class="person-avatar tone-' + (index % 5) + '">' + escapeHtml(initials(name)) + '</span>';
  }
  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value + "T12:00:00");
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  }
  function allProjectRecords() {
    return state.records.filter(record => record.projectId === state.projectId);
  }
  function updateHeader() {
    const project = getProject();
    $("#project-name").textContent = project.name;
    $("#document-reference").textContent = project.reference;
    $("#breadcrumb-project").textContent = project.code;
    $(".project-stage").innerHTML = '<span class="stage-dot"></span> ' + escapeHtml(project.stage || "Execution");
    const projectSelect = $("#project-select");
    projectSelect.innerHTML = state.projects.map(item => '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.code) + '</option>').join("");
    projectSelect.value = project.id;
  }
  function updateSummary() {
    const members = currentEmployees();
    const reqRecords = allProjectRecords().filter(record => {
      const requirement = getRequirement(record.requirementId);
      const employee = getEmployee(record.employeeId);
      return requirement && employee && employee.active && requirementApplies(requirement, employee) && record.status !== "notApplicable" && record.status !== "exempt";
    });
    const completed = reqRecords.filter(item => item.status === "completed").length;
    const outstanding = reqRecords.filter(item => isOutstanding(item.status)).length;
    const percent = reqRecords.length ? Math.round(completed / reqRecords.length * 100) : 0;
    $("#member-count").textContent = members.length;
    $("#requirement-count").textContent = currentRequirements().length;
    $("#completed-count").textContent = completed;
    $("#outstanding-count").textContent = outstanding;
    $("#completion-label").textContent = percent + "%";
    $("#completion-ring-label").textContent = percent + "%";
    $("#progress-ring").style.setProperty("--progress", percent + "%");
    $("#outstanding-tab-count").textContent = outstanding;
    $("#last-updated").textContent = state.lastUpdated || new Date().toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  function populateFilters() {
    const disciplines = Array.from(new Set(currentEmployees().map(person => person.discipline))).sort((a, b) => a.localeCompare(b));
    const disciplineSelects = [$("#discipline-filter"), $("#outstanding-discipline-filter")];
    disciplineSelects.forEach(select => {
      const previous = select.value;
      select.innerHTML = '<option value="">All disciplines</option>' + disciplines.map(value => '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>').join("");
      if (disciplines.includes(previous)) select.value = previous;
    });
    const reqSelect = $("#requirement-filter");
    const previousRequirement = reqSelect.value;
    reqSelect.innerHTML = '<option value="">All requirements</option>' + currentRequirements().map(item => '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + '</option>').join("");
    if (currentRequirements().some(item => item.id === previousRequirement)) reqSelect.value = previousRequirement;
  }
  function matrixSelection() {
    const query = $("#search-input").value.trim().toLocaleLowerCase();
    const discipline = $("#discipline-filter").value;
    const requirementId = $("#requirement-filter").value;
    const status = $("#status-filter").value;
    const outstandingOnly = $("#outstanding-only").checked;
    const baseRequirements = currentRequirements().filter(req => !requirementId || req.id === requirementId);
    const matchingRequirements = query ? baseRequirements.filter(req => (req.name + " " + req.category).toLocaleLowerCase().includes(query)) : [];
    const searchMatchesRequirement = matchingRequirements.length > 0;
    const reqList = searchMatchesRequirement ? matchingRequirements : baseRequirements;
    const people = currentEmployees().filter(person => {
      if (discipline && person.discipline !== discipline) return false;
      if (query && !searchMatchesRequirement && ![person.name, person.role, person.discipline].some(value => value.toLocaleLowerCase().includes(query))) return false;
      return true;
    });
    const requirementsVisible = reqList.filter(req => people.some(person => {
      const record = recordFor(person.id, req.id);
      if (!record || !requirementApplies(req, person)) return false;
      if (outstandingOnly && !isOutstanding(record.status)) return false;
      return !status || record.status === status;
    }));
    const visiblePeople = people.filter(person => requirementsVisible.some(req => {
      const record = recordFor(person.id, req.id);
      return record && requirementApplies(req, person) && (!outstandingOnly || isOutstanding(record.status)) && (!status || record.status === status);
    }));
    return { people: visiblePeople, requirements: requirementsVisible };
  }
  function renderMatrix() {
    const selected = matrixSelection();
    const table = $("#matrix-table");
    const thead = $("thead", table);
    const tbody = $("tbody", table);
    $("#matrix-count").textContent = selected.people.length + (selected.people.length === 1 ? " member" : " members");
    $("#matrix-empty").classList.toggle("hidden", selected.people.length > 0 && selected.requirements.length > 0);
    $("#matrix-viewport").classList.toggle("hidden", selected.people.length === 0 || selected.requirements.length === 0);
    if (!selected.people.length || !selected.requirements.length) {
      thead.innerHTML = "";
      tbody.innerHTML = "";
      return;
    }
    thead.innerHTML = '<tr><th class="person-col"><span>PROJECT MEMBER</span>Employee / role</th>' + selected.requirements.map(req =>
      '<th class="req-col"><button type="button" data-requirement="' + escapeHtml(req.id) + '" aria-label="View ' + escapeHtml(req.name) + ' details"><span class="req-name">' + escapeHtml(req.name) + '</span><span class="req-category">' + escapeHtml(req.category) + '</span></button></th>'
    ).join("") + '</tr>';
    const groups = new Map();
    selected.people.forEach(person => {
      if (!groups.has(person.discipline)) groups.set(person.discipline, []);
      groups.get(person.discipline).push(person);
    });
    const orderedGroups = Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    let avatarIndex = 0;
    tbody.innerHTML = orderedGroups.map(([discipline, people]) => {
      const groupHeader = '<tr class="group-row"><th colspan="' + (selected.requirements.length + 1) + '"><span class="group-label">' + escapeHtml(discipline) + '</span><span class="group-total">' + people.length + '</span></th></tr>';
      const rows = people.map(person => {
        const index = avatarIndex++;
        const personCell = '<td class="person-cell"><div class="person-info">' + avatar(person.name, index) + '<div class="person-meta"><button class="person-name" type="button" data-employee="' + escapeHtml(person.id) + '">' + escapeHtml(person.name) + '</button><span class="person-role">' + (person.active ? "" : "Inactive · ") + escapeHtml(person.role) + '</span></div></div></td>';
        const cells = selected.requirements.map(req => {
          const record = recordFor(person.id, req.id);
          if (!record || !requirementApplies(req, person)) return '<td><span class="cell-empty" aria-label="Not applicable">—</span></td>';
          const statusInfo = statusOf(record.status);
          const date = record.status === "completed" ? record.completionDate : record.plannedDate;
          const dateMarkup = date ? '<span class="cell-date">' + escapeHtml(formatDate(date)) + '</span>' : "";
          return '<td><button class="cell-button" type="button" data-record="' + escapeHtml(record.id) + '" title="' + escapeHtml(statusInfo.label + (record.completionDate ? " · Completed " + formatDate(record.completionDate) : record.plannedDate ? " · Planned " + formatDate(record.plannedDate) : "")) + '"><span class="cell-pill ' + statusInfo.className + '">' + escapeHtml(statusInfo.label) + '</span>' + dateMarkup + '</button></td>';
        }).join("");
        return '<tr>' + personCell + cells + '</tr>';
      }).join("");
      return groupHeader + rows;
    }).join("");
    $$("[data-employee]", tbody).forEach(button => button.addEventListener("click", () => openEmployee(button.dataset.employee)));
    $$("[data-record]", tbody).forEach(button => button.addEventListener("click", () => openRecord(button.dataset.record)));
    $$("[data-requirement]", thead).forEach(button => button.addEventListener("click", () => openRequirement(button.dataset.requirement)));
  }

  function outstandingRows() {
    const query = $("#outstanding-search").value.trim().toLocaleLowerCase();
    const discipline = $("#outstanding-discipline-filter").value;
    const status = $("#outstanding-status-filter").value;
    return allProjectRecords().filter(record => isOutstanding(record.status)).map(record => {
      const employee = getEmployee(record.employeeId);
      const requirement = getRequirement(record.requirementId);
      return employee && requirement ? { record, employee, requirement } : null;
    }).filter(row => {
      if (!row || !row.employee.active || !requirementApplies(row.requirement, row.employee)) return false;
      if (discipline && row.employee.discipline !== discipline) return false;
      if (status && row.record.status !== status) return false;
      if (query && ![row.employee.name, row.employee.discipline, row.requirement.name, row.record.responsible].some(value => String(value || "").toLocaleLowerCase().includes(query))) return false;
      return true;
    }).sort((a, b) => {
      const { key, direction } = state.sort;
      const value = row => key === "employee" ? row.employee.name : key === "discipline" ? row.employee.discipline : key === "requirement" ? row.requirement.name : key === "status" ? statusOf(row.record.status).label : key === "responsible" ? row.record.responsible : row.record.plannedDate || "9999";
      return String(value(a) || "").localeCompare(String(value(b) || ""), undefined, { numeric: true }) * direction;
    });
  }
  function renderOutstanding() {
    const rows = outstandingRows();
    const tbody = $("#outstanding-table tbody");
    $("#outstanding-result-count").textContent = rows.length + (rows.length === 1 ? " result" : " results");
    $("#outstanding-empty").classList.toggle("hidden", rows.length > 0);
    tbody.innerHTML = rows.map((row, index) => {
      const { record, employee, requirement } = row;
      const overdue = record.plannedDate && record.plannedDate < todayISO();
      const status = statusOf(record.status);
      return '<tr><td><div class="table-person">' + avatar(employee.name, index) + '<button type="button" data-employee="' + escapeHtml(employee.id) + '">' + escapeHtml(employee.name) + '</button></div></td><td>' + escapeHtml(employee.discipline) + '</td><td><button class="requirement-link" type="button" data-requirement="' + escapeHtml(requirement.id) + '">' + escapeHtml(requirement.name) + '</button></td><td><span class="table-status ' + status.className + '">' + escapeHtml(status.label) + '</span></td><td class="' + (overdue ? "date-overdue" : "") + '">' + escapeHtml(formatDate(record.plannedDate)) + (overdue ? '<span class="overdue-flag">OVERDUE</span>' : "") + '</td><td>' + escapeHtml(record.responsible || "—") + '</td><td><button class="row-action" type="button" data-record="' + escapeHtml(record.id) + '" aria-label="Edit ' + escapeHtml(employee.name) + ' record">···</button></td></tr>';
    }).join("");
    $$("[data-employee]", tbody).forEach(button => button.addEventListener("click", () => openEmployee(button.dataset.employee)));
    $$("[data-requirement]", tbody).forEach(button => button.addEventListener("click", () => openRequirement(button.dataset.requirement)));
    $$("[data-record]", tbody).forEach(button => button.addEventListener("click", () => openRecord(button.dataset.record)));
  }
  function render() {
    updateHeader();
    updateSummary();
    populateFilters();
    renderMatrix();
    renderOutstanding();
    $("#matrix-view").classList.toggle("hidden", state.tab !== "matrix");
    $("#outstanding-view").classList.toggle("hidden", state.tab !== "outstanding");
    $("#matrix-tab").classList.toggle("active", state.tab === "matrix");
    $("#outstanding-tab").classList.toggle("active", state.tab === "outstanding");
    $("#matrix-tab").setAttribute("aria-selected", String(state.tab === "matrix"));
    $("#outstanding-tab").setAttribute("aria-selected", String(state.tab === "outstanding"));
  }

  function mapFromDataverse(row, entityName, cfg) {
    const fields = cfg.fields[entityName];
    const get = key => row[fields[key]];
    if (entityName === "projects") return { id: cleanId(row[fields.id]), name: get("name"), code: get("code") || get("name"), reference: get("reference") || "", stage: get("stage") || "Execution" };
    if (entityName === "employees") {
      const active = get("active");
      return {
        id: cleanId(row[fields.id]), name: get("name"), role: get("role") || "", discipline: get("discipline") || "Unassigned",
        active: active === undefined || active === null || active === true || active === 0 || active === "0"
      };
    }
    if (entityName === "requirements") {
      const applicable = get("disciplines");
      return {
        id: cleanId(row[fields.id]), name: get("name"), category: get("category") || "Training",
        description: get("description") || "", mandatory: get("mandatory") !== false,
        disciplines: Array.isArray(applicable) ? applicable : String(applicable || "All").split(";").map(value => value.trim()).filter(Boolean)
      };
    }
    const lookups = cfg.lookups;
    const mappedStatus = cfg.statuses.fromDataverse[get("status")];
    if (!mappedStatus) throw new Error("CTM_CONFIG is missing a mapping for a Dataverse status Choice value.");
    return {
      id: cleanId(row[fields.id]), projectId: cleanId(row[lookups.recordProject.value]), employeeId: cleanId(row[lookups.employee.value]),
      requirementId: cleanId(row[lookups.requirement.value]), status: mappedStatus,
      completionDate: String(get("completionDate") || "").slice(0, 10), plannedDate: String(get("plannedDate") || "").slice(0, 10),
      responsible: get("responsible") || "", comments: get("comments") || "", evidence: get("evidence") || ""
    };
  }
  function dataverseLookupFilter(field, id) {
    return "_"+field+"_value eq " + cleanId(id);
  }
  async function loadDataverse() {
    const cfg = config;
    const xrm = window.Xrm || (window.parent !== window ? window.parent.Xrm : null);
    if (!xrm || !xrm.WebApi || !cfg || !cfg.entities || !cfg.fields) return false;
    if (!cfg.statuses || !cfg.statuses.toDataverse || !cfg.statuses.fromDataverse || !cfg.lookups) throw new Error("CTM_CONFIG must include Dataverse lookup names and integer status Choice mappings.");
    const entities = cfg.entities;
    const retrieve = async (key, select) => {
      const result = await xrm.WebApi.retrieveMultipleRecords(entities[key], "?$select=" + select.join(","));
      return result.entities;
    };
    const projects = await retrieve("projects", Object.values(cfg.fields.projects));
    const employees = await retrieve("employees", Object.values(cfg.fields.employees));
    const reqs = await retrieve("requirements", Object.values(cfg.fields.requirements));
    const recordFields = cfg.fields.records;
    const recs = await retrieve("records", Object.values(recordFields).concat([cfg.lookups.recordProject.value, cfg.lookups.employee.value, cfg.lookups.requirement.value]));
    const mapper = (key, row) => mapFromDataverse(row, key, cfg);
    const mappedProjects = projects.map(row => mapper("projects", row));
    if (!mappedProjects.length) throw new Error("No project records were returned from Dataverse. Check the table mapping and access.");
    const mappedEmployees = employees.map(row => mapper("employees", row));
    const mappedRequirements = reqs.map(row => mapper("requirements", row));
    const mappedRecords = recs.map(row => mapper("records", row));
    state.projects = mappedProjects;
    state.employees = mappedEmployees;
    state.requirements = mappedRequirements;
    state.records = mappedRecords;
    state.projectId = state.projects[0] && state.projects[0].id;
    state.provider = {
      save: async record => {
        const project = state.projects.find(item => item.id === record.projectId);
        const employee = getEmployee(record.employeeId);
        const requirement = getRequirement(record.requirementId);
        const entity = entities.records;
        const fields = cfg.fields.records;
        const data = {};
        if (!Object.prototype.hasOwnProperty.call(cfg.statuses.toDataverse, record.status)) throw new Error("CTM_CONFIG is missing the Dataverse Choice value for this status.");
        data[fields.status] = cfg.statuses.toDataverse[record.status];
        data[fields.completionDate] = record.completionDate || null;
        data[fields.plannedDate] = record.plannedDate || null;
        data[fields.responsible] = record.responsible || null;
        data[fields.comments] = record.comments || null;
        data[fields.evidence] = record.evidence || null;
        const bind = (field, entityKey, item) => {
          if (item && cfg.entities[entityKey + "Set"]) data[field + "@odata.bind"] = "/" + cfg.entities[entityKey + "Set"] + "(" + cleanId(item.id) + ")";
        };
        bind(cfg.lookups.recordProject.bind, "projects", project);
        bind(cfg.lookups.employee.bind, "employees", employee);
        bind(cfg.lookups.requirement.bind, "requirements", requirement);
        const existing = state.records.some(item => item.id === record.id);
        if (existing) await xrm.WebApi.updateRecord(entity, record.id, data);
        else {
          const result = await xrm.WebApi.createRecord(entity, data);
          record.id = cleanId(result.id);
        }
      },
      add: async (key, data) => {
        const fields = cfg.fields[key];
        const payload = {};
        Object.keys(data).forEach(field => {
          if (fields[field]) payload[fields[field]] = field === "disciplines" && Array.isArray(data[field]) ? data[field].join("; ") : data[field];
        });
        const projectLookup = key === "employees" ? cfg.lookups.employeeProject : key === "requirements" ? cfg.lookups.requirementProject : null;
        if (projectLookup && data.projectId && entities.projectsSet) {
          payload[projectLookup.bind + "@odata.bind"] = "/" + entities.projectsSet + "(" + cleanId(data.projectId) + ")";
        }
        const created = await xrm.WebApi.createRecord(entities[key], payload);
        return cleanId(created.id);
      }
    };
    return true;
  }

  function openDialog({ title, eyebrow, description, fields, submitLabel, initial, onSave }) {
    state.lastFocus = document.activeElement;
    state.modal = { onSave, fields, initial: initial || {} };
    $("#dialog-title").textContent = title;
    $("#dialog-eyebrow").textContent = eyebrow || "PROJECT RECORD";
    $("#dialog-description").textContent = description || "";
    $("#dialog-save").textContent = submitLabel || "Save changes";
    $("#dialog-error").classList.add("hidden");
    $("#dialog-body").innerHTML = '<div class="form-grid">' + fields.map(field => renderField(field, state.modal.initial[field.name])).join("") + "</div>";
    $("#modal-backdrop").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    const first = $("input, select, textarea", $("#dialog-body"));
    if (first) first.focus();
  }
  function renderField(field, value) {
    const required = field.required ? ' <span class="required-mark">*</span>' : "";
    const label = '<label for="field-' + escapeHtml(field.name) + '">' + escapeHtml(field.label) + required + "</label>";
    let control = "";
    if (field.type === "select") {
      control = '<select id="field-' + escapeHtml(field.name) + '" name="' + escapeHtml(field.name) + '"' + (field.required ? " required" : "") + '><option value="">Select…</option>' + field.options.map(option => '<option value="' + escapeHtml(option.value) + '"' + (String(value || "") === String(option.value) ? " selected" : "") + ">" + escapeHtml(option.label) + "</option>").join("") + "</select>";
    } else if (field.type === "textarea") {
      control = '<textarea id="field-' + escapeHtml(field.name) + '" name="' + escapeHtml(field.name) + '" placeholder="' + escapeHtml(field.placeholder || "") + '">' + escapeHtml(value || "") + "</textarea>";
    } else {
      control = '<input id="field-' + escapeHtml(field.name) + '" name="' + escapeHtml(field.name) + '" type="' + escapeHtml(field.type || "text") + '" value="' + escapeHtml(value || "") + '" placeholder="' + escapeHtml(field.placeholder || "") + '"' + (field.required ? " required" : "") + ">";
    }
    const help = field.help ? '<small class="form-help">' + escapeHtml(field.help) + "</small>" : "";
    return '<div class="form-field ' + (field.full ? "full-width" : "") + '">' + label + control + help + "</div>";
  }
  function closeDialog() {
    $("#modal-backdrop").classList.add("hidden");
    document.body.style.overflow = "";
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
    state.modal = null;
  }
  async function onFormSubmit(event) {
    event.preventDefault();
    if (!state.modal) return;
    const formData = new FormData(event.currentTarget);
    const values = {};
    for (const [key, value] of formData.entries()) values[key] = String(value).trim();
    if (!event.currentTarget.reportValidity()) return;
    const saveButton = $("#dialog-save");
    saveButton.disabled = true;
    saveButton.textContent = "Saving…";
    $("#dialog-error").classList.add("hidden");
    try {
      await state.modal.onSave(values);
      closeDialog();
      render();
      showToast("Changes saved successfully.");
    } catch (error) {
      $("#dialog-error").textContent = error.message || "Unable to save this record. Please try again.";
      $("#dialog-error").classList.remove("hidden");
    } finally {
      saveButton.disabled = false;
      if (state.modal) saveButton.textContent = state.modal.submitLabel || "Save changes";
    }
  }
  function recordFields(record) {
    const employee = getEmployee(record.employeeId);
    const requirement = getRequirement(record.requirementId);
    const employeeOptions = activeEmployees().slice();
    if (employee && !employee.active) employeeOptions.push(employee);
    return [
      { name: "employeeId", label: "Employee", type: "select", required: true, options: employeeOptions.map(person => ({ value: person.id, label: person.name + " · " + person.discipline + (person.active ? "" : " · Inactive") })) },
      { name: "requirementId", label: "Training / competence requirement", type: "select", required: true, options: state.requirements.filter(req => !employee || requirementApplies(req, employee) || req.id === record.requirementId).map(req => ({ value: req.id, label: req.name })) },
      { name: "status", label: "Status", type: "select", required: true, options: Object.keys(STATUS).map(key => ({ value: key, label: STATUS[key].label })) },
      { name: "completionDate", label: "Completion date", type: "date" },
      { name: "plannedDate", label: "Planned date", type: "date" },
      { name: "responsible", label: "Responsible person", placeholder: "e.g. Alex Morgan" },
      { name: "comments", label: "Comments", type: "textarea", full: true, placeholder: "Add a note about this record…" },
      { name: "evidence", label: "Evidence / reference", full: true, placeholder: "Document name, link or reference number" }
    ];
  }
  function openRecord(recordId) {
    const record = state.records.find(item => item.id === recordId);
    if (!record) return;
    const employee = getEmployee(record.employeeId);
    const requirement = getRequirement(record.requirementId);
    openDialog({
      title: "Update competence record",
      eyebrow: "MATRIX RECORD",
      description: (employee ? employee.name : "Project member") + " · " + (requirement ? requirement.name : "Training requirement"),
      fields: recordFields(record),
      submitLabel: "Save changes",
      initial: record,
      onSave: async values => {
        const updated = Object.assign({}, record, values);
        const selectedEmployee = getEmployee(updated.employeeId);
        const selectedRequirement = getRequirement(updated.requirementId);
        if (selectedEmployee && selectedRequirement && !requirementApplies(selectedRequirement, selectedEmployee) && updated.status !== "notApplicable" && updated.status !== "exempt") {
          throw new Error("This requirement does not apply to the selected employee’s discipline.");
        }
        if (updated.status === "completed" && !updated.completionDate) updated.completionDate = todayISO();
        if (updated.status !== "completed") updated.completionDate = values.completionDate || "";
        if (state.provider) await state.provider.save(updated);
        Object.assign(record, updated);
      }
    });
  }
  function openNewCompletion() {
    const initial = { employeeId: currentEmployees()[0] && currentEmployees()[0].id, requirementId: currentRequirements()[0] && currentRequirements()[0].id, status: "completed", completionDate: todayISO() };
    openDialog({
      title: "Record training completion", eyebrow: "NEW MATRIX RECORD",
      description: "Add or update a project member’s status for a requirement.",
      fields: recordFields(initial),
      submitLabel: "Record completion", initial,
      onSave: async values => {
        const selectedEmployee = getEmployee(values.employeeId);
        const selectedRequirement = getRequirement(values.requirementId);
        if (!selectedEmployee || !selectedRequirement || !requirementApplies(selectedRequirement, selectedEmployee)) {
          throw new Error("Choose a requirement that applies to the selected employee’s discipline.");
        }
        const existing = recordFor(values.employeeId, values.requirementId);
        const record = Object.assign(existing || { id: "r" + Date.now(), projectId: state.projectId }, values);
        if (record.status === "completed" && !record.completionDate) record.completionDate = todayISO();
        if (state.provider) await state.provider.save(record);
        if (!existing) state.records.push(record);
      }
    });
  }
  function openAddMember() {
    const disciplines = ["Project Management", "Commercial", "HSES", "Quality", "Facility", "Project Control & Economics", "Subsurface", "Drilling", "Procurement", "Interface", "DCC & LCI", "Commissioning", "Operations"];
    openDialog({
      title: "Add project member", eyebrow: "PROJECT TEAM",
      description: "Add a person to this project and assign their discipline and role.",
      submitLabel: "Add member",
      fields: [
        { name: "name", label: "Employee name", required: true, placeholder: "e.g. Alex Morgan" },
        { name: "role", label: "Project role", required: true, placeholder: "e.g. Project Engineer" },
        { name: "discipline", label: "Discipline / function", type: "select", required: true, options: disciplines.map(value => ({ value, label: value })) },
        { name: "active", label: "Project status", type: "select", required: true, options: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] }
      ],
      onSave: async values => {
        const employee = { id: "e" + Date.now(), name: values.name, role: values.role, discipline: values.discipline, active: values.active !== "false" };
        if (state.provider) employee.id = await state.provider.add("employees", { name: employee.name, role: employee.role, discipline: employee.discipline, active: employee.active, projectId: state.projectId });
        state.employees.push(employee);
        const assignments = currentRequirements().filter(req => requirementApplies(req, employee)).map(req => ({ id: "r" + Date.now() + Math.random().toString(16).slice(2), projectId: state.projectId, employeeId: employee.id, requirementId: req.id, status: employee.active && req.mandatory ? "required" : "notApplicable", completionDate: "", plannedDate: "", responsible: "", comments: "", evidence: "" }));
        for (const assignment of assignments) {
          if (state.provider) await state.provider.save(assignment);
          state.records.push(assignment);
        }
      }
    });
  }
  function openAddRequirement() {
    const categories = ["Induction", "HSES", "Quality", "Project", "Systems & tools", "Procurement", "Operations", "Other"];
    const disciplines = ["All", "Project Management", "Commercial", "HSES", "Quality", "Facility", "Project Control & Economics", "Subsurface", "Drilling", "Procurement", "Interface", "DCC & LCI", "Commissioning", "Operations"];
    openDialog({
      title: "Add training requirement", eyebrow: "PROJECT REQUIREMENT",
      description: "Define a competence or training item for this project.",
      submitLabel: "Add requirement",
      fields: [
        { name: "name", label: "Requirement name", required: true, full: true, placeholder: "e.g. Project induction" },
        { name: "category", label: "Category", type: "select", required: true, options: categories.map(value => ({ value, label: value })) },
        { name: "mandatory", label: "Requirement type", type: "select", required: true, options: [{ value: "true", label: "Mandatory" }, { value: "false", label: "Optional" }] },
        { name: "disciplines", label: "Applicable discipline", type: "select", required: true, options: disciplines.map(value => ({ value, label: value === "All" ? "All project members" : value })) },
        { name: "description", label: "Description", type: "textarea", full: true, placeholder: "What should the employee know or complete?" }
      ],
      onSave: async values => {
        const requirement = { id: "q" + Date.now(), name: values.name, category: values.category, mandatory: values.mandatory === "true", disciplines: values.disciplines === "All" ? ["All"] : [values.disciplines], description: values.description };
        if (state.provider) requirement.id = await state.provider.add("requirements", { name: requirement.name, category: requirement.category, mandatory: requirement.mandatory, disciplines: requirement.disciplines, description: requirement.description, projectId: state.projectId });
        state.requirements.push(requirement);
        const assignments = activeEmployees().filter(employee => requirementApplies(requirement, employee)).map(employee => ({ id: "r" + Date.now() + Math.random().toString(16).slice(2), projectId: state.projectId, employeeId: employee.id, requirementId: requirement.id, status: requirement.mandatory ? "required" : "notApplicable", completionDate: "", plannedDate: "", responsible: "", comments: "", evidence: "" }));
        for (const assignment of assignments) {
          if (state.provider) await state.provider.save(assignment);
          state.records.push(assignment);
        }
      }
    });
  }
  function detailStat(value, label) {
    return '<div class="detail-stat"><strong>' + escapeHtml(value) + '</strong><span>' + escapeHtml(label) + "</span></div>";
  }
  function openDrawer(title, eyebrow, subtitle, content) {
    $("#drawer-title").textContent = title;
    $("#drawer-eyebrow").textContent = eyebrow;
    $("#drawer-subtitle").textContent = subtitle || "";
    $("#drawer-content").innerHTML = content;
    $("#drawer-backdrop").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    $(".drawer-close", $("#detail-drawer")).focus();
    $$("[data-record]", $("#drawer-content")).forEach(button => button.addEventListener("click", () => {
      closeDrawer();
      openRecord(button.dataset.record);
    }));
  }
  function closeDrawer() {
    $("#drawer-backdrop").classList.add("hidden");
    document.body.style.overflow = "";
  }
  function openEmployee(employeeId) {
    const employee = getEmployee(employeeId);
    if (!employee) return;
    const items = allProjectRecords().filter(record => record.employeeId === employee.id).map(record => ({ record, requirement: getRequirement(record.requirementId) })).filter(item => item.requirement);
    const applicable = items.filter(item => requirementApplies(item.requirement, employee) && item.requirement.mandatory);
    const completed = applicable.filter(item => item.record.status === "completed").length;
    const outstanding = applicable.filter(item => isOutstanding(item.record.status)).length;
    const percentage = applicable.length ? Math.round(completed / applicable.length * 100) : 0;
    const rows = items.map(({ record, requirement }) => {
      const status = statusOf(record.status);
      const dateText = record.completionDate ? "Completed " + formatDate(record.completionDate) : record.plannedDate ? "Planned " + formatDate(record.plannedDate) : "No date recorded";
      const comments = record.comments ? " · " + record.comments : "";
      return '<div class="detail-row"><div class="detail-row-main"><strong>' + escapeHtml(requirement.name) + '</strong><span>' + escapeHtml(requirement.category + " · " + dateText + comments) + '</span></div><button class="cell-pill ' + status.className + '" data-record="' + escapeHtml(record.id) + '" type="button">' + escapeHtml(status.label) + '</button></div>';
    }).join("");
    const content = '<span class="detail-badge">' + (employee.active ? "Active on project" : "Inactive") + '</span><div class="detail-metadata" style="margin-top:19px"><div class="metadata-item"><span>DISCIPLINE / FUNCTION</span><strong>' + escapeHtml(employee.discipline) + '</strong></div><div class="metadata-item"><span>PROJECT ROLE</span><strong>' + escapeHtml(employee.role) + '</strong></div><div class="metadata-item"><span>PROJECT</span><strong>' + escapeHtml(getProject().name) + '</strong></div><div class="metadata-item"><span>PROJECT STATUS</span><strong>' + (employee.active ? "Active" : "Inactive") + '</strong></div></div><div class="detail-stats">' + detailStat(applicable.length, "Required") + detailStat(completed, "Completed") + detailStat(outstanding, "Outstanding") + detailStat(percentage + "%", "Completion") + '</div><div class="drawer-section-title">Training &amp; competence requirements <span>' + items.length + " items</span></div><div class=\"detail-list\">" + (rows || '<div class="empty-state"><strong>No requirements</strong><span>No training requirements have been assigned to this employee.</span></div>') + "</div>";
    openDrawer(employee.name, "PROJECT MEMBER", employee.role + " · " + employee.discipline, content);
  }
  function openRequirement(requirementId) {
    const requirement = getRequirement(requirementId);
    if (!requirement) return;
    const items = allProjectRecords().filter(record => record.requirementId === requirement.id).map(record => ({ record, employee: getEmployee(record.employeeId) })).filter(item => item.employee && item.employee.active && requirementApplies(requirement, item.employee));
    const completed = items.filter(item => item.record.status === "completed").length;
    const outstanding = items.filter(item => isOutstanding(item.record.status)).length;
    const employees = items.map(({ record, employee }, index) => {
      const status = statusOf(record.status);
      return '<div class="detail-row"><div class="person-info">' + avatar(employee.name, index) + '<div class="detail-row-main"><strong>' + escapeHtml(employee.name) + '</strong><span>' + escapeHtml(employee.discipline) + ' · ' + escapeHtml(employee.role) + '</span></div></div><button class="cell-pill ' + status.className + '" type="button" data-record="' + escapeHtml(record.id) + '">' + escapeHtml(status.label) + '</button></div>';
    }).join("");
    const disciplines = (requirement.disciplines || ["All"]).join(", ");
    const content = '<span class="detail-badge">' + (requirement.mandatory ? "Mandatory" : "Optional") + '</span><div class="detail-metadata" style="margin-top:19px"><div class="metadata-item"><span>CATEGORY</span><strong>' + escapeHtml(requirement.category) + '</strong></div><div class="metadata-item"><span>APPLICABLE DISCIPLINES</span><strong>' + escapeHtml(disciplines) + '</strong></div><div class="metadata-item" style="grid-column:1/-1"><span>DESCRIPTION</span><strong>' + escapeHtml(requirement.description || "No description provided.") + '</strong></div></div><div class="detail-stats">' + detailStat(items.length, "Applicable") + detailStat(completed, "Completed") + detailStat(outstanding, "Outstanding") + detailStat(items.length ? Math.round(completed / items.length * 100) + "%" : "0%", "Completion") + '</div><div class="drawer-section-title">Project members <span>' + items.length + " people</span></div><div class=\"detail-list\">" + (employees || '<div class="empty-state"><strong>No applicable employees</strong><span>This requirement has not been assigned to any project members.</span></div>') + "</div>";
    openDrawer(requirement.name, "TRAINING REQUIREMENT", requirement.category + " · " + getProject().code, content);
  }
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    $("#toast-region").appendChild(toast);
    window.setTimeout(() => toast.remove(), 3000);
  }
  function clearFilters() {
    $("#search-input").value = "";
    $("#discipline-filter").value = "";
    $("#requirement-filter").value = "";
    $("#status-filter").value = "";
    $("#outstanding-only").checked = false;
    render();
  }
  function exportCsv() {
    const rows = [["Employee", "Discipline", "Role", "Requirement", "Category", "Status", "Completion date", "Planned date", "Responsible person", "Comments", "Evidence / reference"]];
    allProjectRecords().forEach(record => {
      const employee = getEmployee(record.employeeId);
      const requirement = getRequirement(record.requirementId);
      if (!employee || !requirement) return;
      rows.push([employee.name, employee.discipline, employee.role, requirement.name, requirement.category, statusOf(record.status).label, record.completionDate, record.plannedDate, record.responsible, record.comments, record.evidence]);
    });
    const csv = rows.map(row => row.map(value => '"' + String(value == null ? "" : value).replace(/"/g, '""') + '"').join(",")).join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    link.download = getProject().reference + "-competence-matrix.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }
  function bindEvents() {
    $("#project-select").addEventListener("change", event => { state.projectId = event.target.value; render(); });
    [$("#search-input"), $("#discipline-filter"), $("#requirement-filter"), $("#status-filter"), $("#outstanding-only")].forEach(control => control.addEventListener(control.type === "search" ? "input" : "change", renderMatrix));
    [$("#outstanding-search"), $("#outstanding-discipline-filter"), $("#outstanding-status-filter")].forEach(control => control.addEventListener(control.type === "search" ? "input" : "change", renderOutstanding));
    $("#clear-filters").addEventListener("click", clearFilters);
    $("#empty-clear-button").addEventListener("click", clearFilters);
    $("#matrix-tab").addEventListener("click", () => { state.tab = "matrix"; render(); });
    $("#outstanding-tab").addEventListener("click", () => { state.tab = "outstanding"; render(); });
    $("#add-member-button").addEventListener("click", openAddMember);
    $("#add-requirement-button").addEventListener("click", openAddRequirement);
    $("#record-completion-button").addEventListener("click", openNewCompletion);
    $("#export-button").addEventListener("click", exportCsv);
    $$("#outstanding-table [data-sort]").forEach(button => button.addEventListener("click", () => {
      const key = button.dataset.sort;
      state.sort = { key, direction: state.sort.key === key ? -state.sort.direction : 1 };
      renderOutstanding();
    }));
    $("#dialog-form").addEventListener("submit", onFormSubmit);
    $$(".dialog-close, .dialog-cancel").forEach(button => button.addEventListener("click", closeDialog));
    $("#modal-backdrop").addEventListener("mousedown", event => { if (event.target === $("#modal-backdrop")) closeDialog(); });
    $$(".drawer-close, .drawer-close-button").forEach(button => button.addEventListener("click", closeDrawer));
    $("#drawer-backdrop").addEventListener("mousedown", event => { if (event.target === $("#drawer-backdrop")) closeDrawer(); });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        if (!$("#modal-backdrop").classList.contains("hidden")) closeDialog();
        else if (!$("#drawer-backdrop").classList.contains("hidden")) closeDrawer();
      }
    });
  }
  async function init() {
    bindEvents();
    try {
      const connected = await loadDataverse();
      if (connected) $("#data-source").textContent = "Dataverse connected";
    } catch (error) {
      $("#data-source").textContent = "Demo data";
      showToast(error.message || "Dataverse configuration could not be loaded.");
      console.error("Competence matrix Dataverse configuration error:", error);
    }
    render();
  }
  init();
}());
