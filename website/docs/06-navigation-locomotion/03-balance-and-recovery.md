---
sidebar_position: 3
title: 'Balance & Recovery'
---

# Balance and Recovery: Maintaining Stability in Physical AI Systems

## Introduction to Humanoid Balance

Maintaining balance is one of the most critical challenges in Physical AI and humanoid robotics. Unlike wheeled or tracked robots that maintain stability through continuous contact with the ground, humanoid robots must constantly adjust their center of mass (CoM) and foot placement to remain stable during both static and dynamic behaviors.

This chapter explores the theoretical foundations, practical implementations, and advanced techniques for humanoid balance control and recovery from disturbances in Physical AI systems.

## Balance Fundamentals

### Center of Mass and Stability

The center of mass (CoM) represents the average location of an object's mass. For humanoid robots, keeping the CoM within the support polygon defined by the feet is essential for static stability:

```python
#!/usr/bin/env python3
"""
Balance and recovery system for humanoid robots
"""
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Point, Vector3, Pose
from sensor_msgs.msg import Imu, JointState
from std_msgs.msg import Float32
from builtin_interfaces.msg import Duration
import numpy as np
from scipy.spatial import ConvexHull


class HumanoidBalanceController(Node):
    """
    Advanced balance controller for humanoid robots
    """
    def __init__(self):
        super().__init__('humanoid_balance_controller')
        
        # Subscriptions
        self.imu_sub = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10
        )
        
        self.joint_state_sub = self.create_subscription(
            JointState,
            '/joint_states',
            self.joint_state_callback,
            10
        )
        
        self.center_of_pressure_sub = self.create_subscription(
            Point,
            '/cop',
            self.cop_callback,
            10
        )
        
        # Publishers
        self.balance_command_pub = self.create_publisher(Pose, '/balance_command', 10)
        self.com_publisher = self.create_publisher(Point, '/center_of_mass', 10)
        self.zmp_publisher = self.create_publisher(Point, '/zero_moment_point', 10)
        self.balance_status_pub = self.create_publisher(Float32, '/balance_stability', 10)
        
        # Balance control parameters
        self.com_height = 0.8  # meters (typical for humanoid)
        self.leg_length = 0.6  # meters (leg length)
        self.gravity = 9.81    # m/s^2
        
        # Balance recovery parameters
        self.stability_threshold = 0.05  # meters from support polygon center
        self.recovery_threshold = 0.1    # meters from support polygon edge
        self.fall_threshold = 0.3        # meters from support polygon edge
        
        # State estimation
        self.current_com = np.zeros(3)  # [x, y, z]
        self.current_com_velocity = np.zeros(3)
        self.current_com_acceleration = np.zeros(3)
        self.foot_positions = {'left': np.zeros(3), 'right': np.zeros(3)}
        self.support_polygon = np.zeros((4, 2))  # Convex hull points
        self.omega = np.sqrt(self.gravity / self.com_height)  # Natural frequency
        
        # Previous values for velocity and acceleration estimation
        self.prev_com = np.zeros(3)
        self.prev_time = None
        
        # Balance control timer
        self.balance_timer = self.create_timer(0.01, self.balance_control_loop)  # 100Hz
        
        self.get_logger().info("Humanoid Balance Controller Initialized")

    def imu_callback(self, msg):
        """
        Update robot orientation and acceleration from IMU
        """
        # Extract orientation (needed for balance calculations)
        orientation = msg.orientation
        self.orientation_quat = np.array([
            orientation.x, 
            orientation.y, 
            orientation.z, 
            orientation.w
        ])
        
        # Extract linear acceleration
        acceleration = msg.linear_acceleration
        self.linear_acc = np.array([
            acceleration.x,
            acceleration.y,
            acceleration.z
        ])

    def joint_state_callback(self, msg):
        """
        Update robot state from joint measurements
        """
        # Update CoM based on current joint positions
        try:
            self.current_com = self.calculate_com_from_joints(msg)
            
            # Update foot positions
            self.foot_positions = self.calculate_foot_positions(msg)
            
            # Update support polygon
            self.support_polygon = self.calculate_support_polygon(self.foot_positions)
            
            # Estimate CoM velocity and acceleration if we have timing
            if self.prev_time is not None:
                dt = msg.header.stamp.sec - self.prev_time.sec + (msg.header.stamp.nanosec - self.prev_time.nanosec) / 1e9
                if dt > 0:
                    self.current_com_velocity = (self.current_com - self.prev_com) / dt
                    # For acceleration, we'd need previous velocity - simplifying for now
                    # self.current_com_acceleration = (self.current_com_velocity - self.prev_com_velocity) / dt
            
            self.prev_com = self.current_com.copy()
            self.prev_time = msg.header.stamp
            
        except Exception as e:
            self.get_logger().error(f"Error processing joint states: {str(e)}")

    def calculate_com_from_joints(self, joint_state):
        """
        Calculate center of mass from joint positions and link masses
        (This is a simplified version - real implementation would use kinematic chain)
        """
        # In a real system, this would calculate CoM using forward kinematics and link masses
        # For this example, we'll compute a simplified CoM based on joint positions
        # This would typically use a kinematic tree and mass properties from URDF
        
        # Placeholder calculation - would use forward kinematics and mass centroids
        com_x = (joint_state.position[0] + joint_state.position[1]) / 50  # Simplified
        com_y = (joint_state.position[2] + joint_state.position[3]) / 50  # Simplified
        com_z = self.com_height  # Assume CoM is at fixed height initially
        
        return np.array([com_x, com_y, com_z])

    def calculate_foot_positions(self, joint_state):
        """
        Calculate foot positions from joint states
        """
        # This would use forward kinematics to calculate exact foot positions
        # For now, using placeholder values based on joint angles
        left_foot_x = joint_state.position[4] / 100  # Simplified
        left_foot_y = 0.1  # Fixed y offset for left foot
        left_foot_z = 0.0  # Ground level
        
        right_foot_x = joint_state.position[5] / 100  # Simplified
        right_foot_y = -0.1  # Fixed y offset for right foot
        right_foot_z = 0.0  # Ground level
        
        return {
            'left': np.array([left_foot_x, left_foot_y, left_foot_z]),
            'right': np.array([right_foot_x, right_foot_y, right_foot_z])
        }

    def calculate_support_polygon(self, foot_positions):
        """
        Calculate support polygon from foot positions
        """
        # Create support polygon as convex hull of feet positions
        points = [
            [foot_positions['left'][0], foot_positions['left'][1]],
            [foot_positions['right'][0], foot_positions['right'][1]]
        ]
        
        # For a more complex support polygon, we'd include foot size
        # For now, we'll create a simple polygon encompassing the feet
        if len(points) >= 2:
            # Extend the support polygon to be wider than just the feet
            center_x = (points[0][0] + points[1][0]) / 2
            center_y = (points[0][1] + points[1][1]) / 2
            
            # Create polygon based on feet positions (approximated)
            dx = points[1][0] - points[0][0]
            dy = points[1][1] - points[0][1]
            dist = np.sqrt(dx*dx + dy*dy)
            
            # Create rectangular support polygon between feet
            points = [
                [center_x - 0.15, center_y - 0.3],  # Width: 30cm, Length: 60cm
                [center_x - 0.15, center_y + 0.3],
                [center_x + 0.15, center_y + 0.3],
                [center_x + 0.15, center_y - 0.3]
            ]
        else:
            # Single support polygon (if only one foot is down)
            points = [
                [foot_positions['left'][0] - 0.1, foot_positions['left'][1] - 0.1],
                [foot_positions['left'][0] - 0.1, foot_positions['left'][1] + 0.1],
                [foot_positions['left'][0] + 0.1, foot_positions['left'][1] + 0.1],
                [foot_positions['left'][0] + 0.1, foot_positions['left'][1] - 0.1]
            ]
        
        return np.array(points)

    def cop_callback(self, msg):
        """
        Handle center of pressure measurements if available
        """
        # For now, we'll just store this as additional information
        # Real systems would use CoP for balance control
        self.cop = np.array([msg.x, msg.y, msg.z])

    def balance_control_loop(self):
        """
        Main balance control loop
        """
        if self.current_com is not None and len(self.support_polygon) > 0:
            # Calculate stability metrics
            stability_metrics = self.calculate_stability_metrics()
            
            # Determine current stability state
            stability = self.assess_balance_stability(stability_metrics)
            
            # Generate balance commands based on stability
            balance_command = self.generate_balance_command(stability)
            
            # Check for recovery needs
            recovery_needed = self.check_recovery_conditions(stability)
            
            if recovery_needed:
                self.initiate_balance_recovery()
            else:
                # Apply balance commands
                self.balance_command_publisher.publish(balance_command)
            
            # Publish CoM for visualization
            com_msg = Point()
            com_msg.x = float(self.current_com[0])
            com_msg.y = float(self.current_com[1])
            com_msg.z = float(self.current_com[2])
            self.com_publisher.publish(com_msg)
            
            # Publish stability score
            stability_msg = Float32()
            stability_msg.data = float(stability)
            self.balance_status_publisher.publish(stability_msg)
            
            self.get_logger().debug(f"Balance stability: {stability:.3f}")

    def calculate_stability_metrics(self):
        """
        Calculate various stability metrics
        """
        # Calculate ZMP (Zero Moment Point) - approximation
        com_proj = self.current_com[:2]  # X,Y projection of CoM
        
        # Calculate distance from CoM to support polygon boundary
        try:
            hull = ConvexHull(self.support_polygon)
            
            # Calculate distance from CoM to polygon edges
            distances = []
            for simplex in hull.simplices:
                p1 = self.support_polygon[simplex[0]]
                p2 = self.support_polygon[simplex[1]]
                
                # Distance from point to line segment
                dist = self.dist_point_to_line_segment(com_proj, p1, p2)
                distances.append(dist)
            
            stability_distance = min(distances) if distances else 0.0
        except:
            # If convex hull fails, use distance to closest foot
            left_dist = np.linalg.norm(com_proj - self.foot_positions['left'][:2])
            right_dist = np.linalg.norm(com_proj - self.foot_positions['right'][:2])
            stability_distance = min(left_dist, right_dist)
        
        # Calculate CoM velocity magnitude
        com_vel_magnitude = np.linalg.norm(self.current_com_velocity)
        
        return {
            'com_to_support_distance': stability_distance,
            'com_velocity': com_vel_magnitude,
            'support_area': self.calculate_support_area()
        }

    def dist_point_to_line_segment(self, point, line_start, line_end):
        """
        Calculate distance from point to line segment
        """
        # Vector from line start to point
        vec_line = line_end - line_start
        vec_point = point - line_start
        
        # Calculate projection
        line_len_sq = np.dot(vec_line, vec_line)
        if line_len_sq == 0:
            return np.linalg.norm(vec_point)  # Line is actually a point
            
        t = max(0, min(1, np.dot(vec_point, vec_line) / line_len_sq))
        
        projection = line_start + t * vec_line
        return np.linalg.norm(point - projection)

    def calculate_support_area(self):
        """
        Calculate support polygon area
        """
        try:
            hull = ConvexHull(self.support_polygon)
            return hull.volume  # For 2D, this gives area
        except:
            # If all points are collinear or hull fails
            # return distance between feet as proxy for stability area
            feet_dist = np.linalg.norm(
                self.foot_positions['left'][:2] - self.foot_positions['right'][:2]
            )
            return feet_dist * 0.1  # Width * distance between feet

    def assess_balance_stability(self, metrics):
        """
        Assess balance stability and return a score (0-1 scale)
        """
        # Calculate stability score based on distance from support boundary
        distance_score = max(0, (self.recovery_threshold - metrics['com_to_support_distance']) / self.recovery_threshold)
        
        # Calculate velocity stability (lower velocity = more stable)
        vel_score = max(0, 1.0 - (metrics['com_velocity'] / 0.5))  # Normalize against 0.5 m/s max
        
        # Calculate support area stability (larger area = more stable)
        min_support_area = 0.05  # 20cm x 25cm minimum
        area_score = min(1.0, metrics['support_area'] / min_support_area)
        
        # Weighted combination
        stability = 0.5 * distance_score + 0.3 * vel_score + 0.2 * area_score
        
        return min(1.0, stability)  # Clamp to [0,1]

    def generate_balance_command(self, stability):
        """
        Generate balance control commands based on current stability
        """
        command = Pose()
        
        if stability > 0.7:
            # Stable - maintain current posture
            command.position = Point(x=0.0, y=0.0, z=0.0)
            command.orientation.w = 1.0
        elif stability > 0.3:
            # Moderately stable - adjust for better balance
            com_offset = self.calculate_com_adjustment()
            command.position = Point(
                x=float(com_offset[0]),
                y=float(com_offset[1]),
                z=float(com_offset[2])
            )
            command.orientation.w = 1.0
        else:
            # Unstable - initiate recovery
            command = self.prepare_for_recovery()
        
        return command

    def calculate_com_adjustment(self):
        """
        Calculate CoM adjustment needed for balance
        """
        # Calculate desired CoM position to maintain balance
        com_xy = self.current_com[:2]
        
        # Find closest point in support polygon to current CoM
        closest_point = self.find_closest_point_in_polygon(com_xy, self.support_polygon)
        
        # Calculate adjustment vector (move CoM back toward stable point)
        adjustment = 0.1 * (closest_point - com_xy)  # 10% of the required adjustment
        
        # Maintain desired CoM height
        adjustment = np.append(adjustment, [0])  # Add Z component (0 for now)
        
        return adjustment

    def find_closest_point_in_polygon(self, point, polygon):
        """
        Find the closest point inside the polygon to a given point
        """
        # This is a simplified implementation
        # Real implementation would be more sophisticated
        
        # Calculate centroid of polygon as a stable point
        centroid = np.mean(polygon, axis=0)
        
        # If point is inside polygon, return the point itself
        if self.point_in_polygon(point, polygon):
            return point
        
        # Otherwise, find closest point on boundary
        closest_dist = float('inf')
        closest_point = centroid  # Use centroid as fallback
        
        for i in range(len(polygon)):
            p1 = polygon[i]
            p2 = polygon[(i + 1) % len(polygon)]
            
            proj_point = self.project_point_to_line_segment(point, p1, p2)
            dist = np.linalg.norm(point - proj_point)
            
            if dist < closest_dist:
                closest_dist = dist
                closest_point = proj_point
        
        return closest_point

    def point_in_polygon(self, point, polygon):
        """
        Check if point is inside polygon using ray casting
        """
        x, y = point
        n = len(polygon)
        inside = False
        
        p1x, p1y = polygon[0]
        for i in range(1, n + 1):
            p2x, p2y = polygon[i % n]
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
        
        return inside

    def project_point_to_line_segment(self, point, line_start, line_end):
        """
        Project point onto line segment
        """
        vec_line = line_end - line_start
        vec_point = point - line_start
        
        line_len_sq = np.dot(vec_line, vec_line)
        if line_len_sq == 0:
            return line_start  # Line segment is actually a point
            
        t = max(0, min(1, np.dot(vec_point, vec_line) / line_len_sq))
        
        return line_start + t * vec_line

    def check_recovery_conditions(self, stability):
        """
        Check if balance recovery is needed
        """
        metrics = self.calculate_stability_metrics()
        
        # Recovery conditions:
        # 1. CoM too far from support polygon
        # 2. High velocity 
        # 3. Low support area
        
        return (
            metrics['com_to_support_distance'] > self.recovery_threshold or
            metrics['com_velocity'] > 0.8 or  # High velocity threshold
            metrics['support_area'] < 0.02    # Low support area threshold
        )

    def initiate_balance_recovery(self):
        """
        Initiate balance recovery procedures
        """
        self.get_logger().warn("Balance recovery initiated!")
        
        # Emergency stabilization actions:
        # 1. Reduce step size if walking
        # 2. Prepare for protective reactions 
        # 3. Alert higher-level systems
        # 4. Potentially stop movement
        
        # For now, we'll just try to move CoM back to safe zone
        recovery_command = self.generate_recovery_command()
        self.balance_command_publisher.publish(recovery_command)

    def generate_recovery_command(self):
        """
        Generate specific recovery commands
        """
        # Calculate safe CoM position within support polygon
        com_xy = self.current_com[:2]
        safe_point = self.find_closest_point_in_polygon(com_xy, self.support_polygon)
        
        # Create adjustment command
        recovery_pose = Pose()
        recovery_pose.position.x = float(safe_point[0])
        recovery_pose.position.y = float(safe_point[1])
        recovery_pose.position.z = float(self.current_com[2])  # Maintain height
        
        # Suggest protective posture
        recovery_pose.orientation.w = 0.9
        recovery_pose.orientation.z = 0.1  # Slight hip flexion for stability
        
        return recovery_pose

    def prepare_for_recovery(self):
        """
        Prepare robot for potential recovery
        """
        # This would send commands to prepare for recovery actions:
        # - Adjust joint stiffness
        # - Prepare protective reflexes (if available)
        # - Ready for step adjustment
        # - Prepare arms for protection if needed
        
        protective_command = Pose()
        protective_command.position.x = float(self.current_com[0])  # Don't move horizontally aggressively
        protective_command.position.y = float(self.current_com[1])
        protective_command.position.z = float(self.current_com[2] + 0.05)  # Slightly raise CoM for stability
        
        # Prepare for protective arm movements
        protective_command.orientation.x = 0.1  # Slight forward lean
        protective_command.orientation.y = 0.0
        protective_command.orientation.z = 0.0
        protective_command.orientation.w = 0.995
        
        return protective_command


def main(args=None):
    rclpy.init(args=args)
    node = HumanoidBalanceController()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info("Balance controller stopped")
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Advanced Balance Control Techniques

### Linear Inverted Pendulum Mode (LIPM) for Balance

The Linear Inverted Pendulum Model is a widely used approach for humanoid balance control:

```python
class LIPMBalanceController:
    """
    Linear Inverted Pendulum Model for balance control
    """
    def __init__(self, com_height=0.8, gravity=9.81):
        self.com_height = com_height
        self.gravity = gravity
        self.omega = np.sqrt(gravity / com_height)
        
        # Desired CoM trajectory parameters
        self.desired_com_x = 0.0
        self.desired_com_y = 0.0
        
    def compute_desired_zmp(self, current_com_pos, current_com_vel):
        """
        Compute desired ZMP from current CoM state using LIPM
        """
        # ZMP = CoM - (CoM_velocity / omega)
        desired_zmp_x = current_com_pos[0] - (current_com_vel[0] / self.omega)
        desired_zmp_y = current_com_pos[1] - (current_com_vel[1] / self.omega)
        
        return [desired_zmp_x, desired_zmp_y]
    
    def compute_capture_point(self, current_com_pos, current_com_vel):
        """
        Compute capture point - where to step to come to complete stop
        """
        capture_point_x = current_com_pos[0] + (current_com_vel[0] / self.omega)
        capture_point_y = current_com_pos[1] + (current_com_vel[1] / self.omega)
        
        return [capture_point_x, capture_point_y]
    
    def plan_step_for_recovery(self, current_com, current_vel, support_foot_pos):
        """
        Plan stepping movement to recover balance using capture point
        """
        capture_point = self.compute_capture_point(current_com, current_vel)
        
        # If capture point is outside support polygon, plan a step there
        step_needed = not self.is_inside_support_polygon(
            capture_point, support_foot_pos
        )
        
        if step_needed:
            return {
                'step_required': True,
                'step_position': capture_point,
                'step_timing': self.estimate_step_timing()
            }
        else:
            return {
                'step_required': False,
                'step_position': None,
                'step_timing': None
            }
    
    def adjust_com_trajectory(self, target_zmp, current_com, current_com_vel, dt):
        """
        Adjust CoM trajectory to achieve target ZMP using LIPM
        """
        # Update CoM state based on ZMP reference
        # For LIPM: com_ddot = omega^2 * (com - zmp)
        
        target_com_x = target_zmp[0] + (current_com_vel[0] / self.omega)
        target_com_y = target_zmp[1] + (current_com_vel[1] / self.omega)
        
        # Smooth transition to target CoM position
        alpha = 0.1  # Smoothing factor
        corrected_com_x = (1 - alpha) * current_com[0] + alpha * target_com_x
        corrected_com_y = (1 - alpha) * current_com[1] + alpha * target_com_y
        
        return [corrected_com_x, corrected_com_y, current_com[2]]  # Keep Z constant
```

### Model Predictive Control (MPC) for Balance

Model Predictive Control offers more sophisticated balance control by predicting future states:

```python
#!/usr/bin/env python3
"""
Model Predictive Control for humanoid balance
"""
import numpy as np
from scipy.optimize import minimize


class MPCBalanceController:
    """
    Model Predictive Controller for humanoid balance
    """
    def __init__(self, horizon=20, dt=0.05, com_height=0.8):
        self.horizon = horizon  # Prediction horizon (20 steps)
        self.dt = dt           # Time step (50ms)
        self.com_height = com_height
        self.gravity = 9.81
        self.omega = np.sqrt(self.gravity / com_height)
        
        # Cost function weights
        self.Q = np.diag([1.0, 1.0, 0.1])  # State cost (x, y, theta)
        self.R = np.diag([0.1, 0.1])       # Control cost (forces)
        self.Q_terminal = np.diag([10.0, 10.0, 1.0])  # Terminal cost
        
    def predict_motion_model(self, state, control, dt):
        """
        Linear inverted pendulum motion model
        state = [com_x, com_y, com_z, com_dx, com_dy, com_dz]
        control = [zmp_x, zmp_y] (Zero Moment Point)
        """
        # LIPM dynamics matrix
        A = np.array([
            [1, 0, 0, dt, 0, 0],
            [0, 1, 0, 0, dt, 0],
            [0, 0, 1, 0, 0, dt],
            [self.omega**2*dt, 0, 0, 1, 0, 0],
            [0, self.omega**2*dt, 0, 0, 1, 0],
            [0, 0, 0, 0, 0, 1]  # Simplified for z direction
        ])
        
        B = np.array([
            [-self.omega**2*dt**2, 0],
            [0, -self.omega**2*dt**2],
            [0, 0],
            [-self.omega**2*dt, 0],
            [0, -self.omega**2*dt],
            [0, 0]
        ])
        
        # Apply motion model
        next_state = A @ state + B @ control
        return next_state
    
    def solve_mpc_problem(self, current_state, reference_trajectory):
        """
        Solve MPC optimization problem
        """
        # Define the optimization problem
        def cost_function(controls_flat):
            """
            Total cost function for the MPC problem
            """
            total_cost = 0.0
            state = current_state.copy()
            
            # Reshape controls
            controls = controls_flat.reshape((self.horizon, 2))
            
            for k in range(self.horizon):
                # Predict next state
                state = self.predict_motion_model(state, controls[k], self.dt)
                
                # State error
                state_error = state - reference_trajectory[k]
                total_cost += state_error.T @ self.Q @ state_error
                
                # Control effort
                control_effort = controls[k].T @ self.R @ controls[k]
                total_cost += control_effort
            
            # Terminal cost
            state_error_final = state - reference_trajectory[self.horizon]
            total_cost += state_error_final.T @ self.Q_terminal @ state_error_final
            
            return total_cost
        
        # Initial guess for controls
        initial_controls = np.zeros(self.horizon * 2)
        
        # Optimize
        result = minimize(
            cost_function,
            initial_controls,
            method='SLSQP',
            options={'maxiter': 100}
        )
        
        if result.success:
            optimal_controls = result.x.reshape((self.horizon, 2))
            return optimal_controls[0]  # Return first control (apply now)
        else:
            # Return zero control if optimization fails
            return np.zeros(2)

    def run_mpc_balance_control(self, current_com, current_com_vel, desired_trajectory):
        """
        Run MPC-based balance control
        """
        # Create state vector [com_x, com_y, com_z, velocity_x, velocity_y, velocity_z]
        current_state = np.array([
            current_com[0],
            current_com[1], 
            current_com[2],
            current_com_vel[0],
            current_com_vel[1],
            current_com_vel[2]
        ])
        
        # Generate reference trajectory (this would be computed based on desired behavior)
        reference_trajectory = self.generate_reference_trajectory(
            current_state, desired_trajectory
        )
        
        # Solve MPC problem
        optimal_zmp = self.solve_mpc_problem(current_state, reference_trajectory)
        
        return optimal_zmp
    
    def generate_reference_trajectory(self, current_state, desired_trajectory):
        """
        Generate reference trajectory for MPC
        """
        # For this example, generate a simple trajectory
        ref_traj = np.zeros((self.horizon + 1, 6))  # +1 for terminal state
        
        # Start with current state
        ref_traj[0] = current_state
        
        # Generate linear interpolation toward desired state
        for k in range(1, self.horizon + 1):
            interp_factor = min(1.0, k / self.horizon)
            ref_traj[k] = (1 - interp_factor) * current_state + interp_factor * desired_trajectory
        
        return ref_traj
```

## Reactive Balance Controllers

### Ankle Strategy Controller

For small disturbances, humanoid robots often use the ankle strategy:

```python
class AnkleStrategyController:
    """
    Ankle strategy balance controller for small disturbances
    """
    def __init__(self, max_tilt_angle=0.1):  # 5.7 degrees max
        self.max_tilt_angle = max_tilt_angle
        self.ankle_stiffness = 2000.0  # N*m/rad
        self.ankle_damping = 100.0     # N*m*s/rad
        
    def ankle_strategy_control(self, com_error, com_velocity_error):
        """
        Use ankle torques to correct small CoM deviations
        """
        # Calculate required ankle angle to correct CoM position
        # For small angles: com_error ≈ ankle_angle * com_height
        
        required_ankle_roll = com_error[1] / self.com_height
        required_ankle_pitch = com_error[0] / self.com_height
        
        # Limit ankle angles to prevent over-correction
        required_ankle_roll = np.clip(required_ankle_roll, -self.max_tilt_angle, self.max_tilt_angle)
        required_ankle_pitch = np.clip(required_ankle_pitch, -self.max_tilt_angle, self.max_tilt_angle)
        
        # Calculate control torques using PD control
        roll_torque = -self.ankle_stiffness * required_ankle_roll - self.ankle_damping * com_velocity_error[1]
        pitch_torque = -self.ankle_stiffness * required_ankle_pitch - self.ankle_damping * com_velocity_error[0]
        
        return [roll_torque, pitch_torque]
```

### Hip Strategy Controller

For larger disturbances, a hip strategy may be more appropriate:

```python
class HipStrategyController:
    """
    Hip strategy controller for medium disturbances
    """
    def __init__(self, com_height=0.8):
        self.com_height = com_height  # Height of CoM above ankle
        self.hip_stiffness = 5000.0   # Higher stiffness for hip
        self.hip_damping = 200.0      # Damping for hip
        
    def hip_strategy_control(self, com_error, com_velocity_error):
        """
        Use hip torques to correct larger CoM deviations
        """
        # Hip strategy moves the CoM by flexing/tilting at the hip
        # This creates a larger corrective moment
        
        # Calculate required hip angle changes
        hip_roll_angle = com_error[1] / self.com_height / 2  # Divided by 2 for gentler correction
        hip_pitch_angle = com_error[0] / self.com_height / 2
        
        # Limit hip angles to prevent over-correction
        max_hip_angle = 0.3  # 17 degrees
        hip_roll_angle = np.clip(hip_roll_angle, -max_hip_angle, max_hip_angle)
        hip_pitch_angle = np.clip(hip_pitch_angle, -max_hip_angle, max_hip_angle)
        
        # Calculate control torques
        roll_torque = -self.hip_stiffness * hip_roll_angle - self.hip_damping * com_velocity_error[1]
        pitch_torque = -self.hip_stiffness * hip_pitch_angle - self.hip_damping * com_velocity_error[0]
        
        return [roll_torque, pitch_torque]
```

## Protective Reaction Strategies

### Fall Preparation and Recovery

For severe disturbances, the robot needs to initiate protective reactions:

```python
class ProtectiveReactionController:
    """
    Protective reaction controller for severe balance losses
    """
    def __init__(self):
        self.fall_threshold = 0.2  # CoM outside this distance from support
        self.arm_swing_threshold = 0.1  # Use arm swings for moderate recovery
        self.step_threshold = 0.15  # Step if needed beyond this
        
    def evaluate_fall_risk(self, com_position, support_polygon):
        """
        Evaluate fall risk and select appropriate protective strategy
        """
        # Calculate distance from CoM to support polygon boundary
        com_xy = com_position[:2]
        distance_to_boundary = self.min_distance_to_polygon_boundary(com_xy, support_polygon)
        
        if distance_to_boundary < self.fall_threshold:
            # High fall risk - prepare for protective actions
            if distance_to_boundary < 0.05:
                strategy = "prepare_fall_protection"
            elif distance_to_boundary < 0.1:
                strategy = "initiate_recovery"
            else:
                strategy = "increase_ankle_effort"
        else:
            strategy = "normal_balance_control"
        
        return strategy, distance_to_boundary
    
    def initiate_protective_actions(self, strategy):
        """
        Initiate appropriate protective actions based on strategy
        """
        if strategy == "prepare_fall_protection":
            # Prepare arms and legs for impact
            protective_commands = self.prepare_for_impact()
        elif strategy == "initiate_recovery":
            # Use aggressive recovery actions
            protective_commands = self.aggressive_recovery()
        elif strategy == "increase_ankle_effort":
            # Increase ankle stiffness for better control
            protective_commands = self.increase_ankle_control_effort()
        else:
            protective_commands = self.normal_balance_commands()
        
        return protective_commands
    
    def prepare_for_impact(self):
        """
        Prepare robot for potential fall impact
        """
        # Commands to reduce injury risk in case of fall
        commands = {
            'arm_positions': 'protective_position',  # Arms move to protect head/chest
            'joint_stiffness': 'reduce',  # Reduce joint stiffness to absorb impact
            'body_posture': 'crouched',   # Crouch to lower CoM
            'head_position': 'protected'  # Turn head to avoid face impact
        }
        return commands
    
    def aggressive_recovery(self):
        """
        Initiate aggressive recovery maneuvers
        """
        # High-effort recovery including:
        # - Maximum ankle control effort
        # - Possible arm swinging
        # - Anticipated stepping
        commands = {
            'ankle_torques': 'maximum_effort',
            'arm_swinging': 'engage',
            'prepare_step': True,
            'increase_joint_stiffness': True
        }
        return commands
    
    def increase_ankle_control_effort(self):
        """
        Increase ankle control effort to regain balance
        """
        commands = {
            'ankle_torques': 'increased_effort',
            'ankle_stiffness': 'medium_increase',
            'monitor_recovery': True
        }
        return commands
    
    def normal_balance_commands(self):
        """
        Standard balance control commands
        """
        return {
            'strategy': 'normal',
            'control_effort': 'standard'
        }

    def min_distance_to_polygon_boundary(self, point, polygon):
        """
        Calculate minimum distance from point to polygon boundary
        """
        min_dist = float('inf')
        
        for i in range(len(polygon)):
            p1 = polygon[i]
            p2 = polygon[(i + 1) % len(polygon)]
            
            dist = self.dist_point_to_line_segment(point, p1, p2)
            min_dist = min(min_dist, dist)
        
        return min_dist


def min_distance_to_line_segment(self, point, line_start, line_end):
    """
    Calculate minimum distance from point to line segment
    """
    vec_line = line_end - line_start
    vec_point = point - line_start
    
    line_len_sq = np.dot(vec_line, vec_line)
    if line_len_sq == 0:
        return np.linalg.norm(vec_point)
        
    t = max(0, min(1, np.dot(vec_point, vec_line) / line_len_sq))
    
    projection = line_start + t * vec_line
    return np.linalg.norm(point - projection)
```

## Integration with Physical AI Systems

### Balance Control in Navigation Context

When navigating, balance must be maintained while achieving locomotion goals:

```python
#!/usr/bin/env python3
"""
Balance control integrated with navigation for Physical AI
"""
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist, PoseStamped
from nav_msgs.msg import Path
import numpy as np


class NavigationBalanceIntegrator(Node):
    """
    Integrates balance control with navigation for humanoid robots
    """
    def __init__(self):
        super().__init__('navigation_balance_integrator')
        
        # Navigation subscribers
        self.cmd_vel_sub = self.create_subscription(
            Twist,
            '/cmd_vel',
            self.cmd_vel_callback,
            10
        )
        
        self.path_sub = self.create_subscription(
            Path,
            '/plan',
            self.path_callback,
            10
        )
        
        # Balance control interface
        self.balance_command_pub = self.create_publisher(Pose, '/balance_command', 10)
        
        # Navigation-specific balance parameters
        self.balance_weights = {
            'stability': 0.6,      # Higher weight when stationary
            'navigation': 0.4,     # Navigation progress weight
            'obstacle_avoidance': 0.5  # Avoid obstacles while balancing
        }
        
        # Adaptive parameters for different navigation states
        self.state = 'standing'  # standing, walking, turning, stopping
        self.nav_velocity_threshold = 0.1  # Below this is considered "stopped"
        
        self.get_logger().info("Navigation-Balance Integration Node Started")

    def cmd_vel_callback(self, msg):
        """
        Handle navigation velocity commands while maintaining balance
        """
        linear_speed = np.sqrt(msg.linear.x**2 + msg.linear.y**2)
        angular_speed = abs(msg.angular.z)
        
        # Determine navigation state based on command
        if linear_speed < self.nav_velocity_threshold and angular_speed < 0.1:
            self.state = 'stopping' if self.state == 'walking' else 'standing'
        elif linear_speed > 0.1 or angular_speed > 0.1:
            if self.state in ['standing', 'stopping']:
                self.state = 'starting'
            else:
                self.state = 'walking'
        
        # Generate balance commands that consider navigation intent
        balance_cmd = self.generate_navigation_aware_balance(msg)
        self.balance_command_publisher.publish(balance_cmd)

    def generate_navigation_aware_balance(self, cmd_vel):
        """
        Generate balance commands that consider navigation intent
        """
        # Basic balance command based on current state
        balance_cmd = Pose()
        
        if self.state == 'standing':
            # Focus on static balance
            balance_cmd.position.x = 0.0
            balance_cmd.position.y = 0.0
            balance_cmd.position.z = self.com_height
            
        elif self.state == 'walking':
            # Balance during walking with anticipation of movement
            # Adjust CoM position to support forward walking motion
            forward_offset = 0.05  # Slightly forward for walking stability
            balance_cmd.position.x = forward_offset
            balance_cmd.position.y = 0.0  # Maintain center in lateral direction
            balance_cmd.position.z = self.com_height
            
        elif self.state == 'turning':
            # Adjust for turning motion to maintain balance
            # Shift CoM toward inside of turn
            turn_radius = cmd_vel.angular.z / (cmd_vel.linear.x + 1e-6) if cmd_vel.linear.x != 0 else 0
            lateral_offset = -0.02 * turn_radius  # Proportional to turn sharpness
            balance_cmd.position.x = 0.05  # Still slightly forward for stability
            balance_cmd.position.y = lateral_offset
            balance_cmd.position.z = self.com_height
            
        elif self.state == 'starting' or self.state == 'stopping':
            # Smooth transitions in balance during start/stop
            # Gradually adjust balance point
            balance_cmd.position.x = 0.02  # Conservative forward position
            balance_cmd.position.y = 0.0
            balance_cmd.position.z = self.com_height
        
        # Add orientation adjustments based on movement intent
        if cmd_vel.angular.z != 0:
            # Slight head turn anticipation
            balance_cmd.orientation.z = 0.1 * cmd_vel.angular.z
        
        return balance_cmd

    def path_callback(self, msg):
        """
        Process navigation path to anticipate balance requirements
        """
        if len(msg.poses) > 1:
            # Determine upcoming path characteristics
            next_waypoint = msg.poses[1].pose.position
            current_pos = msg.poses[0].pose.position
            
            # Calculate direction of travel
            dx = next_waypoint.x - current_pos.x
            dy = next_waypoint.y - current_pos.y
            path_angle = np.arctan2(dy, dx)
            
            # Set balance anticipation based on path
            self.anticipate_path_characteristics(path_angle, msg.poses[1:])

    def anticipate_path_characteristics(self, path_angle, future_waypoints):
        """
        Anticipate upcoming path characteristics for proactive balance adjustment
        """
        # Analyze future waypoints for:
        # - Sharp turns requiring balance adjustment
        # - Sloped terrain requiring gait modification
        # - Obstacles requiring stepping adjustments
        # - Doorways requiring sideways walking
        
        if len(future_waypoints) > 2:
            # Check for sharp turns in the next few waypoints
            for i in range(1, min(3, len(future_waypoints))):
                wp = future_waypoints[i].pose.position
                prev_wp = future_waypoints[i-1].pose.position if i > 0 else future_waypoints[i-1].pose.position
                
                next_angle = np.arctan2(wp.y - prev_wp.y, wp.x - prev_wp.x)
                turn_angle = abs(next_angle - path_angle)
                
                if turn_angle > np.pi/4:  # 45-degree turn
                    # Prepare for turning balance adjustments
                    self.prepare_for_turn(next_angle)
        
    def prepare_for_turn(self, turn_angle):
        """
        Prepare balance system for anticipated turn
        """
        self.get_logger().info(f"Anticipating turn of {np.degrees(turn_angle):.1f} degrees")


def main(args=None):
    rclpy.init(args=args)
    node = NavigationBalanceIntegrator()
    
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

## Quality Assurance for Balance Systems

### Balance Performance Metrics

```python
#!/usr/bin/env python3
"""
Balance performance assessment for Physical AI systems
"""
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Imu
from std_msgs.msg import Float32, String
import numpy as np


class BalancePerformanceAssessor(Node):
    """
    Assess balance performance in Physical AI systems
    """
    def __init__(self):
        super().__init__('balance_performance_assessor')
        
        self.imu_sub = self.create_subscription(Imu, '/imu/data', self.imu_callback, 10)
        
        # Performance metrics publishers
        self.stability_score_pub = self.create_publisher(Float32, '/balance_stability_score', 10)
        self.performance_report_pub = self.create_publisher(String, '/balance_performance_report', 10)
        
        # Internal state tracking
        self.roll_history = []
        self.pitch_history = []
        self.acc_history = []
        self.max_history = 100  # Keep last 100 samples
        
        # Performance thresholds
        self.roll_threshold = 0.2  # 11.5 degrees
        self.pitch_threshold = 0.2
        self.acc_threshold = 2.0  # m/s^2
        
        self.get_logger().info("Balance Performance Assessor Initialized")

    def imu_callback(self, msg):
        """
        Assess balance based on IMU data
        """
        # Extract orientation angles
        quat = [
            msg.orientation.x,
            msg.orientation.y, 
            msg.orientation.z,
            msg.orientation.w
        ]
        
        roll, pitch, yaw = self.quaternion_to_euler(*quat)
        
        # Extract linear acceleration
        linear_acc = np.sqrt(
            msg.linear_acceleration.x**2 + 
            msg.linear_acceleration.y**2 + 
            msg.linear_acceleration.z**2
        )
        
        # Store values
        self.roll_history.append(abs(roll))
        self.pitch_history.append(abs(pitch))
        self.acc_history.append(linear_acc)
        
        # Keep history within limits
        if len(self.roll_history) > self.max_history:
            self.roll_history.pop(0)
        if len(self.pitch_history) > self.max_history:
            self.pitch_history.pop(0)
        if len(self.acc_history) > self.max_history:
            self.acc_history.pop(0)
        
        # Calculate performance metrics
        metrics = self.calculate_balance_metrics()
        
        # Publish stability score
        score_msg = Float32()
        score_msg.data = metrics['stability_score']
        self.stability_score_publisher.publish(score_msg)
        
        # Check for degradation
        if metrics['stability_score'] < 0.7:
            self.assess_degradation(metrics)

    def calculate_balance_metrics(self):
        """
        Calculate comprehensive balance metrics
        """
        if not self.roll_history:
            return {'stability_score': 1.0}  # Perfect when starting
        
        # Calculate statistical measures
        avg_roll = np.mean(self.roll_history)
        avg_pitch = np.mean(self.pitch_history)
        avg_acc = np.mean(self.acc_history)
        
        std_roll = np.std(self.roll_history)
        std_pitch = np.std(self.pitch_history)
        std_acc = np.std(self.acc_history)
        
        # Calculate stability score
        # Lower angles and accelerations = higher stability
        roll_score = max(0, 1 - (avg_roll / self.roll_threshold))
        pitch_score = max(0, 1 - (avg_pitch / self.pitch_threshold))
        acc_score = max(0, 1 - (avg_acc / self.acc_threshold))
        
        # Stability based on variation (less variation = more stable)
        variation_penalty = (std_roll + std_pitch) / 2.0
        
        # Weighted stability score
        stability_score = 0.6 * (roll_score + pitch_score) / 2.0 + \
                         0.3 * acc_score + \
                         0.1 * (1 - min(1.0, variation_penalty))
        
        metrics = {
            'stability_score': min(1.0, stability_score),
            'avg_roll': avg_roll,
            'avg_pitch': avg_pitch,
            'avg_acceleration': avg_acc,
            'std_roll': std_roll,
            'std_pitch': std_pitch,
            'std_acceleration': std_acc
        }
        
        return metrics

    def assess_degradation(self, metrics):
        """
        Assess if balance performance is degrading
        """
        issues = []
        
        if metrics['avg_roll'] > self.roll_threshold * 0.8:
            issues.append(f"Roll angle too high: {metrics['avg_roll']:.3f}")
        if metrics['avg_pitch'] > self.pitch_threshold * 0.8:
            issues.append(f"Pitch angle too high: {metrics['avg_pitch']:.3f}")
        if metrics['avg_acceleration'] > self.acc_threshold * 0.8:
            issues.append(f"Acceleration too high: {metrics['avg_acceleration']:.3f}")
        
        if issues:
            report_msg = String()
            report_msg.data = f"BALANCE DEGRADATION: {', '.join(issues)}"
            self.performance_report_publisher.publish(report_msg)
            self.get_logger().warn(report_msg.data)

    def quaternion_to_euler(self, x, y, z, w):
        """
        Convert quaternion to Euler angles
        """
        import math
        
        # Roll (x-axis rotation)
        sinr_cosp = 2 * (w * x + y * z)
        cosr_cosp = 1 - 2 * (x * x + y * y)
        roll = math.atan2(sinr_cosp, cosr_cosp)

        # Pitch (y-axis rotation)
        sinp = 2 * (w * y - z * x)
        if abs(sinp) >= 1:
            pitch = math.copysign(math.pi / 2, sinp)  # Use 90 degrees if out of range
        else:
            pitch = math.asin(sinp)

        # Yaw (z-axis rotation)
        siny_cosp = 2 * (w * z + x * y)
        cosy_cosp = 1 - 2 * (y * y + z * z)
        yaw = math.atan2(siny_cosp, cosy_cosp)

        return roll, pitch, yaw


def main(args=None):
    rclpy.init(args=args)
    node = BalancePerformanceAssessor()
    
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

## Best Practices for Balance Systems in Physical AI

### 1. Hierarchical Control Architecture

```python
class HierarchicalBalanceController:
    """
    Hierarchical balance controller for Physical AI systems
    """
    def __init__(self):
        # Different control layers for different balance strategies
        self.ankle_controller = AnkleStrategyController()
        self.hip_controller = HipStrategyController()
        self.stepping_controller = SteppingRecoveryController()
        self.protective_controller = ProtectiveReactionController()
        
        # Selector for appropriate balance strategy
        self.balance_selector = BalanceStrategySelector()
    
    def compute_balance_control(self, state_error, velocity_error, disturbance_level):
        """
        Select and compute appropriate balance control based on situation
        """
        # Determine required balance strategy based on disturbance level
        strategy = self.balance_selector.select_strategy(
            state_error, velocity_error, disturbance_level
        )
        
        if strategy == 'ankle':
            control_output = self.ankle_controller.ankle_strategy_control(
                state_error, velocity_error
            )
        elif strategy == 'hip':
            control_output = self.hip_controller.hip_strategy_control(
                state_error, velocity_error
            )
        elif strategy == 'stepping':
            control_output = self.stepping_controller.plan_recovery_step(
                state_error, velocity_error
            )
        elif strategy == 'protective':
            control_output = self.protective_controller.prepare_for_impact()
        else:
            # Default to ankle strategy for minor disturbances
            control_output = self.ankle_controller.ankle_strategy_control(
                state_error, velocity_error
            )
        
        return control_output, strategy
    
    def evaluate_balance_performance(self, current_state, desired_state):
        """
        Evaluate the effectiveness of the balance control
        """
        # Calculate error metrics
        position_error = np.linalg.norm(current_state[:2] - desired_state[:2])
        velocity_error = np.linalg.norm(current_state[3:5] - desired_state[3:5])
        
        # Determine if balance is adequate
        is_balanced = (position_error < 0.1 and velocity_error < 0.2)
        
        return {
            'position_error': position_error,
            'velocity_error': velocity_error,
            'is_balanced': is_balanced
        }
```

### 2. Safety and Failsafe Mechanisms

```python
class SafeBalanceController:
    """
    Balance controller with safety mechanisms for Physical AI
    """
    def __init__(self):
        self.max_ankle_torque = 50.0  # N*m limit
        self.max_hip_torque = 150.0   # N*m limit
        self.fall_detection_threshold = 0.5  # rad from upright
        self.recovery_time_limit = 2.0  # seconds to recover
        
        # Initialize timers
        self.recovery_start_time = None
    
    def compute_safe_control(self, state_error, velocity_error):
        """
        Compute balance control with safety limits
        """
        # Calculate required control
        raw_control = self.compute_raw_control(state_error, velocity_error)
        
        # Apply safety limits
        safe_control = self.apply_control_limits(raw_control)
        
        # Check for safety violations
        if self.is_unsafe_condition(state_error):
            return self.emergency_safety_control()
        
        return safe_control
    
    def apply_control_limits(self, control):
        """
        Apply torque and rate limits to control commands
        """
        limited_control = control.copy()
        
        # Limit ankle torques
        limited_control[0] = np.clip(limited_control[0], -self.max_ankle_torque, self.max_ankle_torque)  # Roll
        limited_control[1] = np.clip(limited_control[1], -self.max_ankle_torque, self.max_ankle_torque)  # Pitch
        
        return limited_control
    
    def is_unsafe_condition(self, state_error):
        """
        Check if current state is unsafe for continued operation
        """
        # Check if CoM is too far from support polygon
        com_distance = np.linalg.norm(state_error[:2])
        return com_distance > self.fall_detection_threshold
    
    def emergency_safety_control(self):
        """
        Execute emergency safety procedures
        """
        # Reduce all torques to safe levels
        # Prepare for protective actions
        # Possibly stop all movement
        return np.zeros(2)  # Zero torques for safety
```

## Conclusion

Balance and recovery systems are fundamental to successful Physical AI implementation, especially for humanoid robots that must maintain stability in dynamic environments. This chapter covered:

1. **Basic balance principles**: Understanding center of mass, support polygons, and stability margins
2. **Control strategies**: Ankle, hip, and stepping strategies for different disturbance levels
3. **Advanced techniques**: Model predictive control and linear inverted pendulum models
4. **Recovery mechanisms**: Protective reactions and fall preparation strategies
5. **Integration with navigation**: Coordinating balance with locomotion goals
6. **Performance assessment**: Metrics and monitoring for balance systems
7. **Safety mechanisms**: Failsafes and control limits for safe operation

The key to robust balance in Physical AI systems is implementing layered control strategies that can handle various levels of disturbance - from minor perturbations that can be corrected with ankle torques, to major disturbances requiring stepping recovery or protective actions.

For humanoid robots operating in human environments, balance control is not just about preventing falls but about maintaining the stability needed to perform complex manipulation and interaction tasks safely and effectively. As we continue through this book, we'll see how these balance capabilities integrate with perception, navigation, and manipulation to create complete Physical AI systems.