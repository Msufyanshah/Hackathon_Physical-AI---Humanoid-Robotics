---
sidebar_position: 2
title: 'Bipedal Planning'
---

# Bipedal Planning: Humanoid Locomotion for Physical AI

## Introduction to Bipedal Locomotion

Bipedal locomotion represents one of the most complex challenges in humanoid robotics and Physical AI. Unlike wheeled or tracked robots, bipedal robots must maintain dynamic balance while stepping through the environment, requiring sophisticated planning that considers both navigation goals and balance constraints.

The challenge of bipedal locomotion lies in the inherently unstable nature of walking on two legs, where the robot must continuously adjust its center of mass and foot placements to maintain stability.

## Fundamentals of Bipedal Locomotion

### Stability and Balance

Humanoid robots must maintain balance by keeping their center of mass (CoM) within the support polygon defined by their feet. Key concepts include:

1. **Zero Moment Point (ZMP)**: The point where the net moment of ground reaction forces equals zero
2. **Capture Point**: The point where the robot must step to come to a complete stop
3. **Support Polygon**: Area between feet where CoM can be kept for stability

### Walking Patterns

Bipedal robots employ different walking patterns based on speed and stability requirements:

1. **Static Balance**: One foot always in contact (very slow, stable walking)
2. **Dynamic Balance**: Periods of single support (natural human-like walking)
3. **Passive Dynamic**: Energy-efficient walking using natural dynamics
4. **Adaptive Gaits**: Adjusting gait based on terrain and constraints

## Mathematical Models for Humanoid Locomotion

### Linear Inverted Pendulum Model (LIPM)

The Linear Inverted Pendulum Model is a simplified model for humanoid walking:

```
ẍ = ω²(x - p)
```

Where:
- x is the center of mass position
- p is the ZMP position  
- ω = √(g/h) where g is gravity and h is CoM height

```python
#!/usr/bin/env python3
"""
Bipedal planning using Linear Inverted Pendulum Model
"""
import numpy as np
from scipy.integrate import solve_ivp
import matplotlib.pyplot as plt


class LinearInvertedPendulumPlanner:
    """
    Linear Inverted Pendulum Model for bipedal planning
    """
    def __init__(self, com_height=0.8):
        self.com_height = com_height
        self.omega = np.sqrt(9.81 / com_height)  # Natural frequency
        self.gravity = 9.81
        
    def step_location_planning(self, current_com_pos, current_com_vel, 
                              current_zmp_pos, desired_com_pos, desired_com_vel):
        """
        Plan step locations based on LIPM
        """
        # Calculate the natural frequency
        omega = self.omega
        
        # For LIPM, the relationship between CoM, ZMP, and their velocities is:
        # x_ddot = omega² * (x - zmp)
        
        # Calculate required ZMP to achieve desired state
        required_zmp_x = desired_com_pos[0] - (desired_com_vel[0] / omega**2)
        required_zmp_y = desired_com_pos[1] - (desired_com_vel[1] / omega**2)
        
        return [required_zmp_x, required_zmp_y]
    
    def capture_point_calculation(self, current_com_pos, current_com_vel):
        """
        Calculate capture point - where to step to come to stop
        """
        px = current_com_pos[0] + current_com_vel[0] / self.omega
        py = current_com_pos[1] + current_com_vel[1] / self.omega
        
        return [px, py]


class BipedalWalkingPatternGenerator:
    """
    Generates walking patterns for humanoid robots based on LIPM
    """
    def __init__(self, step_height=0.05, step_length=0.3, step_duration=0.6):
        self.step_height = step_height
        self.step_length = step_length
        self.step_duration = step_duration
        self.lipm = LinearInvertedPendulumPlanner()
        
    def generate_walking_trajectory(self, start_pos, goal_pos, step_frequency=1.0):
        """
        Generate a walking trajectory from start to goal position
        """
        # Calculate number of steps needed
        total_distance = np.linalg.norm(np.array(goal_pos) - np.array(start_pos))
        num_steps = int(total_distance / self.step_length) + 1
        
        # Calculate step positions
        step_positions = []
        step_times = []
        
        for i in range(num_steps):
            # Interpolate between start and goal
            progress = min(1.0, i * self.step_length / total_distance)
            
            step_x = start_pos[0] + progress * (goal_pos[0] - start_pos[0])
            step_y = start_pos[1] + progress * (goal_pos[1] - start_pos[1])
            
            # Alternate feet for stepping (left-right-left-right...)
            step_time = i * self.step_duration
            step_positions.append([step_x, step_y, 0])  # Add z=0 for now
            step_times.append(step_time)
        
        return {
            'step_positions': step_positions,
            'step_times': step_times,
            'num_steps': num_steps
        }
    
    def generate_foot_trajectory(self, left_foot_start, right_foot_start, 
                                step_positions, step_times):
        """
        Generate complete foot trajectories for walking
        """
        # Generate trajectories for left and right feet
        left_trajectory = []
        right_trajectory = []
        
        current_left_pos = left_foot_start
        current_right_pos = right_foot_start
        
        # Generate for each step
        for i in range(len(step_positions)):
            step_pos = step_positions[i]
            step_time = step_times[i]
            
            # Determine which foot to move (alternating)
            if i % 2 == 0:  # Move left foot
                # Generate left foot trajectory
                left_traj = self.foot_lift_trajectory(current_left_pos, step_pos, step_time)
                left_trajectory.extend(left_traj)
                current_left_pos = step_pos
            else:  # Move right foot
                # Generate right foot trajectory
                right_traj = self.foot_lift_trajectory(current_right_pos, step_pos, step_time)
                right_trajectory.extend(right_traj)
                current_right_pos = step_pos
        
        return {
            'left_trajectory': left_trajectory,
            'right_trajectory': right_trajectory
        }
    
    def foot_lift_trajectory(self, start_pos, end_pos, lift_time):
        """
        Generate trajectory for lifting and placing foot
        """
        trajectory_points = []
        
        # Mid-step position (higher)
        mid_pos = [
            (start_pos[0] + end_pos[0]) / 2,
            (start_pos[1] + end_pos[1]) / 2,
            max(start_pos[2], end_pos[2]) + self.step_height  # Step over height
        ]
        
        # Generate trajectory through mid point
        for t in np.linspace(0, 1, 10):  # 10 points per step
            if t < 0.5:
                # Lift phase - from start to mid
                pos = [
                    start_pos[0] + t * 2 * (mid_pos[0] - start_pos[0]),
                    start_pos[1] + t * 2 * (mid_pos[1] - start_pos[1]),
                    start_pos[2] + t * 2 * (mid_pos[2] - start_pos[2])
                ]
            else:
                # Lower phase - from mid to end
                pos = [
                    mid_pos[0] + (t - 0.5) * 2 * (end_pos[0] - mid_pos[0]),
                    mid_pos[1] + (t - 0.5) * 2 * (end_pos[1] - mid_pos[1]),
                    mid_pos[2] + (t - 0.5) * 2 * (end_pos[2] - mid_pos[2])
                ]
            
            trajectory_points.append({
                'position': pos,
                'time': lift_time + t * self.step_duration
            })
        
        return trajectory_points


def main():
    """
    Example usage of bipedal planning
    """
    # Initialize planner
    planner = BipedalWalkingPatternGenerator()
    
    # Generate walking trajectory
    start_pos = [0.0, 0.0]
    goal_pos = [2.0, 1.0]
    
    trajectory = planner.generate_walking_trajectory(start_pos, goal_pos)
    
    print(f"Generated trajectory with {trajectory['num_steps']} steps")
    print(f"Step positions: {trajectory['step_positions'][:3]}...")  # Print first 3
    
    # Generate complete foot trajectories
    left_start = [0.0, 0.1, 0.0]   # Left foot starts slightly to the side
    right_start = [0.0, -0.1, 0.0]  # Right foot starts slightly to the other side
    
    foot_trajectories = planner.generate_foot_trajectory(
        left_start, right_start, 
        trajectory['step_positions'], 
        trajectory['step_times']
    )
    
    print(f"Generated {len(foot_trajectories['left_trajectory'])} left foot points")
    print(f"Generated {len(foot_trajectories['right_trajectory'])} right foot points")


if __name__ == '__main__':
    main()
```

### Center of Mass Trajectory Planning

For stable walking, the center of mass must follow a specific trajectory:

```python
#!/usr/bin/env python3
"""
Center of Mass trajectory planning for humanoid locomotion
"""

class CenterOfMassPlanner:
    """
    Plan CoM trajectories for stable humanoid locomotion
    """
    def __init__(self, com_height=0.8, walk_frequency=2.0):
        self.com_height = com_height
        self.walk_frequency = walk_frequency
        self.omega = np.sqrt(9.81 / com_height)
        
    def plan_com_trajectory(self, step_locations, step_times, com_start_pos):
        """
        Plan CoM trajectory given footstep locations and times
        """
        com_trajectory = []
        
        current_com = np.array(com_start_pos)
        
        # For each step period, plan CoM movement
        for i in range(len(step_locations) - 1):
            current_support = step_locations[i % 2]  # Alternating support foot
            next_support = step_locations[(i + 1) % 2]
            
            # Plan CoM movement during single support phase
            step_duration = step_times[i + 1] - step_times[i]
            step_mid_time = step_times[i] + step_duration / 2.0
            
            # Calculate target CoM position (between current and future support)
            target_com_x = (current_support[0] + next_support[0]) / 2.0
            target_com_y = (current_support[1] + next_support[1]) / 2.0
            
            # Generate CoM trajectory for this step
            step_com_trajectory = self.plan_single_support_com(
                current_com, [target_com_x, target_com_y, self.com_height],
                step_duration, step_times[i]
            )
            
            com_trajectory.extend(step_com_trajectory)
            current_com = step_com_trajectory[-1]['position']  # Update for next step
        
        return com_trajectory
    
    def plan_single_support_com(self, start_pos, end_pos, duration, start_time):
        """
        Plan CoM trajectory during single support phase
        """
        trajectory_points = []
        
        for t in np.linspace(0, duration, int(duration * 100)):  # 100Hz
            # Smooth interpolation between start and end positions
            interpolation_factor = (1 - np.cos(np.pi * t / duration)) / 2
            actual_time = start_time + t
            
            pos_x = start_pos[0] + interpolation_factor * (end_pos[0] - start_pos[0])
            pos_y = start_pos[1] + interpolation_factor * (end_pos[1] - start_pos[1])
            pos_z = self.com_height  # Keep CoM height constant
            
            # Add small oscillations for natural walking
            phase_offset = 2 * np.pi * t * self.walk_frequency + np.random.uniform(-0.1, 0.1)
            pos_z += 0.02 * np.sin(phase_offset)  # Small vertical oscillation
            
            trajectory_points.append({
                'position': [pos_x, pos_y, pos_z],
                'time': actual_time,
                'velocity': [  # Approximate velocity
                    (end_pos[0] - start_pos[0]) / duration,
                    (end_pos[1] - start_pos[1]) / duration,
                    0.0  # Vertical velocity handled separately
                ]
            })
        
        return trajectory_points
```

## Advanced Bipedal Control Techniques

### Preview Control for Humanoid Walking

Preview control improves stability by considering future footsteps:

```python
#!/usr/bin/env python3
"""
Preview control for humanoid walking
"""

class PreviewControlWalking:
    """
    Implements preview control for humanoid walking
    """
    def __init__(self, preview_horizon=20, com_height=0.8):
        self.preview_horizon = preview_horizon
        self.com_height = com_height
        self.omega = np.sqrt(9.81 / com_height)
        
    def compute_preview_control(self, current_com_pos, current_com_vel, 
                               future_foot_locations, sampling_time=0.01):
        """
        Compute preview control for stable walking with future footstep knowledge
        """
        # Initialize control parameters
        # This would involve solving the discrete-time Riccati equation
        # for optimal preview control
        
        # Simplified preview control implementation
        # In reality, this would involve complex matrix computations
        
        # For each step in preview horizon, compute required control
        control_inputs = []
        
        for i in range(self.preview_horizon):
            if i < len(future_foot_locations):
                desired_zmp = future_foot_locations[i]
                
                # Calculate required CoM adjustment
                # This is a simplified version of preview control
                com_error = np.array(current_com_pos[:2]) - np.array(desired_zmp[:2])
                
                # Apply feedback control with preview
                control_input = -self.omega**2 * com_error
                control_inputs.append(control_input)
        
        return np.mean(control_inputs, axis=0)  # Average control input recommendation
```

### Walking State Machine

A finite state machine is used to control different phases of walking:

```python
from enum import Enum

class WalkingState(Enum):
    """
    States for humanoid walking FSM
    """
    START_STANCE = 1
    LEFT_SUPPORT = 2
    RIGHT_SUPPORT = 3
    DOUBLE_SUPPORT_START = 4
    DOUBLE_SUPPORT_END = 5
    STOP_STANCE = 6

class WalkingStateMachine:
    """
    Finite state machine for humanoid walking control
    """
    def __init__(self):
        self.current_state = WalkingState.START_STANCE
        self.state_timer = 0.0
        self.balance_controller = BalanceController()
        self.footstep_planner = BipedalWalkingPatternGenerator()
        
    def update_state_machine(self, robot_state, target_position):
        """
        Update walking FSM based on robot state and target
        """
        # Logic based on current state
        if self.current_state == WalkingState.START_STANCE:
            # Initiate walking from stationary state
            if self.can_start_walking(robot_state, target_position):
                self.transition_to(WalkingState.LEFT_SUPPORT)
        elif self.current_state == WalkingState.LEFT_SUPPORT:
            # Left foot support, right foot swing
            if self.right_foot_ready_to_land():
                self.transition_to(WalkingState.DOUBLE_SUPPORT_START)
        elif self.current_state == WalkingState.RIGHT_SUPPORT:
            # Right foot support, left foot swing
            if self.left_foot_ready_to_land():
                self.transition_to(WalkingState.DOUBLE_SUPPORT_START)
        elif self.current_state in [WalkingState.DOUBLE_SUPPORT_START, WalkingState.DOUBLE_SUPPORT_END]:
            # Transition between single support phases
            if self.balance_controller.is_balanced():
                next_state = WalkingState.LEFT_SUPPORT if self.state_timer % 2 == 0 else WalkingState.RIGHT_SUPPORT
                self.transition_to(next_state)
        elif self.current_state == WalkingState.STOP_STANCE:
            # Stop walking and return to stable stance
            if self.balance_controller.is_stationary_balanced():
                self.transition_to(WalkingState.START_STANCE)
    
    def can_start_walking(self, robot_state, target_position):
        """
        Check if robot can transition from stance to walking
        """
        # Check balance, target distance, and safety conditions
        current_pos = robot_state.position
        distance_to_target = np.linalg.norm(np.array(target_position) - np.array(current_pos))
        
        # Need to be balanced and target not too close
        return (self.balance_controller.is_balanced() and 
                distance_to_target > 0.5)  # At least 50cm to target
    
    def right_foot_ready_to_land(self):
        """
        Check if right foot is ready to land
        """
        # In real implementation, check foot position vs landing position
        return True  # Placeholder
    
    def left_foot_ready_to_land(self):
        """
        Check if left foot is ready to land
        """
        # In real implementation, check foot position vs landing position
        return True  # Placeholder
    
    def transition_to(self, new_state):
        """
        Transition to a new walking state
        """
        self.current_state = new_state
        self.state_timer = 0.0
        self.get_logger().info(f"Walking state transitioned to: {new_state.name}")
```

## Implementation Example: Walking Controller

```python
#!/usr/bin/env python3
"""
Complete humanoid walking controller integrating all elements
"""
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Pose, Twist
from std_msgs.msg import Float32
from sensor_msgs.msg import JointState
from humanoid_msgs.msg import BalanceCommand, WalkingCommand


class HumanoidWalkingController(Node):
    """
    Complete walking controller for humanoid robots
    """
    def __init__(self):
        super().__init__('humanoid_walking_controller')
        
        # Publishers for walking commands
        self.trajectory_pub = self.create_publisher(Pose, '/walking_trajectory', 10)
        self.balance_pub = self.create_publisher(BalanceCommand, '/balance_control', 10)
        self.joint_cmd_pub = self.create_publisher(JointState, '/joint_commands', 10)
        
        # Subscribers for state feedback
        self.joint_state_sub = self.create_subscription(
            JointState,
            '/joint_states',
            self.joint_state_callback,
            10
        )
        
        self.imu_sub = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10
        )
        
        # Service for walking commands
        self.walk_service = self.create_service(
            WalkingCommand,
            '/walk_to',
            self.walk_to_callback
        )
        
        # Initialize components
        self.bipedal_planner = BipedalWalkingPatternGenerator()
        self.com_planner = CenterOfMassPlanner()
        self.preview_controller = PreviewControlWalking()
        self.walking_fsm = WalkingStateMachine()
        
        # Walking parameters
        self.step_size = 0.3  # meters
        self.step_height = 0.05  # meters
        self.step_duration = 0.6  # seconds
        self.walk_frequency = 1.0 / self.step_duration
        
        self.walk_target = None
        self.is_walking = False
        self.current_step = 0
        self.total_steps = 0
        
        # Initialize to standing position
        self.robot_position = [0.0, 0.0, 0.0]
        self.robot_orientation = [0.0, 0.0, 0.0, 1.0]
        
        self.get_logger().info("Humanoid Walking Controller Initialized")

    def walk_to_callback(self, request, response):
        """
        Service callback to initiate walking to a target
        """
        target_pos = [request.target.x, request.target.y, request.target.z]
        
        self.get_logger().info(f"Initiating walk to target: {target_pos}")
        
        # Plan walking trajectory
        trajectory = self.bipedal_planner.generate_walking_trajectory(
            self.robot_position[:2], target_pos[:2]
        )
        
        self.walk_target = target_pos
        self.total_steps = trajectory['num_steps']
        self.current_step = 0
        self.is_walking = True
        
        # Start walking state machine
        self.walking_fsm.current_state = WalkingState.START_STANCE
        
        # Begin walking execution
        self.begin_walking_execution(trajectory)
        
        response.success = True
        response.message = f"Started walking to target with {self.total_steps} steps"
        
        return response

    def begin_walking_execution(self, trajectory):
        """
        Begin executing the planned walking trajectory
        """
        # In a real implementation, this would start a control loop
        # to execute each step in the trajectory
        
        # Set up timer for walking control
        self.walking_timer = self.create_timer(
            0.01,  # 100Hz walking control
            self.walking_control_loop
        )
        
        self.get_logger().info(f"Started walking execution with {self.total_steps} steps")

    def walking_control_loop(self):
        """
        Main walking control loop
        """
        if not self.is_walking or self.current_step >= self.total_steps:
            return  # Stop walking if completed
        
        # Update walking state machine
        self.walking_fsm.update_state_machine(self.get_robot_state(), self.walk_target)
        
        # Get next step in trajectory
        if self.current_step < len(self.trajectory['step_positions']):
            next_step = self.trajectory['step_positions'][self.current_step]
            
            # Generate required CoM trajectory for this step
            com_trajectory = self.com_planner.plan_com_trajectory(
                [self.left_foot_pos, self.right_foot_pos],  # Current foot positions
                [self.trajectory['step_times'][self.current_step]],  # Step time
                self.com_position
            )
            
            # Execute the step using preview control
            control_command = self.preview_controller.compute_preview_control(
                self.com_position, self.com_velocity,
                [next_step], 0.01  # Current and next step locations
            )
            
            # Publish balance command
            balance_cmd = BalanceCommand()
            balance_cmd.mode = "walking"
            balance_cmd.target_com_position = Point(
                x=control_command[0],
                y=control_command[1], 
                z=self.com_height
            )
            self.balance_publisher.publish(balance_cmd)
            
            # Publish footstep command
            foot_cmd = self.generate_footstep_command(next_step)
            self.trajectory_publisher.publish(foot_cmd)
            
            # Update step counter
            self.current_step += 1
            
            # Check if reached target
            remaining_steps = self.total_steps - self.current_step
            if remaining_steps == 0:
                self.complete_walking()
    
    def generate_footstep_command(self, step_position):
        """
        Generate footstep command for the robot
        """
        # In a real system, this would generate joint trajectories
        # to move the foot to the specified position
        
        foot_pose = Pose()
        foot_pose.position.x = step_position[0]
        foot_pose.position.y = step_position[1]
        foot_pose.position.z = step_position[2]
        
        # Simple orientation (for now, facing forward)
        foot_pose.orientation.w = 1.0
        
        return foot_pose

    def complete_walking(self):
        """
        Finish walking and return to stable stance
        """
        self.is_walking = False
        self.walking_timer.destroy()
        
        # Transition to stable stance
        balance_cmd = BalanceCommand()
        balance_cmd.mode = "stance"
        balance_cmd.target_com_position = Point(x=0.0, y=0.0, z=self.com_height)
        self.balance_publisher.publish(balance_cmd)
        
        self.get_logger().info(f"Completed walking to target after {self.total_steps} steps")

    def joint_state_callback(self, msg):
        """
        Update robot state from joint positions
        """
        # Use forward kinematics to determine foot positions and CoM
        self.left_foot_pos = self.calculate_left_foot_position(msg)
        self.right_foot_pos = self.calculate_right_foot_position(msg)
        self.com_position = self.calculate_com_position(msg)
        self.com_velocity = self.estimate_com_velocity(msg)

    def imu_callback(self, msg):
        """
        Update robot orientation and acceleration
        """
        self.robot_orientation = [
            msg.orientation.x,
            msg.orientation.y,
            msg.orientation.z,
            msg.orientation.w
        ]
        
        self.acceleration = [
            msg.linear_acceleration.x,
            msg.linear_acceleration.y,
            msg.linear_acceleration.z
        ]
        
        self.angular_velocity = [
            msg.angular_velocity.x,
            msg.angular_velocity.y,
            msg.angular_velocity.z
        ]

    def get_robot_state(self):
        """
        Get current robot state for walking FSM
        """
        return {
            'position': self.robot_position,
            'orientation': self.robot_orientation,
            'com_position': self.com_position,
            'foot_positions': [self.left_foot_pos, self.right_foot_pos],
            'acceleration': self.acceleration,
            'angular_velocity': self.angular_velocity
        }

    def calculate_left_foot_position(self, joint_state):
        """
        Calculate left foot position using forward kinematics
        """
        # This would use the actual robot URDF and FK calculations
        # For this example, return a placeholder
        return [0.0, 0.1, 0.0]  # Placeholder

    def calculate_right_foot_position(self, joint_state):
        """
        Calculate right foot position using forward kinematics
        """
        # This would use the actual robot URDF and FK calculations
        # For this example, return a placeholder
        return [0.0, -0.1, 0.0]  # Placeholder

    def calculate_com_position(self, joint_state):
        """
        Calculate center of mass position from joint states
        """
        # This would calculate actual CoM based on joint positions and link masses
        # For this example, return a placeholder
        return [0.0, 0.0, 0.8]  # 0.8m height placeholder

    def estimate_com_velocity(self, joint_state):
        """
        Estimate center of mass velocity
        """
        # Would estimate from joint velocities in a real implementation
        return [0.0, 0.0, 0.0]  # Placeholder


def main(args=None):
    rclpy.init(args=args)
    node = HumanoidWalkingController()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info("Shutting down humanoid walking controller...")
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Terrain Adaptation for Physical AI

### Adaptive Walking for Uneven Terrains

Physical AI systems must adapt to various terrains:

```python
#!/usr/bin/env python3
"""
Terrain-adaptive walking for Physical AI systems
"""
import numpy as np
from scipy.spatial import cKDTree


class TerrainAdaptiveWalker:
    """
    Adaptive walking controller for various terrains
    """
    def __init__(self):
        # Terrain classification system
        self.terrain_classifier = TerrainClassifier()
        
        # Gait parameter adjustments based on terrain
        self.terrain_gaits = {
            'flat': {'step_length': 0.3, 'step_height': 0.05, 'frequency': 2.0},
            'uneven': {'step_length': 0.2, 'step_height': 0.1, 'frequency': 1.5},
            'stairs': {'step_length': 0.15, 'step_height': 0.25, 'frequency': 1.0},
            'slope': {'step_length': 0.25, 'step_height': 0.07, 'frequency': 1.8},
            'soft': {'step_length': 0.2, 'step_height': 0.06, 'frequency': 1.0}
        }
        
        # Foot adjustment parameters
        self.max_foot_adjustment = 0.05  # meters
        
    def classify_terrain(self, point_cloud):
        """
        Classify terrain type from sensor data
        """
        # Analyze point cloud for terrain characteristics
        ground_points = self.extract_ground_points(point_cloud)
        
        if len(ground_points) < 10:
            return 'unknown', 0.0
        
        # Analyze terrain features
        terrain_properties = {
            'roughness': self.calculate_roughness(ground_points),
            'slope': self.calculate_slope(ground_points),
            'step_height': self.calculate_step_height(ground_points),
            'compressibility': self.estimate_compressibility(ground_points)
        }
        
        # Classify terrain based on properties
        terrain_type = self.terrain_classifier.classify(terrain_properties)
        confidence = self.terrain_classifier.confidence(terrain_properties)
        
        return terrain_type, confidence
    
    def adjust_walking_parameters(self, terrain_type, current_params):
        """
        Adjust walking parameters based on terrain classification
        """
        if terrain_type in self.terrain_gaits:
            terrain_params = self.terrain_gaits[terrain_type]
            
            # Blend terrain-specific parameters with current ones
            adjusted_params = {}
            for param in ['step_length', 'step_height', 'frequency']:
                terrain_val = terrain_params[param]
                current_val = current_params.get(param, terrain_val)
                
                # Use terrain value if safe, otherwise blend
                if self.is_safe_terrain_parameter(terrain_type, param, terrain_val):
                    adjusted_params[param] = terrain_val
                else:
                    # Blend with conservative value
                    adjusted_params[param] = min(terrain_val, current_val) * 0.8
            
            return adjusted_params
        else:
            # Return current params if terrain unknown
            return current_params
    
    def is_safe_terrain_parameter(self, terrain_type, param, value):
        """
        Check if a specific parameter value is safe for the terrain
        """
        # Safety checks based on terrain type
        if terrain_type == 'stairs' and param == 'step_length':
            return value <= 0.2  # Conservative step length for stairs
        elif terrain_type == 'soft' and param == 'frequency':
            return value >= 1.0  # Slower steps on soft terrain
        elif terrain_type == 'uneven' and param == 'step_height':
            return value <= 0.15  # Higher steps for uneven terrain
        
        return True  # Generally safe

    def generate_adaptive_footstep(self, terrain_type, nominal_footstep, point_cloud):
        """
        Generate footstep adjusted for terrain characteristics
        """
        # Get terrain-specific adjustments
        if terrain_type in self.terrain_gaits:
            adjustments = self.terrain_gaits[terrain_type]
        else:
            adjustments = {'step_length': 0.3, 'step_height': 0.05, 'frequency': 2.0}
        
        # Analyze terrain at target position
        terrain_analysis = self.analyze_terrain_at_point(
            nominal_footstep, point_cloud
        )
        
        # Adjust foot position based on terrain
        adjusted_footstep = nominal_footstep.copy()
        
        # Adjust for height variations
        if terrain_analysis['surface_height_variance'] > 0.02:  # 2cm threshold
            # Find more stable landing spot
            adjusted_footstep[2] = self.find_stable_landing_height(
                nominal_footstep, point_cloud
            )
        
        # Adjust for surface properties
        if terrain_analysis['surface_roughness'] > 0.1:  # High roughness
            # Increase step height to clear obstacles
            adjusted_footstep[2] += 0.05  # Additional 5cm clearance
        
        # Adjust for slope
        if abs(terrain_analysis['local_slope']) > 0.2:  # 11.3 degree threshold
            # Compensate for slope in foot placement
            adjusted_footstep = self.compensate_for_slope(
                nominal_footstep, terrain_analysis['local_slope']
            )
        
        return adjusted_footstep

    def find_stable_landing_height(self, target_pos, point_cloud):
        """
        Find the most stable landing height for a footstep
        """
        # Look for flat, stable surfaces in the vicinity
        search_radius = 0.1  # 10cm search radius
        
        # Find points near target position
        tree = cKDTree(point_cloud[:, :2])  # Use only x,y for search
        indices = tree.query_ball_point(target_pos[:2], search_radius)
        
        if indices:
            # Calculate average height in the region
            heights = point_cloud[indices, 2]
            avg_height = np.mean(heights)
            
            # Find the most stable region (lowest variance in height)
            # Divide region into small cells and find the flattest one
            cell_size = 0.05  # 5cm cells
            x_min, x_max = target_pos[0] - search_radius, target_pos[0] + search_radius
            y_min, y_max = target_pos[1] - search_radius, target_pos[1] + search_radius
            
            best_cell_height = avg_height
            min_variance = float('inf')
            
            # Iterate through grid cells to find most stable
            for x_cell in np.arange(x_min, x_max, cell_size):
                for y_cell in np.arange(y_min, y_max, cell_size):
                    cell_indices = tree.query_ball_point([x_cell + cell_size/2, y_cell + cell_size/2], cell_size/2)
                    if cell_indices:
                        cell_heights = point_cloud[cell_indices, 2]
                        cell_variance = np.var(cell_heights)
                        
                        if cell_variance < min_variance:
                            min_variance = cell_variance
                            best_cell_height = np.mean(cell_heights)
            
            return best_cell_height
        
        return target_pos[2]  # Return original height if no stable region found

    def compensate_for_slope(self, foot_pos, slope):
        """
        Compensate foot placement for sloped surfaces
        """
        # For negative slope (descending), lower foot position
        # For positive slope (ascending), raise foot position
        compensation = slope * self.max_foot_adjustment  # Adjust based on slope
        adjusted_pos = foot_pos.copy()
        adjusted_pos[2] += compensation
        
        return adjusted_pos


class TerrainClassifier:
    """
    Classifies terrain types for adaptive walking
    """
    def __init__(self):
        self.terrain_features = {
            'flat': {'roughness_range': (0.0, 0.05), 'slope_range': (0.0, 0.1), 'height_var_range': (0.0, 0.02)},
            'uneven': {'roughness_range': (0.05, 0.2), 'slope_range': (0.1, 0.3), 'height_var_range': (0.02, 0.1)},
            'stairs': {'roughness_range': (0.0, 0.1), 'slope_range': (0.3, 0.8), 'height_var_range': (0.1, 0.5)},
            'slope': {'roughness_range': (0.0, 0.05), 'slope_range': (0.1, 0.3), 'height_var_range': (0.0, 0.05)},
            'soft': {'roughness_range': (0.0, 0.1), 'slope_range': (0.0, 0.1), 'height_var_range': (0.0, 0.05)}
        }
    
    def classify(self, terrain_properties):
        """
        Classify terrain based on properties
        """
        roughness = terrain_properties['roughness']
        slope = terrain_properties['slope']
        step_height = terrain_properties['step_height']
        
        # Score each terrain type based on how well it matches properties
        scores = {}
        for terrain_type, features in self.terrain_features.items():
            score = 0
            
            # Roughness matching
            rough_min, rough_max = features['roughness_range']
            if rough_min <= roughness <= rough_max:
                score += 1
            else:
                # Penalize deviation from ideal range
                if roughness < rough_min:
                    score -= (rough_min - roughness) / rough_min
                else:
                    score -= (roughness - rough_max) / rough_max
            
            # Slope matching
            slope_min, slope_max = features['slope_range']
            if slope_min <= slope <= slope_max:
                score += 1
            else:
                if slope < slope_min:
                    score -= (slope_min - slope) / slope_min
                else:
                    score -= (slope - slope_max) / slope_max
            
            scores[terrain_type] = score
        
        # Return terrain type with highest score
        return max(scores, key=scores.get)
    
    def confidence(self, terrain_properties):
        """
        Calculate confidence in terrain classification
        """
        # For simplicity, confidence based on how distinct the classification is
        # In real implementation, this would be more sophisticated
        return 0.8  # Placeholder confidence


def main():
    """
    Example usage of terrain-adaptive walking
    """
    walker = TerrainAdaptiveWalker()
    
    # Simulate a point cloud from sensor data
    # This would come from depth sensors in a real system
    simulated_point_cloud = np.random.rand(1000, 3)  # Placeholder
    
    # Classify terrain
    terrain_type, confidence = walker.classify_terrain(simulated_point_cloud)
    
    print(f"Detected terrain: {terrain_type} with confidence: {confidence:.2f}")
    
    # Plan adaptive walking
    nominal_step = [0.3, 0, 0]  # x, y, z relative to robot
    adaptive_step = walker.generate_adaptive_footstep(
        terrain_type, nominal_step, simulated_point_cloud
    )
    
    print(f"Nominal step: {nominal_step}")
    print(f"Adaptive step: {adaptive_step}")


if __name__ == '__main__':
    main()
```

## Quality Assurance for Bipedal Systems

### Walking Stability Metrics

```python
class WalkingStabilityAssessment:
    """
    Assess stability during humanoid walking
    """
    def __init__(self):
        # Stability thresholds
        self.zmp_margin = 0.05  # 5cm margin from foot edge
        self.com_velocity_limit = 0.5  # m/s max CoM velocity
        self.foot_clearance_min = 0.02  # 2cm minimum foot clearance
        self.foot_clearance_max = 0.15  # 15cm maximum foot clearance
        self.balance_threshold = 0.2  # Angle threshold for balance
        
    def assess_stability(self, robot_state, planned_trajectory):
        """
        Assess walking stability based on current state
        """
        stability_metrics = {}
        
        # ZMP stability
        zmp_pos = self.calculate_current_zmp(robot_state)
        support_polygon = self.calculate_support_polygon(robot_state)
        zmp_stability = self.assess_zmp_stability(zmp_pos, support_polygon)
        stability_metrics['zmp_stability'] = float(zmp_stability)
        
        # CoM velocity
        com_vel = np.linalg.norm(robot_state['com_velocity'])
        com_stability = com_vel < self.com_velocity_limit
        stability_metrics['com_velocity'] = float(com_vel)
        stability_metrics['com_stability'] = float(com_stability)
        
        # Foot placement
        foot_clearance = self.assess_foot_clearance(robot_state, planned_trajectory)
        stability_metrics['foot_clearance_ok'] = float(foot_clearance)
        
        # Overall stability score
        stability_score = (
            zmp_stability * 0.4 + 
            (1.0 if com_stability else 0.0) * 0.3 + 
            (1.0 if foot_clearance else 0.0) * 0.3
        )
        stability_metrics['overall_stability'] = float(stability_score)
        
        return stability_metrics
    
    def calculate_current_zmp(self, robot_state):
        """
        Calculate current Zero Moment Point
        """
        # ZMP = CoM position + (CoM acceleration / gravity) * CoM height
        com_pos = np.array(robot_state['com_position'])
        com_acc = np.array(robot_state['com_acceleration'])  # Would be estimated from IMU
        gravity = 9.81
        
        zmp = com_pos + (com_acc / gravity) * com_pos[2]  # Simplified ZMP calculation
        return zmp[:2]  # Only x,y components
    
    def calculate_support_polygon(self, robot_state):
        """
        Calculate support polygon based on feet positions
        """
        left_foot = robot_state['left_foot_position']
        right_foot = robot_state['right_foot_position']
        
        # Support polygon is the convex hull of feet points
        # Simplified as bounding box for now
        min_x = min(left_foot[0], right_foot[0])
        max_x = max(left_foot[0], right_foot[0])
        min_y = min(left_foot[1], right_foot[1])  
        max_y = max(left_foot[1], right_foot[1])
        
        return [[min_x, min_y], [max_x, min_y], [max_x, max_y], [min_x, max_y]]
    
    def assess_zmp_stability(self, zmp_pos, support_polygon):
        """
        Assess if ZMP is within stable bounds
        """
        # Check if ZMP point is within support polygon (with margin)
        sp = np.array(support_polygon)
        
        # Simple box check (could be replaced with proper polygon inclusion test)
        zmp_x, zmp_y = zmp_pos
        margin = self.zmp_margin
        
        return (
            min(sp[:, 0]) + margin <= zmp_x <= max(sp[:, 0]) - margin and
            min(sp[:, 1]) + margin <= zmp_y <= max(sp[:, 1]) - margin
        )
    
    def assess_foot_clearance(self, robot_state, planned_trajectory):
        """
        Assess if foot clearances are appropriate
        """
        # Check planned foot trajectory has appropriate clearance
        # For this example, we'll just check if foot is within bounds
        planned_steps = planned_trajectory.get('step_positions', [])
        
        if not planned_steps:
            return True  # No steps planned, so no clearance issue
        
        # Check that steps are at appropriate heights
        for step in planned_steps[:5]:  # Check next 5 steps
            if not (self.foot_clearance_min <= step[2] <= self.foot_clearance_max):
                return False  # Clearance not within bounds
        
        return True
```

## Integration with Navigation Systems

Bipedal planning must integrate with navigation systems:

```python
#!/usr/bin/env python3
"""
Integration between navigation and bipedal planning
"""
import numpy as np


class NavigationBipedalIntegrator:
    """
    Integrates navigation planning with bipedal locomotion
    """
    def __init__(self, nav_planner, bipedal_planner):
        self.nav_planner = nav_planner
        self.bipedal_planner = bipedal_planner
        
        # Navigation constraints that affect bipedal planning
        self.nav_constraints = {
            'min_turn_radius': 0.2,  # meters
            'max_slope': np.radians(20),  # radians
            'min_corridor_width': 0.8,  # meters
            'max_step_height': 0.15  # meters (for stairs)
        }
    
    def plan_navigation_with_bipedal_constraints(self, start_pos, goal_pos, environment_map):
        """
        Plan navigation path considering bipedal robot constraints
        """
        # Modify navigation planning to consider humanoid-specific constraints
        constrained_map = self.apply_bipedal_constraints_to_map(environment_map)
        
        # Plan path using modified map
        nav_path = self.nav_planner.plan_path(start_pos, goal_pos, constrained_map)
        
        # Convert navigation path to bipedal-compatible waypoints
        bipedal_waypoints = self.convert_nav_to_bipedal_waypoints(nav_path)
        
        # Generate bipedal walking trajectory
        bipedal_trajectory = self.bipedal_planner.generate_walking_trajectory(
            start_pos, goal_pos
        )
        
        return {
            'navigation_path': nav_path,
            'bipedal_waypoints': bipedal_waypoints,
            'bipedal_trajectory': bipedal_trajectory,
            'feasible': self.is_trajectory_feasible(bipedal_trajectory)
        }
    
    def apply_bipedal_constraints_to_map(self, environment_map):
        """
        Modify environment map to account for humanoid constraints
        """
        # Increase cost of steep slopes
        # Mark narrow passages as impassable if too narrow for humanoid width
        # Mark tall obstacles as impassable if too low for humanoid height
        
        # For this example, return the map unchanged
        # In a real implementation, this would modify the costmap
        return environment_map
    
    def convert_nav_to_bipedal_waypoints(self, nav_path):
        """
        Convert navigation path to waypoints suitable for bipedal locomotion
        """
        # Navigation paths typically have waypoints every meter or so
        # For bipedal locomotion, we might need more frequent waypoints
        # or we might follow the path with dynamic walking
        
        bipedal_waypoints = []
        
        # Convert each navigation waypoint to bipedal-friendly approach
        for nav_waypoint in nav_path:
            # Calculate approach direction for bipedal robot
            approach_info = self.calculate_approach_for_waypoint(nav_waypoint)
            bipedal_waypoints.append(approach_info)
        
        return bipedal_waypoints
    
    def calculate_approach_for_waypoint(self, waypoint):
        """
        Calculate approach for bipedal robot to reach a waypoint
        """
        # For bipedal robots, the approach might include:
        # - Proper foot placement sequence
        # - Balance preparation before turning
        # - Step-by-step navigation
        
        approach = {
            'position': waypoint,
            'approach_sequence': ['prepare_balance', 'approach', 'adjust_posture'],
            'safety_margin': 0.1  # Additional margin for bipedal stability
        }
        
        return approach
    
    def is_trajectory_feasible(self, bipedal_trajectory):
        """
        Check if the generated bipedal trajectory is feasible
        """
        # Check if all steps are within physical constraints
        for step in bipedal_trajectory['step_positions']:
            # Check if step is too far from previous step
            # Check if surface is walkable
            # Check if obstacles are avoided
            pass
        
        # For this example, assume trajectory is feasible
        return True


def main():
    """
    Example of navigation-bipedal integration
    """
    # Initialize planners (would be actual planner instances in real system)
    class DummyNavPlanner:
        def plan_path(self, start, goal, env_map):
            return [start, goal]  # Simple direct path
    
    class DummyBipedalPlanner:
        def generate_walking_trajectory(self, start, goal):
            return {
                'step_positions': [start, goal],
                'step_times': [0, 1.0],
                'num_steps': 2
            }
    
    nav_planner = DummyNavPlanner()
    bipedal_planner = DummyBipedalPlanner()
    
    integrator = NavigationBipedalIntegrator(nav_planner, bipedal_planner)
    
    # Plan navigation for humanoid
    result = integrator.plan_navigation_with_bipedal_constraints(
        start_pos=[0.0, 0.0],
        goal_pos=[2.0, 1.0],
        environment_map={}  # Placeholder
    )
    
    print(f"Integrated navigation result: {result}")


if __name__ == '__main__':
    main()
```

## Conclusion

Bipedal planning is a critical component of humanoid robotics and Physical AI. This chapter covered:

1. **Fundamental concepts** of bipedal locomotion including balance and stability
2. **Mathematical models** like the Linear Inverted Pendulum Model (LIPM) for walking analysis
3. **Advanced planning techniques** including preview control and state machines
4. **Terrain adaptation** for walking on various surface types
5. **Integration with navigation** systems for goal-directed locomotion  
6. **Quality assurance** for maintaining stable walking behavior

The combination of these techniques enables humanoid robots to walk stably and efficiently in various environments while maintaining balance and avoiding falls. Proper implementation of bipedal planning is essential for Physical AI systems that need to navigate human environments effectively.

For Physical AI applications, the integration of perception, navigation, and bipedal control creates truly capable humanoid robots that can interact with the physical world in meaningful ways. As we move forward in this book, we'll see how these locomotion capabilities integrate with perception and manipulation to create complete Physical AI systems.