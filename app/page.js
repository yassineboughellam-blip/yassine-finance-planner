"use client";

import { useEffect, useMemo, useState } from "react";

const defaultTasks = [
  {
    id: 1,
    title: "Open second spending account",
    detail: "Keep NatWest for storage. Use a second account for weekly spending only.",
    category: "Banking",
    due: "2026-04-01",
    done: false,
    priority: "High",
  },
  {
    id: 2,
    title: "Build weekly transfer system",
    detail: "Move a fixed amount each week from your main account to your spending account.",
    category: "Budget",
    due: "2026-04-07",
    done: false,
    priority: "High",
  },
  {
    id: 3,
    title: "Register to vote at 18",
    detail: "This helps with identity matching and your credit file.",
    category: "Credit",
    due: "2026-04-26",
    done: false,
    priority: "High",
  },
  {
    id: 4,
    title: "Apply for first credit card",
    detail: "Start with NatWest. Set direct debit to full balance immediately.",
    category: "Credit",
    due: "2026-04-27",
    done: false,
    priority: "High",
  },
  {
    id: 5,
    title: "Keep first card clean for 6 months",
    detail: "Use around £50-£150 a month and repay in full every month.",
    category: "Credit",
    due: "2026-10-27",
    done: false,
    priority: "Medium",
  },
  {
    id: 6,
    title: "Review Amex eligibility",
    detail: "Only consider Amex after 6 clean months with no missed payments.",
    category: "Credit",
    due: "2026-10-28",
    done: false,
    priority: "Medium",
  },
];

const defaultInstructions = [
  {
    id: 1,
    title: "Two-account system",
    body: "Keep NatWest as the main storage account. Use a second account for weekly spending only. Do not spend daily from the main account.",
    tag: "Banking",
  },
  {
    id: 2,
    title: "First credit card rule",
    body: "At 18, apply for one beginner card first. Set direct debit to full balance immediately. Keep monthly use low and controlled.",
    tag: "Credit",
  },
  {
    id: 3,
    title: "Amex timing",
    body: "Review Amex only after 6 clean months with no missed payments and low utilisation on the first card.",
    tag: "Credit",
  },
];

const defaultMilestones = [
  {
    label: "18th birthday",
    date: "2026-04-26",
    note: "Credit card eligibility starts here.",
  },
  {
    label: "3-month review",
    date: "2026-07-27",
    note: "Check your first card usage and repayment record.",
  },
  {
    label: "Amex review point",
    date: "2026-10-28",
    note: "Check 6 months of clean history before applying.",
  },
];

function daysUntil(date) {
  const today = new Date();
  const target = new Date(date + "T00:00:00");
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function badgeClasses(priority) {
  if (priority === "High") return "bg-red-100 text-red-700 border-red-200";
  if (priority === "Medium") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function Page() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [tasks, setTasks] = useState(() => {
    if (typeof window === "undefined") return defaultTasks;
    const saved = localStorage.getItem("yassine_tasks");
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  const [instructions, setInstructions] = useState(() => {
    if (typeof window === "undefined") return defaultInstructions;
    const saved = localStorage.getItem("yassine_instructions");
    return saved ? JSON.parse(saved) : defaultInstructions;
  });

  const [weeklyBudget, setWeeklyBudget] = useState(() => {
    if (typeof window === "undefined") return "100";
    return localStorage.getItem("yassine_weekly_budget") || "100";
  });

  const [monthlyCreditUse, setMonthlyCreditUse] = useState(() => {
    if (typeof window === "undefined") return "100";
    return localStorage.getItem("yassine_monthly_credit_use") || "100";
  });

  const [newTask, setNewTask] = useState({
    title: "",
    detail: "",
    category: "General",
    due: "",
    priority: "Medium",
  });

  const [newInstruction, setNewInstruction] = useState({
    title: "",
    body: "",
    tag: "General",
  });

  const [importText, setImportText] = useState("");

  useEffect(() => {
    localStorage.setItem("yassine_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("yassine_instructions", JSON.stringify(instructions));
  }, [instructions]);

  useEffect(() => {
    localStorage.setItem("yassine_weekly_budget", weeklyBudget);
  }, [weeklyBudget]);

  useEffect(() => {
    localStorage.setItem("yassine_monthly_credit_use", monthlyCreditUse);
  }, [monthlyCreditUse]);

  const completed = tasks.filter((task) => task.done).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const weeklyBudgetNum = Number(weeklyBudget) || 0;
  const monthlyCreditPct = Math.min((Number(monthlyCreditUse) / 500) * 100, 100);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(a.due) - new Date(b.due));
  }, [tasks]);

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function addTask() {
    if (!newTask.title.trim() || !newTask.due) return;
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...newTask,
        done: false,
      },
    ]);
    setNewTask({
      title: "",
      detail: "",
      category: "General",
      due: "",
      priority: "Medium",
    });
  }

  function addInstruction() {
    if (!newInstruction.title.trim() || !newInstruction.body.trim()) return;
    setInstructions((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...newInstruction,
      },
    ]);
    setNewInstruction({
      title: "",
      body: "",
      tag: "General",
    });
  }

  function deleteInstruction(id) {
    setInstructions((prev) => prev.filter((item) => item.id !== id));
  }

  function exportData() {
    const payload = {
      tasks,
      instructions,
      weeklyBudget,
      monthlyCreditUse,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yassine-finance-planner-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData() {
    try {
      const parsed = JSON.parse(importText);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.instructions) setInstructions(parsed.instructions);
      if (parsed.weeklyBudget) setWeeklyBudget(String(parsed.weeklyBudget));
      if (parsed.monthlyCreditUse) setMonthlyCreditUse(String(parsed.monthlyCreditUse));
      setImportText("");
      alert("Backup imported.");
    } catch {
      alert("Invalid JSON.");
    }
  }

  const tabs = [
    ["dashboard", "Dashboard"],
    ["tasks", "Tasks"],
    ["instructions", "Instructions"],
    ["budget", "Budget"],
    ["credit", "Credit"],
    ["timeline", "Timeline"],
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Uni control app
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-5xl">
                Yassine Finance Planner
              </h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                Your banking, budgeting, credit, and university planning system in one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-slate-800 p-4">
                <p className="text-xs text-slate-400">Progress</p>
                <p className="mt-1 text-2xl font-semibold">{progress}%</p>
              </div>
              <div className="rounded-2xl bg-slate-800 p-4">
                <p className="text-xs text-slate-400">Weekly limit</p>
                <p className="mt-1 text-2xl font-semibold">£{weeklyBudgetNum}</p>
              </div>
              <div className="rounded-2xl bg-slate-800 p-4">
                <p className="text-xs text-slate-400">Credit use</p>
                <p className="mt-1 text-2xl font-semibold">£{monthlyCreditUse}</p>
              </div>
              <div className="rounded-2xl bg-slate-800 p-4">
                <p className="text-xs text-slate-400">Tasks done</p>
                <p className="mt-1 text-2xl font-semibold">
                  {completed}/{tasks.length}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === key
                    ? "bg-white text-slate-900"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "dashboard" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold">Immediate focus</h2>
              <div className="mt-4 space-y-3">
                {sortedTasks.slice(0, 4).map((task) => {
                  const left = daysUntil(task.due);
                  return (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{task.title}</p>
                        <span className="rounded-full border px-2 py-1 text-xs text-slate-300">
                          {task.category}
                        </span>
                        <span className={`rounded-full border px-2 py-1 text-xs ${badgeClasses(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{task.detail}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Due {task.due} - {left >= 0 ? `${left} day${left === 1 ? "" : "s"} left` : "overdue"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Core rules</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-200">
                  Main account receives loan and pays rent.
                </div>
                <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-200">
                  Spending account gets one weekly transfer only.
                </div>
                <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-200">
                  First credit card gets full balance direct debit on day one.
                </div>
                <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-200">
                  Review Amex only after 6 clean months.
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Task checklist</h2>
              <div className="mt-4 space-y-3">
                {sortedTasks.map((task) => {
                  const left = daysUntil(task.due);
                  return (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTask(task.id)}
                          className="mt-1 h-4 w-4"
                        />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className={task.done ? "line-through text-slate-500" : "font-semibold"}>
                              {task.title}
                            </p>
                            <span className="rounded-full border px-2 py-1 text-xs text-slate-300">
                              {task.category}
                            </span>
                            <span className={`rounded-full border px-2 py-1 text-xs ${badgeClasses(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-300">{task.detail}</p>
                          <p className="mt-2 text-xs text-slate-500">
                            Due {task.due} - {left >= 0 ? `${left} day${left === 1 ? "" : "s"} left` : "overdue"}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Add task</h2>
              <div className="mt-4 space-y-3">
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                  placeholder="Task detail"
                  value={newTask.detail}
                  onChange={(e) => setNewTask({ ...newTask, detail: e.target.value })}
                />
                <input
                  type="date"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                  value={newTask.due}
                  onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
                />
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                  placeholder="Category"
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                />
                <select
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <button
                  onClick={addTask}
                  className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-slate-900 hover:bg-slate-200"
                >
                  Save task
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === "instructions" && (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Instruction vault</h2>
              <p className="mt-2 text-sm text-slate-400">
                Save advice, rules, plans, housing notes, deadlines, travel prep, and anything else you want kept permanently.
              </p>
              <div className="mt-4 space-y-3">
                {instructions.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{item.title}</p>
                          <span className="rounded-full border px-2 py-1 text-xs text-slate-300">
                            {item.tag}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-300">{item.body}</p>
                      </div>
                      <button
                        onClick={() => deleteInstruction(item.id)}
                        className="rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="text-xl font-semibold">Add instruction</h2>
                <div className="mt-4 space-y-3">
                  <input
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    placeholder="Instruction title"
                    value={newInstruction.title}
                    onChange={(e) =>
                      setNewInstruction({ ...newInstruction, title: e.target.value })
                    }
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    placeholder="Tag"
                    value={newInstruction.tag}
                    onChange={(e) =>
                      setNewInstruction({ ...newInstruction, tag: e.target.value })
                    }
                  />
                  <textarea
                    className="min-h-[150px] w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    placeholder="Paste advice, rules, plans, or notes here"
                    value={newInstruction.body}
                    onChange={(e) =>
                      setNewInstruction({ ...newInstruction, body: e.target.value })
                    }
                  />
                  <button
                    onClick={addInstruction}
                    className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-slate-900 hover:bg-slate-200"
                  >
                    Save instruction
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="text-xl font-semibold">Backup and restore</h2>
                <div className="mt-4 space-y-3">
                  <button
                    onClick={exportData}
                    className="w-full rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-900 hover:bg-white"
                  >
                    Export backup JSON
                  </button>
                  <textarea
                    className="min-h-[150px] w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                    placeholder="Paste exported JSON here to restore app data"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                  />
                  <button
                    onClick={importData}
                    className="w-full rounded-2xl bg-slate-700 px-4 py-3 font-semibold text-white hover:bg-slate-600"
                  >
                    Import pasted JSON
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "budget" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Weekly budget control</h2>
              <div className="mt-4 space-y-4">
                <input
                  type="number"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                  value={weeklyBudget}
                  onChange={(e) => setWeeklyBudget(e.target.value)}
                />
                <div className="rounded-2xl bg-slate-800 p-4">
                  <p className="text-sm text-slate-400">Simple conversion</p>
                  <p className="mt-2 text-2xl font-semibold">£{weeklyBudgetNum} per week</p>
                  <p className="mt-2 text-sm text-slate-300">≈ £{weeklyBudgetNum * 4} over 4 weeks</p>
                  <p className="mt-1 text-sm text-slate-300">≈ £{weeklyBudgetNum * 12} over 12 weeks</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Budget rules</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-200">
                  Main account receives loan and covers rent.
                </div>
                <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-200">
                  Spending account gets one weekly transfer.
                </div>
                <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-200">
                  If the weekly money is gone, spending stops.
                </div>
                <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-200">
                  Do not top up midweek unless it is a real emergency.
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "credit" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Credit usage plan</h2>
              <div className="mt-4 space-y-4">
                <input
                  type="number"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                  value={monthlyCreditUse}
                  onChange={(e) => setMonthlyCreditUse(e.target.value)}
                />
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>Usage against £500 starter limit</span>
                    <span>{Math.round(monthlyCreditPct)}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: `${monthlyCreditPct}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-200">
                  Safe target: keep use below 30%. On a £500 limit, stay around £150 or less.
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Credit rules</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-200">
                  Apply for one card first. Start with NatWest.
                </div>
                <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-200">
                  Set direct debit to full balance on day one.
                </div>
                <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-200">
                  Use it only for controlled spending you already have cash for.
                </div>
                <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-200">
                  Wait 6 clean months before reviewing Amex.
                </div>
                <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-200">
                  No missed payments. No minimum payment behaviour.
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="grid gap-6 md:grid-cols-3">
            {defaultMilestones.map((item) => (
              <section
                key={item.label}
                className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
              >
                <p className="text-sm text-slate-400">{item.date}</p>
                <h2 className="mt-2 text-xl font-semibold">{item.label}</h2>
                <p className="mt-3 text-sm text-slate-300">{item.note}</p>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}