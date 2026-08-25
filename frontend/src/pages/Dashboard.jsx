import {
  FolderKanban,
  Code2,
  Award,
  GraduationCap,
  BriefcaseBusiness,
  BookOpen,
  Target,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  TrendingUp,
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
            <span>AI</span>
            <span>CODE</span>
            <span>GOALS</span>
          </div>
        </div>

      </section>

      <div className="stats">

        <Stat
          icon={FolderKanban}
          value={stats.projects}
          label="Projects built"
          sub="Portfolio growing"
        />

        <Stat
          icon={Code2}
          value={stats.leetcode}
          label="Problems solved"
          sub="LeetCode progress"
        />

        <Stat
          icon={Award}
          value={stats.certifications}
          label="Certifications"
          sub="Verified learning"
        />

        <Stat
          icon={GraduationCap}
          value={stats.cgpa}
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

          <b>{stats.streak} day streak 🔥</b>

        </Card>

        <Card>

          <div className="cardHead">
            <h3>Career pipeline</h3>
            <BriefcaseBusiness size={18} />
          </div>

          <div className="pipeline">

            <span>
              Applied <b>12</b>
            </span>

            <span>
              Review <b>4</b>
            </span>

            <span>
              Interview <b>2</b>
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