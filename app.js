// Demo decisions - these are your Brief
let briefDecisions = [
  { id: 1, decision: "Approve Q4 Marketing Budget", reason: "$85k requested by marketing team. Due today.", owner: "Maya", rejected: "Option B - $50k cut" },
  { id: 2, decision: "Decide on onboarding email copy", reason: "Option A vs Option B. A/B test ready.", owner: "Alex", rejected: "Option B" },
  { id: 3, decision: "Confirm engineering hire for Backend role", reason: "Candidate: Alex Chen. Final interview passed.", owner: "You", rejected: "None" }
];

// Memory is saved in browser - this is your database for V1
let memory = JSON.parse(localStorage.getItem('kito_memory') || '[]');

function showTab(tab) {
  document.getElementById('tab-brief').style.display = tab === 'brief' ? 'block' : 'none';
  document.getElementById('tab-memory').style.display = tab === 'memory' ? 'block' : 'none';
  document.getElementById('btn-brief').className = tab === 'brief' ? 'active' : '';
  document.getElementById('btn-memory').className = tab === 'memory' ? 'active' : '';
  renderMemory();
}

function renderBrief() {
  const el = document.getElementById('brief-list');
  el.innerHTML = briefDecisions.map(d => `
    <div class="card">
      <b>${d.decision}</b><br>
      <small>${d.reason} | Owner: ${d.owner} | Rejected: ${d.rejected}</small><br>
      <button class="approve" onclick="approve(${d.id})">Approve + Save to Memory</button>
      <button class="dismiss">Dismiss</button>
    </div>
  `).join('') || '<p>All done. No decisions need you.</p>';
}

function approve(id) {
  const d = briefDecisions.find(x => x.id === id);
  // This is Decision Memory - save What, Who, Why, Rejected
  memory.unshift({
    decision: d.decision,
    decider: "You",
    reason: d.reason,
    rejected: d.rejected,
    owner: d.owner,
    date: new Date().toLocaleDateString()
  });
  localStorage.setItem('kito_memory', JSON.stringify(memory));
  briefDecisions = briefDecisions.filter(x => x.id !== id);
  renderBrief();
  alert('✓ Saved to Decision Memory');
  showTab('memory');
}

function renderMemory() {
  const q = document.getElementById('search')?.value.toLowerCase() || '';
  const filtered = memory.filter(m => m.decision.toLowerCase().includes(q));
  document.getElementById('memory-list').innerHTML = filtered.map(m => `
    <div class="card">
      <b>${m.decision}</b><br>
      <small>Decided by ${m.decider} on ${m.date} | Owner: ${m.owner}</small><br>
      <p>Why: ${m.reason}</p>
      <small>Rejected: ${m.rejected}</small>
    </div>
  `).join('') || '<p>No decisions saved yet. Approve one in Brief to save it.</p>';
}

renderBrief();
renderMemory();