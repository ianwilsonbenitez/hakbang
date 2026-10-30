# Simulan dito — Hakbang setup

Gawin ito **pagkatapos ng baseline test**. Ikaw ang magta-type ng lahat ng command.

## 1. Gumawa ng folder at ilagay ang starter files

1. Gumawa ng folder: `E:\hakbang`
2. Kopyahin sa loob nito ang lahat ng laman ng starter pack, kasama ang nakatagong `.claude` folder:
   - `CLAUDE.md`, `GEMINI.md`, `START-HERE.md`
   - `.claude\settings.json` at `.claude\agents\` (4 files)
   - `docs\design-tokens.md` at `docs\lesson-schema.md`
3. Gumawa ng dalawang walang lamang folder para kay Gemini: `content\lessons` at `docs\diagrams`

## 2. Buksan sa dalawang app

- **VS Code** → File › Open Folder › `E:\hakbang` → buksan ang Claude Code panel.
  - I-type ang `/model` at piliin ang **Sonnet** (medium effort). Ito ang pang-araw-araw na builder.
  - I-type ang `/agents` para makita ang 4 agents: `hakbang-architect` at `hakbang-reviewer` (Opus), `lesson-checker` at `explainer` (Sonnet).
- **Antigravity** → buksan din ang `E:\hakbang`. Piliin ang pinakamalakas na Gemini model sa model picker.

## 3. Unang prompt kay Claude (VS Code)

```
Basahin mo ang CLAUDE.md. Magsisimula tayo sa Milestone 1.

Una, gamitin ang hakbang-architect agent para hatiin ang Milestone 1 sa maliliit na task na kaya ko sa isang study session (45–90 min).

Pagkatapos, gabayan mo ako sa Task 1: pag-setup ng project gamit ang Vite + React + TypeScript dito mismo sa folder na ito, tapos Tailwind at Vitest. Sundin ang no-autopilot rule: ipakita ang isang command, ipaliwanag nang maikli, at hintayin akong i-type ito.

Sagutin mo ako sa Taglish.
```

Kapag tinanong ng Vite na "Current directory is not empty", piliin ang **Ignore files and continue** para hindi mabura ang starter files.

## 4. Unang prompt kay Gemini (Antigravity)

Gawin ito pagkatapos ng unang commit mo.

```
Basahin mo ang GEMINI.md at docs/lesson-schema.md.

Gumawa ng Unit 1 lesson: "How a web app works" (browser → server → database). Gamitin ang lab analogy: encoder = browser, MedTech na nagche-check = server, masterlist = database.

I-save sa content/lessons/unit-01-how-web-apps-work.json, at ang diagram sa docs/diagrams/unit-01-how-web-apps-work.mmd. Huwag gagalaw sa ibang folder. Kumpleto dapat ang English at Taglish.
```

Pagkatapos, sa Claude: `Gamitin ang lesson-checker agent sa bagong lesson file.`

## 5. Ang ritmo ng bawat session

1. **Commit muna** bago lumipat mula Claude papuntang Gemini o pabalik.
2. Isang maliit na task lang kada session.
3. Bago mag-commit ng feature: `Gamitin ang hakbang-reviewer agent.`
4. Hindi mo maintindihan? `Gamitin ang explainer agent: ano ang ginagawa ng [file/command/error]?`
5. Sagutin ang "check your understanding" na tanong sa dulo ng bawat task, nang walang AI.

## Kung may gusto kang baguhin

- **Maliit** (kulay, text, spacing): sabihin diretso kay Claude sa VS Code.
- **Malaki** (bagong screen, bagong feature, scope): itanong muna sa `hakbang-architect`, o sa planning chat. Ipa-update ang `CLAUDE.md` kapag nagbago ang desisyon.
