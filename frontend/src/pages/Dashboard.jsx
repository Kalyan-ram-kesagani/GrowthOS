import { useEffect, useState } from "react";

import {
  FolderKanban,
  Code2,
  Award,
  GraduationCap,
  BriefcaseBusiness,
  BookOpen,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Plus,
  Bot,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import Card from "../components/Card";
import Stat from "../components/Stat";

import {
  growthData,
  codingData,
} from "../data/dashboard";


function Dashboard({ stats, setPage }) {

  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {

    fetch("https://growth-os-backend-ebon.vercel.app/dashboard")
      .then((response) => response.json())
      .then((data) => {
        console.log("Dashboard data:", data);
        setDashboardData(data);
      })
      .catch((error) => {
        console.error("Dashboard API error:", error);
      });

  }, []);


  const backendStats = dashboardData || {
    projects: { total: stats?.projects || 0 },
    coding: { solved: stats?.leetcode || 0 },
    certifications: { total: stats?.certifications || 0 },
    applications: { total: 0 },
  };


  return (
    <div className="page">

      <section className="hero">

        <div className="orb orb1" />
        <div className="orb orb2" />

        <div>
          <span className="eyebrow">
            <Sparkles size={15} />
            YOUR PROFESSIONAL OPERATING SYSTEM
          </span>

          <h1>
            Build your <em>future</em>,
            <br />
            one day at a time.
          </h1>

          <p>
            Track everything that makes you professionally stronger —
            skills, projects, coding, academics and career.
          </p>

          <div className="actions">

            <button onClick={() => setPage("Goals")}>
              Today's mission
              <ArrowUpRight size={17} />
            </button>

            <button
              className="ghost"
              onClick={() => setPage("Journal")}
            >
              <BookOpen size={17} />
              Write journal
            </button>

          </div>
        </div>

        <div className="hero3d">
          <div className="cube">
            <span>skills</span>
            <span>projects</span>
            <span>Journal</span>
            <span>Goals</span>
            <span>Career</span>
            <span>coding</span>
          </div>
        </div>

      </section>


      <div className="stats">

        <Stat
          icon={FolderKanban}
          value={backendStats.projects?.total || 0}
          label="Projects built"
          sub="Portfolio growing"
        />

        <Stat
          icon={Code2}
          value={backendStats.coding?.solved || 0}
          label="Problems solved"
          sub="LeetCode progress"
        />

        <Stat
          icon={Award}
          value={backendStats.certifications?.total || 0}
          label="Certifications"
          sub="Verified learning"
        />

        <Stat
          icon={GraduationCap}
          value={stats?.cgpa || "0"}
          label="Current CGPA"
          sub="Academic score"
        />

      </div>


      <div className="grid2">

        <Card>

          <div className="cardHead">

            <div>
              <h3>Growth trajectory</h3>
              <p>Your professional progress</p>
            </div>

            <span className="pill">+76%</span>

          </div>

          <div className="chart">

            <ResponsiveContainer>

              <AreaChart data={growthData}>

                <defs>
                  <linearGradient
                    id="g"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--accent)"
                      stopOpacity=".5"
                    />

                    <stop
                      offset="100%"
                      stopColor="var(--accent)"
                      stopOpacity="0"
                    />

                  </linearGradient>

                </defs>

                <XAxis
                  dataKey="m"
                  stroke="#71809d"
                />

                <YAxis stroke="#71809d" />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--accent)"
                  fill="url(#g)"
                  strokeWidth={3}
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </Card>


        <Card className="focus">

          <div className="cardHead">

            <div>
              <h3>Today's focus</h3>
              <p>Small actions. Compounding growth.</p>
            </div>

            <button className="mini">
              <Plus size={16} />
            </button>

          </div>


          {[
            "Solve 2 LeetCode problems",
            "Continue GrowthOS development",
            "Study Cloud / DevOps",
          ].map((x, i) => (

            <div className="task" key={x}>

              <button>
                <CheckCircle2 size={20} />
              </button>

              <span>{x}</span>

              <small>
                {["HIGH", "BUILD", "LEARN"][i]}
              </small>

            </div>

          ))}

        </Card>

      </div>


      <div className="grid3">

        <Card>

          <div className="cardHead">
            <h3>Coding activity</h3>
            <Code2 size={18} />
          </div>

          <div className="miniChart">

            <ResponsiveContainer>

              <BarChart data={codingData}>

                <Bar
                  dataKey="v"
                  radius={6}
                />

                <XAxis
                  dataKey="m"
                  hide
                />

                <Tooltip />

              </BarChart>

            </ResponsiveContainer>

          </div>

          <b>{stats?.streak || 0} day streak 🔥</b>

        </Card>


        <Card>

          <div className="cardHead">
            <h3>Career pipeline</h3>
            <BriefcaseBusiness size={18} />
          </div>

          <div className="pipeline">

            <span>
              Applied <b>{backendStats.applications?.total || 0}</b>
            </span>

            <span>
              Review <b>0</b>
            </span>

            <span>
              Interview <b>0</b>
            </span>

          </div>

          <button
            className="textBtn"
            onClick={() => setPage("Applications")}
          >
            View applications →
          </button>

        </Card>


        <Card>

          <div className="cardHead">
            <h3>AI insight</h3>
            <Bot size={18} />
          </div>

          <p className="insight">
            Your coding activity is improving.
            Completing one strong AI or DevOps project
            could strengthen your internship profile.
          </p>

          <button
            className="textBtn"
            onClick={() => setPage("AI Assistant")}
          >
            Ask Growth AI →
          </button>

        </Card>

      </div>

    </div>
  );
}

export default Dashboard;