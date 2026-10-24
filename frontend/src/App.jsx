import { useEffect, useState } from "react";
import {
    Link,
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from "react-router-dom";
import {
    ArrowRight,
    ArrowUpRight,
    Activity,
    Bookmark,
    Bot,
    Check,
    ChevronDown,
    Code2,
    Compass,
    FileCode2,
    Filter,
    GitBranch,
    GitPullRequest,
    Github,
    LoaderCircle,
    Search,
    ShieldCheck,
    Sparkles,
    Terminal,
} from "lucide-react";
import { api } from "./api";
import { AppLayout } from "./components/Layout";
import AuthForm from "./components/AuthForm";
import Chatbot from "./components/Chatbot";
import "./components/Chatbot.css";

function Brand() { return <Link to="/" className="brand"><span className="brand-mark">▲</span>OpenFix <b>AI</b></Link> }
function Home() {
    return <div className="landing"><header className="landing-nav"><Brand /><nav><a href="#features">Features</a><a href="#workflow">How it works</a><a href="#stack">Technology</a></nav><div className="landing-actions"><Link to="/login" className="text-link">Sign in</Link><Link to="/signup" className="btn btn-primary btn-sm">Get started <ArrowRight size={14} /></Link></div></header>
        <section className="hero"><div className="hero-grid" /><div className="eyebrow"><i /> YOUR OPEN-SOURCE COPILOT</div><h1>Find. Understand.<br /><span>Fix.</span> Contribute to open source.</h1><p className="hero-copy">Discover real GitHub issues, understand complex bugs with AI, and turn your skills into meaningful contributions.</p><div className="hero-actions"><Link to="/signup" className="btn btn-primary">Start contributing <ArrowRight size={15} /></Link><Link to="/issues" className="btn btn-secondary">Explore issues <ArrowUpRight size={15} /></Link></div><div className="hero-proof"><span className="proof-bubble">R</span><span className="proof-bubble">D</span><span>Built for developers who build in public.</span><span className="proof-sep" /><span>◇ Open-source first</span></div><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /></section>
        <section className="feature-strip" id="features">{[{ I: Compass, t: "Find real issues", d: "Search GitHub with smart filters." }, { I: Bot, t: "Understand with AI", d: "Turn complex reports into clear steps." }, { I: Code2, t: "Locate relevant code", d: "Surface candidate files and context." }, { I: GitPullRequest, t: "Contribute with confidence", d: "Plan, test, and prepare your pull request." }].map((x, i) => <div className="feature-tile" key={x.t}><div className="tile-icon"><x.I size={18} /></div><span className="tile-number">0{i + 1}</span><h3>{x.t}</h3><p>{x.d}</p></div>)}</section>
        <section className="section" id="workflow"><div className="section-intro"><div className="eyebrow">A BETTER WAY TO CONTRIBUTE</div><h2>From issue to impact.</h2><p>One focused workflow for discovering a problem and making a thoughtful contribution.</p></div><div className="workflow-grid">{[["01", "Discover", "Find open issues that match your languages, interests, and experience."], ["02", "Understand", "Get a plain-language summary, important concepts, and open questions."], ["03", "Investigate", "Explore candidate files and follow an evidence-based fix plan."], ["04", "Contribute", "Test your changes and prepare a clear pull request."]].map(x => <div className="workflow-step" key={x[0]}><span>{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p><ArrowUpRight size={16} /></div>)}</div></section>
        <section className="cta-panel" id="stack"><div><div className="eyebrow">YOUR NEXT CONTRIBUTION STARTS HERE</div><h2>Make your next commit count.</h2><p>Find an issue worth solving and get a clearer path to your first step.</p></div><Link to="/issues" className="btn btn-primary">Explore GitHub issues <ArrowRight size={15} /></Link></section><footer className="landing-footer"><Brand /><span>Find. Understand. Fix. Contribute to open source.</span><span>© 2026 OpenFix AI</span></footer></div>
}
function Header({ eyebrow, title, desc, action }) { return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{desc}</p></div>{action}</div> }
function IssueCard({ issue, onAnalyze, saved, onSave }) { return <article className="issue-card"><div className="issue-icon"><Github size={19} /></div><div className="issue-main"><div className="issue-title-row"><h3>{issue.title}</h3><a href={issue.url} target="_blank" rel="noreferrer" aria-label="Open GitHub issue"><ArrowUpRight size={15} /></a></div><div className="issue-repo">{issue.repository} · #{issue.number}</div><p className="issue-desc">{issue.body ? issue.body.replace(/[#>*`]/g, " ").slice(0, 170) : "No description. Open the original issue for context."}{issue.body?.length > 170 ? "…" : ""}</p><div className="tag-row">{(issue.labels || []).slice(0, 4).map(x => <span className="tag" key={x}>{x}</span>)}</div><div className="issue-meta"><span>◌ {issue.comments || 0} comments</span><span>{issue.state || "open"}</span><span>{issue.updated_at ? new Date(issue.updated_at).toLocaleDateString() : "Recently updated"}</span></div></div><div className="issue-actions"><button className="btn btn-primary btn-sm" onClick={() => onAnalyze(issue)}>Analyze <Sparkles size={13} /></button><button className={`icon-btn ${saved ? "saved" : ""}`} onClick={() => onSave(issue)} title="Save issue"><Bookmark size={15} /></button></div></article> }
function Issues({ onAnalyze, saved, onSave }) {
    const [q, setQ] = useState("good first issue"), [language, setLanguage] = useState(""), [label, setLabel] = useState(""), [items, setItems] = useState([]), [busy, setBusy] = useState(false), [error, setError] = useState("");
    async function search(e) { e?.preventDefault(); setBusy(true); setError(""); try { const r = await api.issues({ q, language, label, per_page: 15 }); setItems(r.issues || []); if (!r.issues?.length) setError("No issues found. Try a different search or remove a filter."); } catch (e) { setError(e.message) } finally { setBusy(false) } }
    useEffect(() => { search() }, []);
    return <><Header eyebrow="DISCOVERY / GITHUB" title="Explore issues" desc="Find real open issues from public GitHub repositories." action={<a className="btn btn-secondary btn-sm" href="https://github.com/issues" target="_blank" rel="noreferrer"><Github size={14} /> GitHub issues</a>} /><form className="search-panel" onSubmit={search}><div className="search-input"><Search size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search issues or repositories…" /></div><div className="filter-row"><label>Language<select value={language} onChange={e => setLanguage(e.target.value)}><option value="">Any language</option>{["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust"].map(x => <option key={x}>{x}</option>)}</select></label><label>Label<select value={label} onChange={e => setLabel(e.target.value)}><option value="">Any label</option>{["good first issue", "bug", "documentation", "enhancement", "help wanted"].map(x => <option key={x}>{x}</option>)}</select></label><button className="btn btn-primary" disabled={busy}>{busy ? <LoaderCircle className="spin" size={14} /> : <Filter size={14} />} {busy ? "Searching" : "Search issues"}</button></div></form><div className="list-heading"><div><h2>Search results</h2><span>{items.length} issues shown · sourced from GitHub</span></div><span className="live-pill"><i /> LIVE DATA</span></div>{error && <div className="alert">{error} <button onClick={() => search()}>Retry</button></div>}<div className="issue-list">{items.map(i => <IssueCard key={i.id || i.url} issue={i} onAnalyze={onAnalyze} saved={saved.some(s => s.id === i.id)} onSave={onSave} />)}</div></>
}
function Dashboard({ user, saved, onAnalyze, onSave }) { const [items, setItems] = useState([]); useEffect(() => { api.issues({ q: "good first issue", per_page: 3 }).then(r => setItems(r.issues || [])).catch(() => { }) }, []); return <><Header eyebrow="OVERVIEW" title={`Welcome back${user?.name ? `, ${user.name.split(" ")[0]}` : ""}.`} desc="Let's find your next open-source contribution." action={<Link to="/issues" className="btn btn-primary btn-sm">Explore issues <ArrowRight size={14} /></Link>} /><div className="stats-grid">{[["Saved issues", saved.length, "In your workspace", Bookmark], ["In progress", "—", "Track your next steps", Activity], ["AI analyses", "Ready", "Analyze an open issue", Bot], ["Contributions", "—", "Track your progress", GitPullRequest]].map(([a, b, c, I]) => <div className="stat-card" key={a}><div className="stat-top">{a}<I size={16} /></div><strong>{b}</strong><small>{c}</small></div>)}</div><div className="content-grid"><section className="panel"><div className="panel-heading"><div><h2>Recommended for you</h2><p>Open issues to explore next</p></div><Link className="subtle-link" to="/issues">View all →</Link></div>{items.length ? items.map(i => <IssueCard key={i.id} issue={i} onAnalyze={onAnalyze} saved={saved.some(s => s.id === i.id)} onSave={onSave} />) : <p className="muted">Explore issues to load live GitHub results.</p>}</section><aside className="panel"><div className="panel-heading"><div><h2>Contribution path</h2><p>Four steps to get started</p></div><Sparkles size={16} /></div>{[["01", "Find an issue"], ["02", "Understand the context"], ["03", "Investigate and test"], ["04", "Prepare a PR"]].map(x => <div className="path-step" key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}<Link to="/planner" className="btn btn-secondary full">Open fix planner <ArrowRight size={14} /></Link></aside></div></> }
function Analysis({ issue, analysis, setAnalysis, onSave }) { const [busy, setBusy] = useState(false), [error, setError] = useState(""); async function run() { if (!issue) return; setBusy(true); setError(""); try { setAnalysis(await api.analyze({ title: issue.title, body: issue.body || "", labels: issue.labels || [], repository: issue.repository || "" })) } catch (e) { setError(e.message) } finally { setBusy(false) } } useEffect(() => { if (issue && !analysis) run() }, [issue?.id]); if (!issue) return <div className="panel empty-state"><Bot size={30} /><h2>No issue selected</h2><p>Choose an issue from Explore issues.</p><Link className="btn btn-primary" to="/issues">Explore issues</Link></div>; return <><Header eyebrow="AI WORKSPACE / ANALYSIS" title="Issue analysis" desc="Understand the report before changing code." action={<a className="btn btn-secondary btn-sm" href={issue.url} target="_blank" rel="noreferrer"><Github size={14} /> Open on GitHub</a>} /><div className="selected-issue"><div className="issue-icon"><Github size={19} /></div><div><h2>{issue.title}</h2><p>{issue.repository} · #{issue.number}</p><div className="tag-row">{(issue.labels || []).map(x => <span className="tag" key={x}>{x}</span>)}</div></div><button className="icon-btn" onClick={() => onSave(issue)}><Bookmark size={15} /></button></div>{error && <div className="alert error">{error}</div>}{busy ? <div className="panel muted"><LoaderCircle className="spin" /> Analyzing issue…</div> : analysis ? <div className="analysis-grid"><section className="panel"><div className="eyebrow">AI SUMMARY {analysis.mode === "demo" ? "· DEMO MODE" : ""}</div><h2>Simple explanation</h2><p className="analysis-summary">{analysis.summary}</p><div className="analysis-facts"><div><span>Category</span><b>{analysis.category}</b></div><div><span>Difficulty</span><b>{analysis.difficulty}</b></div></div><hr /><h3><Code2 size={15} /> Skills to review</h3><div className="tag-row">{(analysis.skills || []).map(x => <span className="tag" key={x}>{x}</span>)}</div><hr /><h3><ShieldCheck size={15} /> Uncertainties</h3><ul>{(analysis.uncertainties || []).map((x, i) => <li key={i}>{x}</li>)}</ul></section><aside className="panel"><h2>Investigation plan</h2><ol className="number-list">{(analysis.steps || []).map((x, i) => <li key={i}><span>{i + 1}</span><p>{x}</p></li>)}</ol><hr /><h3><Check size={15} /> Suggested tests</h3><ul>{(analysis.tests || []).map((x, i) => <li key={i}>{x}</li>)}</ul>{analysis.mode === "demo" && <div className="alert">Demo analysis: configure an AI provider in backend/.env for model-generated output.</div>}<button className="btn btn-secondary full" onClick={run}><Sparkles size={14} /> Regenerate analysis</button></aside></div> : <button className="btn btn-primary" onClick={run}>Analyze issue</button>}</> }
function Workspace({ saved, onRemove, onAnalyze }) { const [notes, setNotes] = useState(localStorage.getItem("openfix-notes") || ""); return <><Header eyebrow="YOUR WORKSPACE" title="Saved issues" desc="Organize issues, notes, and investigation work." /><section className="panel"><div className="panel-heading"><div><h2>Bookmarks</h2><p>{saved.length} saved issue(s), stored in this browser</p></div><Bookmark size={17} /></div>{saved.length ? saved.map(i => <div className="saved-row" key={i.id}><div className="issue-icon"><Github size={17} /></div><div className="saved-row-main"><b>{i.title}</b><span>{i.repository} · #{i.number}</span></div><button className="btn btn-secondary btn-sm" onClick={() => onAnalyze(i)}>Analyze</button><button className="icon-btn" onClick={() => onRemove(i)}>×</button></div>) : <div className="empty-state"><Bookmark size={25} /><h2>No saved issues yet</h2><p>Bookmark issues from the explorer to keep them here.</p><Link className="btn btn-primary" to="/issues">Explore issues</Link></div>}</section><section className="panel"><h2>Personal notes</h2><p className="muted">Notes are saved locally in this browser.</p><textarea className="notes" value={notes} onChange={e => { setNotes(e.target.value); localStorage.setItem("openfix-notes", e.target.value) }} placeholder="Record reproduction steps, questions, and what you learned…" /></section></> }
function Planner() { const steps = [["Understand the problem", "Read the issue, labels, comments, and expected behavior."], ["Reproduce the issue", "Follow setup instructions and reproduce the behavior locally."], ["Inspect relevant files", "Trace the component, service, or function connected to the issue."], ["Identify the cause", "Use logs, tests, and code evidence; verify hypotheses."], ["Make a focused change", "Keep the fix small and follow project conventions."], ["Run tests", "Run relevant tests and regression checks."], ["Prepare a pull request", "Summarize changes and only report tests you actually ran."]]; return <><Header eyebrow="CONTRIBUTION TOOLKIT" title="AI fix planner" desc="A practical checklist for a tested contribution." /><div className="panel planner-panel">{steps.map((x, i) => <details className="planner-step" key={x[0]} open={i === 0}><summary><span className="step-index">0{i + 1}</span><b>{x[0]}</b><ChevronDown size={16} /></summary><p>{x[1]}</p></details>)}</div><div className="notice"><ShieldCheck size={18} /><p><b>Keep the developer in control.</b><br />Verify diagnoses, run code safely, and approve changes yourself.</p></div></> }
function SimplePage({ type }) { const data = type === "contribute" ? ["Contributions", "Track your progress from discovery to pull request.", "GitHub contributions are not automatically verified in this starter."] : type === "recommendations" ? ["Recommendations", "Personalized issue matching.", "The starter currently uses GitHub search; saved skill profiles and ranking can be added next."] : ["Profile & settings", "Account identity and preferences.", "Provider accounts are not merged automatically just because emails match."]; return <><Header eyebrow="OPENFIX AI" title={data[0]} desc={data[1]} /><div className="panel empty-state"><Sparkles size={27} /><h2>{data[0]}</h2><p>{data[2]}</p><Link to="/issues" className="btn btn-primary">Browse issues</Link></div></> }
export default function App() {
    const [user, setUser] = useState(null);
    const [checked, setChecked] = useState(false);
    const [saved, setSaved] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("openfix-saved") || "[]");
        } catch {
            return [];
        }
    });
    const [issue, setIssue] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        api.me()
            .then((r) => setUser(r.user))
            .catch(() => { })
            .finally(() => setChecked(true));
    }, []);

    useEffect(() => {
        localStorage.setItem("openfix-saved", JSON.stringify(saved));
    }, [saved]);

    function save(i) {
        setSaved((current) =>
            current.some((item) => item.id === i.id) ? current : [i, ...current]
        );
    }

    function remove(i) {
        setSaved((current) => current.filter((item) => item.id !== i.id));
    }

    function analyze(i) {
        setIssue(i);
        setAnalysis(null);
        navigate("/analysis");
    }

    const page = (Component, props = {}) => (
        <AppLayout user={user} onUser={setUser}>
            <Component
                user={user}
                saved={saved}
                onAnalyze={analyze}
                onSave={save}
                onRemove={remove}
                {...props}
            />
        </AppLayout>
    );

    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<AuthForm mode="login" onUser={setUser} />} />
                <Route path="/signup" element={<AuthForm mode="signup" onUser={setUser} />} />
                <Route
                    path="/dashboard"
                    element={
                        checked ? (
                            user ? (
                                page(Dashboard)
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        ) : (
                            <div className="boot-screen">
                                <LoaderCircle className="spin" /> Loading…
                            </div>
                        )
                    }
                />
                <Route path="/issues" element={page(Issues, { saved, onSave: save })} />
                <Route
                    path="/analysis"
                    element={page(Analysis, { issue, analysis, setAnalysis, onSave: save })}
                />
                <Route
                    path="/workspace"
                    element={page(Workspace, { saved, onRemove: remove, onAnalyze: analyze })}
                />
                <Route path="/planner" element={page(Planner)} />
                <Route path="/contribute" element={page(SimplePage, { type: "contribute" })} />
                <Route
                    path="/recommendations"
                    element={page(SimplePage, { type: "recommendations" })}
                />
                <Route path="/profile" element={page(SimplePage, { type: "profile" })} />
                <Route path="/chat" element={<Chatbot />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {location.pathname !== "/chat" && (
                <Link
                    to="/chat"
                    className="openfix-chatbot-floating"
                    aria-label="Open AI chatbot"
                >
                    <Bot size={20} />
                    <span>AI Chatbot</span>
                </Link>
            )}
        </>
    );
}
