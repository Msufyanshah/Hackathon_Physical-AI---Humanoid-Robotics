---
sidebar_position: 2
title: 'Humanoid URDF'
---

# Creating Humanoid Robot Models: Advanced URDF Techniques

## Introduction to Humanoid Robot Modeling

Humanoid robots represent one of the most complex challenges in Physical AI, requiring precise modeling of human-like kinematics, dynamics, and sensor configurations. Creating accurate URDF models for humanoid robots demands understanding of human biomechanics, careful attention to joint limits, and realistic mass distribution.

This chapter explores advanced URDF techniques specifically for humanoid robot modeling, covering everything from basic bipedal structure to complex multi-fingered hands with tactile sensors.

## Anatomy of a Humanoid Robot

### Key Components of Humanoid Design

A typical humanoid robot consists of:
- **Torso**: Central body with head, arms, and legs attached
- **Head**: With cameras, microphones, and display capabilities
- **Arms**: Shoulders, elbows, wrists, and hands with multiple degrees of freedom
- **Legs**: Hips, knees, ankles, and feet for locomotion
- **Actuators**: High-torque servos or motors for each joint
- **Sensors**: IMUs, cameras, force/torque sensors, tactile sensors

### Humanoid Kinematic Chains

Humanoid robots typically have multiple kinematic chains:
- **Left arm chain**: Torso → shoulder → elbow → wrist → hand
- **Right arm chain**: Torso → shoulder → elbow → wrist → hand
- **Left leg chain**: Torso → hip → knee → ankle → foot
- **Right leg chain**: Torso → hip → knee → ankle → foot
- **Head chain**: Torso → neck → head

## Advanced URDF for Humanoid Robots

### Complete Humanoid Robot URDF Example

Here's a comprehensive example of a humanoid robot model:

```xml
<?xml version="1.0"?>
<robot name="humanoid_robot" xmlns:xacro="http://www.ros.org/wiki/xacro">
  <!-- Include standard properties -->
  <xacro:property name="M_PI" value="3.1415926535897931" />
  <xacro:property name="HUMANOID_HEIGHT" value="1.6" />
  <xacro:property name="HUMANOID_MASS" value="60.0" />

  <!-- Materials -->
  <material name="white">
    <color rgba="1 1 1 1" />
  </material>
  <material name="black">
    <color rgba="0 0 0 1" />
  </material>
  <material name="gray">
    <color rgba="0.5 0.5 0.5 1" />
  </material>
  <material name="blue">
    <color rgba="0.2 0.2 1.0 1" />
  </material>

  <!-- Torso -->
  <link name="torso">
    <visual>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <box size="0.3 0.4 0.8" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <box size="0.3 0.4 0.8" />
      </geometry>
    </collision>
    <inertial>
      <mass value="10.0" />
      <origin xyz="0 0 0.1" />
      <inertia ixx="0.3" ixy="0.0" ixz="0.0" iyy="0.25" iyz="0.0" izz="0.1" />
    </inertial>
  </link>

  <!-- Head -->
  <link name="head">
    <visual>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <sphere radius="0.15" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <sphere radius="0.15" />
      </geometry>
    </collision>
    <inertial>
      <mass value="2.0" />
      <origin xyz="0 0 0" />
      <inertia ixx="0.015" ixy="0.0" ixz="0.0" iyy="0.015" iyz="0.0" izz="0.015" />
    </inertial>
  </link>

  <joint name="neck_joint" type="revolute">
    <parent link="torso" />
    <child link="head" />
    <origin xyz="0 0 0.6" rpy="0 0 0" />
    <axis xyz="0 1 0" />
    <limit lower="${-M_PI/3}" upper="${M_PI/3}" effort="50" velocity="2" />
    <dynamics damping="0.5" friction="0.1" />
  </joint>

  <!-- Cameras and sensors in head -->
  <link name="camera_rgb_optical_frame" />

  <joint name="camera_rgb_optical_joint" type="fixed">
    <parent link="head" />
    <child link="camera_rgb_optical_frame" />
    <origin xyz="0.05 0 0" rpy="${-M_PI/2} 0 ${-M_PI/2}" />
  </joint>

  <!-- Left Shoulder -->
  <link name="left_shoulder">
    <visual>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.05" length="0.15" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.05" length="0.15" />
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0" />
      <origin xyz="0 0 0" />
      <inertia ixx="0.002" ixy="0.0" ixz="0.0" iyy="0.002" iyz="0.0" izz="0.001" />
    </inertial>
  </link>

  <joint name="left_shoulder_yaw" type="revolute">
    <parent link="torso" />
    <child link="left_shoulder" />
    <origin xyz="0.15 0.15 0.3" rpy="0 0 0" />
    <axis xyz="0 0 1" />
    <limit lower="${-M_PI/2}" upper="${M_PI/2}" effort="50" velocity="2" />
    <dynamics damping="0.5" friction="0.1" />
  </joint>

  <!-- Left Upper Arm -->
  <link name="left_upper_arm">
    <visual>
      <origin xyz="0 0 -0.15" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.04" length="0.3" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 -0.15" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.04" length="0.3" />
      </geometry>
    </collision>
    <inertial>
      <mass value="1.5" />
      <origin xyz="0 0 -0.15" />
      <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.002" />
    </inertial>
  </link>

  <joint name="left_shoulder_pitch" type="revolute">
    <parent link="left_shoulder" />
    <child link="left_upper_arm" />
    <origin xyz="0 0 0" rpy="0 0 0" />
    <axis xyz="0 1 0" />
    <limit lower="${-M_PI}" upper="${M_PI/2}" effort="50" velocity="2" />
    <dynamics damping="0.5" friction="0.1" />
  </joint>

  <!-- Left Elbow -->
  <link name="left_lower_arm">
    <visual>
      <origin xyz="0 0 -0.15" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.03" length="0.3" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 -0.15" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.03" length="0.3" />
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0" />
      <origin xyz="0 0 -0.15" />
      <inertia ixx="0.007" ixy="0.0" ixz="0.0" iyy="0.007" iyz="0.0" izz="0.001" />
    </inertial>
  </link>

  <joint name="left_elbow" type="revolute">
    <parent link="left_upper_arm" />
    <child link="left_lower_arm" />
    <origin xyz="0 0 -0.3" rpy="0 0 0" />
    <axis xyz="0 1 0" />
    <limit lower="0" upper="${M_PI-0.1}" effort="50" velocity="2" />
    <dynamics damping="0.5" friction="0.1" />
  </joint>

  <!-- Left Wrist -->
  <link name="left_wrist">
    <visual>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.03" length="0.05" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.03" length="0.05" />
      </geometry>
    </collision>
    <inertial>
      <mass value="0.2" />
      <origin xyz="0 0 0" />
      <inertia ixx="0.0002" ixy="0.0" ixz="0.0" iyy="0.0002" iyz="0.0" izz="0.0001" />
    </inertial>
  </link>

  <joint name="left_wrist_yaw" type="revolute">
    <parent link="left_lower_arm" />
    <child link="left_wrist" />
    <origin xyz="0 0 -0.3" rpy="0 0 0" />
    <axis xyz="0 0 1" />
    <limit lower="${-M_PI/2}" upper="${M_PI/2}" effort="30" velocity="2" />
    <dynamics damping="0.2" friction="0.05" />
  </joint>

  <!-- Left Hand -->
  <link name="left_hand">
    <visual>
      <origin xyz="0 0 -0.05" rpy="0 0 0" />
      <geometry>
        <box size="0.12 0.08 0.1" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 -0.05" rpy="0 0 0" />
      <geometry>
        <box size="0.12 0.08 0.1" />
      </geometry>
    </collision>
    <inertial>
      <mass value="0.3" />
      <origin xyz="0 0 -0.05" />
      <inertia ixx="0.0005" ixy="0.0" ixz="0.0" iyy="0.0007" iyz="0.0" izz="0.0004" />
    </inertial>
  </link>

  <joint name="left_wrist_pitch" type="revolute">
    <parent link="left_wrist" />
    <child link="left_hand" />
    <origin xyz="0 0 -0.05" rpy="0 0 0" />
    <axis xyz="0 1 0" />
    <limit lower="${-M_PI/4}" upper="${M_PI/4}" effort="10" velocity="1" />
    <dynamics damping="0.1" friction="0.02" />
  </joint>

  <!-- Right Arm Mirror of Left Arm -->
  <link name="right_shoulder">
    <visual>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.05" length="0.15" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.05" length="0.15" />
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0" />
      <origin xyz="0 0 0" />
      <inertia ixx="0.002" ixy="0.0" ixz="0.0" iyy="0.002" iyz="0.0" izz="0.001" />
    </inertial>
  </link>

  <joint name="right_shoulder_yaw" type="revolute">
    <parent link="torso" />
    <child link="right_shoulder" />
    <origin xyz="0.15 -0.15 0.3" rpy="0 0 0" />
    <axis xyz="0 0 1" />
    <limit lower="${-M_PI/2}" upper="${M_PI/2}" effort="50" velocity="2" />
    <dynamics damping="0.5" friction="0.1" />
  </joint>

  <link name="right_upper_arm">
    <visual>
      <origin xyz="0 0 -0.15" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.04" length="0.3" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 -0.15" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.04" length="0.3" />
      </geometry>
    </collision>
    <inertial>
      <mass value="1.5" />
      <origin xyz="0 0 -0.15" />
      <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.002" />
    </inertial>
  </link>

  <joint name="right_shoulder_pitch" type="revolute">
    <parent link="right_shoulder" />
    <child link="right_upper_arm" />
    <origin xyz="0 0 0" rpy="0 0 0" />
    <axis xyz="0 1 0" />
    <limit lower="${-M_PI/2}" upper="${M_PI}" effort="50" velocity="2" />
    <dynamics damping="0.5" friction="0.1" />
  </joint>

  <link name="right_lower_arm">
    <visual>
      <origin xyz="0 0 -0.15" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.03" length="0.3" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 -0.15" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.03" length="0.3" />
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0" />
      <origin xyz="0 0 -0.15" />
      <inertia ixx="0.007" ixy="0.0" ixz="0.0" iyy="0.007" iyz="0.0" izz="0.001" />
    </inertial>
  </link>

  <joint name="right_elbow" type="revolute">
    <parent link="right_upper_arm" />
    <child link="right_lower_arm" />
    <origin xyz="0 0 -0.3" rpy="0 0 0" />
    <axis xyz="0 1 0" />
    <limit lower="0" upper="${M_PI-0.1}" effort="50" velocity="2" />
    <dynamics damping="0.5" friction="0.1" />
  </joint>

  <link name="right_wrist">
    <visual>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.03" length="0.05" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.03" length="0.05" />
      </geometry>
    </collision>
    <inertial>
      <mass value="0.2" />
      <origin xyz="0 0 0" />
      <inertia ixx="0.0002" ixy="0.0" ixz="0.0" iyy="0.0002" iyz="0.0" izz="0.0001" />
    </inertial>
  </link>

  <joint name="right_wrist_yaw" type="revolute">
    <parent link="right_lower_arm" />
    <child link="right_wrist" />
    <origin xyz="0 0 -0.3" rpy="0 0 0" />
    <axis xyz="0 0 1" />
    <limit lower="${-M_PI/2}" upper="${M_PI/2}" effort="30" velocity="2" />
    <dynamics damping="0.2" friction="0.05" />
  </joint>

  <link name="right_hand">
    <visual>
      <origin xyz="0 0 -0.05" rpy="0 0 0" />
      <geometry>
        <box size="0.12 0.08 0.1" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 -0.05" rpy="0 0 0" />
      <geometry>
        <box size="0.12 0.08 0.1" />
      </geometry>
    </collision>
    <inertial>
      <mass value="0.3" />
      <origin xyz="0 0 -0.05" />
      <inertia ixx="0.0005" ixy="0.0" ixz="0.0" iyy="0.0007" iyz="0.0" izz="0.0004" />
    </inertial>
  </link>

  <joint name="right_wrist_pitch" type="revolute">
    <parent link="right_wrist" />
    <child link="right_hand" />
    <origin xyz="0 0 -0.05" rpy="0 0 0" />
    <axis xyz="0 1 0" />
    <limit lower="${-M_PI/4}" upper="${M_PI/4}" effort="10" velocity="1" />
    <dynamics damping="0.1" friction="0.02" />
  </joint>

  <!-- Left Hip -->
  <link name="left_hip">
    <visual>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.06" length="0.15" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.06" length="0.15" />
      </geometry>
    </collision>
    <inertial>
      <mass value="1.5" />
      <origin xyz="0 0 0" />
      <inertia ixx="0.005" ixy="0.0" ixz="0.0" iyy="0.005" iyz="0.0" izz="0.003" />
    </inertial>
  </link>

  <joint name="left_hip_yaw" type="revolute">
    <parent link="torso" />
    <child link="left_hip" />
    <origin xyz="-0.1 0.1 -0.2" rpy="0 0 0" />
    <axis xyz="0 0 1" />
    <limit lower="${-M_PI/4}" upper="${M_PI/4}" effort="100" velocity="1" />
    <dynamics damping="1.0" friction="0.2" />
  </joint>

  <!-- Left Upper Leg -->
  <link name="left_upper_leg">
    <visual>
      <origin xyz="0 0 -0.3" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.05" length="0.6" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 -0.3" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.05" length="0.6" />
      </geometry>
    </collision>
    <inertial>
      <mass value="3.0" />
      <origin xyz="0 0 -0.3" />
      <inertia ixx="0.1" ixy="0.0" ixz="0.0" iyy="0.1" iyz="0.0" izz="0.01" />
    </inertial>
  </link>

  <joint name="left_hip_pitch" type="revolute">
    <parent link="left_hip" />
    <child link="left_upper_leg" />
    <origin xyz="0 0 0" rpy="0 0 0" />
    <axis xyz="0 1 0" />
    <limit lower="${-M_PI/2}" upper="0" effort="100" velocity="1" />
    <dynamics damping="1.0" friction="0.2" />
  </joint>

  <!-- Left Lower Leg -->
  <link name="left_lower_leg">
    <visual>
      <origin xyz="0 0 -0.3" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.04" length="0.6" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 -0.3" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.04" length="0.6" />
      </geometry>
    </collision>
    <inertial>
      <mass value="2.5" />
      <origin xyz="0 0 -0.3" />
      <inertia ixx="0.08" ixy="0.0" ixz="0.0" iyy="0.08" iyz="0.0" izz="0.008" />
    </inertial>
  </link>

  <joint name="left_knee" type="revolute">
    <parent link="left_upper_leg" />
    <child link="left_lower_leg" />
    <origin xyz="0 0 -0.6" rpy="0 0 0" />
    <axis xyz="0 1 0" />
    <limit lower="0" upper="${M_PI-0.1}" effort="100" velocity="1" />
    <dynamics damping="1.0" friction="0.2" />
  </joint>

  <!-- Left Ankle -->
  <link name="left_ankle">
    <visual>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.04" length="0.05" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.04" length="0.05" />
      </geometry>
    </collision>
    <inertial>
      <mass value="0.5" />
      <origin xyz="0 0 0" />
      <inertia ixx="0.001" ixy="0.0" ixz="0.0" iyy="0.001" iyz="0.0" izz="0.0005" />
    </inertial>
  </link>

  <joint name="left_ankle_pitch" type="revolute">
    <parent link="left_lower_leg" />
    <child link="left_ankle" />
    <origin xyz="0 0 -0.6" rpy="0 0 0" />
    <axis xyz="0 1 0" />
    <limit lower="${-M_PI/4}" upper="${M_PI/4}" effort="50" velocity="1" />
    <dynamics damping="0.5" friction="0.1" />
  </joint>

  <!-- Left Foot -->
  <link name="left_foot">
    <visual>
      <origin xyz="0 0 -0.05" rpy="0 0 0" />
      <geometry>
        <box size="0.2 0.1 0.1" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 -0.05" rpy="0 0 0" />
      <geometry>
        <box size="0.2 0.1 0.1" />
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0" />
      <origin xyz="0 0 -0.05" />
      <inertia ixx="0.005" ixy="0.0" ixz="0.0" iyy="0.015" iyz="0.0" izz="0.012" />
    </inertial>
  </link>

  <joint name="left_ankle_roll" type="revolute">
    <parent link="left_ankle" />
    <child link="left_foot" />
    <origin xyz="0 0 -0.05" rpy="0 0 0" />
    <axis xyz="1 0 0" />
    <limit lower="${-M_PI/6}" upper="${M_PI/6}" effort="50" velocity="1" />
    <dynamics damping="0.5" friction="0.1" />
  </joint>

  <!-- Right Leg Mirror of Left Leg -->
  <link name="right_hip">
    <visual>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.06" length="0.15" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.06" length="0.15" />
      </geometry>
    </collision>
    <inertial>
      <mass value="1.5" />
      <origin xyz="0 0 0" />
      <inertia ixx="0.005" ixy="0.0" ixz="0.0" iyy="0.005" iyz="0.0" izz="0.003" />
    </inertial>
  </link>

  <joint name="right_hip_yaw" type="revolute">
    <parent link="torso" />
    <child link="right_hip" />
    <origin xyz="-0.1 -0.1 -0.2" rpy="0 0 0" />
    <axis xyz="0 0 1" />
    <limit lower="${-M_PI/4}" upper="${M_PI/4}" effort="100" velocity="1" />
    <dynamics damping="1.0" friction="0.2" />
  </joint>

  <link name="right_upper_leg">
    <visual>
      <origin xyz="0 0 -0.3" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.05" length="0.6" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 -0.3" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.05" length="0.6" />
      </geometry>
    </collision>
    <inertial>
      <mass value="3.0" />
      <origin xyz="0 0 -0.3" />
      <inertia ixx="0.1" ixy="0.0" ixz="0.0" iyy="0.1" iyz="0.0" izz="0.01" />
    </inertial>
  </link>

  <joint name="right_hip_pitch" type="revolute">
    <parent link="right_hip" />
    <child link="right_upper_leg" />
    <origin xyz="0 0 0" rpy="0 0 0" />
    <axis xyz="0 1 0" />
    <limit lower="${-M_PI/2}" upper="0" effort="100" velocity="1" />
    <dynamics damping="1.0" friction="0.2" />
  </joint>

  <link name="right_lower_leg">
    <visual>
      <origin xyz="0 0 -0.3" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.04" length="0.6" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 -0.3" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.04" length="0.6" />
      </geometry>
    </collision>
    <inertial>
      <mass value="2.5" />
      <origin xyz="0 0 -0.3" />
      <inertia ixx="0.08" ixy="0.0" ixz="0.0" iyy="0.08" iyz="0.0" izz="0.008" />
    </inertial>
  </link>

  <joint name="right_knee" type="revolute">
    <parent link="right_upper_leg" />
    <child link="right_lower_leg" />
    <origin xyz="0 0 -0.6" rpy="0 0 0" />
    <axis xyz="0 1 0" />
    <limit lower="0" upper="${M_PI-0.1}" effort="100" velocity="1" />
    <dynamics damping="1.0" friction="0.2" />
  </joint>

  <link name="right_ankle">
    <visual>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.04" length="0.05" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="0 0 0" />
      <geometry>
        <cylinder radius="0.04" length="0.05" />
      </geometry>
    </collision>
    <inertial>
      <mass value="0.5" />
      <origin xyz="0 0 0" />
      <inertia ixx="0.001" ixy="0.0" ixz="0.0" iyy="0.001" iyz="0.0" izz="0.0005" />
    </inertial>
  </link>

  <joint name="right_ankle_pitch" type="revolute">
    <parent link="right_lower_leg" />
    <child link="right_ankle" />
    <origin xyz="0 0 -0.6" rpy="0 0 0" />
    <axis xyz="0 1 0" />
    <limit lower="${-M_PI/4}" upper="${M_PI/4}" effort="50" velocity="1" />
    <dynamics damping="0.5" friction="0.1" />
  </joint>

  <link name="right_foot">
    <visual>
      <origin xyz="0 0 -0.05" rpy="0 0 0" />
      <geometry>
        <box size="0.2 0.1 0.1" />
      </geometry>
      <material name="white" />
    </visual>
    <collision>
      <origin xyz="0 0 -0.05" rpy="0 0 0" />
      <geometry>
        <box size="0.2 0.1 0.1" />
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0" />
      <origin xyz="0 0 -0.05" />
      <inertia ixx="0.005" ixy="0.0" ixz="0.0" iyy="0.015" iyz="0.0" izz="0.012" />
    </inertial>
  </link>

  <joint name="right_ankle_roll" type="revolute">
    <parent link="right_ankle" />
    <child link="right_foot" />
    <origin xyz="0 0 -0.05" rpy="0 0 0" />
    <axis xyz="1 0 0" />
    <limit lower="${-M_PI/6}" upper="${M_PI/6}" effort="50" velocity="1" />
    <dynamics damping="0.5" friction="0.1" />
  </joint>

  <!-- IMU Sensor -->
  <link name="imu_link">
    <inertial>
      <mass value="0.01" />
      <inertia ixx="0.0000001" ixy="0" ixz="0" iyy="0.0000001" iyz="0" izz="0.0000001" />
    </inertial>
  </link>

  <joint name="imu_joint" type="fixed">
    <parent link="torso" />
    <child link="imu_link" />
    <origin xyz="0 0 0.1" rpy="0 0 0" />
  </joint>

  <!-- Gazebo plugins -->
  <gazebo reference="torso">
    <material>Gazebo/White</material>
  </gazebo>

  <gazebo reference="head">
    <material>Gazebo/White</material>
  </gazebo>

  <gazebo>
    <plugin name="gazebo_ros_imu" filename="libgazebo_ros_imu.so">
      <bodyName>imu_link</bodyName>
      <updateRate>100.0</updateRate>
      <gaussianNoise>0.01</gaussianNoise>
      <xyzOffsets>0 0 0</xyzOffsets>
      <rpyOffsets>0 0 0</rpyOffsets>
      <serviceName>/imu</serviceName>
      <topicName>/imu/data</topicName>
    </plugin>
  </gazebo>

  <gazebo>
    <plugin name="gazebo_ros_control" filename="libgazebo_ros_control.so">
      <robotNamespace>/humanoid_robot</robotNamespace>
    </plugin>
  </gazebo>
</robot>
```

## Xacro Macros for Humanoid Components

### Reusable Humanoid Component Macros

For complex humanoid robots, it's essential to use Xacro macros to reduce redundancy:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="humanoid_components">
  <!-- Define common properties -->
  <xacro:property name="M_PI" value="3.1415926535897931" />

  <!-- Macro for calculating inertial properties of a cylinder -->
  <xacro:macro name="cylinder_inertia" params="m r h">
    <inertia ixx="${m*(3*r*r+h*h)/12}" ixy="0" ixz="0" iyy="${m*(3*r*r+h*h)/12}" iyz="0" izz="${m*r*r/2}"/>
  </xacro:macro>

  <!-- Macro for calculating inertial properties of a box -->
  <xacro:macro name="box_inertia" params="m x y z">
    <inertia ixx="${m*(y*y+z*z)/12}" ixy="0" ixz="0" iyy="${m*(x*x+z*z)/12}" iyz="0" izz="${m*(x*x+y*y)/12}"/>
  </xacro:macro>

  <!-- Macro for a generic humanoid link -->
  <xacro:macro name="humanoid_link" params="name xyz_rpy xyz_rpy_visual material mass ixx iyy izz">
    <link name="${name}">
      <visual>
        <origin xyz="${xyz_rpy_visual}" rpy="0 0 0"/>
        <geometry>
          <box size="0.1 0.1 0.1"/>
        </geometry>
        <material name="${material}"/>
      </visual>
      <collision>
        <origin xyz="0 0 0" rpy="0 0 0"/>
        <geometry>
          <box size="0.1 0.1 0.1"/>
        </geometry>
      </collision>
      <inertial>
        <mass value="${mass}"/>
        <origin xyz="${xyz_rpy}"/>
        <inertia ixx="${ixx}" ixy="0" ixz="0" iyy="${iyy}" iyz="0" izz="${izz}"/>
      </inertial>
    </link>
  </xacro:macro>

  <!-- Macro for a humanoid joint -->
  <xacro:macro name="humanoid_joint" params="name type parent child xyz rpy axis lower upper effort velocity">
    <joint name="${name}" type="${type}">
      <parent link="${parent}"/>
      <child link="${child}"/>
      <origin xyz="${xyz}" rpy="${rpy}"/>
      <axis xyz="${axis}"/>
      <limit lower="${lower}" upper="${upper}" effort="${effort}" velocity="${velocity}"/>
      <dynamics damping="0.5" friction="0.1"/>
    </joint>
  </xacro:macro>

  <!-- Macro for a complete humanoid limb -->
  <xacro:macro name="humanoid_arm" params="prefix parent_link shoulder_xyz">
    <!-- Shoulder -->
    <link name="${prefix}_shoulder">
      <visual>
        <geometry>
          <cylinder radius="0.05" length="0.15" />
        </geometry>
        <material name="white" />
      </visual>
      <collision>
        <geometry>
          <cylinder radius="0.05" length="0.15" />
        </geometry>
      </collision>
      <inertial>
        <mass value="1.0" />
        <xacro:cylinder_inertia m="1.0" r="0.05" h="0.15" />
      </inertial>
    </link>

    <joint name="${prefix}_shoulder_yaw" type="revolute">
      <parent link="${parent_link}" />
      <child link="${prefix}_shoulder" />
      <origin xyz="${shoulder_xyz}" rpy="0 0 0" />
      <axis xyz="0 0 1" />
      <limit lower="${-M_PI/2}" upper="${M_PI/2}" effort="50" velocity="2" />
      <dynamics damping="0.5" friction="0.1" />
    </joint>

    <!-- Upper Arm -->
    <link name="${prefix}_upper_arm">
      <visual>
        <origin xyz="0 0 -0.15" rpy="0 0 0" />
        <geometry>
          <cylinder radius="0.04" length="0.3" />
        </geometry>
        <material name="white" />
      </visual>
      <collision>
        <origin xyz="0 0 -0.15" rpy="0 0 0" />
        <geometry>
          <cylinder radius="0.04" length="0.3" />
        </geometry>
      </collision>
      <inertial>
        <mass value="1.5" />
        <xacro:cylinder_inertia m="1.5" r="0.04" h="0.3" />
      </inertial>
    </link>

    <joint name="${prefix}_shoulder_pitch" type="revolute">
      <parent link="${prefix}_shoulder" />
      <child link="${prefix}_upper_arm" />
      <origin xyz="0 0 0" rpy="0 0 0" />
      <axis xyz="0 1 0" />
      <limit lower="${-M_PI}" upper="${M_PI/2}" effort="50" velocity="2" />
      <dynamics damping="0.5" friction="0.1" />
    </joint>

    <!-- Lower Arm -->
    <link name="${prefix}_lower_arm">
      <visual>
        <origin xyz="0 0 -0.15" rpy="0 0 0" />
        <geometry>
          <cylinder radius="0.03" length="0.3" />
        </geometry>
        <material name="white" />
      </visual>
      <collision>
        <origin xyz="0 0 -0.15" rpy="0 0 0" />
        <geometry>
          <cylinder radius="0.03" length="0.3" />
        </geometry>
      </collision>
      <inertial>
        <mass value="1.0" />
        <xacro:cylinder_inertia m="1.0" r="0.03" h="0.3" />
      </inertial>
    </link>

    <joint name="${prefix}_elbow" type="revolute">
      <parent link="${prefix}_upper_arm" />
      <child link="${prefix}_lower_arm" />
      <origin xyz="0 0 -0.3" rpy="0 0 0" />
      <axis xyz="0 1 0" />
      <limit lower="0" upper="${M_PI-0.1}" effort="50" velocity="2" />
      <dynamics damping="0.5" friction="0.1" />
    </joint>

    <!-- Wrist -->
    <link name="${prefix}_wrist">
      <visual>
        <origin xyz="0 0 0" rpy="0 0 0" />
        <geometry>
          <cylinder radius="0.03" length="0.05" />
        </geometry>
        <material name="white" />
      </visual>
      <collision>
        <origin xyz="0 0 0" rpy="0 0 0" />
        <geometry>
          <cylinder radius="0.03" length="0.05" />
        </geometry>
      </collision>
      <inertial>
        <mass value="0.2" />
        <xacro:cylinder_inertia m="0.2" r="0.03" h="0.05" />
      </inertial>
    </link>

    <joint name="${prefix}_wrist_yaw" type="revolute">
      <parent link="${prefix}_lower_arm" />
      <child link="${prefix}_wrist" />
      <origin xyz="0 0 -0.3" rpy="0 0 0" />
      <axis xyz="0 0 1" />
      <limit lower="${-M_PI/2}" upper="${M_PI/2}" effort="30" velocity="2" />
      <dynamics damping="0.2" friction="0.05" />
    </joint>

    <!-- Hand -->
    <link name="${prefix}_hand">
      <visual>
        <origin xyz="0 0 -0.05" rpy="0 0 0" />
        <geometry>
          <box size="0.12 0.08 0.1" />
        </geometry>
        <material name="white" />
      </visual>
      <collision>
        <origin xyz="0 0 -0.05" rpy="0 0 0" />
        <geometry>
          <box size="0.12 0.08 0.1" />
        </geometry>
      </collision>
      <inertial>
        <mass value="0.3" />
        <xacro:box_inertia m="0.3" x="0.12" y="0.08" z="0.1" />
      </inertial>
    </link>

    <joint name="${prefix}_wrist_pitch" type="revolute">
      <parent link="${prefix}_wrist" />
      <child link="${prefix}_hand" />
      <origin xyz="0 0 -0.05" rpy="0 0 0" />
      <axis xyz="0 1 0" />
      <limit lower="${-M_PI/4}" upper="${M_PI/4}" effort="10" velocity="1" />
      <dynamics damping="0.1" friction="0.02" />
    </joint>
  </xacro:macro>

  <!-- Macro for humanoid leg -->
  <xacro:macro name="humanoid_leg" params="prefix parent_link hip_xyz">
    <!-- Hip -->
    <link name="${prefix}_hip">
      <visual>
        <origin xyz="0 0 0" rpy="0 0 0" />
        <geometry>
          <cylinder radius="0.06" length="0.15" />
        </geometry>
        <material name="white" />
      </visual>
      <collision>
        <origin xyz="0 0 0" rpy="0 0 0" />
        <geometry>
          <cylinder radius="0.06" length="0.15" />
        </geometry>
      </collision>
      <inertial>
        <mass value="1.5" />
        <xacro:cylinder_inertia m="1.5" r="0.06" h="0.15" />
      </inertial>
    </link>

    <joint name="${prefix}_hip_yaw" type="revolute">
      <parent link="${parent_link}" />
      <child link="${prefix}_hip" />
      <origin xyz="${hip_xyz}" rpy="0 0 0" />
      <axis xyz="0 0 1" />
      <limit lower="${-M_PI/4}" upper="${M_PI/4}" effort="100" velocity="1" />
      <dynamics damping="1.0" friction="0.2" />
    </joint>

    <!-- Upper Leg -->
    <link name="${prefix}_upper_leg">
      <visual>
        <origin xyz="0 0 -0.3" rpy="0 0 0" />
        <geometry>
          <cylinder radius="0.05" length="0.6" />
        </geometry>
        <material name="white" />
      </visual>
      <collision>
        <origin xyz="0 0 -0.3" rpy="0 0 0" />
        <geometry>
          <cylinder radius="0.05" length="0.6" />
        </geometry>
      </collision>
      <inertial>
        <mass value="3.0" />
        <xacro:cylinder_inertia m="3.0" r="0.05" h="0.6" />
      </inertial>
    </link>

    <joint name="${prefix}_hip_pitch" type="revolute">
      <parent link="${prefix}_hip" />
      <child link="${prefix}_upper_leg" />
      <origin xyz="0 0 0" rpy="0 0 0" />
      <axis xyz="0 1 0" />
      <limit lower="${-M_PI/2}" upper="0" effort="100" velocity="1" />
      <dynamics damping="1.0" friction="0.2" />
    </joint>

    <!-- Lower Leg -->
    <link name="${prefix}_lower_leg">
      <visual>
        <origin xyz="0 0 -0.3" rpy="0 0 0" />
        <geometry>
          <cylinder radius="0.04" length="0.6" />
        </geometry>
        <material name="white" />
      </visual>
      <collision>
        <origin xyz="0 0 -0.3" rpy="0 0 0" />
        <geometry>
          <cylinder radius="0.04" length="0.6" />
        </geometry>
      </collision>
      <inertial>
        <mass value="2.5" />
        <xacro:cylinder_inertia m="2.5" r="0.04" h="0.6" />
      </inertial>
    </link>

    <joint name="${prefix}_knee" type="revolute">
      <parent link="${prefix}_upper_leg" />
      <child link="${prefix}_lower_leg" />
      <origin xyz="0 0 -0.6" rpy="0 0 0" />
      <axis xyz="0 1 0" />
      <limit lower="0" upper="${M_PI-0.1}" effort="100" velocity="1" />
      <dynamics damping="1.0" friction="0.2" />
    </joint>

    <!-- Ankle -->
    <link name="${prefix}_ankle">
      <visual>
        <origin xyz="0 0 0" rpy="0 0 0" />
        <geometry>
          <cylinder radius="0.04" length="0.05" />
        </geometry>
        <material name="white" />
      </visual>
      <collision>
        <origin xyz="0 0 0" rpy="0 0 0" />
        <geometry>
          <cylinder radius="0.04" length="0.05" />
        </geometry>
      </collision>
      <inertial>
        <mass value="0.5" />
        <xacro:cylinder_inertia m="0.5" r="0.04" h="0.05" />
      </inertial>
    </link>

    <joint name="${prefix}_ankle_pitch" type="revolute">
      <parent link="${prefix}_lower_leg" />
      <child link="${prefix}_ankle" />
      <origin xyz="0 0 -0.6" rpy="0 0 0" />
      <axis xyz="0 1 0" />
      <limit lower="${-M_PI/4}" upper="${M_PI/4}" effort="50" velocity="1" />
      <dynamics damping="0.5" friction="0.1" />
    </joint>

    <!-- Foot -->
    <link name="${prefix}_foot">
      <visual>
        <origin xyz="0 0 -0.05" rpy="0 0 0" />
        <geometry>
          <box size="0.2 0.1 0.1" />
        </geometry>
        <material name="white" />
      </visual>
      <collision>
        <origin xyz="0 0 -0.05" rpy="0 0 0" />
        <geometry>
          <box size="0.2 0.1 0.1" />
        </geometry>
      </collision>
      <inertial>
        <mass value="1.0" />
        <xacro:box_inertia m="1.0" x="0.2" y="0.1" z="0.1" />
      </inertial>
    </link>

    <joint name="${prefix}_ankle_roll" type="revolute">
      <parent link="${prefix}_ankle" />
      <child link="${prefix}_foot" />
      <origin xyz="0 0 -0.05" rpy="0 0 0" />
      <axis xyz="1 0 0" />
      <limit lower="${-M_PI/6}" upper="${M_PI/6}" effort="50" velocity="1" />
      <dynamics damping="0.5" friction="0.1" />
    </joint>
  </xacro:macro>
</robot>
```

## Humanoid-Specific Sensor Integration

### Force/Torque Sensors

Humanoid robots require precise force/torque sensing for balance and manipulation:

```xml
<!-- Left leg force/torque sensors -->
<link name="left_ankle_ft_sensor">
  <inertial>
    <mass value="0.1"/>
    <inertia ixx="0.0001" ixy="0" ixz="0" iyy="0.0001" iyz="0" izz="0.0001"/>
  </inertial>
</link>

<joint name="left_ankle_ft_joint" type="fixed">
  <parent link="left_ankle"/>
  <child link="left_ankle_ft_sensor"/>
  <origin xyz="0 0 -0.025" rpy="0 0 0"/>
</joint>

<!-- Right leg force/torque sensors -->
<link name="right_ankle_ft_sensor">
  <inertial>
    <mass value="0.1"/>
    <inertia ixx="0.0001" ixy="0" ixz="0" iyy="0.0001" iyz="0" izz="0.0001"/>
  </inertial>
</link>

<joint name="right_ankle_ft_joint" type="fixed">
  <parent link="right_ankle"/>
  <child link="right_ankle_ft_sensor"/>
  <origin xyz="0 0 -0.025" rpy="0 0 0"/>
</joint>

<!-- Gazebo plugin for force/torque sensors -->
<gazebo reference="left_ankle_ft_sensor">
  <sensor name="left_foot_force_torque" type="force_torque">
    <update_rate>100</update_rate>
    <always_on>true</always_on>
    <force_torque>
      <frame>child</frame>
      <measure_direction>child_to_parent</measure_direction>
    </force_torque>
  </sensor>
</gazebo>

<gazebo>
  <plugin name="left_foot_foce_torque_plugin" filename="libgazebo_ros_ft_sensor.so">
    <updateRate>100.0</updateRate>
    <topicName>/left_foot/ft_sensor</topicName>
    <jointName>left_ankle_roll</jointName>
  </plugin>
</gazebo>
```

### Tactile Sensors in Hands

For manipulation tasks, tactile sensors in the hands are essential:

```xml
<!-- Left hand tactile sensors -->
<link name="left_palm">
  <visual>
    <origin xyz="0 0 0" rpy="0 0 0" />
    <geometry>
      <box size="0.1 0.08 0.02" />
    </geometry>
    <material name="white" />
  </visual>
  <collision>
    <origin xyz="0 0 0" rpy="0 0 0" />
    <geometry>
      <box size="0.1 0.08 0.02" />
    </geometry>
  </collision>
  <inertial>
    <mass value="0.2" />
    <origin xyz="0 0 0" />
    <inertia ixx="0.0002" ixy="0.0" ixz="0.0" iyy="0.0003" iyz="0.0" izz="0.0002" />
  </inertial>
</link>

<joint name="left_hand_palm_joint" type="fixed">
  <parent link="left_hand" />
  <child link="left_palm" />
  <origin xyz="0 0 -0.05" rpy="0 0 0" />
</joint>

<!-- Fingertip tactile sensors -->
<link name="left_index_fingertip">
  <visual>
    <origin xyz="0 0 0" rpy="0 0 0" />
    <geometry>
      <sphere radius="0.01" />
    </geometry>
    <material name="black" />
  </visual>
  <collision>
    <origin xyz="0 0 0" rpy="0 0 0" />
    <geometry>
      <sphere radius="0.01" />
    </geometry>
  </collision>
  <inertial>
    <mass value="0.01" />
    <inertia ixx="0.000001" ixy="0.0" ixz="0.0" iyy="0.000001" iyz="0.0" izz="0.000001" />
  </inertial>
</link>

<joint name="left_index_fingertip_joint" type="fixed">
  <parent link="left_palm" />
  <child link="left_index_fingertip" />
  <origin xyz="0.05 0.02 -0.05" rpy="0 0 0" />
</joint>
```

## Advanced Humanoid Kinematics

### Humanoid Joint Limits Based on Human Anatomy

For realistic humanoid movement, joint limits should reflect human capabilities:

```xml
<!-- Human-based joint limits -->
<!-- Shoulder joints: Humans can rotate shoulders in multiple directions -->
<limit lower="${-M_PI/2}" upper="${M_PI/2}" effort="50" velocity="2" />  <!-- Shoulder yaw -->

<!-- Hip joints: Humans have limited sideways motion but good forward/backward -->
<limit lower="${-M_PI/4}" upper="${M_PI/4}" effort="100" velocity="1" />  <!-- Hip yaw -->

<!-- Knee joints: Humans can only flex knees (no backward bending) -->
<limit lower="0" upper="${M_PI-0.1}" effort="100" velocity="1" />  <!-- Knee flexion -->

<!-- Ankle joints: Humans can flex feet up and down, and roll slightly -->
<limit lower="${-M_PI/4}" upper="${M_PI/4}" effort="50" velocity="1" />  <!-- Ankle pitch -->
<limit lower="${-M_PI/6}" upper="${M_PI/6}" effort="50" velocity="1" />  <!-- Ankle roll -->
```

### Center of Mass Considerations

For bipedal stability, the center of mass is crucial:

```xml
<!-- In the torso link definition -->
<inertial>
  <!-- For stability, place center of mass lower than geometric center -->
  <mass value="10.0" />
  <origin xyz="0 0 ${0.1}" />  <!-- Slightly higher than center for realistic weight distribution -->
  <!-- Calculate realistic inertia values for a humanoid torso -->
  <inertia ixx="0.3" ixy="0.0" ixz="0.0" iyy="0.25" iyz="0.0" izz="0.1" />
</inertial>
```

## Optimization Techniques for Complex Humanoid Models

### Using Gazebo Collision Optimizations

For better simulation performance with complex humanoid models:

```xml
<!-- Use simpler collision geometries than visual geometries -->
<link name="complex_visual_simple_collision">
  <visual>
    <!-- Detailed visual mesh -->
    <geometry>
      <mesh filename="package://humanoid_description/meshes/complex_head.stl"/>
    </geometry>
  </visual>
  <collision>
    <!-- Simplified collision geometry -->
    <geometry>
      <sphere radius="0.15"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="2.0"/>
    <inertia ixx="0.015" ixy="0.0" ixz="0.0" iyy="0.015" iyz="0.0" izz="0.015"/>
  </inertial>
</link>
```

### Sensor Integration for Physical AI

Integrate sensors appropriately for Physical AI applications:

```xml
<!-- Multiple cameras for 3D vision -->
<link name="stereo_camera_left">
  <inertial>
    <mass value="0.01"/>
    <inertia ixx="0.0000001" ixy="0" ixz="0" iyy="0.0000001" iyz="0" izz="0.0000001"/>
  </inertial>
</link>

<joint name="stereo_camera_left_joint" type="fixed">
  <parent link="head"/>
  <child link="stereo_camera_left"/>
  <origin xyz="0.05 0.05 0" rpy="0 0 0"/>
</joint>

<link name="stereo_camera_right">
  <inertial>
    <mass value="0.01"/>
    <inertia ixx="0.0000001" ixy="0" ixz="0" iyy="0.0000001" iyz="0" izz="0.0000001"/>
  </inertial>
</link>

<joint name="stereo_camera_right_joint" type="fixed">
  <parent link="head"/>
  <child link="stereo_camera_right"/>
  <origin xyz="0.05 -0.05 0" rpy="0 0 0"/>
</joint>

<!-- Gazebo plugins for stereo cameras -->
<gazebo reference="stereo_camera_left">
  <sensor name="stereo_camera_left" type="camera">
    <camera>
      <horizontal_fov>1.3962634</horizontal_fov>
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.1</near>
        <far>30</far>
      </clip>
    </camera>
    <update_rate>30</update_rate>
    <always_on>true</always_on>
  </sensor>
</gazebo>

<gazebo reference="stereo_camera_right">
  <sensor name="stereo_camera_right" type="camera">
    <camera>
      <horizontal_fov>1.3962634</horizontal_fov>
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.1</near>
        <far>30</far>
      </clip>
    </camera>
    <update_rate>30</update_rate>
    <always_on>true</always_on>
  </sensor>
</gazebo>
```

## Quality Assurance for Humanoid URDF Models

### Validation Checklist

```bash
# Validate the URDF model
check_urdf humanoid_model.urdf

# Check for kinematic loops
ros2 run kdl_parser check_kdl_model humanoid_model.urdf chain torso head

# Visualize in RViz to check joint limits and movement
ros2 run rviz2 rviz2

# Check joint states
ros2 run joint_state_publisher_gui joint_state_publisher_gui
```

### Simulation Testing

```xml
<!-- Add a gazebo plugin for physics debugging -->
<gazebo>
  <plugin name="physics_debugger" filename="libphysics_debugger.so">
    <update_rate>10</update_rate>
    <!-- Additional parameters for physics debugging -->
  </plugin>
</gazebo>
```

## Conclusion

Creating humanoid robot models in URDF requires careful attention to:
1. **Biomechanics**: Modeling human-like joint limits and movement
2. **Inertial properties**: Accurate mass distribution for stable simulation
3. **Sensor integration**: Proper placement of cameras, IMUs, and force sensors
4. **Performance optimization**: Simplified collision models for better simulation
5. **Modularity**: Using Xacro macros for maintainable and reusable components

Humanoid robot models serve as the foundation for Physical AI research in bipedal locomotion, manipulation, and human-robot interaction. By following the principles and examples in this chapter, you can create accurate, functional humanoid models suitable for both simulation and real-world deployment.