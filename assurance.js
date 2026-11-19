(() => {
  'use strict';

  const TABLE = 'cr952_projectactivity';
  const PROJECT_TABLE = 'cr952_project';
  const REFERENCE_TABLE = 'cr952_activityreference';
  const LOOKUPS = {
    person: { table: 'cr952_person', field: 'cr952_responsibleperson', navigation: 'cr952_ResponsiblePerson', label: 'Responsible person' },
    organisation: { table: 'cr952_organisation', field: 'cr952_responsibleorganisation', navigation: 'cr952_ResponsibleOrganisation', label: 'Responsible organisation' },
    discipline: { table: 'cr952_discipline', field: 'cr952_responsiblediscipline', navigation: 'cr952_ResponsibleDiscipline', label: 'Responsible discipline' }
  };
  const FIELDS = {
    id: 'cr952_projectactivityid',
    title: 'cr952_activitytitle',
    activityReference: 'cr952_activityreference',
    activityType: 'cr952_activitytype',
    activityHealth: 'cr952_activityhealth',
    actualCompletionDate: 'cr952_actualcompletiondate',
    comment: 'cr952_comment',
    currentComment: 'cr952_currentcomment',
    description: 'cr952_description',
    discipline: 'cr952_discipline',
    focusArea: 'cr952_focusarea',
    objective: 'cr952_objective',
    plannedQuarter: 'cr952_plannedquarter',
    plannedStartDate: 'cr952_plannedstartdate',
    plannedYear: 'cr952_plannedyear',
    project: 'cr952_project',
    projectPhase: 'cr952_projectphase',
    projectDeliverable: 'cr952_projectdeliverable',
    reason: 'cr952_reason',
    referenceDescription: 'cr952_referencedescription',
    referenceNumber: 'cr952_referencenumber',
    referenceUrl: 'cr952_referenceurl',
    responsibleAssignment: 'cr952_responsibleassignment',
    source: 'cr952_source',
    status: 'cr952_status',
    targetDate: 'cr952_targetdate'
  };
  const CHOICE_FIELDS = [FIELDS.activityType, FIELDS.activityHealth, FIELDS.plannedQuarter, FIELDS.projectPhase, FIELDS.reason, FIELDS.source, FIELDS.status];
  const SELECT_FIELDS = [
    FIELDS.id, FIELDS.title, FIELDS.activityReference, FIELDS.activityType, FIELDS.activityHealth,
    FIELDS.actualCompletionDate, FIELDS.comment, FIELDS.currentComment, FIELDS.description,
    FIELDS.discipline, FIELDS.focusArea, FIELDS.objective, FIELDS.plannedQuarter,
    FIELDS.plannedStartDate, FIELDS.plannedYear, FIELDS.projectPhase, FIELDS.reason,
    FIELDS.referenceDescription, FIELDS.referenceNumber, FIELDS.referenceUrl,
    FIELDS.responsibleAssignment, FIELDS.source, FIELDS.status, FIELDS.targetDate,
    '_cr952_project_value', '_cr952_responsibleperson_value',
    '_cr952_responsibleorganisation_value', '_cr952_responsiblediscipline_value'
  ];
  const LOOKUP_FIELDS = {
    person: '_cr952_responsibleperson_value',
    organisation: '_cr952_responsibleorganisation_value',
    discipline: '_cr952_responsiblediscipline_value'
  };
  const LABEL_ANNOTATION = '@OData.Community.Display.V1.FormattedValue';
  const state = {
    xrm: null,
    activityMetadata: null,
    projectMetadata: null,
    projectPhaseMetadata: null,
    projects: [],
    projectById: new Map(),
    lookups: {},
    choices: new Map(),
    records: [],
    selectedProjectId: '',
    selectedPhase: null,
    launchProjectId: '',
    launchPhase: null,
    sort: 'default',
    drawerMode: '',
    editingId: '',
    returnFocus: null,
    loading: false,
    loadRequestId: 0,
    referenceRequestId: 0
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const normalizeId = (value) => String(value || '').replace(/[{}]/g, '').toLowerCase();
  const asArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value.get === 'function') {
      const items = value.get();
      if (Array.isArray(items)) return items;
    }
    if (typeof value[Symbol.iterator] === 'function') return Array.from(value);
    if (typeof value.get === 'function' && typeof value.forEach === 'function') {
      const items = [];
      value.forEach((item) => items.push(item));
      return items;
    }
    return Object.values(value);
  };

  function getXrm() {
    const candidates = [];
    try { candidates.push(window.Xrm); } catch (_) { /* Cross-frame access can be unavailable. */ }
    try { candidates.push(window.parent.Xrm); } catch (_) { /* Cross-frame access can be unavailable. */ }
    try { candidates.push(window.top.Xrm); } catch (_) { /* Cross-frame access can be unavailable. */ }
    return candidates.find((candidate) => candidate && candidate.WebApi && candidate.Utility) || null;
  }

  function getAttribute(metadata, logicalName) {
    const attributes = metadata && metadata.Attributes;
    if (!attributes) return null;
    if (typeof attributes.get === 'function') {
      const direct = attributes.get(logicalName);
      if (direct) return direct;
    }
    return asArray(attributes).find((attribute) => String(attribute.LogicalName || '').toLowerCase() === logicalName.toLowerCase()) || null;
  }

  function getLocalizedLabel(label) {
    if (!label) return '';
    return label.UserLocalizedLabel?.Label
      || asArray(label.LocalizedLabels).find((item) => item.Label)?.Label
      || '';
  }

  function getChoiceOptions(attribute) {
    return asArray(attribute?.OptionSet?.Options)
      .map((option) => ({ value: Number(option.Value), label: getLocalizedLabel(option.Label) }))
      .filter((option) => Number.isFinite(option.value) && option.label)
      .sort((a, b) => a.value - b.value);
  }

  function choiceLabel(field, value) {
    if (value === null || value === undefined || value === '') return '';
    return state.choices.get(field)?.find((option) => option.value === Number(value))?.label || '';
  }

  function choiceOptions(field) {
    return state.choices.get(field) || [];
  }

  function optionValueByLabel(field, pattern) {
    const match = choiceOptions(field).find((option) => pattern.test(option.label));
    return match ? String(match.value) : '';
  }

  async function getEntityMetadata(entityName, attributes) {
    return state.xrm.Utility.getEntityMetadata(entityName, attributes);
  }

  async function retrieveAll(entityName, options) {
    const records = [];
    let query = options;
    while (query) {
      const result = await state.xrm.WebApi.retrieveMultipleRecords(entityName, query, 5000);
      records.push(...result.entities);
      query = result.nextLink || '';
    }
    return records;
  }

  function getLaunchContext() {
    const context = { projectId: '', phase: null, entityName: '', entityId: '' };
    const parameters = new URLSearchParams(window.location.search);
    const inputProject = parameters.get('projectId') || parameters.get('id') || '';
    const inputPhase = parameters.get('phase');
    let pageInput = {};
    try {
      pageInput = state.xrm.Utility.getPageContext()?.input || {};
    } catch (error) {
      console.warn('Model-driven page context is unavailable.', error);
    }
    context.entityName = String(pageInput.entityName || '').toLowerCase();
    context.entityId = normalizeId(pageInput.entityId);

    try {
      const form = state.xrm.Page;
      if (form?.data?.entity) {
        context.entityName = String(form.data.entity.getEntityName() || context.entityName).toLowerCase();
        context.entityId = normalizeId(form.data.entity.getId() || context.entityId);
        const phaseAttribute = form.getAttribute(FIELDS.projectPhase);
        if (phaseAttribute && phaseAttribute.getValue() !== null) context.phase = Number(phaseAttribute.getValue());
      }
    } catch (error) {
      console.warn('Current form context is unavailable.', error);
    }

    context.projectId = normalizeId(inputProject || (context.entityName === PROJECT_TABLE ? context.entityId : ''));
    if (inputPhase !== null && inputPhase !== '') {
      const numericPhase = Number(inputPhase);
      context.phase = Number.isFinite(numericPhase) ? numericPhase : inputPhase;
    }
    return context;
  }

  function setConnectionState(title, message, kind = 'loading') {
    const container = $('#connection-state');
    container.hidden = false;
    container.className = `connection-state ${kind}`;
    container.innerHTML = `<span class="connection-state-icon" aria-hidden="true">${kind === 'error' ? '!' : '↻'}</span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p></div>`;
    $('#activity-groups').replaceChildren();
    $('#empty-state').hidden = true;
  }

  function clearConnectionState() {
    $('#connection-state').hidden = true;
  }

  function showToast(message, kind = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${kind === 'error' ? 'toast-error' : ''}`;
    toast.textContent = message;
    $('#toast-region').append(toast);
    window.setTimeout(() => toast.remove(), 3600);
  }

  function setControlsEnabled(enabled) {
    [
      '#project-filter', '#activity-type-filter', '#area-filter', '#responsible-filter',
      '#status-filter', '#search-input', '#sort-select', '#clear-filters', '#add-activity', '#toggle-filters'
    ].forEach((selector) => { $(selector).disabled = !enabled; });
  }

  function makeSelectOptions(items, selected, placeholder) {
    const first = placeholder === null ? '' : `<option value="">${escapeHtml(placeholder)}</option>`;
    const options = items.map((item) => {
      const value = String(item.value);
      return `<option value="${escapeHtml(value)}"${value === String(selected ?? '') ? ' selected' : ''}>${escapeHtml(item.label)}</option>`;
    }).join('');
    return `${first}${options}`;
  }

  function fillSelect(select, items, placeholder, selected) {
    select.innerHTML = makeSelectOptions(items, selected, placeholder);
    if (selected !== undefined && selected !== null) select.value = String(selected);
  }

  function readLookupName(record, key) {
    const field = LOOKUP_FIELDS[key];
    if (!field) return '';
    const formatted = record[`${field}${LABEL_ANNOTATION}`];
    if (formatted) return formatted;
    const id = normalizeId(record[field]);
    return state.lookups[key]?.byId.get(id)?.name || '';
  }

  function projectName(id) {
    return state.projectById.get(normalizeId(id))?.name || '';
  }

  function recordProjectId(record) {
    return normalizeId(record._cr952_project_value);
  }

  function responsibleParty(record) {
    return [
      readLookupName(record, 'person'),
      readLookupName(record, 'organisation'),
      record[FIELDS.responsibleAssignment]
    ].filter(Boolean).join(' · ');
  }

  function plannedDate(record) {
    if (record[FIELDS.plannedStartDate]) return record[FIELDS.plannedStartDate];
    const quarter = choiceLabel(FIELDS.plannedQuarter, record[FIELDS.plannedQuarter]);
    const year = record[FIELDS.plannedYear];
    return [quarter, year].filter(Boolean).join(' ');
  }

  function actualPlannedDate(record) {
    return record[FIELDS.plannedStartDate] || '';
  }

  function localDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function isTerminalStatus(label) {
    return /completed|closed|performed|cancelled|canceled|void|transferr?ed/i.test(label || '');
  }

  function isCompletedStatus(label) {
    return /completed|closed|performed/i.test(label || '');
  }

  function isOngoingStatus(label) {
    return /ongoing|re[\s-]?opened|in[\s-]?progress/i.test(label || '');
  }

  function isOverdue(record) {
    const date = actualPlannedDate(record);
    const label = choiceLabel(FIELDS.status, record[FIELDS.status]);
    return Boolean(date && date < localDateString() && !isTerminalStatus(label));
  }

  function statusClass(record) {
    const label = choiceLabel(FIELDS.status, record[FIELDS.status]);
    if (isOverdue(record)) return 'overdue';
    if (/transferr?ed/i.test(label)) return 'transferred';
    if (/cancelled|canceled|void/i.test(label)) return 'cancelled';
    if (isCompletedStatus(label)) return 'completed';
    if (isOngoingStatus(label)) return 'ongoing';
    if (/planned|open|not started|required/i.test(label)) return 'planned';
    return 'planned';
  }

  function statusMarkup(record, compact = false) {
    const overdue = isOverdue(record);
    const actualLabel = choiceLabel(FIELDS.status, record[FIELDS.status]) || 'Unspecified';
    const label = overdue ? 'Overdue' : actualLabel;
    const title = overdue ? `${actualLabel} · planned date has passed` : actualLabel;
    return `<span class="status-pill assurance-status ${statusClass(record)}${compact ? ' compact' : ''}" title="${escapeHtml(title)}">${escapeHtml(label)}</span>`;
  }

  function formatDate(value) {
    if (!value) return 'Not planned';
    const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  }

  function getFilteredRecords() {
    const activityType = $('#activity-type-filter').value;
    const area = $('#area-filter').value;
    const responsible = $('#responsible-filter').value;
    const status = $('#status-filter').value;
    const search = $('#search-input').value.trim().toLocaleLowerCase();
    return state.records.filter((record) => {
      if (state.selectedPhase !== null && Number(record[FIELDS.projectPhase]) !== Number(state.selectedPhase)) return false;
      if (activityType && String(record[FIELDS.activityType] ?? '') !== activityType) return false;
      if (area && String(record[FIELDS.discipline] || '') !== area) return false;
      const party = responsibleParty(record);
      if (responsible && party !== responsible) return false;
      if (status === 'overdue' && !isOverdue(record)) return false;
      if (status && status !== 'overdue' && String(record[FIELDS.status] ?? '') !== status) return false;
      if (search) {
        const haystack = [
          record[FIELDS.title], record[FIELDS.objective], record[FIELDS.description],
          record[FIELDS.focusArea], record[FIELDS.activityReference], record[FIELDS.referenceNumber],
          record[FIELDS.referenceDescription], record[FIELDS.referenceUrl],
          record[FIELDS.responsibleAssignment], responsibleParty(record)
        ].join(' ').toLocaleLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }

  function compareText(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
  }

  function sortRecords(records) {
    return records.sort((a, b) => {
      if (state.sort === 'date') {
        return compareText(actualPlannedDate(a), actualPlannedDate(b)) || compareText(a[FIELDS.title], b[FIELDS.title]);
      }
      if (state.sort === 'status') {
        return compareText(choiceLabel(FIELDS.status, a[FIELDS.status]), choiceLabel(FIELDS.status, b[FIELDS.status]))
          || compareText(actualPlannedDate(a), actualPlannedDate(b));
      }
      if (state.sort === 'activity') return compareText(a[FIELDS.title], b[FIELDS.title]);
      if (state.sort === 'responsible') return compareText(responsibleParty(a), responsibleParty(b));
      return compareText(a[FIELDS.discipline], b[FIELDS.discipline])
        || compareText(actualPlannedDate(a), actualPlannedDate(b))
        || compareText(a[FIELDS.title], b[FIELDS.title]);
    });
  }

  function renderSummary(records) {
    const completed = records.filter((record) => isCompletedStatus(choiceLabel(FIELDS.status, record[FIELDS.status]))).length;
    const ongoing = records.filter((record) => isOngoingStatus(choiceLabel(FIELDS.status, record[FIELDS.status]))).length;
    const cancelled = records.filter((record) => /cancelled|canceled|void|transferr?ed/i.test(choiceLabel(FIELDS.status, record[FIELDS.status]))).length;
    const planned = Math.max(0, records.length - completed - ongoing - cancelled);
    const overdue = records.filter(isOverdue).length;
    $('#total-count').textContent = String(records.length);
    $('#planned-count').textContent = String(planned);
    $('#ongoing-count').textContent = String(ongoing);
    $('#completed-count').textContent = String(completed);
    $('#overdue-count').textContent = String(overdue);
    $('#overdue-banner').hidden = overdue === 0;
  }

  function renderFilterOptions(records) {
    const currentArea = $('#area-filter').value;
    const currentParty = $('#responsible-filter').value;
    const areaOptions = [...new Set(records.map((record) => String(record[FIELDS.discipline] || '').trim()).filter(Boolean))]
      .sort(compareText).map((value) => ({ value, label: value }));
    const parties = [...new Set(records.map(responsibleParty).filter(Boolean))]
      .sort(compareText).map((value) => ({ value, label: value }));
    fillSelect($('#area-filter'), areaOptions, 'All disciplines / areas', currentArea);
    fillSelect($('#responsible-filter'), parties, 'All responsible parties', currentParty);
    const statuses = choiceOptions(FIELDS.status).map((option) => ({ value: option.value, label: option.label }));
    fillSelect($('#status-filter'), [...statuses, { value: 'overdue', label: 'Overdue' }], 'All statuses', $('#status-filter').value);
  }

  function activityCard(record) {
    const title = record[FIELDS.title] || 'Untitled activity';
    const area = record[FIELDS.discipline] || 'Unassigned area';
    const activityType = choiceLabel(FIELDS.activityType, record[FIELDS.activityType]) || 'Activity';
    const party = responsibleParty(record) || 'Owner not assigned';
    const date = plannedDate(record);
    const objective = record[FIELDS.objective] || record[FIELDS.description] || '';
    const focus = record[FIELDS.focusArea] || '';
    const reference = record[FIELDS.referenceNumber] || record[FIELDS.activityReference] || '';
    return `<button class="assurance-activity" type="button" data-activity-id="${escapeHtml(record[FIELDS.id])}" aria-label="Open ${escapeHtml(title)}">
      <span class="activity-main">
        <span class="activity-title">${escapeHtml(title)}</span>
        <span class="activity-type">${escapeHtml(activityType)}</span>
      </span>
      <span class="activity-scan">
        <span class="activity-owner"><span class="activity-meta-label">Responsible</span><strong>${escapeHtml(party)}</strong></span>
        <span class="activity-date${isOverdue(record) ? ' overdue-date' : ''}"><span class="activity-meta-label">Time planned</span><strong>${escapeHtml(date ? formatDate(date) : 'Not planned')}</strong></span>
        ${statusMarkup(record)}
        <span class="activity-chevron" aria-hidden="true">›</span>
      </span>
      ${(focus || objective || reference) ? `<span class="activity-preview">${focus ? `<span><b>Focus</b> ${escapeHtml(focus)}</span>` : ''}${objective ? `<span><b>Objective</b> ${escapeHtml(objective)}</span>` : ''}${reference ? `<span class="activity-reference"><b>Ref</b> ${escapeHtml(reference)}</span>` : ''}</span>` : ''}
    </button>`;
  }

  function renderGroups(records) {
    const groups = new Map();
    records.forEach((record) => {
      const area = String(record[FIELDS.discipline] || '').trim() || 'Unassigned area';
      if (!groups.has(area)) groups.set(area, []);
      groups.get(area).push(record);
    });
    $('#activity-groups').innerHTML = [...groups.entries()].map(([area, items]) => `<section class="activity-group" aria-labelledby="area-${escapeHtml(area.replace(/[^a-z0-9]+/gi, '-').toLowerCase())}">
      <header class="activity-group-header"><h3 id="area-${escapeHtml(area.replace(/[^a-z0-9]+/gi, '-').toLowerCase())}">${escapeHtml(area)}</h3><span>${items.length} ${items.length === 1 ? 'activity' : 'activities'}</span></header>
      <div class="activity-list">${items.map(activityCard).join('')}</div>
    </section>`).join('');
  }

  function renderRecords() {
    const filtered = sortRecords(getFilteredRecords());
    $('#record-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'activity' : 'activities'}`;
    renderSummary(filtered);
    renderGroups(filtered);
    const phaseRecords = state.records.filter((record) => state.selectedPhase === null || Number(record[FIELDS.projectPhase]) === Number(state.selectedPhase));
    const noActivitiesForPhase = phaseRecords.length === 0;
    const noMatches = phaseRecords.length > 0 && filtered.length === 0;
    $('#empty-state').hidden = filtered.length !== 0 || state.loading;
    $('#empty-title').textContent = noActivitiesForPhase
      ? 'No assurance activities have been created for this phase yet.'
      : 'No matching assurance activities';
    $('#empty-description').textContent = noActivitiesForPhase
      ? 'Add an activity to start building this phase’s assurance plan.'
      : 'Try adjusting your filters or search for another activity.';
    $('#empty-add').hidden = !noActivitiesForPhase;
    if (noMatches) $('#empty-add').hidden = true;
  }

  function renderPhaseTabs() {
    const options = choiceOptions(FIELDS.projectPhase);
    $('#phase-tabs').innerHTML = options.map((option) => `<button class="phase-tab${Number(option.value) === Number(state.selectedPhase) ? ' active' : ''}" type="button" role="tab" aria-selected="${Number(option.value) === Number(state.selectedPhase)}" data-phase="${option.value}">${escapeHtml(option.label)}</button>`).join('');
    $('#selected-phase-name').textContent = options.find((option) => Number(option.value) === Number(state.selectedPhase))?.label || '—';
  }

  function renderProjectSelect() {
    fillSelect($('#project-filter'), state.projects.map((project) => ({ value: project.id, label: project.name })), null, state.selectedProjectId);
    updateProjectHeader();
  }

  function updateProjectHeader() {
    const name = projectName(state.selectedProjectId) || 'Select a project';
    $('#selected-project-name').textContent = name;
    $('#breadcrumb-project').textContent = name;
    $('#selected-phase-name').textContent = choiceLabel(FIELDS.projectPhase, state.selectedPhase) || '—';
  }

  async function loadProjectRecords() {
    const requestId = ++state.loadRequestId;
    state.records = [];
    if (!state.selectedProjectId) {
      state.loading = false;
      renderRecords();
      return;
    }
    state.loading = true;
    renderSummary([]);
    $('#record-count').textContent = '0 activities';
    setConnectionState('Loading assurance plan', 'Retrieving Project Activity records for the selected project.', 'loading');
    const selected = SELECT_FIELDS.join(',');
    const filter = `_cr952_project_value eq ${state.selectedProjectId}`;
    const options = `?${new URLSearchParams({ '$select': selected, '$filter': filter, '$orderby': `${FIELDS.discipline} asc,${FIELDS.plannedStartDate} asc,${FIELDS.title} asc` }).toString()}`;
    try {
      const records = await retrieveAll(TABLE, options);
      if (requestId !== state.loadRequestId) return;
      state.records = records;
      clearConnectionState();
      renderFilterOptions(state.records);
      state.loading = false;
      renderRecords();
    } catch (error) {
      if (requestId !== state.loadRequestId) return;
      state.loading = false;
      setConnectionState('Could not load Project Activity records', error.message || 'Dataverse returned an error while loading this project.', 'error');
      showToast('Could not load the assurance plan from Dataverse.', 'error');
    }
  }

  async function loadLookupTable(entityName) {
    const metadata = entityName === PROJECT_TABLE
      ? state.projectMetadata
      : await getEntityMetadata(entityName);
    const idAttribute = metadata.PrimaryIdAttribute;
    const nameAttribute = metadata.PrimaryNameAttribute;
    if (!idAttribute || !nameAttribute || !metadata.EntitySetName) {
      throw new Error(`Dataverse metadata for ${entityName} is missing its primary name, ID, or entity set.`);
    }
    const records = await retrieveAll(entityName, `?${new URLSearchParams({
      '$select': `${idAttribute},${nameAttribute}${entityName === PROJECT_TABLE && state.projectPhaseMetadata ? `,${FIELDS.projectPhase}` : ''}`,
      '$orderby': `${nameAttribute} asc`
    }).toString()}`);
    return {
      metadata,
      records: records.map((record) => ({
        id: normalizeId(record[idAttribute]),
        name: String(record[nameAttribute] || '(Unnamed record)'),
        phase: entityName === PROJECT_TABLE ? record[FIELDS.projectPhase] : null
      }))
    };
  }

  function selectedLaunchPhase() {
    if (state.launchPhase !== null && state.launchPhase !== undefined && state.launchPhase !== '') {
      const byValue = choiceOptions(FIELDS.projectPhase).find((option) => Number(option.value) === Number(state.launchPhase));
      if (byValue) return byValue.value;
      const byLabel = choiceOptions(FIELDS.projectPhase).find((option) => option.label.toLowerCase() === String(state.launchPhase).toLowerCase());
      if (byLabel) return byLabel.value;
    }
    const currentProject = state.projects.find((project) => project.id === state.selectedProjectId);
    if (currentProject?.phase !== null && currentProject?.phase !== undefined) {
      const projectPhase = choiceOptions(FIELDS.projectPhase).find((option) => Number(option.value) === Number(currentProject.phase));
      if (projectPhase) return projectPhase.value;
    }
    return choiceOptions(FIELDS.projectPhase)[0]?.value ?? null;
  }

  async function initialize() {
    state.xrm = getXrm();
    if (!state.xrm) {
      setControlsEnabled(false);
      $('#connection-label').classList.add('error');
      $('#connection-label').innerHTML = '<span></span> Open in Project Portal';
      setConnectionState('Dataverse connection required', 'Open this page from the Project Portal model-driven app. Project Activity data is never stored in this browser.', 'error');
      return;
    }

    const launch = getLaunchContext();
    state.launchProjectId = launch.projectId;
    state.launchPhase = launch.phase;
    try {
      const [activityMetadata, projectMetadata, projectPhaseMetadata] = await Promise.all([
        getEntityMetadata(TABLE, CHOICE_FIELDS),
        getEntityMetadata(PROJECT_TABLE),
        getEntityMetadata(PROJECT_TABLE, [FIELDS.projectPhase]).catch(() => null)
      ]);
      state.activityMetadata = activityMetadata;
      state.projectMetadata = projectMetadata;
      state.projectPhaseMetadata = getAttribute(projectPhaseMetadata, FIELDS.projectPhase) ? projectPhaseMetadata : null;
      CHOICE_FIELDS.forEach((field) => {
        const options = getChoiceOptions(getAttribute(state.activityMetadata, field));
        if (options.length) state.choices.set(field, options);
      });
      if (!choiceOptions(FIELDS.projectPhase).length) throw new Error('The Project Activity Project Phase Choice has no available options.');
      if (!choiceOptions(FIELDS.activityType).length || !choiceOptions(FIELDS.status).length) {
        throw new Error('The Project Activity Type or Status Choice metadata is unavailable.');
      }

      const [projectData, personData, organisationData, disciplineData] = await Promise.all([
        loadLookupTable(PROJECT_TABLE),
        loadLookupTable(LOOKUPS.person.table),
        loadLookupTable(LOOKUPS.organisation.table),
        loadLookupTable(LOOKUPS.discipline.table)
      ]);
      state.projects = projectData.records;
      state.projectById = new Map(state.projects.map((project) => [project.id, project]));
      state.lookups.person = { ...personData, byId: new Map(personData.records.map((record) => [record.id, record])) };
      state.lookups.organisation = { ...organisationData, byId: new Map(organisationData.records.map((record) => [record.id, record])) };
      state.lookups.discipline = { ...disciplineData, byId: new Map(disciplineData.records.map((record) => [record.id, record])) };

      if (!state.projects.length) {
        setControlsEnabled(false);
        $('#connection-label').classList.add('error');
        setConnectionState('No projects are available', 'No Project records are available to the current Dataverse user.', 'error');
        return;
      }
      state.selectedProjectId = state.projects.some((project) => project.id === state.launchProjectId)
        ? state.launchProjectId
        : state.projects[0].id;
      renderProjectSelect();
      state.selectedPhase = selectedLaunchPhase();
      renderPhaseTabs();
      fillSelect($('#activity-type-filter'), choiceOptions(FIELDS.activityType), 'All activity types');
      fillSelect($('#status-filter'), choiceOptions(FIELDS.status), 'All statuses');
      setControlsEnabled(true);
      $('#connection-label').classList.remove('error');
      $('#connection-label').classList.add('connected');
      $('#connection-label').innerHTML = '<span></span> Dataverse connected';
      await loadProjectRecords();
    } catch (error) {
      setControlsEnabled(false);
      $('#connection-label').classList.remove('connected');
      $('#connection-label').classList.add('error');
      $('#connection-label').innerHTML = '<span></span> Dataverse unavailable';
      setConnectionState('Unable to connect to the assurance data', error.message || 'Check the model-driven app context and Dataverse permissions.', 'error');
      showToast('Could not initialize the Dataverse assurance plan.', 'error');
    }
  }

  function selectedLookupId(record, key) {
    return normalizeId(record?.[LOOKUP_FIELDS[key]]);
  }

  function lookupSelect(key, selectedId, required = false) {
    const lookup = state.lookups[key];
    const items = (lookup?.records || []).map((record) => ({ value: record.id, label: record.name }));
    return `<select name="${key}"${required ? ' required' : ''}>${makeSelectOptions(items, selectedId, required ? null : `Select ${LOOKUPS[key].label.toLowerCase()}`)}</select>`;
  }

  function choiceSelect(field, selectedValue, required = false) {
    return `<select name="${escapeHtml(field)}"${required ? ' required' : ''}>${makeSelectOptions(choiceOptions(field), selectedValue, required ? null : 'Select an option')}</select>`;
  }

  function textField(label, name, value, options = {}) {
    const full = options.full ? ' full' : '';
    const required = options.required ? ' required' : '';
    const type = options.type || 'text';
    const control = options.textarea
      ? `<textarea name="${escapeHtml(name)}"${required}>${escapeHtml(value || '')}</textarea>`
      : `<input type="${type}" name="${escapeHtml(name)}" value="${escapeHtml(value || '')}"${required}${options.maxLength ? ` maxlength="${options.maxLength}"` : ''}>`;
    return `<label class="form-field${full}"><span>${escapeHtml(label)}${options.required ? '<i class="required-mark">*</i>' : ''}</span>${control}</label>`;
  }

  function selectField(label, name, control, full = false) {
    return `<label class="form-field${full ? ' full' : ''}"><span>${escapeHtml(label)}</span>${control}</label>`;
  }

  function formMarkup(record, createMode) {
    const plannedDefault = optionValueByLabel(FIELDS.status, /planned|open|not started/i);
    const projectId = record ? recordProjectId(record) : state.selectedProjectId;
    const phase = record ? record[FIELDS.projectPhase] : state.selectedPhase;
    const status = record ? record[FIELDS.status] : (plannedDefault || choiceOptions(FIELDS.status)[0]?.value);
    const projectOptions = state.projects.map((project) => ({ value: project.id, label: project.name }));
    const projectSelect = `<select name="project" required>${makeSelectOptions(projectOptions, projectId, null)}</select>`;
    const personId = selectedLookupId(record, 'person');
    const organisationId = selectedLookupId(record, 'organisation');
    const responsibleDisciplineId = selectedLookupId(record, 'discipline');
    return `<form id="activity-form" class="assurance-form">
      <section class="form-section"><h3>General</h3><div class="form-grid">
        ${textField('Activity', 'title', record?.[FIELDS.title] || '', { required: true, full: true, maxLength: 200 })}
        ${selectField('Project', 'project', projectSelect)}
        ${selectField('Project phase', FIELDS.projectPhase, choiceSelect(FIELDS.projectPhase, phase, true))}
        ${textField('Discipline / area', 'area', record?.[FIELDS.discipline] || '')}
        ${selectField('Activity type', FIELDS.activityType, choiceSelect(FIELDS.activityType, record?.[FIELDS.activityType], true))}
        ${selectField('Status', FIELDS.status, choiceSelect(FIELDS.status, status, true))}
        ${selectField('Source', FIELDS.source, choiceSelect(FIELDS.source, record?.[FIELDS.source]))}
      </div></section>
      <section class="form-section"><h3>Responsibility</h3><div class="form-grid">
        ${selectField('Responsible person', 'person', lookupSelect('person', personId))}
        ${selectField('Responsible organisation', 'organisation', lookupSelect('organisation', organisationId))}
        ${selectField('Responsible discipline', 'discipline', lookupSelect('discipline', responsibleDisciplineId))}
        ${textField('Responsible assignment', 'assignment', record?.[FIELDS.responsibleAssignment] || '')}
      </div></section>
      <section class="form-section"><h3>Assurance details</h3><div class="form-grid">
        ${selectField('Reason', FIELDS.reason, choiceSelect(FIELDS.reason, record?.[FIELDS.reason]))}
        ${textField('Focus area', 'focusArea', record?.[FIELDS.focusArea] || '')}
        ${textField('Scope of work', 'description', record?.[FIELDS.description] || '', { textarea: true, full: true })}
        ${textField('Objective', 'objective', record?.[FIELDS.objective] || '', { textarea: true, full: true })}
      </div></section>
      <section class="form-section"><h3>Planning &amp; status</h3><div class="form-grid">
        ${textField('Planned start date', 'plannedStartDate', record?.[FIELDS.plannedStartDate] || '', { type: 'date' })}
        ${textField('Target date', 'targetDate', record?.[FIELDS.targetDate] || '', { type: 'date' })}
        ${textField('Planned year', 'plannedYear', record?.[FIELDS.plannedYear] ?? '', { type: 'number' })}
        ${selectField('Planned quarter', FIELDS.plannedQuarter, choiceSelect(FIELDS.plannedQuarter, record?.[FIELDS.plannedQuarter]))}
        ${textField('Actual completion date', 'actualCompletionDate', record?.[FIELDS.actualCompletionDate] || '', { type: 'date' })}
        ${selectField('Activity health', FIELDS.activityHealth, choiceSelect(FIELDS.activityHealth, record?.[FIELDS.activityHealth]))}
      </div></section>
      <section class="form-section"><h3>Evidence &amp; follow-up</h3><div class="form-grid">
        ${textField('Activity reference', 'activityReference', record?.[FIELDS.activityReference] || '')}
        ${textField('Reference number', 'referenceNumber', record?.[FIELDS.referenceNumber] || '')}
        ${textField('Reference description', 'referenceDescription', record?.[FIELDS.referenceDescription] || '', { full: true })}
        ${textField('Reference URL or document link', 'referenceUrl', record?.[FIELDS.referenceUrl] || '', { type: 'url', full: true })}
        ${textField('Comment', 'comment', record?.[FIELDS.comment] || '', { textarea: true, full: true })}
        ${textField('Current comment', 'currentComment', record?.[FIELDS.currentComment] || '', { full: true })}
      </div></section>
      <div class="form-error" id="form-error" role="alert" hidden></div>
      <footer class="drawer-actions"><button class="button button-secondary" type="button" data-drawer-action="cancel">Cancel</button><button class="button button-primary" type="submit">${createMode ? 'Create activity' : 'Save changes'}</button></footer>
    </form>`;
  }

  function detailValue(label, value, full = false) {
    return `<div class="detail-field${full ? ' full' : ''}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '—')}</strong></div>`;
  }

  function safeReferenceUrl(value) {
    if (!value) return '';
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (_) {
      return '';
    }
  }

  function renderReadOnlyDrawer(record) {
    const title = record[FIELDS.title] || 'Untitled activity';
    const phaseName = choiceLabel(FIELDS.projectPhase, record[FIELDS.projectPhase]);
    const statusName = choiceLabel(FIELDS.status, record[FIELDS.status]) || 'Unspecified';
    const typeName = choiceLabel(FIELDS.activityType, record[FIELDS.activityType]) || 'Activity';
    const reasonName = choiceLabel(FIELDS.reason, record[FIELDS.reason]);
    const healthName = choiceLabel(FIELDS.activityHealth, record[FIELDS.activityHealth]);
    const quarter = choiceLabel(FIELDS.plannedQuarter, record[FIELDS.plannedQuarter]);
    const referenceUrl = safeReferenceUrl(record[FIELDS.referenceUrl]);
    $('#detail-drawer').innerHTML = `<header class="drawer-header">
      <div><span class="dialog-eyebrow">ASSURANCE ACTIVITY</span><h2>${escapeHtml(title)}</h2><p class="drawer-subtitle">${escapeHtml(typeName)} · ${escapeHtml(record[FIELDS.discipline] || 'Unassigned area')}</p></div>
      <button class="icon-button" type="button" aria-label="Close activity details" data-drawer-action="close">×</button>
    </header>
    <div class="drawer-content assurance-drawer-content">
      <div class="detail-profile assurance-detail-profile"><span class="assurance-detail-icon" aria-hidden="true">✓</span><div><strong>${escapeHtml(statusName)}</strong><span>${escapeHtml(phaseName || 'Phase not assigned')}${isOverdue(record) ? ' · Overdue' : ''}</span></div>${statusMarkup(record, true)}</div>
      <section class="detail-section"><h3>General</h3><div class="detail-grid">
        ${detailValue('Activity', title, true)}
        ${detailValue('Project', projectName(recordProjectId(record)))}
        ${detailValue('Project phase', phaseName)}
        ${detailValue('Discipline / area', record[FIELDS.discipline])}
        ${detailValue('Activity type', typeName)}
        ${detailValue('Status', statusName)}
        ${detailValue('Source', choiceLabel(FIELDS.source, record[FIELDS.source]))}
      </div></section>
      <section class="detail-section"><h3>Responsibility</h3><div class="detail-grid">
        ${detailValue('Responsible party', responsibleParty(record), true)}
        ${detailValue('Responsible person', readLookupName(record, 'person'))}
        ${detailValue('Responsible organisation', readLookupName(record, 'organisation'))}
        ${detailValue('Responsible discipline', readLookupName(record, 'discipline'))}
        ${detailValue('Responsible assignment', record[FIELDS.responsibleAssignment])}
      </div></section>
      <section class="detail-section"><h3>Assurance details</h3><div class="detail-grid">
        ${detailValue('Reason', reasonName)}
        ${detailValue('Focus area', record[FIELDS.focusArea])}
        ${detailValue('Scope of work', record[FIELDS.description], true)}
        ${detailValue('Objective', record[FIELDS.objective], true)}
      </div></section>
      <section class="detail-section"><h3>Planning</h3><div class="detail-grid">
        ${detailValue('Planned date', formatDate(record[FIELDS.plannedStartDate]))}
        ${detailValue('Target date', formatDate(record[FIELDS.targetDate]))}
        ${detailValue('Planned period', [quarter, record[FIELDS.plannedYear]].filter(Boolean).join(' '))}
        ${detailValue('Actual completion', formatDate(record[FIELDS.actualCompletionDate]))}
        ${detailValue('Activity health', healthName)}
      </div></section>
      <section class="detail-section"><h3>Evidence &amp; follow-up</h3><div class="detail-grid">
        ${detailValue('Activity reference', record[FIELDS.activityReference])}
        ${detailValue('Reference number', record[FIELDS.referenceNumber])}
        ${detailValue('Reference description', record[FIELDS.referenceDescription], true)}
        ${detailValue('Comment', record[FIELDS.comment], true)}
        ${detailValue('Current comment', record[FIELDS.currentComment], true)}
      </div>${referenceUrl ? `<a class="open-reference" href="${escapeHtml(referenceUrl)}" target="_blank" rel="noopener noreferrer">↗ Open reference</a>` : (record[FIELDS.referenceUrl] ? '<p class="invalid-reference">The saved reference is not a valid HTTP or HTTPS link.</p>' : '')}
      <div class="linked-references" id="linked-references"><h4>Linked document references</h4><p>Loading related references…</p></div></section>
      <footer class="drawer-actions"><button class="button button-secondary" type="button" data-drawer-action="close">Close</button><button class="button button-primary" type="button" data-drawer-action="edit">Edit activity</button></footer>
    </div>`;
  }

  function focusDrawer() {
    window.requestAnimationFrame(() => {
      const drawer = $('#detail-drawer');
      if (drawer.classList.contains('open')) {
        drawer.querySelector('button, input, select, textarea, a[href]')?.focus({ preventScroll: true });
      }
    });
  }

  function openDrawer(record = null) {
    state.referenceRequestId += 1;
    state.returnFocus = document.activeElement;
    state.editingId = record ? normalizeId(record[FIELDS.id]) : '';
    state.drawerMode = record ? 'view' : 'create';
    const drawer = $('#detail-drawer');
    if (record) {
      renderReadOnlyDrawer(record);
    } else {
      drawer.innerHTML = `<header class="drawer-header"><div><span class="dialog-eyebrow">NEW ASSURANCE ACTIVITY</span><h2>Add Activity</h2><p class="drawer-subtitle">Create a Project Activity record for ${escapeHtml(projectName(state.selectedProjectId))}.</p></div><button class="icon-button" type="button" aria-label="Close activity form" data-drawer-action="close">×</button></header><div class="drawer-content assurance-drawer-content">${formMarkup(null, true)}</div>`;
    }
    $('#drawer-scrim').hidden = false;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    focusDrawer();
    if (record) loadActivityReferences(record);
  }

  async function loadActivityReferences(activity) {
    const requestId = state.referenceRequestId;
    const activityId = normalizeId(activity[FIELDS.id]);
    const container = $('#linked-references');
    if (!container) return;
    try {
      const options = `?${new URLSearchParams({
        '$select': 'cr952_referencenumber,cr952_referencetype,cr952_documentrevision',
        '$filter': `_cr952_projectactivity_value eq ${activityId}`,
        '$orderby': 'cr952_referencenumber asc'
      }).toString()}`;
      const references = await retrieveAll(REFERENCE_TABLE, options);
      if (requestId !== state.referenceRequestId || !$('#detail-drawer').classList.contains('open') || state.editingId !== activityId) return;
      container.innerHTML = references.length
        ? references.map((reference) => `<div class="linked-reference"><strong>${escapeHtml(reference.cr952_referencenumber || 'Reference')}</strong><span>${escapeHtml(reference.cr952_referencetype || 'Document')}${reference.cr952_documentrevision ? ` · Rev ${escapeHtml(reference.cr952_documentrevision)}` : ''}</span></div>`).join('')
        : '<p>No linked document references.</p>';
    } catch (error) {
      if (requestId !== state.referenceRequestId) return;
      container.innerHTML = `<p class="invalid-reference">Could not load linked references: ${escapeHtml(error.message || 'Dataverse request failed.')}</p>`;
    }
  }

  function closeDrawer() {
    state.referenceRequestId += 1;
    const returnFocus = state.returnFocus;
    state.returnFocus = null;
    const drawer = $('#detail-drawer');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    $('#drawer-scrim').hidden = true;
    state.drawerMode = '';
    state.editingId = '';
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }

  function getFormValues(form) {
    const values = new FormData(form);
    const get = (name) => String(values.get(name) || '').trim();
    const data = {};
    const textFields = {
      title: FIELDS.title,
      activityReference: FIELDS.activityReference,
      area: FIELDS.discipline,
      assignment: FIELDS.responsibleAssignment,
      focusArea: FIELDS.focusArea,
      description: FIELDS.description,
      objective: FIELDS.objective,
      referenceNumber: FIELDS.referenceNumber,
      referenceDescription: FIELDS.referenceDescription,
      referenceUrl: FIELDS.referenceUrl,
      comment: FIELDS.comment,
      currentComment: FIELDS.currentComment
    };
    Object.entries(textFields).forEach(([name, field]) => { data[field] = get(name) || null; });

    const dateFields = {
      plannedStartDate: FIELDS.plannedStartDate,
      targetDate: FIELDS.targetDate,
      actualCompletionDate: FIELDS.actualCompletionDate
    };
    Object.entries(dateFields).forEach(([name, field]) => {
      const value = get(name);
      data[field] = value ? new Date(`${value}T00:00:00.000Z`) : null;
    });

    const year = get('plannedYear');
    data[FIELDS.plannedYear] = year ? Number(year) : null;

    [FIELDS.activityType, FIELDS.activityHealth, FIELDS.plannedQuarter, FIELDS.projectPhase, FIELDS.reason, FIELDS.source, FIELDS.status].forEach((field) => {
      const value = get(field);
      data[field] = value === '' ? null : Number(value);
    });

    const projectId = normalizeId(get('project'));
    if (!projectId) throw new Error('Select a project before saving.');
    const project = state.projectById.get(projectId);
    if (!project) throw new Error('The selected project is not available in Dataverse.');
    data['cr952_Project@odata.bind'] = `/${state.projectMetadata.EntitySetName}(${projectId})`;

    Object.entries(LOOKUPS).forEach(([key, config]) => {
      const id = normalizeId(get(key));
      const lookup = state.lookups[key];
      if (id) {
        if (!lookup?.metadata?.EntitySetName) throw new Error(`Dataverse metadata for ${config.label} is unavailable.`);
        data[`${config.navigation}@odata.bind`] = `/${lookup.metadata.EntitySetName}(${id})`;
      } else {
        data[config.field] = null;
      }
    });
    return { data, projectId, phase: data[FIELDS.projectPhase] };
  }

  async function saveActivity(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector('button[type="submit"]');
    const errorBox = $('#form-error', form);
    errorBox.hidden = true;
    if (!form.reportValidity()) return;
    submit.disabled = true;
    submit.textContent = 'Saving…';
    try {
      const { data, projectId, phase } = getFormValues(form);
      if (state.drawerMode === 'create') {
        await state.xrm.WebApi.createRecord(TABLE, data);
        showToast('Activity created in Dataverse.');
      } else {
        await state.xrm.WebApi.updateRecord(TABLE, state.editingId, data);
        showToast('Activity saved to Dataverse.');
      }
      state.selectedProjectId = projectId;
      state.selectedPhase = phase;
      renderProjectSelect();
      if (state.selectedPhase === null || !choiceOptions(FIELDS.projectPhase).some((option) => Number(option.value) === Number(state.selectedPhase))) {
        state.selectedPhase = choiceOptions(FIELDS.projectPhase)[0]?.value ?? null;
      }
      renderPhaseTabs();
      await loadProjectRecords();
      const savedId = state.editingId;
      closeDrawer();
      if (savedId) {
        const updated = state.records.find((record) => normalizeId(record[FIELDS.id]) === savedId);
        if (updated) openDrawer(updated);
      }
    } catch (error) {
      errorBox.textContent = error.message || 'Dataverse could not save this activity.';
      errorBox.hidden = false;
      submit.disabled = false;
      submit.textContent = state.drawerMode === 'create' ? 'Create activity' : 'Save changes';
    }
  }

  function startEdit() {
    const record = state.records.find((item) => normalizeId(item[FIELDS.id]) === state.editingId);
    if (!record) return;
    state.referenceRequestId += 1;
    state.drawerMode = 'edit';
    $('#detail-drawer').innerHTML = `<header class="drawer-header"><div><span class="dialog-eyebrow">EDIT ASSURANCE ACTIVITY</span><h2>${escapeHtml(record[FIELDS.title] || 'Untitled activity')}</h2><p class="drawer-subtitle">Changes are saved to the Project Activity record in Dataverse.</p></div><button class="icon-button" type="button" aria-label="Close activity form" data-drawer-action="close">×</button></header><div class="drawer-content assurance-drawer-content">${formMarkup(record, false)}</div>`;
    focusDrawer();
  }

  function onProjectChange() {
    state.selectedProjectId = normalizeId($('#project-filter').value);
    state.launchPhase = null;
    state.selectedPhase = selectedLaunchPhase();
    renderPhaseTabs();
    loadProjectRecords();
  }

  function clearFilters() {
    $('#activity-type-filter').value = '';
    $('#area-filter').value = '';
    $('#responsible-filter').value = '';
    $('#status-filter').value = '';
    $('#search-input').value = '';
    state.sort = 'default';
    $('#sort-select').value = 'default';
    $('#secondary-filters').closest('.assurance-filters').classList.remove('filters-open');
    $('#toggle-filters').setAttribute('aria-expanded', 'false');
    $('#toggle-filters').innerHTML = 'More filters <span aria-hidden="true">⌄</span>';
    renderRecords();
  }

  $('#project-filter').addEventListener('change', onProjectChange);
  $('#phase-tabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-phase]');
    if (!button) return;
    state.selectedPhase = Number(button.dataset.phase);
    renderPhaseTabs();
    updateProjectHeader();
    renderRecords();
  });
  ['#activity-type-filter', '#area-filter', '#responsible-filter', '#status-filter'].forEach((selector) => $(selector).addEventListener('change', renderRecords));
  $('#search-input').addEventListener('input', renderRecords);
  $('#sort-select').addEventListener('change', (event) => { state.sort = event.currentTarget.value; renderRecords(); });
  $('#clear-filters').addEventListener('click', clearFilters);
  $('#toggle-filters').addEventListener('click', () => {
    const expanded = $('#toggle-filters').getAttribute('aria-expanded') !== 'true';
    $('#toggle-filters').setAttribute('aria-expanded', String(expanded));
    $('#toggle-filters').innerHTML = `${expanded ? 'Hide filters' : 'More filters'} <span aria-hidden="true">${expanded ? '⌃' : '⌄'}</span>`;
    $('.assurance-filters').classList.toggle('filters-open', expanded);
  });
  $('#show-overdue').addEventListener('click', () => { $('#status-filter').value = 'overdue'; renderRecords(); });
  $('#add-activity').addEventListener('click', () => openDrawer());
  $('#empty-add').addEventListener('click', () => openDrawer());
  $('#activity-groups').addEventListener('click', (event) => {
    const button = event.target.closest('[data-activity-id]');
    if (!button) return;
    const record = state.records.find((item) => normalizeId(item[FIELDS.id]) === normalizeId(button.dataset.activityId));
    if (record) openDrawer(record);
  });
  $('#drawer-scrim').addEventListener('click', closeDrawer);
  $('#detail-drawer').addEventListener('click', (event) => {
    const action = event.target.closest('[data-drawer-action]')?.dataset.drawerAction;
    if (action === 'close') closeDrawer();
    if (action === 'cancel') {
      if (state.drawerMode === 'edit') {
        const record = state.records.find((item) => normalizeId(item[FIELDS.id]) === state.editingId);
        if (record) {
          state.drawerMode = 'view';
          renderReadOnlyDrawer(record);
          focusDrawer();
          loadActivityReferences(record);
        } else closeDrawer();
      } else closeDrawer();
    }
    if (action === 'edit') startEdit();
  });
  $('#detail-drawer').addEventListener('submit', (event) => {
    if (event.target.id === 'activity-form') saveActivity(event);
  });
  document.addEventListener('keydown', (event) => {
    const drawer = $('#detail-drawer');
    if (!drawer.classList.contains('open')) return;
    if (event.key === 'Escape') {
      closeDrawer();
      return;
    }
    if (event.key === 'Tab') {
      const focusable = Array.from(drawer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (!drawer.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  initialize();
})();
