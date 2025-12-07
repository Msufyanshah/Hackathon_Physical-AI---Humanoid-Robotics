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
      link: {type: 'doc', id: 'introduction/intro'}, // Link to the intro page itself
      collapsible: true,
      collapsed: false, // Keep Introduction open by default
      items: [
        'introduction/intro',
        'introduction/syllabus',
        'introduction/hardware-requirements',
        'introduction/installation-guide',
      ],
    },
    {
      type: 'category',
      label: '01 - Foundations',
      collapsible: true,
      collapsed: true,
      items: [
        'foundations/what-is-physical-ai',
        'foundations/embodied-intelligence',
        'foundations/history-and-landscape',
      ],
    },
    {
      type: 'category',
      label: '02 - ROS 2 Nervous System',
      collapsible: true,
      collapsed: true,
      items: [
        'ros2-nervous-system/ros2-concepts',
        'ros2-nervous-system/first-nodes',
        'ros2-nervous-system/services-actions',
        'ros2-nervous-system/launch-and-params',
      ],
    },
    {
      type: 'category',
      label: '03 - Robot Description',
      collapsible: true,
      collapsed: true,
      items: [
        'robot-description/urdf-xacro',
        'robot-description/humanoid-urdf',
        'robot-description/sdf-and-gazebo',
      ],
    },
    {
      type: 'category',
      label: '04 - Simulation',
      collapsible: true,
      collapsed: true,
      items: [
        'simulation/gazebo-classic',
        'simulation/ignition-harmonic',
        'simulation/isaac-sim-omniverse',
      ],
    },
    {
      type: 'category',
      label: '05 - Perception',
      collapsible: true,
      collapsed: true,
      items: [
        'perception/sensors-realsense',
        'perception/isaac-ros-visual-slam',
        'perception/03-3d-vision-fusion',
      ],
    },
    {
      type: 'category',
      label: '06 - Navigation Locomotion',
      collapsible: true,
      collapsed: true,
      items: [
        'navigation-locomotion/nav2-stack',
        'navigation-locomotion/bipedal-planning',
        'navigation-locomotion/balance-and-recovery',
      ],
    },
    {
      type: 'category',
      label: '07 - Vision Language Action',
      collapsible: true,
      collapsed: true,
      items: [
        'vision-language-action/vla-overview',
        'vision-language-action/llm-to-ros-bridge',
        'vision-language-action/conversational-robotics',
      ],
    },
    {
      type: 'category',
      label: '08 - Capstone',
      collapsible: true,
      collapsed: true,
      items: [
        'capstone/project-overview',
        'capstone/milestones',
        'capstone/final-demo',
      ],
    },
    {
      type: 'category',
      label: '09 - Appendix',
      collapsible: true,
      collapsed: true,
      items: [
        'appendix/hardware-kits',
        'appendix/sim-to-real-cookbook',
        'appendix/troubleshooting',
        'appendix/glossary',
      ],
    },
    // Additional pages
    'community',
    'instructors',
    'faq',
  ],
};

export default sidebars;