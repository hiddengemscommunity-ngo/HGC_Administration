// ============================================
// SUPABASE SETUP
// ============================================
// ============================================
// SUPABASE SETUP
// ============================================
const SUPABASE_URL = 'https://lyrlppgledsvdznxnpxo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cmxwcGdsZWRzdmR6bnhucHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MDYxMTAsImV4cCI6MjEwMTM4MjExMH0.iYb76_f_QbBlYnHSjqOjWEF3VeI9r6ziEefPyIMF5SU';
const configured = !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_ANON_KEY.startsWith("YOUR_");
const sb = configured && window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const $ = id => document.getElementById(id);
const safeText = (id, value) => { const el = $(id); if (el) el.textContent = value; };
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function badge(status){return `<span class="badge ${esc(status)}">${esc(status).replace("_"," ")}</span>`;}
function initials(name){return (name||"?").split(" ").filter(Boolean).slice(0,2).map(s=>s[0]).join("").toUpperCase();}
function colorFor(seed){const colors=["#33d999","#e7b854","#6fb7ff","#f28fb0","#a78bfa","#5fd0d0"];let h=0;for(const c of String(seed))h=(h*31+c.charCodeAt(0))>>>0;return colors[h%colors.length];}
function userNameById(userId){
  if (userId === null || userId === undefined || userId === "") return "—";
  const match = allUsers.find(u => String(u.id) === String(userId));
  return match?.full_name || match?.email || `User #${userId}`;
}
function isUserReferenceColumn(columnName){
  const name = String(columnName || "").toLowerCase();
  return name === "user_id" || name.endsWith("_user_id") || name === "actor_id" || name.endsWith("_actor_id") || name === "owner_id" || name.endsWith("_owner_id");
}
function formatGenericColumnValue(columnName, value){
  if (value === null || value === undefined || value === "") return "—";
  if (isUserReferenceColumn(columnName)) return userNameById(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value && (columnName.includes('time') || columnName.includes('date') || columnName === 'created_at')) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return value;
}

const EXEC_ROLES = ["ceo", "coo", "cto", "hr_admin", "super_admin"];

function profileValue(value, fallback = "Not available") {
  return value === null || value === undefined || String(value).trim() === "" ? fallback : String(value);
}
function setFormMessage(id, message, type = "error") {
  const element = $(id); if (!element) return;
  element.textContent = message; element.className = `form-message ${message ? type : ""}`;
}
function executiveDesignation(record) {
  if (record?.designation) return record.designation;
  const role = String(record?.position || record?.role || "Executive").toLowerCase();
  return { ceo: "Chief Executive Officer", coo: "Chief Operating Officer", cto: "Chief Technology Officer" }[role] || "Executive leadership";
}
function executiveRole(record) {
  return String(record?.position || record?.role || "Executive").toUpperCase().replace(/_/g, " ");
}
function responsibilityList(record) {
  const value = record?.responsibilities;
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string" && value.trim()) {
    try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String); } catch (_) {}
    return value.split(/\r?\n|\s*;\s*/).map(item => item.trim()).filter(Boolean);
  }
  return [];
}
function setProfileAvatar(elementId, imageId, record, email) {
  const element = $(elementId), image = $(imageId);
  if (!element) return;
  const name = profileValue(record?.full_name, email || "Executive");
  const fallback = initials(name);
  const fallbackElement = element.querySelector(".avatar-fallback");
  if (fallbackElement) fallbackElement.textContent = fallback;
  element.style.background = colorFor(email || name);
  element.setAttribute("role", "img");
  element.setAttribute("aria-label", `${name} profile photo`);
  if (!image) return;
  image.alt = `${name} profile photo`;
  image.classList.remove("loaded");
  image.onerror = () => { image.removeAttribute("src"); image.classList.remove("loaded"); };
  image.onload = () => image.classList.add("loaded");
  if (record?.avatar_url) image.src = record.avatar_url;
  else image.removeAttribute("src");
}
function populateExecutiveProfile(record, user) {
  const email = record?.email || user?.email || "";
  const name = profileValue(record?.full_name, email || "Executive");
  const designation = executiveDesignation(record);
  const role = executiveRole(record);
  const set = (id, value, fallback) => safeText(id, profileValue(value, fallback));
  set("userName", name, "Executive"); set("userRole", designation, "Executive");
  set("menuUserName", name, "Executive"); set("menuUserRole", designation, "Executive");
  set("menuEmail", email, "Not available"); set("menuDepartment", record?.department, "Not available"); set("menuEmployeeId", record?.employee_id, "Not available");
  set("profileModalName", name, "Executive profile"); set("modalDesignation", designation, "Executive"); set("modalRole", role, "Executive");
  set("modalHeadline", record?.headline || record?.professional_headline, "Profile information unavailable."); set("modalEmail", email, "Not available"); set("modalPhone", record?.phone, "Not available"); set("modalLocation", record?.location, "Not available"); set("modalLinkedin", record?.linkedin_url, "Not available");
  set("modalFullName", name, "Not available"); set("modalPreferredName", record?.preferred_name, "Not available"); set("modalDepartment", record?.department, "Not available");
  const joiningDate = record?.joining_date ? new Date(record.joining_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : null;
  set("modalJoiningDate", joiningDate, "Not available"); set("modalBio", record?.bio, "Profile information unavailable.");
  const responsibilities = responsibilityList(record); const list = $("modalResponsibilities");
  if (list) list.innerHTML = responsibilities.length ? responsibilities.map(item => `<li>${esc(item)}</li>`).join("") : "<li>Profile information unavailable.</li>";
  setProfileAvatar("avatar", "avatarImage", record, email); setProfileAvatar("menuAvatar", "menuAvatarImage", record, email); setProfileAvatar("modalAvatar", "modalAvatarImage", record, email);
  lucide.createIcons();
}
function populateExecutiveEditForm(record) {
  const values = {
    editFullName: record?.full_name,
    editPreferredName: record?.preferred_name,
    editPhone: record?.phone,
    editLocation: record?.location,
    editDepartment: record?.department,
    editAvatarUrl: record?.avatar_url,
    editHeadline: record?.headline || record?.professional_headline,
    editLinkedin: record?.linkedin_url,
    editBio: record?.bio
  };
  Object.entries(values).forEach(([id, value]) => { if ($(id)) $(id).value = value || ""; });
}

if ($("setupBanner") && !configured) {
  $("setupBanner").classList.remove("hidden");
  $("setupBanner").innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg><span>Supabase isn't connected yet.</span>`;
}

function toast(message, type = "success"){
  if (!$("toast-stack")) return;
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  const icon = type === "error"
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
  el.innerHTML = `${icon}<span>${esc(message)}</span>`;
  $("toast-stack").appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .2s"; setTimeout(() => el.remove(), 200); }, 3800);
}

function toggleTheme(){
  document.documentElement.dataset.theme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  if ($("themeLabel")) $("themeLabel").textContent = document.documentElement.dataset.theme === "light" ? "Light theme" : "Dark theme";
}

// ============================================
// ROUTING & BOOT (Smart Split Architecture)
// ============================================
let currentUser = null;
let myRecord = null;
let allUsers = [];
let portalMode = "team";
let sessionStartedAt = null;
let editingActivityId = null;
let editingAnnouncementId = null;
let announcementRecords = [];
let announcementFilter = "all";
let announcementRemote = false;

async function writeAuditLog(action, entityTable, entityId = null, details = {}) {
  if (!sb || !myRecord?.id) return;
  const { error } = await sb.from("audit_logs").insert({
    actor_id: myRecord.id,
    action,
    entity_table: entityTable,
    entity_id: entityId,
    diff_data: { ...details, occurred_at: new Date().toISOString() }
  });
  if (error) console.warn("Audit log write failed:", error.message);
}

(async () => {
  lucide.createIcons();
  if (!sb) return;

  const { data: { session } } = await sb.auth.getSession();
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  
  if (!session) {
    if (currentPage !== "index.html" && currentPage !== "") window.location.href = "index.html";
    return;
  }
  
  currentUser = session.user;
  const { data: directUser } = await sb.from("users").select("*").eq("auth_user_id", currentUser.id).maybeSingle();
  myRecord = directUser;
  
  const pos = (myRecord?.position || "").toLowerCase();
  const role = (myRecord?.role || "intern").toLowerCase();
  const isExec = EXEC_ROLES.includes(pos) || EXEC_ROLES.includes(role);
  
  const targetPage = isExec ? "leadership.html" : "intern.html";
  
  if (currentPage === "index.html" || currentPage === "") { window.location.href = targetPage; return; }
  if (currentPage === "intern.html" && isExec) { window.location.href = targetPage; return; }
  if (currentPage === "leadership.html" && !isExec) { window.location.href = targetPage; return; }
  
  if (currentPage === targetPage) {
    if (currentPage === "leadership.html") populateExecutiveProfile(myRecord, currentUser);
    sessionStartedAt = new Date();
    await writeAuditLog("LOGIN", "auth", myRecord?.id, { email: currentUser.email, page: currentPage });
    await loadData();
  }
})();

if (sb) {
  sb.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") window.location.href = "index.html";
    if (event === "PASSWORD_RECOVERY") {
      if ($("auth-screen") && $("portal-screen")) {
        $("portal-screen").style.display = "none";
        $("auth-screen").style.display = "grid";
        showAuthPanel("reset");
      }
    }
  });
}

// ============================================
// AUTHENTICATION (index.html Only)
// ============================================
function showAuthPanel(name){
  ["login","register","forgot","reset"].forEach(p => { if ($(`${p}-panel`)) $(`${p}-panel`).classList.toggle("hidden", p !== name); });
}

if ($("pickTeamPortal")) $("pickTeamPortal").onclick = () => { portalMode = "team"; $("portal-screen").style.display="none"; $("auth-screen").style.display="grid"; document.getElementById("auth-screen").classList.remove("leadership-mode"); };
if ($("pickLeadershipPortal")) $("pickLeadershipPortal").onclick = () => { portalMode = "leadership"; $("portal-screen").style.display="none"; $("auth-screen").style.display="grid"; document.getElementById("auth-screen").classList.add("leadership-mode"); };
if ($("backToPortal")) $("backToPortal").onclick = () => { $("auth-screen").style.display="none"; $("portal-screen").style.display="grid"; };

if ($("gotoRegister")) $("gotoRegister").onclick = e => { e.preventDefault(); showAuthPanel("register"); };
if ($("gotoLoginFromRegister")) $("gotoLoginFromRegister").onclick = e => { e.preventDefault(); showAuthPanel("login"); };
if ($("gotoForgot")) $("gotoForgot").onclick = e => { e.preventDefault(); showAuthPanel("forgot"); };
if ($("gotoLoginFromForgot")) $("gotoLoginFromForgot").onclick = e => { e.preventDefault(); showAuthPanel("login"); };

function wirePasswordToggle(btnId, inputId){
  const btn = $(btnId), input =$(inputId);
  if (!btn || !input) return;
  const setIcon = () => { btn.innerHTML = `<i data-lucide="${input.type === "password" ? "eye" : "eye-off"}" style="width:16px"></i>`; lucide.createIcons(); };
  setIcon();
  btn.onclick = () => { input.type = input.type === "password" ? "text" : "password"; setIcon(); };
}
wirePasswordToggle("showPassword", "password");
wirePasswordToggle("showRegPassword", "regPassword");

if ($("regPassword")) $("regPassword").addEventListener("input", () => {
  const v = $("regPassword").value;
  let score = 0;
  if (v.length >= 6) score++; if (v.length >= 10) score++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
  if (/[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;
  const levels = [{ w: "0%", c: "var(--danger)", l: "" }, { w: "25%", c: "var(--danger)", l: "Weak" }, { w: "55%", c: "var(--gold)", l: "Okay" }, { w: "80%", c: "var(--accent)", l: "Good" }, { w: "100%", c: "var(--accent)", l: "Strong" }][v.length ? score + 1 : 0];
  $("strengthBar").style.width = levels.w; $("strengthBar").style.background = levels.c; $("strengthLabel").textContent = levels.l;
});

if ($("loginForm")) $("loginForm").onsubmit = async e => {
  e.preventDefault();
  if (!sb) {
    if ($("loginMessage")) {
      $("loginMessage").textContent = "Supabase is not configured yet.";
      $("loginMessage").className = "form-message error";
    }
    toast("Supabase is not configured yet.", "error");
    return;
  }
  $("loginBtn").disabled = true;
  const { error } = await sb.auth.signInWithPassword({ email: $("email").value.trim(), password: $("password").value });
  if (error) { $("loginMessage").textContent = error.message; $("loginMessage").className = "form-message error"; $("loginBtn").disabled = false; return; }
  window.location.reload(); 
};

if ($("registerForm")) $("registerForm").onsubmit = async e => {
  e.preventDefault();
  if (!sb) {
    toast("Supabase is not configured yet.", "error");
    return;
  }
  const pw = $("regPassword").value, confirm = $("regConfirm").value;
  if (pw !== confirm) { $("registerMessage").textContent = "Passwords don't match."; $("registerMessage").className = "form-message error"; return; }
  $("registerBtn").disabled = true;
  const { data, error } = await sb.auth.signUp({ email: $("regEmail").value.trim(), password: pw, options: { data: { full_name: $("regName").value.trim() } } });
  $("registerBtn").disabled = false;
  if (error) { toast(error.message, "error"); return; }
  if (data.user && !data.session) { toast("Account created. Check your email."); showAuthPanel("login"); } else window.location.reload();
};

async function signOutWithAudit() {
  if (!sb) return;
  await writeAuditLog("LOGOUT", "auth", myRecord?.id, { duration_seconds: sessionStartedAt ? Math.round((Date.now() - sessionStartedAt.getTime()) / 1000) : null });
  await sb.auth.signOut();
}
if ($("logoutBtn")) $("logoutBtn").onclick = signOutWithAudit;
if ($("ddLogout")) $("ddLogout").onclick = signOutWithAudit;

// ============================================
// GLOBAL DATA LOADER
// ============================================
async function loadData() {
  if (!sb || !currentUser) return;
  const { data: users } = await sb.from("users").select("*").order("created_at", { ascending: false });
  allUsers = users || [];
  
  if ($("dbStatus")) $("dbStatus").textContent = "Connected";
  const live = allUsers.filter(u => !u.deleted_at);
  safeText("totalCount", live.length);
  safeText("activeCount", live.filter(x => x.status === "active").length);
  safeText("leaveCount", live.filter(x => x.status === "on_leave").length);
  safeText("completedCount", live.filter(x => x.status === "completed").length);
  
  if (!allUsers.find(u => u.auth_user_id === currentUser?.id) && myRecord) allUsers.push(myRecord);

  if ($("msInternId")) await loadMySpace();
  if ($("dashClockStatus")) await checkAttendanceStatus();
  if ($("assignedWorkList")) await loadInternWorkspace();
  if ($("onLeaveWidget")) renderDashboardWidgets();
  if ($("activityTable")) await loadInternActivities();
  
  await loadLeaves();
  if ($("leadershipLeaveRoster")) renderLeadershipLeaveRoster();
  if ($("anaStats")) await loadExecutiveAnalytics();
  if ($("execFeedList")) await loadExecutiveActivityFeed();
  if ($("announcementList") || $("announcementsFeed")) await loadAnnouncements();

  if ($("genericTableSelect")) await loadGenericData();
  if ($("auditTableBody")) await loadAuditLogs();
  if ($("teaminsightsView")) await loadTeamInsights();
}

const announcementStorageKey = "hgs-leadership-announcements";
function localAnnouncements() {
  try { return JSON.parse(localStorage.getItem(announcementStorageKey) || "[]"); } catch (_) { return []; }
}
function saveLocalAnnouncements() { localStorage.setItem(announcementStorageKey, JSON.stringify(announcementRecords)); }
function announcementDate(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? "Just now" : date.toLocaleString([], { month: "short", day: "numeric", year: "numeric" });
}
function renderAnnouncements() {
  const list = $("announcementList"); 
  const feed = $("announcementsFeed");

  // 1. Render for Leadership (Full controls)
  if (list) {
    const visible = announcementRecords.filter(item => announcementFilter === "all" || (announcementFilter === "published" ? item.is_published !== false : item.is_published === false));
    safeText("announcementCount", `${visible.length} ${visible.length === 1 ? "announcement" : "announcements"}`);
    
    if (!visible.length) {
      list.innerHTML = `<div class="announcement-empty"><i data-lucide="megaphone"></i><div>No ${announcementFilter === "all" ? "announcements" : announcementFilter + "s"} yet.</div></div>`;
    } else {
      list.innerHTML = visible.map(item => `
        <article class="announcement-item">
          <div><div class="announcement-meta"><span class="tag">${esc(item.category || "update")}</span><span class="badge ${item.is_published !== false ? "active" : ""}">${item.is_published !== false ? "Published" : "Draft"}</span><span class="announcement-date">${announcementDate(item.updated_at || item.created_at)}</span></div>
          <h3>${esc(item.title || "Announcement")}</h3><p>${esc(item.body ?? item.content)}</p></div>
          <div class="announcement-actions"><button type="button" data-announcement-action="toggle" data-announcement-id="${esc(item.id)}" title="${item.is_published !== false ? "Unpublish" : "Publish"}"><i data-lucide="${item.is_published !== false ? "eye-off" : "send"}"></i></button><button type="button" data-announcement-action="edit" data-announcement-id="${esc(item.id)}" title="Edit"><i data-lucide="pencil"></i></button><button type="button" class="danger" data-announcement-action="delete" data-announcement-id="${esc(item.id)}" title="Delete"><i data-lucide="trash-2"></i></button></div>
        </article>`).join("");
    }
  }

  // 2. Render for Interns (Read-only, published only)
  if (feed) {
    const publishedOnly = announcementRecords.filter(item => item.is_published !== false).slice(0, 5);
    
    if (!publishedOnly.length) {
      feed.innerHTML = `<div class="empty-widget" style="padding: 40px 0;"><i data-lucide="message-square"></i><span>No new announcements right now.</span></div>`;
    } else {
      feed.innerHTML = publishedOnly.map(item => {
        const authorName = String(item.author_name || "Executive Command");
        const authorRole = String(item.author_role || "Leadership");
        const createdAt = item.created_at || item.updated_at;
        let meetingLink = "";
        try {
          const url = new URL(item.meeting_link);
          if (url.protocol === "http:" || url.protocol === "https:") meetingLink = esc(url.href);
        } catch (_) {}
        const createdDate = createdAt && !Number.isNaN(new Date(createdAt).getTime())
          ? new Date(createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
          : "Just now";
        return `
          <article style="display:flex; gap:10px; padding:16px 0; border-bottom:1px solid var(--border);">
            <div class="avatar" aria-hidden="true">${esc(authorName.charAt(0) || "L")}</div>
            <div style="min-width:0; flex:1;">
              <div style="display:flex; align-items:baseline; flex-wrap:wrap; gap:6px; margin-bottom:6px;">
                <b style="font-size:13px; color:var(--text);">${esc(authorName)}</b>
                <span class="muted" style="font-size:11px;">${esc(authorRole)} · ${esc(createdDate)}</span>
              </div>
              <p style="margin:0; font-size:13px; color:var(--muted); line-height:1.5; white-space:pre-line;">${esc(item.body ?? item.content ?? "")}</p>
              ${meetingLink ? `<a class="btn primary sm" href="${meetingLink}" target="_blank" rel="noopener noreferrer" style="margin-top:10px; text-decoration:none;">Join Meeting</a>` : ""}
            </div>
          </article>`;
      }).join("");
    }
  }
  
  lucide.createIcons();
}
async function loadAnnouncements() {
  if (!$("announcementList") && !$("announcementsFeed")) return;
  announcementRemote = false;
  if (sb) {
    let query = sb.from("announcements").select("*").order("created_at", { ascending: false });
    if ($("announcementsFeed") && !$("announcementList")) query = query.limit(5);
    const { data, error } = await query;
    if (!error) { announcementRecords = data || []; announcementRemote = true; renderAnnouncements(); return; }
    if ($("announcementsFeed") && !$("announcementList")) { announcementRecords = []; renderAnnouncements(); return; }
  }
  announcementRecords = localAnnouncements().sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
  renderAnnouncements();
}
$("leadershipAnnouncementForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button[type="submit"]');
  const originalButton = button.innerHTML;
  const content = $("announcementText").value.trim();
  if (!content) return;
  if (!sb) { toast("Supabase is not configured yet.", "error"); return; }

  button.textContent = "Posting...";
  button.disabled = true;
  try {
    const { error } = await sb.from("announcements").insert([{
      content,
      meeting_link: $("broadcastMeetingLink").value.trim() || null,
      author_name: $("userName").innerText.trim() || "Executive Command",
      author_role: "Leadership"
    }]);
    if (error) throw error;
    $("announcementText").value = "";
    $("broadcastMeetingLink").value = "";
    await loadAnnouncements();
    toast("Announcement broadcasted successfully to all interns.");
  } catch (error) {
    toast(`Error posting announcement: ${error.message}`, "error");
  } finally {
    button.innerHTML = originalButton;
    button.disabled = false;
    lucide.createIcons();
  }
});
function openAnnouncementEditor(record = null) {
  editingAnnouncementId = record?.id || null;
  safeText("announcementModalTitle", record ? "Edit announcement" : "New announcement");
  $("announcementTitle").value = record?.title || ""; $("announcementCategory").value = record?.category || "meeting"; $("announcementMeetingLink").value = record?.meeting_link || ""; $("announcementBody").value = record?.body ?? record?.content ?? ""; $("announcementPublished").checked = record ? record.is_published !== false : true;
  setFormMessage("announcementFormMessage", ""); $("announcementModal").classList.remove("hidden"); $("announcementTitle").focus();
}
function closeAnnouncementEditor() { $("announcementModal")?.classList.add("hidden"); editingAnnouncementId = null; }
async function saveAnnouncementRecord(event) {
  event.preventDefault(); const button = $("saveAnnouncement"); button.disabled = true; setFormMessage("announcementFormMessage", "");
  const now = new Date().toISOString(); const payload = { title: $("announcementTitle").value.trim(), category: $("announcementCategory").value, meeting_link: $("announcementMeetingLink").value.trim() || null, body: $("announcementBody").value.trim(), is_published: $("announcementPublished").checked, updated_at: now };
  if (!payload.title || !payload.body) { setFormMessage("announcementFormMessage", "Add a headline and announcement before saving."); button.disabled = false; return; }
  try {
    if (announcementRemote) {
      if (editingAnnouncementId) { const { error } = await sb.from("announcements").update(payload).eq("id", editingAnnouncementId); if (error) throw error; }
      else { const { error } = await sb.from("announcements").insert({ ...payload, author_id: myRecord?.id }).select().single(); if (error) throw error; }
      await writeAuditLog(editingAnnouncementId ? "ANNOUNCEMENT_UPDATE" : "ANNOUNCEMENT_CREATE", "announcements", editingAnnouncementId, payload);
    } else {
      if (editingAnnouncementId) announcementRecords = announcementRecords.map(item => String(item.id) === String(editingAnnouncementId) ? { ...item, ...payload } : item);
      else announcementRecords.unshift({ ...payload, id: `local-${Date.now()}`, created_at: now });
      saveLocalAnnouncements();
    }
    closeAnnouncementEditor(); await loadAnnouncements(); toast("Announcement saved.");
  } catch (error) { setFormMessage("announcementFormMessage", error?.message || "Unable to save announcement."); }
  finally { button.disabled = false; }
}
async function updateAnnouncementAction(id, action) {
  const record = announcementRecords.find(item => String(item.id) === String(id)); if (!record) return;
  if (action === "delete" && !confirm(`Delete “${record.title}”?`)) return;
  try {
    if (announcementRemote) {
      if (action === "delete") { const { error } = await sb.from("announcements").delete().eq("id", id); if (error) throw error; }
      else { const { error } = await sb.from("announcements").update({ is_published: !record.is_published, updated_at: new Date().toISOString() }).eq("id", id); if (error) throw error; }
    } else {
      announcementRecords = action === "delete" ? announcementRecords.filter(item => String(item.id) !== String(id)) : announcementRecords.map(item => String(item.id) === String(id) ? { ...item, is_published: !item.is_published, updated_at: new Date().toISOString() } : item);
      saveLocalAnnouncements();
    }
    await loadAnnouncements(); toast(action === "delete" ? "Announcement deleted." : `Announcement ${record.is_published ? "unpublished" : "published"}.`);
  } catch (error) { toast(error?.message || "Unable to update announcement.", "error"); }
}
$("newAnnouncementBtn")?.addEventListener("click", () => openAnnouncementEditor());
$("closeAnnouncementModal")?.addEventListener("click", closeAnnouncementEditor); $("cancelAnnouncement")?.addEventListener("click", closeAnnouncementEditor);
$("announcementModal")?.addEventListener("click", event => { if (event.target === $("announcementModal")) closeAnnouncementEditor(); }); $("announcementForm")?.addEventListener("submit", saveAnnouncementRecord);
document.querySelectorAll("[data-announcement-filter]").forEach(button => button.addEventListener("click", () => { announcementFilter = button.dataset.announcementFilter; document.querySelectorAll("[data-announcement-filter]").forEach(item => item.classList.toggle("active", item === button)); renderAnnouncements(); }));
$("announcementList")?.addEventListener("click", event => { const button = event.target.closest("[data-announcement-action]"); if (!button) return; const id = button.dataset.announcementId; if (button.dataset.announcementAction === "edit") openAnnouncementEditor(announcementRecords.find(item => String(item.id) === String(id))); else updateAnnouncementAction(id, button.dataset.announcementAction); });

// ============================================
// INTERN DASHBOARD: MY SPACE & WIDGETS
// ============================================
async function loadMySpace() {
  if (!sb || !myRecord) return;
  if ($("msInternId")) $("msInternId").textContent = myRecord?.intern_id || "—";
  if ($("msEmail")) $("msEmail").textContent = myRecord?.email || currentUser?.email || "—";
  if ($("msRole")) $("msRole").textContent = myRecord?.role || "—";
  if ($("msStatus")) $("msStatus").innerHTML = myRecord ? badge(myRecord.status) : "—";
  
  if ($("msProfile")) {
    const { data: profile } = await sb.from("intern_profiles").select("*").eq("user_id", myRecord.id).maybeSingle();
    $("msProfile").innerHTML = profile ? `
      <div class="system-item"><span>College</span><b>${esc(profile.college_name || "—")}</b></div>
      <div class="system-item"><span>Degree / Year</span><b>${esc(profile.degree_year || "—")}</b></div>
      <div class="system-item"><span>Emergency contact</span><b>${esc(profile.emergency_contact_name || "—")} ${profile.emergency_contact_phone ? `(${esc(profile.emergency_contact_phone)})` : ""}</b></div>
    ` : `<p class="muted">No profile on file yet.</p>`;
  }
}

function renderDashboardWidgets() {
  if (!$("onLeaveWidget")) return;

  const onLeaveUsers = allUsers.filter(u => u.status === 'on_leave' && !u.deleted_at);
  const leaveWidget = $("onLeaveWidget");
  if (onLeaveUsers.length === 0) {
    leaveWidget.innerHTML = `<div class="empty-widget" style="padding:10px 0;"><i data-lucide="coffee" style="width:24px; color:var(--muted); opacity:0.5;"></i><span style="font-size:12.5px;color:var(--muted)">Everyone is working today.</span></div>`;
  } else {
    const avatars = onLeaveUsers.slice(0, 5).map(u => `<div class="avatar" style="background:${colorFor(u.email)}; border:2px solid var(--surface); margin-left:-8px; width:32px; height:32px; font-size:11.5px; position:relative; z-index:1;" title="${esc(u.full_name)}">${initials(u.full_name)}</div>`).join("");
    const extra = onLeaveUsers.length > 5 ? `<div class="avatar" style="background:var(--surface3); color:var(--text); border:2px solid var(--surface); margin-left:-8px; width:32px; height:32px; font-size:11px; position:relative; z-index:0;">+${onLeaveUsers.length - 5}</div>` : "";
    leaveWidget.innerHTML = `<div style="display:flex; align-items:center; gap:12px; padding:4px 0;"><div style="display:flex; padding-left:8px;">${avatars}${extra}</div><span style="font-size:13px; font-weight:500;">${onLeaveUsers.length} colleague${onLeaveUsers.length > 1 ? 's' : ''} away</span></div>`;
  }

  const joineesWidget = $("joineesAvatars");
  if (joineesWidget) {
    const recentJoinees = [...allUsers].filter(u => !u.deleted_at && u.joining_date).sort((a, b) => new Date(b.joining_date) - new Date(a.joining_date)).slice(0, 6);
    joineesWidget.innerHTML = recentJoinees.length === 0 ? `<span style="font-size:12px; color:var(--muted)">No data available.</span>` : recentJoinees.map(u => `<div class="avatar" style="background:${colorFor(u.email)}; border:2px solid var(--surface); margin-left:-8px; position:relative;" title="${esc(u.full_name)}\nJoined: ${esc(u.joining_date)}">${initials(u.full_name)}</div>`).join("");
  }

  if ($("greeting") && currentUser) $("greeting").textContent = `Welcome ${esc(myRecord?.full_name || currentUser.email.split("@")[0])}!`;
  lucide.createIcons();
}

// ============================================
// ATTENDANCE LOGIC
// ============================================
let todayAttendanceId = null;

async function checkAttendanceStatus() {
  if (!sb || !myRecord || !$("dashClockStatus")) return;
  const today = new Date().toLocaleDateString("en-CA");
  const { data } = await sb.from("attendance").select("*").eq("user_id", myRecord.id).eq("work_date", today).maybeSingle();

  todayAttendanceId = data?.id || null;
  let status = "Not clocked in", statusColor = "";
  
  if (data?.clock_in && data?.clock_out) {
    status = `In: ${new Date(data.clock_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} | Out: ${new Date(data.clock_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } else if (data?.clock_in) {
    status = `Clocked in at ${new Date(data.clock_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    statusColor = "var(--accent)";
  }
  
  $("dashClockStatus").textContent = status;
  $("dashClockStatus").classList.toggle("muted", !statusColor);
  $("dashClockStatus").style.color = statusColor;
  if($("dashClockInBtn")) $("dashClockInBtn").classList.toggle("hidden", Boolean(data));
  if($("dashClockOutBtn")) $("dashClockOutBtn").classList.toggle("hidden", !data || Boolean(data.clock_out));
}

if ($("dashClockInBtn")) $("dashClockInBtn").onclick = async () => {
  $("dashClockInBtn").disabled = true;
  try {
    const { error } = await sb.from("attendance").insert({ user_id: myRecord.id, work_date: new Date().toLocaleDateString("en-CA") });
    if (error) throw error; await writeAuditLog("CLOCK_IN", "attendance", myRecord.id, { work_date: new Date().toLocaleDateString("en-CA") }); toast("Clocked in!"); await checkAttendanceStatus();
  } catch (error) { toast(error.message, "error"); } finally { $("dashClockInBtn").disabled = false; }
};

if ($("dashClockOutBtn")) $("dashClockOutBtn").onclick = async () => {
  $("dashClockOutBtn").disabled = true;
  try {
    const { error } = await sb.from("attendance").update({ clock_out: new Date().toISOString() }).eq("id", todayAttendanceId);
    if (error) throw error; await writeAuditLog("CLOCK_OUT", "attendance", todayAttendanceId, { work_date: new Date().toLocaleDateString("en-CA") }); toast("Clocked out!"); await checkAttendanceStatus();
  } catch (error) { toast(error.message, "error"); } finally { $("dashClockOutBtn").disabled = false; }
};

// ============================================
// INTERN: DAILY ACTIVITIES SUBMISSION
// ============================================
if ($("activityDate")) $("activityDate").value = new Date().toISOString().slice(0, 10);

if ($("activityForm")) $("activityForm").addEventListener("submit", async e => {
  e.preventDefault();
  const btn = $("activitySubmitBtn");
  if (!myRecord) { toast("No user record found.", "error"); return; }
  btn.disabled = true; btn.textContent = editingActivityId ? "Updating..." : "Saving...";

  try {
    const fileUrls = [];
    for (const file of Array.from($("activityFiles")?.files || [])) {
      const path = `${currentUser.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await sb.storage.from("daily-uploads").upload(path, file);
      if (upErr) throw upErr;
      const { data: pub } = sb.storage.from("daily-uploads").getPublicUrl(path);
      fileUrls.push({ name: file.name, url: pub.publicUrl });
    }
    const payload = { activity_date: $("activityDate").value, description: $("activityDescription").value.trim(), file_urls: fileUrls };
    let activityId = editingActivityId;
    if (editingActivityId) {
      const { error: updateErr } = await sb.from("daily_activities").update(payload).eq("id", editingActivityId).eq("user_id", myRecord.id);
      if (updateErr) throw updateErr;
      await writeAuditLog("ACTIVITY_UPDATE", "daily_activities", editingActivityId, payload);
    } else {
      const { data: created, error: insErr } = await sb.from("daily_activities").insert({ ...payload, user_id: myRecord.id }).select("id").single();
      if (insErr) throw insErr;
      activityId = created?.id;
      await writeAuditLog("ACTIVITY_CREATE", "daily_activities", activityId, payload);
    }
    toast(editingActivityId ? "Activity updated." : "Activity submitted.");
    $("activityForm").reset();
    $("activityDate").value = new Date().toISOString().slice(0, 10);
    editingActivityId = null;
    $("cancelActivityEdit")?.classList.add("hidden");
    btn.textContent = "Submit activity";
    await loadInternActivities();
    await loadInternWorkspace();
  } catch (err) { toast(err?.message, "error"); } finally { btn.disabled = false; if (!editingActivityId) btn.textContent = "Submit activity"; }
});

async function loadInternActivities() {
  if (!sb || !myRecord || !$("activityTable")) return;
  const { data, error } = await sb.from("daily_activities").select("*").eq("user_id", myRecord.id).order("activity_date", { ascending: false }).limit(20);
  if (error) return;
  $("activityTable").innerHTML = data?.length ? data.map(a => `<tr><td>${esc(a.activity_date)}</td><td><b>You</b></td><td style="white-space:pre-wrap">${esc(a.description)}</td><td>${a.file_urls?.length ? "Attached" : "—"}</td><td class="actions"><button type="button" title="Edit activity" onclick="editInternActivity(${a.id})"><i data-lucide="pencil"></i></button><button type="button" title="Delete activity" onclick="deleteInternActivity(${a.id})"><i data-lucide="trash-2"></i></button></td></tr>`).join("") : emptyRow(5, "No activity submitted yet", "");
  lucide.createIcons();
}

window.editInternActivity = async function(activityId) {
  const { data, error } = await sb.from("daily_activities").select("*").eq("id", activityId).eq("user_id", myRecord.id).single();
  if (error || !data) { toast("Activity could not be loaded.", "error"); return; }
  editingActivityId = data.id; $("activityDate").value = data.activity_date || ""; $("activityDescription").value = data.description || "";
  $("activityEditNotice").textContent = "Editing this activity submission."; $("activityEditNotice").className = "form-message"; $("cancelActivityEdit")?.classList.remove("hidden"); $("activitySubmitBtn").textContent = "Update activity"; $("activityDescription").focus();
};
window.deleteInternActivity = async function(activityId) {
  if (!confirm("Delete this activity submission?")) return;
  const { error } = await sb.from("daily_activities").delete().eq("id", activityId).eq("user_id", myRecord.id);
  if (error) { toast(error.message, "error"); return; }
  await writeAuditLog("ACTIVITY_DELETE", "daily_activities", activityId, {}); toast("Activity deleted."); await loadInternActivities();
};
$("cancelActivityEdit")?.addEventListener("click", () => { editingActivityId = null; $("activityForm").reset(); $("activityDate").value = new Date().toISOString().slice(0, 10); $("activitySubmitBtn").textContent = "Submit activity"; $("cancelActivityEdit").classList.add("hidden"); $("activityEditNotice").classList.add("hidden"); });

// ============================================
// LEAVE MANAGEMENT (Intern Request & Exec Queue)
// ============================================
if ($("openLeaveModalBtn")) $("openLeaveModalBtn").onclick = () => { $("leaveForm").reset(); $("leaveModal").classList.remove("hidden"); };
if ($("closeLeaveModal")) $("closeLeaveModal").onclick = () => $("leaveModal").classList.add("hidden");

if ($("leaveForm")) $("leaveForm").onsubmit = async event => {
  event.preventDefault();
  $("leaveSubmit").disabled = true;
  const isUrgent = $("leaveUrgent")?.checked;
  try {
    const { error } = await sb.from("leave_requests").insert({
      user_id: myRecord.id, start_date: $("leaveStart").value, end_date: $("leaveEnd").value,
      reason: $("leaveReason").value.trim(), is_urgent: isUrgent, status: isUrgent ? "pending_urgent" : "pending_coo"
    });
    if (error) throw error; toast("Request submitted."); $("leaveModal").classList.add("hidden"); await loadLeaves();
  } catch (error) { toast(error.message, "error"); } finally { $("leaveSubmit").disabled = false; }
};

async function loadLeaves() {
  if (!sb || !myRecord) return;
  const myPosition = (myRecord.position || myRecord.role || "").trim().toLowerCase();
  const isExec = EXEC_ROLES.includes(myPosition);
  
  const formatStatus = status => {
    const labels = { pending_coo: "Waiting on COO", pending_cto: "Waiting on CTO", pending_ceo: "Waiting on CEO", pending_urgent: "URGENT (Pending)", approved: "Approved", denied: "Denied" };
    const color = status.includes("pending") ? (status === "pending_urgent" ? "var(--danger)" : "var(--gold)") : status === "approved" ? "var(--accent)" : "var(--danger)";
    return `<span class="badge" style="background:transparent;border:1px solid ${color};color:${color}">${esc(labels[status] || status)}</span>`;
  };

  // 1. Intern Personal Leaves List
  if ($("dashLeavesList")) {
    const { data: myLeaves } = await sb.from("leave_requests").select("*").eq("user_id", myRecord.id).order("created_at", { ascending: false }).limit(5);
    $("dashLeavesList").innerHTML = myLeaves?.length ? myLeaves.map(l => `
      <div class="list-item" style="flex-direction:column;align-items:flex-start;gap:4px;padding:12px 16px">
        <div style="display:flex;justify-content:space-between;width:100%;gap:10px"><b>${esc(l.start_date)} to ${esc(l.end_date)}</b>${formatStatus(l.status)}</div>
        <small class="muted">${esc(l.reason)}</small>
      </div>`).join("") : `<p class="muted" style="padding:12px 16px">No leave history.</p>`;
  }

  // 2. Leadership Approval Queue
  if (isExec && $("pendingLeavesList")) {
    const { data: pending } = await sb.from("leave_requests").select("*, users(id, full_name)").in("status", ["pending_coo", "pending_cto", "pending_ceo", "pending_urgent"]).order("is_urgent", { ascending: false }).order("created_at", { ascending: true });
    $("pendingLeavesList").innerHTML = pending?.length ? pending.map(l => {
      const canApprove = l.status === "pending_urgent" || l.status === `pending_${myPosition}`;
      const actions = canApprove
        ? `<div style="display:flex;gap:8px"><button class="btn ghost sm" onclick="processLeave(${l.id}, '${l.status}', 'deny', '${l.users?.id}')" style="color:var(--danger);border-color:var(--danger-bg)">Deny</button><button class="btn primary sm" onclick="processLeave(${l.id}, '${l.status}', 'approve', '${l.users?.id}')">Approve</button></div>`
        : `<span class="muted" style="font-size:11.5px">Waiting for ${esc(l.status.replace("pending_", "").toUpperCase())}</span>`;
      return `<div class="list-item" style="gap:12px;border-bottom:1px solid var(--border);padding:14px 16px"><div style="flex:1"><b style="font-size:14.5px">${esc(l.users?.full_name)}</b>${l.is_urgent ? `<span style="color:var(--danger);font-size:11px;font-weight:bold;margin-left:8px"><i data-lucide="alert-triangle" style="width:12px;vertical-align:-2px"></i> URGENT</span>` : ""}<br><span style="font-size:13px">Requested: <b>${esc(l.start_date)}</b> to <b>${esc(l.end_date)}</b></span><br><small class="muted">"${esc(l.reason)}"</small></div>${actions}</div>`;
    }).join("") : `<p class="muted" style="padding:12px 16px">No pending requests.</p>`;
    lucide.createIcons();
  }
}

window.processLeave = async function(leaveId, expectedStatus, action, targetUserId) {
  if (!sb || !myRecord) {
    toast("Supabase is not configured or you are signed out.", "error");
    return;
  }
  try {
    const { data: leave, error: fetchError } = await sb.from("leave_requests").select("status").eq("id", leaveId).single();
    if (fetchError) throw fetchError;
    if (leave.status !== expectedStatus) { toast("Request already updated. Refreshing.", "error"); await loadLeaves(); return; }
    
    const nextStatus = action === "deny" ? "denied" : leave.status === "pending_coo" ? "pending_cto" : leave.status === "pending_cto" ? "pending_ceo" : "approved";
    await sb.from("leave_requests").update({ status: nextStatus }).eq("id", leaveId);

    if (nextStatus === "approved") {
      await sb.from("users").update({ status: "on_leave" }).eq("id", targetUserId);
      await sb.from("audit_logs").insert({ actor_id: myRecord.id, action: "LEAVE_APPROVAL", entity_table: "users", entity_id: targetUserId, diff_data: { status: "on_leave" } });
    }
    toast(nextStatus === "approved" ? "Leave fully approved!" : nextStatus === "denied" ? "Leave denied." : `Approved. Escalated to ${nextStatus.replace("pending_", "").toUpperCase()}.`);
    await loadLeaves(); await loadData();
  } catch (error) { toast(error.message, "error"); }
};

// ============================================
// EXECUTIVE: GENERIC DATA MANAGER (CRUD)
// ============================================
let currentTable = "users", currentData = [], currentSchema = [], editingId = null, genericSearch = "";

function renderDataVisualizations() {
  if (!$('dataVisualsPanel')) return;
  const rows = currentData || [];
  const dateColumn = ['attendance', 'daily_activities', 'leave_requests'].includes(currentTable) ? (currentTable === 'attendance' ? 'work_date' : currentTable === 'daily_activities' ? 'activity_date' : 'start_date') : null;
  const datedRows = dateColumn ? rows.filter(row => row[dateColumn]).reduce((groups, row) => {
    const key = String(row[dateColumn]).slice(0, 7);
    groups[key] = (groups[key] || 0) + 1;
    return groups;
  }, {}) : {};
  const volumeGroups = Object.entries(datedRows).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const maxVolume = Math.max(1, ...volumeGroups.map(([, count]) => count));
  safeText('dataVisualTotal', rows.length);
  safeText('dataVisualPeriod', dateColumn ? `Grouped by ${dateColumn.replace(/_/g, ' ')}` : 'Current result set');
  $('dataVolumeChart').innerHTML = volumeGroups.length ? volumeGroups.map(([key, count]) => `<div class="mini-bar-item" title="${esc(key)}: ${count}"><span>${esc(new Date(`${key}-01T00:00:00`).toLocaleDateString([], { month: 'short' }))}</span><i style="height:${Math.max(10, count / maxVolume * 100)}%"></i><b>${count}</b></div>`).join('') : `<div class="visual-empty"><i data-lucide="layers-3"></i><span>Choose an activity table to see volume over time.</span></div>`;

  const statusKey = Object.keys(rows[0] || {}).find(key => ['status', 'role', 'type', 'category'].includes(key.toLowerCase()));
  const statusCounts = statusKey ? Object.entries(rows.reduce((groups, row) => {
    const value = String(row[statusKey] || 'Unassigned');
    groups[value] = (groups[value] || 0) + 1;
    return groups;
  }, {})).sort(([, a], [, b]) => b - a).slice(0, 5) : [];
  $('dataStatusVisual').innerHTML = statusCounts.length ? statusCounts.map(([label, count], index) => `<div class="status-row"><div><span class="status-swatch swatch-${index}"></span><b>${esc(label)}</b></div><span>${count} <small>${Math.round(count / rows.length * 100)}%</small></span></div>`).join('') : `<div class="visual-empty"><i data-lucide="pie-chart"></i><span>No status-like field detected for this table.</span></div>`;

  const valueKey = currentSchema.find(key => !['id', 'created_at', 'updated_at', 'user_id'].includes(key) && typeof rows[0]?.[key] !== 'boolean') || currentSchema[0];
  const valueCounts = valueKey ? Object.entries(rows.reduce((groups, row) => {
    const value = String(row[valueKey] ?? 'Blank').trim() || 'Blank';
    groups[value] = (groups[value] || 0) + 1;
    return groups;
  }, {})).sort(([, a], [, b]) => b - a).slice(0, 4) : [];
  $('dataTopValues').innerHTML = valueCounts.length ? `<span class="visual-field-label">${esc(valueKey.replace(/_/g, ' '))}</span>${valueCounts.map(([label, count]) => `<div class="top-value-row"><span title="${esc(label)}">${esc(label)}</span><div><i style="width:${Math.max(8, count / valueCounts[0][1] * 100)}%"></i></div><b>${count}</b></div>`).join('')}` : `<div class="visual-empty"><i data-lucide="bar-chart-3"></i><span>No values available to compare.</span></div>`;
  lucide.createIcons();
}

async function loadGenericData() {
  if (!sb || !$("genericTableSelect")) return;
  currentTable = $("genericTableSelect").value;
  $("dynamicTableTitle").textContent = currentTable.replace(/_/g, ' ').toUpperCase();
  $("genericHead").innerHTML = `<tr><th>Loading...</th></tr>`; $("genericBody").innerHTML = `<tr><td><span class="skeleton-cell"></span></td></tr>`;

  const selectQuery = currentTable === "attendance" ? "*, users(full_name)" : "*";
  const sortColumn = currentTable === "attendance" ? "work_date" : "id";
  const { data, error } = await sb.from(currentTable).select(selectQuery).order(sortColumn, { ascending: false }).limit(100);
  
  if (error) { $("genericHead").innerHTML = `<tr><th>Error</th></tr>`; $("genericBody").innerHTML = `<tr><td class="danger-text">${esc(error.message)}</td></tr>`; $("genericAddBtn").disabled = true; return; }
  currentData = (data || []).map(row => {
    if (currentTable === "attendance") {
      return { ...row, user_name: row.users?.full_name || userNameById(row.user_id) };
    }
    return row;
  });
  safeText("genericRecordCount", currentData.length);
  safeText("genericUpdatedAt", new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  
  if (currentData.length === 0) {
    $("genericHead").innerHTML = `<tr><th>No Data Found</th></tr>`; $("genericBody").innerHTML = `<tr><td class="muted" style="padding:30px;text-align:center;">Table empty. Cannot infer schema to add rows.</td></tr>`;
    $("genericAddBtn").disabled = true; currentSchema = []; return;
  }

  if (currentTable === "attendance") {
    currentSchema = ["user_id", "work_date", "clock_in", "clock_out"];
  } else {
    currentSchema = Object.keys(currentData[0]).filter(k => typeof currentData[0][k] !== 'object' || currentData[0][k] === null);
  }
  renderDataVisualizations();

  $("genericAddBtn").disabled = false;
  $("genericHead").innerHTML = `<tr>${currentSchema.map(col => `<th>${esc((currentTable === "attendance" ? {
    user_id: "User",
    work_date: "Date",
    clock_in: "Clock In",
    clock_out: "Clock Out"
  } : {})[col] || (isUserReferenceColumn(col) ? "User" : col.replace(/_/g, " ")))}</th>`).join("")}<th style="width:100px;">Actions</th></tr>`;
  
  const visibleData = currentData.filter(row => !genericSearch || Object.values(row).some(value => String(value ?? "").toLowerCase().includes(genericSearch)));
  safeText("genericVisibleCount", visibleData.length);
  $("genericBody").innerHTML = visibleData.map(row => `
    <tr data-row-id="${row.id}">
      ${currentSchema.map(col => {
        let val = row[col];
        if (currentTable === "attendance" && col === "user_id") {
          val = row.users?.full_name || userNameById(row.user_id);
        } else if (isUserReferenceColumn(col)) {
          val = userNameById(row[col]);
        }
        val = formatGenericColumnValue(col, val);
        return `<td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${esc(String(val))}">${esc(String(val))}</td>`;
      }).join("")}
      <td class="actions">
        <button onclick="openGenericModal('edit', ${row.id})" title="Edit"><i data-lucide="pencil"></i></button>
        <button onclick="deleteGenericRecord(${row.id})" title="Delete" style="color:var(--danger)"><i data-lucide="trash-2"></i></button>
      </td>
    </tr>
  `).join("");
  lucide.createIcons();
}

window.openGenericModal = function(mode, id) {
  $("genericFormInputs").innerHTML = "";
  editingId = mode === "edit" ? id : null;
  $("genericModalTitle").textContent = mode === "edit" ? `Edit ${currentTable} record` : `Add new ${currentTable} record`;
  const rowData = mode === "edit" ? currentData.find(r => r.id === id) : {};

  currentSchema.forEach(col => {
    const isReadOnly = col === "id" || col === "created_at";
    const val = rowData[col] !== undefined && rowData[col] !== null ? rowData[col] : "";

    if (isUserReferenceColumn(col)) {
      const userOptions = allUsers.map(u => `<option value="${u.id}" ${String(u.id) === String(val) ? "selected" : ""}>${esc(u.full_name || u.email || `User #${u.id}`)}</option>`).join("");
      $("genericFormInputs").innerHTML += `<label style="display:flex; flex-direction:column; gap:6px;">
        <span style="font-size:12px; color:var(--muted); text-transform:uppercase;">${esc(col.replace(/_/g, " ").replace(/\buser\b/i, "User"))}</span>
        <select name="${col}" style="min-height:42px; font-family:var(--font-ui);">${userOptions}</select>
      </label>`;
      return;
    }

    $("genericFormInputs").innerHTML += `<label style="display:flex; flex-direction:column; gap:6px;">
      <span style="font-size:12px; color:var(--muted); text-transform:uppercase;">${esc(col.replace(/_/g, " "))} ${isReadOnly ? '(Auto)' : ''}</span>
      ${isReadOnly ? `<input type="text" name="${col}" value="${esc(val)}" readonly style="opacity:0.6; cursor:not-allowed; background:var(--surface3);">` : `<textarea name="${col}" rows="1" style="min-height:42px; font-family:var(--font-ui);">${esc(val)}</textarea>`}
    </label>`;
  });
  $("genericModal").classList.remove("hidden");
};

if ($("closeGenericModal")) $("closeGenericModal").onclick = () => $("genericModal").classList.add("hidden");
if ($("genericAddBtn")) $("genericAddBtn").onclick = () => openGenericModal("add", null);
if ($("genericTableSelect")) $("genericTableSelect").onchange = loadGenericData;
if ($("refreshGenericBtn")) $("refreshGenericBtn").onclick = loadGenericData;
if ($("genericSearch")) $("genericSearch").oninput = event => { genericSearch = event.target.value.trim().toLowerCase(); loadGenericData(); };

if ($("genericExportBtn")) $("genericExportBtn").onclick = () => {
  if (!currentData.length) { toast("There is no data to export.", "error"); return; }
  const headers = currentSchema;
  const rows = currentData.filter(row => !genericSearch || Object.values(row).some(value => String(value ?? "").toLowerCase().includes(genericSearch)));
  const csv = [headers, ...rows.map(row => headers.map(header => `"${String(formatGenericColumnValue(header, row[header]) ?? "").replace(/"/g, '""')}"`))].map(row => row.join(",")).join("\n");
  const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = `${currentTable}-export.csv`; link.click(); URL.revokeObjectURL(link.href);
};

if ($("genericForm")) $("genericForm").onsubmit = async (e) => {
  e.preventDefault(); $("genericFormSubmit").disabled = true;
  const payload = Object.fromEntries(new FormData(e.target).entries());
  delete payload.id; delete payload.created_at;
  Object.keys(payload).forEach(k => { if (payload[k] === "") payload[k] = null; });

  try {
    if (editingId) {
      const { error } = await sb.from(currentTable).update(payload).eq("id", editingId);
      if (error) throw error;
      await sb.from("audit_logs").insert({ actor_id: myRecord?.id, action: "GENERIC_UPDATE", entity_table: currentTable, entity_id: editingId, diff_data: payload });
    } else {
      const { data, error } = await sb.from(currentTable).insert(payload).select().single();
      if (error) throw error;
      await sb.from("audit_logs").insert({ actor_id: myRecord?.id, action: "GENERIC_CREATE", entity_table: currentTable, entity_id: data.id, diff_data: payload });
    }
    toast("Record saved."); $("genericModal").classList.add("hidden"); await loadGenericData();
  } catch (error) { toast(error.message, "error"); } finally { $("genericFormSubmit").disabled = false; }
};

window.deleteGenericRecord = async function(id) {
  if (!confirm(`Are you sure you want to permanently delete record #${id} from ${currentTable}?`)) return;
  try {
    const { error } = await sb.from(currentTable).delete().eq("id", id);
    if (error) throw error;
    await sb.from("audit_logs").insert({ actor_id: myRecord?.id, action: "GENERIC_DELETE", entity_table: currentTable, entity_id: id, diff_data: {} });
    toast("Record deleted."); await loadGenericData();
  } catch (error) { toast(error.message, "error"); }
};

// ============================================
// EXECUTIVE: READ-ONLY AUDIT LOGS
// ============================================
async function loadAuditLogs() {
  if (!sb || !$("auditTableBody")) return;
  const { data, error } = await sb.from("audit_logs").select("*, users(full_name, role)").order("created_at", { ascending: false }).limit(150);
  if (error) { $("auditTableBody").innerHTML = `<tr><td colspan="6" class="danger-text">${esc(error.message)}</td></tr>`; return; }
  
  $("auditTableBody").innerHTML = (data || []).length ? data.map(a => `
    <tr>
      <td style="white-space:nowrap">${new Date(a.created_at).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</td>
      <td><b>${esc(a.users?.full_name || "System")}</b><br><small class="muted">${esc(a.users?.role || "")}</small></td>
      <td><span class="badge" style="background:var(--surface3); color:var(--text);">${esc(a.action)}</span></td>
      <td style="color:var(--accent); font-family:monospace;">${esc(a.entity_table)}</td>
      <td>#${esc(a.entity_id)}</td>
      <td><div style="max-height:40px; overflow:hidden; font-size:11px; color:var(--muted); font-family:monospace;" title="${esc(JSON.stringify(a.diff_data))}">${esc(JSON.stringify(a.diff_data))}</div></td>
    </tr>
  `).join("") : `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--muted);">No audit logs found.</td></tr>`;
}

// ============================================
// UI NAVIGATION BINDINGS
// ============================================
document.querySelectorAll(".nav[data-view]").forEach(b => b.onclick = () => {
  document.querySelectorAll(".nav[data-view], .view").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  const targetView = $(`${b.dataset.view}View`);
  if (targetView) targetView.classList.add("active");
  if ($("sidebar")) $("sidebar").classList.remove("open");
  
  if (b.dataset.view === 'datagrid') loadGenericData();
  if (b.dataset.view === 'audit') loadAuditLogs();
  if (b.dataset.view === 'analytics') loadExecutiveAnalytics();
  if (b.dataset.view === 'teaminsights') loadTeamInsights();
});

if ($("hamburgerBtn")) $("hamburgerBtn").onclick = () => $("sidebar").classList.add("open");
if ($("sidebarClose")) $("sidebarClose").onclick = () => $("sidebar").classList.remove("open");
function closeExecutiveProfileMenu() {
  $("userDropdown")?.classList.remove("open");
  $("userBox")?.setAttribute("aria-expanded", "false");
}
function openExecutiveProfileMenu() {
  const dropdown = $("userDropdown"); if (!dropdown) return;
  const open = !dropdown.classList.contains("open");
  dropdown.classList.toggle("open", open); $("userBox")?.setAttribute("aria-expanded", String(open));
  if (open) dropdown.querySelector("button")?.focus();
}
if ($("userBox")) $("userBox").onclick = openExecutiveProfileMenu;
document.addEventListener("click", event => { if (!event.target.closest(".user-menu")) closeExecutiveProfileMenu(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { closeExecutiveProfileMenu(); if ($("executiveProfileModal") && !$('executiveProfileModal').classList.contains("hidden")) closeExecutiveProfileModal(); }
});
function closeExecutiveProfileModal() { $("executiveProfileModal")?.classList.add("hidden"); document.body.classList.remove("profile-modal-open"); }
function openExecutiveProfileModal() { closeExecutiveProfileMenu(); $("executiveProfileModal")?.classList.remove("hidden"); document.body.classList.add("profile-modal-open"); $("closeExecutiveProfile")?.focus(); }
function closeExecutiveEditModal() { $("executiveEditModal")?.classList.add("hidden"); document.body.classList.remove("profile-modal-open"); }
function openExecutiveEditModal() { closeExecutiveProfileMenu(); populateExecutiveEditForm(myRecord); setFormMessage("executiveEditMessage", ""); $("executiveEditModal")?.classList.remove("hidden"); document.body.classList.add("profile-modal-open"); $("editFullName")?.focus(); }
$("viewProfileBtn")?.addEventListener("click", openExecutiveProfileModal);
$("editProfileBtn")?.addEventListener("click", openExecutiveEditModal);
$("closeExecutiveProfile")?.addEventListener("click", closeExecutiveProfileModal);
$("executiveProfileModal")?.addEventListener("click", event => { if (event.target === $("executiveProfileModal")) closeExecutiveProfileModal(); });
$("closeExecutiveEdit")?.addEventListener("click", closeExecutiveEditModal);
$("cancelExecutiveEdit")?.addEventListener("click", closeExecutiveEditModal);
$("executiveEditModal")?.addEventListener("click", event => { if (event.target === $("executiveEditModal")) closeExecutiveEditModal(); });
$("executiveEditForm")?.addEventListener("submit", async event => {
  event.preventDefault(); setFormMessage("executiveEditMessage", "");
  if (!sb || !currentUser || !myRecord?.id) { setFormMessage("executiveEditMessage", "Your profile is not ready to be edited."); return; }
  const form = event.currentTarget;
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const fieldIds = ["editFullName", "editPreferredName", "editPhone", "editLocation", "editDepartment", "editAvatarUrl", "editHeadline", "editLinkedin", "editBio"];
  const payload = {};
  fieldIds.forEach(id => { const field = $(id); payload[field.name] = field.value.trim() || null; });
  const saveButton = $("saveExecutiveEdit"); saveButton.disabled = true;
  try {
    const { data, error } = await sb.from("users").update(payload).eq("id", myRecord.id).eq("auth_user_id", currentUser.id).select("*").single();
    if (error) throw error;
    myRecord = data || { ...myRecord, ...payload };
    populateExecutiveProfile(myRecord, currentUser); closeExecutiveEditModal(); toast("Profile updated successfully.");
  } catch (error) { setFormMessage("executiveEditMessage", error?.message || "Unable to update your profile."); }
  finally { saveButton.disabled = false; }
});
$("accountSettingsBtn")?.addEventListener("click", () => { closeExecutiveProfileMenu(); toast("Account settings are managed by your HGS administrator."); });

if ($("ddTheme")) $("ddTheme").onclick = toggleTheme;
if ($("themeBtn")) $("themeBtn").onclick = toggleTheme;
if ($("ddRefresh")) $("ddRefresh").onclick = loadData;

let autoRefreshTimer = null;
function startAutoRefresh() {
  if (autoRefreshTimer) return;
  autoRefreshTimer = setInterval(async () => {
    try {
      if (document.visibilityState === "visible") {
        await loadData();
      }
    } catch (error) {
      console.error("Auto-refresh failed:", error);
    }
  }, 15000);
}

startAutoRefresh();

// Utilities
function emptyRow(colspan, title, hint){
  return `<tr><td colspan="${colspan}"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><b>${esc(title)}</b>${hint ? `<div>${esc(hint)}</div>` : ""}</div></td></tr>`;
}

function assignedWorkFromProfile(profile) {
  if (!profile) return "No assignment recorded";
  const value = profile.assigned_work || profile.assignment || profile.project_name || profile.project || profile.work_assigned;
  return value ? String(value) : "No assignment recorded";
}

async function loadInternWorkspace() {
  if (!sb || !myRecord) return;
  const [{ data: profile }, { data: activities }] = await Promise.all([
    sb.from("intern_profiles").select("*").eq("user_id", myRecord.id).maybeSingle(),
    sb.from("daily_activities").select("activity_date, description").eq("user_id", myRecord.id).order("activity_date", { ascending: false }).limit(4)
  ]);

  const assignment = assignedWorkFromProfile(profile);
  $("assignedWorkList").innerHTML = `<div class="assignment-highlight"><i data-lucide="target"></i><span>${esc(assignment)}</span></div>${profile?.supervisor_name ? `<p class="muted compact-note">Supervisor: ${esc(profile.supervisor_name)}</p>` : ""}`;
  $("myUpdatesList").innerHTML = activities?.length ? activities.map(activity => `<div class="mini-update"><span>${esc(activity.activity_date)}</span><b>${esc(activity.description || "Activity submitted")}</b></div>`).join("") : `<p class="muted">No updates submitted yet.</p>`;
  lucide.createIcons();
}

const HGS_HOLIDAYS = [
  { name: "Mahatma Gandhi Jayanti", date: "2026-10-02" },
  { name: "Dussehra", date: "2026-10-20" },
  { name: "Diwali", date: "2026-11-08" },
  { name: "Christmas Day", date: "2026-12-25" }
];

function renderHolidayCalendar() {
  if (!$('holidayList')) return;
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = HGS_HOLIDAYS.filter(holiday => holiday.date >= today);
  $('holidayList').innerHTML = upcoming.length ? upcoming.map(holiday => `<div class="holiday-row"><div><b>${esc(holiday.name)}</b><small>${new Date(`${holiday.date}T00:00:00`).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</small></div><i data-lucide="calendar-days"></i></div>`).join('') : '<p class="muted">No more holidays listed for this year.</p>';
  lucide.createIcons();
}

if ($('openHolidayCalendar')) $('openHolidayCalendar').onclick = () => { renderHolidayCalendar(); $('holidayModal').classList.remove('hidden'); };
if ($('holidayCard')) $('holidayCard').onclick = () => { renderHolidayCalendar(); $('holidayModal').classList.remove('hidden'); };
if ($('closeHolidayModal')) $('closeHolidayModal').onclick = () => $('holidayModal').classList.add('hidden');

let teamInsightRows = [];

async function loadTeamInsights() {
  if (!sb || !$('teaminsightsView')) return;
  const [{ data: activities }, { data: attendance }, { data: profiles }] = await Promise.all([
    sb.from("daily_activities").select("user_id, activity_date, description").gte("activity_date", new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)),
    sb.from("attendance").select("user_id, work_date, clock_in, clock_out").gte("work_date", new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)),
    sb.from("intern_profiles").select("*")
  ]);

  const activityRows = activities || [], attendanceRows = attendance || [], profileRows = profiles || [];
  const activeUsers = allUsers.filter(user => !user.deleted_at && user.status !== "terminated");
  const activityByUser = new Map(), attendanceByUser = new Map(), profileByUser = new Map(profileRows.map(profile => [String(profile.user_id), profile]));
  activityRows.forEach(activity => activityByUser.set(String(activity.user_id), [...(activityByUser.get(String(activity.user_id)) || []), activity]));
  attendanceRows.forEach(record => attendanceByUser.set(String(record.user_id), [...(attendanceByUser.get(String(record.user_id)) || []), record]));
  teamInsightRows = activeUsers.map(user => ({ user, activities: activityByUser.get(String(user.id)) || [], attendance: attendanceByUser.get(String(user.id)) || [], profile: profileByUser.get(String(user.id)) })).sort((a, b) => b.activities.length - a.activities.length);

  const activeToday = attendanceRows.filter(record => record.work_date === new Date().toLocaleDateString("en-CA") && record.clock_in && !record.clock_out).length;
  $("teamInsightStats").innerHTML = [
    ["People tracked", activeUsers.length, "users-round", "c-teal"],
    ["Updates this month", activityRows.length, "file-check-2", "c-blue"],
    ["Attendance records", attendanceRows.length, "clock-3", "c-gold"],
    ["Working right now", activeToday, "radio", "c-violet"]
  ].map(([label, value, icon, color]) => `<div class="stat card"><div class="stat-icon ${color}"><i data-lucide="${icon}"></i></div><span>${label}</span><strong>${value}</strong></div>`).join("");
  renderTeamInsights();
  lucide.createIcons();
}

function renderLeadershipLeaveRoster() {
  if (!$('leadershipLeaveRoster')) return;
  const away = allUsers.filter(user => user.status === 'on_leave' && !user.deleted_at);
  safeText('leaveRosterCount', `${away.length} away`);
  $('leadershipLeaveRoster').innerHTML = away.length ? away.map(user => `<div class="leave-roster-row"><div class="avatar" style="background:${colorFor(user.email)}">${initials(user.full_name || user.email)}</div><div><b>${esc(user.full_name || user.email)}</b><small>${esc(user.position || user.role || 'Team member')}</small></div><span class="badge on_leave">On leave</span></div>`).join('') : '<div class="empty-widget"><i data-lucide="sun"></i><span>No team members are on leave today.</span></div>';
  lucide.createIcons();
}

async function loadExecutiveAnalytics() {
  if (!sb || !$('anaStats')) return;
  const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const { data: activities } = await sb.from('daily_activities').select('user_id, activity_date').gte('activity_date', since);
  const activityRows = activities || [];
  const liveUsers = allUsers.filter(user => !user.deleted_at);
  const monthKeys = [...Array(6)].map((_, index) => { const date = new Date(); date.setMonth(date.getMonth() - (5 - index)); return date.toISOString().slice(0, 7); });
  const growth = monthKeys.map(key => ({ key, count: liveUsers.filter(user => String(user.joining_date || user.created_at || '').slice(0, 7) === key).length }));
  const roles = [...new Set(liveUsers.map(user => user.role || user.position || 'Unassigned'))].map(role => ({ role, count: liveUsers.filter(user => (user.role || user.position || 'Unassigned') === role).length }));
  $('anaStats').innerHTML = [["Updates, last 30 days", activityRows.length, "activity", "c-blue"], ["Active people", liveUsers.filter(user => user.status === 'active').length, "user-check", "c-teal"], ["People on leave", liveUsers.filter(user => user.status === 'on_leave').length, "coffee", "c-gold"], ["Roles represented", roles.length, "layers", "c-violet"]].map(([label, value, icon, color]) => `<div class="stat card"><div class="stat-icon ${color}"><i data-lucide="${icon}"></i></div><span>${label}</span><strong>${value}</strong></div>`).join('');
  const maxGrowth = Math.max(1, ...growth.map(item => item.count));
  $('anaGrowthChart').innerHTML = growth.map(item => `<div class="bar-item"><span>${new Date(`${item.key}-01T00:00:00`).toLocaleDateString([], { month: 'short' })}</span><div class="bar-track"><i style="height:${Math.max(8, item.count / maxGrowth * 100)}%"></i></div><b>${item.count}</b></div>`).join('');
  $('anaLegend').innerHTML = roles.map(item => `<div class="system-item"><span>${esc(item.role)}</span><b>${item.count}</b></div>`).join('') || '<p class="muted">No role data available.</p>';
  const onLeave = liveUsers.filter(user => user.status === 'on_leave');
  $('anaLeaveWeek').innerHTML = onLeave.length ? onLeave.map(user => `<div class="list-item"><b>${esc(user.full_name || user.email)}</b><span class="badge on_leave">On leave</span></div>`).join('') : '<p class="muted">No one is currently on leave.</p>';
  lucide.createIcons();
}

async function loadExecutiveActivityFeed() {
  if (!sb || !$('execFeedList')) return;
  const { data, error } = await sb.from('daily_activities').select('activity_date, description, created_at, users(full_name)').order('created_at', { ascending: false }).limit(8);
  if (error) {
    $('execFeedList').innerHTML = `<p class="muted">Unable to load updates.</p>`;
    return;
  }
  $('execFeedList').innerHTML = data?.length ? data.map(activity => {
    const timestamp = activity.created_at || activity.activity_date;
    const age = timestamp ? new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent';
    return `<div class="feed-item"><span class="feed-time">${esc(age)}</span><div><b>${esc(activity.users?.full_name || 'Team member')}</b> posted an update: ${esc(activity.description || 'Activity submitted')}</div></div>`;
  }).join('') : '<p class="muted">No activity updates yet.</p>';
}

function renderTeamInsights() {
  const query = ($("teamMemberSearch")?.value || "").trim().toLowerCase();
  const rows = teamInsightRows.filter(({ user }) => `${user.full_name || ""} ${user.email || ""}`.toLowerCase().includes(query));
  const maxActivities = Math.max(1, ...teamInsightRows.map(row => row.activities.length));
  $("individualWorkGraph").innerHTML = rows.length ? rows.slice(0, 12).map(({ user, activities }) => `<div class="work-graph-row"><div class="work-person"><div class="avatar" style="background:${colorFor(user.email)}">${initials(user.full_name || user.email)}</div><b>${esc(user.full_name || user.email)}</b></div><div class="work-bar-track"><span style="width:${Math.max(5, Math.round(activities.length / maxActivities * 100))}%"></span></div><strong>${activities.length}</strong></div>`).join("") : `<p class="muted">No people match this search.</p>`;
  $("teamDirectoryBody").innerHTML = rows.length ? rows.map(({ user, activities, attendance, profile }) => {
    const latest = activities[0];
    return `<tr><td><b>${esc(user.full_name || user.email)}</b><br><small class="muted">${esc(user.email || "")}</small></td><td>${badge(user.status || "active")}</td><td>${attendance.length} days</td><td>${activities.length} updates</td><td>${esc(assignedWorkFromProfile(profile))}</td><td>${latest ? esc(latest.activity_date) : "—"}</td></tr>`;
  }).join("") : emptyRow(6, "No people found", "Try a different search term.");
  lucide.createIcons();
}

if ($("teamMemberSearch")) $("teamMemberSearch").addEventListener("input", renderTeamInsights);
if ($("refreshTeamInsights")) $("refreshTeamInsights").onclick = loadTeamInsights;