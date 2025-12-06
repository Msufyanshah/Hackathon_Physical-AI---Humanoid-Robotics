import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: '00 - Introduction',
      link: {type: 'doc', id: '00-introduction/intro'}, // Link to the intro page itself
      collapsible: true,
      collapsed: false, // Keep Introduction open by default
      items: [
        '00-introduction/intro',
        '00-introduction/syllabus',
        '00-introduction/hardware-requirements',
        '00-introduction/installation-guide',
      ],
    },
    {
      type: 'category',
      label: '01 - Foundations',
      collapsible: true,
      collapsed: true,
      items: [
        '01-foundations/01-what-is-physical-ai',
        '01-foundations/02-embodied-intelligence',
        '01-foundations/03-history-and-landscape',
      ],
    },
    {
      type: 'category',
      label: '02 - ROS 2 Nervous System',
      collapsible: true,
      collapsed: true,
      items: [
        '02-ros2-nervous-system/01-ros2-concepts',
        '02-ros2-nervous-system/02-first-nodes',
        '02-ros2-nervous-system/03-services-actions',
        '02-ros2-nervous-system/04-launch-and-params',
      ],
    },
    {
      type: 'category',
      label: '03 - Robot Description',
      collapsible: true,
      collapsed: true,
      items: [
        '03-robot-description/01-urdf-xacro',
        '03-robot-description/02-humanoid-urdf',
        '03-robot-description/03-sdf-and-gazebo',
      ],
    },
    {
      type: 'category',
      label: '04 - Simulation',
      collapsible: true,
      collapsed: true,
      items: [
        '04-simulation/01-gazebo-classic',
        '04-simulation/02-ignition-harmonic',
        '04-simulation/03-isaac-sim-omniverse',
      ],
    },
    {
      type: 'category',
      label: '05 - Perception',
      collapsible: true,
      collapsed: true,
      items: [
        '05-perception/01-sensors-realsense',
        '05-perception/02-isaac-ros-visual-slam',
        '05-perception/03-3d-vision-fusion',
      ],
    },
    {
      type: 'category',
      label: '06 - Navigation Locomotion',
      collapsible: true,
      collapsed: true,
      items: [
        '06-navigation-locomotion/01-nav2-stack',
        '06-navigation-locomotion/02-bipedal-planning',
        '06-navigation-locomotion/03-balance-and-recovery',
      ],
    },
    {
      type: 'category',
      label: '07 - Vision Language Action',
      collapsible: true,
      collapsed: true,
      items: [
        '07-vision-language-action/01-vla-overview',
        '07-vision-language-action/02-llm-to-ros-bridge',
        '07-vision-language-action/03-conversational-robotics',
      ],
    },
    {
      type: 'category',
      label: '08 - Capstone',
      collapsible: true,
      collapsed: true,
      items: [
        '08-capstone/01-project-overview',
        '08-capstone/02-milestones',
        '08-capstone/03-final-demo',
      ],
    },
    {
      type: 'category',
      label: '09 - Appendix',
      collapsible: true,
      collapsed: true,
      items: [
        '09-appendix/hardware-kits',
        '09-appendix/sim-to-real-cookbook',
        '09-appendix/troubleshooting',
        '09-appendix/glossary',
      ],
    },
    // Additional pages
    'community',
    'instructors',
    'faq',
  ],
};

export default sidebars;