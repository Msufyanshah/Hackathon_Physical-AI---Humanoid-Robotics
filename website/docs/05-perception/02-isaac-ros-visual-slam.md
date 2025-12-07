---
sidebar_position: 2
title: 'Isaac ROS Visual SLAM'
---

# Isaac ROS Visual SLAM: Advanced Spatial Perception for Physical AI

## Introduction to Isaac ROS Visual SLAM

Simultaneous Localization and Mapping (SLAM) is a critical technology for Physical AI systems, enabling robots to understand their position within an environment while simultaneously constructing a map of that environment. Isaac ROS provides optimized implementations of Visual SLAM algorithms specifically designed for NVIDIA hardware, making them highly efficient for real-time robotics applications.

In Physical AI and humanoid robotics contexts, Visual SLAM enables:
- **Self-localization**: Determining the robot's position and orientation in the environment
- **Mapping**: Creating models of the environment for navigation and planning
- **Spatial understanding**: Perceiving the 3D structure of the environment
- **Environment awareness**: Detecting static and dynamic objects in the environment

## Understanding Visual SLAM in Physical AI

### SLAM Fundamentals

SLAM solves the chicken-and-egg problem of robotics: to map an environment you need to know where you are, but to know where you are you need to know the map. Visual SLAM approaches use camera imagery to solve this problem by identifying and tracking distinctive features in the environment.

The SLAM problem mathematically can be expressed as:

```
P(X_t, M | Z_1:t, U_1:t)
```

Where:
- `X_t` is the robot's trajectory
- `M` is the map
- `Z_1:t` is the sensor observations
- `U_1:t` is the control inputs

### Visual SLAM Approaches

1. **Feature-based SLAM**: Extracts and tracks distinctive features in the environment
2. **Direct SLAM**: Works with pixel intensities directly without extracting features
3. **Semantic SLAM**: Incorporates semantic information into the mapping process
4. **Visual-Inertial SLAM (VIO)**: Fuses visual data with IMU measurements for improved accuracy

### Isaac ROS SLAM Implementation

Isaac ROS provides several SLAM packages optimized for NVIDIA hardware:
- **Isaac ROS Stereo Visual SLAM**: Uses stereo cameras for scale-accurate mapping
- **Isaac ROS Visual-Inertial Odometry (VIO)**: Fuses visual and IMU data
- **Isaac ROS Occupancy Grid**: Generates 2D maps from 3D point clouds
- **Isaac ROS AprilTag 3D SLAM**: Uses fiducial markers for initialization and relocalization

## Isaac ROS Stereo Visual SLAM

### System Requirements

Isaac ROS Stereo Visual SLAM requires:
- NVIDIA GPU (Tensor Cores recommended for optimal performance)
- Stereo camera or RGB-D camera with IMU
- Proper camera calibration data
- Sufficient computational resources for real-time processing

### Installation

```bash
# Install Isaac ROS Stereo Visual SLAM package
sudo apt update
sudo apt install ros-humble-isaac-ros-stereo-visual-slam

# Verify installation
ros2 pkg list | grep visual_slam
```

### Example Launch File

```xml
<!-- example_stereo_slam_launch.py -->
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.conditions import IfCondition
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import ComposableNodeContainer
from launch_ros.descriptions import ComposableNode


def generate_launch_description():
    launch_args = [
        DeclareLaunchArgument(
            'launch_realsense',
            default_value='True',
            description='Launch RealSense camera driver if True'),
        DeclareLaunchArgument(
            'input_camera_namespace',
            default_value='/camera',
            description='Input camera namespace'),
        DeclareLaunchArgument(
            'input_camera_name',
            default_value='infra1',
            description='Input camera name'),
    ]

    # Get launch arguments
    launch_realsense = LaunchConfiguration('launch_realsense')
    input_camera_namespace = LaunchConfiguration('input_camera_namespace')
    input_camera_name = LaunchConfiguration('input_camera_name')

    # RealSense camera node (if needed)
    realsense_camera_node = ComposableNode(
        package='realsense2_camera',
        plugin='realsense2_camera::RealSenseNodeFactory',
        name='realsense_camera',
        condition=IfCondition(launch_realsense),
        parameters=[{
            'enable_infra1': True,
            'enable_infra2': True,
            'enable_color': False,
            'enable_depth': False,
            # Enable IMU if available (for VIO)
            'enable_gyro': True,
            'enable_accel': True,
            'unite_imu_method': 'linear_interpolation',
            'gyro_fps': 400,
            'accel_fps': 225,
        }]
    )

    # Stereo Rectification node
    stereo_rectify_node = ComposableNode(
        package='isaac_ros_stereo_image_proc',
        plugin='nvidia::isaac_ros::stereo_image_proc::RectifyNode',
        name='stereo_rectify',
        parameters=[{
            'width': 1280,
            'height': 720,
            'alpha': 0.0,  # Fully rectified images
        }],
        remappings=[
            ('left/image_raw', input_camera_namespace + '/infra1/image_rect_raw'),
            ('left/camera_info', input_camera_namespace + '/infra1/camera_info'),
            ('right/image_raw', input_camera_namespace + '/infra2/image_rect_raw'),
            ('right/camera_info', input_camera_namespace + '/infra2/camera_info'),
            ('left/image_rect', 'stereo_left_rect'),
            ('right/image_rect', 'stereo_right_rect'),
            ('left/camera_info_rect', 'stereo_left_camera_info'),
            ('right/camera_info_rect', 'stereo_right_camera_info'),
        ]
    )

    # Isaac ROS Visual SLAM node
    visual_slam_node = ComposableNode(
        package='isaac_ros_visual_slam',
        plugin='nvidia::isaac_ros::visual_slam::VisualSlamNode',
        name='visual_slam',
        parameters=[{
            'enable_rectified_pose': True,
            'rectified_publisher_queue_size': 10,
            'enable_imu': True,  # Enable IMU for VIO if available
            'publish_odom_tf': True,
            'publish_map_to_odom_tf': True,
            'map_frame': 'map',
            'odom_frame': 'odom',
            'base_frame': 'base_link',
            'tracking_frame': 'camera_link',
        }],
        remappings=[
            ('stereo_camera/left/image', 'stereo_left_rect'),
            ('stereo_camera/right/image', 'stereo_right_rect'),
            ('stereo_camera/left/camera_info', 'stereo_left_camera_info'),
            ('stereo_camera/right/camera_info', 'stereo_right_camera_info'),
            ('imu', input_camera_namespace + '/imu'),
            ('visual_slam/tracking/pose', 'slam_tracking_pose'),
            ('visual_slam/map/poses', 'slam_map_poses'),
            ('visual_slam/trajectory_graph', 'slam_trajectory_graph'),
            ('visual_slam/fixed_map', 'slam_fixed_map'),
        ]
    )

    # Occupancy grid node for 2D navigation
    occupancy_grid_node = ComposableNode(
        package='isaac_ros_visual_slam',
        plugin='nvidia::isaac_ros::visual_slam::OccupancyGridNode',
        name='occupancy_grid',
        parameters=[{
            'use_sim_time': False,
            'resolution': 0.05,  # 5cm resolution
            'grid_width': 100.0,
            'grid_height': 100.0,
            'enable_debug_mode': False,
        }],
        remappings=[
            ('slam_cloud', 'visual_slam/fixed_map'),
            ('occupancy_grid', 'slam_occupancy_grid'),
        ]
    )

    # Create container
    visual_slam_container = ComposableNodeContainer(
        name='visual_slam_container',
        namespace='',
        package='rclcpp_components',
        executable='component_container_mt',
        composable_node_descriptions=[
            realsense_camera_node,
            stereo_rectify_node,
            visual_slam_node,
            occupancy_grid_node,
        ],
        output='screen',
    )

    return LaunchDescription(launch_args + [visual_slam_container])
```

### Configuration Parameters

```yaml
# Isaac ROS Visual SLAM configuration parameters
visual_slam_node:
  ros__parameters:
    # Pose publishing settings
    enable_rectified_pose: true
    rectified_publisher_queue_size: 10

    # IMU integration (for VIO improvement)
    enable_imu: true

    # TF publishing
    publish_odom_tf: true
    publish_map_to_odom_tf: true

    # Frame IDs
    map_frame: "map"
    odom_frame: "odom"
    base_frame: "base_link"
    tracking_frame: "camera_link"

    # Loop closure settings
    enable_localization: false
    enable_mapping: true
    enable_loop_closure: true

    # Optimization settings
    optimization_frequency: 5.0  # Hz
    covariance_calculation_frequency: 1.0  # Hz

    # Feature tracking parameters
    feature_detector_type: "ORB"
    descriptor_matcher_type: "BOW_DISTANCE_L2"
    vocab_tree_path: "/opt/isaac_ros/visual_slam/orb_vocab.dbow2"

    # Tracking quality thresholds
    min_number_keyframes: 3
    max_number_keyframes: 1000
    tracking_quality_threshold: 0.5

    # Map management
    map_publish_frequency: 1.0  # Hz
    map_save_path: "/tmp/slam_map"
```

## Isaac ROS Visual-Inertial Odometry (VIO)

### VIO Fundamentals

Visual-Inertial Odometry (VIO) combines visual information from cameras with inertial measurements from IMUs to provide more robust and accurate pose estimation. This is particularly important for Physical AI systems operating in dynamic environments.

### Benefits of Visual-Inertial Fusion:
- **Improved accuracy**: IMU provides high-frequency motion information
- **Robustness to motion blur**: IMU helps track motion when visual features are blurred
- **Scale observability**: IMU acceleration helps observe absolute scale
- **Reduced drift**: IMU constraints help reduce visual-only drift

### Isaac ROS VIO Configuration

```yaml
# Isaac ROS VIO configuration
visual_slam_node:
  ros__parameters:
    # Enable VIO mode
    enable_imu: true

    # IMU integration parameters
    imu_accumulation_frequency: 1000.0  # Hz
    max_imu_queue_size: 100

    # Gravity vector alignment
    enable_gravity_vector_refinement: true
    gravity_magnitude: 9.81

    # IMU-camera extrinsic calibration
    # These are typically obtained through calibration
    optical_center_offset_x: 0.0
    optical_center_offset_y: 0.0
    optical_center_offset_z: 0.0

    # IMU noise parameters
    acc_noise_density: 0.0018
    acc_random_walk: 0.0003
    gyro_noise_density: 0.00007
    gyro_random_walk: 0.0000078

    # Initialization settings
    enable_initialization_from_extrinsics: true
    enable_imu_extrinsics_in_6dof_optimization: true
```

## Integration with Humanoid Robotics

### Humanoid SLAM Challenges

Humanoid robots introduce specific challenges for SLAM:

1. **Dynamic motion**: Humanoids have complex movement patterns that can cause motion blur
2. **Changing viewpoints**: Head movement and body sway affect visual features
3. **Close-range interactions**: Humanoids often operate in cluttered environments
4. **Sensor placement**: Cameras on humanoid heads have different perspectives than fixed systems

### Camera Mounting Considerations

For humanoid robots, camera mounting affects SLAM performance:

```python
#!/usr/bin/env python3
"""
Camera configuration for humanoid robot SLAM
"""
import rclpy
from rclpy.node import Node
from tf2_ros import TransformBroadcaster
from geometry_msgs.msg import TransformStamped
from sensor_msgs.msg import CameraInfo
import numpy as np


class HumanoidCameraConfiguration(Node):
    """
    Node to manage camera configuration for humanoid SLAM
    """
    def __init__(self):
        super().__init__('humanoid_camera_config')

        # Transform broadcaster for camera frames
        self.tf_broadcaster = TransformBroadcaster(self)

        # Timer to broadcast transforms
        self.timer = self.create_timer(0.05, self.broadcast_transforms)  # 20Hz

        # Store robot state for dynamic transforms
        self.head_yaw = 0.0
        self.head_pitch = 0.0
        self.robot_pose = np.array([0.0, 0.0, 0.0])  # x, y, z
        self.robot_orientation = np.array([0.0, 0.0, 0.0, 1.0])  # x, y, z, w (quaternion)

        self.get_logger().info("Humanoid Camera Configuration Node Started")

    def broadcast_transforms(self):
        """
        Broadcast camera transforms accounting for head movement
        """
        # Create transform from base to head
        t = TransformStamped()
        t.header.stamp = self.get_clock().now().to_msg()
        t.header.frame_id = 'base_link'
        t.child_frame_id = 'head_link'

        # Head position relative to base
        t.transform.translation.x = 0.0
        t.transform.translation.y = 0.0
        t.transform.translation.z = 0.75  # Height of head from base

        # Head orientation from current head pose
        from scipy.spatial.transform import Rotation as R
        r = R.from_euler('y', self.head_yaw) * R.from_euler('x', self.head_pitch)
        quat = r.as_quat()  # x, y, z, w

        t.transform.rotation.x = quat[0]
        t.transform.rotation.y = quat[1]
        t.transform.rotation.z = quat[2]
        t.transform.rotation.w = quat[3]

        # Create transform from head to camera
        cam_t = TransformStamped()
        cam_t.header.stamp = self.get_clock().now().to_msg()
        cam_t.header.frame_id = 'head_link'
        cam_t.child_frame_id = 'camera_link'

        # Camera position relative to head (typically looking straight ahead)
        cam_t.transform.translation.x = 0.05  # 5cm forward from head
        cam_t.transform.translation.y = 0.0   # Centered laterally
        cam_t.transform.translation.z = 0.0   # Centered vertically

        # Camera orientation (looking forward)
        cam_t.transform.rotation.x = 0.0
        cam_t.transform.rotation.y = 0.0
        cam_t.transform.rotation.z = 0.0
        cam_t.transform.rotation.w = 1.0

        # Send transforms
        self.tf_broadcaster.sendTransform([t, cam_t])

    def update_head_pose(self, yaw, pitch):
        """
        Update head pose for dynamic camera configuration
        """
        self.head_yaw = yaw
        self.head_pitch = pitch

    def update_robot_pose(self, pose_msg):
        """
        Update robot pose from localization system
        """
        self.robot_pose = np.array([
            pose_msg.pose.position.x,
            pose_msg.pose.position.y,
            pose_msg.pose.position.z
        ])
        self.robot_orientation = np.array([
            pose_msg.pose.orientation.x,
            pose_msg.pose.orientation.y,
            pose_msg.pose.orientation.z,
            pose_msg.pose.orientation.w
        ])


def main(args=None):
    rclpy.init(args=args)
    node = HumanoidCameraConfiguration()

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

### Multi-Sensor Fusion for Humanoid SLAM

```python
#!/usr/bin/env python3
"""
Multi-sensor fusion for humanoid SLAM system
"""
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, Imu, PointCloud2
from nav_msgs.msg import Odometry
from geometry_msgs.msg import PoseStamped
from tf2_ros import TransformListener, Buffer
from message_filters import ApproximateTimeSynchronizer, Subscriber
import numpy as np


class HumanoidSLAMFusion(Node):
    """
    Fuses multiple sensors for humanoid SLAM
    """
    def __init__(self):
        super().__init__('humanoid_slam_fusion')

        # Create subscribers for different sensors
        self.camera_sub = Subscriber(self, Image, '/camera/infra1/image_rect_raw')
        self.stereo_sub = Subscriber(self, Image, '/camera/infra2/image_rect_raw')
        self.imu_sub = Subscriber(self, Imu, '/camera/imu')
        self.odom_sub = self.create_subscription(Odometry, '/odom', self.odom_callback, 10)

        # Use message filters for synchronization
        self.ts = ApproximateTimeSynchronizer(
            [self.camera_sub, self.stereo_sub, self.imu_sub],
            queue_size=10,
            slop=0.1  # 100ms tolerance
        )
        self.ts.registerCallback(self.sensor_fusion_callback)

        # Publisher for fused pose
        self.fused_pose_pub = self.create_publisher(PoseStamped, '/slam_fused_pose', 10)

        # TF listener for transforms
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)

        # Store sensor states
        self.last_camera = None
        self.last_stereo = None
        self.last_imu = None
        self.last_odom = None

        # Kalman filter for fusion (simplified version)
        self.state_estimate = np.zeros(7)  # [x, y, z, qx, qy, qz, qw]
        self.state_covariance = np.eye(7) * 0.1  # Initial uncertainty

        self.get_logger().info("Humanoid SLAM Fusion Node Started")

    def sensor_fusion_callback(self, camera_msg, stereo_msg, imu_msg):
        """
        Callback for synchronized sensor data
        """
        # Process visual data from stereo cameras
        visual_pose = self.process_stereo_data(camera_msg, stereo_msg)

        # Process IMU data
        imu_delta = self.process_imu_data(imu_msg)

        # Fuse estimates using simple weighted average (Kalman filter in real implementation)
        if visual_pose is not None and self.last_imu is not None:
            # Combine visual and IMU estimates
            fused_pose = self.fuse_visual_imu(visual_pose, imu_delta)

            # Publish fused result
            pose_msg = PoseStamped()
            pose_msg.header.stamp = camera_msg.header.stamp
            pose_msg.header.frame_id = 'map'
            pose_msg.pose.position.x = fused_pose[0]
            pose_msg.pose.position.y = fused_pose[1]
            pose_msg.pose.position.z = fused_pose[2]

            # Publish the fused pose
            self.fused_pose_publisher.publish(pose_msg)

            # Store as last processed data
            self.last_camera = camera_msg
            self.last_stereo = stereo_msg
            self.last_imu = imu_msg

    def process_stereo_data(self, left_img, right_img):
        """
        Process stereo camera data for pose estimation
        """
        # This would typically interface with Isaac ROS Stereo Visual SLAM
        # For this example, we'll return a placeholder
        return np.array([0.1, 0.05, 0.01, 0.0, 0.0, 0.0, 1.0])  # [x, y, z, qx, qy, qz, qw]

    def process_imu_data(self, imu_msg):
        """
        Process IMU data for pose deltas
        """
        # Extract angular velocity and linear acceleration
        ang_vel = np.array([
            imu_msg.angular_velocity.x,
            imu_msg.angular_velocity.y,
            imu_msg.angular_velocity.z
        ])

        lin_acc = np.array([
            imu_msg.linear_acceleration.x,
            imu_msg.linear_acceleration.y,
            imu_msg.linear_acceleration.z
        ])

        # Integrate to get pose delta (simplified)
        dt = 0.01  # Assuming 100Hz IMU

        # This is greatly simplified - real integration involves more complex math
        angle_change = ang_vel * dt
        pos_change = lin_acc * dt * dt / 2.0  # s = 0.5*a*t^2

        return np.concatenate([pos_change, angle_change])

    def fuse_visual_imu(self, visual_pose, imu_delta):
        """
        Fuse visual and IMU estimates
        """
        # In a real system, this would use a proper Kalman filter or other fusion technique
        # For this example, we'll use a simple weighted combination

        # Weight visual data more when confidence is high
        visual_weight = 0.8
        imu_weight = 0.2

        fused_pose = visual_pose * visual_weight
        fused_pose[:3] += imu_delta[:3] * imu_weight  # Position from IMU integration

        return fused_pose

    def odom_callback(self, odom_msg):
        """
        Callback for wheel odometry to aid SLAM
        """
        self.last_odom = odom_msg
        self.get_logger().debug(f"Received odometry: {odom_msg.pose.pose.position}")


def main(args=None):
    rclpy.init(args=args)
    node = HumanoidSLAMFusion()

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

## Isaac ROS Occupancy Grid for Navigation

### 2D Map Generation

Isaac ROS provides an occupancy grid node that converts 3D SLAM maps to 2D maps for navigation:

```bash
# View Isaac ROS occupancy grid
ros2 launch isaac_ros_visual_slam occupancy_grid_node.py
```

### Occupancy Grid Configuration

```yaml
occupancy_grid_node:
  ros__parameters:
    use_sim_time: false
    resolution: 0.05  # 5cm resolution
    grid_width: 100.0  # 100m wide
    grid_height: 100.0  # 100m tall
    enable_debug_mode: false

    # ROI (Region of Interest) settings
    roi_min_x: -50.0
    roi_min_y: -50.0
    roi_max_x: 50.0
    roi_max_y: 50.0

    # Map update settings
    map_publish_frequency: 1.0  # Hz
    min_range_threshold: 0.1  # Minimum range for points
    max_range_threshold: 10.0  # Maximum range for points
```

## Performance Optimization for Physical AI

### GPU Acceleration

Isaac ROS SLAM algorithms leverage GPU acceleration for optimal performance:

```python
#!/usr/bin/env python3
"""
GPU-accelerated SLAM for Physical AI applications
"""
import sys
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from sensor_msgs.msg import Image
import cv2
from cv_bridge import CvBridge
import numpy as np
import cuda_helper  # Hypothetical CUDA helper module

class GPUAcceleratedSLAM(Node):
    """
    Node demonstrating GPU acceleration for SLAM processing
    """
    def __init__(self):
        super().__init__('gpu_slam_node')

        # Set CUDA device
        self.cuda_device = 0  # Use first GPU

        # Subscription for camera images
        self.image_sub = self.create_subscription(
            Image,
            '/camera/infra1/image_rect_raw',
            self.gpu_image_callback,
            10
        )

        # Publisher for status
        self.status_pub = self.create_publisher(String, '/slam_gpu_status', 10)

        # CV Bridge
        self.cv_bridge = CvBridge()

        # Initialize GPU resources
        self.initialize_gpu_resources()

        self.get_logger().info("GPU Accelerated SLAM Node Started")

    def initialize_gpu_resources(self):
        """
        Initialize GPU resources for SLAM processing
        """
        try:
            # Initialize CUDA context
            self.cuda_context = cuda_helper.Context(self.cuda_device)

            # Initialize GPU memory pools
            self.gpu_feature_buffer = cuda_helper.MemoryPool(size_mb=1024)

            # Initialize processing kernels
            self.feature_extraction_kernel = cuda_helper.compile_kernel(
                "feature_extraction.cu"
            )

            self.descriptor_matching_kernel = cuda_helper.compile_kernel(
                "descriptor_matching.cu"
            )

            status_msg = String()
            status_msg.data = "GPU resources initialized successfully"
            self.status_publisher.publish(status_msg)

        except Exception as e:
            self.get_logger().error(f"GPU initialization failed: {str(e)}")
            status_msg = String()
            status_msg.data = f"GPU initialization failed: {str(e)}"
            self.status_publisher.publish(status_msg)

    def gpu_image_callback(self, msg):
        """
        Process image using GPU acceleration
        """
        try:
            # Convert ROS image to OpenCV
            cv_image = self.cv_bridge.imgmsg_to_cv2(msg, desired_encoding='passthrough')

            # Upload image to GPU
            gpu_image = cuda_helper.upload_to_device(cv_image)

            # Extract features using GPU
            keypoints_gpu, descriptors_gpu = self.extract_features_gpu(gpu_image)

            # Match features with previous frames using GPU
            matches_gpu = self.match_descriptors_gpu(descriptors_gpu)

            # Process for SLAM
            slam_result = self.process_slam_gpu(keypoints_gpu, matches_gpu)

            # Publish SLAM result
            if slam_result:
                self.publish_slam_result(slam_result, msg.header)

        except Exception as e:
            self.get_logger().error(f"GPU image processing failed: {str(e)}")

    def extract_features_gpu(self, gpu_image):
        """
        Extract features using GPU acceleration
        """
        # Execute feature extraction kernel
        result = cuda_helper.execute_kernel(
            self.feature_extraction_kernel,
            gpu_image,
            block_size=(16, 16)
        )

        # Parse results
        keypoints = result['keypoints']
        descriptors = result['descriptors']

        return keypoints, descriptors

    def match_descriptors_gpu(self, descriptors):
        """
        Match descriptors using GPU acceleration
        """
        # Execute descriptor matching kernel
        matches = cuda_helper.execute_kernel(
            self.descriptor_matching_kernel,
            descriptors,
            self.previous_descriptors_gpu,
            block_size=(32, 32)
        )

        return matches

    def process_slam_gpu(self, keypoints, matches):
        """
        Process SLAM using GPU acceleration
        """
        # Perform pose estimation on GPU
        pose = cuda_helper.estimate_pose_gpu(keypoints, matches)

        # Optimize map on GPU
        optimized_map = cuda_helper.optimize_map_gpu(self.current_map_gpu, pose)

        # Store for next iteration
        self.current_map_gpu = optimized_map

        return {
            'pose': pose,
            'map': optimized_map,
            'keypoints_count': len(keypoints)
        }

    def publish_slam_result(self, result, header):
        """
        Publish SLAM results with GPU acceleration metrics
        """
        # Publish pose
        # Publish map
        # Publish performance metrics

        self.get_logger().info(
            f"SLAM result: pose=({result['pose'][0]:.2f}, {result['pose'][1]:.2f}), "
            f"features={result['keypoints_count']}"
        )


def main(args=None):
    rclpy.init(args=args)
    node = GPUAcceleratedSLAM()

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

### Memory Management for Real-Time SLAM

```python
#!/usr/bin/env python3
"""
Memory management for real-time SLAM in Physical AI systems
"""
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, PointCloud2
from std_msgs.msg import Header
import numpy as np
from collections import deque
import gc

class MemoryManagedSLAM(Node):
    """
    SLAM node with efficient memory management for real-time performance
    """
    def __init__(self):
        super().__init__('memory_managed_slam')

        # Subscription for camera images
        self.image_sub = self.create_subscription(
            Image,
            '/camera/infra1/image_rect_raw',
            self.memory_efficient_callback,
            5  # Small queue to prevent memory buildup
        )

        # Memory pool for image data
        self.image_buffer_pool = deque(maxlen=20)  # Limit history
        self.feature_pool = deque(maxlen=50)  # Limit feature storage

        # Map representation with memory limits
        self.map_cells = {}  # Dictionary for sparse map
        self.max_map_cells = 10000  # Limit map size

        # Memory monitoring
        self.memory_monitor_timer = self.create_timer(1.0, self.check_memory_usage)

        self.frame_count = 0
        self.get_logger().info("Memory Managed SLAM Node Started")

    def memory_efficient_callback(self, msg):
        """
        Memory-efficient SLAM processing
        """
        # Process image (but don't store the full image for long-term)
        processed_features = self.extract_features_efficiently(msg)

        if processed_features:
            # Update map with features (memory-efficient)
            self.update_sparse_map(processed_features, msg.header)

            # Publish results without storing full data
            self.publish_pose_estimate(processed_features, msg.header)

            self.frame_count += 1

            # Manage memory periodically
            if self.frame_count % 100 == 0:
                self.cleanup_old_map_entries()
                gc.collect()

    def extract_features_efficiently(self, image_msg):
        """
        Extract features with minimal memory allocation
        """
        try:
            # Convert to grayscale to reduce memory
            cv_image = self.cv_bridge.imgmsg_to_cv2(image_msg, 'mono8')

            # Use efficient feature extraction
            # Store only essential feature information
            keypoints = cv2.goodFeaturesToTrack(
                cv_image,
                maxCorners=200,  # Limit number of features
                qualityLevel=0.01,
                minDistance=10,
                blockSize=3
            )

            if keypoints is not None:
                # Convert to minimal representation
                features = {
                    'positions': keypoints.reshape(-1, 2).tolist(),
                    'count': len(keypoints)
                }

                # Add to feature pool
                if len(self.feature_pool) < self.feature_pool.maxlen:
                    self.feature_pool.append(features)
                else:
                    # Remove oldest and add new
                    self.feature_pool.popleft()
                    self.feature_pool.append(features)

                return features
            else:
                return None
        except Exception as e:
            self.get_logger().error(f"Feature extraction error: {str(e)}")
            return None

    def update_sparse_map(self, features, header):
        """
        Update sparse map representation
        """
        # Convert features to map coordinates using transform
        camera_pos = self.get_camera_position(header.frame_id)

        for pos in features['positions']:
            # Convert pixel position to world coordinates
            world_pos = self.pixel_to_world(pos, camera_pos)

            # Use discretized coordinates as key
            cell_key = (int(world_pos[0] * 10), int(world_pos[1] * 10))  # 10cm resolution

            # Store feature in sparse map
            if len(self.map_cells) < self.max_map_cells or cell_key in self.map_cells:
                self.map_cells[cell_key] = {
                    'position': world_pos,
                    'timestamp': header.stamp,
                    'appearance': self.get_descriptor_for_position(pos)  # Simplified
                }
            elif len(self.map_cells) >= self.max_map_cells:
                # Remove oldest entries to maintain limit
                oldest_key = min(self.map_cells.keys(),
                              key=lambda x: self.map_cells[x]['timestamp'])
                del self.map_cells[oldest_key]

    def check_memory_usage(self):
        """
        Monitor and report memory usage
        """
        import psutil
        import os

        process = psutil.Process(os.getpid())
        memory_mb = process.memory_info().rss / 1024 / 1024

        self.get_logger().info(f"Memory usage: {memory_mb:.2f} MB")

        # Log map statistics
        self.get_logger().info(f"Map contains {len(self.map_cells)} cells")

    def cleanup_old_map_entries(self):
        """
        Remove old map entries to manage memory
        """
        if len(self.map_cells) > self.max_map_cells * 0.8:  # 80% threshold
            # Remove oldest 20% of entries
            sorted_cells = sorted(self.map_cells.items(),
                                key=lambda x: x[1]['timestamp'])

            # Keep only the most recent entries
            cells_to_remove = len(sorted_cells) // 5  # Remove 20%
            for key, _ in sorted_cells[:cells_to_remove]:
                del self.map_cells[key]

            self.get_logger().info(f"Cleaned up {cells_to_remove} map entries")

    def pixel_to_world(self, pixel_pos, camera_pos):
        """
        Convert pixel coordinates to world coordinates
        """
        # This would use camera intrinsics and extrinsics to convert
        # For simplicity, we'll use a basic conversion
        # In practice, would use tf2 transforms and camera calibration

        # Convert pixel to meters using assumed scale
        pixel_scale = 0.01  # 1 pixel = 1cm (simplified assumption)
        world_x = camera_pos[0] + (pixel_pos[0] - 320) * pixel_scale
        world_y = camera_pos[1] + (pixel_pos[1] - 240) * pixel_scale

        return [world_x, world_y, camera_pos[2]]

    def get_camera_position(self, frame_id):
        """
        Get camera position from TF tree
        """
        try:
            transform = self.tf_buffer.lookup_transform(
                'map', frame_id, rclpy.time.Time())

            return [
                transform.transform.translation.x,
                transform.transform.translation.y,
                transform.transform.translation.z
            ]
        except Exception as e:
            self.get_logger().error(f"Could not get camera position: {str(e)}")
            return [0.0, 0.0, 0.0]  # Default position


def main(args=None):
    rclpy.init(args=args)
    node = MemoryManagedSLAM()

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

## Practical SLAM Applications in Humanoid Robotics

### Humanoid Navigation SLAM

```python
#!/usr/bin/env python3
"""
SLAM for humanoid navigation applications
"""
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, Imu
from geometry_msgs.msg import PoseStamped, Twist
from nav_msgs.msg import OccupancyGrid
from std_msgs.msg import String
import numpy as np
from scipy.spatial.distance import cdist


class HumanoidNavigationSLAM(Node):
    """
    SLAM system optimized for humanoid robot navigation
    """
    def __init__(self):
        super().__init__('humanoid_navigation_slam')

        # SLAM subscriptions
        self.camera_sub = self.create_subscription(
            Image,
            '/camera/infra1/image_rect_raw',
            self.camera_callback,
            10
        )

        self.imu_sub = self.create_subscription(
            Imu,
            '/camera/imu',
            self.imu_callback,
            10
        )

        # Navigation publishers
        self.pose_pub = self.create_publisher(PoseStamped, '/slam_pose', 10)
        self.map_pub = self.create_publisher(OccupancyGrid, '/slam_map', 10)
        self.nav_cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)

        # Humanoid-specific navigation goals
        self.waypoint_sub = self.create_subscription(
            PoseStamped,
            '/nav_waypoints',
            self.waypoint_callback,
            10
        )

        # Current position and map
        self.current_pose = np.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0])  # [x,y,z,qx,qy,qz,qw]
        self.map_grid = np.zeros((1000, 1000))  # 100m x 100m at 10cm resolution
        self.map_origin = [-50.0, -50.0]  # Bottom-left corner of map
        self.navigation_goals = []  # Queue of navigation goals

        # Navigation parameters
        self.linear_velocity = 0.2  # m/s
        self.angular_velocity = 0.5  # rad/s
        self.arrival_threshold = 0.3  # meters

        self.get_logger().info("Humanoid Navigation SLAM Started")

    def camera_callback(self, msg):
        """
        Process camera data for SLAM
        """
        # Perform visual SLAM operations
        pose_update = self.perform_visual_slam(msg)

        if pose_update is not None:
            # Update current pose
            self.update_pose_estimate(pose_update)

            # Update map
            self.update_map_with_features(pose_update)

            # Check navigation progress
            self.check_navigation_progress()

    def imu_callback(self, msg):
        """
        Integrate IMU data for pose refinement
        """
        # Use IMU to refine pose estimate between frames
        refined_pose = self.refine_pose_with_imu(msg)
        self.current_pose = refined_pose

    def waypoint_callback(self, msg):
        """
        Receive navigation waypoints
        """
        # Convert PoseStamped to navigation goal
        goal = {
            'x': msg.pose.position.x,
            'y': msg.pose.position.y,
            'timestamp': msg.header.stamp
        }

        self.navigation_goals.append(goal)
        self.get_logger().info(f"Added navigation goal: ({goal['x']:.2f}, {goal['y']:.2f})")

    def perform_visual_slam(self, image_msg):
        """
        Perform visual SLAM to estimate robot pose
        """
        # This would interface with Isaac ROS Visual SLAM
        # For this example, we'll return a simulated pose update
        return self.current_pose  # Placeholder

    def update_pose_estimate(self, pose_update):
        """
        Update robot pose estimate
        """
        # In a real system, this would integrate pose changes
        # For this example, we'll simply update the pose
        self.current_pose = pose_update

        # Publish current pose
        pose_msg = PoseStamped()
        pose_msg.header.stamp = self.get_clock().now().to_msg()
        pose_msg.header.frame_id = 'map'
        pose_msg.pose.position.x = self.current_pose[0]
        pose_msg.pose.position.y = self.current_pose[1]
        pose_msg.pose.position.z = self.current_pose[2]
        pose_msg.pose.orientation.x = self.current_pose[3]
        pose_msg.pose.orientation.y = self.current_pose[4]
        pose_msg.pose.orientation.z = self.current_pose[5]
        pose_msg.pose.orientation.w = self.current_pose[6]

        self.pose_publisher.publish(pose_msg)

    def update_map_with_features(self, pose_update):
        """
        Update occupancy grid map with new features
        """
        # In a real system, this would update the map based on visual features
        # For this example, we'll simulate adding some obstacles
        robot_x, robot_y = pose_update[0], pose_update[1]

        # Add obstacles near robot's current position (simulated)
        grid_x = int((robot_x - self.map_origin[0]) / 0.1)  # 10cm resolution
        grid_y = int((robot_y - self.map_origin[1]) / 0.1)

        # Add some obstacles in the grid
        if 0 <= grid_x < self.map_grid.shape[0] and 0 <= grid_y < self.map_grid.shape[1]:
            # Add obstacle at robot position + offset (simulated)
            obstacle_x = grid_x + 10
            obstacle_y = grid_y + 5

            if 0 <= obstacle_x < self.map_grid.shape[0] and 0 <= obstacle_y < self.map_grid.shape[1]:
                self.map_grid[obstacle_x, obstacle_y] = 100  # Occupied

    def check_navigation_progress(self):
        """
        Check navigation progress and send appropriate commands
        """
        if self.navigation_goals:
            current_goal = self.navigation_goals[0]

            # Calculate distance to goal
            dx = current_goal['x'] - self.current_pose[0]
            dy = current_goal['y'] - self.current_pose[1]
            distance = np.sqrt(dx*dx + dy*dy)

            if distance > self.arrival_threshold:
                # Calculate navigation command
                cmd_vel = Twist()

                # Linear velocity toward goal
                cmd_vel.linear.x = min(self.linear_velocity, distance * 0.5)

                # Angular velocity for heading correction
                current_yaw = self.get_yaw_from_quaternion(self.current_pose[3:])
                goal_yaw = np.arctan2(dy, dx)
                yaw_error = goal_yaw - current_yaw

                # Normalize angle
                while yaw_error > np.pi:
                    yaw_error -= 2*np.pi
                while yaw_error < -np.pi:
                    yaw_error += 2*np.pi

                cmd_vel.angular.z = max(-self.angular_velocity,
                                      min(self.angular_velocity, yaw_error * 2.0))

                # Publish navigation command
                self.nav_cmd_publisher.publish(cmd_vel)

                self.get_logger().debug(f"Navigating: dist={distance:.2f}m, heading_err={yaw_error:.2f}rad")
            else:
                # Reached goal, remove it from queue
                completed_goal = self.navigation_goals.pop(0)
                self.get_logger().info(f"Reached goal: ({completed_goal['x']:.2f}, {completed_goal['y']:.2f})")

                if not self.navigation_goals:
                    # No more goals, stop robot
                    stop_cmd = Twist()
                    self.nav_cmd_publisher.publish(stop_cmd)

    def get_yaw_from_quaternion(self, quat):
        """
        Extract yaw from quaternion
        """
        import math
        # Extract yaw from quaternion
        siny_cosp = 2 * (quat[3] * quat[2] + quat[0] * quat[1])
        cosy_cosp = 1 - 2 * (quat[1] * quat[1] + quat[2] * quat[2])
        yaw = math.atan2(siny_cosp, cosy_cosp)
        return yaw


def main(args=None):
    rclpy.init(args=args)
    node = HumanoidNavigationSLAM()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        # Stop robot on shutdown
        stop_msg = Twist()
        node.nav_cmd_publisher.publish(stop_msg)
        node.get_logger().info("Navigation SLAM stopped")
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Troubleshooting Isaac ROS SLAM

### Common SLAM Issues and Solutions

```bash
# 1. Check if SLAM nodes are running
ros2 node list | grep -i slam

# 2. Monitor SLAM topics
ros2 topic echo /visual_slam/tracking/pose
ros2 topic echo /visual_slam/fixed_map

# 3. Check camera calibration
ros2 topic echo /camera/infra1/camera_info
ros2 topic echo /camera/infra2/camera_info

# 4. Verify stereo rectification
ros2 run rqt_image_view rqt_image_view

# 5. Monitor transform tree
ros2 run tf2_tools view_frames

# 6. Check for errors
ros2 param list
ros2 lifecycle list
```

### Performance Optimization Tips

1. **Reduce image resolution**: Lower resolution images for faster processing
2. **Feature limiting**: Limit the number of features extracted and tracked
3. **Map management**: Use sparse maps and limit map size
4. **Threading**: Use multi-threaded executors where possible
5. **GPU utilization**: Ensure Isaac ROS packages are using GPU acceleration

## Integration with Perception Pipeline

Isaac ROS Visual SLAM integrates with other perception components:

```python
#!/usr/bin/env python3
"""
Integration example with perception pipeline
"""
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, CameraInfo
from geometry_msgs.msg import PoseStamped
from visualization_msgs.msg import Marker, MarkerArray
from std_msgs.msg import ColorRGBA


class SLAMPerceptionIntegration(Node):
    """
    Integrates SLAM with perception pipeline for Physical AI
    """
    def __init__(self):
        super().__init__('slam_perception_integration')

        # SLAM subscriptions
        self.slsm_pose_sub = self.create_subscription(
            PoseStamped,
            '/slam_pose',
            self.slam_pose_callback,
            10
        )

        # Camera subscriptions
        self.camera_sub = self.create_subscription(
            Image,
            '/camera/color/image_raw',
            self.camera_callback,
            10
        )

        # Perception publishers
        self.object_markers_pub = self.create_publisher(
            MarkerArray,
            '/detected_object_markers',
            10
        )

        # Store pose for object localization
        self.current_pose = None

        self.get_logger().info("SLAM-Perception Integration Node Started")

    def slam_pose_callback(self, msg):
        """
        Update current pose from SLAM
        """
        self.current_pose = [
            msg.pose.position.x,
            msg.pose.position.y,
            msg.pose.position.z,
            msg.pose.orientation.x,
            msg.pose.orientation.y,
            msg.pose.orientation.z,
            msg.pose.orientation.w
        ]

    def camera_callback(self, msg):
        """
        Process camera data and localize detected objects in map
        """
        if self.current_pose is None:
            return  # Wait for pose initialization

        # Detect objects in image (simplified)
        objects = self.detect_objects_in_image(msg)

        # Transform object positions to map coordinates
        map_objects = self.transform_objects_to_map(objects, self.current_pose)

        # Publish object markers
        self.publish_object_markers(map_objects, msg.header)

    def detect_objects_in_image(self, image_msg):
        """
        Detect objects in camera image (placeholder implementation)
        """
        # In a real implementation, this would use:
        # - Isaac ROS detection nodes
        # - Custom object detection models
        # - Semantic segmentation
        # etc.
        return [
            {'class': 'person', 'bbox': [100, 100, 200, 300], 'confidence': 0.9},
            {'class': 'chair', 'bbox': [300, 200, 400, 350], 'confidence': 0.85}
        ]

    def transform_objects_to_map(self, objects, robot_pose):
        """
        Transform object positions from camera to map coordinates
        """
        map_objects = []

        for obj in objects:
            # Calculate approximate 3D position from 2D bbox
            # This is simplified - real implementation would use depth data
            bbox = obj['bbox']
            center_x = (bbox[0] + bbox[2]) / 2
            center_y = (bbox[1] + bbox[3]) / 2

            # Convert pixel coordinates to world coordinates
            # This would use camera intrinsics and extrinsics
            # For simplicity, we'll use a basic transform
            world_x = robot_pose[0] + (center_x - 320) * 0.005  # Approximate conversion
            world_y = robot_pose[1] + (center_y - 240) * 0.005  # Approximate conversion
            world_z = robot_pose[2]  # Same height as robot

            map_obj = {
                'class': obj['class'],
                'position': [world_x, world_y, world_z],
                'confidence': obj['confidence']
            }

            map_objects.append(map_obj)

        return map_objects

    def publish_object_markers(self, objects, header):
        """
        Publish detected objects as visualization markers
        """
        marker_array = MarkerArray()

        for i, obj in enumerate(objects):
            marker = Marker()
            marker.header = header
            marker.header.frame_id = 'map'  # Use map frame for global coordinates
            marker.ns = 'detected_objects'
            marker.id = i
            marker.type = Marker.SPHERE
            marker.action = Marker.ADD

            # Position from SLAM-transformed coordinates
            marker.pose.position.x = obj['position'][0]
            marker.pose.position.y = obj['position'][1]
            marker.pose.position.z = obj['position'][2]
            marker.pose.orientation.w = 1.0

            # Size based on object class
            size_map = {'person': 0.5, 'chair': 0.6, 'table': 1.0}
            size = size_map.get(obj['class'], 0.3)
            marker.scale.x = size
            marker.scale.y = size
            marker.scale.z = size

            # Color based on class
            color_map = {
                'person': [1.0, 0.0, 0.0, 1.0],  # Red
                'chair': [0.0, 1.0, 0.0, 1.0],  # Green
                'table': [0.0, 0.0, 1.0, 1.0]   # Blue
            }
            r, g, b, a = color_map.get(obj['class'], [1.0, 1.0, 1.0, 1.0])

            marker.color = ColorRGBA(r=r, g=g, b=b, a=a)
            marker.text = f"{obj['class']}: {obj['confidence']:.2f}"

            marker_array.markers.append(marker)

        self.object_markers_publisher.publish(marker_array)


def main(args=None):
    rclpy.init(args=args)
    node = SLAMPerceptionIntegration()

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

## Quality Assurance for Isaac ROS SLAM

### SLAM Validation Techniques

```python
#!/usr/bin/env python3
"""
SLAM validation and quality assessment
"""
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import PoseStamped
from std_msgs.msg import Float32
import numpy as np


class SLAMQualityAssessment(Node):
    """
    Assesses SLAM quality and accuracy
    """
    def __init__(self):
        super().__init__('slam_quality_assessment')

        # SLAM pose subscription
        self.slam_pose_sub = self.create_subscription(
            PoseStamped,
            '/slam_pose',
            self.slam_pose_callback,
            10
        )

        # Ground truth subscription (for validation)
        self.gt_pose_sub = self.create_subscription(
            PoseStamped,
            '/ground_truth_pose',
            self.gt_pose_callback,
            10
        )

        # Quality metrics publishers
        self.pos_error_pub = self.create_publisher(Float32, '/slam_position_error', 10)
        self.quality_report_pub = self.create_publisher(String, '/slam_quality_report', 10)

        # Storage for pose history
        self.slam_history = []
        self.gt_history = []
        self.max_history = 100  # Max poses to keep for accuracy assessment

        self.get_logger().info("SLAM Quality Assessment Node Started")

    def slam_pose_callback(self, msg):
        """
        Store SLAM pose estimates
        """
        pose = np.array([
            msg.pose.position.x,
            msg.pose.position.y,
            msg.pose.position.z
        ])

        self.slam_history.append({
            'time': msg.header.stamp,
            'pose': pose
        })

        # Limit history size
        if len(self.slam_history) > self.max_history:
            self.slam_history.pop(0)

        # Publish error if ground truth is available
        if len(self.gt_history) > 0:
            gt_pose = self.closest_ground_truth_pose(msg.header.stamp)
            if gt_pose is not None:
                pos_error = np.linalg.norm(pose - gt_pose['pose'])
                error_msg = Float32()
                error_msg.data = float(pos_error)
                self.pos_error_publisher.publish(error_msg)

    def gt_pose_callback(self, msg):
        """
        Store ground truth poses for validation
        """
        pose = np.array([
            msg.pose.position.x,
            msg.pose.position.y,
            msg.pose.position.z
        ])

        self.gt_history.append({
            'time': msg.header.stamp,
            'pose': pose
        })

        # Limit history size
        if len(self.gt_history) > self.max_history:
            self.gt_history.pop(0)

    def closest_ground_truth_pose(self, query_time):
        """
        Find ground truth pose closest in time to query time
        """
        if not self.gt_history:
            return None

        # Find the closest ground truth pose in time
        time_diffs = [abs((gt['time'].nanosec - query_time.nanosec) / 1e9)
                     for gt in self.gt_history]
        min_idx = np.argmin(time_diffs)

        # Only return if time difference is small enough
        if time_diffs[min_idx] < 0.1:  # 100ms tolerance
            return self.gt_history[min_idx]
        else:
            return None

    def calculate_slam_accuracy(self):
        """
        Calculate overall SLAM accuracy metrics
        """
        if len(self.slam_history) == 0 or len(self.gt_history) == 0:
            return None

        # Calculate position errors for matching poses
        errors = []

        for slam_point in self.slam_history:
            closest_gt = self.closest_ground_truth_pose(slam_point['time'])
            if closest_gt is not None:
                error = np.linalg.norm(slam_point['pose'] - closest_gt['pose'])
                errors.append(error)

        if errors:
            mean_error = np.mean(errors)
            std_error = np.std(errors)
            max_error = np.max(errors)

            return {
                'mean_error': mean_error,
                'std_deviation': std_error,
                'max_error': max_error,
                'sample_count': len(errors)
            }

        return None

    def publish_quality_report(self):
        """
        Publish comprehensive SLAM quality report
        """
        metrics = self.calculate_slam_accuracy()

        if metrics:
            report = f"SLAM Quality Report: " \
                    f"Mean Error: {metrics['mean_error']:.3f}m, " \
                    f"Std Dev: {metrics['std_deviation']:.3f}m, " \
                    f"Max Error: {metrics['max_error']:.3f}m, " \
                    f"Samples: {metrics['sample_count']}"

            report_msg = String()
            report_msg.data = report
            self.quality_report_publisher.publish(report_msg)

            self.get_logger().info(report)
        else:
            self.get_logger().warn("Unable to compute SLAM quality metrics - no ground truth available")


def main(args=None):
    rclpy.init(args=args)
    node = SLAMQualityAssessment()

    # Timer to periodically publish quality reports
    quality_timer = node.create_timer(5.0, node.publish_quality_report)

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

Isaac ROS Visual SLAM provides state-of-the-art simultaneous localization and mapping capabilities specifically optimized for NVIDIA hardware and Physical AI applications. Key takeaways include:

1. **Stereo-based SLAM**: Provides scale-accurate mapping crucial for humanoid robotics
2. **Visual-Inertial Fusion**: Combines visual and IMU data for robust pose estimation
3. **GPU Acceleration**: Leverages NVIDIA hardware for real-time performance
4. **Multi-sensor Integration**: Seamlessly integrates with perception and navigation pipelines
5. **Memory Management**: Efficient processing for sustained operation
6. **Quality Assessment**: Tools for validating SLAM performance

When properly implemented, Isaac ROS Visual SLAM enables humanoid robots to navigate and operate effectively in unknown environments, building accurate maps and maintaining reliable positioning. The combination of stereo vision and IMU data creates a robust perception system capable of supporting complex humanoid behaviors in dynamic physical environments.

The next chapter will cover 3D vision and sensor fusion techniques, building on the foundation established here.