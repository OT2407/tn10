# TN10 ACTION & REPORT PROMPTS (SINGLE FILE)

Save as `PROMPTS.md` in project root. Use for all actions and reporting.

---

## 🟢 EXPLAIN SAMPLE OUTPUT

```bash id="expout"
npm run explain -- --item <ITEM_ID>
```

Replace `<ITEM_ID>` with actual item.

---

## 🟢 SAMPLE RANKED FEED DEBUG

```bash id="feeddebug"
npm run debug:feed
```

---

## 🟢 FEED DUMP

```bash id="feeddump"
npm run feed:dump
```

---

## 🟢 GIT STATUS

```bash id="gitstat"
git status
```

---

## 🟢 RECENT COMMITS

```bash id="log"
git log --oneline --max-count=10
```

---

## 🟢 REMOTES

```bash id="remotes"
git remote -v
```

Expected:

```
origin https://github.com/OT2407/tn10.git (fetch)
origin https://github.com/OT2407/tn10.git (push)
```

Hosted on **GitHub**.

---

## 🟢 REPORT SAMPLE (paste to me)

```json id="report"
{
  "summary": "Describe what you tested",
  "explain_output": "...",
  "feed_sample": "...",
  "notes": [
    "behavior observations",
    "duplicates",
    "fairness issues"
  ]
}
```

I will analyze and provide next steps.

---

## 🟢 COMMIT AFTER REPORT

```bash id="postreport"
git add . && \
git commit -m "chore: post-phase report snapshot"
```

---

## NEXT

Use this file for:

* actions
* reports
* history
* Phase transitions

Send outputs and I will:

✔ analyze
✔ refine personalization
✔ continue Phase 4