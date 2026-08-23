import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import {
 LayoutDashboard,
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
 Plus,
 Search,
 Menu,
 X,
 ArrowUpRight,
 CheckCircle2,
 TrendingUp,
 CalendarDays,
 Bot
} from "lucide-react";

import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 Tooltip,
 ResponsiveContainer,
 BarChart,
 Bar
} from "recharts";

import "./style.css";


const initial = {
 projects: 5,
 leetcode: 86,
 certifications: 7,
 cgpa: 7.3,
 applications: 12,
 skills: 14,
 streak: 6
};


const growth = [
 { m: "Mar", v: 18 },
 { m: "Apr", v: 28 },
 { m: "May", v: 36 },
 { m: "Jun", v: 49 },
 { m: "Jul", v: 62 },
 { m: "Aug", v: 76 }
];


const coding = [
 { m: "Mon", v: 2 },
 { m: "Tue", v: 5 },
 { m: "Wed", v: 3 },
 { m: "Thu", v: 7 },
 { m: "Fri", v: 4 },
 { m: "Sat", v: 6 },
 { m: "Sun", v: 2 }
];


const nav = [
 ["Dashboard", LayoutDashboard],
 ["Profile", UserRound],
 ["Skills & AI", BrainCircuit],
 ["Projects", FolderKanban],
 ["Coding", Code2],
 ["Certificates", Award],
 ["Academics", GraduationCap],
 ["Career", BriefcaseBusiness],
 ["Applications", BriefcaseBusiness],
 ["Journal", BookOpen],
 ["Goals", Target],
 ["Analytics", BarChart3],
 ["AI Assistant", Sparkles]
];


function Card({ children, className = "" }) {
 return (
  <div className={"card " + className}>
   {children}
  </div>
 );
}


function Stat({ icon: Icon, label, value, sub }) {
 return (
  <Card className="stat">

   <div className="statTop">

    <span className="iconBox">
     <Icon size={20} />
    </span>

    <span className="up">
     <TrendingUp size={14} />
     growing
    </span>

   </div>

   <b>{value}</b>

   <p>{label}</p>

   <small>{sub}</small>

  </Card>
 );
}


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

       <AreaChart data={growth}>

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
      "Study Cloud / DevOps"
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

       <BarChart data={coding}>

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
      Completing one strong AI or DevOps project could strengthen
      your internship profile.
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


const modules = {

 "Profile": {
  icon: UserRound,
  title: "Professional Profile",
  desc: "Your live professional identity and portfolio snapshot.",
  cards: [
   "Profile strength",
   "Skills: 14",
   "Projects: 5",
   "Portfolio ready"
  ]
 },

 "Skills & AI": {
  icon: BrainCircuit,
  title: "Skills & AI",
  desc: "Track technical skills, AI tools and learning paths.",
  cards: [
   "Python 78%",
   "Java 55%",
   "Cloud 35%",
   "AI/ML 42%"
  ]
 },

 "Projects": {
  icon: FolderKanban,
  title: "Projects",
  desc: "Build a portfolio that proves what you can do.",
  cards: [
   "GrowthOS",
   "Discipline Journal",
   "Trading Strategy",
   "Attendance AI"
  ]
 },

 "Coding": {
  icon: Code2,
  title: "Coding Progress",
  desc: "Track LeetCode and your problem-solving journey.",
  cards: [
   "Easy: 42",
   "Medium: 35",
   "Hard: 9",
   "Total: 86"
  ]
 },

 "Certificates": {
  icon: Award,
  title: "Certifications",
  desc: "Keep your completed and ongoing learning credentials.",
  cards: [
   "Python",
   "Cloud Fundamentals",
   "Git & GitHub",
   "Add certificate"
  ]
 },

 "Academics": {
  icon: GraduationCap,
  title: "Academics",
  desc: "Monitor CGPA, subjects, exams and academic goals.",
  cards: [
   "Current CGPA 7.3",
   "Semester 4",
   "Subjects 6",
   "Upcoming exams"
  ]
 },

 "Career": {
  icon: BriefcaseBusiness,
  title: "Career Hub",
  desc: "Jobs, internships, applications, interviews and follow-ups.",
  cards: [
   "Applications 12",
   "Review 4",
   "Interviews 2",
   "Follow-ups 3"
  ]
 },

 "Journal": {
  icon: BookOpen,
  title: "Professional Journal",
  desc: "Document what you learned, built, solved and plan next.",
  cards: [
   "Today's entry",
   "Learning log",
   "Weekly review",
   "Monthly reflection"
  ]
 },

 "Goals": {
  icon: Target,
  title: "Goals & Missions",
  desc: "Turn ambitious goals into daily actions.",
  cards: [
   "Daily goals",
   "Weekly missions",
   "90-day plan",
   "Career roadmap"
  ]
 },

 "Analytics": {
  icon: BarChart3,
  title: "Growth Analytics",
  desc: "See your progress through data.",
  cards: [
   "Skill growth",
   "Coding trend",
   "Project history",
   "Career readiness"
  ]
 },

 "AI Assistant": {
  icon: Sparkles,
  title: "Growth AI Assistant",
  desc: "Your AI coach for skills, projects and career decisions.",
  cards: [
   "Skill gap analysis",
   "Career readiness",
   "Project ideas",
   "Weekly insights"
  ]
 }

};


function ModulePage({ name, addItem }) {

 const m = modules[name];
 const Icon = m.icon;

 return (
  <div className="page module">

   <span className="eyebrow">
    <Icon size={15} />
    GROWTHOS MODULE
   </span>

   <h1>{m.title}</h1>

   <p>{m.desc}</p>

   <div className="moduleGrid">

    {m.cards.map((x, i) => (

     <Card
      key={x}
      className="moduleCard"
     >

      <Icon />

      <h3>{x}</h3>

      <p>
       {i === 3
        ? "Click to manage this section"
        : "Track and improve this area inside GrowthOS."}
      </p>

      <button onClick={() => addItem(name, x)}>

       {x.includes("Add")
        ? "Add new"
        : "Open"}

       <ArrowUpRight size={15} />

      </button>

     </Card>

    ))}

   </div>

   <Card className="coming">

    <h2>GrowthOS Module</h2>

    <p>
     This module will be connected to the GrowthOS database.
    </p>

   </Card>

  </div>
 );
}


/* =========================
   PROJECTS PAGE
========================= */

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

   console.error(
    "Error loading projects:",
    error
   );

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

   const response = await fetch(
    "http://127.0.0.1:8000/projects",
    {
     method: "POST",

     headers: {
      "Content-Type": "application/json"
     },

     body: JSON.stringify({
      title: title,
      description: description,
      status: status
     })

    }
   );


   if (!response.ok) {
    throw new Error("Failed to create project");
   }


   setTitle("");
   setDescription("");
   setStatus("In Progress");

   loadProjects();

  } catch (error) {

   console.error(
    "Error creating project:",
    error
   );

   alert("Could not save project");

  }

 };


 const deleteProject = async (id) => {

  const confirmed = window.confirm(
   "Delete this project?"
  );

  if (!confirmed) return;


  try {

   const response = await fetch(
    `http://127.0.0.1:8000/projects/${id}`,
    {
     method: "DELETE"
    }
   );


   if (!response.ok) {
    throw new Error("Failed to delete project");
   }


   loadProjects();

  } catch (error) {

   console.error(
    "Error deleting project:",
    error
   );

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
     onChange={(e) =>
      setTitle(e.target.value)
     }
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
     onChange={(e) =>
      setStatus(e.target.value)
     }
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

     <p>
      No projects yet. Add your first project!
     </p>

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


/* =========================
   GENERIC DATABASE PAGE
========================= */

function DataPage({
 type,
 title,
 description,
 icon: Icon,
 fields
}) {

 const [items, setItems] = useState([]);
 const [loading, setLoading] = useState(true);
 const [form, setForm] = useState({});


 const loadItems = async () => {

  try {

   setLoading(true);

   const response = await fetch(
    `http://127.0.0.1:8000/${type}`
   );


   if (!response.ok) {
    throw new Error(`Failed to load ${type}`);
   }


   const data = await response.json();

   setItems(data);

  } catch (error) {

   console.error(
    `Error loading ${type}:`,
    error
   );

  } finally {

   setLoading(false);

  }

 };


 useEffect(() => {

  loadItems();

 }, [type]);


 const handleChange = (field, value) => {

  setForm((previous) => ({
   ...previous,
   [field]: value
  }));

 };


 const addItem = async () => {

  const payload = {};


  fields.forEach((field) => {

   if (field.type === "number") {

    payload[field.name] =
     Number(form[field.name] || 0);

   } else {

    payload[field.name] =
     form[field.name] ||
     field.default ||
     "";

   }

  });


  try {

   const response = await fetch(
    `http://127.0.0.1:8000/${type}`,
    {
     method: "POST",

     headers: {
      "Content-Type": "application/json"
     },

     body: JSON.stringify(payload)

    }
   );


   if (!response.ok) {

    const errorData =
     await response.text();

    console.error(errorData);

    throw new Error(
     `Failed to save ${type}`
    );

   }


   setForm({});

   loadItems();

  } catch (error) {

   console.error(
    `Error saving ${type}:`,
    error
   );

   alert(`Could not save ${title}`);

  }

 };


 const deleteItem = async (id) => {

  const confirmed = window.confirm(
   "Delete this item?"
  );


  if (!confirmed) return;


  try {

   const response = await fetch(
    `http://127.0.0.1:8000/${type}/${id}`,
    {
     method: "DELETE"
    }
   );


   if (!response.ok) {
    throw new Error(
     `Failed to delete ${type}`
    );
   }


   loadItems();

  } catch (error) {

   console.error(
    `Error deleting ${type}:`,
    error
   );

   alert("Could not delete item");

  }

 };


 return (

  <div className="page module">

   <span className="eyebrow">
    <Icon size={15} />
    GROWTHOS MODULE
   </span>


   <h1>{title}</h1>


   <p>{description}</p>


   <Card className="coming">

    <h2>Add New</h2>


    {fields.map((field) => {

     if (field.type === "select") {

      return (

       <select
        key={field.name}

        value={
         form[field.name] ||
         field.default ||
         field.options?.[0] ||
         ""
        }

        onChange={(e) =>
         handleChange(
          field.name,
          e.target.value
         )
        }
       >

        {field.options.map(
         (option) => (

          <option
           key={option}
           value={option}
          >
           {option}
          </option>

         )
        )}

       </select>

      );

     }


     if (field.type === "textarea") {

      return (

       <textarea
        key={field.name}
        placeholder={field.placeholder}
        value={form[field.name] || ""}
        onChange={(e) =>
         handleChange(field.name, e.target.value)
        }
       />

      );

     }


     return (

      <input
       key={field.name}

       type={
        field.type || "text"
       }

       placeholder={
        field.placeholder
       }

       value={
        form[field.name] || ""
       }

       onChange={(e) =>
        handleChange(
         field.name,
         e.target.value
        )
       }
      />

     );

    })}


    <br />
    <br />


    <button onClick={addItem}>

     <Plus size={16} />

     Add

    </button>

   </Card>


   <div className="moduleGrid">

    {loading ? (

     <p>Loading...</p>

    ) : items.length === 0 ? (

     <p>
      No items yet. Add your first item!
     </p>

    ) : (

     items.map((item) => (

      <Card
       key={item.id}
       className="moduleCard"
      >

       <Icon />

       <h3>
        {item.name ||
         item.title ||
         "Untitled"}
       </h3>


       {item.description && (
        <p>
         {item.description}
        </p>
       )}


       {item.content && (
        <p>
         {item.content}
        </p>
       )}

       {item.category && (
        <p>
         Category: {item.category}
        </p>
       )}


       {item.organization && (
        <p>
         Organization: {item.organization}
        </p>
       )}


       {item.level && (
        <p>
         Level: {item.level}
        </p>
       )}


       {item.progress !== undefined && (
        <p>
         Progress: {item.progress}%
        </p>
       )}


       {item.status && (
        <small>
         Status: {item.status}
        </small>
       )}


       <br />
       <br />


       <button
        onClick={() =>
         deleteItem(item.id)
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


/* =========================
   MAIN APP
========================= */

function App() {

 const [page, setPage] =
  useState("Dashboard");

 const [open, setOpen] =
  useState(false);

 const [stats, setStats] =
  useState(initial);


 const addItem = (name, item) => {

  if (name === "Projects") {

   setStats((s) => ({
    ...s,
    projects: s.projects + 1
   }));

  }


  if (name === "Certificates") {

   setStats((s) => ({
    ...s,
    certifications:
     s.certifications + 1
   }));

  }


  alert(`${item} module is ready.`);

 };


 return (

  <div className="app">

   <aside
    className={open ? "open" : ""}
   >

    <div className="brand">

     <div className="logo">
      G
     </div>

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

     {nav.map(([n, I]) => (

      <button
       key={n}

       className={
        page === n ? "active" : ""
       }

       onClick={() => {
        setPage(n);
        setOpen(false);
       }}
      >

       <I size={19} />

       <span>{n}</span>

      </button>

     ))}

    </nav>


    <div className="sidebarFoot">

     <div className="avatar">
      KR
     </div>

     <div>

      <b>
       Professional Mode
      </b>

      <small>
       Building every day
      </small>

     </div>

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

    ) : page === "Profile" ? (

     <DataPage
      type="profile"
      title="Profile / Professional Information"
      description="Manage your professional identity and portfolio information."
      icon={UserRound}

      fields={[
       {
        name: "full_name",
        placeholder: "Full name"
       },
       {
        name: "professional_title",
        placeholder: "Professional title"
       },
       {
        name: "email",
        type: "email",
        placeholder: "Email address"
       },
       {
        name: "phone",
        type: "tel",
        placeholder: "Phone number"
       },
       {
        name: "location",
        placeholder: "Location"
       },
       {
        name: "linkedin",
        type: "url",
        placeholder: "LinkedIn profile URL"
       },
       {
        name: "github",
        type: "url",
        placeholder: "GitHub profile URL"
       },
       {
        name: "bio",
        type: "textarea",
        placeholder: "Write a short professional bio..."
       }
      ]}
     />

    ) : page === "Projects" ? (

     <ProjectsPage />

    ) : page === "Skills & AI" ? (

     <DataPage
      type="skills"
      title="Skills & AI"
      description="Track your technical skills and learning progress."
      icon={BrainCircuit}

      fields={[
       {
        name: "name",
        placeholder: "Skill name"
       },
       {
        name: "level",
        type: "select",
        default: "Beginner",
        options: [
         "Beginner",
         "Intermediate",
         "Advanced"
        ]
       },
       {
        name: "progress",
        type: "number",
        placeholder: "Progress percentage"
       }
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
        placeholder: "Certification name"
       },
       {
        name: "organization",
        placeholder: "Organization"
       },
       {
        name: "status",
        type: "select",
        default: "Completed",
        options: [
         "Completed",
         "In Progress",
         "Planned"
        ]
       }
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
        placeholder: "Goal title"
       },
       {
        name: "description",
        placeholder: "Goal description"
       },
       {
        name: "status",
        type: "select",
        default: "Active",
        options: [
         "Active",
         "Completed",
         "Paused"
        ]
       }
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
        placeholder: "Problem title"
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
         "Other"
        ]
       },
       {
        name: "difficulty",
        type: "select",
        default: "Easy",
        options: [
         "Easy",
         "Medium",
         "Hard"
        ]
       },
       {
        name: "status",
        type: "select",
        default: "Solved",
        options: [
         "Solved",
         "Attempted",
         "In Progress"
        ]
       },
       {
        name: "notes",
        type: "textarea",
        placeholder: "Notes or approach used..."
       }
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
        placeholder: "College / Institution"
       },
       {
        name: "degree",
        placeholder: "Degree"
       },
       {
        name: "branch",
        placeholder: "Branch / Course"
       },
       {
        name: "semester",
        placeholder: "Current semester"
       },
       {
        name: "cgpa",
        placeholder: "Current CGPA"
       },
       {
        name: "status",
        type: "select",
        default: "Ongoing",
        options: [
         "Ongoing",
         "Completed",
         "Paused"
        ]
       },
       {
        name: "notes",
        type: "textarea",
        placeholder: "Academic notes..."
       }
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
        placeholder: "Company name"
       },
       {
        name: "role",
        placeholder: "Role / Position"
       },
       {
        name: "application_type",
        type: "select",
        default: "Internship",
        options: [
         "Internship",
         "Full-time",
         "Part-time",
         "Contract"
        ]
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
         "Withdrawn"
        ]
       },
       {
        name: "application_date",
        type: "date"
       },
       {
        name: "notes",
        type: "textarea",
        placeholder: "Notes..."
       }
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
        placeholder: "Journal title"
       },
       {
        name: "content",
        type: "textarea",
        placeholder: "Write your journal entry..."
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
         "Reflection"
        ]
       }
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


createRoot(
 document.getElementById("root")
).render(<App />);