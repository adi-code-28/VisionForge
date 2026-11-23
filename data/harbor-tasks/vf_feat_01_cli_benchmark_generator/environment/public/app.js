const $ = s => document.querySelector(s);
let visualTasks = [], featureTasks = [], selectedVisual, selectedFeature;

async function request(url, options = {}) {
  const r = await fetch(url, options);
  const body = await r.json();
  if (!r.ok) throw new Error(body.error || 'Request failed');
  return body;
}

// Tab navigation
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const pane = $(`#tab-${tab.dataset.tab}`);
    if (pane) pane.classList.add('active');
  });
});

// Render Feature Tasks
function renderFeatureList() {
  $('#featureCount').textContent = featureTasks.length;
  const list = $('#featureList');
  list.innerHTML = '';
  featureTasks.forEach(task => {
    const item = document.createElement('button');
    item.className = `task-row ${selectedFeature?.id === task.id ? 'active' : ''}`;
    item.innerHTML = `
      <span class="pill"></span>
      <strong>${task.title}</strong>
      <small>${task.category} · ${task.difficulty} · Base: ${task.startingVersion}</small>
    `;
    item.onclick = () => {
      selectedFeature = task;
      renderFeatureList();
      renderFeatureDetail();
    };
    list.appendChild(item);
  });
}

function renderFeatureDetail() {
  if (!selectedFeature) return;
  const t = selectedFeature;
  const container = $('#featureDetail');
  container.innerHTML = `
    <div class="task-head">
      <div>
        <span class="tag category">${t.category}</span>
        <h2 class="task-title">${t.title}</h2>
      </div>
      <span class="tag diff">${t.difficulty}</span>
    </div>

    <div class="file-meta-grid">
      <div class="meta-card">
        <label>STARTING REPOSITORY VERSION</label>
        <b>${t.startingVersion} (${t.baseCommit})</b>
      </div>
      <div class="meta-card">
        <label>TARGET FILES</label>
        <b>${t.targetFiles.join(', ')}</b>
      </div>
      <div class="meta-card">
        <label>HARBOR TEST SUITE</label>
        <b>${t.testFileName}</b>
      </div>
    </div>

    <h4 style="margin: 18px 0 6px;">Requirements & Task Instruction (instruction.md)</h4>
    <div class="instruction-box">${t.instruction.replace(/</g, '&lt;')}</div>

    <div class="file-meta-grid">
      <div class="meta-card">
        <label>HARBOR SPECIFICATION</label>
        <b>data/harbor-tasks/${t.id}/task.toml</b>
      </div>
      <div class="meta-card">
        <label>ISOLATED ENVIRONMENT</label>
        <b>Node 22 Alpine Dockerfile</b>
      </div>
      <div class="meta-card">
        <label>REFERENCE IMPLEMENTATION</label>
        <b>${t.solutionDir}/solve.sh</b>
      </div>
    </div>

    <div style="margin-top: 18px; display: flex; gap: 10px;">
      <button class="secondary" id="exportThisTask">⚓ Export / Update Harbor Package</button>
    </div>
    <div id="exportStatus" style="margin-top: 10px; font-size: 13px; color: var(--green);"></div>
  `;

  $('#exportThisTask').onclick = async () => {
    try {
      const res = await request('/api/strategy/export', { method: 'POST' });
      $('#exportStatus').textContent = `✔ Task exported successfully to data/harbor-tasks/${t.id}`;
    } catch (e) {
      alert(e.message);
    }
  };
}

// Load Evidence Matrix
async function loadEvidenceMatrix() {
  try {
    const res = await request('/api/strategy/evidence');
    const tableBody = $('#matrixTableBody');
    if (!res.evidence || !res.evidence.evidenceSummary) {
      tableBody.innerHTML = '<tr><td colspan="7">No evidence matrix data found.</td></tr>';
      return;
    }

    tableBody.innerHTML = '';
    res.evidence.evidenceSummary.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><code>${item.taskId}</code></td>
        <td><b>${item.taskId.replace('vf_feat_', '').replace(/_/g, ' ')}</b></td>
        <td>
          <span class="badge ${item.baseline.regressionPass ? 'success' : 'danger'}">Reg: ${item.baseline.regressionPass ? 'PASS' : 'FAIL'}</span>
          <span class="badge ${item.baseline.featureFail ? 'success' : 'danger'}">Feat: FAIL (Expected)</span>
        </td>
        <td>
          <span class="badge ${item.flawed.featureFail ? 'success' : 'danger'}">Feat: FAIL (Caught)</span>
        </td>
        <td>
          <span class="badge ${item.regressionBreak.regressionFail ? 'success' : 'danger'}">Reg: FAIL (Protected)</span>
        </td>
        <td>
          <span class="badge ${item.solution.regressionPass && item.solution.featurePass ? 'success' : 'danger'}">Both PASS</span>
        </td>
        <td>
          <span class="badge ${item.solution.reward === 1 ? 'success' : 'danger'}">Reward = ${item.solution.reward}</span>
        </td>
      `;
      tableBody.appendChild(row);
    });

    if (res.evidence.timestamp) {
      $('#matrixTimestamp').textContent = `Verified: ${new Date(res.evidence.timestamp).toLocaleTimeString()}`;
    }
  } catch (e) {
    console.error('Failed to load matrix:', e);
  }
}

// Visual Tasks (Legacy Mode)
function renderVisualList() {
  $('#taskCount').textContent = visualTasks.length;
  const list = $('#taskList');
  list.innerHTML = visualTasks.length ? '' : '<div class="empty">Generate a benchmark to begin.</div>';
  visualTasks.forEach(t => {
    const node = $('#taskTemplate').content.cloneNode(true);
    const row = node.querySelector('button');
    row.classList.toggle('active', t.id === selectedVisual?.id);
    row.querySelector('strong').textContent = t.question;
    row.querySelector('small').textContent = `${t.category.replace('_',' ')} · ${t.difficulty}`;
    row.onclick = () => {
      selectedVisual = t;
      renderVisualList();
      renderVisualDetail();
    };
    list.append(node);
  });
}

function renderVisualDetail() {
  if (!selectedVisual) return;
  const t = selectedVisual;
  $('#detail').innerHTML = `
    <div class="task-head">
      <div><span class="tag">${t.category.replace('_',' ')}</span><p class="question">${t.question}</p></div>
      <span class="tag">${t.difficulty}</span>
    </div>
    <img class="visual" alt="Synthetic urban scene" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(t.svg)}">
    <div class="file-meta-grid">
      <div class="meta-card"><label>GROUND TRUTH</label><b>${t.answer}</b></div>
      <div class="meta-card"><label>VALIDATION</label><b>${t.validation.valid ? '✓ Passed' : 'Review'}</b></div>
      <div class="meta-card"><label>SEED</label><b>${t.scene.seed}</b></div>
    </div>
  `;
}

// Global actions
$('#exportAllHarbor').onclick = async () => {
  try {
    $('#exportAllHarbor').disabled = true;
    $('#exportAllHarbor').textContent = 'Exporting…';
    await request('/api/strategy/export', { method: 'POST' });
    alert('Successfully exported all Harbor feature-development tasks to data/harbor-tasks/!');
  } catch (e) {
    alert(e.message);
  } finally {
    $('#exportAllHarbor').disabled = false;
    $('#exportAllHarbor').textContent = '⚓ Export Harbor Tasks';
  }
};

$('#generate').onclick = async () => {
  const btn = $('#generate');
  btn.disabled = true;
  btn.textContent = 'Generating…';
  try {
    const r = await request('/api/benchmarks/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        count: $('#count').value,
        seed: $('#seed').value,
        difficulty: $('#difficulty').value,
        category: $('#category').value
      })
    });
    visualTasks = [...r.tasks, ...visualTasks];
    selectedVisual = r.tasks[0];
    renderVisualList();
    renderVisualDetail();
  } catch (e) {
    alert(e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate visual tasks';
  }
};

// Initial load
async function init() {
  try {
    const fRes = await request('/api/strategy/features');
    featureTasks = fRes.features || [];
    if (featureTasks.length) selectedFeature = featureTasks[0];
    renderFeatureList();
    renderFeatureDetail();

    await loadEvidenceMatrix();

    const vRes = await request('/api/tasks');
    visualTasks = vRes.tasks || [];
    if (visualTasks.length) selectedVisual = visualTasks[0];
    renderVisualList();
    renderVisualDetail();
  } catch (e) {
    console.error('Initialization error:', e);
  }
}

init();
