---
sidebar_position: 1
title: 'Navigation 2 (Nav2)'
---

# Navigation 2 (Nav2): Path Planning for Physical AI Systems

## Introduction to Nav2 for Physical AI

Navigation 2 (Nav2) is the next-generation navigation framework for ROS 2, specifically designed for autonomous mobile robots. In Physical AI and humanoid robotics applications, Nav2 provides essential capabilities for path planning, obstacle avoidance, and goal-based navigation in dynamic environments.

Unlike traditional wheeled robot navigation, humanoid robots require specialized approaches to navigation that account for bipedal locomotion, balance constraints, and human-like movement patterns.

## Nav2 Architecture for Physical AI

### Core Components

Nav2 for Physical AI systems includes specialized components:

```python
#!/usr/bin/env python3
"""
Nav2 implementation for Physical AI and Humanoid Robotics
"""
import rclpy
from rclpy.node import Node
from nav2_msgs.action import NavigateToPose
from geometry_msgs.msg import PoseStamped, Point
from sensor_msgs.msg import LaserScan, PointCloud2
from tf2_ros import TransformBuffer, TransformListener
import numpy as np


class HumanoidNav2Node(Node):
    """
    Navigation system optimized for humanoid robots
    """
    def __init__(self):
        super().__init__('humanoid_nav2_node')
        
        # Nav2 action client for goal-based navigation
        self.nav_client = ActionClient(self, NavigateToPose, 'navigate_to_pose')
        
        # Sensor inputs for navigation
        self.lidar_sub = self.create_subscription(
            LaserScan,
            '/scan',
            self.lidar_callback,
            10
        )
        
        self.depth_sub = self.create_subscription(
            Image,
            '/camera/depth/image_rect_raw',
            self.depth_callback,
            10
        )
        
        # Publisher for humanoid-specific navigation commands
        self.step_commands_pub = self.create_publisher(PoseArray, '/step_commands', 10)
        self.balance_pub = self.create_publisher(BalanceCommand, '/balance_control', 10)
        
        # TF for coordinate transformations
        self.tf_buffer = TransformBuffer(self.get_clock())
        self.tf_listener = TransformListener(self.tf_buffer, self)
        
        # Humanoid-specific navigation parameters
        self.step_size_limit = 0.3  # Maximum step size for humanoid
        self.turn_radius = 0.2     # Minimum turning radius
        self.clearance_height = 0.5 # Minimum clearance for obstacles
        
        # Navigation state
        self.current_goal = None
        self.path_in_progress = False
        
        self.get_logger().info("Humanoid Nav2 Node Initialized")
    
    def navigate_to_pose(self, target_pose):
        """
        Navigate humanoid robot to target pose
        """
        goal_msg = NavigateToPose.Goal()
        goal_msg.pose = target_pose
        
        # Wait for action server
        self.nav_client.wait_for_server()
        
        # Send goal with humanoid-specific parameters
        send_goal_future = self.nav_client.send_goal_async(
            goal_msg,
            feedback_callback=self.nav_feedback_callback
        )
        
        send_goal_future.add_done_callback(self.nav_goal_response_callback)
    
    def nav_goal_response_callback(self, future):
        """
        Handle navigation goal response
        """
        goal_handle = future.result()
        if not goal_handle.accepted:
            self.get_logger().info('Goal rejected')
            return
        
        self.get_logger().info('Goal accepted')
        self.path_in_progress = True
        
        # Get result future
        self._get_result_future = goal_handle.get_result_async()
        self._get_result_future.add_done_callback(self.nav_result_callback)
    
    def nav_feedback_callback(self, feedback_msg):
        """
        Handle navigation feedback specific to humanoid capabilities
        """
        feedback = feedback_msg.feedback
        self.get_logger().debug(f'Navigation progress: {feedback.distance_remaining:.2f}m remaining')
        
        # For humanoid robots, provide balance feedback during navigation
        if self.should_adjust_balance(feedback):
            self.publish_balance_adjustment()
    
    def nav_result_callback(self, future):
        """
        Handle navigation result
        """
        result = future.result().result
        self.get_logger().info(f'Navigation result: {result}')
        self.path_in_progress = False
    
    def should_adjust_balance(self, feedback):
        """
        Determine if balance adjustments are needed during navigation
        """
        # Check if path has sharp turns or difficult terrain
        if hasattr(feedback, 'current_pose'):
            # Check for unusual orientations that might require balance adjustment
            orientation = feedback.current_pose.pose.orientation
            # In a real system, this would analyze the current step and balance state
            return True
        return False
    
    def publish_balance_adjustment(self):
        """
        Publish balance control commands for humanoid during navigation
        """
        balance_cmd = BalanceCommand()
        balance_cmd.mode = "walking_stable"
        balance_cmd.target_com = Point(x=0.0, y=0.0, z=0.8)  # Target CoM height
        self.balance_publisher.publish(balance_cmd)
    
    def lidar_callback(self, msg):
        """
        Process LiDAR data for navigation
        """
        # Analyze scan for navigable space
        valid_directions = self.analyze_scan_for_navigation(msg)
        
        # Check if current navigation path is still valid
        if self.path_in_progress:
            self.validate_navigation_path(valid_directions)
    
    def analyze_scan_for_navigation(self, scan_msg):
        """
        Analyze LiDAR scan for navigable directions
        """
        # Convert scan to useful format
        ranges = np.array(scan_msg.ranges)
        angles = np.linspace(
            scan_msg.angle_min, 
            scan_msg.angle_max, 
            len(ranges)
        )
        
        # Filter valid ranges
        valid_mask = (ranges > scan_msg.range_min) & (ranges < scan_msg.range_max) & np.isfinite(ranges)
        valid_ranges = ranges[valid_mask]
        valid_angles = angles[valid_mask]
        
        # Analyze for humanoid-appropriate navigation space
        # (considering step constraints and body width)
        navigable_angles = []
        for i, (angle, dist) in enumerate(zip(valid_angles, valid_ranges)):
            if dist > self.step_size_limit * 2:  # Safe distance
                navigable_angles.append(angle)
        
        return navigable_angles
    
    def validate_navigation_path(self, valid_directions):
        """
        Validate current navigation path against sensor data
        """
        # Check if current path goes through invalid areas
        # If so, request replanning
        pass


def main(args=None):
    rclpy.init(args=args)
    node = HumanoidNav2Node()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        if node.path_in_progress:
            node.nav_client.cancel_goal_async()
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Humanoid-Specific Navigation Challenges

### Bipedal Navigation Considerations

Humanoid robots face unique navigation challenges:

1. **Step Constraints**: Limited step size and height
2. **Balance Requirements**: Must maintain balance during movement
3. **Dynamic Stability**: Bipedal locomotion requires continuous control
4. **Ankle Compliance**: Need for compliant control of foot placement
5. **Gait Patterns**: Different gaits for different speeds and terrains

### Humanoid Path Planning

```yaml
# Nav2 configuration for humanoid robots
bt_navigator:
  ros__parameters:
    # Behavior tree configuration for humanoid navigation
    enable_groot_monitoring: true
    groot_zmq_publisher_port: 1666
    groot_zmq_server_port: 1667
    default_bt_xml_filename: "package://humanoid_nav2_behaviors/behavior_trees/humanoid_navigator.xml"
    # Humanoid-specific parameters
    humanoid_step_size_limit: 0.3  # meters
    humanoid_turn_radius: 0.2     # meters  
    humanoid_body_width: 0.4      # meters
    humanoid_clearance_height: 0.5 # meters for overhead obstacles

controller_server:
  ros__parameters:
    # Controller configuration for humanoid
    use_sim_time: false
    controller_frequency: 20.0  # Hz (lower for humanoid physics)
    min_x_velocity_threshold: 0.05
    min_y_velocity_threshold: 0.05
    min_theta_velocity_threshold: 0.05
    progress_checker_plugin: "progress_checker"
    goal_checker_plugin: "goal_checker"
    controller_plugins: ["FollowPath"]

    # Humanoid-specific controller
    FollowPath:
      plugin: "nav2_mppi_controller::MPPIController"
      time_steps: 32
      model_predictive_steps: 8
      control_duration: 0.2  # 200ms steps for humanoid dynamics
      vx_std: 0.2
      vy_std: 0.15
      wz_std: 0.3
      x_regulation_std: 0.5
      y_regulation_std: 0.3
      theta_regulation_std: 0.3
      lambda: 0.01
      horizon: 3.0  # Shorter horizon for humanoid agility
      feasibility_check: false
      collision_cost: 1.0
      goal_cost: 0.5
      path_cost: 1.0
      xy_goal_tolerance: 0.2  # Larger tolerance for humanoid
      yaw_goal_tolerance: 0.2

local_costmap:
  local_costmap:
    ros__parameters:
      update_frequency: 10.0
      publish_frequency: 5.0
      global_frame: odom
      robot_base_frame: base_link
      use_sim_time: false
      rolling_window: true
      width: 5  # Smaller for humanoid agility
      height: 5
      resolution: 0.05  # 5cm resolution
      origin_x: -2.5
      origin_y: -2.5
      # Inflation for humanoid body size
      inflation:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 2.0  # More cautious planning
        inflation_radius: 0.6     # Consider humanoid width
        inflate_unknown: false