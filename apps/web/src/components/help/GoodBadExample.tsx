type Props = {
  goodTitle: string;
  goodItems: string[];
  badTitle: string;
  badItems: string[];
};

export function GoodBadExample({ goodTitle, goodItems, badTitle, badItems }: Props) {
  return (
    <div className="good-bad-grid">
      <div className="good-bad-card good-bad-card--good">
        <strong>{goodTitle}</strong>
        <ul>
          {goodItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
      <div className="good-bad-card good-bad-card--bad">
        <strong>{badTitle}</strong>
        <ul>
          {badItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
}
