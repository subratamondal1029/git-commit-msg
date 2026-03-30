
import * as readline from "readline";

const stdin = process.stdin;
const stdout = process.stdout;

function setupRaw(): void {
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");
}

function teardownRaw(): void {
  stdin.setRawMode(false);
  stdin.pause();
}

export function editableInput(prompt: string, initial: string = ""): Promise<string> {
  return new Promise((resolve) => {
    let buffer = initial.split("");
    let cursor = buffer.length;

    function redraw() {
      stdout.write(`\r\x1b[K${prompt}> ${buffer.join("")}`);
      const moveBack = buffer.length - cursor;
      if (moveBack > 0) stdout.write(`\x1b[${moveBack}D`);
    }

    setupRaw();
    redraw();

    function onData(chunk: string) {
      // Ctrl+C
      if (chunk === "\x03") {
        stdout.write("\n");
        teardownRaw();
        stdin.removeListener("data", onData);
        process.exit();
      }

      // Enter
      if (chunk === "\r" || chunk === "\n") {
        stdout.write("\n");
        teardownRaw();
        stdin.removeListener("data", onData);
        resolve(buffer.join(""));
        return;
      }

      // Backspace
      if (chunk === "\x7f") {
        if (cursor > 0) { buffer.splice(cursor - 1, 1); cursor--; redraw(); }
        return;
      }

      // Delete forward
      if (chunk === "\x1b[3~") {
        if (cursor < buffer.length) { buffer.splice(cursor, 1); redraw(); }
        return;
      }

      // Arrow left
      if (chunk === "\x1b[D") { if (cursor > 0) { cursor--; redraw(); } return; }

      // Arrow right
      if (chunk === "\x1b[C") { if (cursor < buffer.length) { cursor++; redraw(); } return; }

      // Home (key or Ctrl+A)
      if (chunk === "\x1b[H" || chunk === "\x01") { cursor = 0; redraw(); return; }

      // End (key or Ctrl+E)
      if (chunk === "\x1b[F" || chunk === "\x05") { cursor = buffer.length; redraw(); return; }

      // Skip other escape sequences
      if (chunk.startsWith("\x1b")) return;

      // Printable chars — insert at cursor
      const chars = chunk.split("");
      buffer.splice(cursor, 0, ...chars);
      cursor += chars.length;
      redraw();
    }

    stdin.on("data", onData);
  });
}

export function select(prompt: string, choices: string[]): Promise<string> {
  return new Promise((resolve) => {
    let selected = 0;

    function redraw() {
      // Clear all lines then redraw from top
      stdout.write(`\x1b[${choices.length + 1}A\x1b[J`);
      stdout.write(`${prompt}\n`);
      choices.forEach((choice, i) => {
        const cursor_mark = i === selected ? "\x1b[36m›\x1b[0m" : " ";
        const label = i === selected ? `\x1b[36m${choice}\x1b[0m` : choice;
        stdout.write(` ${cursor_mark} ${label}\n`);
      });
    }

    function initialDraw() {
      stdout.write(`${prompt}\n`);
      choices.forEach((choice, i) => {
        const cursor_mark = i === selected ? "\x1b[36m›\x1b[0m" : " ";
        const label = i === selected ? `\x1b[36m${choice}\x1b[0m` : choice;
        stdout.write(` ${cursor_mark} ${label}\n`);
      });
    }

    setupRaw();
    initialDraw();

    function onData(chunk: string) {
      // Ctrl+C
      if (chunk === "\x03") {
        stdout.write("\n");
        teardownRaw();
        stdin.removeListener("data", onData);
        process.exit();
      }

      // Enter
      if (chunk === "\r" || chunk === "\n") {
        // Clear list, print selected inline
        stdout.write(`\x1b[${choices.length + 1}A\x1b[J`);
        stdout.write(`${prompt} \x1b[36m${choices[selected]}\x1b[0m\n`);
        teardownRaw();
        stdin.removeListener("data", onData);
        resolve(choices[selected]);
        return;
      }

      // Arrow up / k
      if (chunk === "\x1b[A" || chunk === "k") {
        selected = (selected - 1 + choices.length) % choices.length;
        redraw();
        return;
      }

      // Arrow down / j
      if (chunk === "\x1b[B" || chunk === "j") {
        selected = (selected + 1) % choices.length;
        redraw();
        return;
      }
    }

    stdin.on("data", onData);
  });
}