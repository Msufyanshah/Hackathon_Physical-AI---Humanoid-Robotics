---
sidebar_position: 2
title: 'First Nodes'
---

# Creating Your First ROS 2 Nodes: The Building Blocks of Physical AI Systems

## Introduction to ROS 2 Nodes

In the context of Physical AI and humanoid robotics, nodes serve as the fundamental computational units that handle specific aspects of robot behavior. A ROS 2 node is an executable process that works in conjunction with other nodes to perform robot operations. Each node typically encapsulates a specific functionality, such as sensor processing, control algorithms, or actuator commands.

This chapter will guide you through creating your first ROS 2 nodes, establishing the foundation for more complex Physical AI systems. We'll explore both Python and C++ implementations, as both are commonly used in robotics applications.

## Understanding Node Architecture

### The Node Concept

In ROS 2's distributed computing model:
- Nodes are processes that perform computation
- Nodes are written using client libraries (e.g., rclcpp for C++, rclpy for Python)
- Nodes communicate with each other by publishing messages to topics, subscribing to topics, providing services, or using actions

### Node Lifecycle in Physical AI Systems

For humanoid robots, nodes typically handle:
- **Sensor data processing**: Converting raw sensor readings to meaningful information
- **Control algorithms**: Implementing motion planning and execution
- **State management**: Tracking robot state and environment information
- **Hardware interfaces**: Communicating with actuators and sensors
- **Behavior management**: Executing high-level tasks and behaviors

## Setting Up Your Development Environment

Before creating nodes, ensure your ROS 2 environment is properly sourced:

```bash
source /opt/ros/humble/setup.bash
```

Create a new workspace for your nodes:

```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws
colcon build
source install/setup.bash
```

## Creating Your First Simple Node in Python

Let's start with a simple "Hello Physical AI" publisher node:

### 1. Creating the Package

First, create a new ROS 2 package:

```bash
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_python py_physical_ai_examples
```

### 2. Creating the Publisher Node

Create the publisher script in `~/ros2_ws/src/py_physical_ai_examples/py_physical_ai_examples/physical_ai_publisher.py`:

```python
#!/usr/bin/env python3
"""
A simple publisher node for Physical AI and Humanoid Robotics
"""
import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class PhysicalAIPublisher(Node):
    """
    A node that publishes messages for Physical AI applications
    """
    def __init__(self):
        super().__init__('physical_ai_publisher')
        self.publisher_ = self.create_publisher(String, 'physical_ai_messages', 10)

        # Create a timer to publish messages periodically
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

        # Log that the node has started
        self.get_logger().info('Physical AI Publisher Node Started')

    def timer_callback(self):
        """
        Callback function that publishes messages at regular intervals
        """
        msg = String()
        msg.data = f'Hello Physical AI! Message number: {self.i}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1


def main(args=None):
    """
    Main function to initialize and run the node
    """
    rclpy.init(args=args)

    physical_ai_publisher = PhysicalAIPublisher()

    try:
        rclpy.spin(physical_ai_publisher)
    except KeyboardInterrupt:
        pass
    finally:
        physical_ai_publisher.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### 3. Creating a Subscriber Node

Create the subscriber script in `~/ros2_ws/src/py_physical_ai_examples/py_physical_ai_examples/physical_ai_subscriber.py`:

```python
#!/usr/bin/env python3
"""
A simple subscriber node for Physical AI and Humanoid Robotics
"""
import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class PhysicalAISubscriber(Node):
    """
    A node that subscribes to messages in Physical AI applications
    """
    def __init__(self):
        super().__init__('physical_ai_subscriber')
        self.subscription = self.create_subscription(
            String,
            'physical_ai_messages',
            self.listener_callback,
            10)
        self.subscription  # prevent unused variable warning

        # Log that the node has started
        self.get_logger().info('Physical AI Subscriber Node Started')

    def listener_callback(self, msg):
        """
        Callback function that processes incoming messages
        """
        self.get_logger().info(f'I heard: "{msg.data}"')


def main(args=None):
    """
    Main function to initialize and run the node
    """
    rclpy.init(args=args)

    physical_ai_subscriber = PhysicalAISubscriber()

    try:
        rclpy.spin(physical_ai_subscriber)
    except KeyboardInterrupt:
        pass
    finally:
        physical_ai_subscriber.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### 4. Updating setup.py

Update the package's `setup.py` file to make the scripts executable:

```python
from setuptools import setup
import os
from glob import glob

package_name = 'py_physical_ai_examples'

setup(
    name=package_name,
    version='0.0.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        # Include all launch files
        (os.path.join('share', package_name, 'launch'), glob('launch/*launch.py')),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Your Name',
    maintainer_email='your.email@example.com',
    description='Examples for Physical AI and Humanoid Robotics using Python',
    license='Apache License 2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'physical_ai_publisher = py_physical_ai_examples.physical_ai_publisher:main',
            'physical_ai_subscriber = py_physical_ai_examples.physical_ai_subscriber:main',
        ],
    },
)
```

## Creating Your First Node in C++

### 1. Creating the C++ Package

```bash
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_cmake cpp_physical_ai_examples
```

### 2. Creating the Publisher Node

Create the publisher file in `~/ros2_ws/src/cpp_physical_ai_examples/src/physical_ai_publisher.cpp`:

```cpp
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

using namespace std::chrono_literals;

class PhysicalAIPublisher : public rclcpp::Node
{
public:
    PhysicalAIPublisher()
    : Node("physical_ai_publisher_cpp")
    {
        publisher_ = this->create_publisher<std_msgs::msg::String>("physical_ai_messages_cpp", 10);
        timer_ = this->create_wall_timer(
            500ms, std::bind(&PhysicalAIPublisher::timer_callback, this));

        RCLCPP_INFO(this->get_logger(), "Physical AI Publisher Node Started (C++)");
    }

private:
    void timer_callback()
    {
        auto message = std_msgs::msg::String();
        message.data = "Hello Physical AI from C++! Message number: " + std::to_string(count_++);
        RCLCPP_INFO(this->get_logger(), "Publishing: '%s'", message.data.c_str());
        publisher_->publish(message);
    }
    rclcpp::TimerBase::SharedPtr timer_;
    rclcpp::Publisher<std_msgs::msg::String>::SharedPtr publisher_;
    size_t count_ = 0;
};

int main(int argc, char * argv[])
{
    rclcpp::init(argc, argv);
    rclcpp::spin(std::make_shared<PhysicalAIPublisher>());
    rclcpp::shutdown();
    return 0;
}
```

### 3. Creating the Subscriber Node

Create the subscriber file in `~/ros2_ws/src/cpp_physical_ai_examples/src/physical_ai_subscriber.cpp`:

```cpp
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

class PhysicalAISubscriber : public rclcpp::Node
{
public:
    PhysicalAISubscriber()
    : Node("physical_ai_subscriber_cpp")
    {
        subscription_ = this->create_subscription<std_msgs::msg::String>(
            "physical_ai_messages_cpp",
            10,
            [this](const std_msgs::msg::String::SharedPtr msg) {
                RCLCPP_INFO(this->get_logger(), "I heard: '%s'", msg->data.c_str());
            });

        RCLCPP_INFO(this->get_logger(), "Physical AI Subscriber Node Started (C++)");
    }

private:
    rclcpp::Subscription<std_msgs::msg::String>::SharedPtr subscription_;
};

int main(int argc, char * argv[])
{
    rclcpp::init(argc, argv);
    rclcpp::spin(std::make_shared<PhysicalAISubscriber>());
    rclcpp::shutdown();
    return 0;
}
```

### 4. Updating CMakeLists.txt

Update the CMakeLists.txt file:

```cmake
cmake_minimum_required(VERSION 3.8)
project(cpp_physical_ai_examples)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# find dependencies
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)

# Publisher node
add_executable(physical_ai_publisher src/physical_ai_publisher.cpp)
ament_target_dependencies(physical_ai_publisher
  rclcpp
  std_msgs)

# Subscriber node
add_executable(physical_ai_subscriber src/physical_ai_subscriber.cpp)
ament_target_dependencies(physical_ai_subscriber
  rclcpp
  std_msgs)

# Install executables
install(TARGETS
  physical_ai_publisher
  physical_ai_subscriber
  DESTINATION lib/cpp_physical_ai_examples)

ament_package()
```

### 5. Update package.xml

Update the package.xml file:

```xml
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>cpp_physical_ai_examples</name>
  <version>0.0.0</version>
  <description>Examples for Physical AI and Humanoid Robotics using C++</description>
  <maintainer email="your.email@example.com">Your Name</maintainer>
  <license>Apache License 2.0</license>

  <buildtool_depend>ament_cmake</buildtool_depend>

  <depend>rclcpp</depend>
  <depend>std_msgs</depend>

  <test_depend>ament_lint_auto</test_depend>
  <test_depend>ament_lint_common</test_depend>

  <export>
    <build_type>ament_cmake</build_type>
  </export>
</package>
```

## Building and Running Your Nodes

### 1. Building the Packages

```bash
cd ~/ros2_ws
colcon build --packages-select py_physical_ai_examples cpp_physical_ai_examples
source install/setup.bash
```

### 2. Running Python Nodes

In separate terminal windows:

Terminal 1:
```bash
source ~/ros2_ws/install/setup.bash
ros2 run py_physical_ai_examples physical_ai_publisher
```

Terminal 2:
```bash
source ~/ros2_ws/install/setup.bash
ros2 run py_physical_ai_examples physical_ai_subscriber
```

### 3. Running C++ Nodes

In separate terminal windows:

Terminal 3:
```bash
source ~/ros2_ws/install/setup.bash
ros2 run cpp_physical_ai_examples physical_ai_publisher
```

Terminal 4:
```bash
source ~/ros2_ws/install/setup.bash
ros2 run cpp_physical_ai_examples physical_ai_subscriber
```

## Understanding Node Communication in Physical AI

### Topics and Message Passing

In Physical AI systems, topics are used for continuous data streams:

- **Sensor data streams**: Camera images, LiDAR scans, IMU readings
- **Control commands**: Joint positions, velocities, efforts
- **State information**: Robot pose, battery level, system status

### Services in Physical AI

Services are used for request-response interactions:
- **Configuration**: Setting parameters for sensors or controllers
- **Planning**: Requesting paths or trajectories
- **Status**: Querying system state on demand

### Actions in Physical AI

Actions are used for long-running tasks with feedback:
- **Navigation**: Moving to goal with progress feedback
- **Manipulation**: Grasping objects with status updates
- **Calibration**: Sensor calibration with progress information

## Advanced Node Concepts for Physical AI

### Node Parameters

Parameters allow configuration of node behavior:

```python
#!/usr/bin/env python3
"""
Example of parameter usage in Physical AI nodes
"""
import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class PhysicalAINodeWithParams(Node):
    def __init__(self):
        super().__init__('physical_ai_with_params')

        # Declare parameters
        self.declare_parameter('robot_name', 'HumanoidRobot')
        self.declare_parameter('publish_frequency', 1.0)
        self.declare_parameter('message_prefix', 'PhysicalAI')

        # Get parameter values
        self.robot_name = self.get_parameter('robot_name').value
        self.frequency = self.get_parameter('publish_frequency').value
        self.prefix = self.get_parameter('message_prefix').value

        # Create publisher
        self.publisher_ = self.create_publisher(String, 'robot_status', 10)

        # Create timer based on frequency parameter
        timer_period = 1.0 / self.frequency  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)

        self.get_logger().info(f'Node initialized for {self.robot_name} with {self.frequency}Hz')

    def timer_callback(self):
        msg = String()
        msg.data = f'{self.prefix}: {self.robot_name} is operational'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Published: {msg.data}')


def main(args=None):
    rclpy.init(args=args)
    node = PhysicalAINodeWithParams()

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

### Quality of Service (QoS) in Physical AI

For real-time systems like humanoid robots, QoS settings are crucial:

```python
#!/usr/bin/env python3
"""
Example of QoS usage in Physical AI nodes
"""
import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy
from std_msgs.msg import String


class PhysicalAIQoSExample(Node):
    def __init__(self):
        super().__init__('physical_ai_qos_example')

        # High-reliability QoS for critical control commands
        control_qos = QoSProfile(
            depth=10,
            reliability=ReliabilityPolicy.RELIABLE,
            durability=DurabilityPolicy.VOLATILE
        )

        # Best-effort QoS for sensor data (can tolerate some loss)
        sensor_qos = QoSProfile(
            depth=5,
            reliability=ReliabilityPolicy.BEST_EFFORT,
            durability=DurabilityPolicy.VOLATILE
        )

        # Publishers with different QoS profiles
        self.control_publisher = self.create_publisher(String, 'control_commands', control_qos)
        self.sensor_publisher = self.create_publisher(String, 'sensor_data', sensor_qos)

        # Timer for publishing
        self.timer = self.create_timer(0.1, self.timer_callback)

        self.get_logger().info('Physical AI QoS Example Node Started')

    def timer_callback(self):
        # Publish control command (needs reliability)
        control_msg = String()
        control_msg.data = 'Move forward 1 meter'
        self.control_publisher.publish(control_msg)

        # Publish sensor data (best-effort is OK)
        sensor_msg = String()
        sensor_msg.data = 'IMU reading: 0.01 rad/s'
        self.sensor_publisher.publish(sensor_msg)


def main(args=None):
    rclpy.init(args=args)
    node = PhysicalAIQoSExample()

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

## Node Best Practices for Physical AI Systems

### 1. Error Handling and Recovery

```python
#!/usr/bin/env python3
"""
Best practices for error handling in Physical AI nodes
"""
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import traceback


class PhysicalAIPracticeNode(Node):
    def __init__(self):
        super().__init__('physical_ai_best_practices')
        self.publisher_ = self.create_publisher(String, 'robot_commands', 10)
        self.timer = self.create_timer(0.5, self.safety_aware_callback)

    def safety_aware_callback(self):
        try:
            # Simulate some processing that might fail
            result = self.safety_critical_task()

            if result is not None:
                msg = String()
                msg.data = f'Success: {result}'
                self.publisher_.publish(msg)
            else:
                # Log warning instead of crashing
                self.get_logger().warning('Task returned None, continuing safely')

        except Exception as e:
            # Log error but don't crash the node
            self.get_logger().error(f'Error in safety_aware_callback: {str(e)}')
            self.get_logger().error(traceback.format_exc())
            # Publish error status for system monitoring
            error_msg = String()
            error_msg.data = f'ERROR: {str(e)}'
            self.publisher_.publish(error_msg)

    def safety_critical_task(self):
        # Simulate a potentially failing task
        import random
        if random.random() > 0.9:  # 10% chance of failure
            return None
        return "Task completed successfully"


def main(args=None):
    rclpy.init(args=args)
    node = PhysicalAIPracticeNode()

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

### 2. Resource Management

Physical AI systems must carefully manage resources like CPU, memory, and battery:

```python
#!/usr/bin/env python3
"""
Example of resource management in Physical AI nodes
"""
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import psutil
import time


class ResourceAwareNode(Node):
    def __init__(self):
        super().__init__('resource_aware_node')
        self.publisher_ = self.create_publisher(String, 'resource_status', 10)

        # Create timer for resource monitoring
        self.resource_timer = self.create_timer(5.0, self.resource_monitor_callback)

        # Create timer for main task (will be throttled based on resources)
        self.main_timer = self.create_timer(0.1, self.main_task_callback)

        self.get_logger().info('Resource Aware Node Started')

    def resource_monitor_callback(self):
        # Monitor system resources
        cpu_percent = psutil.cpu_percent(interval=1)
        memory_percent = psutil.virtual_memory().percent

        # Publish resource status
        msg = String()
        msg.data = f'CPU: {cpu_percent}%, Memory: {memory_percent}%'
        self.publisher_.publish(msg)

        # Adjust main task frequency based on resource usage
        if cpu_percent > 80:
            # Reduce frequency if CPU is high
            self.main_timer.timer_period_ns = rclpy.time.Duration(seconds=0.5).nanoseconds
            self.get_logger().info('High CPU detected, reducing task frequency')
        elif cpu_percent < 30:
            # Increase frequency if CPU is low
            self.main_timer.timer_period_ns = rclpy.time.Duration(seconds=0.05).nanoseconds
            self.get_logger().info('Low CPU detected, increasing task frequency')

    def main_task_callback(self):
        # Main task that should be resource-conscious
        self.get_logger().debug('Main task executing')


def main(args=None):
    rclpy.init(args=args)
    node = ResourceAwareNode()

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

## Debugging ROS 2 Nodes in Physical AI Systems

### 1. Using ROS 2 Tools

```bash
# List all active nodes
ros2 node list

# Get information about a specific node
ros2 node info /physical_ai_publisher

# List topics and their types
ros2 topic list
ros2 topic list --verbose

# Echo messages on a topic
ros2 topic echo /physical_ai_messages std_msgs/msg/String

# Check topic statistics
ros2 topic hz /physical_ai_messages
```

### 2. Logging Best Practices

```python
#!/usr/bin/env python3
"""
Example of logging best practices in Physical AI nodes
"""
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from rclpy.qos import qos_profile_sensor_data


class LoggingBestPracticesNode(Node):
    def __init__(self):
        super().__init__('logging_best_practices')

        # Different log levels for different types of information
        self.publisher_ = self.create_publisher(
            String, 'robot_telemetry', qos_profile_sensor_data)
        self.timer = self.create_timer(1.0, self.timer_callback)

        # Log at INFO level when node starts
        self.get_logger().info('Logging Best Practices Node Initialized')
        self.get_logger().info('Publishing robot telemetry every second')

    def timer_callback(self):
        # Use different log levels appropriately
        self.get_logger().debug('Timer callback executed')

        # Simulate some robot telemetry data
        try:
            # Simulate reading sensor data
            sensor_value = 42.5  # This would come from an actual sensor

            if sensor_value > 50:
                # Use WARN for unexpected but not critical values
                self.get_logger().warn(f'High sensor reading detected: {sensor_value}')
            elif sensor_value < 0:
                # Use ERROR for problematic values
                self.get_logger().error(f'Invalid sensor reading: {sensor_value}')
                return
            else:
                # Normal operation
                self.get_logger().debug(f'Sensor value: {sensor_value}')

            # Publish telemetry data
            msg = String()
            msg.data = f'Telemetry: sensor={sensor_value}'
            self.publisher_.publish(msg)

            # Log important events at INFO level
            self.get_logger().info(f'Published telemetry: {msg.data}')

        except Exception as e:
            # Always log exceptions at ERROR level
            self.get_logger().error(f'Exception in timer_callback: {str(e)}')
            # Include more details with exception
            import traceback
            self.get_logger().error(traceback.format_exc())


def main(args=None):
    rclpy.init(args=args)
    node = LoggingBestPracticesNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Node shutting down gracefully')
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Conclusion

This chapter introduced the fundamental concepts of ROS 2 nodes and how they form the building blocks of Physical AI and humanoid robotics systems. Key takeaways include:

1. **Nodes are the basic execution units** in ROS 2, each handling a specific aspect of robot functionality.

2. **Two main programming languages** are supported: Python for rapid prototyping and C++ for performance-critical applications.

3. **Communication patterns** in ROS 2 include topics (publish/subscribe), services (request/reply), and actions (long-running tasks with feedback).

4. **Node parameters** allow configuration without recompilation, essential for physical systems with different hardware configurations.

5. **Quality of Service (QoS)** settings are crucial for real-time Physical AI systems where timing and reliability matter.

6. **Best practices** include proper error handling, resource management, and logging for robust robot operation.

7. **Debugging tools** like `ros2 node list`, `ros2 topic echo`, and proper logging help maintain reliable robot systems.

Understanding these concepts is essential as we move toward more complex systems involving robot description, simulation, and ultimately humanoid robotics applications.