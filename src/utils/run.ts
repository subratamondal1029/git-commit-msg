import { execa, type Options as ExecaOptions } from "execa";
import { SUPPORTED_TOOLS } from "@/constants";

type Tool = (typeof SUPPORTED_TOOLS)[number];
type StdioOption = ExecaOptions["stdio"];

export const run = async (
  tool: Tool,
  args: string[],
  options?: {
    cwd?: string;
    stdio?: StdioOption;
  },
) => {
  if (!SUPPORTED_TOOLS.includes(tool)) {
    throw new Error(`Unsupported tool: ${tool}`);
  }

  const res = await execa(tool, args, {
    cwd: options?.cwd ?? process.cwd(),
    stdio: options?.stdio ?? "inherit",
  });

  if (res.stderr) {
    const errorMessage =
      typeof res.stderr === "string" ? res.stderr : res.stderr.join("\n");
    throw new Error(errorMessage || "");
  }

  return res;
};
