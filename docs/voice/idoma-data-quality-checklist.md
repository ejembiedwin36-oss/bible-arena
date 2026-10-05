# Idoma ASR Data Quality Checklist

Use this checklist before an item enters the ASR training manifest.

- [ ] Audio reference exists.
- [ ] Audio is readable and not obviously corrupted.
- [ ] Language code is `id`.
- [ ] Native transcript was supplied by a qualified reviewer.
- [ ] Sample status is `validated`.
- [ ] `asr_eligible` is explicitly true.
- [ ] Normalized transcript is non-empty.
- [ ] No guessed words were inserted.
- [ ] Unclear speech is documented in reviewer notes.
- [ ] Dataset split is preserved.
- [ ] Evaluation data remains isolated from training.
- [ ] Speaker identity is represented only by a safe internal identifier where needed for split checks.

A failed quality check should block export rather than silently modifying the sample.
