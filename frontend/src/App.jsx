import "./style.css";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";

import {
  UserRound,
  BrainCircuit,
  FolderKanban,
  Code2,
  Award,
  GraduationCap,
  BriefcaseBusiness,
  BookOpen,
  Target,
  BarChart3,
  Sparkles,
  Search,
  Menu,
  X,
  CalendarDays,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import ProjectsPage from "./pages/Projects";
import DataPage from "./pages/DataPage";
import Career from "./pages/Career";
import Analytics from "./pages/Analytics";
import AIAssistant from "./pages/AIAssistant";

import { nav } from "./config/navigation";
import { initialStats } from "./data/dashboard";

const modules = {
  Profile: {
    icon: UserRound,
    title: "Professional Profile",
    desc: "Your live professional identity and portfolio snapshot.",
    cards: [
      "Profile strength",
      "Skills: 14",
      "Projects: 5",
      "Portfolio ready",
    ],
  },

  "Skills & AI": {
    icon: BrainCircuit,
    title: "Skills & AI",
    desc: "Track technical skills, AI tools and learning paths.",
    cards: [
      "Python 78%",
      "Java 55%",
      "Cloud 35%",
      "AI/ML 42%",
    ],
  },

  Projects: {
    icon: FolderKanban,
    title: "Projects",
    desc: "Build a portfolio that proves what you can do.",
    cards: [
      "GrowthOS",
      "Discipline Journal",
      "Trading Strategy",
      "Attendance AI",
    ],
  },

  Coding: {
    icon: Code2,
    title: "Coding Progress",
    desc: "Track LeetCode and your problem-solving journey.",
    cards: [
      "Easy: 42",
      "Medium: 35",
      "Hard: 9",
      "Total: 86",
    ],
  },

  Certificates: {
    icon: Award,
    title: "Certifications",
    desc: "Keep your completed and ongoing learning credentials.",
    cards: [
      "Python",
      "Cloud Fundamentals",
      "Git & GitHub",
      "Add certificate",
    ],
  },

  Academics: {
    icon: GraduationCap,
    title: "Academics",
    desc: "Monitor CGPA, subjects, exams and academic goals.",
    cards: [
      "Current CGPA 7.3",
      "Semester 4",
      "Subjects 6",
      "Upcoming exams",
    ],
  },

  Career: {
    icon: BriefcaseBusiness,
    title: "Career Hub",
    desc: "Jobs, internships, applications, interviews and follow-ups.",
    cards: [
      "Applications 12",
      "Review 4",
      "Interviews 2",
      "Follow-ups 3",
    ],
  },

  Journal: {
    icon: BookOpen,
    title: "Professional Journal",
    desc: "Document what you learned, built, solved and plan next.",
    cards: [
      "Today's entry",
      "Learning log",
      "Weekly review",
      "Monthly reflection",
    ],
  },

  Goals: {
    icon: Target,
    title: "Goals & Missions",
    desc: "Turn ambitious goals into daily actions.",
    cards: [
      "Daily goals",
      "Weekly missions",
      "90-day plan",
      "Career roadmap",
    ],
  },

  Analytics: {
    icon: BarChart3,
    title: "Growth Analytics",
    desc: "See your progress through data.",
    cards: [
      "Skill growth",
      "Coding trend",
      "Project history",
      "Career readiness",
    ],
  },

  "AI Assistant": {
    icon: Sparkles,
    title: "Growth AI Assistant",
    desc: "Your AI coach for skills, projects and career decisions.",
    cards: [
      "Skill gap analysis",
      "Career readiness",
      "Project ideas",
      "Weekly insights",
    ],
  },
};

function ModulePage({ name, addItem }) {
  const module = modules[name];

  if (!module) {
    return (
      <div className="page module">
        <h1>Page not found</h1>
        <p>This GrowthOS module does not exist yet.</p>
      </div>
    );
  }

  const Icon = module.icon;

  return (
    <div className="page module">
      <span className="eyebrow">
        <Icon size={15} />
        GROWTHOS MODULE
      </span>

      <h1>{module.title}</h1>

      <p>{module.desc}</p>

      <div className="moduleGrid">
        {module.cards.map((item, index) => (
          <div className="card moduleCard" key={item}>
            <Icon />

            <h3>{item}</h3>

            <p>
              {index === 3
                ? "Click to manage this section"
                : "Track and improve this area inside GrowthOS."}
            </p>

            <button
              onClick={() =>
                addItem(name, item)
              }
            >
              {item.includes("Add") ? "Add new" : "Open"}
            </button>
          </div>
        ))}
      </div>

      <div className="card coming">
        <h2>GrowthOS Module</h2>
        <p>
          This module will be connected to the
          GrowthOS database.
        </p>
      </div>
    </div>
  );
}

function App() {
  const { signOut } = useAuth();

  const [page, setPage] = useState("Dashboard");  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState(initialStats);

  const addItem = (name, item) => {
    if (name === "Projects") {
      setStats((current) => ({
        ...current,
        projects: current.projects + 1,
      }));
    }

    if (name === "Certificates") {
      setStats((current) => ({
        ...current,
        certifications:
          current.certifications + 1,
      }));
    }

    alert(`${item} module is ready.`);
  };

  return (
    <div className="app">
      <aside className={open ? "open" : ""}>
  <div className="brand">
    <div className="logo">G</div>

    <b>
      Growth<span>OS</span>
    </b>

    <button
      className="close"
      onClick={() => setOpen(false)}
    >
      <X />
    </button>
  </div>

  <nav>
    {nav.map(([name, Icon]) => (
      <button
        key={name}
        className={page === name ? "active" : ""}
        onClick={() => {
          setPage(name);
          setOpen(false);
        }}
      >
        <Icon size={19} />
        <span>{name}</span>
      </button>
    ))}
  </nav>

  <div className="sidebarFoot">
    <div className="avatar">KR</div>

    <div>
      <b>Professional Mode</b>
      <small>Building every day</small>
    </div>
<button
  className="logoutBtn"
  onClick={async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }}
>
  Logout
</button>
 </div>
</aside>

      <main>
        <header>
          <button
            className="mobileMenu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>

          <div className="crumb">
            <span>GrowthOS</span>
            {" / "}
            <b>{page}</b>
          </div>

          <div className="headerRight">
            <button className="search">
              <Search size={18} />
              Search
            </button>

            <div className="date">
              <CalendarDays size={17} />
              Aug 22
            </div>
          </div>
        </header>

        {page === "Dashboard" ? (
          <Dashboard
            stats={stats}
            setPage={setPage}
          />
        ) : page === "Projects" ? (
          <ProjectsPage />
        ) : page === "Career" ? (
          <Career setPage={setPage} />
        ) : page === "Analytics" ? (
          <Analytics />
        ) : page === "AI Assistant" ? (
          <AIAssistant />
        ) : page === "Profile" ? (
          <DataPage
            type="profile"
            title="Profile / Professional Information"
            description="Manage your professional identity and portfolio information."
            icon={UserRound}
            fields={[
              {
                name: "full_name",
                placeholder: "Full name",
              },
              {
                name: "professional_title",
                placeholder: "Professional title",
              },
              {
                name: "email",
                type: "email",
                placeholder: "Email address",
              },
              {
                name: "phone",
                type: "tel",
                placeholder: "Phone number",
              },
              {
                name: "location",
                placeholder: "Location",
              },
              {
                name: "linkedin",
                type: "url",
                placeholder: "LinkedIn profile URL",
              },
              {
                name: "github",
                type: "url",
                placeholder: "GitHub profile URL",
              },
              {
                name: "bio",
                type: "textarea",
                placeholder:
                  "Write a short professional bio...",
              },
            ]}
          />
        ) : page === "Skills & AI" ? (
          <DataPage
            type="skills"
            title="Skills & AI"
            description="Track your technical skills and learning progress."
            icon={BrainCircuit}
            fields={[
              {
                name: "name",
                placeholder: "Skill name",
              },
              {
                name: "level",
                type: "select",
                default: "Beginner",
                options: [
                  "Beginner",
                  "Intermediate",
                  "Advanced",
                ],
              },
              {
                name: "progress",
                type: "number",
                placeholder:
                  "Progress percentage",
              },
            ]}
          />
        ) : page === "Certificates" ? (
          <DataPage
            type="certifications"
            title="Certifications"
            description="Track your completed certifications."
            icon={Award}
            fields={[
              {
                name: "name",
                placeholder:
                  "Certification name",
              },
              {
                name: "organization",
                placeholder:
                  "Organization",
              },
              {
                name: "status",
                type: "select",
                default: "Completed",
                options: [
                  "Completed",
                  "In Progress",
                  "Planned",
                ],
              },
            ]}
          />
        ) : page === "Goals" ? (
          <DataPage
            type="goals"
            title="Goals & Missions"
            description="Turn ambitious goals into real progress."
            icon={Target}
            fields={[
              {
                name: "title",
                placeholder: "Goal title",
              },
              {
                name: "description",
                placeholder:
                  "Goal description",
              },
              {
                name: "status",
                type: "select",
                default: "Active",
                options: [
                  "Active",
                  "Completed",
                  "Paused",
                ],
              },
            ]}
          />
        ) : page === "Coding" ? (
          <DataPage
            type="coding-progress"
            title="Coding Progress"
            description="Track your LeetCode and problem-solving journey."
            icon={Code2}
            fields={[
              {
                name: "title",
                placeholder: "Problem title",
              },
              {
                name: "platform",
                type: "select",
                default: "LeetCode",
                options: [
                  "LeetCode",
                  "HackerRank",
                  "CodeChef",
                  "GeeksforGeeks",
                  "Other",
                ],
              },
              {
                name: "difficulty",
                type: "select",
                default: "Easy",
                options: [
                  "Easy",
                  "Medium",
                  "Hard",
                ],
              },
              {
                name: "status",
                type: "select",
                default: "Solved",
                options: [
                  "Solved",
                  "Attempted",
                  "In Progress",
                ],
              },
              {
                name: "notes",
                type: "textarea",
                placeholder:
                  "Notes or approach used...",
              },
            ]}
          />
        ) : page === "Academics" ? (
          <DataPage
            type="academic-info"
            title="Academic Information"
            description="Track your education and academic progress."
            icon={GraduationCap}
            fields={[
              {
                name: "institution",
                placeholder:
                  "College / Institution",
              },
              {
                name: "degree",
                placeholder: "Degree",
              },
              {
                name: "branch",
                placeholder:
                  "Branch / Course",
              },
              {
                name: "semester",
                placeholder:
                  "Current semester",
              },
              {
                name: "cgpa",
                placeholder:
                  "Current CGPA",
              },
              {
                name: "status",
                type: "select",
                default: "Ongoing",
                options: [
                  "Ongoing",
                  "Completed",
                  "Paused",
                ],
              },
              {
                name: "notes",
                type: "textarea",
                placeholder:
                  "Academic notes...",
              },
            ]}
          />
        ) : page === "Applications" ? (
          <DataPage
            type="applications"
            title="Job & Internship Applications"
            description="Track your job and internship applications."
            icon={BriefcaseBusiness}
            fields={[
              {
                name: "company",
                placeholder:
                  "Company name",
              },
              {
                name: "role",
                placeholder:
                  "Role / Position",
              },
              {
                name: "application_type",
                type: "select",
                default: "Internship",
                options: [
                  "Internship",
                  "Full-time",
                  "Part-time",
                  "Contract",
                ],
              },
              {
                name: "status",
                type: "select",
                default: "Applied",
                options: [
                  "Applied",
                  "Screening",
                  "Interview",
                  "Selected",
                  "Rejected",
                  "Withdrawn",
                ],
              },
              {
                name: "application_date",
                type: "date",
              },
              {
                name: "notes",
                type: "textarea",
                placeholder: "Notes...",
              },
            ]}
          />
        ) : page === "Journal" ? (
          <DataPage
            type="journal"
            title="Professional Journal"
            description="Document what you learned, built, solved and plan next."
            icon={BookOpen}
            fields={[
              {
                name: "title",
                placeholder:
                  "Journal title",
              },
              {
                name: "content",
                type: "textarea",
                placeholder:
                  "Write your journal entry...",
              },
              {
                name: "category",
                type: "select",
                default: "General",
                options: [
                  "General",
                  "Learning",
                  "Project",
                  "Career",
                  "Reflection",
                ],
              },
            ]}
          />
        ) : (
          <ModulePage
            name={page}
            addItem={addItem}
          />
        )}
      </main>
    </div>
  );
}

export default App;