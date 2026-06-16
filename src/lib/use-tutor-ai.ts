import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { tutorChat } from "@/lib/tutor.functions";
import { toast } from "sonner";

export function useTutorAI() {
  const chat = useServerFn(tutorChat);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  async function run(prompt: string, opts?: { system?: string; mode?: "general" | "japanese" | "chinese" | "korean" }) {
    setLoading(true);
    setOutput("");
    try {
      const messages = opts?.system
        ? [{ role: "system" as const, content: opts.system }, { role: "user" as const, content: prompt }]
        : [{ role: "user" as const, content: prompt }];
      const res = await chat({ data: { messages, mode: opts?.mode ?? "general" } });
      setOutput(res.content);
      return res.content;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI request failed";
      toast.error(msg);
      return "";
    } finally {
      setLoading(false);
    }
  }

  return { loading, output, setOutput, run };
}
