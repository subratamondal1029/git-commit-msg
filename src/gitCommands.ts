export const GIT_DIFF: readonly string[] = [
  "diff",
  "--cached",
  "--no-color",
  "--",
  ".",
  ":(exclude)pnpm-lock.yaml",
  ":(exclude)package-lock.json",
  ":(exclude)yarn.lock",
] as const;

export const GIT_COMMIT_GENERATE = (msg: string): readonly string[] =>
  ["commit", "-m", msg] as const;
