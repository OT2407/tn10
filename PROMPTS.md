# TN10 ACTION PROMPTS (COPY & PASTE FILE)

Save this as `PROMPTS.md` in your project root. All actions in one place.

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

## 🟢 COMMIT & PUSH (post-debug)

```bash id="pushall"
git add . && \
git commit -m "chore: post-phase debug snapshot" && \
git push origin ranking/phase-3-diversity-balancing
```

---

## 🟢 VIEW RECENT COMMITS

```bash id="log"
git log --oneline --max-count=10
```

---

## 🟢 CHECK REMOTE

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

## NEXT

Use this single file for all actions.

Send outputs and I will:

✔ analyze
✔ continue Phase 4
✔ keep history clean

We proceed deliberately 🚀