---
sidebar_position: 3
title: 'Services & Actions'
---

# Services and Actions in ROS 2: Advanced Communication Patterns for Physical AI

## Introduction to Advanced Communication Patterns

While topics enable asynchronous, decoupled communication between ROS 2 nodes, services and actions provide synchronous and long-running communication patterns essential for Physical AI and humanoid robotics applications. This chapter explores these communication patterns that are crucial for implementing coordinated behaviors, complex control systems, and reliable interaction with the physical world.

## Understanding Services in ROS 2

### Service Architecture

Services in ROS 2 provide a synchronous request-response communication pattern:
- **Service Client**: Sends a request and waits for a response
- **Service Server**: Receives requests and sends responses
- **Service Interface**: Defines the request and response message types

### When to Use Services

Services are ideal for Physical AI applications that require:
- **Synchronous operations**: When the caller must wait for completion
- **Configuration requests**: Setting robot parameters or modes
- **One-time computations**: Processing data and returning results
- **State queries**: Getting current system status
- **Planning requests**: Requesting trajectories or paths

### Creating Custom Service Interfaces

Before implementing services, you need to define custom interfaces. Create a `srv` directory in your package and define the service interface in a `.srv` file:

**RobotControl.srv**
```
# Request
string command
float64[] parameters
---
# Response
bool success
string message
int32 error_code
```

### Service Server Implementation

Here's a comprehensive example of a service server for robot control:

```python
#!/usr/bin/env python3
"""
A service server for robot control in Physical AI applications
"""
import rclpy
from rclpy.node import Node
from example_interfaces.srv import Trigger  # Using built-in service for simplicity
import time
import threading
from std_msgs.msg import String


class RobotControlService(Node):
    """
    A service server for handling robot control commands
    """
    def __init__(self):
        super().__init__('robot_control_service')

        # Create service server
        self.srv = self.create_service(
            Trigger,
            'robot_control',
            self.robot_control_callback
        )

        # Publisher for robot status updates
        self.status_publisher = self.create_publisher(String, 'robot_status', 10)

        self.get_logger().info('Robot Control Service Server Started')

    def robot_control_callback(self, request, response):
        """
        Callback for handling robot control requests
        """
        self.get_logger().info('Received robot control request')

        try:
            # Simulate robot control operation
            self.get_logger().info('Executing robot control command...')

            # Publish status update
            status_msg = String()
            status_msg.data = 'Executing command'
            self.status_publisher.publish(status_msg)

            # Simulate some processing time (in a real system, this might involve
            # communicating with hardware, path planning, etc.)
            time.sleep(2)

            # Simulate success
            response.success = True
            response.message = 'Robot command executed successfully'

            # Update status
            status_msg.data = 'Command completed successfully'
            self.status_publisher.publish(status_msg)

            self.get_logger().info('Robot control command completed successfully')

        except Exception as e:
            response.success = False
            response.message = f'Error executing command: {str(e)}'
            self.get_logger().error(f'Robot control error: {str(e)}')

            # Publish error status
            status_msg = String()
            status_msg.data = f'Error: {str(e)}'
            self.status_publisher.publish(status_msg)

        return response


def main(args=None):
    rclpy.init(args=args)
    node = RobotControlService()

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

### Service Client Implementation

Here's how to create a service client to call the above service:

```python
#!/usr/bin/env python3
"""
A service client for robot control in Physical AI applications
"""
import rclpy
from rclpy.node import Node
from example_interfaces.srv import Trigger
from std_msgs.msg import String


class RobotControlClient(Node):
    """
    A service client for sending robot control requests
    """
    def __init__(self):
        super().__init__('robot_control_client')

        # Create client
        self.cli = self.create_client(Trigger, 'robot_control')

        # Wait for service to be available
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Robot control service not available, waiting...')

        self.get_logger().info('Robot control client initialized')

        # Subscribe to robot status
        self.status_subscriber = self.create_subscription(
            String,
            'robot_status',
            self.status_callback,
            10
        )

    def status_callback(self, msg):
        """
        Callback for robot status updates
        """
        self.get_logger().info(f'Robot Status: {msg.data}')

    def send_request(self):
        """
        Send a request to the robot control service
        """
        request = Trigger.Request()
        future = self.cli.call_async(request)

        # We could handle the response with a callback
        # For now, we'll just return the future
        return future


def main(args=None):
    rclpy.init(args=args)
    client = RobotControlClient()

    # Send a request to the service
    future = client.send_request()

    # Spin until the request is complete
    rclpy.spin_until_future_complete(client, future)

    # Process the response
    try:
        response = future.result()
        if response.success:
            client.get_logger().info(f'Success: {response.message}')
        else:
            client.get_logger().error(f'Failure: {response.message}')
    except Exception as e:
        client.get_logger().error(f'Exception: {str(e)}')

    client.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### C++ Implementation Example

Here's the same service server implemented in C++:

```cpp
#include "rclcpp/rclcpp.hpp"
#include "example_interfaces/srv/trigger.hpp"
#include "std_msgs/msg/string.hpp"
#include <chrono>
#include <thread>

using namespace std::chrono_literals;

class RobotControlServiceCpp : public rclcpp::Node
{
public:
    RobotControlServiceCpp()
    : Node("robot_control_service_cpp")
    {
        // Create service server
        service_ = this->create_service<example_interfaces::srv::Trigger>(
            "robot_control_cpp",
            [this](
                const std::shared_ptr<example_interfaces::srv::Trigger::Request> request,
                std::shared_ptr<example_interfaces::srv::Trigger::Response> response)
            {
                this->handle_robot_control_request(request, response);
            });

        // Create publisher for status
        status_publisher_ = this->create_publisher<std_msgs::msg::String>("robot_status_cpp", 10);

        RCLCPP_INFO(this->get_logger(), "Robot Control Service (C++) Started");
    }

private:
    void handle_robot_control_request(
        const std::shared_ptr<example_interfaces::srv::Trigger::Request> request,
        std::shared_ptr<example_interfaces::srv::Trigger::Response> response)
    {
        RCLCPP_INFO(this->get_logger(), "Received robot control request (C++)");

        // Publish status update
        auto status_msg = std_msgs::msg::String();
        status_msg.data = "Executing command";
        status_publisher_->publish(status_msg);

        // Simulate some processing time
        std::this_thread::sleep_for(2s);

        // Simulate success
        response->success = true;
        response->message = "Robot command executed successfully from C++";

        // Publish completion status
        status_msg.data = "Command completed successfully";
        status_publisher_->publish(status_msg);

        RCLCPP_INFO(this->get_logger(), "Robot control command completed successfully");
    }

    rclcpp::Service<example_interfaces::srv::Trigger>::SharedPtr service_;
    rclcpp::Publisher<std_msgs::msg::String>::SharedPtr status_publisher_;
};

int main(int argc, char * argv[])
{
    rclcpp::init(argc, argv);
    rclcpp::spin(std::make_shared<RobotControlServiceCpp>());
    rclcpp::shutdown();
    return 0;
}
```

## Understanding Actions in ROS 2

Actions in ROS 2 are designed for long-running tasks that provide feedback and support cancellation. They're essential for Physical AI applications that involve:
- **Navigation**: Moving to goals with progress feedback
- **Manipulation**: Grasping and moving objects
- **Calibration**: Sensor or actuator calibration processes
- **Complex behaviors**: Multi-step robot actions

### Action Architecture

Actions consist of three message types:
- **Goal**: Defines the task to be executed
- **Feedback**: Provides ongoing information about the task
- **Result**: Contains the final outcome of the task

### When to Use Actions

Actions are ideal for Physical AI applications that involve:
- **Long-running operations**: Tasks that take significant time to complete
- **Progress monitoring**: Need to track execution status
- **Cancelation support**: Ability to interrupt ongoing tasks
- **Preemption**: Replacing current tasks with new ones
- **State machines**: Complex multi-step behaviors

### Creating Custom Action Interfaces

Action interfaces are defined in `.action` files:

**RobotMove.action**
```
# Define the goal
float64[] target_position
string motion_type  # "walk", "crawl", "jump"
---
# Define the result
bool success
float64[] final_position
string message
---
# Define the feedback
float64[] current_position
float64 progress_percentage
string status_message
```

### Action Server Implementation

Here's a comprehensive example of an action server for robot movement:

```python
#!/usr/bin/env python3
"""
An action server for robot movement in Physical AI applications
"""
import rclpy
from rclpy.action import ActionServer, CancelResponse, GoalResponse
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import Point

# For this example, we'll use the built-in FollowJointTrajectory action
from control_msgs.action import FollowJointTrajectory
from trajectory_msgs.msg import JointTrajectoryPoint


class RobotMovementActionServer(Node):
    """
    An action server for handling robot movement requests
    """
    def __init__(self):
        super().__init__('robot_movement_action_server')

        # Create action server
        self._action_server = ActionServer(
            self,
            FollowJointTrajectory,
            'robot_movement',
            self.execute_callback,
            goal_callback=self.goal_callback,
            cancel_callback=self.cancel_callback
        )

        # Publishers for status updates
        self.status_publisher = self.create_publisher(String, 'robot_status', 10)

        self.get_logger().info('Robot Movement Action Server Started')

    def goal_callback(self, goal_request):
        """
        Accept or reject a goal
        """
        self.get_logger().info('Received goal request')
        return GoalResponse.ACCEPT

    def cancel_callback(self, goal_handle):
        """
        Accept or reject a cancel request
        """
        self.get_logger().info('Received cancel request')
        return CancelResponse.ACCEPT

    def execute_callback(self, goal_handle):
        """
        Execute the goal
        """
        self.get_logger().info('Executing goal...')

        # Publish status update
        status_msg = String()
        status_msg.data = 'Moving to target position'
        self.status_publisher.publish(status_msg)

        # Get the trajectory from the goal
        trajectory = goal_handle.request.trajectory

        # Simulate execution of the trajectory
        feedback_msg = FollowJointTrajectory.Feedback()
        result = FollowJointTrajectory.Result()

        # Simulate the movement process
        for i, point in enumerate(trajectory.points):
            # Check if the goal has been canceled
            if goal_handle.is_cancel_requested:
                result.error_code = -1  # FollowJointTrajectory error code for canceled
                goal_handle.canceled()
                self.get_logger().info('Goal was canceled')
                return result

            # Update feedback
            feedback_msg.joint_names = trajectory.joint_names
            feedback_msg.actual = point
            feedback_msg.desired = point
            feedback_msg.error.positions = [0.0] * len(point.positions)

            # Calculate progress (simplified)
            progress = float(i + 1) / len(trajectory.points) * 100.0

            # Publish feedback
            goal_handle.publish_feedback(feedback_msg)

            self.get_logger().info(f'Movement progress: {progress:.1f}%')

            # Simulate movement time
            time.sleep(0.5)

        # If we completed successfully
        if not goal_handle.is_cancel_requested:
            result.error_code = 0  # SUCCESS
            goal_handle.succeed()
            self.get_logger().info('Goal succeeded')

            # Update final status
            status_msg.data = 'Movement completed successfully'
            self.status_publisher.publish(status_msg)
        else:
            result.error_code = -1  # CANCELED
            self.get_logger().info('Goal was canceled during execution')

        return result


def main(args=None):
    import time  # Import time for the sleep in execute_callback

    rclpy.init(args=args)
    node = RobotMovementActionServer()

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

### Action Client Implementation

Here's how to create an action client to communicate with the action server:

```python
#!/usr/bin/env python3
"""
An action client for robot movement in Physical AI applications
"""
import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from std_msgs.msg import String

# Using the same action as the server example
from control_msgs.action import FollowJointTrajectory
from trajectory_msgs.msg import JointTrajectory, JointTrajectoryPoint


class RobotMovementActionClient(Node):
    """
    An action client for sending robot movement requests
    """
    def __init__(self):
        super().__init__('robot_movement_action_client')

        # Create action client
        self._action_client = ActionClient(
            self,
            FollowJointTrajectory,
            'robot_movement'
        )

        # Subscribe to robot status
        self.status_subscriber = self.create_subscription(
            String,
            'robot_status',
            self.status_callback,
            10
        )

    def status_callback(self, msg):
        """
        Callback for robot status updates
        """
        self.get_logger().info(f'Action Status: {msg.data}')

    def send_goal(self):
        """
        Send a goal to the action server
        """
        # Wait for the action server to be available
        self._action_client.wait_for_server()

        # Create a trajectory goal
        goal_msg = FollowJointTrajectory.Goal()
        goal_msg.trajectory = JointTrajectory()
        goal_msg.trajectory.joint_names = ['joint1', 'joint2', 'joint3']

        # Add some points to the trajectory
        point = JointTrajectoryPoint()
        point.positions = [1.0, 2.0, 3.0]
        point.velocities = [0.1, 0.1, 0.1]
        point.time_from_start.sec = 2
        goal_msg.trajectory.points.append(point)

        point2 = JointTrajectoryPoint()
        point2.positions = [2.0, 3.0, 4.0]
        point2.velocities = [0.1, 0.1, 0.1]
        point2.time_from_start.sec = 4
        goal_msg.trajectory.points.append(point2)

        self.get_logger().info('Sending goal to robot movement action server')

        # Send the goal
        self._send_goal_future = self._action_client.send_goal_async(
            goal_msg,
            feedback_callback=self.feedback_callback
        )

        self._send_goal_future.add_done_callback(self.goal_response_callback)

    def goal_response_callback(self, future):
        """
        Handle the goal response
        """
        goal_handle = future.result()
        if not goal_handle.accepted:
            self.get_logger().info('Goal rejected')
            return

        self.get_logger().info('Goal accepted')

        # Get the result
        self._get_result_future = goal_handle.get_result_async()
        self._get_result_future.add_done_callback(self.get_result_callback)

    def feedback_callback(self, feedback_msg):
        """
        Handle feedback during execution
        """
        self.get_logger().info(f'Received feedback: {feedback_msg.feedback}')

    def get_result_callback(self, future):
        """
        Handle the final result
        """
        result = future.result().result
        self.get_logger().info(f'Result: {result.error_code}')


def main(args=None):
    rclpy.init(args=args)
    action_client = RobotMovementActionClient()

    # Send the goal
    action_client.send_goal()

    # Spin until the action is complete
    try:
        rclpy.spin(action_client)
    except KeyboardInterrupt:
        pass
    finally:
        action_client.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Advanced Service and Action Concepts

### Service with Callback Groups

For complex Physical AI systems, you might need to organize callbacks into different groups:

```python
#!/usr/bin/env python3
"""
Advanced service example using callback groups
"""
import rclpy
from rclpy.node import Node
from rclpy.callback_groups import MutuallyExclusiveCallbackGroup
from example_interfaces.srv import SetBool
from std_msgs.msg import String
import threading
import time


class AdvancedServiceNode(Node):
    """
    A service node demonstrating advanced concepts
    """
    def __init__(self):
        super().__init__('advanced_service_node')

        # Create different callback groups
        self.high_priority_group = MutuallyExclusiveCallbackGroup()
        self.low_priority_group = MutuallyExclusiveCallbackGroup()

        # High priority service for emergency stops
        self.emergency_service = self.create_service(
            SetBool,
            'emergency_stop',
            self.emergency_callback,
            callback_group=self.high_priority_group
        )

        # Low priority service for configuration
        self.config_service = self.create_service(
            SetBool,
            'configuration',
            self.config_callback,
            callback_group=self.low_priority_group
        )

        # Publisher for status updates
        self.status_publisher = self.create_publisher(String, 'system_status', 10)

        self.get_logger().info('Advanced Service Node Started')

    def emergency_callback(self, request, response):
        """
        High priority emergency service callback
        """
        self.get_logger().warn('EMERGENCY STOP REQUESTED!')

        # In a real system, this would immediately stop all robot motion
        # and enter a safe state
        if request.data:
            response.success = True
            response.message = 'EMERGENCY STOP ACTIVATED'

            # Publish emergency status
            status_msg = String()
            status_msg.data = 'EMERGENCY_STOP'
            self.status_publisher.publish(status_msg)
        else:
            response.success = True
            response.message = 'EMERGENCY STOP RESET'

            # Publish normal status
            status_msg = String()
            status_msg.data = 'NORMAL_OPERATION'
            self.status_publisher.publish(status_msg)

        return response

    def config_callback(self, request, response):
        """
        Low priority configuration service callback
        """
        self.get_logger().info('Configuration request received')

        # Simulate a longer configuration process
        time.sleep(1)

        response.success = True
        response.message = 'Configuration updated'

        return response


def main(args=None):
    rclpy.init(args=args)
    node = AdvancedServiceNode()

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

### Action with Preemption and Advanced Feedback

```python
#!/usr/bin/env python3
"""
Advanced action server with preemption capabilities
"""
import rclpy
from rclpy.action import ActionServer, CancelResponse, GoalResponse
from rclpy.node import Node
from rclpy.executors import MultiThreadedExecutor
import threading
import time
from example_interfaces.action import Fibonacci


class AdvancedActionServer(Node):
    """
    An advanced action server with preemption
    """
    def __init__(self):
        super().__init__('advanced_action_server')

        # Create action server with feedback and result
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci_sequence',
            self.execute_callback,
            goal_callback=self.goal_callback,
            cancel_callback=self.cancel_callback,
            callback_group=rclpy.callback_groups.ReentrantCallbackGroup()
        )

        self.get_logger().info('Advanced Action Server Started')

    def goal_callback(self, goal_request):
        """
        Accept or reject a goal
        """
        self.get_logger().info(f'Received goal request: {goal_request.order}')

        # Accept all goals for this example
        return GoalResponse.ACCEPT

    def cancel_callback(self, goal_handle):
        """
        Accept or reject a cancel request
        """
        self.get_logger().info('Received cancel request')
        return CancelResponse.ACCEPT

    def execute_callback(self, goal_handle):
        """
        Execute the goal with preemption support
        """
        self.get_logger().info('Executing goal...')

        # Feedback and result messages
        feedback_msg = Fibonacci.Feedback()
        result = Fibonacci.Result()

        # Initialize Fibonacci sequence
        feedback_msg.sequence = [0, 1]

        # Calculate Fibonacci sequence up to the requested order
        for i in range(1, goal_handle.request.order):
            # Check if the goal has been canceled
            if goal_handle.is_cancel_requested:
                result.sequence = feedback_msg.sequence
                goal_handle.canceled()
                self.get_logger().info('Goal was canceled')
                return result

            # Simulate computation time
            time.sleep(0.5)

            # Calculate next Fibonacci number
            if len(feedback_msg.sequence) >= 2:
                next_fib = feedback_msg.sequence[-1] + feedback_msg.sequence[-2]
                feedback_msg.sequence.append(next_fib)

            # Publish feedback
            goal_handle.publish_feedback(feedback_msg)

            self.get_logger().info(f'Fibonacci progress: {len(feedback_msg.sequence)} numbers calculated')

        # Complete successfully
        if not goal_handle.is_cancel_requested:
            result.sequence = feedback_msg.sequence
            goal_handle.succeed()
            self.get_logger().info('Goal succeeded')
        else:
            result.sequence = feedback_msg.sequence
            self.get_logger().info('Goal was canceled during execution')

        return result


def main(args=None):
    rclpy.init(args=args)
    node = AdvancedActionServer()

    # Use a multi-threaded executor to handle multiple goals
    executor = MultiThreadedExecutor()
    executor.add_node(node)

    try:
        executor.spin()
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Best Practices for Services and Actions in Physical AI

### 1. Service Best Practices

```python
#!/usr/bin/env python3
"""
Service best practices for Physical AI systems
"""
import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy
from example_interfaces.srv import SetBool, Trigger
import sqlite3
import os
from std_msgs.msg import String


class ServiceBestPracticesNode(Node):
    """
    Demonstrate best practices for services in Physical AI
    """
    def __init__(self):
        super().__init__('service_best_practices')

        # Use appropriate QoS for services
        qos_profile = QoSProfile(
            depth=10,
            reliability=ReliabilityPolicy.RELIABLE
        )

        # Create services with proper error handling
        self.emergency_stop_service = self.create_service(
            SetBool,
            'emergency_stop',
            self.emergency_stop_callback,
            qos_profile=qos_profile
        )

        self.health_check_service = self.create_service(
            Trigger,
            'robot_health_check',
            self.health_check_callback,
            qos_profile=qos_profile
        )

        # Publisher for system events
        self.event_publisher = self.create_publisher(String, 'system_events', 10)

        # Initialize system state database (simulated)
        self.initialize_database()

        self.get_logger().info('Service Best Practices Node Started')

    def initialize_database(self):
        """
        Initialize a simple database for system state tracking
        """
        try:
            self.db_path = os.path.expanduser('~/.robot_system.db')
            self.conn = sqlite3.connect(self.db_path)

            # Create a simple table for events
            self.conn.execute('''
                CREATE TABLE IF NOT EXISTS system_events
                (id INTEGER PRIMARY KEY, event TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)
            ''')
            self.conn.commit()
        except Exception as e:
            self.get_logger().error(f'Failed to initialize database: {str(e)}')

    def emergency_stop_callback(self, request, response):
        """
        Emergency stop callback with comprehensive logging
        """
        try:
            event_msg = f"EMERGENCY_STOP: {request.data}"

            # Log to database
            self.conn.execute("INSERT INTO system_events (event) VALUES (?)", (event_msg,))
            self.conn.commit()

            # Log to console
            self.get_logger().warn(event_msg)

            # Publish system event
            status_msg = String()
            status_msg.data = event_msg
            self.event_publisher.publish(status_msg)

            response.success = True
            response.message = 'Emergency stop executed'

        except Exception as e:
            response.success = False
            response.message = f'Emergency stop failed: {str(e)}'
            self.get_logger().error(f'Emergency stop error: {str(e)}')

        return response

    def health_check_callback(self, request, response):
        """
        Health check callback with comprehensive validation
        """
        try:
            # Simulate health check process
            self.get_logger().info('Performing health check...')

            # In a real system, this would check:
            # - Sensor functionality
            # - Actuator status
            # - Communication systems
            # - Battery levels
            # - Temperature sensors
            # etc.

            # Simulate some checks
            sensor_ok = True
            actuator_ok = True
            comm_ok = True

            is_healthy = sensor_ok and actuator_ok and comm_ok

            if is_healthy:
                response.success = True
                response.message = 'All systems nominal'
                self.get_logger().info('Health check: ALL SYSTEMS NOMINAL')
            else:
                response.success = False
                response.message = 'System issues detected'
                self.get_logger().error('Health check: ISSUES DETECTED')

        except Exception as e:
            response.success = False
            response.message = f'Health check failed: {str(e)}'
            self.get_logger().error(f'Health check error: {str(e)}')

        return response

    def destroy_node(self):
        """
        Clean up resources when shutting down
        """
        if hasattr(self, 'conn'):
            self.conn.close()
        super().destroy_node()


def main(args=None):
    rclpy.init(args=args)
    node = ServiceBestPracticesNode()

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

### 2. Action Best Practices

```python
#!/usr/bin/env python3
"""
Action best practices for Physical AI systems
"""
import rclpy
from rclpy.action import ActionServer, CancelResponse, GoalResponse
from rclpy.node import Node
import time
from example_interfaces.action import Fibonacci
import threading


class ActionBestPracticesNode(Node):
    """
    Demonstrate best practices for actions in Physical AI
    """
    def __init__(self):
        super().__init__('action_best_practices')

        # Create action server with proper configuration
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci_with_best_practices',
            self.execute_callback,
            goal_callback=self.goal_callback,
            cancel_callback=self.cancel_callback
        )

        self.get_logger().info('Action Best Practices Node Started')

    def goal_callback(self, goal_request):
        """
        Validate goal request before accepting
        """
        # Validate the goal request
        if goal_request.order <= 0:
            self.get_logger().warn('Received invalid goal order')
            return GoalResponse.REJECT

        if goal_request.order > 100:  # Prevent excessive computation
            self.get_logger().warn('Goal order too large, rejecting')
            return GoalResponse.REJECT

        self.get_logger().info(f'Accepting goal with order: {goal_request.order}')
        return GoalResponse.ACCEPT

    def cancel_callback(self, goal_handle):
        """
        Decide whether to accept or reject cancel request
        """
        # In this example, we always accept cancel requests
        # but in complex systems, you might want to reject if
        # the operation is in a critical state
        return CancelResponse.ACCEPT

    def execute_callback(self, goal_handle):
        """
        Execute the goal with proper resource management
        """
        self.get_logger().info('Starting Fibonacci computation')

        # Initialize feedback and result
        feedback_msg = Fibonacci.Feedback()
        feedback_msg.sequence = [0, 1]

        result = Fibonacci.Result()

        # Validate the goal again (in case it changed)
        order = goal_handle.request.order
        if order <= 0:
            result.sequence = []
            goal_handle.abort()
            self.get_logger().error('Goal order became invalid during execution')
            return result

        # Perform the computation with periodic cancellation checks
        if order == 1:
            feedback_msg.sequence = [0]
        elif order >= 2:
            # Calculate Fibonacci numbers up to requested order
            for i in range(2, order):
                # Check for cancellation request
                if goal_handle.is_cancel_requested:
                    result.sequence = feedback_msg.sequence
                    goal_handle.canceled()
                    self.get_logger().info('Fibonacci calculation was canceled')
                    return result

                # Calculate next number in sequence
                next_num = feedback_msg.sequence[-1] + feedback_msg.sequence[-2]
                feedback_msg.sequence.append(next_num)

                # Publish feedback periodically
                if i % 5 == 0:  # Report feedback every 5 numbers
                    goal_handle.publish_feedback(feedback_msg)
                    self.get_logger().debug(f'Fibonacci progress: {i}/{order}')

                # Small delay to allow other processes
                time.sleep(0.01)

        # Complete successfully
        if not goal_handle.is_cancel_requested:
            result.sequence = feedback_msg.sequence
            goal_handle.succeed()
            self.get_logger().info(f'Fibonacci sequence completed: {result.sequence[-5:]}...')
        else:
            result.sequence = feedback_msg.sequence
            self.get_logger().info('Fibonacci was canceled during execution')

        return result


def main(args=None):
    rclpy.init(args=args)
    node = ActionBestPracticesNode()

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

## Testing Services and Actions

### Service Testing

```bash
# Call a service from command line
ros2 service call /robot_control example_interfaces/srv/Trigger

# Call service with specific values
ros2 service call /set_bool example_interfaces/srv/SetBool '{data: true}'
```

### Action Testing

```bash
# Send a goal to an action server
ros2 action send_goal /fibonacci example_interfaces/action/Fibonacci '{order: 5}'

# Get action information
ros2 action info /fibonacci
```

## Integration with Physical AI Systems

### Humanoid Robot Control Example

Here's an example of how services and actions would be used in a humanoid robot system:

```python
#!/usr/bin/env python3
"""
Example of services and actions for humanoid robot control
"""
import rclpy
from rclpy.action import ActionServer
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy
from example_interfaces.srv import SetBool, Trigger
from example_interfaces.action import FollowJointTrajectory
from trajectory_msgs.msg import JointTrajectory


class HumanoidRobotController(Node):
    """
    A controller demonstrating services and actions for humanoid robotics
    """
    def __init__(self):
        super().__init__('humanoid_robot_controller')

        # QoS profile for critical systems
        critical_qos = QoSProfile(
            depth=5,
            reliability=ReliabilityPolicy.RELIABLE,
            durability=DurabilityPolicy.VOLATILE
        )

        # Service for enabling/disabling robot
        self.enable_service = self.create_service(
            SetBool,
            'robot_enable',
            self.enable_callback,
            qos_profile=critical_qos
        )

        # Service for safety checks
        self.safety_check_service = self.create_service(
            Trigger,
            'safety_check',
            self.safety_check_callback,
            qos_profile=critical_qos
        )

        # Action for complex movements
        self.movement_action_server = ActionServer(
            self,
            FollowJointTrajectory,
            'body_trajectory',
            self.movement_callback
        )

        self.robot_enabled = False
        self.get_logger().info('Humanoid Robot Controller Started')

    def enable_callback(self, request, response):
        """
        Enable or disable the robot
        """
        self.robot_enabled = request.data
        response.success = True
        response.message = f'Robot {"enabled" if self.robot_enabled else "disabled"}'
        self.get_logger().info(response.message)
        return response

    def safety_check_callback(self, request, response):
        """
        Perform a safety check
        """
        # In a real system, this would check:
        # - Joint limits
        # - Collision avoidance
        # - Balance stability
        # - Hardware status
        # etc.

        response.success = True
        response.message = 'All safety checks passed'
        self.get_logger().info('Safety check completed')
        return response

    def movement_callback(self, goal_handle):
        """
        Execute complex movement trajectory
        """
        if not self.robot_enabled:
            goal_handle.abort()
            result = FollowJointTrajectory.Result()
            result.error_code = -2  # FollowJointTrajectory error code for invalid state
            return result

        self.get_logger().info('Executing movement trajectory')

        # This is where the actual trajectory execution would happen
        # Involving inverse kinematics, balance control, etc.

        feedback_msg = FollowJointTrajectory.Feedback()
        result = FollowJointTrajectory.Result()

        # Simulate movement execution
        for i, point in enumerate(goal_handle.request.trajectory.points):
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                result.error_code = -1  # Canceled
                return result

            # In a real system, this would command the joints
            # and monitor the actual position
            feedback_msg.actual = point
            feedback_msg.desired = point
            goal_handle.publish_feedback(feedback_msg)

            # Simulate execution time
            rclpy.spin_once(self, timeout_sec=0.1)

        if not goal_handle.is_cancel_requested:
            goal_handle.succeed()
            result.error_code = 0  # Success
        else:
            result.error_code = -1  # Canceled

        return result


def main(args=None):
    rclpy.init(args=args)
    node = HumanoidRobotController()

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

## Conclusion

This chapter covered the essential communication patterns beyond basic topics in ROS 2:

1. **Services** provide request-response communication ideal for configuration,
   status queries, and synchronous operations in Physical AI systems.

2. **Actions** handle long-running tasks with feedback and cancellation,
   perfect for navigation, manipulation, and complex robot behaviors.

3. **Best practices** include proper error handling, resource management,
   and QoS configuration for reliable operation.

4. **Integration strategies** show how to apply these patterns to real
   Physical AI and humanoid robotics applications.

These communication patterns are crucial for building robust Physical AI systems
that can handle complex, real-time interactions with the physical world. As we
continue through this book, we'll see how these patterns integrate with robot
description, simulation, and ultimately full humanoid robotics systems.

---

## 🚀 Key Takeaways for Physical AI Development

- **Communication Design**: Choose the right pattern (topics, services, or actions) based on your use case
- **Reliability**: Implement proper error handling and fallback mechanisms for mission-critical operations
- **Scalability**: Use appropriate QoS settings and callback groups for high-performance systems
- **Safety**: Design services and actions with emergency stop and cancellation capabilities

## 🎯 Next Steps in Physical AI

With a solid understanding of ROS 2 communication patterns, you're now equipped to tackle more advanced topics:

- **Simulation**: Creating realistic environments for testing your Physical AI systems
- **Perception**: Developing systems that can understand and interpret the physical world
- **Navigation**: Enabling robots to move safely and efficiently through complex environments
- **Humanoid Control**: Implementing the sophisticated control systems required for bipedal robots

Continue building your expertise in Physical AI by exploring the next chapters in this comprehensive guide.