---
sidebar_position: 2
title: 'Ignition Harmonic'
---

# Ignition Harmonic: Advanced Physics Simulation for Physical AI

## Introduction to Ignition Harmonic

Ignition Harmonic represents the next generation of physics simulation for robotics, evolving from Gazebo Classic to provide enhanced performance, modularity, and extensibility. As part of the Gazebo ecosystem, Ignition Harmonic offers advanced simulation capabilities essential for developing and testing Physical AI systems.

This chapter explores Ignition Harmonic's architecture, features, and application in simulating complex humanoid robots and their interactions with the physical world.

## Architecture and Core Concepts

### Modular Design

Ignition Harmonic follows a modular architecture that separates:

- **Ignition Gazebo**: The core simulation engine
- **Ignition Physics**: Physics simulation backend
- **Ignition Transport**: Message passing system
- **Ignition GUI**: Graphical interface components
- **Ignition Common**: Common utilities and interfaces

### Core Components

```xml
<!-- Example Ignition Harmonic World Definition -->
<?xml version="1.0"?>
<sdf version="1.7">
  <world name="harmonic_example">
    <!-- Physics Engine Configuration -->
    <physics name="1ms_physics" type="ignored">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
      <gravity>0 0 -9.8</gravity>
    </physics>

    <!-- Lighting -->
    <light name="sun" type="directional">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.8 0.8 0.8 1</diffuse>
      <specular>0.2 0.2 0.2 1</specular>
      <attenuation>
        <range>300</range>
        <constant>0.9</constant>
        <linear>0.01</linear>
        <quadratic>0.001</quadratic>
      </attenuation>
      <direction>-0.5 0.1 -0.9</direction>
    </light>

    <!-- Ground Plane -->
    <model name="ground_plane">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>100 100</size>
            </plane>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>100 100</size>
            </plane>
          </geometry>
          <material>
            <ambient>0.4 0.4 0.4 1</ambient>
            <diffuse>0.8 0.8 0.8 1</diffuse>
            <specular>0.2 0.2 0.2 1</specular>
          </material>
        </visual>
      </link>
    </model>

    <!-- Example humanoid robot -->
    <model name="humanoid_robot">
      <pose>0 0 0.85 0 0 0</pose>
      <include>
        <uri>model://humanoid_robot</uri>
      </include>
    </model>

    <!-- Sensors and plugins -->
    <plugin name="world_control" filename="WorldControl">
      <pose_topic>~/pose_cmd</pose_topic>
      <service>~/world/control</service>
    </plugin>

    <plugin name="physics_info" filename="PhysicsInfoSystem"/>
  </world>
</sdf>
```

## Installation and Setup

### Installing Ignition Harmonic

For Ubuntu 22.04:

```bash
# Add Ignition repository
curl -sSL https://raw.githubusercontent.com/ignition-tooling/gazebodistros/master/ignition-harmonic/install_ignition.sh | bash

# Install Ignition Harmonic packages
sudo apt-get install ignition-harmonic

# Or install specific components
sudo apt-get install ignition-gazebo6 ignition-physics6 ignition-tools
```

### Verification

```bash
# Check installation
ign gazebo --version

# Run a simple example
ign gazebo shapes.sdf

# Check available systems
ign gazebo -s
```

## Advanced Physics Simulation

### Physics Engines in Ignition

Ignition Harmonic supports multiple physics backends through its plugin architecture:

1. **DART (Dynamic Animation and Robotics Toolkit)**
2. **ODE (Open Dynamics Engine)**
3. **Bullet Physics**
4. **TPE (Tiny Physics Engine)**

```xml
<!-- Selecting a specific physics engine -->
<physics name="dart_physics" type="dart">
  <max_step_size>0.001</max_step_size>
  <real_time_factor>1.0</real_time_factor>
  <real_time_update_rate>1000</real_time_update_rate>
  <gravity>0 0 -9.8</gravity>

  <!-- DART-specific parameters -->
  <dart>
    <solver>
      <type>PGS</type>
      <iterations>50</iterations>
      <solver_accuracy>1e-6</solver_accuracy>
    </solver>
    <collision_detector>ODE</collision_detector>
  </dart>
</physics>
```

### Advanced Contact Modeling

Ignition Harmonic provides sophisticated contact modeling for Physical AI applications:

```xml
<!-- Advanced contact configuration for humanoid feet -->
<model name="humanoid_robot">
  <link name="left_foot">
    <collision name="collision">
      <geometry>
        <box>
          <size>0.2 0.1 0.05</size>
        </box>
      </geometry>
      <surface>
        <friction>
          <ode>
            <mu>0.8</mu>
            <mu2>0.8</mu2>
            <fdir1>0 0 1</fdir1>
          </ode>
          <torsional>
            <coefficient>0.5</coefficient>
            <use_patch_radius>true</use_patch_radius>
            <surface_radius>0.05</surface_radius>
          </torsional>
        </friction>
        <contact>
          <ode>
            <soft_erp>0.2</soft_erp>
            <soft_cfm>0.001</soft_cfm>
            <kp>1e5</kp>
            <kd>100</kd>
            <max_vel>100.0</max_vel>
            <min_depth>0.001</min_depth>
          </ode>
        </contact>
      </surface>
    </collision>
  </link>
</model>
```

## Sensor Simulation for Physical AI

### Camera Sensors

Advanced camera configurations for computer vision in humanoid robotics:

```xml
<sensor name="head_camera" type="camera">
  <always_on>true</always_on>
  <update_rate>30</update_rate>
  <visual>camera_visual</visual>
  <camera>
    <horizontal_fov>1.047</horizontal_fov> <!-- 60 degrees -->
    <image>
      <width>640</width>
      <height>480</height>
      <format>RGB_INT8</format>
    </image>
    <clip>
      <near>0.1</near>
      <far>100</far>
    </clip>
    <save enabled="false">
      <path>/tmp/camera_images</path>
    </save>
    <distortion>
      <k1>-0.16</k1>
      <k2>0.15</k2>
      <k3>-0.01</k3>
      <p1>0.01</p1>
      <p2>0.01</p2>
      <center>320 240</center>
    </distortion>
  </camera>
  <plugin name="camera_plugin" filename="CameraSensor">
    <topic>head_camera/image</topic>
    <camera_info_topic>head_camera/camera_info</camera_info_topic>
  </plugin>
</sensor>
```

### LIDAR and Depth Sensors

For navigation and spatial awareness:

```xml
<sensor name="3d_lidar" type="gpu_lidar">
  <always_on>true</always_on>
  <update_rate>10</update_rate>
  <topic>scan_3d</topic>
  <ray>
    <scan>
      <horizontal>
        <samples>640</samples>
        <resolution>1</resolution>
        <min_angle>-3.14159</min_angle> <!-- -π -->
        <max_angle>3.14159</max_angle>  <!-- π -->
      </horizontal>
      <vertical>
        <samples>16</samples>
        <resolution>1</resolution>
        <min_angle>-0.2618</min_angle> <!-- -15 degrees -->
        <max_angle>0.2618</max_angle>  <!-- 15 degrees -->
      </vertical>
    </scan>
    <range>
      <min>0.1</min>
      <max>25.0</max>
      <resolution>0.01</resolution>
    </range>
  </ray>
  <plugin name="gpu_lidar_plugin" filename="GpuLidarSensor">
    <topic>laser_scan</topic>
  </plugin>
</sensor>
```

### IMU and Force/Torque Sensors

Critical for balance and control in humanoid robots:

```xml
<sensor name="torso_imu" type="imu">
  <always_on>true</always_on>
  <update_rate>100</update_rate>
  <topic>imu/data</topic>
  <visual>imu_visual</visual>
  <imu>
    <angular_velocity>
      <x>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>0.0017</stddev>
          <bias_mean>0.0</bias_mean>
          <bias_stddev>0.00017</bias_stddev>
        </noise>
      </x>
      <y>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>0.0017</stddev>
          <bias_mean>0.0</bias_mean>
          <bias_stddev>0.00017</bias_stddev>
        </noise>
      </y>
      <z>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>0.0017</stddev>
          <bias_mean>0.0</bias_mean>
          <bias_stddev>0.00017</bias_stddev>
        </noise>
      </z>
    </angular_velocity>
    <linear_acceleration>
      <x>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>0.0017</stddev>
          <bias_mean>0.0</bias_mean>
          <bias_stddev>0.00017</bias_stddev>
        </noise>
      </x>
      <y>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>0.0017</stddev>
          <bias_mean>0.0</bias_mean>
          <bias_stddev>0.00017</bias_stddev>
        </noise>
      </y>
      <z>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>0.0017</stddev>
          <bias_mean>0.0</bias_mean>
          <bias_stddev>0.00017</bias_stddev>
        </noise>
      </z>
    </linear_acceleration>
  </imu>
  <plugin name="imu_plugin" filename="ImuSensor">
    <topic>imu/data</topic>
  </plugin>
</sensor>

<sensor name="left_foot_ft" type="force_torque">
  <always_on>true</always_on>
  <update_rate>100</update_rate>
  <topic>left_foot/force_torque</topic>
  <visual>ft_visual</visual>
  <force_torque>
    <frame>child</frame>
    <measure_direction>child_to_parent</measure_direction>
  </force_torque>
  <plugin name="ft_plugin" filename="ForceTorqueSensor">
    <topic>left_foot/force_torque</topic>
  </plugin>
</sensor>
```

## System Plugins for Physical AI

### Custom System Plugins

Ignition Harmonic allows for custom system plugins that can modify simulation behavior:

```cpp
// Example custom system plugin for humanoid balance control
#include <ignition/gazebo/System.hh>
#include <ignition/gazebo/Model.hh>
#include <ignition/math/Pose3.hh>
#include <ignition/math/Vector3.hh>

namespace ignition {
namespace gazebo {
namespace systems {

class HumanoidBalanceControl : public System,
                               public ISystemConfigure,
                               public ISystemPreUpdate
{
public:
  HumanoidBalanceControl() = default;

  void Configure(const Entity &_entity,
                 const std::shared_ptr<const sdf::Element> &_sdf,
                 EntityComponentManager &_ecm,
                 EventManager &_eventMgr) override
  {
    this->model = Model(_entity);
  }

  void PreUpdate(const UpdateInfo &_info,
                 EntityComponentManager &_ecm) override
  {
    // Implement balance control logic here
    // Read IMU data, calculate corrective torques, apply to joints
  }

private:
  Model model;
};

IGNITION_ADD_PLUGIN(HumanoidBalanceControl,
                   System,
                   HumanoidBalanceControl::ISystemConfigure,
                   HumanoidBalanceControl::ISystemPreUpdate)

}
}
}
```

### Built-in System Plugins

Ignition Harmonic includes various system plugins for robotics simulation:

- **JointPositionController**: Controls joint positions
- **JointVelocityController**: Controls joint velocities
- **JointEffortController**: Controls joint efforts/torques
- **DiffDrive**: Differential drive controller
- **AckermannSteering**: Ackermann steering controller

```xml
<!-- Example of using a built-in joint controller -->
<model name="robot_with_controllers">
  <link name="base_link"/>

  <joint name="arm_joint" type="revolute">
    <parent>base_link</parent>
    <child>arm_link</child>
    <axis>
      <xyz>0 0 1</xyz>
      <limit><lower>-3.14</lower><upper>3.14</upper></limit>
    </axis>
  </joint>

  <link name="arm_link">
    <pose>0.2 0 0 0 0 0</pose>
  </link>

  <!-- Joint controller plugin -->
  <plugin name="joint_controller" filename="JointPositionController">
    <joint_name>arm_joint</joint_name>
    <topic>arm_joint/position</topic>
    <update_rate>100</update_rate>
  </plugin>
</model>
```

## Advanced Simulation Features

### Scene Graph and Rendering

Ignition Harmonic provides advanced rendering capabilities:

```xml
<scene>
  <grid>false</grid>
  <shadows>true</shadows>
  <sky>
    <clouds>
      <speed>0.5</speed>
      <direction>0.5 1 0</direction>
    </clouds>
  </sky>
  <shadows>
    <directional>
      <intensity>0.8</intensity>
    </directional>
  </shadows>
</scene>
```

### Multi-robot Simulation

Scaling to complex multi-robot Physical AI scenarios:

```xml
<sdf version="1.7">
  <world name="multi_humanoid_world">
    <!-- Shared physics -->
    <physics name="ode_physics" type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>0.8</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
      <gravity>0 0 -9.8</gravity>
    </physics>

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
      <direction>-0.3 0.3 -0.9</direction>
    </light>

    <!-- Ground plane -->
    <model name="ground_plane">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>100 100</size>
            </plane>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>100 100</size>
            </plane>
          </geometry>
          <material>
            <ambient>0.1 0.1 0.1 1</ambient>
            <diffuse>0.2 0.2 0.2 1</diffuse>
          </material>
        </visual>
      </link>
    </model>

    <!-- First humanoid robot -->
    <model name="humanoid_robot_1">
      <pose>0 2 0.85 0 0 0</pose>
      <include>
        <uri>model://humanoid_robot</uri>
      </include>
    </model>

    <!-- Second humanoid robot -->
    <model name="humanoid_robot_2">
      <pose>2 0 0.85 0 0 1.57</pose>
      <include>
        <uri>model://humanoid_robot</uri>
      </include>
    </model>

    <!-- Third humanoid robot -->
    <model name="humanoid_robot_3">
      <pose>-2 0 0.85 0 0 -1.57</pose>
      <include>
        <uri>model://humanoid_robot</uri>
      </include>
    </model>

    <!-- Interactive objects -->
    <model name="interactive_ball_1">
      <pose>1 1 0.5 0 0 0</pose>
      <link name="ball_link">
        <inertial>
          <mass>0.5</mass>
          <inertia>
            <ixx>0.001</ixx>
            <iyy>0.001</iyy>
            <izz>0.001</izz>
          </inertia>
        </inertial>
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
        <collision name="collision">
          <geometry>
            <sphere>
              <radius>0.1</radius>
            </sphere>
          </geometry>
        </collision>
      </link>
    </model>

    <!-- Environment elements -->
    <model name="obstacle_wall">
      <pose>0 -3 1 0 0 0</pose>
      <static>true</static>
      <link name="wall_link">
        <collision name="collision">
          <geometry>
            <box>
              <size>8 0.2 2</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>8 0.2 2</size>
            </box>
          </geometry>
          <material>
            <ambient>0.5 0.5 0.5 1</ambient>
            <diffuse>0.8 0.8 0.8 1</diffuse>
          </material>
        </visual>
      </link>
    </model>

    <!-- Plugins -->
    <plugin name="world_control" filename="WorldControl"/>
    <plugin name="scene_broadcaster" filename="SceneBroadcaster"/>
    <plugin name="physics_info" filename="PhysicsInfoSystem"/>
  </world>
</sdf>
```

## Performance Optimization

### Optimizing for Complex Physical AI Simulations

1. **Physics Parameters**:
   - Adjust max_step_size for optimal stability/performance tradeoff
   - Tune real_time_factor based on available computational resources
   - Use appropriate collision detectors for your scenario

2. **Rendering Optimization**:
   - Set rendering to off when not needed for headless simulations
   - Use lower resolution textures for faster rendering
   - Limit the number of simultaneous render operations

3. **Model Optimization**:
   - Use simplified collision geometries where detailed meshes aren't needed
   - Reduce the number of visual elements that don't affect simulation
   - Use instancing when multiple identical objects are needed

### Configuration for High-Fidelity Humanoid Simulation

```xml
<!-- Optimized configuration for humanoid robotics simulation -->
<physics name="humanoid_optimized_physics" type="dart">
  <max_step_size>0.0005</max_step_size> <!-- Fine-grained steps for stability -->
  <real_time_factor>0.5</real_time_factor> <!-- Allow more processing time -->
  <real_time_update_rate>2000</real_time_update_rate>
  <gravity>0 0 -9.80665</gravity> <!-- Precise gravity constant -->

  <dart>
    <solver>
      <type>ODE</type>
      <iterations>100</iterations> <!-- More iterations for stability -->
      <solver_accuracy>1e-6</solver_accuracy>
    </solver>
    <collision_detector>ODE</collision_detector>
  </dart>
</physics>
```

## Integration with ROS 2

### ROS 2 Bridges

Ignition Harmonic provides bridges to connect with ROS 2:

```bash
# Run Ignition Harmonic with ROS 2 bridge
ign gazebo -r example_world.sdf --ros-args -r /worlds/demo_world/ros_ign_bridge.yaml

# Example bridge configuration
- ros_topic_name: "/cmd_vel"
  ign_topic_name: "/model/vehicle/cmd_vel"
  ros_type_name: "geometry_msgs/msg/Twist"
  ign_type_name: "ignition.msgs.Twist"

- ros_topic_name: "/camera/image"
  ign_topic_name: "/camera/rgb/image_raw"
  ros_type_name: "sensor_msgs/msg/Image"
  ign_type_name: "ignition.msgs.Image"
```

### Launching with ROS 2 Integration

```python
# Python launch file for Ignition Harmonic with ROS 2
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import PathJoinSubstitution
from launch_ros.actions import Node
from launch.actions import ExecuteProcess
from ament_index_python.packages import get_package_share_directory


def generate_launch_description():
    # Launch Ignition with a specific world
    ignition_launch = ExecuteProcess(
        cmd=[
            'ign', 'gazebo', '-r',
            PathJoinSubstitution([
                get_package_share_directory('my_physical_ai_package'),
                'worlds',
                'humanoid_demo.sdf'
            ])
        ],
        output='screen'
    )

    # Launch ROS 2 bridge
    ros_bridge = Node(
        package='ros_ign_bridge',
        executable='parameter_bridge',
        arguments=[
            '/cmd_vel@geometry_msgs/msg/Twist@ignition.msgs.Twist',
            '/camera/image@sensor_msgs/msg/Image@ignition.msgs.Image',
            '/imu/data@sensor_msgs/msg/Imu@ignition.msgs.IMU',
            '/tf@tf2_msgs/msg/TFMessage@ignition.msgs.Pose_V'
        ],
        output='screen'
    )

    return LaunchDescription([
        ignition_launch,
        ros_bridge
    ])
```

## Simulation Scenarios for Physical AI

### Humanoid Walking Simulation

Creating complex walking scenarios for humanoid robots:

```xml
<world name="humanoid_walking_scenario">
  <physics name="humanoid_physics" type="dart">
    <max_step_size>0.001</max_step_size>
    <real_time_factor>0.8</real_time_factor>
    <real_time_update_rate>1000</real_time_update_rate>
    <gravity>0 0 -9.8</gravity>
  </physics>

  <!-- Terrain variations for gait training -->
  <model name="varied_terrain">
    <static>true</static>
    <link name="terrain_link">
      <collision name="flat_ground">
        <pose>0 0 0 0 0 0</pose>
        <geometry>
          <plane>
            <normal>0 0 1</normal>
            <size>20 5</size>
          </plane>
        </geometry>
      </collision>

      <collision name="step_up">
        <pose>5 0 0.1 0 0 0</pose>
        <geometry>
          <box>
            <size>2 5 0.2</size>
          </box>
        </geometry>
      </collision>

      <collision name="step_down">
        <pose>8 0 -0.1 0 0 0</pose>
        <geometry>
          <box>
            <size>2 5 0.2</size>
          </box>
        </geometry>
      </collision>

      <collision name="slope">
        <pose>12 0 0 0 0.1 0</pose>
        <geometry>
          <box>
            <size>4 5 0.2</size>
          </box>
        </geometry>
      </collision>
    </link>
  </model>

  <!-- Humanoid robot positioned at start -->
  <model name="humanoid_robot">
    <pose>0 0 0.85 0 0 0</pose>
    <include>
      <uri>model://advanced_humanoid</uri>
    </include>
  </model>

  <!-- Goals and checkpoints -->
  <model name="checkpoint_1">
    <pose>5 0 0.5 0 0 0</pose>
    <static>true</static>
    <link name="checkpoint_visual">
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
    </link>
  </model>
</world>
```

### Manipulation Training Environments

```xml
<world name="humanoid_manipulation_lab">
  <physics name="manipulation_physics" type="dart">
    <max_step_size>0.0005</max_step_size>
    <real_time_factor>0.5</real_time_factor>
    <real_time_update_rate>2000</real_time_update_rate>
    <gravity>0 0 -9.8</gravity>
  </physics>

  <!-- Workbench -->
  <model name="workbench">
    <pose>0.5 0 0 0 0 0</pose>
    <static>true</static>
    <link name="table_link">
      <collision name="collision">
        <geometry>
          <box>
            <size>1.0 0.8 0.8</size>
          </box>
        </geometry>
      </collision>
      <visual name="visual">
        <geometry>
          <box>
            <size>1.0 0.8 0.8</size>
          </box>
        </geometry>
        <material>
          <ambient>0.6 0.4 0.2 1</ambient>
          <diffuse>0.8 0.6 0.4 1</diffuse>
        </material>
      </visual>
    </link>
  </model>

  <!-- Objects for manipulation -->
  <model name="manipulation_objects">
    <!-- Cup -->
    <model name="cup">
      <pose>0.6 0.1 0.85 0 0 0</pose>
      <link name="cup_link">
        <inertial>
          <mass>0.2</mass>
          <inertia>
            <ixx>0.001</ixx>
            <iyy>0.001</iyy>
            <izz>0.0005</izz>
          </inertia>
        </inertial>
        <visual name="visual">
          <geometry>
            <cylinder>
              <radius>0.04</radius>
              <length>0.1</length>
            </cylinder>
          </geometry>
          <material>
            <ambient>0 0 1 1</ambient>
            <diffuse>0 0 1 1</diffuse>
          </material>
        </visual>
        <collision name="collision">
          <geometry>
            <cylinder>
              <radius>0.04</radius>
              <length>0.1</length>
            </cylinder>
          </geometry>
        </collision>
      </link>
    </model>

    <!-- Block -->
    <model name="block">
      <pose>0.7 -0.1 0.85 0 0 0.3</pose>
      <link name="block_link">
        <inertial>
          <mass>0.3</mass>
          <inertia>
            <ixx>0.002</ixx>
            <iyy>0.002</iyy>
            <izz>0.002</izz>
          </inertia>
        </inertial>
        <visual name="visual">
          <geometry>
            <box>
              <size>0.08 0.08 0.08</size>
            </box>
          </geometry>
          <material>
            <ambient>1 0 0 1</ambient>
            <diffuse>1 0 0 1</diffuse>
          </material>
        </visual>
        <collision name="collision">
          <geometry>
            <box>
              <size>0.08 0.08 0.08</size>
            </box>
          </geometry>
        </collision>
      </link>
    </model>

    <!-- Sphere -->
    <model name="sphere">
      <pose>0.8 0.2 0.85 0 0 0</pose>
      <link name="sphere_link">
        <inertial>
          <mass>0.15</mass>
          <inertia>
            <ixx>0.0005</ixx>
            <iyy>0.0005</iyy>
            <izz>0.0005</izz>
          </inertia>
        </inertial>
        <visual name="visual">
          <geometry>
            <sphere>
              <radius>0.05</radius>
            </sphere>
          </geometry>
          <material>
            <ambient>0 1 0 1</ambient>
            <diffuse>0 1 0 1</diffuse>
          </material>
        </visual>
        <collision name="collision">
          <geometry>
            <sphere>
              <radius>0.05</radius>
            </sphere>
          </geometry>
        </collision>
      </link>
    </model>
  </model>

  <!-- Humanoid robot -->
  <model name="humanoid_robot">
    <pose>0 0 0.85 0 0 1.57</pose>
    <include>
      <uri>model://manipulation_humanoid</uri>
    </include>
  </model>
</world>
```

## Troubleshooting Common Issues

### Performance Issues

1. **Slow Simulation**:
   - Increase max_step_size (trade accuracy for performance)
   - Reduce real_time_update_rate
   - Simplify collision meshes
   - Turn off unnecessary visual elements

2. **Instability**:
   - Decrease max_step_size for better accuracy
   - Increase solver iterations
   - Check mass and inertia values
   - Verify joint limits and constraints

3. **Rendering Problems**:
   - Check GPU drivers and compatibility
   - Try running without GUI for pure physics simulation
   - Reduce visual complexity in models

### Physics Issues

1. **Objects Falling Through Ground**:
   - Check collision geometry alignment with visual geometry
   - Verify contact parameters
   - Ensure appropriate mass values
   - Check for penetrations at initial pose

2. **Jittery Movements**:
   - Adjust ERP and CFM values
   - Verify joint limits
   - Check mass distribution
   - Increase solver iterations

## Conclusion

Ignition Harmonic provides a powerful simulation environment specifically well-suited for Physical AI and humanoid robotics research and development. Its modular architecture, advanced physics capabilities, and extensibility make it ideal for creating complex simulation scenarios that mirror real-world challenges.

Key advantages of Ignition Harmonic for Physical AI:

1. **Modular Architecture**: Allows for selective component usage and custom integrations
2. **Advanced Physics**: Support for multiple physics engines with sophisticated contact modeling
3. **Realistic Sensors**: High-fidelity simulation of cameras, LIDAR, IMU, and force/torque sensors
4. **Scalability**: Capable of simulating complex multi-robot scenarios
5. **ROS Integration**: Seamless bridging with ROS 2 for comprehensive system development
6. **Extensibility**: Custom system plugins allow for specialized Physical AI behaviors

As you continue your journey in Physical AI and humanoid robotics, Ignition Harmonic provides the advanced simulation tools necessary to develop, test, and validate complex robot behaviors before deployment on physical hardware.

---

## 🚀 Key Takeaways for Physical AI Development

- **Modular Architecture**: Leverage Ignition's component-based design for custom Physical AI system integration
- **Physics Fidelity**: Choose appropriate physics parameters for your humanoid robot's requirements
- **Sensor Simulation**: Use realistic sensor models to enable robust perception algorithms
- **Scalability**: Design simulations that can handle complex multi-agent scenarios
- **Performance**: Optimize simulation parameters for your computational resources

## 🎯 Next Steps in Physical AI

With Ignition Harmonic simulation capabilities, advance to:
- **Isaac Sim**: NVIDIA's advanced simulation platform for AI research
- **Perception Systems**: Develop computer vision algorithms using your simulated data
- **Control Systems**: Implement sophisticated control algorithms for humanoid robots
- **Human-Robot Interaction**: Create scenarios for studying physical AI interaction with humans

Continue building your expertise in Physical AI by implementing the examples in this chapter and experimenting with complex simulation scenarios.