import { useState } from "react";

import {
  Sparkles,
  Brain,
  Target,
  Lightbulb,
  BarChart3,
} from "lucide-react";

import Card from "../components/Card";
import { api } from "../services/api";

function AIAssistant() {
  const [analysis, setAnalysis] = useState(null);
  const [careerReadiness, setCareerReadiness] =
    useState(null);

  const [weeklyInsights, setWeeklyInsights] =
    useState(null);

  const [projectIdeas, setProjectIdeas] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [careerLoading, setCareerLoading] =
    useState(false);

  const [weeklyLoading, setWeeklyLoading] =
    useState(false);

  const [projectLoading, setProjectLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // =========================
  // SKILL GAP ANALYSIS
  // =========================

  const runSkillGapAnalysis = async () => {
    try {
      setLoading(true);
      setError("");
      setAnalysis(null);

      const data = await api.get("/ai/skill-gap");
      setAnalysis(data);

    } catch (err) {
      console.error(err);
      setError("Could not connect to the Skill Gap Analysis backend.");

    } finally {
      setLoading(false);
    }
  };


  // =========================
  // CAREER READINESS
  // =========================

  const runCareerReadiness = async () => {
    try {
      setCareerLoading(true);
      setError("");
      setCareerReadiness(null);

      const data = await api.get("/ai/career-readiness");
      setCareerReadiness(data);

    } catch (err) {
      setError(err.message);

    } finally {
      setCareerLoading(false);
    }
  };


  // =========================
  // WEEKLY INSIGHTS
  // =========================

  const runWeeklyInsights = async () => {
    try {
      setWeeklyLoading(true);
      setError("");
      setWeeklyInsights(null);

      const data = await api.get("/api/weekly-insights");
      setWeeklyInsights(data);

    } catch (err) {
      setError(err.message);

    } finally {
      setWeeklyLoading(false);
    }
  };


  // =========================
  // PROJECT IDEAS
  // =========================

  const getProjectIdeas = async () => {
    try {
      setProjectLoading(true);
      setError("");
      setProjectIdeas(null);

      const data = await api.get("/ai/project-ideas");
      setProjectIdeas(data);

    } catch (err) {
      setError(err.message);

    } finally {
      setProjectLoading(false);
    }
  };


  return (
    <div className="page module">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="moduleHeader">

        <span className="eyebrow">
          <Sparkles size={15} />
          GROWTH AI
        </span>

        <h1>Your AI Growth Assistant</h1>

        <p>
          Analyze your GrowthOS data and get
          personalized recommendations.
        </p>

      </div>


      {/* =========================
          AI ACTION CARDS
      ========================= */}

      <div className="moduleGrid">

        {/* SKILL GAP */}

        <Card className="moduleCard">

          <Brain
            size={28}
            className="moduleIcon"
          />

          <h3>
            Skill Gap Analysis
          </h3>

          <p>
            Analyze your current skills and discover
            what you should improve next.
          </p>

          <button
            className="aiActionBtn"
            onClick={runSkillGapAnalysis}
            disabled={loading}
          >
            {loading
              ? "Analyzing..."
              : "Analyze Skills"}
          </button>

        </Card>


        {/* CAREER READINESS */}

        <Card className="moduleCard">

          <Target
            size={28}
            className="moduleIcon"
          />

          <h3>
            Career Readiness
          </h3>

          <p>
            Measure how prepared you are for your
            next career opportunity.
          </p>

          <button
            className="aiActionBtn"
            onClick={runCareerReadiness}
            disabled={careerLoading}
          >
            {careerLoading
              ? "Checking..."
              : "Check Readiness"}
          </button>

        </Card>


        {/* PROJECT IDEAS */}

        <Card className="moduleCard">

          <Lightbulb
            size={28}
            className="moduleIcon"
          />

          <h3>
            Project Ideas
          </h3>

          <p>
            Get personalized project ideas based on
            your current skills and growth journey.
          </p>

          <button
            className="aiActionBtn"
            onClick={getProjectIdeas}
            disabled={projectLoading}
          >
            {projectLoading
              ? "Generating..."
              : "Get Ideas"}
          </button>

        </Card>


        {/* WEEKLY INSIGHTS */}

        <Card className="moduleCard">

          <BarChart3
            size={28}
            className="moduleIcon"
          />

          <h3>
            Weekly Insights
          </h3>

          <p>
            Understand your progress and get
            recommendations for the next week.
          </p>

          <button
            className="aiActionBtn"
            onClick={runWeeklyInsights}
            disabled={weeklyLoading}
          >
            {weeklyLoading
              ? "Generating..."
              : "Generate Insights"}
          </button>

        </Card>

      </div>


      {/* =========================
          ERROR
      ========================= */}

      {error && (

        <Card className="coming">

          <h3>
            Something went wrong
          </h3>

          <p>
            {error}
          </p>

        </Card>

      )}


      {/* =========================
          PROJECT IDEAS RESULT
      ========================= */}

      {projectIdeas && (

        <Card className="coming">

          <h2>
            Project Ideas
          </h2>

          <p>
            {projectIdeas.message}
          </p>

          {projectIdeas.based_on_skills?.length > 0 && (

            <p>
              <b>
                Based on your skills:
              </b>{" "}
              {projectIdeas.based_on_skills.join(", ")}
            </p>

          )}

          {projectIdeas.projects?.length > 0 && (

            <div className="moduleGrid">

              {projectIdeas.projects.map(
                (project, index) => (

                  <Card
                    key={index}
                    className="moduleCard"
                  >

                    <Lightbulb
                      size={24}
                      className="moduleIcon"
                    />

                    <h3>
                      {project.title}
                    </h3>

                    <p>
                      {project.description}
                    </p>

                    <p>
                      <b>
                        Difficulty:
                      </b>{" "}
                      {project.difficulty}
                    </p>

                    {project.skills?.length > 0 && (

                      <p>
                        <b>
                          Skills Used:
                        </b>{" "}
                        {project.skills.join(", ")}
                      </p>

                    )}

                  </Card>

                )
              )}

            </div>

          )}

        </Card>

      )}


      {/* =========================
          SKILL GAP RESULT
      ========================= */}

      {analysis && (

        <Card className="coming">

          <h2>
            Skill Gap Analysis
          </h2>

          <p>
            {analysis.message}
          </p>

          {analysis.summary && (

            <div>

              <p>
                <b>Total Skills:</b>{" "}
                {analysis.summary.total_skills}
              </p>

              <p>
                <b>Beginner:</b>{" "}
                {analysis.summary.beginner}
              </p>

              <p>
                <b>Intermediate:</b>{" "}
                {analysis.summary.intermediate}
              </p>

              <p>
                <b>Advanced:</b>{" "}
                {analysis.summary.advanced}
              </p>

            </div>

          )}

          {analysis.skills?.length > 0 && (

            <div className="moduleGrid">

              {analysis.skills.map((skill) => (

                <Card
                  key={skill.name}
                  className="moduleCard"
                >

                  <Brain
                    size={24}
                    className="moduleIcon"
                  />

                  <h3>
                    {skill.name}
                  </h3>

                  <p>
                    <b>Level:</b>{" "}
                    {skill.level}
                  </p>

                  <p>
                    {skill.recommendation}
                  </p>

                </Card>

              ))}

            </div>

          )}

          <br />

          <p>
            <b>
              Overall Recommendation:
            </b>
          </p>

          <p>
            {analysis.overall_recommendation}
          </p>

        </Card>

      )}


      {/* =========================
          CAREER READINESS RESULT
      ========================= */}

      {careerReadiness && (

        <Card className="coming">

          <h2>
            Career Readiness Report
          </h2>

          <h1>
            {careerReadiness.score}%
          </h1>

          <p>
            <b>Level:</b>{" "}
            {careerReadiness.level}
          </p>

          <p>
            {careerReadiness.recommendation}
          </p>

          <br />

          <h3>
            Your Breakdown
          </h3>

          <p>
            <b>Skills:</b>{" "}
            {careerReadiness.breakdown?.skills?.total ?? 0}
          </p>

          <p>
            <b>Advanced Skills:</b>{" "}
            {careerReadiness.breakdown?.skills?.advanced ?? 0}
          </p>

          <p>
            <b>Projects:</b>{" "}
            {careerReadiness.breakdown?.projects?.total ?? 0}
          </p>

          <p>
            <b>Completed Projects:</b>{" "}
            {careerReadiness.breakdown?.projects?.completed ?? 0}
          </p>

          <p>
            <b>Solved Problems:</b>{" "}
            {careerReadiness.breakdown?.coding?.solved ?? 0}
          </p>

          <p>
            <b>Certifications:</b>{" "}
            {careerReadiness.breakdown?.certifications?.total ?? 0}
          </p>

          <p>
            <b>Completed Goals:</b>{" "}
            {careerReadiness.breakdown?.goals?.completed ?? 0}
          </p>

        </Card>

      )}


      {/* =========================
          WEEKLY INSIGHTS RESULT
      ========================= */}

      {weeklyInsights && (

        <Card className="coming">

          <h2>
            Weekly Insights
          </h2>

          <p>
            {weeklyInsights.message}
          </p>

          {weeklyInsights.breakdown && (

            <div>

              <p>
                <b>Skills:</b>{" "}
                {weeklyInsights.breakdown.skills?.total ?? 0}
              </p>

              <p>
                <b>Projects:</b>{" "}
                {weeklyInsights.breakdown.projects?.total ?? 0}
              </p>

              <p>
                <b>Completed Projects:</b>{" "}
                {weeklyInsights.breakdown.projects?.completed ?? 0}
              </p>

              <p>
                <b>Goals Completed:</b>{" "}
                {weeklyInsights.breakdown.goals?.completed ?? 0}
              </p>

              <p>
                <b>Coding Problems Solved:</b>{" "}
                {weeklyInsights.breakdown.coding?.solved ?? 0}
              </p>

            </div>

          )}

          {weeklyInsights.recommendation && (

            <>

              <br />

              <p>
                <b>
                  Recommendation:
                </b>
              </p>

              <p>
                {weeklyInsights.recommendation}
              </p>

            </>

          )}

        </Card>

      )}

    </div>
  );
}

export default AIAssistant;
