import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CalendarDays,
  CircleDot,
  Download,
  Edit3,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "villa-con-cuore-leads";

const statusOptions = ["New", "Contacted", "Follow-Up", "Booked", "Closed"];
const leadTypeOptions = ["Wedding", "Corporate", "Retreat", "Private Event", "Lodging", "Other"];
const interestOptions = ["Villa Rental", "Event Booking", "Tour", "Partnership", "Photo Shoot", "Other"];
const assigneeOptions = ["Elvis", "Concierge", "Events", "Sales"];

const statCards = [
  { key: "total", label: "Total Leads", detail: "All inquiries" },
  { key: "new", label: "New", detail: "Needs first touch" },
  { key: "due", label: "Due Follow-Ups", detail: "Today or overdue" },
  { key: "booked", label: "Booked", detail: "Confirmed interest" },
];

const blankLead = {
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

const starterLeads = [
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
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterLeads;
  } catch {
    return starterLeads;
  }
}

function makeCsvValue(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function LeadForm({ form, isEditing, onCancel, onChange, onSubmit }) {
  return (
    <form className="lead-form" onSubmit={onSubmit}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{isEditing ? "Edit Lead" : "Add Lead"}</p>
          <h2>{isEditing ? form.contactName || "Lead details" : "New inquiry"}</h2>
        </div>
        {isEditing && (
          <button className="icon-button" type="button" onClick={onCancel} aria-label="Cancel editing">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="form-grid">
        <label>
          Contact Name
          <input
            required
            value={form.contactName}
            onChange={(event) => onChange("contactName", event.target.value)}
            placeholder="Guest or planner name"
          />
        </label>
        <label>
          Organization
          <input
            value={form.organization}
            onChange={(event) => onChange("organization", event.target.value)}
            placeholder="Company, family, agency"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="name@example.com"
          />
        </label>
        <label>
          Phone
          <input
            value={form.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            placeholder="+1 000 000 0000"
          />
        </label>
        <label>
          Lead Type
          <select value={form.leadType} onChange={(event) => onChange("leadType", event.target.value)}>
            {leadTypeOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Interest
          <select value={form.interest} onChange={(event) => onChange("interest", event.target.value)}>
            {interestOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={form.status} onChange={(event) => onChange("status", event.target.value)}>
            {statusOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Follow-Up Date
          <input
            type="date"
            value={form.followUpDate}
            onChange={(event) => onChange("followUpDate", event.target.value)}
          />
        </label>
        <label>
          Assigned To
          <select value={form.assignedTo} onChange={(event) => onChange("assignedTo", event.target.value)}>
            {assigneeOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="wide-field">
          Notes / Next Step
          <textarea
            value={form.notes}
            onChange={(event) => onChange("notes", event.target.value)}
            placeholder="What should happen next?"
            rows="4"
          />
        </label>
      </div>

      <button className="primary-button" type="submit">
        <Plus size={18} />
        {isEditing ? "Save changes" : "Add lead"}
      </button>
    </form>
  );
}

function App() {
  const [leads, setLeads] = useState(loadLeads);
  const [form, setForm] = useState(blankLead);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  const selectedLead = leads.find((lead) => lead.id === selectedId) ?? leads[0] ?? null;
  const isEditing = Boolean(editingId);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: leads.length,
      new: leads.filter((lead) => lead.status === "New").length,
      due: leads.filter((lead) => {
        if (!lead.followUpDate || lead.status === "Booked" || lead.status === "Closed") return false;
        return new Date(`${lead.followUpDate}T00:00:00`) <= today;
      }).length,
      booked: leads.filter((lead) => lead.status === "Booked").length,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const searchText = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
      const matchesType = typeFilter === "All" || lead.leadType === typeFilter;
      const haystack = [
        lead.contactName,
        lead.organization,
        lead.email,
        lead.phone,
        lead.leadType,
        lead.interest,
        lead.status,
        lead.assignedTo,
        lead.notes,
      ]
        .join(" ")
        .toLowerCase();
      return matchesStatus && matchesType && haystack.includes(searchText);
    });
  }, [leads, query, statusFilter, typeFilter]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(blankLead);
    setEditingId(null);
  }

  function saveLead(event) {
    event.preventDefault();

    if (editingId) {
      setLeads((current) =>
        current.map((lead) => (lead.id === editingId ? { ...lead, ...form, updatedAt: new Date().toISOString() } : lead)),
      );
      setSelectedId(editingId);
      resetForm();
      return;
    }

    const newLead = {
      ...form,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setLeads((current) => [newLead, ...current]);
    setSelectedId(newLead.id);
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
    const nextLeads = leads.filter((lead) => lead.id !== id);
    setLeads(nextLeads);
    if (selectedId === id) setSelectedId(nextLeads[0]?.id ?? null);
    if (editingId === id) resetForm();
  }

  function updateStatus(id, status) {
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
  }

  function exportCsv() {
    const headers = [
      "Contact Name",
      "Organization",
      "Email",
      "Phone",
      "Lead Type",
      "Interest",
      "Status",
      "Follow-Up Date",
      "Assigned To",
      "Notes / Next Step",
    ];
    const rows = filteredLeads.map((lead) => [
      lead.contactName,
      lead.organization,
      lead.email,
      lead.phone,
      lead.leadType,
      lead.interest,
      lead.status,
      lead.followUpDate,
      lead.assignedTo,
      lead.notes,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(makeCsvValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
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
          <p className="hero-copy">A quiet, no-login workspace for inquiries, next steps, and event follow-through.</p>
        </div>
        <div className="hero-actions">
          <span className="sync-pill">
            <CircleDot size={12} />
            Browser saved
          </span>
          <button className="secondary-button" type="button" onClick={exportCsv}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </header>

      <section className="stats-grid" aria-label="Lead stats">
        {statCards.map((card) => (
          <article key={card.key}>
            <span>{card.label}</span>
            <strong>{stats[card.key]}</strong>
            <small>{card.detail}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <LeadForm
          form={form}
          isEditing={isEditing}
          onCancel={resetForm}
          onChange={updateForm}
          onSubmit={saveLead}
        />

        <section className="list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Pipeline</p>
              <h2>Leads</h2>
            </div>
            <span className="count-pill">{filteredLeads.length}</span>
          </div>

          <div className="filters" aria-label="Search and filter leads">
            <label className="search-box">
              <Search size={18} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search leads"
              />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
              <option>All</option>
              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by lead type">
              <option>All</option>
              {leadTypeOptions.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="lead-list">
            {filteredLeads.length === 0 && <p className="empty-state">No leads match those filters.</p>}
            {filteredLeads.map((lead) => (
              <article
                className={`lead-card ${selectedLead?.id === lead.id ? "selected" : ""}`}
                key={lead.id}
                onClick={() => setSelectedId(lead.id)}
              >
                <div className="lead-card-top">
                  <div>
                    <h3>{lead.contactName}</h3>
                    <p>{lead.organization || "No organization"}</p>
                  </div>
                  <select
                    value={lead.status}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => updateStatus(lead.id, event.target.value)}
                    aria-label={`Update ${lead.contactName} status`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="lead-meta">
                  <span>{lead.leadType}</span>
                  <span>{lead.interest}</span>
                  <span className={lead.followUpDate ? "date-chip" : ""}>{lead.followUpDate || "No follow-up"}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="detail-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Detail View</p>
              <h2>{selectedLead ? selectedLead.contactName : "No lead selected"}</h2>
            </div>
            {selectedLead && <span className={`status-pill status-${selectedLead.status.toLowerCase().replaceAll(" ", "-")}`}>{selectedLead.status}</span>}
          </div>

          {selectedLead ? (
            <>
              <div className="detail-actions">
                <button className="secondary-button" type="button" onClick={() => editLead(selectedLead)}>
                  <Edit3 size={17} />
                  Edit
                </button>
                <button className="danger-button" type="button" onClick={() => deleteLead(selectedLead.id)}>
                  <Trash2 size={17} />
                  Delete
                </button>
              </div>

              <dl className="detail-list">
                <div>
                  <dt>Organization</dt>
                  <dd>{selectedLead.organization || "Not provided"}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd><Mail size={15} />{selectedLead.email || "Not provided"}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd><Phone size={15} />{selectedLead.phone || "Not provided"}</dd>
                </div>
                <div>
                  <dt>Lead Type</dt>
                  <dd>{selectedLead.leadType}</dd>
                </div>
                <div>
                  <dt>Interest</dt>
                  <dd>{selectedLead.interest}</dd>
                </div>
                <div>
                  <dt>Follow-Up Date</dt>
                  <dd><CalendarDays size={15} />{selectedLead.followUpDate || "Not scheduled"}</dd>
                </div>
                <div>
                  <dt>Assigned To</dt>
                  <dd>{selectedLead.assignedTo}</dd>
                </div>
                <div>
                  <dt>Notes / Next Step</dt>
                  <dd>{selectedLead.notes || "No notes yet."}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="empty-state">Add a lead to see details here.</p>
          )}
        </aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
