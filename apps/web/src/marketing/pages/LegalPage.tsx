import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";
import { legalSummaries } from "../data";

type LegalPageProps = {
  kind: keyof typeof legalSummaries;
  title: string;
  description: string;
};

export function LegalPage({ kind, title, description }: LegalPageProps) {
  return (
    <>
      <Seo title={`${title} | GeoSurvey AI`} description={description} />
      <SectionContainer eyebrow="Legal" title={title} description={description}>
        <div className="marketing-legal-copy">
          <p>{legalSummaries[kind]}</p>
          <p>
            This placeholder page is structured so the final legal content can be dropped into the site without redesigning the marketing system or breaking navigation integrity.
          </p>
        </div>
      </SectionContainer>
    </>
  );
}
