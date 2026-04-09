import type { HelpTopic } from "./helpContent";

type Props = {
  topics: HelpTopic[];
  activeTopicId: string;
  query: string;
  onQueryChange: (value: string) => void;
  onTopicClick: (id: string) => void;
};

export function HelpTopicNav({ topics, activeTopicId, query, onQueryChange, onTopicClick }: Props) {
  return (
    <aside className="help-page__topics reference-card reference-card--soft">
      <div className="help-page__topics-header">
        <span className="reference-chip">Help & Learning</span>
        <strong>Learn as you work</strong>
        <p>Pick one topic, read the simple steps, then try it inside the app.</p>
      </div>

      <label className="help-page__search">
        <span>Search help topics</span>
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search files, map, Smart Check..." />
      </label>

      <nav className="help-topic-list" aria-label="Help topics">
        {topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            className={`help-topic-button${activeTopicId === topic.id ? " active" : ""}`}
            onClick={() => onTopicClick(topic.id)}
          >
            <span className="help-topic-button__eyebrow">{topic.shortTitle}</span>
            <strong>{topic.title}</strong>
            <span>{topic.summary}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
