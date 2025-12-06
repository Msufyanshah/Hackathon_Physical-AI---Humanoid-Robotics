import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '../components/HomepageFeatures';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.robotAnimation}>
          {/* Placeholder for Lottie animation or GIF */}
          <img src="https://lottie.host/embed/41a1a511-d14f-4d37-9753-48b4884f67d3/H3L1JqE7hC.json" alt="Animated Humanoid Robot Placeholder" />
          {/* A more advanced implementation might use a React Lottie player component */}
        </div>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/intro">
            Quick Start - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

function CourseOverview() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Course Overview</h2>
        <p>This course provides a hands-on introduction to Physical AI and Humanoid Robotics, bridging the gap between digital intelligence and embodied physical systems. You will learn to integrate advanced AI algorithms with real-world robotic platforms, covering topics from ROS 2 fundamentals to complex navigation, perception, and vision-language-action models.</p>
      </div>
    </section>
  );
}

function LearningOutcomes() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Learning Outcomes</h2>
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Module</th>
                <th>Key Learning Outcomes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>00 - Introduction</td>
                <td>Understand course structure, hardware tiers, and set up the development environment.</td>
              </tr>
              <tr>
                <td>01 - Foundations</td>
                <td>Grasp core concepts of Physical AI and Embodied Intelligence.</td>
              </tr>
              <tr>
                <td>02 - ROS 2 Nervous System</td>
                <td>Master ROS 2 communication, nodes, topics, and services.</td>
              </tr>
              <tr>
                <td>03 - Robot Description</td>
                <td>Design and model humanoid robots using URDF/XACRO.</td>
              </tr>
              <tr>
                <td>04 - Simulation</td>
                <td>Utilize Gazebo, Ignition, and Isaac Sim for realistic robot simulation.</td>
              </tr>
              <tr>
                <td>05 - Perception</td>
                <td>Implement sensor fusion and 3D vision for environmental understanding.</td>
              </tr>
              <tr>
                <td>06 - Navigation Locomotion</td>
                <td>Develop bipedal planning and balance algorithms for robot movement.</td>
              </tr>
              <tr>
                <td>07 - Vision Language Action</td>
                <td>Integrate LLMs with robots for conversational AI and task execution.</td>
              </tr>
              <tr>
                <td>08 - Capstone</td>
                <td>Apply learned concepts to a final project, demonstrating a humanoid prototype.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function HardwareTiers() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Hardware Tiers</h2>
        <p>Choose the hardware tier that best suits your budget and learning goals. All tiers support the core curriculum, with higher tiers offering enhanced physical interaction opportunities.</p>
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Tier</th>
                <th>Description</th>
                <th>Estimated Cost</th>
                <th>Key Components / Links</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Simulation-Only</td>
                <td>Access to all software and simulation tools. Ideal for foundational learning and getting started without physical hardware.</td>
                <td>$0</td>
                <td>Software only (Ubuntu 22.04, ROS 2 Humble, Isaac Sim, Docker).</td>
              </tr>
              <tr>
                <td>Mid-Tier Kit</td>
                <td>Includes a powerful mini-PC for robotics development and a 3D camera for perception tasks.</td>
                <td>~$700</td>
                <td>NVIDIA Jetson Orin Nano Developer Kit, RealSense D435i Camera. [Links to be added]</td>
              </tr>
              <tr>
                <td>Full Lab Setup</td>
                <td>For advanced students or research labs. Includes a high-fidelity humanoid platform for real-world experimentation.</td>
                <td>~$15,000 - $30,000+</td>
                <td>Unitree G1 Humanoid Robot or similar platform. [Links to be added]</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.note}>Note: Hardware prices are estimates as of Dec 2025 and are subject to change. Specific purchase links will be provided in the `hardware-requirements.md` documentation.</p>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <CourseOverview />
        <LearningOutcomes />
        <HardwareTiers />
        {/* <HomepageFeatures /> */}
      </main>
    </Layout>
  );
}
