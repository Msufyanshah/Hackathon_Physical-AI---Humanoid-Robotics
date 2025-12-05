Project: AI/Spec-Driven Course on Physical AI & Humanoid Robotics [for Teaching] using Docusaurus and Spec-Kit Plus

Core principles (expanded):

Spec-First Pedagogy
Every module, lesson, exercise, assessment, and interactive element must stem from a detailed specification in Spec-Kit Plus prior to content creation or implementation. No ad-hoc or unspecified teaching materials are permitted to ensure structured, intentional course design.
AI-Augmented, Educator-Led Development
Claude Code (or approved LLM tools) serves as the main content generator for drafts, simulations, and code examples, but all outputs require thorough review, refinement, and explicit approval by the human educator. The educator holds ultimate accountability for accuracy, relevance, and educational value.
Reproducibility & Verifiability
All course content, including explanations, diagrams, code demos, and robotic simulations, must be traceable to:
A Spec-Kit Plus entry (with spec ID)
An LLM prompt record (hash or Git-linked)
Peer-reviewed sources or industry standards (cited appropriately)
This allows for full course replication and validation by other instructors or learners.
Modular & Progressive Delivery
The course is constructed in bite-sized, independent units (e.g., one Markdown file per lesson or module) that build progressively from basics to advanced topics. Each commit must keep the Docusaurus site deployable, enabling incremental access for learners.
Consistency in Educational Standards
Terminology, notation, teaching tone, and assessment criteria are centrally defined in the constitution and enforced uniformly. Updates to these require formal constitution amendments to maintain coherence across the course.
Inclusive Accessibility by Design
Content adheres to WCAG 2.1 AA standards from inception, including alt text for visuals (e.g., robot diagrams), captioning for videos/simulations, semantic headings, and adaptable formats for diverse learners, ensuring broad accessibility in teaching environments.
Collaborative & Evolving Curriculum
The development process (specs, prompts, revisions, deployments) is openly hosted on GitHub, promoting community contributions. The course is treated as an evergreen resource, with mechanisms for ongoing updates based on learner feedback and technological advancements in physical AI.
Zero Compromise on Quality & Integrity
Any issues like inaccurate robotics facts, broken code simulations, failing accessibility checks, or unresolved specs halt further development. Automated CI/CD pipelines must achieve 100% pass rates before merging new content.
Key standards:

All content drafts generated or iterated via Claude Code, with human oversight
Markdown/MDX formatting aligned with Docusaurus v3 for optimal rendering and interactivity
Version control: Git commits with descriptive messages referencing spec IDs and educational objectives
Deployment: Automated to GitHub Pages upon main branch pushes, with live previews for teaching demos
Quality assurance: Linting for Markdown, link validation, accessibility scanning, Spec-Kit Plus compliance checks, and technical accuracy reviews for AI/robotics content
Citation practices: APA style for academic sources; inline links for web/industry resources; priority to peer-reviewed papers (e.g., IEEE, ACM) and official docs (e.g., ROS, OpenAI Gym)
Pedagogical elements: Each module includes learning outcomes, real-world examples, hands-on exercises (e.g., robot simulations), quizzes, and references to physical AI tools/hardware
Structural Requirements:
The course must include at minimum:

Introduction to Physical AI & Humanoid Robotics Fundamentals
Spec-Driven Development for Robotics Projects
Integrating AI with Physical Systems (e.g., Sensors, Actuators)
Humanoid Robot Design & Kinematics
AI Algorithms for Robotics (e.g., Path Planning, Learning from Demonstration)
Simulation & Testing with Tools like Gazebo or Webots
Ethical Considerations & Real-World Applications
Capstone Project: Building a Simple Humanoid Prototype (Virtual/Physical)
Resources, Glossary, & Advanced Topics
Each module must:

Begin with clear learning objectives and prerequisites
Incorporate multimedia (diagrams, code snippets, embedded simulations where possible)
End with a summary, self-assessment questions and extension activities
Feature at least one reproducible exercise or lab (e.g., Python-based robot control script)
Constraints:

Technology stack: Docusaurus for course site; no external CMS; optional React for interactive components (e.g., robot visualizers)
Primary tools: Spec-Kit Plus for planning/approvals, Claude Code for content generation, GitHub for hosting/collaboration
Conntect Context7 then form context7 connect mcp Docursaurus, then conncet github mcp from context7
Content location: Modules as Markdown/MDX files under /docs, with assets in /static
Minimum modules: 8 (as outlined); expandable via spec backlog
Media: Use open-source or AI-generated images/videos with attributions; avoid proprietary dependencies
Length: 10,000–20,000 words total; each module 1,000–2,500 words
Plagiarism: Zero tolerance; all ideas rephrased and cited
Success criteria:

Flawless deployment to GitHub Pages with no build errors or broken elements
100% traceability of content to approved specs in Spec-Kit Plus
Continuous passing of all automated CI checks (linting, links, accessibility, etc.)
WCAG 2.1 AA validation confirmed by tools like WAVE or Lighthouse
Intuitive navigation, search functionality, and responsive design operational
Demonstrated full course regeneration from specs, with all exercises testable in a standard environment (e.g., Python 3+ with robotics libraries)
Positive validation through simulated teaching scenarios or peer reviews, confirming educational effectiveness and technical accuracy