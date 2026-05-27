import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const STORAGE_KEY = "villa-con-cuore-leads";
const statuses = ["New", "Contacted", "Follow-Up", "Booked", "Closed"];
const types = ["Wedding", "Corporate", "Retreat", "Private Event", "Lodging", "Other"];
const interests = ["Villa Rental", "Event Booking", "Tour", "Partnership", "Photo Shoot", "Other"];
const assignees = ["Elvis", "Concierge", "Events", "Sales"];

const emptyLead = {
  contactName: "",
  organization: "",
  email: "",
  phone: "",
  leadType: "Wedding",
  interest: "Villa Rental",
  status: "New",
  followUpDate: "",
  assignedTo: "Elvis",
  notes: "",
};

const demoLeads = [
  {
    id: "lead-1",
    contactName: "Sofia Laurent",
    organization: "Laurent Family Office",
    email: "sofia@example.com",
    phone: "+1 415 555 0198",
    leadType: "Private Event",
    interest: "Villa Rental",
    status: "Follow-Up",
    followUpDate: "2026-06-02",
    assignedTo: "Elvis",
    notes: "Send courtyard capacity details and preferred weekend rates.",
    createdAt: "2026-05-20T12:00:00.000Z",
  },
  {
    id: "lead-2",
    contactName: "Marco Chen",
    organization: "Northstar Retreats",
    email: "marco@example.com",
    phone: "+1 212 555 0134",
    leadType: "Retreat",
    interest: "Event Booking",
    status: "New",
    followUpDate: "2026-05-27",
    assignedTo: "Concierge",
    notes: "Interested in a three-night executive retreat with chef service.",
    createdAt: "2026-05-23T12:00:00.000Z",
  },
  {
    id: "lead-3",
    contactName: "Amelia Stone",
    organization: "Stone & Co.",
    email: "amelia@example.com",
    phone: "+44 20 5555 0110",
    leadType: "Wedding",
    interest: "Tour",
    status: "Booked",
    followUpDate: "2026-06-12",
    assignedTo: "Events",
    notes: "Booked a private tour and tasting walkthrough.",
    createdAt: "2026-05-25T12:00:00.000Z",
  },
];

function loadLeads() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || demoLeads;
  } catch {
    return demoLeads;
  }
}

function App() {
  const [leads, setLeads] = useState(loadLeads);
  const [form, setForm] = useState(emptyLead);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  const selectedLead = leads.find((lead) => lead.id === selectedId) || leads[0] || null;
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      total: leads.length,
      new: leads.filter((lead) => lead.status === "New").length,
      due: leads.filter((lead) => lead.followUpDate && !["Booked", "Closed"].includes(lead.status) && new Date(`${lead.followUpDate}T00:00:00`) <= today).length,
      booked: leads.filter((lead) => lead.status === "Booked").length,
    };
  }, [leads]);

  const visibleLeads = useMemo(() => {
    const text = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const searchable = Object.values(lead).join(" ").toLowerCase();
      return (statusFilter === "All" || lead.status === statusFilter) && (typeFilter === "All" || lead.leadType === typeFilter) && searchable.includes(text);
    });
  }, [leads, query, statusFilter, typeFilter]);

  function changeField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyLead);
    setEditingId(null);
  }

  function saveLead(event) {
    event.preventDefault();
    if (editingId) {
      setLeads((current) => current.map((lead) => (lead.id === editingId ? { ...lead, ...form, updatedAt: new Date().toISOString() } : lead)));
      setSelectedId(editingId);
      resetForm();
      return;
    }
    const lead = { ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setLeads((current) => [lead, ...current]);
    setSelectedId(lead.id);
    resetForm();
  }

  function editLead(lead) {
    setEditingId(lead.id);
    setSelectedId(lead.id);
    setForm({
      contactName: lead.contactName,
      organization: lead.organization,
      email: lead.email,
      phone: lead.phone,
      leadType: lead.leadType,
      interest: lead.interest,
      status: lead.status,
      followUpDate: lead.followUpDate,
      assignedTo: lead.assignedTo,
      notes: lead.notes,
    });
  }

  function deleteLead(id) {
    const next = leads.filter((lead) => lead.id !== id);
    setLeads(next);
    if (selectedId === id) setSelectedId(next[0]?.id || null);
    if (editingId === id) resetForm();
  }

  function updateStatus(id, status) {
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
  }

  function exportCsv() {
    const header = ["Contact Name", "Organization", "Email", "Phone", "Lead Type", "Interest", "Status", "Follow-Up Date", "Assigned To", "Notes / Next Step"];
    const rows = visibleLeads.map((lead) => [lead.contactName, lead.organization, lead.email, lead.phone, lead.leadType, lead.interest, lead.status, lead.followUpDate, lead.assignedTo, lead.notes]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value || "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "villa-con-cuore-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Villa Con Cuore</p>
          <h1>Lead Tracker</h1>
        </div>
        <button className="secondary-button" onClick={exportCsv}>Export CSV</button>
      </header>

      <section className="stats-grid" aria-label="Lead stats">
        <article><span>Total Leads</span><strong>{stats.total}</strong></article>
        <article><span>New</span><strong>{stats.new}</strong></article>
        <article><span>Due Follow-Ups</span><strong>{stats.due}</strong></article>
        <article><span>Booked</span><strong>{stats.booked}</strong></article>
      </section>

      <section className="dashboard-grid">
        <form className="lead-form" onSubmit={saveLead}>
          <div className="panel-heading">
            <div><p className="eyebrow">{editingId ? "Edit Lead" : "Add Lead"}</p><h2>{editingId ? "Update inquiry" : "New inquiry"}</h2></div>
            {editingId && <button className="icon-button" type="button" onClick={resetForm}>X</button>}
          </div>
          <div className="form-grid">
            <label>Contact Name<input required value={form.contactName} onChange={(event) => changeField("contactName", event.target.value)} placeholder="Guest or planner name" /></label>
            <label>Organization<input value={form.organization} onChange={(event) => changeField("organization", event.target.value)} placeholder="Company, family, agency" /></label>
            <label>Email<input type="email" value={form.email} onChange={(event) => changeField("email", event.target.value)} placeholder="name@example.com" /></label>
            <label>Phone<input value={form.phone} onChange={(event) => changeField("phone", event.target.value)} placeholder="+1 000 000 0000" /></label>
            <label>Lead Type<select value={form.leadType} onChange={(event) => changeField("leadType", event.target.value)}>{types.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Interest<select value={form.interest} onChange={(event) => changeField("interest", event.target.value)}>{interests.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Status<select value={form.status} onChange={(event) => changeField("status", event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Follow-Up Date<input type="date" value={form.followUpDate} onChange={(event) => changeField("followUpDate", event.target.value)} /></label>
            <label>Assigned To<select value={form.assignedTo} onChange={(event) => changeField("assignedTo", event.target.value)}>{assignees.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="wide-field">Notes / Next Step<textarea rows="4" value={form.notes} onChange={(event) => changeField("notes", event.target.value)} placeholder="What should happen next?" /></label>
          </div>
          <button className="primary-button" type="submit">{editingId ? "Save changes" : "Add lead"}</button>
        </form>

        <section className="list-panel">
          <div className="panel-heading"><div><p className="eyebrow">Pipeline</p><h2>Leads</h2></div><span className="count-pill">{visibleLeads.length}</span></div>
          <div className="filters">
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search leads" />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option>All</option>{types.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
          <div className="lead-list">
            {visibleLeads.length === 0 && <p className="empty-state">No leads match those filters.</p>}
            {visibleLeads.map((lead) => (
              <article key={lead.id} className={`lead-card ${selectedLead?.id === lead.id ? "selected" : ""}`} onClick={() => setSelectedId(lead.id)}>
                <div className="lead-card-top">
                  <div><h3>{lead.contactName}</h3><p>{lead.organization || "No organization"}</p></div>
                  <select value={lead.status} onClick={(event) => event.stopPropagation()} onChange={(event) => updateStatus(lead.id, event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
                </div>
                <div className="lead-meta"><span>{lead.leadType}</span><span>{lead.interest}</span><span>{lead.followUpDate || "No follow-up"}</span></div>
              </article>
            ))}
          </div>
        </section>

        <aside className="detail-panel">
          <div className="panel-heading"><div><p className="eyebrow">Detail View</p><h2>{selectedLead ? selectedLead.contactName : "No lead selected"}</h2></div>{selectedLead && <span className={`status-pill status-${selectedLead.status.toLowerCase().replaceAll(" ", "-")}`}>{selectedLead.status}</span>}</div>
          {selectedLead ? <>
            <div className="detail-actions"><button className="secondary-button" onClick={() => editLead(selectedLead)}>Edit</button><button className="danger-button" onClick={() => deleteLead(selectedLead.id)}>Delete</button></div>
            <dl className="detail-list">
              <div><dt>Organization</dt><dd>{selectedLead.organization || "Not provided"}</dd></div>
              <div><dt>Email</dt><dd>{selectedLead.email || "Not provided"}</dd></div>
              <div><dt>Phone</dt><dd>{selectedLead.phone || "Not provided"}</dd></div>
              <div><dt>Lead Type</dt><dd>{selectedLead.leadType}</dd></div>
              <div><dt>Interest</dt><dd>{selectedLead.interest}</dd></div>
              <div><dt>Follow-Up Date</dt><dd>{selectedLead.followUpDate || "Not scheduled"}</dd></div>
              <div><dt>Assigned To</dt><dd>{selectedLead.assignedTo}</dd></div>
              <div><dt>Notes / Next Step</dt><dd>{selectedLead.notes || "No notes yet."}</dd></div>
            </dl>
          </> : <p className="empty-state">Add a lead to see details here.</p>}
        </aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
