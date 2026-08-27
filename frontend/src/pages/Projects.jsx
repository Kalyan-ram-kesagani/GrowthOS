import { useEffect, useState } from "react";

import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  Calendar,
} from "lucide-react";

import Card from "../components/Card";
import { api } from "../services/api";
import "../style.css";

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("In Progress");

  const [editingId, setEditingId] = useState(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.get("/projects");
      const sortedProjects = Array.isArray(data)
        ? [...data].reverse()
        : [];
      setProjects(sortedProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const addProject = async () => {
    if (!title.trim()) {
      alert("Please enter a project title");
      return;
    }

    try {
      setSaving(true);
      await api.post("/projects", { title, description, status });
      setTitle("");
      setDescription("");
      setStatus("In Progress");
      await loadProjects();
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (project) => {
    setEditingId(project.id);
    setTitle(project.title || "");
    setDescription(project.description || "");
    setStatus(project.status || "In Progress");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateProject = async () => {
    if (!title.trim()) {
      alert("Please enter a project title");
      return;
    }

    try {
      setSaving(true);
      await api.put(`/projects/${editingId}`, { title, description, status });
      setEditingId(null);
      setTitle("");
      setDescription("");
      setStatus("In Progress");
      await loadProjects();
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id) => {
    const confirmed = window.confirm("Delete this project?");
    if (!confirmed) return;

    try {
      await api.delete(`/projects/${id}`);
      await loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setStatus("In Progress");
  };

  return (
   <div className="page module">

  <div className="projectsHero">

    <span className="eyebrow">
      <FolderKanban size={15} />
      GROWTHOS PROJECTS
    </span>

    <h1>Projects</h1>

    <p className="projectsSubtitle">
      Build a portfolio that proves what you can do.
    </p>

  </div>

      <Card className="coming">

        <div className="formHeader">

          <div className="formIcon">
            <FolderKanban size={24} />
          </div>

          <div>
            <h2>
              {editingId
                ? "Edit Project"
                : "Add New Project"}
            </h2>

            <p>
              {editingId
                ? "Update your project details."
                : "Add a project to your professional portfolio."}
            </p>
          </div>

        </div>

        <div className="projectFormGrid">

          <div className="formField">

            <label>
              Project Title
            </label>

            <input
              placeholder="Enter project title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

          </div>

          <div className="formField">

            <label>
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >
              <option>In Progress</option>
              <option>Completed</option>
              <option>Planned</option>
            </select>

          </div>

          <div className="formField projectDescription">

            <label>
              Description
            </label>

            <textarea
              placeholder="Describe your project..."
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        {/* CENTER BUTTON AREA */}
        <div className="formButtonRow">

  {editingId && (
    <button
      className="cancelBtn"
      onClick={cancelEdit}
      disabled={saving}
    >
      Cancel
    </button>
  )}

  <button
    className="addBtn"
    onClick={
      editingId
        ? updateProject
        : addProject
    }
    disabled={saving}
  >
    <Plus size={17} />

    {saving
      ? "Saving..."
      : editingId
      ? "Update Project"
      : "Add Project"}
  </button>

</div>

      </Card>

      <div className="moduleGrid">

        {loading ? (

          <p>
            Loading projects...
          </p>

        ) : projects.length === 0 ? (

          <p>
            No projects yet.
            Add your first project!
          </p>

        ) : (

          projects.map((project) => (

            <Card
              key={project.id}
              className="moduleCard"
            >

              <FolderKanban />

              <h3>
                {project.title}
              </h3>

              <p>
                {project.description ||
                  "No description provided"}
              </p>

              <p className="projectStatus">
                Status:{" "}
                {project.status}
              </p>

              <p className="createdDate">

                <Calendar size={16} />

                Created:{" "}

                {project.created_at
                  ? new Date(
                      project.created_at
                    ).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : "Recently added"}

              </p>

              <div className="cardActions">

                <button
                  className="editBtn"
                  onClick={() =>
                    startEdit(project)
                  }
                >
                  <Pencil size={16} />
                  Edit
                </button>

                <button
                  className="deleteBtn"
                  onClick={() =>
                    deleteProject(
                      project.id
                    )
                  }
                >
                  <Trash2 size={16} />
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

export default ProjectsPage;
