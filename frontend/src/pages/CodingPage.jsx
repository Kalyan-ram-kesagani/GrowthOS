import { useEffect, useState, useCallback } from "react";

import {
  Code2,
  Plus,
  X,
  RefreshCw,
  Unlink,
  ExternalLink,
  CalendarDays,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import Card from "../components/Card";
import { api } from "../services/api";
import { useToast } from "../components/Toast";

const PLATFORMS = [
  { value: "leetcode", label: "LeetCode" },
  { value: "hackerrank", label: "HackerRank" },
  { value: "codechef", label: "CodeChef" },
  { value: "codeforces", label: "Codeforces" },
  { value: "geeksforgeeks", label: "GeeksforGeeks" },
];

const DIFFICULTY_COLORS = {
  Easy: "#4ade80",
  Medium: "#facc15",
  Hard: "#f87171",
};

const PLATFORM_COLORS = {
  leetcode: "#ffa116",
  hackerrank: "#1ba94c",
  codechef: "#9b59b6",
  codeforces: "#1da1f2",
  geeksforgeeks: "#2ecc71",
};

function CodingPage() {
  const { addToast } = useToast();

  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [newPlatform, setNewPlatform] = useState("leetcode");
  const [newUsername, setNewUsername] = useState("");
  const [connecting, setConnecting] = useState(false);

  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedProblems, setExpandedProblems] = useState({});

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [accs, st, prob] = await Promise.all([
        api.get("/coding/accounts"),
        api.get("/coding/stats"),
        api.get("/coding/problems"),
      ]);
      setAccounts(Array.isArray(accs) ? accs : []);
      setStats(st);
      setProblems(Array.isArray(prob) ? prob : []);
    } catch (err) {
      console.error("Failed to load coding data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (accounts.length > 0 && !syncing) {
      const syncTimeout = setTimeout(() => {
        syncNow();
      }, 2000);
      return () => clearTimeout(syncTimeout);
    }
  }, [accounts.length]);

  const connectAccount = async () => {
    if (!newUsername.trim()) {
      addToast("Please enter a username.", "error");
      return;
    }
    try {
      setConnecting(true);
      await api.post("/coding/accounts", {
        platform: newPlatform,
        username: newUsername.trim(),
      });
      setNewUsername("");
      setShowConnect(false);
      addToast("Account connected!", "success");
      await loadAll();
    } catch (err) {
      addToast(err.message || "Failed to connect account.", "error");
    } finally {
      setConnecting(false);
    }
  };

  const disconnectAccount = async (id, platform) => {
    try {
      await api.delete(`/coding/accounts/${id}`);
      addToast(`${platform} account disconnected.`, "info");
      await loadAll();
    } catch (err) {
      addToast("Failed to disconnect.", "error");
    }
  };

  const syncNow = async (platform) => {
    try {
      setSyncing(true);
      const body = platform ? { platform } : {};
      await api.post("/coding/sync", body);
      addToast("Sync started! Problems will appear shortly.", "info");

      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const accs = await api.get("/coding/accounts");
          setAccounts(Array.isArray(accs) ? accs : []);
          const stillSyncing = (Array.isArray(accs) ? accs : []).some(
            (a) => a.sync_status === "syncing"
          );
          if (!stillSyncing || attempts > 20) {
            clearInterval(poll);
            setSyncing(false);
            await loadAll();
          }
        } catch {
          clearInterval(poll);
          setSyncing(false);
        }
      }, 3000);
    } catch (err) {
      setSyncing(false);
      addToast(err.message || "Sync failed.", "error");
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({});
    setEditingId(null);
  };

  const saveManual = async () => {
    const payload = {
      title: form.title || "",
      platform: form.platform || "LeetCode",
      difficulty: form.difficulty || "Easy",
      status: form.status || "Solved",
      notes: form.notes || "",
    };
    if (!payload.title) {
      addToast("Problem title is required.", "error");
      return;
    }
    try {
      setSaving(true);
      if (!editingId) {
        await api.post("/coding-progress", payload);
      } else {
        await api.put(`/coding-progress/${editingId}`, payload);
      }
      resetForm();
      addToast(editingId ? "Problem updated." : "Problem added.", "success");
      await loadAll();
    } catch (err) {
      addToast("Failed to save problem.", "error");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setForm({
      title: item.title || "",
      platform: item.platform || "LeetCode",
      difficulty: item.difficulty || "Easy",
      status: item.status || "Solved",
      notes: item.notes || "",
    });
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteManual = async (id) => {
    try {
      await api.delete(`/coding-progress/${id}`);
      addToast("Problem moved to recycle bin.", "info");
      if (editingId === id) resetForm();
      await loadAll();
    } catch {
      addToast("Failed to delete.", "error");
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "Never";
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  const toggleProblemExpand = (index) => {
    setExpandedProblems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <div className="page module">
        <div className="moduleHeader dataPageHeader">
          <span className="eyebrow">
            <Code2 size={15} />
            GROWTHOS CODING
          </span>
          <h1>Coding Progress</h1>
          <p>Loading your coding data...</p>
        </div>
      </div>
    );
  }

  const totalSolved = stats?.total_solved || 0;
  const diffCounts = stats?.difficulty || {};
  const platformCounts = stats?.platforms || {};
  const recentProblems = stats?.recent || [];
  const streak = stats?.coding_streak || 0;
  const weekCount = stats?.problems_this_week || 0;
  const monthCount = stats?.problems_this_month || 0;
  const weeklyActivity = stats?.weekly_activity || [];

  return (
    <div className="page module dataPage">

      {/* HEADER */}
      <div className="moduleHeader dataPageHeader">
        <span className="eyebrow">
          <Code2 size={15} />
          GROWTHOS CODING
        </span>
        <h1>Coding Progress</h1>
        <p>Auto-sync from LeetCode, HackerRank, CodeChef, Codeforces, and GeeksforGeeks — or add problems manually.</p>
      </div>

      {/* CONNECTED ACCOUNTS */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="cardHead">
          <div>
            <h3>Connected Accounts</h3>
            <p>Link your coding platforms for auto-sync</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {accounts.length > 0 && (
              <button
                className="saveBtn"
                onClick={() => syncNow()}
                disabled={syncing}
                style={{ fontSize: 13, padding: "8px 14px" }}
              >
                {syncing ? (
                  <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <RefreshCw size={15} />
                )}
                {syncing ? "Syncing..." : "Sync All"}
              </button>
            )}
            <button
              className="saveBtn"
              onClick={() => setShowConnect(true)}
              style={{ fontSize: 13, padding: "8px 14px" }}
            >
              <Plus size={15} />
              Connect Account
            </button>
          </div>
        </div>

        {accounts.length === 0 ? (
          <div style={{ padding: "16px 0", color: "var(--muted)", fontSize: 14 }}>
            No connected accounts. Connect a platform to start auto-syncing your solved problems.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {accounts.map((acc) => (
              <div
                key={acc.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: acc.sync_status === "syncing"
                        ? "#facc15"
                        : acc.sync_status === "error"
                        ? "#f87171"
                        : "#4ade80",
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {PLATFORMS.find((p) => p.value === acc.platform)?.label || acc.platform}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>
                      @{acc.username} · Last synced: {formatTime(acc.last_synced_at)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => syncNow(acc.platform)}
                    disabled={syncing}
                    style={{
                      background: "rgba(124,108,255,0.1)",
                      color: "#a99cff",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <RefreshCw size={13} />
                    Sync
                  </button>
                  <button
                    onClick={() => disconnectAccount(acc.id, acc.platform)}
                    style={{
                      background: "rgba(248,113,113,0.1)",
                      color: "#f87171",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Unlink size={13} />
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONNECT MODAL */}
      {showConnect && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowConnect(false)}
        >
          <div
            className="card"
            style={{ width: 400, maxWidth: "90vw" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cardHead">
              <h3>Connect Coding Account</h3>
              <button
                onClick={() => setShowConnect(false)}
                style={{ background: "none", color: "var(--muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="formGroup" style={{ marginTop: 16 }}>
              <label>Platform</label>
              <select
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="formGroup">
              <label>Username</label>
              <input
                type="text"
                placeholder={`Your ${PLATFORMS.find((p) => p.value === newPlatform)?.label} username`}
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                className="cancelBtn"
                onClick={() => setShowConnect(false)}
                disabled={connecting}
              >
                Cancel
              </button>
              <button
                className="saveBtn"
                onClick={connectAccount}
                disabled={connecting}
              >
                {connecting ? "Connecting..." : "Connect"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="moduleGrid" style={{ marginTop: 0 }}>
        <div className="card moduleCard">
          <Zap />
          <h3>{totalSolved}</h3>
          <p>Total Problems Solved</p>
          <small>{weekCount} this week · {monthCount} this month</small>
        </div>
        <div className="card moduleCard">
          <div style={{ color: DIFFICULTY_COLORS.Easy, fontSize: 18 }}>●</div>
          <h3>{diffCounts.Easy || 0}</h3>
          <p>Easy</p>
        </div>
        <div className="card moduleCard">
          <div style={{ color: DIFFICULTY_COLORS.Medium, fontSize: 18 }}>●</div>
          <h3>{diffCounts.Medium || 0}</h3>
          <p>Medium</p>
        </div>
        <div className="card moduleCard">
          <div style={{ color: DIFFICULTY_COLORS.Hard, fontSize: 18 }}>●</div>
          <h3>{diffCounts.Hard || 0}</h3>
          <p>Hard</p>
        </div>
        <div className="card moduleCard">
          <Code2 />
          <h3>{streak} day{streak !== 1 ? "s" : ""}</h3>
          <p>Coding Streak</p>
        </div>
        <div className="card moduleCard">
          <CheckCircle2 />
          <h3>{Object.keys(platformCounts).length}</h3>
          <p>Platforms Connected</p>
        </div>
      </div>

      {/* PLATFORM BREAKDOWN + WEEKLY ACTIVITY */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 24 }}>
        <Card>
          <div className="cardHead">
            <h3>Platform Breakdown</h3>
          </div>
          {Object.keys(platformCounts).length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 12 }}>
              No problems synced yet.
            </p>
          ) : (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(platformCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([platform, count]) => (
                  <div key={platform} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: PLATFORM_COLORS[platform] || "#888",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1, fontSize: 14, textTransform: "capitalize" }}>
                      {PLATFORMS.find((p) => p.value === platform)?.label || platform}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{count}</span>
                  </div>
                ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="cardHead">
            <h3>Weekly Activity</h3>
          </div>
          <div style={{ marginTop: 14, display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
            {weeklyActivity.map((day) => {
              const maxCount = Math.max(...weeklyActivity.map((d) => d.count), 1);
              const height = (day.count / maxCount) * 80;
              return (
                <div key={day.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{day.count}</span>
                  <div
                    style={{
                      width: "100%",
                      height: Math.max(height, 4),
                      background: "var(--accent)",
                      borderRadius: 6,
                      opacity: day.count > 0 ? 1 : 0.2,
                    }}
                  />
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{day.day}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* RECENTLY SOLVED */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="cardHead">
          <h3>Recently Solved</h3>
          <span className="pill">{recentProblems.length} recent</span>
        </div>
        {recentProblems.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 12 }}>
            No problems solved yet. Connect a platform or add problems manually.
          </p>
        ) : (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            {recentProblems.map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: `${PLATFORM_COLORS[p.platform] || "#888"}22`,
                        color: PLATFORM_COLORS[p.platform] || "#888",
                        textTransform: "capitalize",
                        flexShrink: 0,
                      }}
                    >
                      {PLATFORMS.find((pl) => pl.value === p.platform)?.label || p.platform}
                    </span>
                    {p.difficulty && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: DIFFICULTY_COLORS[p.difficulty] || "#888",
                          flexShrink: 0,
                        }}
                      >
                        {p.difficulty}
                      </span>
                    )}
                    <span style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.title}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 12 }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      {formatTime(p.solved_at)}
                    </span>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--accent-light)" }}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button
                      onClick={() => toggleProblemExpand(i)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--muted)",
                        padding: 2,
                      }}
                    >
                      {expandedProblems[i] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>
                {expandedProblems[i] && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)", fontSize: 13, color: "var(--muted)" }}>
                    {p.url && (
                      <div style={{ marginBottom: 4 }}>
                        <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-light)", textDecoration: "none" }}>
                          View on {PLATFORMS.find((pl) => pl.value === p.platform)?.label || p.platform} →
                        </a>
                      </div>
                    )}
                    <div>Problem ID: {p.title?.toLowerCase().replace(/\s+/g, "-")}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MANUAL ADD FORM */}
      <div className="formCenter" style={{ marginTop: 24 }}>
        <Card className="dataForm">
          <div className="formTitle">
            <div className="formTitleContent">
              <div className="formIcon">
                <Code2 size={22} />
              </div>
              <div>
                <h2>{editingId ? "Edit Problem" : "Add Problem Manually"}</h2>
                <p>{editingId ? "Update your problem information." : "Manually add a coding problem to your progress."}</p>
              </div>
            </div>
            {editingId && (
              <button className="closeEditBtn" onClick={resetForm} disabled={saving}>
                <X size={18} />
              </button>
            )}
          </div>

          <div className="formFields">
            <div className="formGroup">
              <label>Problem Title</label>
              <input
                type="text"
                placeholder="e.g. Two Sum"
                value={form.title || ""}
                onChange={(e) => handleFormChange("title", e.target.value)}
              />
            </div>

            <div className="formGroup">
              <label>Platform</label>
              <select
                value={form.platform || "LeetCode"}
                onChange={(e) => handleFormChange("platform", e.target.value)}
              >
                <option>LeetCode</option>
                <option>HackerRank</option>
                <option>CodeChef</option>
                <option>GeeksforGeeks</option>
                <option>Other</option>
              </select>
            </div>

            <div className="formGroup">
              <label>Difficulty</label>
              <select
                value={form.difficulty || "Easy"}
                onChange={(e) => handleFormChange("difficulty", e.target.value)}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div className="formGroup">
              <label>Status</label>
              <select
                value={form.status || "Solved"}
                onChange={(e) => handleFormChange("status", e.target.value)}
              >
                <option>Solved</option>
                <option>Attempted</option>
                <option>In Progress</option>
              </select>
            </div>

            <div className="formGroup fullWidth">
              <label>Notes</label>
              <textarea
                placeholder="Notes or approach used..."
                value={form.notes || ""}
                onChange={(e) => handleFormChange("notes", e.target.value)}
              />
            </div>
          </div>

          <div className="formActions">
            {editingId && (
              <button className="cancelBtn" onClick={resetForm} disabled={saving}>
                <X size={17} />
                Cancel
              </button>
            )}
            <button className="saveBtn" onClick={saveManual} disabled={saving}>
              <Plus size={17} />
              {saving ? "Saving..." : editingId ? "Update Problem" : "Add Problem"}
            </button>
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .moduleGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 500px) {
          .moduleGrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default CodingPage;
