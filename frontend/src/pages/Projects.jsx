import { useEffect, useState } from "react";
import { FolderKanban, Plus } from "lucide-react";

import Card from "../components/Card";

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("In Progress");

  const loadProjects = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/projects"
      );

      if (!response.ok) {
        throw new Error("Failed to load projects");
      }

      const data = await response.json();

      setProjects(data);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const addProject = async () => {
    if (!title.trim()) {
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      setTitle("");
      setDescription("");
      setStatus("In Progress");

      await loadProjects();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const deleteProject = async (id) => {
    const confirmed = window.confirm(
      "Delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/projects/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      await loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="page module">
      <span className="eyebrow">
        <FolderKanban size={15} />
        GROWTHOS PROJECTS
      </span>

      <h1>Projects</h1>

      <p>
        Build a portfolio that proves what you can do.
      </p>

      <Card className="coming">
        <h2>Add New Project</h2>

        <input
          placeholder="Project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="Project description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>In Progress</option>
          <option>Completed</option>
          <option>Planned</option>
        </select>

        <br />
        <br />

        <button onClick={addProject}>
          <Plus size={16} />
          Add Project
        </button>
      </Card>

      <div className="moduleGrid">
        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>No projects yet. Add your first project!</p>
        ) : (
          projects.map((project) => (
            <Card
              key={project.id}
              className="moduleCard"
            >
              <FolderKanban />

              <h3>{project.title}</h3>

              <p>
                {project.description ||
                  "No description provided"}
              </p>

              <small>
                Status: {project.status}
              </small>

              <br />
              <br />

              <button
                onClick={() =>
                  deleteProject(project.id)
                }
              >
                Delete
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default ProjectsPage;