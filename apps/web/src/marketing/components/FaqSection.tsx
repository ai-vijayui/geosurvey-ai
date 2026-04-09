import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { motionTokens } from "../../lib/motion";
import type { MarketingFaq } from "../data";
import { SectionContainer } from "./SectionContainer";

export function FaqSection({ items }: { items: MarketingFaq[] }) {
  const [openQuestion, setOpenQuestion] = useState(items[0]?.question ?? "");

  return (
    <SectionContainer
      eyebrow="FAQ"
      title="Questions buyers and operators ask before switching workflows."
      description="This section is meant to remove friction close to conversion, not bury key answers in support docs."
    >
      <div className="marketing-faq-list">
        {items.map((item) => (
          <Card key={item.question} className="marketing-faq-card">
            <button
              type="button"
              className="marketing-faq-card__trigger"
              onClick={() => setOpenQuestion((current) => (current === item.question ? "" : item.question))}
              aria-expanded={openQuestion === item.question}
            >
              <h3>{item.question}</h3>
              <span className={`marketing-faq-card__icon${openQuestion === item.question ? " is-open" : ""}`}>+</span>
            </button>
            <AnimatePresence initial={false}>
              {openQuestion === item.question ? (
                <motion.div
                  className="marketing-faq-card__body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: motionTokens.duration.fast, ease: motionTokens.easing.standard }}
                >
                  <p>{item.answer}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}
