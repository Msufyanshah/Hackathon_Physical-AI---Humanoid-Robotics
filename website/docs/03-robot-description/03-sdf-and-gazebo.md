---
sidebar_position: 3
title: 'SDF & Gazebo'
---

# SDF and Gazebo: Simulation for Physical AI Systems

## Introduction to Simulation in Physical AI

Simulation plays a critical role in Physical AI and humanoid robotics development. It provides a safe, cost-effective environment for testing algorithms, validating robot models, and developing control strategies before deployment on physical hardware. SDF (Simulation Description Format) and Gazebo form the cornerstone of robotics simulation in the ROS ecosystem.

This chapter explores how SDF and Gazebo work together to create realistic simulation environments for complex Physical AI systems, from simple robots to detailed humanoid models navigating complex environments.

## Understanding SDF (Simulation Description Format)

### SDF Fundamentals

SDF is a markup language that describes simulation environments, robots, and objects. It's fundamentally different from URDF in its purpose:
- **URDF**: Describes a robot for a single application in ROS
- **SDF**: Describes a complete simulation environment including multiple robots, objects, lights, and environmental effects

### SDF Syntax and Structure

SDF files follow a hierarchical structure:

```xml
<sdf version="1.7">
  <world name="my_world">
    <!-- Environmental settings -->
    <gravity>0 0 -9.8</gravity>
    <physics type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1</real_time_factor>
    </physics>

    <!-- Light sources -->
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

    <!-- Models -->
    <model name="humanoid_robot" canonical_link="base_link">
      <include>
        <uri>model://humanoid_robot</uri>
        <pose>0 0 1.0 0 0 0</pose>
      </include>
    </model>

    <model name="ground_plane">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <surface>
            <friction>
              <ode>
                <mu>1.0</mu>
                <mu2>1.0</mu2>
              </ode>
            </friction>
          </surface>
        </collision>
        <visual name="visual">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>100 100</size>
            </plane>
          </geometry>
          <material>
            <ambient>0.7 0.7 0.7 1</ambient>
            <diffuse>0.7 0.7 0.7 1</diffuse>
            <specular>0.7 0.7 0.7 1</specular>
          </material>
        </visual>
      </link>
    </model>

    <!-- Plugins -->
    <plugin name="world_control" filename="libgazebo_ros_init.so">
      <alwaysOn>true</alwaysOn>
      <updateRate>1.0</updateRate>
      <robotNamespace>/humanoid_robot</robotNamespace>
    </plugin>
  </world>
</sdf>
```

## SDF Elements in Detail

### World Element

The world element defines the simulation environment:

```xml
<world name="basic_world">
  <!-- Gravity vector in m/s^2 -->
  <gravity>0 0 -9.8</gravity>

  <!-- Magnetic field vector -->
  <magnetic_field>6e-06 2.3e-05 -4.2e-05</magnetic_field>

  <!-- Physics engine -->
  <physics name="ode_physics" type="ode">
    <max_step_size>0.001</max_step_size>      <!-- Time step in seconds -->
    <real_time_factor>1</real_time_factor>    <!-- Simulation speed relative to real time -->
    <real_time_update_rate>1000</real_time_update_rate>  <!-- Updates per second -->

    <!-- ODE-specific parameters -->
    <ode>
      <solver>
        <type>quick</type>                    <!-- Type of solver -->
        <iters>10</iters>                     <!-- Number of iterations -->
        <sor>1.3</sor>                        <!-- Successive over-relaxation parameter -->
      </solver>
      <constraints>
        <cfm>0</cfm>                          <!-- Constraint force mixing -->
        <erp>0.2</erp>                        <!-- Error reduction parameter -->
        <contact_max_correcting_vel>100</contact_max_correcting_vel>
        <contact_surface_layer>0.001</contact_surface_layer>
      </constraints>
    </ode>
  </physics>

  <!-- Atmosphere properties -->
  <atmosphere type="adiabatic">
    <temperature>288.15</temperature>
    <pressure>101325</pressure>
  </atmosphere>

  <!-- Scene properties -->
  <scene>
    <ambient>0.4 0.4 0.4 1</ambient>         <!-- Ambient light color -->
    <background>0.7 0.7 0.7 1</background>   <!-- Background color -->
    <shadows>true</shadows>                  <!-- Enable shadows -->
  </scene>

  <!-- Wind properties -->
  <wind>
    <linear_velocity>0.5 0 0</linear_velocity>
  </wind>
</world>
```

### Model Element

Models represent physical objects in the simulation:

```xml
<model name="humanoid_robot">
  <!-- Model pose (x y z roll pitch yaw) -->
  <pose>0 0 1 0 0 0</pose>

  <!-- Static models don't move -->
  <static>false</static>

  <!-- Self-collide allows different parts of the same model to collide -->
  <self_collide>false</self_collide>

  <!-- Enable wind interaction -->
  <enable_wind>false</enable_wind>

  <!-- Kinematic models follow predefined trajectories -->
  <kinematic>false</kinematic>

  <!-- Canonical link for coordinate frame -->
  <canonical_link>base_link</canonical_link>

  <!-- Model properties -->
  <link name="base_link">
    <!-- Inertial properties -->
    <inertial>
      <mass>10.0</mass>
      <inertia>
        <ixx>0.4</ixx>
        <ixy>0.0</ixy>
        <ixz>0.0</ixz>
        <iyy>0.4</iyy>
        <iyz>0.0</iyz>
        <izz>0.2</izz>
      </inertia>
    </inertial>

    <!-- Visual properties -->
    <visual name="visual">
      <geometry>
        <box>
          <size>0.5 0.5 0.5</size>
        </box>
      </geometry>
      <material>
        <ambient>0.2 0.2 1 1</ambient>
        <diffuse>0.2 0.2 1 1</diffuse>
        <specular>0.2 0.2 1 1</specular>
      </material>
      <transparency>0.5</transparency>  <!-- 0 = opaque, 1 = transparent -->
      <cast_shadows>true</cast_shadows>
    </visual>

    <!-- Collision properties -->
    <collision name="collision">
      <geometry>
        <box>
          <size>0.5 0.5 0.5</size>
        </box>
      </geometry>
      <surface>
        <friction>
          <ode>
            <mu>1.0</mu>      <!-- Primary friction coefficient -->
            <mu2>1.0</mu2>    <!-- Secondary friction coefficient -->
            <fdir1>0 0 0</fdir1>  <!-- Friction direction -->
            <slip1>0</slip1>     <!-- Slip coefficient 1 -->
            <slip2>0</slip2>     <!-- Slip coefficient 2 -->
          </ode>
          <torsional>
            <coefficient>1.0</coefficient>
            <use_patch_radius>false</use_patch_radius>
            <patch_radius>0.1</patch_radius>
            <surface_radius>0.01</surface_radius>
            <ode>
              <slip>0</slip>
            </ode>
          </torsional>
        </friction>
        <bounce>
          <restitution_coefficient>0.1</restitution_coefficient>
          <threshold>100000</threshold>
        </bounce>
        <contact>
          <ode>
            <soft_cfm>0</soft_cfm>
            <soft_erp>0.2</soft_erp>
            <kp>1e+13</kp>     <!-- Contact stiffness -->
            <kd>1</kd>         <!-- Damping coefficient -->
            <max_vel>100.0</max_vel>
            <min_depth>0.001</min_depth>
          </ode>
        </contact>
      </surface>
    </collision>

    <!-- Forces and moments -->
    <velocity_decay>
      <linear>0.01</linear>
      <angular>0.01</angular>
    </velocity_decay>
  </link>

  <!-- Joints connect links -->
  <joint name="wheel_joint" type="continuous">
    <parent>base_link</parent>
    <child>wheel_link</child>
    <pose>0.2 0 -0.1 0 0 0</pose>
    <axis>
      <xyz>0 1 0</xyz>        <!-- Rotation axis -->
      <limit>
        <lower>-1e+16</lower>    <!-- Lower limit (-inf for continuous) -->
        <upper>1e+16</upper>     <!-- Upper limit (inf for continuous) -->
        <effort>100</effort>    <!-- Max effort -->
        <velocity>10</velocity> <!-- Max velocity -->
      </limit>
      <dynamics>
        <damping>0.1</damping>    <!-- Damping coefficient -->
        <friction>0.1</friction> <!-- Friction coefficient -->
      </dynamics>
    </axis>
  </joint>
</model>
```

## Advanced SDF Concepts for Physical AI

### Custom SDF Models for Humanoid Robots

For complex humanoid robots, the SDF model integrates with URDF through the `<include>` tag:

```xml
<sdf version="1.7">
  <world name="humanoid_world">
    <light type="directional" name="sun">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.8 0.8 0.8 1</diffuse>
      <specular>0.2 0.2 0.2 1</specular>
      <direction>-0.6 0.3 -0.8</direction>
    </light>

    <!-- Ground plane -->
    <model name="ground_plane">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
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
            <script>
              <uri>file://media/materials/scripts/gazebo.material</uri>
              <name>Gazebo/Grey</name>
            </script>
          </material>
        </visual>
      </link>
    </model>

    <!-- Humanoid robot model from URDF -->
    <include>
      <uri>model://humanoid_robot_description</uri>
      <name>humanoid_robot_01</name>
      <pose>0 0 1.0 0 0 0</pose>
    </include>

    <!-- Additional humanoid robot -->
    <include>
      <uri>model://humanoid_robot_description</uri>
      <name>humanoid_robot_02</name>
      <pose>2 0 1.0 0 0 0</pose>
    </include>

    <!-- Simple obstacle -->
    <model name="obstacle_box">
      <pose>1 1 0.5 0 0 0</pose>
      <link name="link">
        <inertial>
          <mass>1.0</mass>
          <inertia>
            <ixx>0.1</ixx>
            <ixy>0.0</ixy>
            <ixz>0.0</ixz>
            <iyy>0.1</iyy>
            <iyz>0.0</iyz>
            <izz>0.1</izz>
          </inertia>
        </inertial>
        <visual name="visual">
          <geometry>
            <box>
              <size>0.3 0.3 1.0</size>
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
              <size>0.3 0.3 1.0</size>
            </box>
          </geometry>
        </collision>
      </link>
    </model>

    <!-- Plugins for ROS integration -->
    <plugin name="gazebo_ros_init" filename="libgazebo_ros_init.so">
      <alwaysOn>true</alwaysOn>
      <updateRate>1.0</updateRate>
      <robotNamespace>/humanoid_robot</robotNamespace>
      <rosDebugLevel>na</rosDebugLevel>
    </plugin>

    <plugin name="gazebo_ros_factory" filename="libgazebo_ros_factory.so">
      <robotNamespace>/humanoid_robot</robotNamespace>
    </plugin>
  </world>
</sdf>
```

### Sensor Integration in SDF

Physical AI systems require various sensors which are defined in SDF:

```xml
<!-- RGB-D Camera -->
<link name="rgbd_camera_link">
  <pose>0.1 0 0.2 0 0 0</pose>
  <visual name="visual">
    <geometry>
      <box>
        <size>0.05 0.1 0.05</size>
      </box>
    </geometry>
  </visual>
  <collision name="collision">
    <geometry>
      <box>
        <size>0.05 0.1 0.05</size>
      </box>
    </geometry>
  </collision>
  <sensor name="rgbd_camera" type="depth">
    <always_on>true</always_on>
    <update_rate>30</update_rate>
    <camera name="head">
      <horizontal_fov>1.047</horizontal_fov>  <!-- Field of view in radians -->
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
    <plugin name="camera_controller" filename="libgazebo_ros_openni_kinect.so">
      <baseline>0.2</baseline>
      <alwaysOn>true</alwaysOn>
      <updateRate>30.0</updateRate>
      <cameraName>rgbd_camera</cameraName>
      <imageTopicName>/rgb/image_raw</imageTopicName>
      <depthImageTopicName>/depth/image_raw</depthImageTopicName>
      <pointCloudTopicName>/depth/points</pointCloudTopicName>
      <cameraInfoTopicName>/rgb/camera_info</cameraInfoTopicName>
      <depthImageCameraInfoTopicName>/depth/camera_info</depthImageCameraInfoTopicName>
      <frameName>rgbd_camera_optical_frame</frameName>
      <pointCloudCutoff>0.5</pointCloudCutoff>
      <pointCloudCutoffMax>3.0</pointCloudCutoffMax>
      <distortion_k1>0.0</distortion_k1>
      <distortion_k2>0.0</distortion_k2>
      <distortion_k3>0.0</distortion_k3>
      <distortion_t1>0.0</distortion_t1>
      <distortion_t2>0.0</distortion_t2>
      <CxPrime>0.0</CxPrime>
      <Cx>0.0</Cx>
      <Cy>0.0</Cy>
      <focal_length>0.0</focal_length>
      <hack_baseline>0.0</hack_baseline>
    </plugin>
  </sensor>
</link>

<!-- LIDAR Sensor -->
<link name="lidar_link">
  <pose>0.2 0 0.3 0 0 0</pose>
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
  <sensor name="lidar" type="ray">
    <always_on>true</always_on>
    <update_rate>40</update_rate>
    <ray>
      <scan>
        <horizontal>
          <samples>720</samples>
          <resolution>1</resolution>
          <min_angle>-3.14159265359</min_angle>  <!-- -π radians -->
          <max_angle>3.14159265359</max_angle>    <!-- π radians -->
        </horizontal>
      </scan>
      <range>
        <min>0.1</min>
        <max>30.0</max>
        <resolution>0.01</resolution>
      </range>
      <noise>
        <type>gaussian</type>
        <mean>0.0</mean>
        <stddev>0.01</stddev>
      </noise>
    </ray>
    <plugin name="laser_proc" filename="libgazebo_ros_laser.so">
      <topicName>/scan</topicName>
      <frameName>lidar_link</frameName>
      <alwaysOn>true</alwaysOn>
      <updateRate>40</updateRate>
    </plugin>
  </sensor>
</link>

<!-- IMU Sensor -->
<link name="imu_link">
  <pose>0 0 0.1 0 0 0</pose>
  <inertial>
    <mass>0.01</mass>
    <inertia>
      <ixx>0.0000001</ixx>
      <ixy>0</ixy>
      <ixz>0</ixz>
      <iyy>0.0000001</iyy>
      <iyz>0</iyz>
      <izz>0.0000001</izz>
    </inertia>
  </inertial>
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
    <plugin name="imu_plugin" filename="libgazebo_ros_imu.so">
      <alwaysOn>true</alwaysOn>
      <bodyName>imu_link</bodyName>
      <topicName>/imu/data</topicName>
      <serviceName>/imu/service</serviceName>
      <gaussianNoise>0.0</gaussianNoise>
      <updateRate>100.0</updateRate>
    </plugin>
  </sensor>
</link>
```

## Gazebo Integration with Physical AI Systems

### Gazebo Plugins for ROS Integration

Gazebo plugins bridge the gap between simulation and ROS:

```xml
<!-- Joint state publisher plugin -->
<plugin name="joint_state_publisher" filename="libgazebo_ros_joint_state_publisher.so">
  <ros>
    <namespace>/humanoid_robot</namespace>
  </ros>
  <update_rate>30</update_rate>
  <joint_name>left_hip_yaw</joint_name>
  <joint_name>left_hip_pitch</joint_name>
  <joint_name>left_knee</joint_name>
  <joint_name>right_hip_yaw</joint_name>
  <joint_name>right_hip_pitch</joint_name>
  <joint_name>right_knee</joint_name>
  <!-- Add more joints as needed -->
</plugin>

<!-- Joint trajectory controller plugin -->
<plugin name="joint_trajectory_controller" filename="libgazebo_ros_joint_trajectory.so">
  <robotNamespace>/humanoid_robot</robotNamespace>
  <topicName>/joint_trajectory</topicName>
  <serviceName>/joint_trajectory_service</serviceName>
  <jointName>left_hip_yaw</jointName>
  <jointName>left_hip_pitch</jointName>
  <jointName>left_knee</jointName>
  <jointName>right_hip_yaw</jointName>
  <jointName>right_hip_pitch</jointName>
  <jointName>right_knee</jointName>
  <updateRate>1000</updateRate>
</plugin>

<!-- Diff drive controller plugin for mobile base -->
<plugin name="diff_drive_controller" filename="libgazebo_ros_diff_drive.so">
  <ros>
    <namespace>/mobile_base</namespace>
  </ros>
  <left_joint>left_wheel_joint</left_joint>
  <right_joint>right_wheel_joint</right_joint>
  <wheel_separation>0.3</wheel_separation>
  <wheel_diameter>0.15</wheel_diameter>
  <max_wheel_torque>20</max_wheel_torque>
  <max_wheel_acceleration>1.0</max_wheel_acceleration>
  <command_topic>cmd_vel</command_topic>
  <odometry_topic>odom</odometry_topic>
  <odometry_frame>odom</odometry_frame>
  <robot_base_frame>base_link</robot_base_frame>
  <publish_odom>true</publish_odom>
  <publish_wheel_tf>false</publish_wheel_tf>
  <publish_odom_tf>true</publish_odom_tf>
  <odometry_source>world</odometry_source>
  <update_rate>30</update_rate>
</plugin>
```

### Advanced Plugin Configuration for Humanoid Robots

For humanoid robots, specialized plugins handle complex control:

```xml
<!-- Balance controller plugin -->
<plugin name="balance_controller" filename="libgazebo_ros_balance_controller.so">
  <robotNamespace>/humanoid_robot</robotNamespace>
  <topicName>/balance_control</topicName>
  <serviceName>/balance_service</serviceName>
  <com_reference_topic>/com_reference</com_reference_topic>
  <com_measured_topic>/com_measured</com_measured_topic>
  <zmp_reference_topic>/zmp_reference</zmp_reference_topic>
  <zmp_measured_topic>/zmp_measured</zmp_measured_topic>
  <updateRate>100</updateRate>
  <com_publish_rate>50</com_publish_rate>
  <zmp_publish_rate>100</zmp_publish_rate>
</plugin>

<!-- Whole body controller plugin -->
<plugin name="whole_body_controller" filename="libgazebo_ros_whole_body_controller.so">
  <robotNamespace>/humanoid_robot</robotNamespace>
  <joint_state_topic>/joint_states</joint_state_topic>
  <joint_command_topic>/joint_commands</joint_command_topic>
  <task_space_control_topic>/task_space_commands</task_space_control_topic>
  <com_topic>/center_of_mass</com_topic>
  <end_effector_topics>
    <end_effector>
      <name>left_foot</name>
      <topic>/left_foot_pose</topic>
    </end_effector>
    <end_effector>
      <name>right_foot</name>
      <topic>/right_foot_pose</topic>
    </end_effector>
    <end_effector>
      <name>left_hand</name>
      <topic>/left_hand_pose</topic>
    </end_effector>
    <end_effector>
      <name>right_hand</name>
      <topic>/right_hand_pose</topic>
    </end_effector>
  </end_effector_topics>
  <update_rate>200</update_rate>
</plugin>

<!-- Vision-based manipulation plugin -->
<plugin name="vision_manipulation" filename="libgazebo_ros_vision_manipulation.so">
  <robotNamespace>/humanoid_robot</robotNamespace>
  <camera_topic>/rgbd_camera/depth/points</camera_topic>
  <object_detection_topic>/detected_objects</object_detection_topic>
  <grasp_planning_topic>/grasp_plans</grasp_planning_topic>
  <manipulation_command_topic>/manipulation_commands</manipulation_command_topic>
  <update_rate>30</update_rate>
</plugin>
```

## Advanced Simulation Features for Physical AI

### Physics Engine Configuration

Fine-tuning physics parameters for realistic humanoid simulation:

```xml
<physics name="ode_physics" type="ode">
  <max_step_size>0.001</max_step_size>
  <real_time_factor>1.0</real_time_factor>
  <real_time_update_rate>1000</real_time_update_rate>

  <ode>
    <solver>
      <type>quick</type>
      <iters>1000</iters>  <!-- More iterations for better accuracy -->
      <sor>1.3</sor>
      <use_dynamic_moi_rescaling>1</use_dynamic_moi_rescaling>
    </solver>
    <constraints>
      <cfm>1e-5</cfm>      <!-- Very low constraint force mixing for precise contacts -->
      <erp>0.2</erp>       <!-- Error reduction parameter -->
      <contact_max_correcting_vel>100</contact_max_correcting_vel>
      <contact_surface_layer>0.001</contact_surface_layer>
      <friction_model>cone_model</friction_model> <!-- More realistic friction model -->
    </constraints>
  </ode>

  <!-- Multi-ray physics for better contact detection -->
  <multiray>
    <count>1000</count>
    <res>0.1</res>
    <range>0.01 10</range>
  </multiray>
</physics>
```

### Complex Environment Simulation

Creating sophisticated environments for Physical AI systems:

```xml
<!-- Multi-story building with ramps and stairs -->
<model name="multi_story_building">
  <static>true</static>
  <link name="floor_1">
    <collision name="collision">
      <geometry>
        <box><size>10 10 0.1</size></box>
      </geometry>
    </collision>
    <visual name="visual">
      <geometry>
        <box><size>10 10 0.1</size></box>
      </geometry>
      <material>
        <script>
          <uri>file://media/materials/scripts/gazebo.material</uri>
          <name>Gazebo/Tarmac</name>
        </script>
      </material>
    </visual>
  </link>

  <!-- Ramp for accessibility -->
  <link name="ramp">
    <pose>2 0 0.1 0 0.2 0</pose>
    <collision name="collision">
      <geometry>
        <box><size>2 1 0.5</size></box>
      </geometry>
    </collision>
    <visual name="visual">
      <pose>0 0 0.25 0 0 0</pose>
      <geometry>
        <box><size>2 1 0.5</size></box>
      </geometry>
      <material>
        <script>
          <uri>file://media/materials/scripts/gazebo.material</uri>
          <name>Gazebo/FlatBlack</name>
        </script>
      </material>
    </visual>
  </link>

  <!-- Stairs for humanoid climbing -->
  <link name="stairs">
    <pose>-3 0 0 0 0 0</pose>
    <collision>
      <collision name="step_1">
        <pose>0 0 0.1 0 0 0</pose>
        <geometry><box><size>0.5 1 0.2</size></box></geometry>
      </collision>
      <collision name="step_2">
        <pose>0 0 0.3 0 0 0</pose>
        <geometry><box><size>0.5 1 0.2</size></box></geometry>
      </collision>
      <collision name="step_3">
        <pose>0 0 0.5 0 0 0</pose>
        <geometry><box><size>0.5 1 0.2</size></box></geometry>
      </collision>
    </collision>
    <visual name="visual">
      <geometry><box><size>0.5 1 0.6</size></box></geometry>
      <material>
        <script>
          <uri>file://media/materials/scripts/gazebo.material</uri>
          <name>Gazebo/Grey</name>
        </script>
      </material>
    </visual>
  </link>

  <!-- Furniture for manipulation tasks -->
  <link name="table">
    <pose>0 2 0 0 0 0</pose>
    <inertial>
      <mass>50.0</mass>
      <inertia><ixx>10</ixx><ixy>0</ixy><ixz>0</ixz><iyy>10</iyy><iyz>0</iyz><izz>10</izz></inertia>
    </inertial>
    <visual name="visual">
      <pose>0 0 0.4 0 0 0</pose>
      <geometry><box><size>1.5 0.8 0.8</size></box></geometry>
      <material>
        <script>
          <uri>file://media/materials/scripts/gazebo.material</uri>
          <name>Gazebo/Wood</name>
        </script>
      </material>
    </visual>
    <collision name="collision">
      <pose>0 0 0.4 0 0 0</pose>
      <geometry><box><size>1.5 0.8 0.8</size></box></geometry>
    </collision>
  </link>

  <link name="chair">
    <pose>0.7 2.2 0 0 0 1.57</pose>
    <visual name="visual">
      <pose>0 0 0.25 0 0 0</pose>
      <geometry><box><size>0.4 0.4 0.5</size></box></geometry>
      <material>
        <script>
          <uri>file://media/materials/scripts/gazebo.material</uri>
          <name>Gazebo/Wood</name>
        </script>
      </material>
    </visual>
    <collision name="collision">
      <pose>0 0 0.25 0 0 0</pose>
      <geometry><box><size>0.4 0.4 0.5</size></box></geometry>
    </collision>
  </link>
</model>

<!-- Mobile objects for interaction -->
<model name="movable_object">
  <pose>0.5 2.2 0.5 0 0 0</pose>
  <link name="object_link">
    <inertial>
      <mass>0.5</mass>
      <inertia>
        <ixx>0.001</ixx><ixy>0</ixy><ixz>0</ixz>
        <iyy>0.001</iyy><iyz>0</iyz><izz>0.001</izz>
      </inertia>
    </inertial>
    <visual name="visual">
      <geometry><sphere><radius>0.1</radius></sphere></geometry>
      <material>
        <ambient>1 0 0 1</ambient>
        <diffuse>1 0 0 1</diffuse>
      </material>
    </visual>
    <collision name="collision">
      <geometry><sphere><radius>0.1</radius></sphere></geometry>
    </collision>
  </link>
</model>
```

## Gazebo Simulation Optimization

### Performance Optimization Tips

Optimizing Gazebo for complex Physical AI simulations:

```xml
<!-- Optimized world settings for humanoid simulation -->
<world name="optimized_humanoid_world">
  <!-- Reduced time step for better stability -->
  <physics name="fast_physics" type="ode">
    <max_step_size>0.002</max_step_size>  <!-- Larger step for performance -->
    <real_time_factor>1.0</real_time_factor>
    <real_time_update_rate>500</real_time_update_rate>  <!-- Reduced update rate -->

    <ode>
      <solver>
        <type>quick</type>
        <iters>50</iters>  <!-- Reduced iterations for performance -->
        <sor>1.3</sor>
      </solver>
      <constraints>
        <cfm>1e-4</cfm>  <!-- Slightly higher for stability -->
        <erp>0.2</erp>
        <contact_max_correcting_vel>100</contact_max_correcting_vel>
        <contact_surface_layer>0.002</contact_surface_layer>
      </constraints>
    </ode>
  </physics>

  <!-- Simplified visual models for better rendering performance -->
  <model name="performance_robot">
    <static>false</static>
    <link name="base_link">
      <inertial>
        <mass>10.0</mass>
        <inertia>
          <ixx>0.4</ixx><ixy>0</ixy><ixz>0</ixz>
          <iyy>0.4</iyy><iyz>0</iyz><izz>0.2</izz>
        </inertia>
      </inertial>
      <!-- Simplified collision geometry -->
      <collision name="collision">
        <geometry>
          <box><size>0.4 0.4 0.4</size></box>
        </geometry>
      </collision>
      <!-- Simplified visual geometry -->
      <visual name="visual">
        <geometry>
          <box><size>0.4 0.4 0.4</size></box>
        </geometry>
        <material>
          <ambient>0.1 0.1 0.1 1</ambient>
          <diffuse>0.4 0.4 0.4 1</diffuse>
        </material>
      </visual>
    </link>
  </model>

  <!-- Performance-oriented sensor settings -->
  <model name="sensor_platform">
    <link name="low_res_camera_link">
      <!-- Low-resolution camera for performance -->
      <sensor name="low_res_camera" type="camera">
        <update_rate>10</update_rate>  <!-- Lower update rate -->
        <camera name="low_res">
          <horizontal_fov>1.047</horizontal_fov>
          <image>
            <width>320</width>  <!-- Lower resolution -->
            <height>240</height>
            <format>R8G8B8</format>
          </image>
          <clip>
            <near>0.1</near>
            <far>10</far>
          </clip>
        </camera>
      </sensor>
    </link>
  </model>
</world>
```

### Multi-Robot Simulation Configuration

Setting up simulations with multiple humanoid robots:

```xml
<sdf version="1.7">
  <world name="multi_humanoid_world">
    <include>
      <uri>model://humanoid_robot_description</uri>
      <name>robot_alpha</name>
      <pose>-2 0 1.0 0 0 0</pose>
    </include>

    <include>
      <uri>model://humanoid_robot_description</uri>
      <name>robot_beta</name>
      <pose>2 0 1.0 0 0 0</pose>
    </include>

    <include>
      <uri>model://humanoid_robot_description</uri>
      <name>robot_gamma</name>
      <pose>0 2 1.0 0 0 1.57</pose>
    </include>

    <!-- Each robot needs unique namespace -->
    <plugin name="robot_alpha_controller" filename="libgazebo_ros_control.so">
      <robotNamespace>/robot_alpha</robotNamespace>
    </plugin>

    <plugin name="robot_beta_controller" filename="libgazebo_ros_control.so">
      <robotNamespace>/robot_beta</robotNamespace>
    </plugin>

    <plugin name="robot_gamma_controller" filename="libgazebo_ros_control.so">
      <robotNamespace>/robot_gamma</robotNamespace>
    </plugin>

    <!-- Coordinator for multi-robot interaction -->
    <plugin name="multi_robot_coordinator" filename="libgazebo_ros_multi_robot_coordinator.so">
      <robot_namespaces>/robot_alpha /robot_beta /robot_gamma</robot_namespaces>
      <cooperation_topic>/multi_robot_cooperation</cooperation_topic>
      <update_rate>10</update_rate>
    </plugin>
  </world>
</sdf>
```

## Quality Assurance for SDF and Gazebo Models

### Validation Tools

```bash
# Validate SDF files
gz sdf -k world_file.sdf
gz sdf -k model_file.sdf

# Convert URDF to SDF for inspection
gz sdf -p urdf_model.urdf

# Check Gazebo models
ls ~/.gazebo/models/  # Check installed models
gz model --list       # List available models
```

### Simulation Testing Checklist

```bash
# Test physics behavior
# - Does the robot fall through the ground plane?
# - Are joint limits respected?
# - Is the center of mass correctly placed?

# Test sensor outputs
ros2 topic echo /camera/rgb/image_raw
ros2 topic echo /scan
ros2 topic echo /imu/data

# Test control response
ros2 topic pub /cmd_vel geometry_msgs/msg/Twist "{linear: {x: 1.0}, angular: {z: 0.0}}"

# Monitor simulation performance
gz stats
```

## Integration with ROS 2 Ecosystem

### Launch Configuration for Gazebo Simulation

Creating launch files to integrate Gazebo with the broader ROS 2 system:

```python
# launch/gazebo_simulation.launch.py
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration, TextSubstitution
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
from launch.substitutions import PathJoinSubstitution
import os


def generate_launch_description():
    # Launch configurations
    world_file = LaunchConfiguration('world_file')
    robot_model = LaunchConfiguration('robot_model', default='humanoid_robot')
    use_sim_time = LaunchConfiguration('use_sim_time', default='true')

    # Get package share directory
    pkg_share = get_package_share_directory('py_physical_ai_examples')

    # Include Gazebo launch
    gazebo_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(get_package_share_directory('gazebo_ros'), 'launch', 'gazebo.launch.py')
        ),
        launch_arguments={
            'world': world_file,
            'verbose': 'true'
        }.items()
    )

    # Robot state publisher for URDF
    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        name='robot_state_publisher',
        parameters=[
            {'use_sim_time': use_sim_time}
        ],
        arguments=[
            PathJoinSubstitution([pkg_share, 'models', robot_model, 'model.urdf'])
        ]
    )

    # Spawn robot in Gazebo
    spawn_entity = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=[
            '-entity', [robot_model, '_sim'],
            '-file', PathJoinSubstitution([pkg_share, 'models', robot_model, 'model.sdf']),
            '-x', '0',
            '-y', '0',
            '-z', '1.0'
        ],
        output='screen'
    )

    return LaunchDescription([
        DeclareLaunchArgument(
            'world_file',
            default_value=[TextSubstitution(text=os.path.join(pkg_share, 'worlds', 'humanoid_world.sdf'))],
            description='Path to world file'
        ),

        DeclareLaunchArgument(
            'robot_model',
            default_value='humanoid_robot',
            description='Robot model name'
        ),

        gazebo_launch,
        robot_state_publisher,
        spawn_entity
    ])
```

## Troubleshooting Common Issues

### Physics Instability

Common solutions for unstable physics in humanoid simulations:

1. **Increase solver iterations**:
   ```xml
   <solver>
     <iters>1000</iters>  <!-- Higher iteration count -->
   </solver>
   ```

2. **Reduce time step**:
   ```xml
   <max_step_size>0.001</max_step_size>  <!-- Smaller time step -->
   ```

3. **Adjust ERP/CFM**:
   ```xml
   <constraints>
     <erp>0.2</erp>        <!-- Error reduction parameter -->
     <cfm>1e-5</cfm>      <!-- Constraint force mixing -->
   </constraints>
   ```

### Sensor Issues

Solutions for common sensor problems:

1. **Low update rates**: Increase `<update_rate>` in sensor definitions
2. **Noisy data**: Adjust `<noise>` parameters in sensor configurations
3. **Wrong coordinate frames**: Verify sensor poses and frame names

### Performance Problems

Optimization strategies:

1. **Reduce visual complexity**: Use simpler mesh models in simulation
2. **Lower sensor resolution**: Decrease image dimensions or scan density
3. **Simplify physics**: Use primitive shapes for collision instead of complex meshes
4. **Limit update rates**: Reduce sensor and physics update frequencies

## Conclusion

SDF and Gazebo provide the essential simulation infrastructure for Physical AI and humanoid robotics development. Key takeaways include:

1. **SDF vs URDF**: SDF describes complete simulation environments while URDF describes individual robot models
2. **Physics tuning**: Proper physics parameters are crucial for stable humanoid simulation
3. **Sensor integration**: Accurate sensor models enable realistic perception in simulation
4. **Optimization**: Balancing fidelity and performance is essential for complex simulations
5. **Validation**: Thorough testing ensures simulation accuracy

The simulation environment provides a safe, cost-effective means to develop and test Physical AI systems before deployment on physical hardware. Proper configuration of SDF and Gazebo is essential for creating realistic, stable, and performant simulations of humanoid robots and their environments.

As we move forward in this book, we'll see how these simulation tools integrate with perception systems, navigation, and control algorithms to create complete Physical AI systems.