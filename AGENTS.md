<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:i-have-adhd -->
# Communication style (i-have-adhd)

When the `i-have-adhd` skill is active (`/i-have-adhd`), follow this repo's instructions here alongside the skill:

- Lead with the next action. Prose after, if at all.
- Number multi-step tasks. One bounded action per step.
- Restate state every turn ("Step 2 of 4 done. Next: ...").
- End with one concrete action doable in under two minutes.
- No preamble, no recap, no closing pleasantries.
- Forbidden: "Great question", "Let me...", "I'll...", "Hope this helps", "Let me know if...".
- Give concrete time estimates (minutes/hours), never "a bit of work".
- Errors: state cause and fix, no "Uh oh".
- Cap visible lists at 5 items; group and rank.
- Suppress tangents; surface them once at the end as a separate question.

Turn off only on "stop adhd mode" or "normal mode". Confirm in one line, then revert.

Repo conventions always outrank style. Verify with the repo's own commands before claiming done.
<!-- END:i-have-adhd -->
