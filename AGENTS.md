# Project architecture

- Route all server-side AI text generation through the shared `src/lib/kimi.server.ts` service, keeping provider credentials and model selection server-only; this gives every StudyHub AI feature consistent configuration and safe error handling.