import { useEffect, useState } from "react";
import { BriefcaseBusiness } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://growth-os-backend-ebon.vercel.app";

function Career({ setPage }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/applications`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load applications"
          );
        }

        const data = await response.json();

        setApplications(data);
      } catch (err) {
        console.error(err);
        setError(
          "Could not connect to the Career backend."
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  const total = applications.length;

  const applied = applications.filter(
    (item) => item.status === "Applied"
  ).length;

  const screening = applications.filter(
    (item) => item.status === "Screening"
  ).length;

  const interviews = applications.filter(
    (item) => item.status === "Interview"
  ).length;

  return (
    <div className="page module">

      <span className="eyebrow">
        <BriefcaseBusiness size={15} />
        CAREER MANAGEMENT
      </span>

      <h1>Career Hub</h1>

      <p>
        Track your jobs, internships, interviews
        and career opportunities.
      </p>

      {loading && (
        <div className="card coming">
          <p>Loading career data...</p>
        </div>
      )}

      {error && (
        <div className="card coming">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="moduleGrid">

            <div className="card moduleCard">
              <BriefcaseBusiness />

              <h3>{total}</h3>

              <p>Total applications</p>
            </div>

            <div className="card moduleCard">
              <BriefcaseBusiness />

              <h3>{applied}</h3>

              <p>Applied</p>
            </div>

            <div className="card moduleCard">
              <BriefcaseBusiness />

              <h3>{screening}</h3>

              <p>Screening</p>
            </div>

            <div className="card moduleCard">
              <BriefcaseBusiness />

              <h3>{interviews}</h3>

              <p>Interviews</p>
            </div>

          </div>

          <div className="card coming">

            <h2>Manage Applications</h2>

            <p>
              Add and manage your job and internship
              applications.
            </p>

            <button
              onClick={() => setPage("Applications")}
            >
              Open Applications →
            </button>

          </div>
        </>
      )}

    </div>
  );
}

export default Career;