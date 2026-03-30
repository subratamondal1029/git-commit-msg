import { select, editableInput } from "./query";
import { SelectPrompt } from "@/types";

export const getUserConfirmation = async (
  question: string,
  commitMsg: string,
  choices: SelectPrompt[],
): Promise<string | null> => {
  if (!question?.trim()) {
    throw new Error("Invalid question provided");
  }

  if (
    !choices ||
    choices.length === 0 ||
    !choices.every((choice) => Object.values(SelectPrompt).includes(choice))
  ) {
    throw new Error("Invalid choices provided");
  }

  const selection = (await select(question, choices)) as SelectPrompt;

  if (!selection) {
    throw new Error("No selection made");
  }

  if (selection === SelectPrompt.YES) {
    return commitMsg;
  } else if (selection === SelectPrompt.NO) {
    return null;
  } else if (selection === SelectPrompt.EDIT) {
    const editedMsg = await editableInput("Edit commit message ", commitMsg);
    return editedMsg;
  } else {
    throw new Error("Invalid selection made");
  }
};
