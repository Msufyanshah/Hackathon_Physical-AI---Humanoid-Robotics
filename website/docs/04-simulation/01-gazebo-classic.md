---
sidebar_position: 1
title: 'Gazebo Classic'
---

# Gazebo Classic: Simulation for Physical AI and Humanoid Robotics

## Introduction to Gazebo Classic

Gazebo Classic has been the dominant simulation environment for robotics research and development, providing a realistic physics simulation and sensor models for testing and validating robotic algorithms. While newer versions of Gazebo (formerly Ignition) have emerged, Gazebo Classic remains widely used in the robotics community and serves as the foundation for many Physical AI applications.

This chapter delves deep into utilizing Gazebo Classic for Physical AI and humanoid robotics applications, covering everything from basic setup to advanced simulation techniques for complex robot models.

## Overview of Gazebo Classic Architecture

### Core Components

Gazebo Classic operates on a client-server architecture with the following core components:

1. **Gazebo Server**: Runs the physics simulation and manages the world state
2. **Gazebo Client**: Provides visualization and user interface
3. **Model Database**: Hosts pre-built robot and environment models
4. **Plugin System**: Extends simulation capabilities through dynamic plugins
5. **Transport Layer**: Handles communication between components using Protobuf

### Physics Engine Integration

Gazebo Classic primarily uses the Open Dynamics Engine (ODE) as its default physics engine, though it also supports Bullet and SimBody:

```xml
<!-- Physics engine configuration in SDF -->
<physics name="ode" type="ode">
  <max_step_size>0.001</max_step_size>      <!-- Time step in seconds -->
  <real_time_factor>1</real_time_factor>    <!-- Desired simulation speed -->
  <real_time_update_rate>1000</real_time_update_rate>  <!-- Updates per second -->

  <ode>
    <solver>
      <type>quick</type>    <!-- Type of numerical solver -->
      <iters>1000</iters>   <!-- Maximum number of iterations -->
      <sor>1.3</sor>        <!-- Successive over-relaxation parameter -->
    </solver>
    <constraints>
      <cfm>0.000001</cfm>   <!-- Constraint Force Mixing parameter -->
      <erp>0.2</erp>        <!-- Error Reduction Parameter -->
      <contact_max_correcting_vel>100</contact_max_correcting_vel>
      <contact_surface_layer>0.001</contact_surface_layer>
    </constraints>
  </ode>
</physics>
```

## Setting Up Gazebo Classic for Physical AI

### Installation and Configuration

Gazebo Classic is available through most Linux distributions and can be installed as follows:

```bash
# On Ubuntu
sudo apt-get update
sudo apt-get install gazebo libgazebo-dev

# Verify installation
gazebo -v
```

### Basic Launch and Operation

Starting Gazebo Classic for the first time:

```bash
# Launch Gazebo Classic with GUI
gazebo

# Launch Gazebo Classic without GUI (headless mode)
gazebo -s

# Launch with a specific world file
gazebo my_world.world
```

### World File Creation

Creating a basic world file for Physical AI experimentation:

```xml
<?xml version="1.0"?>
<sdf version="1.7">
  <world name="physical_ai_lab">
    <!-- Include a simple ground plane -->
    <include>
      <uri>model://ground_plane</uri>
    </include>

    <!-- Include a sky model -->
    <include>
      <uri>model://sky</uri>
    </include>

    <!-- Lighting -->
    <light type="directional" name="sun">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.8 0.8 0.8 1</diffuse>
      <specular>0.2 0.2 0.2 1</specular>
      <attenuation>
        <range>1000</range>
        <constant>0.9</constant>
        <linear>0.01</linear>
        <quadratic>0.001</quadratic>
      </attenuation>
      <direction>-0.6 0.3 -0.8</direction>
    </light>

    <!-- Physics engine configuration -->
    <physics name="ode" type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
      <gravity>0 0 -9.8</gravity>
    </physics>

    <!-- Define a simple humanoid robot using include -->
    <include>
      <uri>model://humanoid_robot</uri>
      <name>basic_humanoid</name>
      <pose>0 0 0.8 0 0 0</pose>
    </include>

    <!-- Obstacles for testing -->
    <model name="obstacle_1">
      <pose>2 0 0.5 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box>
              <size>1 1 1</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>1 1 1</size>
            </box>
          </geometry>
          <material>
            <ambient>0.5 0 0 1</ambient>
            <diffuse>0.8 0 0 1</diffuse>
          </material>
        </visual>
        <inertial>
          <mass>1</mass>
          <inertia>
            <ixx>0.166</ixx>
            <ixy>0</ixy>
            <ixz>0</ixz>
            <iyy>0.166</iyy>
            <iyz>0</iyz>
            <izz>0.166</izz>
          </inertia>
        </inertial>
      </link>
    </model>
  </world>
</sdf>
```

## Advanced Simulation Techniques

### Physics Tuning for Humanoid Robots

Humanoid robots require precise physics tuning to achieve stable simulation. Here are key parameters to adjust:

```xml
<physics name="humanoid_physics" type="ode">
  <!-- Finer time step for more stable humanoid simulation -->
  <max_step_size>0.0005</max_step_size> <!-- Half the default -->
  <real_time_factor>1</real_time_factor>
  <real_time_update_rate>2000</real_time_update_rate> <!-- Double the update rate -->

  <ode>
    <solver>
      <type>quick</type>
      <iters>2000</iters>  <!-- Higher iteration count for stability -->
      <sor>1.3</sor>
    </solver>
    <constraints>
      <!-- Fine-tuned parameters for humanoid balance -->
      <cfm>0.0000001</cfm> <!-- Very low for precise contacts -->
      <erp>0.1</erp>       <!-- Lower ERP for reduced error correction -->
      <contact_max_correcting_vel>10</contact_max_correcting_vel>
      <contact_surface_layer>0.0001</contact_surface_layer>
    </constraints>
  </ode>
</physics>
```

### Custom Sensors for Physical AI

Gazebo Classic supports various sensor types that are essential for Physical AI:

#### Camera Sensor Configuration
```xml
<sensor name="rgb_camera" type="camera">
  <always_on>true</always_on>
  <update_rate>30</update_rate>
  <camera name="head_camera">
    <horizontal_fov>1.396263</horizontal_fov> <!-- 80 degrees in radians -->
    <image>
      <width>640</width>
      <height>480</height>
      <format>R8G8B8</format>
    </image>
    <clip>
      <near>0.1</near>
      <far>10</far>
    </clip>
    <noise>
      <type>gaussian</type>
      <mean>0.0</mean>
      <stddev>0.007</stddev>
    </noise>
  </camera>
  <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
    <cameraName>head_camera</cameraName>
    <imageTopicName>image_raw</imageTopicName>
    <cameraInfoTopicName>camera_info</cameraInfoTopicName>
    <frameName>head_camera_frame</frameName>
    <hackBaseline>0.07</hackBaseline>
    <distortionK1>0.0</distortionK1>
    <distortionK2>0.0</distortionK2>
    <distortionK3>0.0</distortionK3>
    <distortionT1>0.0</distortionT1>
    <distortionT2>0.0</distortionT2>
  </plugin>
</sensor>
```

#### LIDAR Sensor Configuration
```xml
<sensor name="laser_scanner" type="ray">
  <always_on>true</always_on>
  <update_rate>40</update_rate>
  <ray>
    <scan>
      <horizontal>
        <samples>720</samples>
        <resolution>1</resolution>
        <min_angle>-1.570796</min_angle> <!-- -π/2 -->
        <max_angle>1.570796</max_angle>   <!-- π/2 -->
      </horizontal>
    </scan>
    <range>
      <min>0.1</min>
      <max>10</max>
      <resolution>0.01</resolution>
    </range>
    <noise>
      <type>gaussian</type>
      <mean>0</mean>
      <stddev>0.01</stddev>
    </noise>
  </ray>
  <plugin name="laser_controller" filename="libgazebo_ros_laser.so">
    <topicName>/scan</topicName>
    <frameName>laser_frame</frameName>
  </plugin>
</sensor>
```

#### IMU Sensor Configuration
```xml
<sensor name="imu_sensor" type="imu">
  <always_on>true</always_on>
  <update_rate>100</update_rate>
  <imu>
    <angular_velocity>
      <x>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>2e-4</stddev>
        </noise>
      </x>
      <y>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>2e-4</stddev>
        </noise>
      </y>
      <z>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>2e-4</stddev>
        </noise>
      </z>
    </angular_velocity>
    <linear_acceleration>
      <x>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>1.7e-2</stddev>
        </noise>
      </x>
      <y>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>1.7e-2</stddev>
        </noise>
      </y>
      <z>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>1.7e-2</stddev>
        </noise>
      </z>
    </linear_acceleration>
  </imu>
  <plugin name="imu_controller" filename="libgazebo_ros_imu.so">
    <topicName>/imu/data</topicName>
    <serviceName>/imu/service</serviceName>
    <gaussianNoise>0.0</gaussianNoise>
    <bodyName>imu_link</bodyName>
  </plugin>
</sensor>
```

## Gazebo Classic Plugins for Physical AI

### ROS Integration Plugins

Gazebo Classic provides extensive ROS integration through plugins:

#### Joint State Publisher Plugin
```xml
<plugin name="joint_state_publisher" filename="libgazebo_ros_joint_state_publisher.so">
  <robotNamespace>/humanoid_robot</robotNamespace>
  <jointName>left_hip_yaw_joint</jointName>
  <jointName>left_hip_pitch_joint</jointName>
  <jointName>left_knee_joint</jointName>
  <jointName>right_hip_yaw_joint</jointName>
  <jointName>right_hip_pitch_joint</jointName>
  <jointName>right_knee_joint</jointName>
  <updateRate>30</updateRate>
</plugin>
```

#### Joint Trajectory Controller Plugin
```xml
<plugin name="joint_trajectory_controller" filename="libgazebo_ros_joint_trajectory.so">
  <robotNamespace>/humanoid_robot</robotNamespace>
  <topicName>/joint_trajectory</topicName>
  <serviceName>/joint_trajectory_service</serviceName>
  <jointName>left_hip_yaw_joint</jointName>
  <jointName>left_hip_pitch_joint</jointName>
  <jointName>left_knee_joint</jointName>
  <jointName>right_hip_yaw_joint</jointName>
  <jointName>right_hip_pitch_joint</jointName>
  <jointName>right_knee_joint</jointName>
  <updateRate>1000</updateRate>
</plugin>
```

#### Balance Controller Plugin for Humanoid Robots
```xml
<plugin name="balance_controller" filename="libgazebo_ros_balance_controller.so">
  <robotNamespace>/humanoid_robot</robotNamespace>
  <topicName>/balance_control</topicName>
  <com_reference_topic>/com_reference</com_reference_topic>
  <com_measured_topic>/com_measured</com_measured_topic>
  <zmp_reference_topic>/zmp_reference</zmp_reference_topic>
  <zmp_measured_topic>/zmp_measured</zmp_measured_topic>
  <updateRate>200</updateRate>
</plugin>
```

## Model Creation and Integration

### Creating Custom Humanoid Robot Models

Creating a detailed humanoid robot model for Gazebo Classic involves proper SDF formatting:

```xml
<sdf version="1.7">
  <model name="custom_humanoid">
    <pose>0 0 0.8 0 0 0</pose>

    <!-- Torso link -->
    <link name="torso">
      <pose>0 0 0 0 0 0</pose>
      <inertial>
        <mass>10.0</mass>
        <inertia>
          <ixx>0.3</ixx>
          <ixy>0</ixy>
          <ixz>0</ixz>
          <iyy>0.3</iyy>
          <iyz>0</iyz>
          <izz>0.2</izz>
        </inertia>
      </inertial>

      <visual name="visual">
        <geometry>
          <box>
            <size>0.3 0.2 0.5</size>
          </box>
        </geometry>
      </visual>

      <collision name="collision">
        <geometry>
          <box>
            <size>0.3 0.2 0.5</size>
          </box>
        </geometry>
      </collision>
    </link>

    <!-- Head link -->
    <link name="head">
      <pose>0 0 0.3 0 0 0</pose>
      <inertial>
        <mass>2.0</mass>
        <inertia>
          <ixx>0.015</ixx>
          <ixy>0</ixy>
          <ixz>0</ixz>
          <iyy>0.015</iyy>
          <iyz>0</iyz>
          <izz>0.015</izz>
        </inertia>
      </inertial>

      <visual name="visual">
        <geometry>
          <sphere>
            <radius>0.15</radius>
          </sphere>
        </geometry>
      </visual>

      <collision name="collision">
        <geometry>
          <sphere>
            <radius>0.15</radius>
          </sphere>
        </geometry>
      </collision>
    </link>

    <!-- Neck joint connecting torso to head -->
    <joint name="neck_joint" type="revolute">
      <parent>torso</parent>
      <child>head</child>
      <pose>0 0 0.25 0 0 0</pose>
      <axis>
        <xyz>0 1 0</xyz>
        <limit>
          <lower>-0.52</lower>  <!-- -30 degrees -->
          <upper>0.52</upper>   <!-- 30 degrees -->
          <effort>20</effort>
          <velocity>1.0</velocity>
        </limit>
      </axis>
    </joint>

    <!-- Left shoulder link -->
    <link name="left_shoulder">
      <pose>0.15 0.1 0.1 0 0 0</pose>
      <inertial>
        <mass>1.0</mass>
        <inertia>
          <ixx>0.001</ixx>
          <ixy>0</ixy>
          <ixz>0</ixz>
          <iyy>0.001</iyy>
          <iyz>0</iyz>
          <izz>0.001</izz>
        </inertia>
      </inertial>

      <visual name="visual">
        <geometry>
          <cylinder>
            <radius>0.05</radius>
            <length>0.1</length>
          </cylinder>
        </geometry>
      </visual>

      <collision name="collision">
        <geometry>
          <cylinder>
            <radius>0.05</radius>
            <length>0.1</length>
          </cylinder>
        </geometry>
      </collision>
    </link>

    <!-- Left shoulder joint -->
    <joint name="left_shoulder_yaw" type="revolute">
      <parent>torso</parent>
      <child>left_shoulder</child>
      <axis>
        <xyz>0 0 1</xyz>
        <limit>
          <lower>-1.57</lower>  <!-- -90 degrees -->
          <upper>1.57</upper>   <!-- 90 degrees -->
          <effort>30</effort>
          <velocity>2.0</velocity>
        </limit>
      </axis>
    </joint>

    <!-- Additional joints and links would follow similar pattern -->
  </model>
</sdf>
```

## Advanced Simulation Scenarios

### Multi-Robot Simulation

Simulating multiple robots in the same environment:

```xml
<sdf version="1.7">
  <world name="multi_robot_world">
    <!-- Include basic world elements -->
    <include>
      <uri>model://ground_plane</uri>
    </include>

    <light type="directional" name="sun">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <direction>-0.6 0.3 -0.8</direction>
    </light>

    <!-- First humanoid robot -->
    <include>
      <uri>model://humanoid_robot</uri>
      <name>robot_1</name>
      <pose>-2 0 0.8 0 0 0</pose>
    </include>

    <!-- Second humanoid robot -->
    <include>
      <uri>model://humanoid_robot</uri>
      <name>robot_2</name>
      <pose>2 0 0.8 0 0 1.57</pose>
    </include>

    <!-- Third humanoid robot -->
    <include>
      <uri>model://humanoid_robot</uri>
      <name>robot_3</name>
      <pose>0 2 0.8 0 0 0</pose>
    </include>

    <!-- Objects for interaction -->
    <model name="interaction_sphere_1">
      <pose>-1.5 0 1.0 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry>
            <sphere>
              <radius>0.1</radius>
            </sphere>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <sphere>
              <radius>0.1</radius>
            </sphere>
          </geometry>
          <material>
            <ambient>1 0 0 1</ambient>
            <diffuse>1 0 0 1</diffuse>
          </material>
        </visual>
        <inertial>
          <mass>0.1</mass>
          <inertia>
            <ixx>0.0002</ixx>
            <ixy>0</ixy>
            <ixz>0</ixz>
            <iyy>0.0002</iyy>
            <iyz>0</iyz>
            <izz>0.0002</izz>
          </inertia>
        </inertial>
      </link>
    </model>

    <model name="interaction_sphere_2">
      <pose>1.5 0 1.0 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry>
            <sphere>
              <radius>0.1</radius>
            </sphere>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <sphere>
              <radius>0.1</radius>
            </sphere>
          </geometry>
          <material>
            <ambient>0 1 0 1</ambient>
            <diffuse>0 1 0 1</diffuse>
          </material>
        </visual>
        <inertial>
          <mass>0.1</mass>
          <inertia>
            <ixx>0.0002</ixx>
            <ixy>0</ixy>
            <ixz>0</ixz>
            <iyy>0.0002</iyy>
            <iyz>0</iyz>
            <izz>0.0002</izz>
          </inertia>
        </inertial>
      </link>
    </model>

    <!-- Shared physics engine -->
    <physics name="ode" type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
    </physics>
  </world>
</sdf>
```

### Complex Environment Simulation

Creating environments that challenge Physical AI systems:

```xml
<sdf version="1.7">
  <world name="complex_environment">
    <!-- Multi-level environment -->
    <include>
      <uri>model://ground_plane</uri>
    </include>

    <!-- Elevated platform -->
    <model name="platform">
      <pose>3 0 0.5 0 0 0</pose>
      <static>true</static>
      <link name="platform_link">
        <collision name="collision">
          <geometry>
            <box>
              <size>2 2 0.2</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>2 2 0.2</size>
            </box>
          </geometry>
          <material>
            <ambient>0.3 0.3 0.3 1</ambient>
            <diffuse>0.5 0.5 0.5 1</diffuse>
          </material>
        </visual>
      </link>
    </model>

    <!-- Narrow walkway -->
    <model name="walkway">
      <pose>1 0 0.1 0 0 0</pose>
      <static>true</static>
      <link name="walkway_link">
        <collision name="collision">
          <geometry>
            <box>
              <size>4 0.3 0.05</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>4 0.3 0.05</size>
            </box>
          </geometry>
          <material>
            <ambient>0.8 0.8 0.8 1</ambient>
            <diffuse>0.8 0.8 0.8 1</diffuse>
          </material>
        </visual>
      </link>
    </model>

    <!-- Obstacles to navigate around -->
    <model name="obstacle_1">
      <pose>0.5 0.5 0.5 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry>
            <cylinder>
              <radius>0.2</radius>
              <length>1.0</length>
            </cylinder>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <cylinder>
              <radius>0.2</radius>
              <length>1.0</length>
            </cylinder>
          </geometry>
          <material>
            <ambient>1 0.5 0 1</ambient>
            <diffuse>1 0.5 0 1</diffuse>
          </material>
        </visual>
        <inertial>
          <mass>5.0</mass>
          <inertia>
            <ixx>0.25</ixx>
            <ixy>0</ixy>
            <ixz>0</ixz>
            <iyy>0.25</iyy>
            <iyz>0</iyz>
            <izz>0.1</izz>
          </inertia>
        </inertial>
      </link>
    </model>

    <model name="obstacle_2">
      <pose>0.5 -0.5 0.5 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry>
            <cylinder>
              <radius>0.2</radius>
              <length>1.0</length>
            </cylinder>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <cylinder>
              <radius>0.2</radius>
              <length>1.0</length>
            </cylinder>
          </geometry>
          <material>
            <ambient>1 0.5 0 1</ambient>
            <diffuse>1 0.5 0 1</diffuse>
          </material>
        </visual>
        <inertial>
          <mass>5.0</mass>
          <inertia>
            <ixx>0.25</ixx>
            <ixy>0</ixy>
            <ixz>0</ixz>
            <iyy>0.25</iyy>
            <iyz>0</iyz>
            <izz>0.1</izz>
          </inertia>
        </inertial>
      </link>
    </model>

    <!-- Goal object -->
    <model name="goal">
      <pose>4 0 0.5 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry>
            <sphere>
              <radius>0.15</radius>
            </sphere>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <sphere>
              <radius>0.15</radius>
            </sphere>
          </geometry>
          <material>
            <ambient>0 1 0 1</ambient>
            <diffuse>0 1 0 1</diffuse>
          </material>
        </visual>
        <inertial>
          <mass>0.1</mass>
          <inertia>
            <ixx>0.000675</ixx>
            <ixy>0</ixy>
            <ixz>0</ixz>
            <iyy>0.000675</iyy>
            <iyz>0</iyz>
            <izz>0.000675</izz>
          </inertia>
        </inertial>
      </link>
    </model>

    <!-- Lighting -->
    <light type="directional" name="sun">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <direction>-0.6 0.3 -0.8</direction>
    </light>

    <!-- Physics configuration -->
    <physics name="ode" type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
    </physics>
  </world>
</sdf>
```

## Optimization Techniques

### Performance Optimization

Optimizing Gazebo Classic for better performance with complex Physical AI scenes:

1. **Reduce Visual Complexity**:
   - Use simpler collision geometries than visual geometries
   - Limit the number of detailed meshes in the scene

2. **Physics Parameter Tuning**:
   - Adjust the time step based on required stability
   - Tune solver parameters for specific applications

3. **Sensor Optimization**:
   - Lower update rates for sensors that don't require high frequency
   - Reduce sensor resolutions where possible

Here are optimized parameters for performance:

```xml
<physics name="fast_physics" type="ode">
  <!-- Larger time step for better performance -->
  <max_step_size>0.002</max_step_size>
  <real_time_factor>1</real_time_factor>
  <!-- Lower update rate for better performance -->
  <real_time_update_rate>500</real_time_update_rate>

  <ode>
    <solver>
      <!-- Reduced iterations for better performance -->
      <type>quick</type>
      <iters>50</iters>
      <sor>1.3</sor>
    </solver>
    <constraints>
      <!-- Slightly higher values for stability at higher time steps -->
      <cfm>0.0001</cfm>
      <erp>0.2</erp>
      <contact_max_correcting_vel>10</contact_max_correcting_vel>
      <contact_surface_layer>0.002</contact_surface_layer>
    </constraints>
  </ode>
</physics>
```

### Memory and Resource Management

Managing resources for large-scale Physical AI simulations:

1. **Model Caching**: Cache frequently-used models to reduce loading time
2. **Scene Streaming**: For very large environments, stream models in/out as needed
3. **Level of Detail (LOD)**: Use simplified models when far from the robot

## Debugging and Troubleshooting

### Common Simulation Issues

1. **Instability in Humanoid Robots**:
   - Check mass and inertia values
   - Verify joint limits and damping
   - Adjust physics parameters

2. **Penetration Between Objects**:
   - Increase physics update rate
   - Adjust ERP and CFM values
   - Verify collision geometries

3. **Sensor Noise**:
   - Calibrate sensor noise parameters
   - Check sensor placement and orientation

### Debugging Tools

Gazebo Classic provides several tools for debugging:

```bash
# View simulation statistics
gz stats

# List all entities in the simulation
gz model --list

# Echo a specific topic to debug sensor data
rostopic echo /camera/image_raw

# List all available topics
rostopic list

# Measure round trip times for topics
rostopic hz /joint_states
```

## Integration with Physical AI Frameworks

### Vision-Based Navigation Integration

Setting up cameras and vision processing pipelines:

```xml
<!-- RGB-D camera for 3D vision -->
<sensor name="rgbd_camera" type="depth">
  <always_on>true</always_on>
  <update_rate>30</update_rate>
  <camera name="head_rgbd">
    <horizontal_fov>1.047</horizontal_fov> <!-- 60 degrees -->
    <image>
      <width>640</width>
      <height>480</height>
      <format>R8G8B8</format>
    </image>
    <clip>
      <near>0.1</near>
      <far>5.0</far>
    </clip>
  </camera>
  <plugin name="openni_kinect_controller" filename="libgazebo_ros_openni_kinect.so">
    <baseline>0.2</baseline>
    <alwaysOn>true</alwaysOn>
    <updateRate>30.0</updateRate>
    <cameraName>head_rgbd</cameraName>
    <imageTopicName>/rgb/image_raw</imageTopicName>
    <depthImageTopicName>/depth/image_raw</depthImageTopicName>
    <pointCloudTopicName>/depth/points</pointCloudTopicName>
    <cameraInfoTopicName>/rgb/camera_info</cameraInfoTopicName>
    <depthImageCameraInfoTopicName>/depth/camera_info</depthImageCameraInfoTopicName>
    <frameName>head_rgbd_frame</frameName>
    <pointCloudCutoff>0.5</pointCloudCutoff>
    <pointCloudCutoffMax>3.0</pointCloudCutoffMax>
  </plugin>
</sensor>
```

### Manipulation Environment Setup

Creating environments for robotic manipulation tasks:

```xml
<!-- Table for manipulation -->
<model name="manipulation_table">
  <pose>1 0 0 0 0 0</pose>
  <static>true</static>
  <link name="table_link">
    <collision name="collision">
      <geometry>
        <box>
          <size>1.2 0.8 0.8</size>
        </box>
      </geometry>
    </collision>
    <visual name="visual">
      <geometry>
        <box>
          <size>1.2 0.8 0.8</size>
        </box>
      </geometry>
      <material>
        <ambient>0.6 0.4 0.2 1</ambient>
        <diffuse>0.8 0.6 0.4 1</diffuse>
      </material>
    </visual>
  </link>
</model>

<!-- Objects to manipulate -->
<model name="manip_object_1">
  <pose>1.1 0.1 0.85 0 0 0</pose>
  <link name="object_link">
    <inertial>
      <mass>0.2</mass>
      <inertia>
        <ixx>0.00013</ixx>
        <ixy>0</ixy>
        <ixz>0</ixz>
        <iyy>0.00013</iyy>
        <iyz>0</iyz>
        <izz>0.00013</izz>
      </inertia>
    </inertial>
    <collision name="collision">
      <geometry>
        <cylinder>
          <radius>0.05</radius>
          <length>0.15</length>
        </cylinder>
      </geometry>
    </collision>
    <visual name="visual">
      <geometry>
        <cylinder>
          <radius>0.05</radius>
          <length>0.15</length>
        </cylinder>
      </geometry>
      <material>
        <ambient>1 0 0 1</ambient>
        <diffuse>1 0 0 1</diffuse>
      </material>
    </visual>
  </link>
</model>
```

## Quality Assurance and Validation

### Simulation Validation Techniques

Validating that the simulation accurately represents the real world:

1. **Compare with Real-World Data**: Record sensor data from real robots and compare with simulated data
2. **Physics Validation**: Test basic physics behaviors (falling, contact, friction)
3. **Kinematic Validation**: Verify that robot kinematics match the real robot

### Testing Scenarios

Creating standardized tests for Physical AI simulation systems:

```bash
# Test 1: Basic movement
# Command the robot to move forward and verify it moves realistically

# Test 2: Balance behavior
# Place the robot on an inclined surface and verify it maintains balance

# Test 3: Manipulation
# Have the robot pick up and move objects, verifying realistic physics interaction

# Test 4: Perception accuracy
# Compare detected object poses in simulation with ground truth
```

## Best Practices for Physical AI Simulation

### Model Design Guidelines

1. **Realistic Inertial Properties**: Ensure mass and inertia values match real hardware
2. **Appropriate Joint Limits**: Set joint limits that reflect the physical robot
3. **Sensible Friction Values**: Use realistic friction coefficients for different materials
4. **Accurate Sensor Models**: Match simulation sensors to real hardware specifications

### Simulation Configuration Best Practices

1. **Consistent Time Stepping**: Maintain consistent physics time steps for reproducibility
2. **Appropriate Update Rates**: Balance simulation fidelity with computational efficiency
3. **Realistic Environmental Conditions**: Include appropriate lighting, friction, and perturbations
4. **Regular Validation**: Periodically validate simulation results against real-world behavior

## Conclusion

Gazebo Classic remains a powerful and versatile simulation environment for Physical AI and humanoid robotics development. Its mature plugin system, robust physics engine, and strong ROS integration make it ideal for:

1. **Algorithm Development**: Testing and refining control algorithms before deployment
2. **Training Data Generation**: Creating synthetic datasets for machine learning
3. **Safety Validation**: Verifying robot behaviors in safe, virtual environments
4. **Multi-Robot Coordination**: Testing team behaviors with multiple robots
5. **Perception System Testing**: Validating sensor processing pipelines

When properly configured, Gazebo Classic provides a close approximation to real-world conditions, enabling faster and safer development cycles for Physical AI systems. The key to success lies in accurately modeling the physics, sensors, and environmental conditions relevant to your specific application.

As we continue through this book, we'll see how these simulation techniques integrate with perception, navigation, and control systems to form complete Physical AI implementations.