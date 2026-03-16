# Ralph Loop

Ralph Loop is an iterative, self-improving development cycle plugin. It uses a Stop hook to intercept Claude's exit and re-feed the same prompt, allowing Claude to autonomously refine its work across multiple iterations while file changes and git history persist between runs.

## Commands

### `/ralph-loop`

Start an iterative loop.

**Usage:**
```
/ralph-loop                                         ← reads prompt.md from project root
/ralph-loop "<prompt>" --max-iterations <n> --completion-promise "<text>"
```

**Options:**
- `--max-iterations <n>` — Stop after N iterations (default: 20)
- `--completion-promise "<text>"` — Phrase Claude must output to signal completion

**When called with no arguments:** Read `prompt.md` from the project root. Use the full file content as the task. Extract the completion promise from the `## Completion Promise` section — look for the exact text inside `<promise>...</promise>` tags. Default to `--max-iterations 20`.

**Example:**
```
/ralph-loop "Implement full test coverage for the NZQA API routes. Run tests after each change. Output DONE when all tests pass." --max-iterations 10 --completion-promise "DONE"
```

### `/cancel-ralph`

Cancel the active Ralph loop immediately.

---

## How Claude Should Handle These Commands

### When `/ralph-loop` is invoked

1. Parse the prompt, `--max-iterations` (default 20), and `--completion-promise` arguments.
2. Write the loop state to `.ralph-state.json` in the project root:
   ```json
   {
     "prompt": "<the task prompt>",
     "completionPromise": "<the completion text>",
     "maxIterations": 20,
     "iteration": 0,
     "active": true
   }
   ```
3. Confirm to the user: "Ralph loop started. I'll keep iterating until I output `<completionPromise>` or reach `<maxIterations>` iterations."
4. Immediately begin working on the task prompt as iteration 1.
5. At the end of each pass, if the task is complete, output the exact `completionPromise` string. The Stop hook will detect this and allow Claude to exit cleanly.
6. If not complete, do NOT output the completion promise — just exit normally and the Stop hook will re-feed the prompt automatically.

### When `/cancel-ralph` is invoked

1. Delete `.ralph-state.json` from the project root (or set `"active": false`).
2. Confirm: "Ralph loop cancelled."

---

## State File: `.ralph-state.json`

Lives at the project root. Created by Claude on `/ralph-loop`, consumed by the Stop hook.

```json
{
  "prompt": "The full task description",
  "completionPromise": "DONE",
  "maxIterations": 20,
  "iteration": 1,
  "active": true
}
```

The Stop hook increments `iteration` and re-feeds `prompt` until `maxIterations` is reached or the transcript contains `completionPromise`.

---

## Best Practices

- Always set `--max-iterations` to avoid infinite loops.
- Make `--completion-promise` a unique string unlikely to appear accidentally (e.g., `ALL_TESTS_PASSING`, `FEATURE_COMPLETE`).
- Include test commands in the prompt so Claude can self-verify each pass.
- Include explicit acceptance criteria — the clearer the definition of done, the better each iteration.
- Use `/cancel-ralph` to stop early if you need to intervene.
