import { useEffect, useState } from "react";
import {
  Trash2,
  Undo2,
  X,
  RotateCcw,
} from "lucide-react";
import Card from "../components/Card";
import { api } from "../services/api";
import { useToast } from "../components/Toast";
import "../style.css";

const TYPE_LABELS = {
  projects: "Project",
  skills: "Skill",
  certifications: "Certification",
  goals: "Goal",
  journal: "Journal Entry",
  "coding-progress": "Coding Progress",
  applications: "Application",
  "academic-info": "Academic Info",
};

function RecycleBinPage() {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await api.get("/recycle-bin");
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading recycle bin:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const restoreItem = async (itemType, itemId, label) => {
    try {
      await api.post(`/recycle-bin/${itemType}/${itemId}/restore`);
      await loadItems();
      addToast(`"${label}" restored successfully`, "success");
    } catch (error) {
      console.error("Error restoring item:", error);
      addToast("Failed to restore item.", "error");
    }
  };

  const permanentDelete = async (itemType, itemId, label) => {
    try {
      await api.delete(`/recycle-bin/${itemType}/${itemId}`);
      await loadItems();
      addToast(`"${label}" permanently deleted`, "info");
    } catch (error) {
      console.error("Error deleting item:", error);
      addToast("Failed to delete item.", "error");
    }
  };

  const clearAll = async () => {
    if (items.length === 0) return;
    try {
      await api.delete("/recycle-bin/clear");
      await loadItems();
      addToast("Recycle bin cleared", "success");
    } catch (error) {
      console.error("Error clearing recycle bin:", error);
      addToast("Failed to clear recycle bin.", "error");
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="page module">
      <div className="moduleHeader dataPageHeader">
        <div className="formTitleContent">
          <div className="formIcon">
            <Trash2 size={22} />
          </div>
          <div>
            <h1>Recycle Bin</h1>
            <p>Restore or permanently delete removed items.</p>
          </div>
        </div>

        {items.length > 0 && (
          <button className="clearAllBtn" onClick={clearAll}>
            <Trash2 size={15} />
            Clear All
          </button>
        )}
      </div>

      <div className="moduleGrid">
        {loading ? (
          <p>Loading recycle bin...</p>
        ) : items.length === 0 ? (
          <div className="emptyRecycleBin">
            <Trash2 size={48} />
            <h3>Recycle bin is empty</h3>
            <p>Deleted items will appear here.</p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={`${item.type}-${item.id}`} className="moduleCard recycleCard">
              <div className="recycleCardTop">
                <span className="recycleTypeBadge">
                  {TYPE_LABELS[item.type] || item.type}
                </span>
                <span className="recycleDate">
                  {formatDate(item.deleted_at)}
                </span>
              </div>

              <h3>{item.label}</h3>

              <div className="recycleActions">
                <button
                  className="restoreBtn"
                  onClick={() =>
                    restoreItem(item.type, item.id, item.label)
                  }
                >
                  <Undo2 size={15} />
                  Restore
                </button>
                <button
                  className="permanentDeleteBtn"
                  onClick={() =>
                    permanentDelete(item.type, item.id, item.label)
                  }
                >
                  <X size={15} />
                  Delete
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default RecycleBinPage;
