import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DemoProjectBanner } from "../components/help/DemoProjectBanner";
import { GoodBadExample } from "../components/help/GoodBadExample";
import { HelpSection } from "../components/help/HelpSection";
import { HelpTopicNav } from "../components/help/HelpTopicNav";
import { SampleFileCard } from "../components/help/SampleFileCard";
import { StepCard } from "../components/help/StepCard";
import { TipBox } from "../components/help/TipBox";
import { UseCaseCard } from "../components/help/UseCaseCard";
import { acceptedFileHelp, commonProblems, helpTopics, realExamples, surveyLearningCards, type HelpTopic } from "../components/help/helpContent";
import { useAiPanelState } from "../context/AiPanelContext";

function HelpVisual({ title, subtitle, variant }: { title: string; subtitle: string; variant: "flow" | "files" | "map" | "ai"; }) {
  return (
    <div className={`help-visual help-visual--${variant}`}>
      <div className="help-visual__surface">
        <span className="help-visual__eyebrow">{title}</span>
        <strong>{subtitle}</strong>
      </div>
    </div>
  );
}

export function HelpPage() {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [activeTopicId, setActiveTopicId] = useState(helpTopics[0].id);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const { setThread, setDesktopOpen, setMobileOpen } = useAiPanelState();

  const filteredTopics = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return helpTopics;
    }
    return helpTopics.filter((topic) => `${topic.title} ${topic.summary}`.toLowerCase().includes(term));
  }, [query]);

  useEffect(() => {
    const hash = location.hash.replace(/^#/, "");
    if (!hash) {
      return;
    }
    const node = sectionRefs.current[hash];
    if (node) {
      window.setTimeout(() => {
        node.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveTopicId(hash);
      }, 30);
    }
  }, [location.hash]);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      const best = filteredTopics
        .map((topic) => {
          const node = sectionRefs.current[topic.id];
          if (!node) {
            return null;
          }
          return { id: topic.id, distance: Math.abs(node.getBoundingClientRect().top - containerTop - 18) };
        })
        .filter((entry): entry is { id: string; distance: number } => Boolean(entry))
        .sort((a, b) => a.distance - b.distance)[0];

      if (best && best.id !== activeTopicId) {
        setActiveTopicId(best.id);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", `#${best.id}`);
        }
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeTopicId, filteredTopics]);

  function openAiForTopic(topic: HelpTopic) {
    setThread("general", (current) => [
      ...current,
      {
        role: "assistant",
        content: `Help topic loaded: ${topic.title}. I can explain this in simpler words, turn it into a checklist, or guide you step by step.`
      },
      {
        role: "user",
        content: `${topic.aiPrompt}\n\nCurrent help topic: ${topic.title}\nSummary: ${topic.summary}`
      }
    ]);

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileOpen(true);
    } else {
      setDesktopOpen(true);
    }
  }

  function copyLink(id: string) {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    void navigator.clipboard.writeText(url);
  }

  function scrollToTopic(id: string) {
    const node = sectionRefs.current[id];
    if (!node) {
      return;
    }
    node.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveTopicId(id);
  }

  return (
    <div className="reference-page">
      <div className="reference-page-header">
        <div className="reference-page-header__copy">
          <h1>Help & Learning</h1>
          <p>Find plain-language guidance for uploads, workflow steps, map review, AI checks, and sample files without leaving the workspace.</p>
        </div>
        <div className="reference-actions">
          <button className="button-secondary" onClick={() => openAiForTopic(helpTopics[0])}>Ask AI about this section</button>
          <button className="button-secondary" onClick={() => copyLink(activeTopicId)}>Copy link</button>
        </div>
      </div>

      <div className="help-page">
        <HelpTopicNav
          topics={filteredTopics}
          activeTopicId={activeTopicId}
          query={query}
          onQueryChange={setQuery}
          onTopicClick={scrollToTopic}
        />

        <div ref={contentRef} className="help-page__content">
        <div ref={(node) => { sectionRefs.current["start-here"] = node; }}>
          <HelpSection
            id="start-here"
            title="Start Here"
            summary="GeoSurvey AI helps you add survey files, start the work, and see results without jumping between many tools."
            action={<button className="button-secondary" onClick={() => openAiForTopic(helpTopics[0])}>Ask AI about this section</button>}
            onCopyLink={() => copyLink("start-here")}
            advancedDetails={<ul className="sample-file-card__steps"><li>In advanced workflows, the app can work with point lists, map images, 3D scan files, and land drawings together.</li><li>The main beginner path stays the same: add files, start work, review results.</li></ul>}
          >
            <div className="help-step-grid">
              <StepCard step="1" title="Add Files" whatYouDo="Upload your point list, map image, photo, or 3D scan file." whatAppDoes="The app checks if the file type looks usable." whatYouSee="A file list and upload progress." whatNext="Open the task and move to Start Work." />
              <StepCard step="2" title="Start Work" whatYouDo="Click the start button when your files are ready." whatAppDoes="The app begins processing and checking the data." whatYouSee="Progress and status updates." whatNext="Wait for the task to finish, then open the result tabs." />
              <StepCard step="3" title="See Results" whatYouDo="Open the map, outputs, and Smart Check tabs." whatAppDoes="The app shows your survey results and helpful notes." whatYouSee="Map view, files, and smart suggestions." whatNext="Review the work, then export or continue." />
            </div>
            <HelpVisual title="Simple app flow" subtitle="You add files -> the app checks them -> the app processes them -> you see results" variant="flow" />
            <div className="reference-actions">
              <Link className="button-primary" to="/jobs?createJob=1&demoType=GNSS_TRAVERSE&demoName=Demo%20GNSS%20Land%20Survey">Try Demo Project</Link>
              <Link className="button-secondary" to="/help#sample-files">Download Sample Files</Link>
              <Link className="button-secondary" to="/jobs">Go to Jobs</Link>
            </div>
          </HelpSection>
        </div>

        <div ref={(node) => { sectionRefs.current["how-this-app-works"] = node; }}>
          <HelpSection
            id="how-this-app-works"
            title="How This App Works"
            summary="Think of the platform as one simple path: create a project, create a task, add files, start work, then review results."
            action={<button className="button-secondary" onClick={() => openAiForTopic(helpTopics[1])}>Ask AI about this section</button>}
            onCopyLink={() => copyLink("how-this-app-works")}
          >
            <div className="help-flow">
              <div className="help-flow__item"><strong>Create project</strong><span>Make one place for the site or job location.</span></div>
              <div className="help-flow__item"><strong>Create task</strong><span>Open one survey task inside the project.</span></div>
              <div className="help-flow__item"><strong>Add files</strong><span>Upload point lists, map images, or scan files.</span></div>
              <div className="help-flow__item"><strong>Start work</strong><span>Run processing and wait for progress.</span></div>
              <div className="help-flow__item"><strong>Review results</strong><span>Check the map, outputs, and Smart Check.</span></div>
            </div>
            <TipBox title="What you do">You mainly create, upload, click start, and review. The app handles the heavy work in the background.</TipBox>
            <TipBox title="What the app does" tone="info">It organizes your files, tracks progress, shows maps, and gives smart suggestions if something may need checking.</TipBox>
          </HelpSection>
        </div>

        <div ref={(node) => { sectionRefs.current["first-project"] = node; }}>
          <HelpSection id="first-project" title="Do Your First Project" summary="Follow these steps in order. This is the easiest way to learn the platform without confusion." action={<button className="button-secondary" onClick={() => openAiForTopic(helpTopics[2])}>Ask AI about this section</button>} onCopyLink={() => copyLink("first-project")}>
            <div className="help-step-grid">
              <StepCard step="1" title="Create Project" whatYouDo="Click New Project and give the site a clear name." whatAppDoes="It makes a home for your survey work." whatYouSee="A project listed in the app." whatNext="Create a task inside it." />
              <StepCard step="2" title="Create Task" whatYouDo="Open a new task for one survey job." whatAppDoes="It gives your files and results one clear place." whatYouSee="A task page with upload and progress tabs." whatNext="Add your files." />
              <StepCard step="3" title="Add Files" whatYouDo="Upload a point list, photo, map image, or scan file." whatAppDoes="It checks the file type and stores the file in the task." whatYouSee="Upload progress and a file list." whatNext="Start work." />
              <StepCard step="4" title="Start Work" whatYouDo="Click the start button." whatAppDoes="It begins processing the task." whatYouSee="Progress status and activity updates." whatNext="Wait for completion." />
              <StepCard step="5" title="Wait for Progress" whatYouDo="Watch the progress area." whatAppDoes="It updates the task state while work is running." whatYouSee="Status changes such as processing or review." whatNext="Open the result tabs." />
              <StepCard step="6" title="Open Result Tabs" whatYouDo="Open Map, Outputs, and Smart Check." whatAppDoes="It shows results in context." whatYouSee="Map position, output files, and helpful notes." whatNext="Review before sharing." />
            </div>
          </HelpSection>
        </div>

        <div ref={(node) => { sectionRefs.current["what-files-to-upload"] = node; }}>
          <HelpSection id="what-files-to-upload" title="What Files To Upload" summary="Different survey types use different files. This section helps you match the file to the job." action={<button className="button-secondary" onClick={() => openAiForTopic(helpTopics[3])}>Ask AI about this section</button>} onCopyLink={() => copyLink("what-files-to-upload")}>
            <div className="help-use-case-grid">
              {surveyLearningCards.map((card) => (
                <article key={card.surveyType} className="use-case-card">
                  <span className="use-case-card__tag">{card.surveyType}</span>
                  <strong>{card.title}</strong>
                  <p>{card.description}</p>
                  <div className="use-case-card__rows">
                    <p><span>What this file means:</span> {card.simpleMeaning}</p>
                    <p><span>Required:</span> {card.requiredFiles.join(", ")}</p>
                    <p><span>Optional:</span> {card.optionalFiles.join(", ")}</p>
                    <p><span>Formats:</span> {card.supportedFormats.join(", ")}</p>
                  </div>
                </article>
              ))}
            </div>
            <HelpVisual title="File guide" subtitle="Point list, photo, map image, 3D scan file, land drawing" variant="files" />
            <GoodBadExample goodTitle="Good CSV" goodItems={["Has latitude and longitude columns", "Has one point per row", "Values look readable and complete", "Uses a supported file type"]} badTitle="Bad CSV" badItems={["Missing coordinate columns", "Has broken or empty values", "Rows do not line up", "File type is not supported here"]} />
          </HelpSection>
        </div>

        <div ref={(node) => { sectionRefs.current["sample-files"] = node; }}>
          <HelpSection id="sample-files" title="Sample Files & Test Project" summary="New users can download sample files, open a demo task, and test the platform safely before using real data." action={<button className="button-secondary" onClick={() => openAiForTopic(helpTopics[4])}>Ask AI about this section</button>} onCopyLink={() => copyLink("sample-files")}>
            <TipBox title="Need a test file?" tone="success">Download a sample and try this platform safely. You do not need real client files to learn the flow.</TipBox>
            <DemoProjectBanner />
            <div className="sample-file-card-grid">
              {surveyLearningCards.map((card) => <SampleFileCard key={card.surveyType} {...card} />)}
            </div>
          </HelpSection>
        </div>

        <div ref={(node) => { sectionRefs.current["see-data-on-map"] = node; }}>
          <HelpSection id="see-data-on-map" title="See Data on Map" summary="The map helps you check where your survey data sits, whether it looks correct, and whether anything needs attention." action={<button className="button-secondary" onClick={() => openAiForTopic(helpTopics[5])}>Ask AI about this section</button>} onCopyLink={() => copyLink("see-data-on-map")}>
            <div className="help-overview-grid">
              <div className="help-overview-card"><strong>Points</strong><p>Points show survey locations on the map.</p></div>
              <div className="help-overview-card"><strong>Boundaries</strong><p>Boundaries help show the site area or land outline.</p></div>
              <div className="help-overview-card"><strong>Inspect</strong><p>You can zoom, click, and inspect what the data looks like.</p></div>
            </div>
            <TipBox title="Color guide" tone="info">Green means good. Yellow means okay but worth checking. Red means something may need attention.</TipBox>
            <HelpVisual title="Map view" subtitle="Check position, site boundary, and survey points" variant="map" />
          </HelpSection>
        </div>

        <div ref={(node) => { sectionRefs.current["smart-check"] = node; }}>
          <HelpSection id="smart-check" title="Understand Smart Check / AI Results" summary="Smart Check reads the result and tells you if something looks good or if something may need checking." action={<button className="button-secondary" onClick={() => openAiForTopic(helpTopics[6])}>Ask AI about this section</button>} onCopyLink={() => copyLink("smart-check")}>
            <div className="help-ai-grid">
              <div className="help-ai-card"><strong>Something may need checking</strong><p>Example: low accuracy warning. Try better source data or review the point list.</p></div>
              <div className="help-ai-card"><strong>Some data looks missing</strong><p>Example: a needed file or expected values may not be present yet.</p></div>
              <div className="help-ai-card"><strong>This result looks good</strong><p>Example: the task passed the main checks and is ready for review or export.</p></div>
            </div>
            <TipBox title="Plain meaning">Smart Check is like a calm helper. It does not replace your judgment. It simply points at things worth reviewing.</TipBox>
            <HelpVisual title="Smart Check" subtitle="Good result, warning, or needs review" variant="ai" />
          </HelpSection>
        </div>

        <div ref={(node) => { sectionRefs.current["real-examples"] = node; }}>
          <HelpSection id="real-examples" title="Real Examples" summary="These examples help beginners connect the platform to real jobs in the field." action={<button className="button-secondary" onClick={() => openAiForTopic(helpTopics[7])}>Ask AI about this section</button>} onCopyLink={() => copyLink("real-examples")}>
            <div className="help-use-case-grid">
              {realExamples.map((example) => <UseCaseCard key={example.title} {...example} />)}
            </div>
          </HelpSection>
        </div>

        <div ref={(node) => { sectionRefs.current["common-problems"] = node; }}>
          <HelpSection id="common-problems" title="Common Problems" summary="If something feels broken, start here. These fixes use human words and simple next steps." action={<button className="button-secondary" onClick={() => openAiForTopic(helpTopics[8])}>Ask AI about this section</button>} onCopyLink={() => copyLink("common-problems")}>
            <div className="help-use-case-grid">
              {commonProblems.map((item) => (
                <article key={item.title} className="use-case-card">
                  <span className="use-case-card__tag">Problem help</span>
                  <strong>{item.title}</strong>
                  <div className="use-case-card__rows">
                    <p><span>What it means:</span> {item.problem}</p>
                    <p><span>What to try:</span> {item.fix}</p>
                  </div>
                </article>
              ))}
            </div>
          </HelpSection>
        </div>

        <div ref={(node) => { sectionRefs.current["pro-tips"] = node; }}>
          <HelpSection id="pro-tips" title="Pro Tips" summary="Use these small habits to keep work clean, reduce confusion, and help your team follow the same pattern." action={<button className="button-secondary" onClick={() => openAiForTopic(helpTopics[9])}>Ask AI about this section</button>} onCopyLink={() => copyLink("pro-tips")}>
            <div className="help-tips-grid">
              <TipBox title="Start with sample files if you are new">Sample files are the safest way to learn the platform.</TipBox>
              <TipBox title="Use clear names" tone="info">Use one project per site or location, and keep task names simple.</TipBox>
              <TipBox title="Check the map after every upload" tone="success">A quick map check can catch location problems early.</TipBox>
              <TipBox title="Use Smart Check before sharing output">It can warn you before a problem reaches another teammate or a client.</TipBox>
              <TipBox title="Keep related files in one task">This makes review easier and keeps outputs easier to understand.</TipBox>
              <TipBox title="Ask for help early" tone="warning">Open this page or ask AI when something feels unclear. Do not guess when the app can guide you.</TipBox>
            </div>
            <div className="reference-actions">
              <a className="button-secondary" href="/samples/README.txt" download>Download sample guide</a>
              <button className="button-secondary" onClick={() => scrollToTopic("start-here")}>Back to top</button>
            </div>
          </HelpSection>
        </div>

        <section className="reference-card reference-card--soft space-y-4">
          <span className="reference-chip">Accepted file help</span>
          <strong className="block text-lg font-semibold text-slate-900">File words in simple language</strong>
          <div className="upload-help-panel__formats">
            {acceptedFileHelp.map((item) => <span key={item}>{item}</span>)}
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}
