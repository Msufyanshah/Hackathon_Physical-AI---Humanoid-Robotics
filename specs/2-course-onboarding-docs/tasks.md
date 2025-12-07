# Tasks: 00-introduction – Course Onboarding Section

**Branch**: `feature/2-course-onboarding-docs` | **Plan**: [plan.md](./plan.md)

This task list is generated from the implementation plan and breaks down the work into executable steps.

## Phase 1: Setup, Research & Asset Collection

- [ ] T001 Research and confirm latest pricing and availability for all components in the Hardware Tiers (Unitree G1, Jetson Orin Nano, RealSense D435i).
- [ ] T002 Research and confirm latest pricing and performance for cloud fallback options (AWS g5, Paperspace, RunPod).
- [ ] T003 Find a suitable open-source Lottie animation for the humanoid robot hero section.
- [ ] T004 [P] Collect or generate open-source images for all key hardware components.

## Phase 2: Course Evaluation Content (User Story 2)

**Goal**: A prospective student can evaluate the course requirements, syllabus, and hardware costs.
**Independent Test**: A user can read the generated pages and articulate the course's weekly topics and the exact cost of each hardware tier.

- [ ] T005 [US2] Create the initial file `docs/00-introduction/intro.md`.
- [ ] T006 [US2] Write the "Welcome" and "Course Philosophy" sections in `docs/00-introduction/intro.md`.
- [ ] T007 [US2] Create and embed the Lottie animation in the hero section of `docs/00-introduction/intro.md`.
- [ ] T008 [US2] Create the "Learning Outcomes" table in `docs/00-introduction/intro.md`.
- [ ] T009 [US2] Create the initial file `docs/00-introduction/syllabus.md`.
- [ ] T010 [US2] Write the detailed weekly schedule and project milestones in `docs/00-introduction/syllabus.md`.
- [ ] T011 [US2] Create the initial file `docs/00-introduction/hardware-requirements.md`.
- [ ] T012 [P] [US2] Create the detailed comparison tables for the three hardware tiers in `docs/00-introduction/hardware-requirements.md`.
- [ ] T013 [P] [US2] Create the cost and performance comparison table for cloud providers in `docs/00-introduction/hardware-requirements.md`.
- [ ] T014 [US2] Add citations for all research in APA style to the relevant pages.

## Phase 3: Environment Setup Guide (User Story 1)

**Goal**: A new student can set up their complete development environment in under 30 minutes.
**Independent Test**: A user can run the final verification script and see a success message.

- [ ] T015 [US1] Create the initial file `docs/00-introduction/installation-guide.md`.
- [ ] T016 [US1] Write the "Prerequisites" section, including the decision documentation for Ubuntu 22.04 vs 24.04 in `docs/00-introduction/installation-guide.md`.
- [ ] T017 [US1] Document the step-by-step process for setting the locale and sources for ROS 2 Humble in `docs/00-introduction/installation-guide.md`.
- [ ] T018 [US1] Document the `apt install` commands for ROS 2 Humble and how to source the setup script in `docs/00-introduction/installation-guide.md`.
- [ ] T019 [US1] Document the "Quick Install" process for NVIDIA Isaac Sim, including system requirements, download, and post-installation steps in `docs/00-introduction/installation-guide.md`.
- [ ] T020 [US1] Document the decision for Native vs. Docker install, providing the main native path and an optional Docker section in `docs/00-introduction/installation-guide.md`.
- [ ] T021 [US1] Create the final verification script that checks all key components (ROS 2, Isaac Sim).
- [ ] T022 [US1] Embed the verification script and its expected output in `docs/00-introduction/installation-guide.md`.

## Phase 4: Polish & Validation

- [ ] T023 Review all four documents for clarity, consistency, and grammatical errors.
- [ ] T024 [P] Manually test every terminal command in `docs/00-introduction/installation-guide.md` on a clean Ubuntu 22.04 environment.
- [ ] T025 [P] Run a Lighthouse accessibility check on the rendered Docusaurus pages to ensure a score of ≥ 95.
- [ ] T026 [P] Test the mobile view of the site, ensuring the sidebar and content render correctly.
- [ ] T027 Verify that the Docusaurus project builds successfully with zero errors or warnings using `npm run build`.

## Dependencies

- **User Story 1** is dependent on **User Story 2** only in that the hardware requirements should be understood before installation. For implementation, they can be done in parallel, but the task list prioritizes the evaluative content first.
- **Phase 4** is dependent on the completion of all other phases.
