<p align="center">
  <img src="public/app-icon.png" width="96" height="96" alt="The pixel-art eraser icon for skills on-off">
</p>

<h1 align="center">skills on-off</h1>

<p align="center"><strong>Turn AI Agent Skills on and off as needed, and organize your library by function.</strong></p>

<p align="center">
  <a href="#features">Features &amp; Demos</a> ·
  <a href="#start">Download &amp; Usage</a> ·
  <a href="#why">Motivation &amp; Related Research</a> ·
  <a href="#credits">Acknowledgments &amp; License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows_x64-3273a8?style=flat-square" alt="Platform: Windows x64">
  <img src="https://img.shields.io/badge/version-1.2.3-547a68?style=flat-square" alt="Version: 1.2.3">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0--only-795b91?style=flat-square" alt="License: GPL-3.0-only"></a>
</p>

<p align="center"><a href="README.md">简体中文</a></p>

---

I collected plenty of useful Skills, then noticed that having more tools sometimes made it harder for Codex to get started. It would investigate one approach, want to try another, and end up doing both. Watching it hesitate and argue with itself, I could see the time and tokens being spent.

So I made skills on-off to narrow those choices beforehand. I keep useful skills in my own library, organize them by project and function, and enable the ones I need for the task at hand. The collection can keep growing, while I decide which skills to make available to the agent.

<a id="features"></a>

## ✨ Features & Demos

### Enable skills as needed

Connect the source directory where you keep skills to the target directory your agent reads, then enable individual skills in the list. Enabling copies the relevant content into the target; disabling removes the corresponding target copy while keeping the source. Switch to the enabled view to see the skills currently available to the agent.

### Organize skills by function

Skills for writing, search, or code review may come from different projects. Add function tags to find them by purpose in the function view, or switch to the project view to browse their sources. A skill can have multiple tags, and notes can record its purpose and things to keep in mind.

![Browse skills grouped by function, then switch to project groups to see their sources](docs/media/group-management.gif)

### Import skills from GitHub

When you find a repository you want to use, paste its GitHub URL, preview the source, and choose an import mode. Imported skills form a project group so you can browse, organize, and select them together. This recording shows the import of `obsidian-skills` and its resulting group of six skills.

![Paste the obsidian-skills repository URL, preview and import it, then open the project group containing six skills](docs/media/github-import.gif)

### Switch interface themes

Use the theme buttons in the upper-right corner to change the interface colors directly. There are six themes, including Morandi, earth tones, dark neon, and a retro Famicom palette. Pick whichever you find comfortable to look at.

![Use the theme buttons in the upper-right corner to switch the same skill management page between color palettes](docs/media/themes.gif)

<a id="start"></a>

## 🚀 Download & Usage

The current version is **1.2.3**, for **Windows x64**.

1. **[Download the Windows installer](https://github.com/Lucian-D-W/skills-on-off/releases/download/v1.2.3/skills-on-off-Setup-1.2.3-x64.exe).** The file is named `skills-on-off-Setup-1.2.3-x64.exe`; the [portable edition and full release files](https://github.com/Lucian-D-W/skills-on-off/releases/tag/v1.2.3) are on the same release page.
2. **Install and open the app.** Run the installer, then open skills on-off. No development tools are needed for everyday use.
3. **Set the source and target.** The source directory holds your collected skills; the target is the directory your agent actually reads for skills.
4. **Choose the skills for this task.** Enable the skills you need in the list or a function group, then check the enabled view.

Closing the window minimizes the app to the system tray. Use the tray menu to quit completely. Developers can find the source build steps in the [build guide](docs/BUILDING.md).

<a id="why"></a>

## 💡 Motivation & Related Research

**References**

**1. SkillsBench: Benchmarking How Well Agent Skills Work Across Diverse Tasks**  
Li et al., 2026, arXiv:2602.12670, v4. [Full paper](https://arxiv.org/html/2602.12670v4). The study finds that curated skills can help, with results varying across tasks, models, and agent harnesses. Its analysis of skill quantity and complexity finds that focused skills with at most three modules outperform larger or exhaustive bundles.

**2. How Well Do Agentic Skills Work in the Wild: Benchmarking LLM Skill Usage in Realistic Settings**  
Liu et al., 2026, arXiv:2604.04323, v1. [Full paper](https://arxiv.org/html/2604.04323v1). As skill selection, retrieval, and adaptation become more realistic, performance gains diminish. When the initial skills have reasonable relevance and quality, refinement for the current task can recover some of those gains.

**3. Choice Overload: A Conceptual Review and Meta-Analysis**  
Chernev, Böckenholt, and Goodman, 2015, Journal of Consumer Psychology, 25(2), 333–358. [Original article](https://doi.org/10.1016/j.jcps.2014.08.002). This review and meta-analysis of human choice behavior identifies choice-set complexity, decision difficulty, preference uncertainty, and decision goals as factors that shape choice overload.

**Design references and application**

What interests me is how to use the right few skills for the task in front of me after collecting so many. I chose to let the user decide which skills to make available, making the switches central to the app. The first two papers help me understand that choice: after a skill has been collected, its relevance to the task and how it is selected and adapted still affect how useful it can be.

I also need a large skill collection to be easy to organize. I keep both project groups and function categories: one shows where a skill came from, while the other matches the question, “What am I trying to do now?” Research on choice overload helps me understand the work of organizing and choosing among all those skills.

<a id="credits"></a>

## 🙏 Acknowledgments & License

Thanks to Electron, React, better-sqlite3, extract-zip, and the other projects that support desktop operation, the interface, local records, and repository imports. Thanks also to the authors who share their skills and research. Component and font attribution and licenses are listed in the [third-party notices](THIRD_PARTY_NOTICES.md).

Copyright © 2026 **Lucian W. (lucian-d-w)**. The application's original code and the author's original icon are licensed under **[GPL-3.0-only](LICENSE)**; see the [copyright statement](COPYRIGHT.md) for scope. Imported Skills retain their own licenses.
