import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  Check,
  ChevronRight,
  CircleHelp,
  FlaskConical,
  Leaf,
  Radio,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Wind,
  X,
  Zap,
} from "lucide-react";
import {
  TASKS,
  EVENTS,
  commitTurn,
  defaultPlan,
  earthHint,
  initialMission,
  previewTurn,
  taskError,
  type Plan,
  type Resources,
} from "./domain/mission";
import { loadMission, saveMission } from "./infrastructure/storage";
import { BUILDINGS, type BuildingName } from "./content/buildings";
import { evidence } from "./data/evidence";
const Outpost = lazy(() => import("./scenes/Outpost"));
const RadiationChart = lazy(() => import("./components/RadiationChart"));
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    ref.current?.showModal();
    return () => before?.focus();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-header">
        <h2 id={titleId}>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Meter({
  title,
  value,
  max,
  unit,
  icon,
  color,
  projected,
}: {
  title: string;
  value: number;
  max: number;
  unit: string;
  icon: ReactNode;
  color: string;
  projected: number;
}) {
  return (
    <section className="meter">
      <div className="meter-label">
        <span>
          {icon}
          {title}
        </span>
        <span className="meter-dot" style={{ background: color }} />
      </div>
      <div className="meter-number">
        {value}
        <span>
          {" "}
          / {max} {unit}
        </span>
      </div>
      <div className="meter-track">
        <span
          style={{
            width: `${Math.max(0, Math.min(100, (value / max) * 100))}%`,
            background: color,
          }}
        />
      </div>
      <p>
        After this plan{" "}
        <strong>
          {Number(projected.toFixed(2))} {unit}
        </strong>
      </p>
    </section>
  );
}
const eventCopy = {
  ordinary: {
    label: "Clear conditions",
    title: "A good day to think ahead.",
    text: "Solar panels are working well. Make room for food, oxygen, and discovery.",
  },
  storm: {
    label: "Solar warning",
    title: "Protect your crew from radiation.",
    text: "Shelter lowers exposure, but your crew cannot research or explore at the same time.",
  },
  dust: {
    label: "Dusty conditions",
    title: "Less sunlight. A tighter power budget.",
    text: "Your panels generate only 6 energy this turn. Check your reserves before setting out.",
  },
};
export default function App() {
  const [loaded] = useState(loadMission);
  const [mission, setMission] = useState(loaded.mission);
  const [storageMessage, setStorageMessage] = useState(loaded.message);
  const [plan, setPlan] = useState<Plan>(defaultPlan);
  const [selected, setSelected] = useState<BuildingName>("Living habitat");
  const [lightweight, setLightweight] = useState(false);
  const [dialog, setDialog] = useState<"briefing" | "sources" | "reset" | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const [reflection, setReflection] = useState<string[]>([]);
  const finished = mission.status !== "playing";
  const view = previewTurn(mission, plan);
  const currentEvent = EVENTS[Math.min(mission.turn - 1, 5)];
  const copy = eventCopy[currentEvent];
  const building = BUILDINGS.find((b) => b.name === selected)!;
  const after: Resources = finished ? mission : view.after;
  useEffect(() => {
    const message = saveMission(mission);
    if (message) setStorageMessage(message);
  }, [mission]);
  function commit() {
    const next = commitTurn(mission, plan, mission.turn);
    if (next === mission) return;
    setMission(next);
    setNotice(view.explanation);
    setPlan({
      oxygenOn: false,
      greenhouseOn: next.growthProgress === 1,
      task: "rest",
    });
  }
  function reset() {
    setMission(initialMission());
    setPlan(defaultPlan());
    setNotice("");
    setReflection([]);
    setDialog(null);
  }
  const flat = (
    <div className="scene-fallback">
      <p>Mission map</p>
      {BUILDINGS.map((b) => (
        <button key={b.name} onClick={() => setSelected(b.name)}>
          {b.name}
        </button>
      ))}
    </div>
  );
  return (
    <>
      <a className="skip-link" href="#mission-controls">
        Skip to mission controls
      </a>
      <div className="app-shell">
        <aside className="sidebar">
          <a
            className="brand"
            href="#"
            aria-label="Mars Mission Commander home"
          >
            <span className="brand-mark">
              m<span>•</span>
            </span>
            <span>
              MARS<span>MISSION COMMANDER</span>
            </span>
          </a>
          <div className="sidebar-section">YOUR EXPEDITION</div>
          <nav aria-label="Mission navigation">
            <button
              className="nav-item active"
              onClick={() =>
                document.getElementById("mission-controls")?.focus()
              }
            >
              <span>◈</span> Mission control <ChevronRight size={14} />
            </button>
            <button className="nav-item" onClick={() => setDialog("briefing")}>
              <CircleHelp size={18} /> Mission briefing
            </button>
            <button className="nav-item" onClick={() => setDialog("sources")}>
              <FlaskConical size={18} /> Science library{" "}
              <span className="small-badge">{evidence.length}</span>
            </button>
          </nav>
          <div className="mission-card">
            <span className="eyebrow">TRAINING MISSION 01</span>
            <div className="planet-mini" />
            <h3>
              A new home.
              <br />A big responsibility.
            </h3>
            <p>Keep your crew safe. Make every resource count.</p>
            <span className="mission-tag">
              <span /> Mars surface · Fictional outpost
            </span>
          </div>
          <div className="sidebar-bottom">
            <span className="crew-avatar">C</span>
            <div>
              <strong>You’re the commander</strong>
              <span>No account needed</span>
            </div>
            <ShieldCheck size={17} />
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <span>
              YOUR MISSION <ChevronRight size={12} />{" "}
              <strong>Mission control</strong>
            </span>
            <div>
              <span className="local-label">
                <span />{" "}
                {storageMessage
                  ? "Memory-only progress"
                  : "Saved on this device"}
              </span>
              <button
                className="icon-button"
                aria-label="Restart mission"
                onClick={() => setDialog("reset")}
              >
                <RotateCcw size={17} />
              </button>
            </div>
          </header>
          <main>
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  <span className="orange-dot" /> MARS EXPLORATION PROGRAM
                </div>
                <h1>Your outpost. Your decisions.</h1>
                <p>
                  Small choices. Big discoveries. Let’s keep this mission going.
                </p>
              </div>
              <span className="turn-badge">
                <span>MISSION TURN</span>
                <strong>
                  {Math.min(mission.turn, 6).toString().padStart(2, "0")}
                  <small> / 06</small>
                </strong>
              </span>
            </div>
            {storageMessage && (
              <p className="warning" role="status">
                {storageMessage}
              </p>
            )}
            <div className="meter-grid">
              <Meter
                title="Stored energy"
                value={mission.energy}
                max={20}
                unit="units"
                icon={<Zap size={17} />}
                color="#cc7c39"
                projected={after.energy}
              />
              <Meter
                title="Oxygen reserve"
                value={mission.oxygen}
                max={60}
                unit="units"
                icon={<Wind size={18} />}
                color="#537e85"
                projected={after.oxygen}
              />
              <Meter
                title="Radiation exposure"
                value={mission.exposure}
                max={12}
                unit="points"
                icon={<ShieldCheck size={18} />}
                color="#697c47"
                projected={after.exposure}
              />
            </div>
            <div className="main-grid">
              <section className="outpost-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">YOUR BASE</span>
                    <h2>Welcome to Ares Outpost</h2>
                  </div>
                  <span
                    className={`weather-pill ${currentEvent === "storm" ? "solar" : ""}`}
                  >
                    <Sun size={14} />
                    {copy.label}
                  </span>
                </div>
                <div className="scene">
                  <Suspense
                    fallback={
                      <div className="scene-loading">
                        Preparing your outpost…
                      </div>
                    }
                  >
                    <SceneBoundary fallback={flat}>
                      <Outpost
                        selected={selected}
                        onSelect={setSelected}
                        lightweight={lightweight}
                        onFail={() => setLightweight(true)}
                      />
                    </SceneBoundary>
                  </Suspense>
                  <div className="scene-label">
                    <span /> ARES OUTPOST <small>ILLUSTRATED MARS BASE</small>
                  </div>
                  <button
                    className="scene-view"
                    onClick={() => setLightweight(!lightweight)}
                  >
                    {lightweight ? "3D view" : "Lightweight view"}
                  </button>
                </div>
                <div className="building-tabs" aria-label="Inspect a building">
                  {BUILDINGS.map((b) => (
                    <button
                      key={b.name}
                      className={selected === b.name ? "selected" : ""}
                      aria-pressed={selected === b.name}
                      onClick={() => setSelected(b.name)}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
                <div className="building-info">
                  <div className="building-icon">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3>{building.name}</h3>
                    <p>{building.description}</p>
                  </div>
                </div>
              </section>
              <aside className="right-column">
                <section className="nova-card">
                  <div className="nova-heading">
                    <span className="nova-avatar">
                      <Sparkles size={22} />
                    </span>
                    <div>
                      <strong>NOVA</strong>
                      <span>Your mission assistant</span>
                    </div>
                    <span className="live-dot" />
                  </div>
                  <h2>
                    {finished
                      ? "Every mission teaches us something."
                      : copy.title}
                  </h2>
                  <p>
                    {finished
                      ? "Review your decisions below, then try another strategy."
                      : copy.text}
                  </p>
                  <button onClick={() => setDialog("briefing")}>
                    Read your mission brief <ArrowUpRight size={16} />
                  </button>
                </section>
                <section className="objectives">
                  <div className="section-title">
                    <h2>Mission objectives</h2>
                    <span>01—06</span>
                  </div>
                  <div className="objective">
                    <span className="objective-icon">
                      <ShieldCheck size={17} />
                    </span>
                    <div>
                      <strong>Protect your crew</strong>
                      <p>Keep reserves above zero</p>
                    </div>
                  </div>
                  <div className="objective">
                    <span className="objective-icon">
                      <FlaskConical size={17} />
                    </span>
                    <div>
                      <strong>Complete research</strong>
                      <p>{mission.research} of 3 objectives</p>
                    </div>
                    <span className="objective-count">
                      {Math.min(3, mission.research)}/3
                    </span>
                  </div>
                  <div className="objective">
                    <span className="objective-icon">
                      <Radio size={17} />
                    </span>
                    <div>
                      <strong>Bring back a sample</strong>
                      <p>Rover unlocks on turn 3</p>
                    </div>
                    {mission.samples > 0 && <Check size={17} />}
                  </div>
                  <div className="research-track">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={i < mission.research ? "done" : ""}
                      />
                    ))}
                  </div>
                </section>
                <div className="science-teaser">
                  <FlaskConical size={19} />
                  <div>
                    <strong>Real science. Your mission.</strong>
                    <p>Discover the NASA observations behind the game.</p>
                    <button onClick={() => setDialog("sources")}>
                      Explore the science <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </aside>
            </div>
            <div role="status" aria-live="polite">
              {notice && (
                <div className="consequence">
                  <Sparkles size={18} />
                  <p>{notice}</p>
                </div>
              )}
            </div>
            {mission.revealedHintIds.includes(`turn-${mission.turn}`) && (
              <div className="earth-reply">
                <Radio size={20} />
                <p>{earthHint(mission.turn)}</p>
              </div>
            )}
            {finished ? (
              <section className="debrief" aria-labelledby="debrief-title">
                <span className="eyebrow">MISSION DEBRIEF</span>
                <h2 id="debrief-title">
                  {mission.status === "success"
                    ? "Mission accomplished, Commander."
                    : mission.status === "safeReturn"
                      ? "Your crew is safe. There’s more to discover."
                      : "Mission paused. Let’s learn and try again."}
                </h2>
                <p>
                  {mission.status === "rescue"
                    ? "A reserve reached zero or exposure passed the game limit. This is a chance to plan differently, not a punishment."
                    : `You completed ${mission.research} research objectives and collected ${mission.samples} field samples. What would you change?`}
                </p>
                <ol className="timeline">
                  {mission.history.map((h) => (
                    <li key={h.turn}>
                      <strong>
                        Turn {h.turn} ·{" "}
                        {TASKS.find((t) => t.id === h.plan.task)?.title}
                      </strong>
                      <p>{h.explanation}</p>
                    </li>
                  ))}
                </ol>
                <div className="reflection">
                  <h3>Think like a mission planner</h3>
                  {[
                    "Why might turning off oxygen production help now but become risky later?",
                    "Which number came from NASA: the X3.9 flare classification, or your 12-point exposure limit?",
                  ].map((q) => (
                    <details
                      key={q}
                      open={reflection.includes(q)}
                      onToggle={(e) => {
                        const open = e.currentTarget.open;
                        setReflection((r) =>
                          open
                            ? [...new Set([...r, q])]
                            : r.filter((x) => x !== q),
                        );
                      }}
                    >
                      <summary>{q}</summary>
                      <p>
                        {q.startsWith("Why")
                          ? "You save electricity while using stored oxygen. If you keep the system off, your reserve can run out."
                          : "X3.9 is the archived NASA event classification. The 12-point limit is a fictional game rule, not an astronaut health limit."}
                      </p>
                    </details>
                  ))}
                </div>
                <button className="primary" onClick={reset}>
                  Try a different strategy <RotateCcw size={16} />
                </button>
              </section>
            ) : (
              <section className="controls" id="mission-controls" tabIndex={-1}>
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">PLAN BEFORE YOU COMMIT</span>
                    <h2>What’s the plan, Commander?</h2>
                  </div>
                  <span className="budget">
                    <BatteryCharging size={17} />
                    {view.available} energy available{" "}
                    <small>including +{view.generation} solar</small>
                  </span>
                </div>
                {mission.turn === 1 && (
                  <p className="tutorial">
                    <CircleHelp size={18} />
                    <span>
                      First turn: try switching a system off and watch the
                      preview change. Grow food early: a harvest needs two
                      powered turns.
                    </span>
                  </p>
                )}
                <div className="system-grid">
                  <label className="system-toggle">
                    <span className="system-icon">
                      <Wind size={21} />
                    </span>
                    <span>
                      <strong>Oxygen production</strong>
                      <small>−4 energy · +12 oxygen</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={plan.oxygenOn}
                      onChange={(e) =>
                        setPlan({ ...plan, oxygenOn: e.target.checked })
                      }
                    />
                  </label>
                  <label className="system-toggle">
                    <span className="system-icon green">
                      <Leaf size={21} />
                    </span>
                    <span>
                      <strong>Greenhouse lights</strong>
                      <small>−3 energy · −1 water</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={plan.greenhouseOn}
                      onChange={(e) =>
                        setPlan({ ...plan, greenhouseOn: e.target.checked })
                      }
                    />
                  </label>
                </div>
                <div className="reserve-strip">
                  <span>
                    Water{" "}
                    <strong>
                      {mission.water} → {after.water}
                    </strong>
                  </span>
                  <span>
                    Food{" "}
                    <strong>
                      {mission.food} → {after.food} packs
                    </strong>
                  </span>
                  <span>
                    Crop progress{" "}
                    <strong>
                      {mission.growthProgress}/2
                      {view.harvest ? " · harvest this turn" : ""}
                    </strong>
                  </span>
                  <span>
                    Shielding <strong>Level {mission.shieldLevel}/2</strong>
                  </span>
                </div>
                <fieldset>
                  <legend>Choose one crew task</legend>
                  <div className="task-grid">
                    {TASKS.map((t) => {
                      const error = taskError(mission, t.id);
                      return (
                        <label
                          key={t.id}
                          className={`task-card ${plan.task === t.id ? "chosen" : ""} ${error ? "unavailable" : ""}`}
                        >
                          <input
                            type="radio"
                            name="task"
                            value={t.id}
                            checked={plan.task === t.id}
                            disabled={Boolean(error)}
                            onChange={() => setPlan({ ...plan, task: t.id })}
                          />
                          <span>
                            <strong>
                              {t.title}
                              <small>
                                {t.cost} <Zap size={11} />
                              </small>
                            </strong>
                            <span>{error ?? t.detail}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <div className="commit-row">
                  <div>
                    <strong>
                      Plan cost: {view.cost} of {view.available} energy
                    </strong>
                    <p>
                      Includes 4 energy for essential life support.
                      {view.spilledEnergy > 0
                        ? ` Battery full: ${view.spilledEnergy} solar energy cannot be stored.`
                        : ""}
                      {view.oxygenOverflow > 0
                        ? ` Oxygen tank full: ${view.oxygenOverflow} production units overflow.`
                        : ""}
                    </p>
                  </div>
                  <button
                    className="primary"
                    onClick={commit}
                    disabled={view.errors.length > 0}
                  >
                    End turn {mission.turn} <ArrowRight size={17} />
                  </button>
                </div>
                {view.errors.map((e) => (
                  <p key={e} role="alert" className="warning">
                    {e}
                  </p>
                ))}
                {view.warnings.map((w) => (
                  <p key={w} className="warning">
                    {w}
                  </p>
                ))}
              </section>
            )}
            <footer>
              <span>
                Built for curious minds. Inspired by real space science.
              </span>
              <button onClick={() => setDialog("sources")}>
                Sources & credits <ArrowUpRight size={13} />
              </button>
              <span>Independent project · Not endorsed by NASA</span>
            </footer>
          </main>
        </div>
      </div>
      {dialog === "briefing" && (
        <Dialog
          title="Your mission starts here"
          onClose={() => setDialog(null)}
        >
          <span className="eyebrow">DR. MAYA · SCIENCE LEAD</span>
          <p className="dialog-intro">
            Welcome to Ares Outpost, Commander. Your crew needs you to make six
            thoughtful decisions.
          </p>
          <ol className="brief-list">
            <li>Keep oxygen, water, and food above zero.</li>
            <li>Stay at or below 12 game exposure points.</li>
            <li>
              Complete three research objectives, including one rover sample.
            </li>
          </ol>
          <p>
            Switch systems on or off, choose one crew task, and review the
            preview. Nothing advances until you end the turn.
          </p>
          <p>
            Alex’s tip: grow food early. Two consecutive powered greenhouse
            turns produce a harvest. Turning the lights off resets progress in
            this simplified game.
          </p>
          <p className="science-note">
            This is an educational model. Turns are abstract planning intervals,
            crops grow faster than real crops, water recycling is omitted, and
            exposure points are not a physical dose. Shield upgrades simplify
            habitat and expedition protection together.
          </p>
          <button className="primary" onClick={() => setDialog(null)}>
            Ready, Commander <ArrowRight size={16} />
          </button>
        </Dialog>
      )}
      {dialog === "sources" && (
        <Dialog
          title="The science behind your mission"
          onClose={() => setDialog(null)}
        >
          <p>
            Archived sources, not live space weather. Real observations and
            fictional game rules are kept separate.
          </p>
          {evidence.map((item) => (
            <article className="evidence-card" key={item.id}>
              <span className="eyebrow">
                {
                  {
                    observation: "OBSERVED DATA",
                    educational: "EDUCATIONAL SOURCE",
                    research: "RESEARCH FINDING",
                    imagery: "MARS IMAGERY",
                  }[item.kind]
                }{" "}
                · {item.provider}
              </span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <p className="science-note">Source context: {item.context}</p>
              {item.id === "radlab-iss" && (
                <Suspense fallback={<p>Loading archived observations…</p>}>
                  <RadiationChart />
                </Suspense>
              )}
              {item.id === "jezero-image" && (
                <figure className="mars-photo">
                  <img
                    src="/assets/jezero-delta.jpg"
                    alt="Perseverance view across Jezero Crater toward a raised remnant of an ancient delta."
                    loading="lazy"
                    width="640"
                    height="466"
                  />
                  <figcaption>PIA24485 · NASA/JPL-Caltech/ASU/MSSS</figcaption>
                </figure>
              )}
              <dl>
                <dt>Original record</dt>
                <dd>{item.recordId}</dd>
                <dt>Date / retrieved</dt>
                <dd>
                  {item.observedAt} / {item.retrievedAt}
                </dd>
              </dl>
              {item.id === "donki-flare" && (
                <p className="data-reading">
                  X3.9 class · peak 06:54 UTC · 10 May 2024
                </p>
              )}
              <p>
                <strong>Game adaptation:</strong> {item.gameUse}
              </p>
              <p className="science-note">{item.limitations}</p>
              <p className="credit">Credit: {item.credit}</p>
              <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                Open original source <ArrowUpRight size={14} />
              </a>
              {item.id === "osdr-plants" && (
                <a
                  href={item.originalFields.publicationUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Read the research paper <ArrowUpRight size={14} />
                </a>
              )}
            </article>
          ))}
          <p className="science-note">
            The 3D terrain and models are original procedural illustrations, not
            NASA terrain data. The science library uses archived evidence; all
            resource rates and exposure limits in your mission are game rules.
          </p>
        </Dialog>
      )}
      {dialog === "reset" && (
        <Dialog title="Start a new mission?" onClose={() => setDialog(null)}>
          <p>
            This replaces your current progress on this device. You’ll replay
            the same scenario and can try different choices.
          </p>
          <div className="dialog-actions">
            <button className="secondary" onClick={() => setDialog(null)}>
              Keep playing
            </button>
            <button className="primary" onClick={reset}>
              Start fresh <RotateCcw size={16} />
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
