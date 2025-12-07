# Implementation Plan: 00-introduction – Technical Execution Plan

**Branch**: `feature/2-course-onboarding-docs` | **Date**: 2025-12-05 | **Spec**: [spec.md](./spec.md)
**Input**: User description: "/sp.plan 00-introduction – Technical Execution Plan"

### 1. Architecture Sketch

- **Final Folder & File Tree**:
  ```text
  website/
  └── docs/
      └── 00-introduction/
          ├── intro.md
          ├── syllabus.md
          ├── hardware-requirements.md
          └── installation-guide.md
  ```
- **Docusaurus Frontmatter Template**: A consistent frontmatter will be used for all docs to ensure proper metadata and sidebar labeling.
  ```yaml
  ---
  sidebar_position: [number]
  title: '[Page Title]'
  ---
  ```
- **Asset Strategy**:
  - **Hero**: An open-source Lottie animation of a humanoid robot will be embedded in `intro.md`.
  - **Diagrams**: All diagrams (e.g., system architecture in the installation guide) will use Mermaid.js.
  - **Images**: Static images for hardware components will be sourced (with attribution) or AI-generated and stored in `website/static/img/`.

### 2. Section Structure & Word Allocation

- **`intro.md`**: ~1,200 words (Welcome, course philosophy, learning outcomes table, hero animation)
- **`syllabus.md`**: ~800 words (Detailed weekly breakdown, project milestones)
- **`hardware-requirements.md`**: ~1,200 words (Detailed tables for three tiers, images, purchase links)
- **`installation-guide.md`**: ~1,500 words (Step-by-step commands, screenshots, verification steps)

### 3. Research Approach

- **Method**: Research will be conducted concurrently with writing ("Research-concurrent").
- **Required Sources**:
  - Official ROS 2 Humble Documentation
  - NVIDIA Isaac Sim 2024.2 Installation Guide
  - Unitree G1 / Jetson Orin Nano pricing and availability (as of Dec 2025)
  - RealSense D435i setup and troubleshooting guides
- **Citations**: All external sources will be cited in APA style in a "References" section at the end of the relevant page.

### 4. Decisions Needing Documentation

- **Docker vs. Native Install**: The guide will primarily focus on a native install on Ubuntu 22.04 for performance. A section will be included discussing the trade-offs and providing an optional, community-supported Docker setup.
- **Ubuntu 22.04 vs. 24.04**: The decision is to standardize on **Ubuntu 22.04 LTS** due to its long-term support and maximum compatibility with the required robotics software (ROS 2 Humble, NVIDIA drivers).
- **Cloud Fallback**: A section in `hardware-requirements.md` will provide a cost and performance comparison table for cloud-based development environments (AWS EC2 G5, Paperspace, RunPod) for students without compatible local hardware.

### 5. Testing & Quality Validation Strategy

- **Command Blocks**: Every terminal command will be in a ` ```bash ` block and will be followed by an "Expected Output" or a verification command to confirm success.
- **Verification Script**: A final Bash script will be provided in `installation-guide.md` that checks for correct versions of key software and confirms ROS 2 nodes can communicate. It will output "✅ All systems ready!" on success.
- **Accessibility**: Run Lighthouse checks on the deployed pages to ensure a score of ≥ 95.
- **Responsiveness**: Manually test the mobile view, specifically ensuring the sidebar functions correctly.
- **Build Integrity**: The final content must pass `npm run build` with zero errors or warnings.

### 6. Phases & Timeline (single implementation)

- **Phase 1**: Research & Asset Collection (Gather hardware prices/links, find hero Lottie animation).
- **Phase 2**: Write `intro.md` and `syllabus.md`.
- **Phase 3**: Write `hardware-requirements.md`, including the hardware and cloud provider tables.
- **Phase 4**: Write `installation-guide.md`, meticulously testing every command and creating the verification script.
- **Phase 5**: Final review of all four documents, run Lighthouse tests, and validate the build.