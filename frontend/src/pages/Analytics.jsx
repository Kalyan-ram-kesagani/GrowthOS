import { useEffect, useState } from "react";

import {
  BarChart3,
  FolderKanban,
  Code2,
  Award,
  Target,
  BriefcaseBusiness,
} from "lucide-react";

import { api } from "../services/api";

function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");
        const data = await api.get("/dashboard/stats");
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Could not connect to the Analytics backend.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="page module">
        <h1>Growth Analytics</h1>
        <p>Loading your analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page module">
        <h1>Growth Analytics</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="page module">

      <span className="eyebrow">
        <BarChart3 size={15} />
        GROWTH ANALYTICS
      </span>

      <h1>Your Growth Overview</h1>

      <p>
        See your professional progress based on
        your real GrowthOS data.
      </p>

      <div className="moduleGrid">

        <div className="card moduleCard">
          <FolderKanban />
          <h3>{stats?.projects?.total ?? 0}</h3>
          <p>Total Projects</p>
        </div>

        <div className="card moduleCard">
          <Code2 />
          <h3>{stats?.coding?.solved ?? 0}</h3>
          <p>Problems Solved</p>
        </div>

        <div className="card moduleCard">
          <Award />
          <h3>{stats?.certifications?.total ?? 0}</h3>
          <p>Certifications</p>
        </div>

        <div className="card moduleCard">
          <Target />
          <h3>{stats?.goals?.total ?? 0}</h3>
          <p>Active Goals</p>
        </div>

        <div className="card moduleCard">
          <BriefcaseBusiness />
          <h3>{stats?.applications?.total ?? 0}</h3>
          <p>Applications</p>
        </div>

      </div>

      <div className="card coming">
        <h2>Growth Score</h2>

        <p>
          Your analytics will become more detailed
          as you add projects, coding progress,
          goals, certifications and applications.
        </p>
      </div>

    </div>
  );
}

export default Analytics;
