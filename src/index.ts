#!/usr/bin/env node

import "@/loadEnv";
import { logger } from "@/utils/logger";
import { run } from "@/utils/run";
import { GIT_COMMIT_GENERATE, GIT_DIFF } from "@/gitCommands";
import { getUserConfirmation } from "@/utils/getUserConfirmation";
import { SelectPrompt } from "@/types";
import { generateMessage } from "@/utils/generateMessage";

const main = async () => {
  try {
    console.log("╔════════════════════════════════════════╗");
    console.log("║     Git Commit Message Generator       ║");
    console.log("╚════════════════════════════════════════╝\n");

    logger.await("Getting git diff...");
    let diffRes;

    try {
      diffRes = await run("git", [...GIT_DIFF], {
        stdio: "pipe",
      });
    } catch (error) {
      throw new Error("Error getting git diff");
    }

    if (!diffRes.stdout) {
      logger.info("No changes to commit.");
      process.exit(0);
    }

    logger.info("Git diff retrieved successfully.");
    logger.await("Generating commit message...");
    // AI call
    const commitMessage = await generateMessage(
      typeof diffRes.stdout === "string" ? diffRes.stdout : "",
    );

    logger.commit(`\x1b[1;36m${commitMessage}\x1b[0m`);

    // get user confirmation
    const userApprovedCommitMsg = await getUserConfirmation(
      "Do you want to commit this message?",
      commitMessage,
      Object.values(SelectPrompt),
    );

    if (!userApprovedCommitMsg) {
      logger.info("Commit rejected.");
      process.exit(0);
    }

    logger.start("Committing message...");
    // Implementation for committing the message
    const GIT_COMMIT = GIT_COMMIT_GENERATE(userApprovedCommitMsg);

    try {
      await run("git", [...GIT_COMMIT], {
        stdio: "inherit",
      });
    } catch (error) {
      throw new Error("Error committing message");
    }

    logger.complete("Committed successfully.");
  } catch (error) {
    logger.error(
      (error as Error).message ||
        "Error occurred while processing commit message",
    );
    process.exit(1);
  }
};

main();
