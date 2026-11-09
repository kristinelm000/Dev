(() => {
  'use strict';

  const STORAGE_KEY = 'northstar-competence-matrix-v1';
  const statuses = ['Completed', 'Required', 'Planned', 'In Progress', 'Not Applicable', 'Exempt'];
  const statusClass = {
    'Completed': 'completed', 'Required': 'required', 'Planned': 'in-progress',
    'In Progress': 'in-progress', 'Not Applicable': 'not-applicable', 'Exempt': 'exempt'
  };
  const statusDisplay = { 'Planned': 'Planned', 'In Progress': 'In progress' };
  const disciplines = ['Project Management', 'Commercial', 'HSES', 'Quality', 'Facility', 'Project Control & Economics', 'Subsurface', 'Drilling', 'Procurement', 'Interface', 'DCC & LCI', 'Commissioning', 'Operations'];
  const seed = {
    projects: [
      { id: 'nsr', name: 'North Sea Redevelopment', reference: 'NSR-TRN-004' },
      { id: 'atlas', name: 'Atlas CCS Development', reference: 'ATC-HR-012' }
    ],
    members: [
      { id: 'm1', projectId: 'nsr', name: 'Alex Morgan', discipline: 'Project Management', role: 'Project Manager', active: true },
      { id: 'm2', projectId: 'nsr', name: 'Sofia Eriksen', discipline: 'HSES', role: 'HSES Lead', active: true },
      { id: 'm3', projectId: 'nsr', name: 'Oliver Chen', discipline: 'Drilling', role: 'Drilling Engineer', active: true },
      { id: 'm4', projectId: 'nsr', name: 'Amara Okafor', discipline: 'Quality', role: 'Quality Advisor', active: true },
      { id: 'm5', projectId: 'nsr', name: 'Liam Patel', discipline: 'Commercial', role: 'Contracts Specialist', active: true },
      { id: 'm6', projectId: 'nsr', name: 'Ingrid Larsen', discipline: 'Commissioning', role: 'Commissioning Engineer', active: true },
      { id: 'm7', projectId: 'nsr', name: 'Noah Williams', discipline: 'Project Control & Economics', role: 'Project Controls Analyst', active: true },
      { id: 'm8', projectId: 'nsr', name: 'Maya Hassan', discipline: 'Operations', role: 'Operations Representative', active: false },
      { id: 'm9', projectId: 'nsr', name: 'Ethan Brooks', discipline: 'Procurement', role: 'Procurement Lead', active: true },
      { id: 'm10', projectId: 'atlas', name: 'Ella Thompson', discipline: 'Project Management', role: 'Project Engineer', active: true },
      { id: 'm11', projectId: 'atlas', name: 'Mikkel Sørensen', discipline: 'HSES', role: 'HSES Advisor', active: true },
      { id: 'm12', projectId: 'atlas', name: 'Ava Johnson', discipline: 'Subsurface', role: 'Subsurface Lead', active: true },
      { id: 'm13', projectId: 'atlas', name: 'Lucas Martin', discipline: 'Facility', role: 'Facilities Engineer', active: true },
      { id: 'm14', projectId: 'atlas', name: 'Grace Kim', discipline: 'DCC & LCI', role: 'Document Controller', active: true }
    ],
    requirements: [
      { id: 'r1', name: 'HSE Induction', category: 'Safety', description: 'Project-specific health, safety and environmental induction.', mandatory: true, disciplines: disciplines.slice() },
      { id: 'r2', name: 'Offshore Survival (BOSIET)', category: 'Safety', description: 'Valid offshore survival and emergency response certification.', mandatory: true, disciplines: ['Project Management', 'HSES', 'Drilling', 'Commissioning', 'Operations', 'Facility'] },
      { id: 'r3', name: 'Permit to Work', category: 'Competence', description: 'Demonstrated understanding of the project permit-to-work process.', mandatory: true, disciplines: ['Project Management', 'HSES', 'Drilling', 'Commissioning', 'Operations', 'Facility'] },
      { id: 'r4', name: 'Cyber Security Awareness', category: 'Training', description: 'Annual awareness training for protecting project information.', mandatory: true, disciplines: disciplines.slice() },
      { id: 'r5', name: 'Quality Management System', category: 'Competence', description: 'Introduction to project quality controls and assurance requirements.', mandatory: false, disciplines: ['Project Management', 'Quality', 'Commercial', 'Procurement', 'DCC & LCI', 'Project Control & Economics'] },
      { id: 'r6', name: 'Emergency Response', category: 'Safety', description: 'Role-specific emergency response training and muster responsibilities.', mandatory: true, disciplines: ['HSES', 'Drilling', 'Commissioning', 'Operations', 'Facility'] },
      { id: 'r7', name: 'Contract & Procurement Ethics', category: 'Compliance', description: 'Ethical conduct, conflicts of interest and procurement controls.', mandatory: true, disciplines: ['Commercial', 'Procurement', 'Project Management'] }
    ],
    records: [],
    lastUpdated: '2026-11-09T10:42:00'
  };
  seed.requirements.forEach((requirement) => {
    requirement.projectIds = [...new Set(seed.members.filter((member) => requirement.disciplines.includes(member.discipline)).map((member) => member.projectId))];
  });
  const defaults = [
    ['Completed', 'Completed', 'Completed', 'Completed', 'Completed', 'Completed', 'Completed'],
    ['Completed', 'Completed', 'Completed', 'Required', 'Completed', 'In Progress', 'Not Applicable'],
    ['Completed', 'Required', 'Planned', 'Completed', 'Not Applicable', 'Required', 'Not Applicable'],
    ['Completed', 'Not Applicable', 'Not Applicable', 'Completed', 'In Progress', 'Not Applicable', 'Not Applicable'],
    ['Completed', 'Not Applicable', 'Not Applicable', 'Completed', 'Required', 'Not Applicable', 'Completed'],
    ['Completed', 'Planned', 'In Progress', 'Completed', 'Not Applicable', 'Required', 'Not Applicable'],
    ['Completed', 'Not Applicable', 'Not Applicable', 'Completed', 'Completed', 'Not Applicable', 'Not Applicable'],
    ['Completed', 'Exempt', 'Not Applicable', 'Required', 'Not Applicable', 'Not Applicable', 'Not Applicable'],
    ['Completed', 'Not Applicable', 'Not Applicable', 'Completed', 'Planned', 'Not Applicable', 'Required']
  ];
  const dateFor = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  };
  const createSeedRecords = () => {
    const records = [];
    seed.members.forEach((member, memberIndex) => {
      const reqs = seed.requirements.filter((req) => req.disciplines.includes(member.discipline));
      reqs.forEach((requirement) => {
        const reqIndex = seed.requirements.findIndex((req) => req.id === requirement.id);
        const status = member.projectId === 'nsr'
          ? (defaults[memberIndex][reqIndex] || 'Required')
          : ['Completed', 'Completed', 'Planned', 'Completed', 'Required', 'In Progress', 'Completed'][(memberIndex + reqIndex) % 7];
        records.push({
          id: `rec-${member.id}-${requirement.id}`, projectId: member.projectId, memberId: member.id,
          requirementId: requirement.id, status,
          completionDate: status === 'Completed' ? dateFor(-((memberIndex + reqIndex) % 90 + 5)) : '',
          plannedDate: ['Required', 'Planned', 'In Progress'].includes(status) ? dateFor((memberIndex + reqIndex) % 35 - 8) : '',
          responsible: status === 'Completed' ? '' : ['Alex Morgan', 'Sofia Eriksen', 'Ingrid Larsen'][(memberIndex + reqIndex) % 3],
          comments: status === 'In Progress' ? 'Refresher booked; awaiting course confirmation.' : '',
          evidence: status === 'Completed' ? `CERT-${String(2100 + memberIndex * 12 + reqIndex)}` : ''
        });
      });
    });
    return records;
  };
  seed.records = createSeedRecords();

  const readStore = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return structuredClone(seed);
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.members) || !Array.isArray(parsed.requirements) || !Array.isArray(parsed.records)) throw new Error('Stored demo data has an invalid shape.');
      parsed.requirements.forEach((requirement) => {
        if (!Array.isArray(requirement.projectIds)) {
          requirement.projectIds = [...new Set(parsed.records.filter((record) => record.requirementId === requirement.id).map((record) => record.projectId))];
        }
      });
      return parsed;
    } catch (error) {
      console.error('Unable to load competence demo data:', error);
      return structuredClone(seed);
    }
  };
  let store = readStore();
  let activeProjectId = store.projects[0]?.id || '';
  let dialogMode = '';
  let editingRecordId = '';
  let detailTarget = null;
  let sortState = { key: 'planned', direction: 'asc' };
  let lastFocusedElement = null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const activeProject = () => store.projects.find((project) => project.id === activeProjectId);
  const projectMembers = () => store.members.filter((member) => member.projectId === activeProjectId);
  const projectRequirements = () => store.requirements.filter((requirement) => requirement.projectIds?.includes(activeProjectId) || store.records.some((record) => record.projectId === activeProjectId && record.requirementId === requirement.id));
  const memberById = (id) => store.members.find((member) => member.id === id);
  const requirementById = (id) => store.requirements.find((requirement) => requirement.id === id);
  const recordFor = (memberId, requirementId) => store.records.find((record) => record.projectId === activeProjectId && record.memberId === memberId && record.requirementId === requirementId);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const initials = (name) => name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  const shortDate = (value) => value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).format(new Date(`${value}T12:00:00`)) : '—';
  const longDate = (value) => value ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) : '—';
  const statusMarkup = (status) => `<span class="status-pill ${statusClass[status] || 'required'}"><i class="status-dot ${statusClass[status] || 'required'}"></i>${escapeHtml(statusDisplay[status] || status)}</span>`;
  const applicableRecords = () => store.records.filter((record) => record.projectId === activeProjectId && record.status !== 'Not Applicable' && record.status !== 'Exempt');
  const saveStore = () => {
    store.lastUpdated = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      return true;
    } catch (error) {
      console.error('Unable to save competence demo data:', error);
      showToast('Could not save changes in this browser. Check storage availability.');
      return false;
    }
  };
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    $('#toast-region').append(toast);
    window.setTimeout(() => toast.remove(), 3200);
  };
  const renderProjectSelect = () => {
    $('#project-select').innerHTML = store.projects.map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}</option>`).join('');
    $('#project-select').value = activeProjectId;
  };
  const renderSummary = () => {
    const members = projectMembers();
    const requirements = projectRequirements();
    const records = applicableRecords();
    const completed = records.filter((record) => record.status === 'Completed').length;
    const outstanding = records.filter((record) => record.status !== 'Completed').length;
    const percentage = records.length ? Math.round(completed / records.length * 100) : 0;
    $('#breadcrumb-project').textContent = activeProject()?.name || 'Project';
    $('#project-reference').textContent = activeProject()?.reference || '—';
    $('#updated-at').textContent = store.lastUpdated ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(store.lastUpdated)) : '—';
    $('#member-count').textContent = members.length;
    $('#requirement-count').textContent = requirements.length;
    $('#completed-count').textContent = completed;
    $('#outstanding-count').textContent = outstanding;
    $('#completion-rate').textContent = `${percentage}%`;
    $('#progress-bar').setAttribute('aria-valuenow', percentage);
    $('.progress-track span').style.width = `${percentage}%`;
    $('#outstanding-tab-count').textContent = outstanding;
  };
  const setOptions = (select, items, firstLabel) => {
    const previous = select.value;
    select.innerHTML = `<option value="">${escapeHtml(firstLabel)}</option>${items.map((item) => `<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`).join('')}`;
    if (items.some((item) => item.value === previous)) select.value = previous;
  };
  const renderFilters = () => {
    const members = projectMembers();
    const requirements = projectRequirements();
    const disciplineItems = [...new Set(members.map((member) => member.discipline))].sort().map((value) => ({ value, label: value }));
    const requirementItems = requirements.map((requirement) => ({ value: requirement.id, label: requirement.name }));
    const statusItems = statuses.map((status) => ({ value: status, label: statusDisplay[status] || status }));
    setOptions($('#discipline-filter'), disciplineItems, 'All disciplines');
    setOptions($('#requirement-filter'), requirementItems, 'All requirements');
    setOptions($('#status-filter'), statusItems, 'All statuses');
    setOptions($('#outstanding-discipline'), disciplineItems, 'All disciplines');
    setOptions($('#outstanding-status'), statusItems.filter((item) => ['Required', 'Planned', 'In Progress'].includes(item.value)), 'All statuses');
  };
  const currentFilters = () => ({
    search: $('#search-input').value.trim().toLowerCase(),
    discipline: $('#discipline-filter').value,
    requirement: $('#requirement-filter').value,
    status: $('#status-filter').value,
    outstandingOnly: $('#outstanding-only').checked
  });
  const getVisibleMatrixMembers = (members, requirements, filters) => members.filter((member) => {
    if (filters.search && !`${member.name} ${member.role} ${member.discipline}`.toLowerCase().includes(filters.search)) return false;
    if (filters.discipline && member.discipline !== filters.discipline) return false;
    const checkedRequirements = filters.requirement ? requirements.filter((requirement) => requirement.id === filters.requirement) : requirements;
    if (filters.status || filters.outstandingOnly) {
      const matched = checkedRequirements.some((requirement) => {
        const record = recordFor(member.id, requirement.id);
        return record && (!filters.status || record.status === filters.status) && (!filters.outstandingOnly || ['Required', 'Planned', 'In Progress'].includes(record.status));
      });
      if (!matched) return false;
    }
    return true;
  });
  const renderMatrix = () => {
    const members = projectMembers();
    const allRequirements = projectRequirements();
    const filters = currentFilters();
    const visibleMembers = getVisibleMatrixMembers(members, allRequirements, filters);
    const requirements = filters.requirement ? allRequirements.filter((requirement) => requirement.id === filters.requirement) : allRequirements;
    const table = $('#matrix-table');
    if (!visibleMembers.length || !requirements.length) {
      table.innerHTML = '';
      $('#matrix-scroll').hidden = true;
      $('#matrix-empty').hidden = false;
      $('#matrix-record-count').textContent = '0 members';
      $('#matrix-footer-count').textContent = 'Showing 0 members';
      return;
    }
    $('#matrix-scroll').hidden = false;
    $('#matrix-empty').hidden = true;
    const header = `<thead><tr><th class="member-head">EMPLOYEE <span style="font-weight:400;color:#9aa3b0">· ${visibleMembers.length}</span></th>${requirements.map((requirement) => `<th><div class="requirement-head"><span class="requirement-category">${escapeHtml(requirement.category)}</span><button type="button" data-requirement="${escapeHtml(requirement.id)}" title="View ${escapeHtml(requirement.name)}">${escapeHtml(requirement.name)}</button></div></th>`).join('')}</tr></thead>`;
    const byDiscipline = new Map();
    visibleMembers.forEach((member) => {
      if (!byDiscipline.has(member.discipline)) byDiscipline.set(member.discipline, []);
      byDiscipline.get(member.discipline).push(member);
    });
    const body = [...byDiscipline.entries()].map(([discipline, grouped]) => {
      const groupHeader = `<tr class="discipline-row"><td colspan="${requirements.length + 1}">${escapeHtml(discipline)} <span style="font-weight:400;color:#a1a8b3">(${grouped.length})</span></td></tr>`;
      const rows = grouped.map((member) => `<tr><td><div class="employee-cell"><span class="employee-avatar alt-${Number(member.id.replace(/\D/g, '')) % 5}" aria-hidden="true">${escapeHtml(initials(member.name))}</span><div><button type="button" class="employee-name" data-member="${escapeHtml(member.id)}">${escapeHtml(member.name)}</button>${member.active ? '' : '<span class="inactive-tag">Inactive</span>'}<div class="employee-role">${escapeHtml(member.role)}</div></div></div></td>${requirements.map((requirement) => {
        const record = recordFor(member.id, requirement.id);
        if (!record) return '<td><span class="cell-status-text">—</span></td>';
        const css = statusClass[record.status] || 'required';
        const display = record.status === 'Completed' && record.completionDate ? shortDate(record.completionDate) : (statusDisplay[record.status] || record.status);
        const title = `${record.status}${record.completionDate ? ` · Completed ${longDate(record.completionDate)}` : ''}${record.plannedDate ? ` · Planned ${longDate(record.plannedDate)}` : ''}`;
        return `<td><button class="matrix-cell cell-${css}" type="button" data-record="${escapeHtml(record.id)}" title="${escapeHtml(title)}"><i class="status-dot ${css}"></i><span class="${record.status === 'Completed' && record.completionDate ? 'cell-date' : 'cell-status-text'}">${escapeHtml(display)}</span></button></td>`;
      }).join('')}</tr>`).join('');
      return groupHeader + rows;
    }).join('');
    table.innerHTML = `${header}<tbody>${body}</tbody>`;
    $('#matrix-record-count').textContent = `${visibleMembers.length} ${visibleMembers.length === 1 ? 'member' : 'members'}`;
    $('#matrix-footer-count').textContent = `Showing ${visibleMembers.length} ${visibleMembers.length === 1 ? 'member' : 'members'}`;
  };
  const isOverdue = (record) => ['Required', 'Planned', 'In Progress'].includes(record.status) && record.plannedDate && record.plannedDate < dateFor(0);
  const outstandingRows = () => store.records.filter((record) => record.projectId === activeProjectId && ['Required', 'Planned', 'In Progress'].includes(record.status)).map((record) => ({ record, member: memberById(record.memberId), requirement: requirementById(record.requirementId) })).filter((row) => row.member && row.requirement);
  const renderOutstanding = () => {
    const query = $('#outstanding-search').value.trim().toLowerCase();
    const discipline = $('#outstanding-discipline').value;
    const status = $('#outstanding-status').value;
    let rows = outstandingRows().filter(({ record, member, requirement }) => {
      return (!query || `${member.name} ${member.discipline} ${requirement.name}`.toLowerCase().includes(query))
        && (!discipline || member.discipline === discipline) && (!status || record.status === status);
    });
    const { key, direction } = sortState;
    rows.sort((a, b) => {
      const values = {
        employee: a.member.name.localeCompare(b.member.name),
        discipline: a.member.discipline.localeCompare(b.member.discipline),
        requirement: a.requirement.name.localeCompare(b.requirement.name),
        status: a.record.status.localeCompare(b.record.status),
        planned: (a.record.plannedDate || '9999-12-31').localeCompare(b.record.plannedDate || '9999-12-31'),
        responsible: (a.record.responsible || '').localeCompare(b.record.responsible || '')
      };
      return (values[key] || 0) * (direction === 'asc' ? 1 : -1);
    });
    $('#outstanding-body').innerHTML = rows.length ? rows.map(({ record, member, requirement }) => {
      const overdue = isOverdue(record);
      return `<tr class="${overdue ? 'overdue-row' : ''}"><td><div class="table-person"><span class="employee-avatar alt-${Number(member.id.replace(/\D/g, '')) % 5}">${escapeHtml(initials(member.name))}</span>${escapeHtml(member.name)}</div></td><td>${escapeHtml(member.discipline)}</td><td><strong style="font-weight:600;color:#46556c">${escapeHtml(requirement.name)}</strong></td><td>${statusMarkup(record.status)}</td><td class="${overdue ? 'overdue-date' : ''}">${shortDate(record.plannedDate)}${overdue ? '<span class="overdue-badge">Overdue</span>' : ''}</td><td>${escapeHtml(record.responsible || '—')}</td></tr>`;
    }).join('') : '';
    $('.outstanding-view .table-scroll').hidden = !rows.length;
    $('#outstanding-empty').hidden = Boolean(rows.length);
    $('#outstanding-record-count').textContent = `${rows.length} ${rows.length === 1 ? 'record' : 'records'}`;
    $('#outstanding-footer-count').textContent = `Showing ${rows.length} ${rows.length === 1 ? 'record' : 'records'}`;
  };
  const refresh = () => { renderProjectSelect(); renderSummary(); renderFilters(); renderMatrix(); renderOutstanding(); };
  const field = (label, name, value = '', type = 'text', options = null, required = false, hint = '') => {
    const control = type === 'select'
      ? `<select id="${escapeHtml(name)}" name="${escapeHtml(name)}" ${required ? 'required' : ''}>${options.map((option) => `<option value="${escapeHtml(option.value)}" ${String(option.value) === String(value) ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select>`
      : type === 'textarea'
        ? `<textarea id="${escapeHtml(name)}" name="${escapeHtml(name)}" ${required ? 'required' : ''}>${escapeHtml(value)}</textarea>`
        : `<input id="${escapeHtml(name)}" name="${escapeHtml(name)}" type="${escapeHtml(type)}" value="${escapeHtml(value)}" ${required ? 'required' : ''}>`;
    return `<div class="form-field"><label for="${escapeHtml(name)}">${escapeHtml(label)}${required ? '<span class="required-mark">*</span>' : ''}</label>${control}${hint ? `<span class="form-hint">${escapeHtml(hint)}</span>` : ''}</div>`;
  };
  const showDialog = (mode, recordId = '') => {
    dialogMode = mode;
    editingRecordId = recordId;
    lastFocusedElement = document.activeElement;
    const overlay = $('#dialog-overlay');
    const fields = $('#dialog-fields');
    const record = store.records.find((item) => item.id === recordId);
    const members = projectMembers();
    const requirements = projectRequirements();
    const memberOptions = members.map((member) => ({ value: member.id, label: `${member.name} · ${member.discipline}` }));
    const requirementOptions = requirements.map((requirement) => ({ value: requirement.id, label: requirement.name }));
    const statusOptions = statuses.map((status) => ({ value: status, label: statusDisplay[status] || status }));
    let html = '';
    if (mode === 'record') {
      if (!record) {
        showToast('This record is no longer available.');
        return;
      }
      const member = memberById(record.memberId);
      const requirement = requirementById(record.requirementId);
      $('#dialog-eyebrow').textContent = 'COMPETENCE / TRAINING RECORD';
      $('#dialog-title').textContent = 'Update record';
      $('#dialog-description').textContent = 'Edit the status and supporting details for this requirement.';
      $('#dialog-submit').textContent = 'Save changes';
      html = `<div class="form-grid"><div class="form-field"><label for="memberDisplay">Employee</label><input id="memberDisplay" name="memberDisplay" value="${escapeHtml(member?.name || '')}" readonly></div><div class="form-field"><label for="requirementDisplay">Training / competence requirement</label><input id="requirementDisplay" name="requirementDisplay" value="${escapeHtml(requirement?.name || '')}" readonly></div>${field('Status', 'status', record.status, 'select', statusOptions, true)} ${field('Completion date', 'completionDate', record.completionDate || '', 'date')} ${field('Planned date', 'plannedDate', record.plannedDate || '', 'date')} ${field('Responsible person', 'responsible', record.responsible || '')} ${field('Comments', 'comments', record.comments || '', 'textarea')} ${field('Evidence / reference', 'evidence', record.evidence || '', 'text', null, false, 'Certificate number, document reference or evidence link.')}</div>`;
    } else if (mode === 'completion') {
      $('#dialog-eyebrow').textContent = 'PROJECT RECORD';
      $('#dialog-title').textContent = 'Record training completion';
      $('#dialog-description').textContent = 'Update a project member’s status and completion evidence.';
      $('#dialog-submit').textContent = 'Record completion';
      html = `<div class="form-grid">${field('Employee', 'memberId', members[0]?.id || '', 'select', memberOptions, true)} ${field('Training / competence requirement', 'requirementId', requirements[0]?.id || '', 'select', requirementOptions, true)} ${field('Status', 'status', 'Completed', 'select', statusOptions, true)} ${field('Completion date', 'completionDate', dateFor(0), 'date')} ${field('Planned date', 'plannedDate', '', 'date')} ${field('Responsible person', 'responsible', '')} ${field('Comments', 'comments', '', 'textarea')} ${field('Evidence / reference', 'evidence', '', 'text', null, false, 'Certificate number, document reference or evidence link.')}</div>`;
    } else if (mode === 'member') {
      $('#dialog-eyebrow').textContent = 'PROJECT ROSTER';
      $('#dialog-title').textContent = 'Add project member';
      $('#dialog-description').textContent = 'Add a person to the active project and create their applicable requirement records.';
      $('#dialog-submit').textContent = 'Add member';
      html = `<div class="form-grid">${field('Employee name', 'name', '', 'text', null, true)} ${field('Discipline / function', 'discipline', disciplines[0], 'select', disciplines.map((item) => ({ value: item, label: item })), true)} ${field('Role', 'role', '', 'text', null, true)} <div class="form-field"><label>Project status</label><label class="checkbox-row"><input type="checkbox" name="active" checked> Active project member</label></div></div>`;
    } else if (mode === 'requirement') {
      $('#dialog-eyebrow').textContent = 'PROJECT SCOPE';
      $('#dialog-title').textContent = 'Add training requirement';
      $('#dialog-description').textContent = 'Create a requirement and assign it to applicable disciplines.';
      $('#dialog-submit').textContent = 'Add requirement';
      html = `<div class="form-grid">${field('Requirement name', 'name', '', 'text', null, true)} ${field('Category', 'category', 'Training', 'select', ['Training', 'Competence', 'Safety', 'Compliance'].map((item) => ({ value: item, label: item })), true)} ${field('Description', 'description', '', 'textarea')} <div class="form-field full"><label>Applicable disciplines</label><div class="discipline-checks">${disciplines.map((item) => `<label class="checkbox-row"><input type="checkbox" name="disciplines" value="${escapeHtml(item)}">${escapeHtml(item)}</label>`).join('')}</div></div><div class="form-field full"><label class="checkbox-row"><input type="checkbox" name="mandatory" checked> Mandatory requirement</label></div></div>`;
    }
    fields.innerHTML = html;
    if (mode === 'completion') {
      const employeeSelect = $('select[name="memberId"]', fields);
      const requirementSelect = $('select[name="requirementId"]', fields);
      const updateRequirements = () => {
        const selectedMember = memberById(employeeSelect.value);
        const applicable = selectedMember ? requirements.filter((item) => item.disciplines.includes(selectedMember.discipline)) : [];
        requirementSelect.innerHTML = applicable.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('');
      };
      employeeSelect.addEventListener('change', updateRequirements);
      updateRequirements();
    }
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    const first = $('input:not([type=hidden]),select,textarea', fields);
    if (first) first.focus();
  };
  const closeDialog = () => {
    $('#dialog-overlay').hidden = true;
    document.body.style.overflow = '';
    dialogMode = '';
    editingRecordId = '';
    if (lastFocusedElement?.focus) lastFocusedElement.focus();
  };
  const openDrawer = (target) => {
    detailTarget = target;
    renderDrawer();
    $('#drawer-scrim').hidden = false;
    $('#detail-drawer').classList.add('open');
    $('#detail-drawer').setAttribute('aria-hidden', 'false');
  };
  const closeDrawer = () => {
    $('#detail-drawer').classList.remove('open');
    $('#detail-drawer').setAttribute('aria-hidden', 'true');
    $('#drawer-scrim').hidden = true;
    detailTarget = null;
  };
  const renderDrawer = () => {
    const content = $('#drawer-content');
    if (!detailTarget) return;
    if (detailTarget.type === 'member') {
      const member = memberById(detailTarget.id);
      if (!member) return closeDrawer();
      const records = store.records.filter((record) => record.projectId === activeProjectId && record.memberId === member.id);
      const applicable = records.filter((record) => !['Not Applicable', 'Exempt'].includes(record.status));
      const completed = applicable.filter((record) => record.status === 'Completed').length;
      const outstanding = applicable.length - completed;
      const percentage = applicable.length ? Math.round(completed / applicable.length * 100) : 0;
      content.innerHTML = `<header class="drawer-header"><div><span class="dialog-eyebrow">EMPLOYEE DETAILS</span><h2>${escapeHtml(member.name)}</h2><p class="drawer-subtitle">${escapeHtml(member.discipline)} · ${escapeHtml(member.role)}</p></div><button class="icon-button" aria-label="Close details" data-close-drawer>×</button></header><div class="drawer-content"><div class="detail-profile"><span class="employee-avatar alt-${Number(member.id.replace(/\D/g, '')) % 5}">${escapeHtml(initials(member.name))}</span><div><strong>${escapeHtml(member.name)}</strong><span>${escapeHtml(activeProject()?.name || '')} · ${member.active ? 'Active' : 'Inactive'}</span></div></div><div class="detail-stats"><div class="detail-stat"><strong>${applicable.length}</strong><span>Required items</span></div><div class="detail-stat"><strong>${completed}</strong><span>Completed</span></div><div class="detail-stat"><strong>${outstanding}</strong><span>Outstanding</span></div></div><div class="detail-progress"><div class="progress-copy"><div><strong>Completion</strong></div><strong class="progress-value">${percentage}%</strong></div><div class="progress-track"><span style="width:${percentage}%"></span></div></div><h3 class="section-title">Training &amp; competence requirements</h3><div class="detail-table-wrap"><table class="detail-table"><thead><tr><th>Requirement / category</th><th>Status</th><th>Completion date</th><th>Planned date</th><th>Comments</th></tr></thead><tbody>${records.map((record) => { const requirement = requirementById(record.requirementId); return `<tr><td><strong>${escapeHtml(requirement?.name || 'Requirement')}</strong><br><span style="color:#9aa2af">${escapeHtml(requirement?.category || '')}</span></td><td>${statusMarkup(record.status)}</td><td>${shortDate(record.completionDate)}</td><td>${shortDate(record.plannedDate)}</td><td>${escapeHtml(record.comments || '—')}</td></tr>`; }).join('')}</tbody></table></div><button class="button button-secondary drawer-action" data-edit-member-record="${escapeHtml(member.id)}">Update a requirement</button></div>`;
    } else {
      const requirement = requirementById(detailTarget.id);
      if (!requirement) return closeDrawer();
      const records = store.records.filter((record) => record.projectId === activeProjectId && record.requirementId === requirement.id);
      const applicable = records.filter((record) => !['Not Applicable', 'Exempt'].includes(record.status));
      const completed = applicable.filter((record) => record.status === 'Completed').length;
      const outstanding = applicable.length - completed;
      content.innerHTML = `<header class="drawer-header"><div><span class="dialog-eyebrow">${escapeHtml(requirement.category.toUpperCase())} REQUIREMENT</span><h2>${escapeHtml(requirement.name)}</h2><p class="drawer-subtitle">${requirement.mandatory ? 'Mandatory' : 'Optional'} · ${records.length} applicable project members</p></div><button class="icon-button" aria-label="Close details" data-close-drawer>×</button></header><div class="drawer-content"><div class="detail-profile"><span class="summary-icon requirements-icon" style="width:42px;height:42px;font-size:18px">▤</span><div><strong>${escapeHtml(requirement.name)}</strong><span>${requirement.mandatory ? 'Mandatory requirement' : 'Optional requirement'}</span></div></div><p style="font-size:11px;line-height:1.55;color:#778398">${escapeHtml(requirement.description || 'No description provided.')}</p><div class="section-title">Applicable disciplines</div><div style="display:flex;flex-wrap:wrap;gap:5px;margin:8px 0 16px">${requirement.disciplines.map((item) => `<span class="status-pill not-applicable">${escapeHtml(item)}</span>`).join('')}</div><div class="detail-stats"><div class="detail-stat"><strong>${applicable.length}</strong><span>Applicable</span></div><div class="detail-stat"><strong>${completed}</strong><span>Completed</span></div><div class="detail-stat"><strong>${outstanding}</strong><span>Outstanding</span></div></div><h3 class="section-title">Employees requiring this training</h3><div class="detail-list">${records.map((record) => { const member = memberById(record.memberId); return `<div class="detail-list-row"><div><strong>${escapeHtml(member?.name || '')}</strong><small>${escapeHtml(member?.discipline || '')}${record.completionDate ? ` · Completed ${shortDate(record.completionDate)}` : record.plannedDate ? ` · Planned ${shortDate(record.plannedDate)}` : ''}</small></div>${statusMarkup(record.status)}</div>`; }).join('')}</div></div>`;
    }
  };
  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData.entries());
    const previousStore = structuredClone(store);
    if (dialogMode === 'record') {
      const record = store.records.find((item) => item.id === editingRecordId);
      if (!record) return showToast('This record is no longer available.');
      record.status = values.status;
      record.completionDate = values.completionDate || '';
      record.plannedDate = values.plannedDate || '';
      record.responsible = values.responsible.trim();
      record.comments = values.comments.trim();
      record.evidence = values.evidence.trim();
    } else if (dialogMode === 'completion') {
      const record = recordFor(values.memberId, values.requirementId);
      if (!record) return showToast('No applicable record exists for this employee and requirement.');
      record.status = values.status;
      record.completionDate = values.completionDate || '';
      record.plannedDate = values.plannedDate || '';
      record.responsible = values.responsible.trim();
      record.comments = values.comments.trim();
      record.evidence = values.evidence.trim();
    } else if (dialogMode === 'member') {
      const member = { id: `member-${Date.now()}`, projectId: activeProjectId, name: values.name.trim(), discipline: values.discipline, role: values.role.trim(), active: formData.has('active') };
      store.members.push(member);
      projectRequirements().filter((requirement) => requirement.disciplines.includes(member.discipline)).forEach((requirement) => {
        store.records.push({ id: `rec-${member.id}-${requirement.id}`, projectId: activeProjectId, memberId: member.id, requirementId: requirement.id, status: 'Required', completionDate: '', plannedDate: '', responsible: '', comments: '', evidence: '' });
      });
    } else if (dialogMode === 'requirement') {
      const selectedDisciplines = formData.getAll('disciplines');
      if (!selectedDisciplines.length) return showToast('Select at least one applicable discipline.');
      const requirement = { id: `req-${Date.now()}`, projectIds: [activeProjectId], name: values.name.trim(), category: values.category, description: values.description.trim(), mandatory: formData.has('mandatory'), disciplines: selectedDisciplines };
      store.requirements.push(requirement);
      projectMembers().filter((member) => selectedDisciplines.includes(member.discipline)).forEach((member) => {
        store.records.push({ id: `rec-${member.id}-${requirement.id}`, projectId: activeProjectId, memberId: member.id, requirementId: requirement.id, status: 'Required', completionDate: '', plannedDate: '', responsible: '', comments: '', evidence: '' });
      });
    }
    if (!saveStore()) {
      store = previousStore;
      refresh();
      return;
    }
    const savedMode = dialogMode;
    closeDialog();
    refresh();
    if (detailTarget) renderDrawer();
    showToast(savedMode === 'member' ? 'Project member added.' : savedMode === 'requirement' ? 'Training requirement added.' : 'Record saved.');
  };
  const clearFilters = () => {
    $('#search-input').value = '';
    $('#discipline-filter').value = '';
    $('#requirement-filter').value = '';
    $('#status-filter').value = '';
    $('#outstanding-only').checked = false;
    refresh();
  };
  const exportCsv = () => {
    const rows = outstandingRows().map(({ record, member, requirement }) => [member.name, member.discipline, requirement.name, record.status, record.plannedDate, record.responsible || '']);
    const csv = [['Employee', 'Discipline', 'Training Requirement', 'Current Status', 'Planned Date', 'Responsible Person'], ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `${activeProject()?.reference || 'project'}-outstanding-training.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  $('#project-select').addEventListener('change', (event) => {
    activeProjectId = event.target.value;
    clearFilters();
    $('#outstanding-search').value = '';
    $('#outstanding-discipline').value = '';
    $('#outstanding-status').value = '';
    refresh();
  });
  $$('.tab').forEach((tab) => tab.addEventListener('click', () => {
    $$('.tab').forEach((item) => { item.classList.toggle('active', item === tab); item.setAttribute('aria-selected', item === tab ? 'true' : 'false'); });
    const outstanding = tab.dataset.view === 'outstanding';
    $('#matrix-view').hidden = outstanding;
    $('#outstanding-view').hidden = !outstanding;
  }));
  ['search-input', 'discipline-filter', 'requirement-filter', 'status-filter', 'outstanding-only'].forEach((id) => $(`#${id}`).addEventListener(id === 'search-input' ? 'input' : 'change', renderMatrix));
  ['outstanding-search', 'outstanding-discipline', 'outstanding-status'].forEach((id) => $(`#${id}`).addEventListener(id === 'outstanding-search' ? 'input' : 'change', renderOutstanding));
  $('#clear-filters').addEventListener('click', clearFilters);
  $('#empty-clear').addEventListener('click', clearFilters);
  $('#matrix-table').addEventListener('click', (event) => {
    const recordButton = event.target.closest('[data-record]');
    const memberButton = event.target.closest('[data-member]');
    const requirementButton = event.target.closest('[data-requirement]');
    if (recordButton) showDialog('record', recordButton.dataset.record);
    else if (memberButton) openDrawer({ type: 'member', id: memberButton.dataset.member });
    else if (requirementButton) openDrawer({ type: 'requirement', id: requirementButton.dataset.requirement });
  });
  $$('[data-dialog]').forEach((button) => button.addEventListener('click', () => showDialog(button.dataset.dialog)));
  $('#record-form').addEventListener('submit', handleFormSubmit);
  $$('#dialog-overlay [data-close-dialog]').forEach((button) => button.addEventListener('click', closeDialog));
  $('#dialog-overlay').addEventListener('click', (event) => { if (event.target === event.currentTarget) closeDialog(); });
  $('#drawer-scrim').addEventListener('click', closeDrawer);
  $('#drawer-content').addEventListener('click', (event) => {
    if (event.target.closest('[data-close-drawer]')) closeDrawer();
    const edit = event.target.closest('[data-edit-member-record]');
    if (edit) {
      const records = store.records.filter((record) => record.projectId === activeProjectId && record.memberId === edit.dataset.editMemberRecord);
      const record = records.find((item) => !['Completed', 'Not Applicable', 'Exempt'].includes(item.status)) || records[0];
      if (record) showDialog('record', record.id);
    }
  });
  $$('.data-table [data-sort]').forEach((button) => button.addEventListener('click', () => {
    const key = button.dataset.sort;
    sortState = { key, direction: sortState.key === key && sortState.direction === 'asc' ? 'desc' : 'asc' };
    renderOutstanding();
  }));
  $('#export-outstanding').addEventListener('click', exportCsv);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!$('#dialog-overlay').hidden) closeDialog();
      else if ($('#detail-drawer').classList.contains('open')) closeDrawer();
    }
    if (event.key === 'Tab' && !$('#dialog-overlay').hidden) {
      const focusable = $$('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])', $('.dialog'));
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  refresh();
})();
