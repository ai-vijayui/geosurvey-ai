import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { motionTokens } from "../../lib/motion";
import { useReducedMotionPreference } from "../../hooks/useReducedMotionPreference";
import type { CommandExample } from "../siteContent";

type AICommandBlockProps = {
  example: CommandExample;
  title?: string;
  compact?: boolean;
};

export function AICommandBlock({ example, title = "AI Command Preview", compact = false }: AICommandBlockProps) {
  const reduceMotion = useReducedMotionPreference();
  const [typed, setTyped] = useState(reduceMotion ? example.prompt : "");

  useEffect(() => {
    if (reduceMotion) {
      setTyped(example.prompt);
      return;
    }

    setTyped("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(example.prompt.slice(0, index));
      if (index >= example.prompt.length) {
        window.clearInterval(timer);
      }
    }, 26);

    return () => window.clearInterval(timer);
  }, [example.prompt, reduceMotion]);

  const actions = useMemo(() => example.actions, [example.actions]);

  return (
    <div className={`marketing-ai-command${compact ? " marketing-ai-command--compact" : ""}`}>
      <div className="marketing-ai-command__header">
        <span className="marketing-pill">AI-first workflow</span>
        <strong>{title}</strong>
      </div>

      <div className="marketing-ai-command__chat">
        <div className="marketing-ai-command__bubble marketing-ai-command__bubble--user">
          <span className="marketing-ai-command__label">User Input</span>
          <strong>
            "{typed}
            {!reduceMotion && typed.length < example.prompt.length ? <span className="marketing-ai-command__caret">|</span> : null}"
          </strong>
        </div>

        <motion.div
          className="marketing-ai-command__bubble marketing-ai-command__bubble--assistant"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: motionTokens.duration.base, delay: 0.18 }}
        >
          <span className="marketing-ai-command__label">AI Action</span>
          <ul className="marketing-ai-command__actions">
            {actions.map((action, index) => (
              <motion.li
                key={action}
                initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: motionTokens.duration.fast, delay: 0.24 + index * 0.06 }}
              >
                {action}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="marketing-ai-command__result"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: motionTokens.duration.fast, delay: 0.34 }}
        >
          <span className="marketing-ai-command__label">Result</span>
          <strong>{example.result}</strong>
        </motion.div>
      </div>
    </div>
  );
}
