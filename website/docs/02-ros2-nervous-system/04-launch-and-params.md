---
sidebar_position: 4
title: 'Launch and Parameters'
---

# ROS 2 Launch Systems and Parameters: Managing Complex Physical AI Systems

## Introduction to Launch Systems and Parameters

In Physical AI and humanoid robotics applications, managing complex systems with multiple interconnected nodes requires sophisticated launch and configuration mechanisms. ROS 2 provides powerful tools for launching multiple nodes simultaneously and configuring them through parameters, making it possible to manage entire robot systems with a single command.

This chapter covers the launch system for orchestrating robot systems and the parameter system for configuring node behavior, both crucial for Physical AI applications that need to adapt to different hardware configurations and operational environments.

## Understanding ROS 2 Launch Systems

### The Launch Architecture

ROS 2's launch system is built around the concept of launch descriptions that can:
- Start multiple nodes simultaneously
- Configure nodes with parameters
- Set up remappings
- Manage lifecycle nodes
- Handle pre- and post-processing tasks

### When to Use Launch Files

Launch files are essential for:
- **System deployment**: Starting all nodes needed for robot operation
- **Configuration management**: Consistent parameter setup across nodes
- **Development workflows**: Standardized testing and debugging environments
- **Multi-robot systems**: Coordinating multiple robots with shared configurations
- **Simulation environments**: Setting up complete simulation worlds

## Creating Launch Files

### Basic Launch File Structure

Launch files can be written in Python or XML. Python launch files offer more flexibility and are generally recommended for complex Physical AI systems.

Here's a basic structure:

```python
# basic_launch.py
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from ament_index_python.packages import get_package_share_directory


def generate_launch_description():
    # Define launch configuration variables
    use_sim_time = LaunchConfiguration('use_sim_time', default='false')

    return LaunchDescription([
        # Declare launch arguments
        DeclareLaunchArgument(
            'use_sim_time',
            default_value='false',
            description='Use simulation (Gazebo) clock if true'
        ),

        # Define nodes
        Node(
            package='py_physical_ai_examples',
            executable='physical_ai_publisher',
            name='physical_ai_publisher_node',
            parameters=[
                {'use_sim_time': use_sim_time},
                {'robot_name': 'HumanoidRobot'},
            ],
            output='screen'
        ),

        Node(
            package='py_physical_ai_examples',
            executable='physical_ai_subscriber',
            name='physical_ai_subscriber_node',
            parameters=[
                {'use_sim_time': use_sim_time},
            ],
            output='screen'
        ),
    ])
```

### Advanced Launch File with Complex Configurations

```python
# advanced_robot_launch.py
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription, TimerAction
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node, ComposableNodeContainer
from launch_ros.descriptions import ComposableNode
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution, TextSubstitution
from ament_index_python.packages import get_package_share_directory
import os


def generate_launch_description():
    # Define launch configuration variables
    use_sim_time = LaunchConfiguration('use_sim_time', default='false')
    robot_name = LaunchConfiguration('robot_name', default='humanoid_robot')
    config_file_path = LaunchConfiguration('config_file_path')

    # Get package share directory
    pkg_share = get_package_share_directory('py_physical_ai_examples')

    # Return the complete launch description
    return LaunchDescription([
        # Declare launch arguments
        DeclareLaunchArgument(
            'use_sim_time',
            default_value='false',
            description='Use simulation (Gazebo) clock if true'
        ),

        DeclareLaunchArgument(
            'robot_name',
            default_value='humanoid_robot',
            description='Unique name for the robot'
        ),

        DeclareLaunchArgument(
            'config_file_path',
            default_value=[TextSubstitution(text=os.path.join(pkg_share, 'config', 'default.yaml'))],
            description='Path to the configuration file'
        ),

        # Robot state publisher node
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            name='robot_state_publisher',
            parameters=[
                config_file_path,
                {'use_sim_time': use_sim_time},
            ],
            output='screen'
        ),

        # Joint state publisher node
        Node(
            package='joint_state_publisher',
            executable='joint_state_publisher',
            name='joint_state_publisher',
            parameters=[
                {'use_sim_time': use_sim_time},
            ],
            output='screen'
        ),

        # Sensor processing node (with parameters from YAML file)
        Node(
            package='cpp_physical_ai_examples',
            executable='physical_ai_publisher',
            name='sensor_processor',
            parameters=[
                config_file_path,
                {'use_sim_time': use_sim_time},
                {'robot_name': robot_name},
            ],
            remappings=[
                ('/physical_ai_messages_cpp', ['/', robot_name, '/sensor_data']),
            ],
            output='screen'
        ),

        # Control system node
        Node(
            package='cpp_physical_ai_examples',
            executable='physical_ai_subscriber',
            name='control_system',
            parameters=[
                config_file_path,
                {'use_sim_time': use_sim_time},
                {'robot_name': robot_name},
            ],
            remappings=[
                ('/physical_ai_messages_cpp', ['/', robot_name, '/control_commands']),
            ],
            output='screen'
        ),

        # Timer-based node that starts after a delay
        TimerAction(
            period=5.0,  # Start after 5 seconds
            actions=[
                Node(
                    package='py_physical_ai_examples',
                    executable='physical_ai_publisher',
                    name='delayed_publisher',
                    parameters=[
                        {'use_sim_time': use_sim_time},
                        {'robot_name': robot_name},
                    ],
                    output='screen'
                )
            ]
        ),
    ])
```

### Launch Files with Composable Nodes

For performance-critical Physical AI systems, you can use composable nodes that run within a single process:

```python
# composable_launch.py
from launch import LaunchDescription
from launch_ros.actions import ComposableNodeContainer
from launch_ros.descriptions import ComposableNode


def generate_launch_description():
    """Generate launch description with a composable container."""

    container = ComposableNodeContainer(
        name='physical_ai_container',
        namespace='',
        package='rclcpp_components',
        executable='component_container',
        composable_node_descriptions=[
            ComposableNode(
                package='py_physical_ai_examples',
                plugin='py_physical_ai_examples::PhysicalAIPublisher',
                name='publisher_component',
                parameters=[
                    {'robot_name': 'HumanoidRobot'},
                ],
                remappings=[
                    ('/physical_ai_messages', '/robot_state'),
                ],
            ),
            ComposableNode(
                package='py_physical_ai_examples',
                plugin='py_physical_ai_examples::PhysicalAISubscriber',
                name='subscriber_component',
                parameters=[
                    {'robot_name': 'HumanoidRobot'},
                ],
                remappings=[
                    ('/physical_ai_messages', '/robot_state'),
                ],
            ),
        ],
        output='screen',
    )

    return LaunchDescription([container])
```

## Parameter Management in Physical AI Systems

### Understanding Parameters

Parameters in ROS 2 provide a way to configure node behavior without recompilation. They are key-value pairs that can be:
- Declared within nodes
- Set at launch time
- Modified during runtime
- Stored in YAML configuration files

### Parameter Declaration and Usage

Here's how to properly declare and use parameters in a node:

```python
#!/usr/bin/env python3
"""
Parameter usage example for Physical AI systems
"""
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import math


class ParameterizedRobotNode(Node):
    """
    A robot node that demonstrates proper parameter usage
    """
    def __init__(self):
        super().__init__('parameterized_robot_node')

        # Declare parameters with descriptions and default values
        self.declare_parameter('robot_name', 'HumanoidRobot')
        self.declare_parameter('control_frequency', 50.0)
        self.declare_parameter('max_velocity', 1.0)
        self.declare_parameter('safety_distance', 0.5)
        self.declare_parameter('use_sim_time', False)
        self.declare_parameter('robot_dimensions', [0.5, 0.3, 0.8])  # x, y, z
        self.declare_parameter('joint_limits', {
            'arm_joint_1': {'min': -1.57, 'max': 1.57},
            'arm_joint_2': {'min': -2.35, 'max': 0.78}
        })

        # Get parameter values
        self.robot_name = self.get_parameter('robot_name').value
        self.control_frequency = self.get_parameter('control_frequency').value
        self.max_velocity = self.get_parameter('max_velocity').value
        self.safety_distance = self.get_parameter('safety_distance').value
        self.use_sim_time = self.get_parameter('use_sim_time').value
        self.robot_dimensions = self.get_parameter('robot_dimensions').value

        # Create publisher and timer
        self.publisher_ = self.create_publisher(String, 'robot_status', 10)

        # Create timer based on control frequency
        timer_period = 1.0 / self.control_frequency
        self.timer = self.create_timer(timer_period, self.timer_callback)

        # Create parameter callback
        self.add_on_set_parameters_callback(self.parameter_callback)

        self.get_logger().info(f'Initialized node for {self.robot_name}')
        self.get_logger().info(f'Control frequency: {self.control_frequency}Hz')
        self.get_logger().info(f'Robot dimensions: {self.robot_dimensions}')

    def timer_callback(self):
        """
        Main control loop
        """
        msg = String()
        msg.data = f'Status: {self.robot_name} operational, freq={self.control_frequency}Hz'
        self.publisher_.publish(msg)

    def parameter_callback(self, params):
        """
        Callback for parameter changes
        """
        for param in params:
            # Update internal values when parameters change
            if param.name == 'control_frequency':
                self.control_frequency = param.value
                # Adjust timer period when frequency changes
                new_period = 1.0 / self.control_frequency
                self.timer.timer_period_ns = int(new_period * 1_000_000_000)
                self.get_logger().info(f'Updated control frequency to {self.control_frequency}Hz')
            elif param.name == 'max_velocity':
                self.max_velocity = param.value
                self.get_logger().info(f'Updated max velocity to {self.max_velocity}')
            elif param.name == 'safety_distance':
                self.safety_distance = param.value
                self.get_logger().info(f'Updated safety distance to {self.safety_distance}')

        return rclpy.node.SetParametersResult(successful=True)


def main(args=None):
    rclpy.init(args=args)
    node = ParameterizedRobotNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### Configuration Files (YAML)

YAML configuration files allow you to manage parameters externally:

**config/robot_config.yaml**
```yaml
/**:  # Global parameters
  ros__parameters:
    use_sim_time: false
    robot_name: "HumanoidRobot"

parameterized_robot_node:  # Parameters for specific node
  ros__parameters:
    control_frequency: 100.0
    max_velocity: 0.5
    safety_distance: 0.8
    robot_dimensions: [0.5, 0.3, 0.8]
    joint_limits:
      arm_joint_1:
        min: -1.57
        max: 1.57
      arm_joint_2:
        min: -2.35
        max: 0.78

sensor_processor_node:
  ros__parameters:
    sensor_range: 10.0
    update_frequency: 30.0
    noise_threshold: 0.01

control_system_node:
  ros__parameters:
    kp: 1.0
    ki: 0.1
    kd: 0.05
    max_effort: 100.0
```

### Using Configuration Files in Launch Files

```python
# launch_with_config.py
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os


def generate_launch_description():
    # Get the package share directory
    pkg_share = get_package_share_directory('py_physical_ai_examples')

    # Declare launch arguments
    config_file = LaunchConfiguration('config_file')

    return LaunchDescription([
        DeclareLaunchArgument(
            'config_file',
            default_value=os.path.join(pkg_share, 'config', 'robot_config.yaml'),
            description='Path to configuration file'
        ),

        # Robot controller node with configuration file
        Node(
            package='py_physical_ai_examples',
            executable='parameterized_robot_node',
            name='robot_controller',
            parameters=[
                config_file,  # Load parameters from YAML file
                {'use_sim_time': LaunchConfiguration('use_sim_time', default='false')},
            ],
            output='screen'
        ),

        # Sensor processor with configuration file
        Node(
            package='cpp_physical_ai_examples',
            executable='physical_ai_publisher',
            name='sensor_processor',
            parameters=[
                config_file,  # Load parameters from YAML file
                {'use_sim_time': LaunchConfiguration('use_sim_time', default='false')},
            ],
            output='screen'
        ),
    ])
```

## Advanced Launch Concepts for Physical AI

### Conditional Launch Actions

Sometimes you need to conditionally launch nodes based on arguments:

```python
# conditional_launch.py
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, OpaqueFunction
from launch.conditions import IfCondition, UnlessCondition
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def launch_setup(context, *args, **kwargs):
    """Function to set up the launch description conditionally."""

    # Get launch arguments
    use_sim = LaunchConfiguration('use_sim_time').perform(context)
    enable_viz = LaunchConfiguration('enable_visualization').perform(context)

    ld = LaunchDescription()

    # Always launch the robot controller
    robot_node = Node(
        package='py_physical_ai_examples',
        executable='parameterized_robot_node',
        name='robot_controller',
        parameters=[
            {'use_sim_time': use_sim},
        ],
        output='screen'
    )
    ld.add_action(robot_node)

    # Conditionally launch visualization
    if enable_viz.lower() == 'true':
        rviz_node = Node(
            package='rviz2',
            executable='rviz2',
            name='rviz',
            arguments=['-d', '/path/to/config.rviz'],
            condition=IfCondition(enable_viz)
        )
        ld.add_action(rviz_node)

    # Conditionally launch sim-specific nodes
    if use_sim.lower() == 'true':
        sim_bridge_node = Node(
            package='gazebo_ros',
            executable='spawn_entity.py',
            arguments=['-entity', 'humanoid_robot',
                      '-file', '/path/to/robot/model.sdf'],
            condition=IfCondition(use_sim)
        )
        ld.add_action(sim_bridge_node)

    return ld


def generate_launch_description():
    return LaunchDescription([
        DeclareLaunchArgument(
            'use_sim_time',
            default_value='false',
            description='Use simulation (Gazebo) clock if true'
        ),

        DeclareLaunchArgument(
            'enable_visualization',
            default_value='true',
            description='Enable RViz visualization'
        ),

        OpaqueFunction(function=launch_setup)
    ])
```

### Launch File with Substitutions

Using substitutions allows for more dynamic configurations:

```python
# dynamic_launch.py
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, SetEnvironmentVariable
from launch.substitutions import LaunchConfiguration, TextSubstitution
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os


def generate_launch_description():
    # Declare launch arguments
    robot_namespace = LaunchConfiguration('robot_namespace')
    robot_id = LaunchConfiguration('robot_id')

    # Get package share directory
    pkg_share = get_package_share_directory('py_physical_ai_examples')

    return LaunchDescription([
        SetEnvironmentVariable(
            name='RCUTILS_LOGGING_BUFFERED_STREAM',
            value='1'
        ),

        DeclareLaunchArgument(
            'robot_namespace',
            default_value='robot1',
            description='Robot namespace for multi-robot systems'
        ),

        DeclareLaunchArgument(
            'robot_id',
            default_value='1',
            description='Unique robot identifier'
        ),

        # Robot controller with namespace
        Node(
            package='py_physical_ai_examples',
            executable='parameterized_robot_node',
            name='robot_controller',
            namespace=robot_namespace,
            parameters=[
                {'robot_id': robot_id},
                {'robot_namespace': robot_namespace},
                {'robot_name': [robot_namespace, '_', robot_id]},
            ],
            remappings=[
                ('/robot_status', ['/', robot_namespace, '/status']),
            ],
            output='screen'
        ),

        # Diagnostic node
        Node(
            package='diagnostic_aggregator',
            executable='aggregator_node',
            name='diagnostic_aggregator',
            namespace=robot_namespace,
            parameters=[
                [TextSubstitution(text=os.path.join(pkg_share, 'config', 'diagnostics.yaml'))]
            ],
            output='screen'
        ),
    ])
```

## Parameter Best Practices for Physical AI Systems

### 1. Parameter Organization

```python
#!/usr/bin/env python3
"""
Best practices for organizing parameters in Physical AI systems
"""
import rclpy
from rclpy.node import Node
from rcl_interfaces.msg import ParameterDescriptor, ParameterType
from std_msgs.msg import String


class OrganizedParameterNode(Node):
    """
    A node demonstrating parameter organization best practices
    """
    def __init__(self):
        super().__init__('organized_parameter_node')

        # Declare parameters with proper descriptors
        self.declare_parameter(
            'robot.info.name',
            'HumanoidRobot',
            ParameterDescriptor(
                description='Name of the robot',
                type=ParameterType.PARAMETER_STRING
            )
        )

        self.declare_parameter(
            'robot.info.model',
            'GenericHumanoid',
            ParameterDescriptor(
                description='Robot model identifier',
                type=ParameterType.PARAMETER_STRING
            )
        )

        self.declare_parameter(
            'robot.control.frequency',
            50.0,
            ParameterDescriptor(
                description='Control loop frequency in Hz',
                type=ParameterType.PARAMETER_DOUBLE,
                additional_constraints='Must be positive'
            )
        )

        self.declare_parameter(
            'robot.safety.max_velocity',
            1.0,
            ParameterDescriptor(
                description='Maximum allowed velocity in m/s',
                type=ParameterType.PARAMETER_DOUBLE
            )
        )

        self.declare_parameter(
            'robot.safety.safety_distance',
            0.5,
            ParameterDescriptor(
                description='Minimum safe distance in meters',
                type=ParameterType.PARAMETER_DOUBLE
            )
        )

        self.declare_parameter(
            'robot.hardware.joint_limits',
            {
                'hip_pitch_min': -1.57,
                'hip_pitch_max': 1.57,
                'knee_pitch_min': 0.0,
                'knee_pitch_max': 2.35
            },
            ParameterDescriptor(
                description='Joint limits for robot actuators',
                type=ParameterType.PARAMETER_INTEGER_ARRAY
            )
        )

        # Initialize node with parameters
        robot_name = self.get_parameter('robot.info.name').value
        self.get_logger().info(f'Initialized {robot_name} with organized parameters')

        # Create publisher and timer
        self.status_publisher = self.create_publisher(String, 'robot_status', 10)
        control_freq = self.get_parameter('robot.control.frequency').value
        timer_period = 1.0 / control_freq
        self.timer = self.create_timer(timer_period, self.timer_callback)

    def timer_callback(self):
        """
        Publish status based on parameters
        """
        # Get current parameters (in case they changed)
        robot_name = self.get_parameter('robot.info.name').value
        max_vel = self.get_parameter('robot.safety.max_velocity').value

        msg = String()
        msg.data = f'Robot: {robot_name}, Max Vel: {max_vel}m/s'
        self.status_publisher.publish(msg)

        # Log if parameters are approaching limits
        safety_dist = self.get_parameter('robot.safety.safety_distance').value
        if safety_dist < 0.1:
            self.get_logger().warn(f'Safety distance critically low: {safety_dist}m')


def main(args=None):
    rclpy.init(args=args)
    node = OrganizedParameterNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### 2. Parameter Validation

```python
#!/usr/bin/env python3
"""
Parameter validation for Physical AI systems
"""
import rclpy
from rclpy.node import Node
from rcl_interfaces.msg import SetParametersResult
from std_msgs.msg import String


class ValidatedParameterNode(Node):
    """
    A node with parameter validation
    """
    def __init__(self):
        super().__init__('validated_parameter_node')

        # Declare parameters with initial values
        self.declare_parameter('robot.control.frequency', 50.0)
        self.declare_parameter('robot.safety.max_velocity', 1.0)
        self.declare_parameter('robot.operational_mode', 'autonomous')  # 'autonomous', 'teleop', 'disabled'

        # Set up parameter callback
        self.add_on_set_parameters_callback(self.validate_parameters)

        self.get_logger().info('Parameter validation node initialized')

    def validate_parameters(self, parameters):
        """
        Validate parameter changes
        """
        result = SetParametersResult()
        result.successful = True
        result.reason = 'All parameters validated successfully'

        for param in parameters:
            if param.name == 'robot.control.frequency':
                if param.value <= 0 or param.value > 1000:
                    result.successful = False
                    result.reason = f'Control frequency must be between 0 and 1000, got {param.value}'
                    self.get_logger().error(result.reason)
                    return result
                else:
                    self.get_logger().info(f'Control frequency set to {param.value}Hz')

            elif param.name == 'robot.safety.max_velocity':
                if param.value <= 0 or param.value > 10:
                    result.successful = False
                    result.reason = f'Max_velocity must be between 0 and 10, got {param.value}'
                    self.get_logger().error(result.reason)
                    return result
                else:
                    self.get_logger().info(f'Max velocity set to {param.value}m/s')

            elif param.name == 'robot.operational_mode':
                valid_modes = ['autonomous', 'teleop', 'disabled', 'calibration']
                if param.value not in valid_modes:
                    result.successful = False
                    result.reason = f'operational_mode must be one of {valid_modes}, got {param.value}'
                    self.get_logger().error(result.reason)
                    return result
                else:
                    self.get_logger().info(f'Operational mode set to {param.value}')

        return result


def main(args=None):
    rclpy.init(args=args)
    node = ValidatedParameterNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Working with Parameters at Runtime

### Command Line Parameter Operations

You can interact with parameters using command line tools:

```bash
# Get all parameters of a node
ros2 param list /parameterized_robot_node

# Get a specific parameter
ros2 param get /parameterized_robot_node robot_name

# Set a parameter
ros2 param set /parameterized_robot_node control_frequency 100.0

# Load parameters from a file
ros2 param load /parameterized_robot_node /path/to/params.yaml

# Save parameters to a file
ros2 param dump /parameterized_robot_node -o /path/to/params.yaml
```

### Programmatic Parameter Access

```python
#!/usr/bin/env python3
"""
Programmatic parameter access examples
"""
import rclpy
from rclpy.node import Node
from rclpy.parameter import Parameter
from std_msgs.msg import String


class ParameterAccessNode(Node):
    """
    Demonstrate programmatic parameter access
    """
    def __init__(self):
        super().__init__('parameter_access_node')

        # Declare parameters
        self.declare_parameter('robot_name', 'HumanoidRobot')
        self.declare_parameter('status_frequency', 1.0)

        # Create a client to query other nodes' parameters
        self.get_logger().info('Parameter access node initialized')

        # Create timer to periodically check parameters
        self.timer = self.create_timer(5.0, self.check_parameters)

    def check_parameters(self):
        """
        Check and log current parameters
        """
        robot_name = self.get_parameter('robot_name').value
        freq = self.get_parameter('status_frequency').value

        self.get_logger().info(f'Current robot name: {robot_name}')
        self.get_logger().info(f'Current frequency: {freq}Hz')

        # You can also use async parameter services to query other nodes
        # This requires creating a parameter client


def main(args=None):
    rclpy.init(args=args)
    node = ParameterAccessNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Launch and Parameter Integration Examples

### Complete Multi-Robot System Launch

```python
# multi_robot_system_launch.py
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, GroupAction, TimerAction
from launch.conditions import IfCondition
from launch.substitutions import LaunchConfiguration, TextSubstitution
from launch_ros.actions import Node, PushRosNamespace
from ament_index_python.packages import get_package_share_directory
import os


def generate_launch_description():
    # Launch arguments
    use_sim_time = LaunchConfiguration('use_sim_time')
    enable_rviz = LaunchConfiguration('enable_rviz')
    robot1_config = LaunchConfiguration('robot1_config')
    robot2_config = LaunchConfiguration('robot2_config')

    pkg_share = get_package_share_directory('py_physical_ai_examples')

    # Define robot configurations
    robot1_params = os.path.join(pkg_share, 'config', 'robot1.yaml')
    robot2_params = os.path.join(pkg_share, 'config', 'robot2.yaml')

    # Robot 1 group
    robot1_group = GroupAction(
        actions=[
            PushRosNamespace('robot1'),
            Node(
                package='py_physical_ai_examples',
                executable='parameterized_robot_node',
                name='controller',
                parameters=[
                    robot1_params,
                    {'use_sim_time': use_sim_time},
                    {'robot_namespace': 'robot1'},
                ],
                output='screen'
            ),
        ]
    )

    # Robot 2 group
    robot2_group = GroupAction(
        actions=[
            PushRosNamespace('robot2'),
            Node(
                package='py_physical_ai_examples',
                executable='parameterized_robot_node',
                name='controller',
                parameters=[
                    robot2_params,
                    {'use_sim_time': use_sim_time},
                    {'robot_namespace': 'robot2'},
                ],
                output='screen'
            ),
        ]
    )

    # RViz node
    rviz_node = Node(
        package='rviz2',
        executable='rviz2',
        name='rviz2',
        arguments=['-d', os.path.join(pkg_share, 'rviz', 'multi_robot.rviz')],
        condition=IfCondition(enable_rviz),
        output='screen'
    )

    # Launch coordinator node
    coordinator_node = Node(
        package='py_physical_ai_examples',
        executable='parameterized_robot_node',
        name='system_coordinator',
        parameters=[
            {'use_sim_time': use_sim_time},
            {'coordinated_robots': ['robot1', 'robot2']},
        ],
        output='screen'
    )

    return LaunchDescription([
        DeclareLaunchArgument(
            'use_sim_time',
            default_value='false',
            description='Use simulation clock if true'
        ),

        DeclareLaunchArgument(
            'enable_rviz',
            default_value='true',
            description='Enable RViz'
        ),

        DeclareLaunchArgument(
            'robot1_config',
            default_value=robot1_params,
            description='Configuration file for robot 1'
        ),

        DeclareLaunchArgument(
            'robot2_config',
            default_value=robot2_params,
            description='Configuration file for robot 2'
        ),

        # Launch robot 1
        robot1_group,

        # Launch robot 2 after a delay to avoid conflicts
        TimerAction(
            period=2.0,
            actions=[robot2_group]
        ),

        # Launch coordinator
        coordinator_node,

        # Launch RViz
        rviz_node,
    ])
```

### Simulation-Specific Launch Configuration

```python
# simulation_launch.py
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription, RegisterEventHandler
from launch.event_handlers import OnProcessStart
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os


def generate_launch_description():
    # Get package directories
    pkg_gazebo_ros = get_package_share_directory('gazebo_ros')
    pkg_py_examples = get_package_share_directory('py_physical_ai_examples')
    pkg_cpp_examples = get_package_share_directory('cpp_physical_ai_examples')

    # Declare launch arguments
    world = LaunchConfiguration('world')
    robot_model_path = LaunchConfiguration('robot_model_path')

    return LaunchDescription([
        DeclareLaunchArgument(
            'world',
            default_value=os.path.join(pkg_py_examples, 'worlds', 'simple_room.sdf'),
            description='SDF world file'
        ),

        DeclareLaunchArgument(
            'robot_model_path',
            default_value=os.path.join(pkg_py_examples, 'models', 'humanoid_robot.urdf'),
            description='Path to robot URDF file'
        ),

        # Launch Gazebo
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource(
                os.path.join(pkg_gazebo_ros, 'launch', 'gazebo.launch.py')
            ),
            launch_arguments={'world': world}.items()
        ),

        # Robot state publisher for simulation
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            name='robot_state_publisher_sim',
            parameters=[
                {'use_sim_time': True},
                {'robot_description':
                    # This would contain the robot URDF
                    # In practice, you'd read the URDF file
                    ''
                }
            ],
            output='screen'
        ),

        # Gazebo ROS spawn entity node
        Node(
            package='gazebo_ros',
            executable='spawn_entity.py',
            arguments=[
                '-entity', 'humanoid_robot',
                '-file', robot_model_path,
                '-x', '0', '-y', '0', '-z', '1.0'
            ],
            output='screen'
        ),

        # Robot controller for simulation
        Node(
            package='py_physical_ai_examples',
            executable='parameterized_robot_node',
            name='sim_robot_controller',
            parameters=[
                {'use_sim_time': True},
                {'robot_name': 'SimHumanoidRobot'},
                {'control_frequency': 100.0},  # Higher frequency for simulation
            ],
            output='screen'
        ),
    ])
```

## Best Practices Summary

### Launch File Best Practices:
1. **Use descriptive names** for launch files and nodes
2. **Organize parameters hierarchically** (robot.info, robot.control, etc.)
3. **Use launch arguments** for configurable options
4. **Handle errors gracefully** in launch files
5. **Document launch arguments** in comments
6. **Use timers** for nodes that should start with delays
7. **Namespace appropriately** in multi-robot systems
8. **Validate parameters** at runtime

### Parameter Best Practices:
1. **Use meaningful parameter names** with consistent naming conventions
2. **Provide default values** for all parameters
3. **Validate parameter values** before using them
4. **Group related parameters** under common prefixes
5. **Use YAML files** for complex parameter sets
6. **Document parameter meaning** and valid ranges
7. **Consider parameter update callbacks** for dynamic reconfiguration
8. **Use parameter descriptors** for better introspection

## Conclusion

Launch systems and parameters are fundamental to managing complex Physical AI and humanoid robotics systems. They provide:

1. **Orchestration capabilities** to start and manage multiple nodes simultaneously
2. **Configuration flexibility** through external parameter files
3. **Runtime adaptability** through parameter updates
4. **Multi-robot support** through namespacing and conditional launch
5. **Simulation integration** for testing and development
6. **Operational safety** through parameter validation and constraints

Proper use of these systems enables you to deploy and manage complex Physical AI systems with consistent configurations and well-defined startup procedures. As we continue through this book, we'll see how these concepts integrate with robot description, simulation, and control systems to create full humanoid robotics applications.