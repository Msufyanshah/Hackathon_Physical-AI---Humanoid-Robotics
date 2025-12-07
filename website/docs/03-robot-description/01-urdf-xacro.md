---
sidebar_position: 1
title: 'URDF & Xacro'
---

# URDF and Xacro: Defining Physical AI Systems

## Introduction to Robot Description

In the Physical AI and humanoid robotics domain, accurately describing robot geometry, kinematics, and dynamics is crucial for simulation, control, and interaction with the physical world. The Unified Robot Description Format (URDF) and its macro extension Xacro provide the standard tools for defining robot models in ROS 2.

This chapter delves deep into creating detailed robot descriptions that serve as the digital blueprint for your physical AI systems, from simple wheeled robots to complex humanoid designs.

## Understanding URDF (Unified Robot Description Format)

### URDF Fundamentals

URDF (Unified Robot Description Format) is an XML-based format that describes robot models in ROS. It contains information about:
- **Physical structure**: Links, joints, and their relationships
- **Kinematic properties**: Joint limits, types, and transformations
- **Dynamic properties**: Mass, inertia, and center of mass
- **Visual properties**: Mesh files, colors, and visualization
- **Collision properties**: Collision meshes for physics simulation

### URDF Structure and Components

A URDF file consists of three main elements:

1. **Links**: Rigid bodies that make up the robot
2. **Joints**: Connections between links with specific degrees of freedom
3. **Materials**: Visual properties like colors and textures

### Basic URDF Example

```xml
<?xml version="1.0"?>
<robot name="simple_robot" xmlns:xacro="http://www.ros.org/wiki/xacro">
  <!-- Base link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.5 0.2"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.5 0.5 0.2"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="5.0"/>
      <inertia ixx="0.1" ixy="0.0" ixz="0.0" iyy="0.1" iyz="0.0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Wheel links -->
  <link name="wheel_front_left">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.5"/>
      <inertia ixx="0.001" ixy="0.0" ixz="0.0" iyy="0.001" iyz="0.0" izz="0.002"/>
    </inertial>
  </link>

  <!-- Joint connecting base to front left wheel -->
  <joint name="wheel_front_left_joint" type="continuous">
    <parent link="base_link"/>
    <child link="wheel_front_left"/>
    <origin xyz="0.2 0.2 -0.1" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
  </joint>

  <!-- Similar for other wheels -->
  <link name="wheel_front_right">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.5"/>
      <inertia ixx="0.001" ixy="0.0" ixz="0.0" iyy="0.001" iyz="0.0" izz="0.002"/>
    </inertial>
  </link>

  <joint name="wheel_front_right_joint" type="continuous">
    <parent link="base_link"/>
    <child link="wheel_front_right"/>
    <origin xyz="0.2 -0.2 -0.1" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
  </joint>

  <link name="wheel_rear_left">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.5"/>
      <inertia ixx="0.001" ixy="0.0" ixz="0.0" iyy="0.001" iyz="0.0" izz="0.002"/>
    </inertial>
  </link>

  <joint name="wheel_rear_left_joint" type="fixed">
    <parent link="base_link"/>
    <child link="wheel_rear_left"/>
    <origin xyz="-0.2 0.2 -0.1" rpy="0 0 0"/>
  </joint>

  <link name="wheel_rear_right">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.5"/>
      <inertia ixx="0.001" ixy="0.0" ixz="0.0" iyy="0.001" iyz="0.0" izz="0.002"/>
    </inertial>
  </link>

  <joint name="wheel_rear_right_joint" type="fixed">
    <parent link="base_link"/>
    <child link="wheel_rear_right"/>
    <origin xyz="-0.2 -0.2 -0.1" rpy="0 0 0"/>
  </joint>
</robot>
```

## Link Elements in Detail

### The `<link>` Element

Each `<link>` represents a rigid body part of the robot. It can contain sub-elements:

- **`<visual>`**: How the link appears in visualization
- **`<collision>`**: How the link interacts in collision detection
- **`<inertial>`**: Physical properties for dynamics simulation

### Visual Properties

```xml
<link name="arm_link">
  <visual>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <mesh filename="package://my_robot_description/meshes/arm.stl"/>
    </geometry>
    <material name="gray">
      <color rgba="0.5 0.5 0.5 1"/>
    </material>
  </visual>
</link>
```

### Collision Properties

```xml
<link name="base_link">
  <collision>
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
    <geometry>
      <box size="0.5 0.5 0.2"/>
    </geometry>
  </collision>
</link>
```

### Inertial Properties

```xml
<link name="link_name">
  <inertial>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <mass value="1.0"/>
    <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.01"/>
  </inertial>
</link>
```

## Joint Elements in Detail

### Joint Types

URDF supports several joint types:

- **`fixed`**: No degrees of freedom
- **`continuous`**: Continuous rotation (like a wheel)
- **`revolute`**: Limited angle rotation (like an elbow)
- **`prismatic`**: Linear sliding motion
- **`floating`**: 6-DOF motion (free floating)
- **`planar`**: Motion on a plane

### Revolute Joint Example

```xml
<joint name="elbow_joint" type="revolute">
  <parent link="upper_arm"/>
  <child link="lower_arm"/>
  <origin xyz="0 0 -0.3" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="-2.0" upper="1.5" effort="100" velocity="1.0"/>
  <dynamics damping="0.1" friction="0.0"/>
</joint>
```

### Continuous Joint Example

```xml
<joint name="wheel_joint" type="continuous">
  <parent link="chassis"/>
  <child link="wheel"/>
  <origin xyz="0.2 0.2 -0.1" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <dynamics damping="0.5"/>
</joint>
```

## Advanced URDF Concepts

### Transmission Elements

For controlling joints, URDF includes transmission elements:

```xml
<transmission name="elbow_trans">
  <type>transmission_interface/SimpleTransmission</type>
  <joint name="elbow_joint">
    <hardwareInterface>hardware_interface/PositionJointInterface</hardwareInterface>
  </joint>
  <actuator name="elbow_motor">
    <hardwareInterface>hardware_interface/PositionJointInterface</hardwareInterface>
    <mechanicalReduction>1</mechanicalReduction>
  </actuator>
</transmission>
```

### Gazebo-Specific Elements

For simulation in Gazebo, additional elements can be included:

```xml
<gazebo reference="base_link">
  <material>Gazebo/Blue</material>
  <turnGravityOff>false</turnGravityOff>
</gazebo>

<gazebo reference="wheel_joint">
  <implicitSpringDamper>1</implicitSpringDamper>
</gazebo>
```

## Introduction to Xacro

### Why Xacro?

While URDF is powerful, complex robots require repetitive elements and calculations. Xacro (XML Macros) extends URDF with:

- **Macros**: Define reusable components
- **Mathematical expressions**: Calculate values
- **Loops**: Generate repetitive elements
- **Inclusion**: Combine multiple files
- **Properties**: Define reusable values

### Basic Xacro Example

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="simple_robot_xacro">
  <!-- Define properties -->
  <xacro:property name="M_PI" value="3.1415926535897931" />
  <xacro:property name="wheel_radius" value="0.1" />
  <xacro:property name="wheel_width" value="0.05" />
  <xacro:property name="base_length" value="0.5" />
  <xacro:property name="base_width" value="0.5" />
  <xacro:property name="base_height" value="0.2" />

  <!-- Define a macro for wheels -->
  <xacro:macro name="wheel" params="prefix *origin">
    <link name="${prefix}_wheel">
      <visual>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
        </geometry>
        <material name="black">
          <color rgba="0 0 0 1"/>
        </material>
      </visual>
      <collision>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
        </geometry>
      </collision>
      <inertial>
        <mass value="0.5"/>
        <inertia ixx="0.001" ixy="0.0" ixz="0.0" iyy="0.001" iyz="0.0" izz="0.002"/>
      </inertial>
    </link>

    <joint name="${prefix}_wheel_joint" type="continuous">
      <xacro:insert_block name="origin"/>
      <axis xyz="0 1 0"/>
    </joint>
  </xacro:macro>

  <!-- Base link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="${base_length} ${base_width} ${base_height}"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="${base_length} ${base_width} ${base_height}"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="5.0"/>
      <inertia ixx="0.1" ixy="0.0" ixz="0.0" iyy="0.1" iyz="0.0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Create wheels using macro -->
  <xacro:wheel prefix="front_left">
    <origin xyz="${base_length/2} ${base_width/2} -${wheel_radius}" rpy="0 0 0"/>
    <parent link="base_link"/>
    <child link="front_left_wheel"/>
  </xacro:wheel>

  <xacro:wheel prefix="front_right">
    <origin xyz="${base_length/2} -${base_width/2} -${wheel_radius}" rpy="0 0 0"/>
    <parent link="base_link"/>
    <child link="front_right_wheel"/>
  </xacro:wheel>

  <xacro:wheel prefix="rear_left">
    <origin xyz="-${base_length/2} ${base_width/2} -${wheel_radius}" rpy="0 0 0"/>
    <parent link="base_link"/>
    <child link="rear_left_wheel"/>
  </xacro:wheel>

  <xacro:wheel prefix="rear_right">
    <origin xyz="-${base_length/2} -${base_width/2} -${wheel_radius}" rpy="0 0 0"/>
    <parent link="base_link"/>
    <child link="rear_right_wheel"/>
  </xacro:wheel>
</robot>
```

## Advanced Xacro Techniques

### Mathematical Calculations

```xml
<!-- Calculate values -->
<xacro:property name="pi" value="3.1415926535897931" />
<xacro:property name="gear_ratio" value="50.0" />
<xacro:property name="encoder_resolution" value="4096.0" />

<!-- Use in calculations -->
<inertial>
  <mass value="${2.0 * pi * wheel_radius * wheel_width}" />
  <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.01"/>
</inertial>
```

### Conditional Statements

```xml
<xacro:macro name="sensor" params="name type enable_gpu:=false">
  <xacro:if value="${enable_gpu}">
    <gazebo reference="${name}_link">
      <sensor name="${name}_sensor" type="camera">
        <camera>
          <horizontal_fov>1.047</horizontal_fov>
          <image>
            <width>640</width>
            <height>480</height>
            <format>R8G8B8</format>
          </image>
          <clip>
            <near>0.1</near>
            <far>100</far>
          </clip>
        </camera>
        <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
          <alwaysOn>true</alwaysOn>
          <updateRate>30.0</updateRate>
          <cameraName>${name}</cameraName>
          <imageTopicName>image_raw</imageTopicName>
          <cameraInfoTopicName>camera_info</cameraInfoTopicName>
          <frameName>${name}_optical_frame</frameName>
        </plugin>
      </sensor>
    </gazebo>
  </xacro:if>

  <xacro:unless value="${enable_gpu}">
    <!-- Simplified sensor for CPU rendering -->
    <gazebo reference="${name}_link">
      <sensor name="${name}_sensor" type="camera">
        <always_on>true</always_on>
        <update_rate>10</update_rate>
        <camera>
          <horizontal_fov>1.047</horizontal_fov>
          <image>
            <width>320</width>
            <height>240</height>
          </image>
        </camera>
      </sensor>
    </gazebo>
  </xacro:unless>
</xacro:macro>
```

### Looping with Xacro

```xml
<!-- Create multiple joints in a loop -->
<xacro:macro name="create_arm_joints" params="num_joints link_prefix">
  <xacro:property name="joint_offset" value="0.1" />

  <xacro:for each="i" in="${range(1, num_joints+1)}">
    <link name="${link_prefix}_link_${i}">
      <visual>
        <geometry>
          <cylinder radius="0.02" length="${joint_offset}"/>
        </geometry>
      </visual>
      <inertial>
        <mass value="0.1"/>
        <inertia ixx="0.0001" iyy="0.0001" izz="0.00005" ixy="0" ixz="0" iyz="0"/>
      </inertial>
    </link>

    <joint name="${link_prefix}_joint_${i}" type="revolute">
      <parent link="${link_prefix}_link_${i-1 if i > 1 else 'base'}"/>
      <child link="${link_prefix}_link_${i}"/>
      <origin xyz="0 0 ${joint_offset}" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>
      <limit lower="-1.57" upper="1.57" effort="10" velocity="1"/>
    </joint>
  </xacro:for>
</xacro:macro>
```

## Best Practices for URDF/Xacro

### 1. Organization

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="well_organized_robot">
  <!-- Include other files -->
  <xacro:include filename="$(find my_robot_description)/urdf/materials.xacro" />
  <xacro:include filename="$(find my_robot_description)/urdf/transmissions.xacro" />
  <xacro:include filename="$(find my_robot_description)/urdf/gazebo.xacro" />

  <!-- Define properties at the top -->
  <xacro:property name="M_PI" value="3.1415926535897931" />
  <xacro:property name="robot_scale" value="1.0" />

  <!-- Macros for repetitive components -->
  <xacro:macro name="wheel" params="prefix xyz">
    <!-- Wheel definition -->
  </xacro:macro>

  <!-- Main robot definition -->
  <link name="base_link">
    <!-- Base link definition -->
  </link>

  <!-- Use macros to create components -->
  <xacro:wheel prefix="front_left" xyz="0.2 0.2 -0.1" />
  <!-- etc. -->
</robot>
```

### 2. Proper Inertial Calculations

For accurate simulation, inertial properties are crucial:

```xml
<!-- Calculate inertial properties for common shapes -->

<!-- For a solid cylinder -->
<xacro:macro name="cylinder_inertia" params="m r h">
  <inertia ixx="${m*(3*r*r+h*h)/12}" ixy="0" ixz="0" iyy="${m*(3*r*r+h*h)/12}" iyz="0" izz="${m*r*r/2}"/>
</xacro:macro>

<!-- For a solid box -->
<xacro:macro name="box_inertia" params="m x y z">
  <inertia ixx="${m*(y*y+z*z)/12}" ixy="0" ixz="0" iyy="${m*(x*x+z*z)/12}" iyz="0" izz="${m*(x*x+y*y)/12}"/>
</xacro:macro>

<!-- Usage -->
<link name="arm_link">
  <visual>
    <geometry>
      <cylinder radius="0.05" length="0.3"/>
    </geometry>
  </visual>
  <collision>
    <geometry>
      <cylinder radius="0.05" length="0.3"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="0.5"/>
    <xacro:cylinder_inertia m="0.5" r="0.05" h="0.3"/>
  </inertial>
</link>
```

### 3. Proper Naming Conventions

```xml
<!-- Good naming conventions -->
<link name="base_link" />  <!-- Base link should be called base_link -->
<link name="torso_link" />  <!-- Upper body section -->
<link name="head_link" />   <!-- Head component -->
<link name="arm_left_link_1" />  <!-- Left arm, first segment -->
<link name="arm_left_link_2" />  <!-- Left arm, second segment -->
<link name="hand_left" />   <!-- Left hand -->

<joint name="torso_to_head" type="revolute" />  <!-- Movement from torso to head -->
<joint name="arm_left_joint_1" type="revolute" />  <!-- Left arm joint 1 -->
<joint name="gripper_left_joint" type="prismatic" />  <!-- Left gripper joint -->
```

## Physical AI and Humanoid-Specific Considerations

### Center of Mass and Stability

For humanoid robots, the center of mass placement is critical for stability:

```xml
<link name="torso_link">
  <visual>
    <geometry>
      <box size="0.3 0.2 0.5"/>
    </geometry>
  </visual>
  <collision>
    <geometry>
      <box size="0.3 0.2 0.5"/>
    </geometry>
  </collision>
  <inertial>
    <!-- For stability, mass may be concentrated lower -->
    <mass value="5.0"/>
    <!-- Position origin lower to simulate weight distribution -->
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
    <inertia ixx="0.2" ixy="0" ixz="0" iyy="0.3" iyz="0" izz="0.1"/>
  </inertial>
</link>
```

### Sensor Integration in URDF

Physical AI systems require sensors integrated into the robot model:

```xml
<!-- IMU sensor -->
<link name="imu_link">
  <inertial>
    <mass value="0.01"/>
    <inertia ixx="0.0001" ixy="0" ixz="0" iyy="0.0001" iyz="0" izz="0.0001"/>
  </inertial>
</link>

<joint name="imu_joint" type="fixed">
  <parent link="torso_link"/>
  <child link="imu_link"/>
  <origin xyz="0 0 0.1" rpy="0 0 0"/>
</joint>

<!-- Camera sensor -->
<link name="camera_rgb_optical_frame">
  <inertial>
    <mass value="0.001"/>
    <inertia ixx="0.0001" ixy="0" ixz="0" iyy="0.0001" iyz="0" izz="0.0001"/>
  </inertial>
</link>

<joint name="camera_rgb_optical_joint" type="fixed">
  <parent link="head_link"/>
  <child link="camera_rgb_optical_frame"/>
  <origin xyz="0.05 0 0" rpy="-${M_PI/2} 0 -${M_PI/2}"/>
</joint>
```

### Soft and Compliant Joints

For more realistic humanoid simulation, consider softer joint constraints:

```xml
<joint name="elbow_joint" type="revolute">
  <parent link="upper_arm"/>
  <child link="lower_arm"/>
  <origin xyz="0 0 -0.2" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="-1.57" upper="1.57" effort="50.0" velocity="2.0"/>
  <!-- Soft limits for more natural movement -->
  <safety_controller k_position="10" k_velocity="1.5" soft_lower_limit="-1.5" soft_upper_limit="1.5"/>
  <!-- Damping for more realistic joint behavior -->
  <dynamics damping="1.0" friction="0.1"/>
</joint>
```

## Validation and Testing

### URDF Validation Tools

Always validate your URDF models:

```bash
# Check URDF for errors
check_urdf /path/to/robot.urdf

# Parse Xacro to URDF
xacro input.xacro -o output.urdf

# Visualize with RViz
ros2 run rviz2 rviz2

# Use joint_state_publisher_gui to move joints
ros2 run joint_state_publisher_gui joint_state_publisher_gui
```

### Testing Robot Models

```xml
<!-- Add test-specific elements -->
<gazebo>
  <plugin name="joint_state_publisher" filename="libgazebo_ros_joint_state_publisher.so">
    <update_rate>30</update_rate>
    <joint_name>arm_left_joint_1</joint_name>
    <joint_name>arm_left_joint_2</joint_name>
    <joint_name>arm_right_joint_1</joint_name>
    <!-- Add more joints as needed -->
  </plugin>
</gazebo>
```

## Conclusion

URDF and Xacro are foundational tools for defining robot models in Physical AI and humanoid robotics systems. Proper use of these formats enables:

1. **Accurate simulation** with proper kinematic and dynamic properties
2. **Visualization** in tools like RViz
3. **Control system development** with known kinematic chains
4. **Sensor integration** for perception systems
5. **Multi-robot coordination** with standardized models

For Physical AI applications, special attention must be paid to inertial properties, center of mass placement, and sensor integration to ensure accurate simulation and real-world deployment compatibility. The next chapter will explore specific techniques for humanoid robot modeling, building on the foundations established here.