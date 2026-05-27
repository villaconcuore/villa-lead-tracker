import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Download,
  Edit3,
  FileUp,
  Mail,
  Mic,
  Phone,
  Plus,
  Search,
  Square,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "villa-con-cuore-leads";
const DRAFT_KEY = "villa-con-cuore-lead-draft";

const statusOptions = ["New", "Contacted", "Follow-Up", "Interested", "Booked", "Not Interested"];
const sourceOptions = ["Referral", "Website", "Instagram", "Email", "Phone", "Partner", "Walk-in", "Other"];
const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "followUp", label: "Follow-up date" },
  { value: "status", label: "Status" },
];

const statCards = [
  { key: "total", label: "Total Leads", detail: "All inquiries" },
  { key: "new", label: "New", detail: "Needs first touch" },
  { key: "due", label: "Due Follow-Ups", detail: "Today or overdue" },
  { key: "booked", label: "Booked", detail: "Confirmed bookings" },
];

const blankLead = {
  contactName: "",
  organization: "",
  email: "",
  phone: "",
  source: "Referral",
  status: "New",
  followUpDate: "",
  notes: "",
};

const starterLeads = [
  {
    id: "lead-1",
    contactName: "Sofia Laurent",
    organization: "Laurent Family Office",
    email: "sofia@example.com",
    phone: "+1 415 555 0198",
    source: "Referral",
    leadType: "Private Event",
    interest: "Villa Rental",
    status: "Follow-Up",
    followUpDate: "2026-06-02",
    assignedTo: "Elvis",
    notes: "Send courtyard capacity details and preferred weekend rates.",
    createdAt: "2026-05-20T12:00:00.000Z",
    updatedAt: "2026-05-20T12:00:00.000Z",
  },
  {
    id: "lead-2",
    contactName: "Marco Chen",
    organization: "Northstar Retreats",
    email: "marco@example.com",
    phone: "+1 212 555 0134",
    source: "Website",
    leadType: "Retreat",
    interest: "Event Booking",
    status: "New",
    followUpDate: "2026-05-27",
    assignedTo: "Concierge",
    notes: "Interested in a three-night executive retreat with chef service.",
    createdAt: "2026-05-23T12:00:00.000Z",
    updatedAt: "2026-05-23T12:00:00.000Z",
  },
  {
    id: "lead-3",
    contactName: "Amelia Stone",
    organization: "Stone & Co.",
    email: "amelia@example.com",
    phone: "+44 20 5555 0110",
    source: "Instagram",
    leadType: "Wedding",
    interest: "Tour",
    status: "Booked",
    followUpDate: "2026-06-12",
    assignedTo: "Events",
    notes: "Booked a private tour and tasting walkthrough.",
    createdAt: "2026-05-25T12:00:00.000Z",
    updatedAt: "2026-05-25T12:00:00.000Z",
  },
];

function normalizeStatus(status) {
  if (status === "Closed") return "Not Interested";
  return statusOptions.includes(status) ? status : "New";
}

function normalizeSource(source) {
  return sourceOptions.includes(source) ? source : "Other";
}

function normalizeLead(lead, index = 0) {
  const createdAt = lead.createdAt || lead.createdDate || new Date().toISOString();

  return {
    ...lead,
    id: lead.id || `lead-${Date.now()}-${index}`,
    contactName: (lead.contactName || lead.name || "").trim(),
    organization: (lead.organization || lead.business || "").trim(),
    email: (lead.email || "").trim(),
    phone: (lead.phone || "").trim(),
    source: normalizeSource(lead.source),
    status: normalizeStatus(lead.status),
    followUpDate: lead.followUpDate || lead.followupDate || "",
    notes: lead.notes || lead.nextStep || "",
    createdAt,
    updatedAt: lead.updatedAt || lead.updatedDate || createdAt,
  };
}

function loadLeads() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : starterLeads;
    return Array.isArray(parsed) ? parsed.map(normalizeLead) : starterLeads.map(normalizeLead);
  } catch {
    return starterLeads.map(normalizeLead);
  }
}

function loadDraft() {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return blankLead;
    return { ...blankLead, ...JSON.parse(saved) };
  } catch {
    return blankLead;
  }
}

function makeCsvValue(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function formatDate(value) {
  if (!value) return "Not scheduled";
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function getStatusClass(status) {
  return `status-${status.toLowerCase().replaceAll(" ", "-")}`;
}

function cleanForm(form) {
  return {
    ...form,
    contactName: form.contactName.trim(),
    organization: form.organization.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    notes: form.notes.trim(),
  };
}

function validateLead(lead) {
  if (!lead.contactName) return "Add a contact name before saving.";
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return "Use a valid email address, or leave email blank.";
  }
  if (lead.phone) {
    const digits = lead.phone.replace(/\D/g, "");
    if (digits.length > 0 && digits.length < 7) return "Use a valid phone number, or leave phone blank.";
  }
  return "";
}

const dictationLabels = {
  contactName: "Name",
  organization: "Organization",
  phone: "Phone",
  email: "Email",
  notes: "Notes",
};

function mergeDictationValue(currentValue, transcript) {
  const cleanedTranscript = transcript.trim();
  if (!cleanedTranscript) return currentValue;
  if (!currentValue.trim()) return cleanedTranscript;
  return `${currentValue.trim()} ${cleanedTranscript}`;
}

function cleanVcardValue(value = "") {
  return value.replaceAll("\\n", "\n").replaceAll("\\,", ",").replaceAll("\\;", ";").trim();
}

function getVcardField(lines, fieldName) {
  const line = lines.find((item) => item.toUpperCase().startsWith(`${fieldName};`) || item.toUpperCase().startsWith(`${fieldName}:`));
  if (!line) return "";
  return cleanVcardValue(line.slice(line.indexOf(":") + 1));
}

function parseVcard(text) {
  const unfolded = text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/).filter(Boolean);
  const fullName = getVcardField(lines, "FN");
  const fallbackName = getVcardField(lines, "N").split(";").filter(Boolean).join(" ");

  return {
    contactName: fullName || fallbackName,
    organization: getVcardField(lines, "ORG"),
    email: getVcardField(lines, "EMAIL"),
    phone: getVcardField(lines, "TEL"),
    notes: getVcardField(lines, "NOTE"),
  };
}

function LeadForm({
  activeDictationField,
  contactPickerSupported,
  dictationSupported,
  form,
  isDictating,
  isEditing,
  onCancel,
  onChange,
  onFieldFocus,
  onImportContactFile,
  onPickContact,
  onStartDictation,
  onStopDictation,
  onSubmit,
}) {
  const contactFileRef = useRef(null);
  const activeLabel = dictationLabels[activeDictationField] || "Notes";

  return (
    <form className="lead-form" onSubmit={onSubmit}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{isEditing ? "Edit Lead" : "Add Lead"}</p>
          <h2>{isEditing ? form.contactName || "Lead details" : "New inquiry"}</h2>
        </div>
        <div className="heading-actions">
          <button
            className={`dictate-button ${isDictating ? "recording" : ""}`}
            type="button"
            onClick={isDictating ? onStopDictation : onStartDictation}
            disabled={!dictationSupported}
            title={
              dictationSupported
                ? `Dictate into ${activeLabel}`
                : "Dictation is not supported in this browser. Try Chrome or Safari."
            }
          >
            {isDictating ? <Square size={16} /> : <Mic size={17} />}
            {isDictating ? "Stop" : "Dictate"}
          </button>
          {isEditing && (
            <button className="icon-button" type="button" onClick={onCancel} aria-label="Cancel editing">
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      <p className="dictation-hint">
        {dictationSupported
          ? `Dictation fills the selected field: ${activeLabel}.`
          : "Dictation needs a browser with speech recognition, such as Chrome or Safari."}
      </p>

      <div className="contact-tools" aria-label="Contact import tools">
        <button
          className="secondary-button"
          type="button"
          onClick={onPickContact}
          title={
            contactPickerSupported
              ? "Choose someone from this device's contacts"
              : "This browser does not allow websites to open contacts directly. Use contact file import instead."
          }
        >
          <UserPlus size={17} />
          Choose Contact
        </button>
        <button className="secondary-button" type="button" onClick={() => contactFileRef.current?.click()}>
          <FileUp size={17} />
          Import Contact File
        </button>
        <input
          ref={contactFileRef}
          className="hidden-file-input"
          type="file"
          accept=".vcf,text/vcard,text/x-vcard"
          onChange={onImportContactFile}
        />
      </div>

      <div className="form-grid">
        <label>
          Name
          <input
            required
            value={form.contactName}
            onFocus={() => onFieldFocus("contactName")}
            onChange={(event) => onChange("contactName", event.target.value)}
            placeholder="Guest or planner name"
          />
        </label>
        <label>
          Organization / Business
          <input
            value={form.organization}
            onFocus={() => onFieldFocus("organization")}
            onChange={(event) => onChange("organization", event.target.value)}
            placeholder="Company, family, agency"
          />
        </label>
        <label>
          Phone
          <input
            inputMode="tel"
            value={form.phone}
            onFocus={() => onFieldFocus("phone")}
            onChange={(event) => onChange("phone", event.target.value)}
            placeholder="+1 000 000 0000"
          />
        </label>
        <label>
          Email
          <input
            inputMode="email"
            value={form.email}
            onFocus={() => onFieldFocus("email")}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="name@example.com"
          />
        </label>
        <label>
          Source
          <select value={form.source} onChange={(event) => onChange("source", event.target.value)}>
            {sourceOptions.map((option) => (
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
        <label className="wide-field">
          Follow-up date
          <input
            type="date"
            value={form.followUpDate}
            onChange={(event) => onChange("followUpDate", event.target.value)}
          />
        </label>
        <label className="wide-field">
          Notes
          <textarea
            value={form.notes}
            onFocus={() => onFieldFocus("notes")}
            onChange={(event) => onChange("notes", event.target.value)}
            placeholder="Next step, preferences, budget, or follow-up context"
            rows="5"
          />
        </label>
      </div>

      <div className="form-actions">
        <button className="primary-button" type="submit">
          <Plus size={18} />
          {isEditing ? "Save changes" : "Add lead"}
        </button>
        {isEditing && (
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function App() {
  const recognitionRef = useRef(null);
  const [leads, setLeads] = useState(loadLeads);
  const [form, setForm] = useState(loadDraft);
  const [activeDictationField, setActiveDictationField] = useState("notes");
  const [editingId, setEditingId] = useState(null);
  const [isDictating, setIsDictating] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortMode, setSortMode] = useState("newest");
  const [notice, setNotice] = useState(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const dictationSupported = Boolean(SpeechRecognition);
  const contactPickerSupported = Boolean(navigator.contacts?.select);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    if (editingId) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form, editingId]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const selectedLead = leads.find((lead) => lead.id === selectedId) ?? leads[0] ?? null;
  const isEditing = Boolean(editingId);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: leads.length,
      new: leads.filter((lead) => lead.status === "New").length,
      due: leads.filter((lead) => {
        if (!lead.followUpDate || ["Booked", "Not Interested"].includes(lead.status)) return false;
        return new Date(`${lead.followUpDate}T00:00:00`) <= today;
      }).length,
      booked: leads.filter((lead) => lead.status === "Booked").length,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const searchText = query.trim().toLowerCase();
    const filtered = leads.filter((lead) => {
      const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
      const haystack = [
        lead.contactName,
        lead.organization,
        lead.email,
        lead.phone,
        lead.source,
        lead.status,
        lead.notes,
      ]
        .join(" ")
        .toLowerCase();
      return matchesStatus && haystack.includes(searchText);
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "followUp") {
        const aTime = a.followUpDate ? new Date(`${a.followUpDate}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.followUpDate ? new Date(`${b.followUpDate}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      }
      if (sortMode === "status") {
        return statusOptions.indexOf(a.status) - statusOptions.indexOf(b.status);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [leads, query, statusFilter, sortMode]);

  function showNotice(type, message) {
    setNotice({ type, message });
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateFormFromDictation(field, transcript) {
    setForm((current) => ({
      ...current,
      [field]: mergeDictationValue(current[field] || "", transcript),
    }));
  }

  function mergeContactIntoForm(contact) {
    setForm((current) => ({
      ...current,
      contactName: contact.contactName || current.contactName,
      organization: contact.organization || current.organization,
      email: contact.email || current.email,
      phone: contact.phone || current.phone,
      source: current.source === blankLead.source ? "Phone" : current.source,
      notes: contact.notes ? mergeDictationValue(current.notes || "", contact.notes) : current.notes,
    }));
    setActiveDictationField("notes");
  }

  async function pickContact() {
    if (!contactPickerSupported) {
      showNotice("error", "This browser cannot open Contacts directly. Import a contact file instead.");
      return;
    }

    try {
      const availableProperties = navigator.contacts.getProperties
        ? await navigator.contacts.getProperties()
        : ["name", "email", "tel"];
      const requestedProperties = ["name", "email", "tel", "address"].filter((property) =>
        availableProperties.includes(property),
      );
      const contacts = await navigator.contacts.select(requestedProperties, { multiple: false });
      const contact = contacts?.[0];
      if (!contact) return;
      mergeContactIntoForm({
        contactName: contact.name?.[0] || "",
        email: contact.email?.[0] || "",
        phone: contact.tel?.[0] || "",
        notes: contact.address?.[0]?.addressLine?.join(", ") || "",
      });
      showNotice("success", "Contact added to the lead form.");
    } catch (error) {
      if (error?.name !== "AbortError") showNotice("error", "Could not open contacts on this device.");
    }
  }

  async function importContactFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const contact = parseVcard(text);
      if (!contact.contactName && !contact.email && !contact.phone) {
        showNotice("error", "That contact file did not include a name, email, or phone.");
        return;
      }
      mergeContactIntoForm(contact);
      showNotice("success", "Contact file added to the lead form.");
    } catch {
      showNotice("error", "Could not read that contact file.");
    } finally {
      event.target.value = "";
    }
  }

  function startDictation() {
    if (!dictationSupported) {
      showNotice("error", "Dictation is not available in this browser. Try Chrome or Safari.");
      return;
    }

    recognitionRef.current?.stop();

    const fieldToFill = activeDictationField || "notes";
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsDictating(true);
      showNotice("success", `Listening for ${dictationLabels[fieldToFill] || "Notes"}...`);
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();
      updateFormFromDictation(fieldToFill, transcript);
      if (transcript) showNotice("success", `Transcribed into ${dictationLabels[fieldToFill] || "Notes"}.`);
    };
    recognition.onerror = (event) => {
      showNotice("error", event.error === "not-allowed" ? "Microphone access was blocked." : "Dictation stopped before text was captured.");
    };
    recognition.onend = () => {
      setIsDictating(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopDictation() {
    recognitionRef.current?.stop();
    setIsDictating(false);
  }

  function resetForm() {
    setForm(blankLead);
    setEditingId(null);
    setActiveDictationField("notes");
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
  }

  function saveLead(event) {
    event.preventDefault();

    const cleaned = cleanForm(form);
    const validationMessage = validateLead(cleaned);
    if (validationMessage) {
      showNotice("error", validationMessage);
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      setLeads((current) =>
        current.map((lead) => (lead.id === editingId ? { ...lead, ...cleaned, updatedAt: now } : lead)),
      );
      setSelectedId(editingId);
      resetForm();
      clearDraft();
      showNotice("success", "Lead updated.");
      return;
    }

    const newLead = {
      ...cleaned,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setLeads((current) => [newLead, ...current]);
    setSelectedId(newLead.id);
    resetForm();
    clearDraft();
    showNotice("success", "Lead added.");
  }

  function editLead(lead) {
    setEditingId(lead.id);
    setSelectedId(lead.id);
    setForm({
      contactName: lead.contactName,
      organization: lead.organization,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      followUpDate: lead.followUpDate,
      notes: lead.notes,
    });
  }

  function deleteLead(lead) {
    const ok = window.confirm(`Delete ${lead.contactName || "this lead"}? This cannot be undone.`);
    if (!ok) return;

    const nextLeads = leads.filter((item) => item.id !== lead.id);
    setLeads(nextLeads);
    if (selectedId === lead.id) setSelectedId(nextLeads[0]?.id ?? null);
    if (editingId === lead.id) resetForm();
    showNotice("success", "Lead deleted.");
  }

  function updateStatus(id, status) {
    setLeads((current) =>
      current.map((lead) => (lead.id === id ? { ...lead, status, updatedAt: new Date().toISOString() } : lead)),
    );
    showNotice("success", `Status changed to ${status}.`);
  }

  function exportCsv() {
    const headers = [
      "Name",
      "Organization / Business",
      "Phone",
      "Email",
      "Source",
      "Status",
      "Follow-up Date",
      "Created Date",
      "Last Updated Date",
      "Notes",
    ];
    const rows = filteredLeads.map((lead) => [
      lead.contactName,
      lead.organization,
      lead.phone,
      lead.email,
      lead.source,
      lead.status,
      lead.followUpDate,
      lead.createdAt,
      lead.updatedAt,
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
    showNotice("success", "CSV export downloaded.");
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Villa Con Cuore</p>
          <h1>Lead Tracker</h1>
          <p className="hero-copy">A simple no-login workspace for inquiries, next steps, and team follow-through.</p>
        </div>
        <div className="hero-actions">
          <span className="sync-pill">
            <CircleDot size={12} />
            Device saved
          </span>
          <button className="secondary-button" type="button" onClick={exportCsv}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </header>

      {notice && (
        <div className={`notice notice-${notice.type}`} role="status">
          {notice.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notice.message}</span>
        </div>
      )}

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
          activeDictationField={activeDictationField}
          contactPickerSupported={contactPickerSupported}
          dictationSupported={dictationSupported}
          form={form}
          isDictating={isDictating}
          isEditing={isEditing}
          onCancel={resetForm}
          onChange={updateForm}
          onFieldFocus={setActiveDictationField}
          onImportContactFile={importContactFile}
          onPickContact={pickContact}
          onStartDictation={startDictation}
          onStopDictation={stopDictation}
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

          <div className="filters" aria-label="Search, filter, and sort leads">
            <label className="search-box">
              <Search size={18} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, business, email, phone, notes"
              />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
              <option>All</option>
              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value)} aria-label="Sort leads">
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="lead-list">
            {leads.length === 0 && (
              <div className="empty-state">
                <strong>No leads yet</strong>
                <p>Add the first inquiry to start the team pipeline on this device.</p>
              </div>
            )}
            {leads.length > 0 && filteredLeads.length === 0 && (
              <div className="empty-state">
                <strong>No matching leads</strong>
                <p>Try clearing the search or changing the status filter.</p>
              </div>
            )}
            {filteredLeads.map((lead) => (
              <article
                className={`lead-card ${selectedLead?.id === lead.id ? "selected" : ""}`}
                key={lead.id}
                onClick={() => setSelectedId(lead.id)}
              >
                <div className="lead-card-top">
                  <div>
                    <h3>{lead.contactName || "Unnamed lead"}</h3>
                    <p>{lead.organization || "No organization"}</p>
                  </div>
                  <select
                    value={lead.status}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => updateStatus(lead.id, event.target.value)}
                    aria-label={`Update ${lead.contactName || "lead"} status`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <p className="lead-note-preview">{lead.notes || "No notes yet."}</p>
                <div className="lead-meta">
                  <span>{lead.source || "No source"}</span>
                  <span className={lead.followUpDate ? "date-chip" : ""}>{formatDate(lead.followUpDate)}</span>
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
            {selectedLead && <span className={`status-pill ${getStatusClass(selectedLead.status)}`}>{selectedLead.status}</span>}
          </div>

          {selectedLead ? (
            <>
              <div className="detail-actions">
                <button className="secondary-button" type="button" onClick={() => editLead(selectedLead)}>
                  <Edit3 size={17} />
                  Edit
                </button>
                <button className="danger-button" type="button" onClick={() => deleteLead(selectedLead)}>
                  <Trash2 size={17} />
                  Delete
                </button>
              </div>

              <dl className="detail-list">
                <div>
                  <dt>Organization / Business</dt>
                  <dd>{selectedLead.organization || "Not provided"}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>
                    <Phone size={15} />
                    {selectedLead.phone || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>
                    <Mail size={15} />
                    {selectedLead.email || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt>Source</dt>
                  <dd>{selectedLead.source || "Not provided"}</dd>
                </div>
                <div>
                  <dt>Follow-up date</dt>
                  <dd>
                    <CalendarDays size={15} />
                    {formatDate(selectedLead.followUpDate)}
                  </dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{formatDate(selectedLead.createdAt)}</dd>
                </div>
                <div>
                  <dt>Last updated</dt>
                  <dd>{formatDate(selectedLead.updatedAt)}</dd>
                </div>
                <div className="notes-detail">
                  <dt>Notes</dt>
                  <dd>{selectedLead.notes || "No notes yet."}</dd>
                </div>
              </dl>
            </>
          ) : (
            <div className="empty-state">
              <strong>No lead selected</strong>
              <p>Add or select a lead to see the full detail view.</p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
