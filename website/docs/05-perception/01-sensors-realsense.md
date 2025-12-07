---
sidebar_position: 1
title: 'Sensors: RealSense'
---

# Sensors for Physical AI: Intel RealSense and Beyond

## Introduction to Physical AI Perception

Perception is the foundation of Physical AI, enabling robots to understand and interact with the physical world around them. Intel RealSense technology represents a leading solution for 3D perception in robotics, providing the sensory capabilities necessary for Physical AI systems to perform complex tasks in human environments.

This chapter explores the use of Intel RealSense and other advanced sensors for Physical AI and humanoid robotics applications, covering both hardware specifications and practical implementation techniques.

## Understanding Intel RealSense Technology

### RealSense Sensor Types

Intel RealSense cameras offer various configurations for different Physical AI applications:

#### D400 Series (Stereo-Based Depth)
- **D415**: Wide FOV RGB and depth sensing
- **D435**: Balanced performance and price
- **D435i**: Includes built-in IMU (accelerometer and gyroscope)
- **D455**: Highest resolution with multiple stereo pairs

#### L500 Series (Lidar-Based Depth)
- **L515**: LiDAR-based with high-accuracy depth sensing
- **L535**: Higher performance and extended range

### Key Specifications for Physical AI Applications

```yaml
D435 (Most Popular for Robotics):
  Resolution:
    RGB: 1920x1080 @ 30 FPS
    Depth: 1280x720 @ 90 FPS (default), up to 1280x720 @ 30 FPS
  Field of View:
    RGB: 69° H x 42° V x 77° D (Diagonal)
    Depth: 86° H x 56° V x 95° D (Diagonal)
  Depth Range: 0.2m - 10m
  Connectivity: USB 3.0
  IMU: Optional (D435i variant)

D435i (Robotics-Optimized):
  Additional Features:
    - Built-in IMU: Gyro: ±2000 dps, Accel: ±16g
    - IMU Rate: 400 Hz Gyro, 225 Hz Accelerometer
    - Timestamp correlation between depth, RGB, and IMU
  Use Cases:
    - Robot localization and mapping
    - Balance and motion control
    - Dynamic scene understanding

L515 (High Accuracy):
  Resolution:
    Depth: 1024x768 @ 30 FPS
  Depth Range: 0.25m - 9m
  Accuracy: <1% error at 1m distance
  Advantages:
    - Superior accuracy in well-lit conditions
    - Better performance with dark surfaces
    - Lower power consumption
  Disadvantages:
    - Susceptible to sunlight interference
    - Indoor-focused technology
```

## RealSense SDK and ROS 2 Integration

### Installation and Setup

```bash
# Install RealSense2 ROS 2 package
sudo apt install ros-humble-realsense2-camera ros-humble-realsense2-description

# Or build from source for latest features
cd ~/ros2_ws/src
git clone https://github.com/IntelRealSense/realsense-ros.git -b humble
cd ~/ros2_ws
colcon build --packages-select realsense2_camera realsense2_description
source install/setup.bash
```

### Basic Launch Configuration

```xml
<!-- Example launch file for RealSense D435i -->
<launch>
  <arg name="camera_name" default="camera"/>
  <arg name="camera_namespace" default="$(var camera_name)"/>
  <arg name="serial_no" default=""/>
  <arg name="usb_port_id" default=""/>
  <arg name="device_type" default=""/>
  <arg name="config_file" default="$(find-pkg-share realsense2_camera)/config/d435i.yaml"/>

  <node pkg="realsense2_camera" exec="realsense2_camera_node"
        name="$(var camera_name)" namespace="$(var camera_namespace)"
        output="screen">
    <param name="enable_infra1" value="false"/>
    <param name="enable_infra2" value="false"/>
    <param name="enable_color" value="true"/>
    <param name="enable_depth" value="true"/>
    <param name="enable_gyro" value="true"/>
    <param name="enable_accel" value="true"/>
    <param name="unite_imu_method" value="linear_interpolation"/> <!-- or copy -->
    <param name="depth_fps" value="30"/>
    <param name="color_fps" value="30"/>
    <param name="gyro_fps" value="400"/>
    <param name="accel_fps" value="225"/>
    <param name="enable_pointcloud" value="true"/>
    <param name="pointcloud_texture_stream" value="RS2_STREAM_COLOR"/>
    <param name="pointcloud_texture_index" value="0"/>
    <param name="align_depth.enable" value="true"/>
    <param name="clip_distance" value="-1"/> <!-- no clipping -->
  </node>
</launch>
```

### Configuration Parameters

```yaml
# d435i.yaml - Configuration file for RealSense D435i
camera_name: camera
camera_namespace: camera

# Enable/Disable streams
enable_color: true
enable_depth: true
enable_infra1: false
enable_infra2: false
enable_fisheye: false
enable_imu: true

# Stream settings
depth_width: 1280
depth_height: 720
depth_fps: 30
color_width: 1920
color_height: 1080
color_fps: 30
infra_width: 1280
infra_height: 720
infra_fps: 30

# IMU settings (D435i)
enable_gyro: true
enable_accel: true
gyro_fps: 400
accel_fps: 225

# Processing settings
enable_pointcloud: true
pointcloud_texture_stream: RS2_STREAM_COLOR
align_depth.enable: true
enable_sync: true

# Depth settings
depth_module:
  profile: 1280x720x30  # width x height x fps
  visual_preset: 1      # Custom 0, Default 1, Hand 2, HighAccuracy 3, HighDensity 4, RemoveIllumination 5

# RGB settings
rgb_camera:
  profile: 1920x1080x30

# Post-processing filters
filters:
  - colorizer
  - pointcloud
  # Additional filters: decimation, disparity, spatial, temporal, hole_filling

spatial:
  filter_magnitude: 2
  filter_smooth_alpha: 0.5
  filter_smooth_delta: 20
  hole_fill: 1

temporal:
  filter_persistence: 8
```

## Programming with RealSense in ROS 2

### Python Node Example

```python
#!/usr/bin/env python3
"""
RealSense camera node for Physical AI applications
"""
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, CameraInfo, Imu, PointCloud2
from cv_bridge import CvBridge
import numpy as np
import cv2
import pyrealsense2 as rs


class RealSensePhysicalAINode(Node):
    """
    Node for handling RealSense camera data in Physical AI applications
    """
    def __init__(self):
        super().__init__('realsense_physical_ai_node')

        # Create subscribers for different RealSense streams
        self.depth_sub = self.create_subscription(
            Image,
            '/camera/depth/image_rect_raw',
            self.depth_callback,
            10
        )

        self.color_sub = self.create_subscription(
            Image,
            '/camera/color/image_raw',
            self.color_callback,
            10
        )

        self.imu_sub = self.create_subscription(
            Imu,
            '/camera/imu',
            self.imu_callback,
            10
        )

        self.pointcloud_sub = self.create_subscription(
            PointCloud2,
            '/camera/depth/color/points',
            self.pointcloud_callback,
            10
        )

        # Publisher for processed perception data
        self.obstacle_pub = self.create_publisher(Image, '/processed_obstacle_map', 10)
        self.human_detect_pub = self.create_publisher(Image, '/processed_human_detection', 10)

        # CV Bridge for image conversion
        self.cv_bridge = CvBridge()

        # Initialize RealSense pipeline (alternative approach)
        self.pipeline = rs.pipeline()
        self.config = rs.config()

        # Configure streams
        self.config.enable_stream(rs.stream.depth, 640, 480, rs.format.z16, 30)
        self.config.enable_stream(rs.stream.color, 640, 480, rs.format.bgr8, 30)

        # Start streaming
        self.profile = self.pipeline.start(self.config)

        # Get depth sensor and set options
        depth_sensor = self.profile.get_device().first_depth_sensor()
        depth_sensor.set_option(rs.option.visual_preset, 1)  # Default preset

        # For D435i, also configure IMU
        try:
            accel_sensor = self.profile.get_device().first_accel_sensor()
            gyro_sensor = self.profile.get_device().first_gyro_sensor()

            accel_sensor.set_option(rs.option.enable_motion_correction, True)
            gyro_sensor.set_option(rs.option.enable_motion_correction, True)
        except:
            self.get_logger().info("IMU not available on this device")

        self.get_logger().info("RealSense Physical AI Node Initialized")

    def depth_callback(self, msg):
        """
        Process depth image data
        """
        try:
            # Convert ROS Image to OpenCV
            cv_depth = self.cv_bridge.imgmsg_to_cv2(msg, desired_encoding='16UC1')

            # Process depth data for Physical AI applications
            obstacles = self.detect_obstacles(cv_depth)
            distance_map = self.create_distance_map(cv_depth)

            # Publish processed data
            if obstacles is not None:
                obstacle_img_msg = self.cv_bridge.cv2_to_imgmsg(obstacles, encoding='mono8')
                obstacle_img_msg.header = msg.header
                self.obstacle_publisher.publish(obstacle_img_msg)

        except Exception as e:
            self.get_logger().error(f"Depth callback error: {str(e)}")

    def color_callback(self, msg):
        """
        Process RGB color image data
        """
        try:
            # Convert ROS Image to OpenCV
            cv_color = self.cv_bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Detect humans and objects
            annotated_image = self.detect_and_annotate(cv_color)

            # Publish processed image
            if annotated_image is not None:
                annotated_img_msg = self.cv_bridge.cv2_to_imgmsg(annotated_image, encoding='bgr8')
                annotated_img_msg.header = msg.header
                self.human_detect_publisher.publish(annotated_img_msg)

        except Exception as e:
            self.get_logger().error(f"Color callback error: {str(e)}")

    def imu_callback(self, msg):
        """
        Process IMU data for Physical AI applications
        """
        # Extract orientation and angular velocity
        orientation = msg.orientation
        angular_velocity = msg.angular_velocity
        linear_acceleration = msg.linear_acceleration

        # For humanoid robots, this IMU data is crucial for:
        # - Balance control
        # - Motion planning
        # - State estimation
        # - Fall detection

        # Example: Calculate if robot is tilting excessively
        roll, pitch, yaw = self.quaternion_to_euler(
            orientation.w, orientation.x, orientation.y, orientation.z
        )

        if abs(pitch) > 0.5 or abs(roll) > 0.5:  # 30-degree threshold
            self.get_logger().warn(f"Possibly unstable: Roll={roll:.2f}, Pitch={pitch:.2f}")

    def pointcloud_callback(self, msg):
        """
        Process point cloud data
        """
        # Point cloud processing happens in more complex algorithms
        # that convert 3D point clouds to actionable perception data
        self.get_logger().info(f"Received point cloud: {msg.height} x {msg.width} points")

    def detect_obstacles(self, depth_image):
        """
        Detect obstacles in depth image
        """
        # Convert depth units (typically millimeters)
        # Threshold for obstacle detection (e.g., within 1 meter)
        obstacle_mask = np.where(depth_image > 0,
                                np.where(depth_image < 1000, 255, 0), 0).astype(np.uint8)

        # Apply morphological operations to clean up the mask
        kernel = np.ones((5, 5), np.uint8)
        obstacle_mask = cv2.morphologyEx(obstacle_mask, cv2.MORPH_CLOSE, kernel)

        return obstacle_mask

    def create_distance_map(self, depth_image):
        """
        Create a distance map from depth image
        """
        # Normalize depth values to a visualizable range
        normalized = cv2.normalize(depth_image, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
        return normalized

    def detect_and_annotate(self, color_image):
        """
        Detect humans and objects in RGB image
        """
        # For Physical AI applications, we often need to detect:
        # - Humans and their poses
        # - Objects for manipulation
        # - Surfaces and obstacles

        # Create a copy for annotation
        annotated = color_image.copy()

        # This is where you'd integrate with detection models
        # For example, using OpenVINO, TensorRT, or ROS 2 perception packages
        # For now, we'll just draw a simple annotation

        height, width = color_image.shape[:2]
        center_x, center_y = width // 2, height // 2

        # Draw center crosshair
        cv2.circle(annotated, (center_x, center_y), 10, (0, 255, 0), 2)
        cv2.line(annotated, (center_x-20, center_y), (center_x+20, center_y), (0, 255, 0), 2)
        cv2.line(annotated, (center_x, center_y-20), (center_x, center_y+20), (0, 255, 0), 2)

        return annotated

    def quaternion_to_euler(self, w, x, y, z):
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
            pitch = math.copysign(math.pi / 2, sinp)
        else:
            pitch = math.asin(sinp)

        # Yaw (z-axis rotation)
        siny_cosp = 2 * (w * z + x * y)
        cosy_cosp = 1 - 2 * (y * y + z * z)
        yaw = math.atan2(siny_cosp, cosy_cosp)

        return roll, pitch, yaw

    def run_camera_pipeline(self):
        """
        Run RealSense camera pipeline directly (alternative to ROS topics)
        """
        try:
            # Wait for a coherent pair of frames
            frames = self.pipeline.wait_for_frames()
            depth_frame = frames.get_depth_frame()
            color_frame = frames.get_color_frame()

            if not depth_frame or not color_frame:
                return None

            # Convert to numpy arrays
            depth_image = np.asanyarray(depth_frame.get_data())
            color_image = np.asanyarray(color_frame.get_data())

            # Get camera intrinsic parameters
            depth_intrinsics = depth_frame.profile.as_video_stream_profile().intrinsics

            # Process the frames
            self.process_camera_frames(depth_image, color_image, depth_intrinsics)

            return depth_image, color_image
        except Exception as e:
            self.get_logger().error(f"Pipeline error: {str(e)}")
            return None

    def process_camera_frames(self, depth_image, color_image, intrinsics):
        """
        Process camera frames for Physical AI applications
        """
        # Perform depth processing
        obstacles = self.detect_obstacles(depth_image)
        distance_map = self.create_distance_map(depth_image)

        # Perform color processing
        annotated_image = self.detect_and_annotate(color_image)

        # Combine depth and color information for enhanced perception
        # This could include:
        # - Object pose estimation
        # - Semantic segmentation
        # - Scene understanding
        # - Human-robot interaction cues

        # Publish processed results
        header = self.get_clock().now().to_msg()
        if obstacles is not None:
            obstacle_msg = self.cv_bridge.cv2_to_imgmsg(obstacles, encoding='mono8')
            obstacle_msg.header.stamp = header
            obstacle_msg.header.frame_id = "camera_depth_optical_frame"
            self.obstacle_publisher.publish(obstacle_msg)

        if annotated_image is not None:
            annotated_msg = self.cv_bridge.cv2_to_imgmsg(annotated_image, encoding='bgr8')
            annotated_msg.header.stamp = header
            annotated_msg.header.frame_id = "camera_color_optical_frame"
            self.human_detect_publisher.publish(annotated_msg)

    def destroy_node(self):
        """
        Clean up RealSense pipeline
        """
        self.pipeline.stop()
        super().destroy_node()


def main(args=None):
    rclpy.init(args=args)
    node = RealSensePhysicalAINode()

    try:
        # Spin the node
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Interrupted, stopping pipeline...')
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Advanced Sensor Fusion Techniques

### Combining RealSense with Other Sensors

For Physical AI applications, sensor fusion enhances perception capabilities:

```python
#!/usr/bin/env python3
"""
Advanced sensor fusion for Physical AI applications
"""
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, Imu, PointCloud2, LaserScan
from geometry_msgs.msg import PointStamped, Vector3
from tf2_ros import TransformListener, Buffer
import numpy as np
from scipy.spatial.transform import Rotation as R
import cv2


class SensorFusionNode(Node):
    """
    Node for fusing data from multiple sensors
    """
    def __init__(self):
        super().__init__('sensor_fusion_node')

        # Subscribe to different sensors
        self.realsense_sub = self.create_subscription(
            Image,
            '/camera/aligned_depth_to_color/image_raw',
            self.realsense_callback,
            10
        )

        self.lidar_sub = self.create_subscription(
            LaserScan,
            '/scan',
            self.lidar_callback,
            10
        )

        self.imu_sub = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10
        )

        # Publisher for fused perception
        self.fused_map_pub = self.create_publisher(PointCloud2, '/fused_local_map', 10)

        # TF buffer for coordinate transformations
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)

        # Store latest sensor data
        self.latest_realsense_data = None
        self.latest_lidar_data = None
        self.latest_imu_data = None

        # Synchronization parameters
        self.sync_tolerance = 0.1  # 100ms tolerance

        self.get_logger().info("Sensor Fusion Node Started")

    def realsense_callback(self, msg):
        """
        Handle RealSense data
        """
        self.latest_realsense_data = {
            'timestamp': msg.header.stamp,
            'data': msg
        }

        # Attempt to fuse available data
        self.attempt_fusion()

    def lidar_callback(self, msg):
        """
        Handle LIDAR data
        """
        self.latest_lidar_data = {
            'timestamp': msg.header.stamp,
            'data': msg
        }

        # Attempt to fuse available data
        self.attempt_fusion()

    def imu_callback(self, msg):
        """
        Handle IMU data
        """
        self.latest_imu_data = {
            'timestamp': msg.header.stamp,
            'data': msg
        }

        # Attempt to fuse available data
        self.attempt_fusion()

    def attempt_fusion(self):
        """
        Attempt to fuse sensor data based on timestamps
        """
        if (self.latest_realsense_data and
            self.latest_lidar_data and
            self.latest_imu_data):

            # Check timestamp synchronization
            realsense_ts = self.latest_realsense_data['timestamp']
            lidar_ts = self.latest_lidar_data['timestamp']
            imu_ts = self.latest_imu_data['timestamp']

            # Find oldest and newest timestamps
            timestamps = [realsense_ts, lidar_ts, imu_ts]
            oldest = min(timestamps)
            newest = max(timestamps)

            # Check if timestamps are within tolerance
            time_diff = newest.nanosec - oldest.nanosec
            if time_diff < self.sync_tolerance * 1e9:  # Convert to nanoseconds
                self.perform_sensor_fusion(
                    self.latest_realsense_data['data'],
                    self.latest_lidar_data['data'],
                    self.latest_imu_data['data']
                )
            else:
                # Data is not synchronized, skip fusion
                self.get_logger().warn("Sensor data not synchronized for fusion")

    def perform_sensor_fusion(self, realsense_data, lidar_data, imu_data):
        """
        Perform actual sensor fusion
        """
        self.get_logger().info("Performing sensor fusion...")

        # Convert RealSense depth to point cloud in camera frame
        depth_image = self.cv_bridge.imgmsg_to_cv2(realsense_data, "16UC1")
        camera_intrinsics = self.get_camera_intrinsics()  # Would get from camera_info

        # Create point cloud from depth image
        points_3d = self.depth_to_point_cloud(depth_image, camera_intrinsics)

        # Transform points to robot base frame
        transformed_points = self.transform_points_to_base_frame(points_3d, realsense_data.header.frame_id)

        # Incorporate LIDAR data
        lidar_points = self.laser_scan_to_point_cloud(lidar_data)

        # Fuse IMU data for orientation
        orientation = self.extract_orientation_from_imu(imu_data)

        # Combine all sensor data into unified perception
        fused_perception = self.combine_sensor_data(transformed_points, lidar_points, orientation)

        # Publish fused perception result
        self.publish_fused_perception(fused_perception)

    def depth_to_point_cloud(self, depth_image, intrinsics):
        """
        Convert depth image to 3D points
        """
        height, width = depth_image.shape

        # Create coordinate grids
        u_coords, v_coords = np.meshgrid(np.arange(width), np.arange(height))

        # Calculate 3D coordinates
        z = depth_image.astype(np.float32) / 1000.0  # Convert from mm to meters
        x = (u_coords - intrinsics['ppx']) * z / intrinsics['fx']
        y = (v_coords - intrinsics['ppy']) * z / intrinsics['fy']

        # Stack into point cloud
        points = np.stack([x, y, z], axis=-1)

        # Remove invalid points (where depth is 0)
        valid_mask = z > 0
        valid_points = points[valid_mask]

        return valid_points

    def transform_points_to_base_frame(self, points_3d, camera_frame):
        """
        Transform points from camera frame to robot base frame
        """
        try:
            # Lookup transform from camera frame to base frame
            transform = self.tf_buffer.lookup_transform(
                'base_link',  # Target frame
                camera_frame,  # Source frame
                rclpy.time.Time()  # Use latest available
            )

            # Extract transformation matrix
            t = transform.transform.translation
            r = transform.transform.rotation

            # Create transformation matrix
            trans_matrix = np.eye(4)
            trans_matrix[0:3, 3] = [t.x, t.y, t.z]

            # Convert quaternion to rotation matrix
            rot = R.from_quat([r.x, r.y, r.z, r.w]).as_matrix()
            trans_matrix[0:3, 0:3] = rot

            # Transform points
            homogeneous_points = np.hstack([points_3d, np.ones((points_3d.shape[0], 1))])
            transformed_homo = homogeneous_points @ trans_matrix.T
            transformed_points = transformed_homo[:, 0:3]

            return transformed_points

        except Exception as e:
            self.get_logger().error(f"Transform lookup failed: {str(e)}")
            return points_3d  # Return original points if transform unavailable

    def laser_scan_to_point_cloud(self, laser_scan):
        """
        Convert LaserScan message to point cloud
        """
        ranges = np.array(laser_scan.ranges)
        angles = np.linspace(
            laser_scan.angle_min,
            laser_scan.angle_max,
            len(ranges)
        )

        # Filter out invalid ranges
        valid_indices = np.isfinite(ranges) & (ranges >= laser_scan.range_min) & (ranges <= laser_scan.range_max)
        valid_ranges = ranges[valid_indices]
        valid_angles = angles[valid_indices]

        # Convert to Cartesian coordinates
        x = valid_ranges * np.cos(valid_angles)
        y = valid_ranges * np.sin(valid_angles)
        z = np.zeros_like(x)  # LIDAR is typically 2D

        points_2d = np.column_stack([x, y, z])
        return points_2d

    def extract_orientation_from_imu(self, imu_msg):
        """
        Extract orientation from IMU message
        """
        orientation = {
            'w': imu_msg.orientation.w,
            'x': imu_msg.orientation.x,
            'y': imu_msg.orientation.y,
            'z': imu_msg.orientation.z
        }
        return orientation

    def combine_sensor_data(self, camera_points, lidar_points, orientation):
        """
        Combine different sensor modalities into unified perception
        """
        # Create a unified point cloud from both sensors
        fused_points = np.vstack([camera_points, lidar_points])

        # Apply IMU-based orientation correction if needed
        # This would involve rotating point clouds based on IMU orientation

        perception_result = {
            'points': fused_points,
            'orientation': orientation,
            'timestamp': self.get_clock().now().to_msg()
        }

        return perception_result

    def publish_fused_perception(self, fused_data):
        """
        Publish the fused perception result
        """
        # Convert to ROS message format
        # This is a simplified implementation - in practice,
        # you'd convert the numpy array to a PointCloud2 message

        # For now, just log the information
        self.get_logger().info(f"Fused perception: {len(fused_data['points'])} points")

    def get_camera_intrinsics(self):
        """
        Would normally fetch from camera_info topic
        """
        # Mock intrinsics for example - would get from camera_info in practice
        return {
            'fx': 616.0703125,
            'fy': 615.720703125,
            'ppx': 313.0850830078125,
            'ppy': 242.03424072265625
        }


def main(args=None):
    rclpy.init(args=args)
    node = SensorFusionNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Stopping sensor fusion node...')
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## RealSense in Humanoid Robotics Applications

### Humanoid Vision Pipeline

RealSense cameras are particularly valuable for humanoid robots due to their compact size and comprehensive sensing capabilities:

```python
#!/usr/bin/env python3
"""
Vision pipeline for humanoid robots using RealSense
"""
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, PointCloud2
from geometry_msgs.msg import PoseStamped
from visualization_msgs.msg import Marker, MarkerArray
from std_msgs.msg import Header
from cv_bridge import CvBridge
import numpy as np
import cv2
from scipy.spatial import distance


class HumanoidVisionPipeline(Node):
    """
    Perception pipeline for humanoid robotics using RealSense
    """
    def __init__(self):
        super().__init__('humanoid_vision_pipeline')

        # Subscriptions
        self.color_sub = self.create_subscription(
            Image,
            '/camera/color/image_raw',
            self.color_callback,
            10
        )

        self.depth_sub = self.create_subscription(
            Image,
            '/camera/aligned_depth_to_color/image_raw',
            self.depth_callback,
            10
        )

        # Publishers
        self.human_pose_pub = self.create_publisher(PoseStamped, '/detected_human_pose', 10)
        self.object_markers_pub = self.create_publisher(MarkerArray, '/detected_objects', 10)
        self.gaze_target_pub = self.create_publisher(PoseStamped, '/gaze_target', 10)

        # CV Bridge
        self.cv_bridge = CvBridge()

        # Initialize OpenVINO or other detection models
        # For this example, we'll use basic computer vision techniques
        self.human_classifier = self.initialize_human_classifier()

        self.get_logger().info("Humanoid Vision Pipeline Initialized")

    def initialize_human_classifier(self):
        """
        Initialize human detection classifier
        """
        # Would normally load a pre-trained model here
        # For this example, we'll use Haar cascades as a placeholder
        return cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_fullbody.xml')

    def color_callback(self, msg):
        """
        Process color image for human/object detection
        """
        try:
            img = self.cv_bridge.imgmsg_to_cv2(msg, 'bgr8')

            # Detect humans in the image
            humans = self.detect_humans(img)

            if len(humans) > 0:
                # Process detected humans
                for (x, y, w, h) in humans:
                    # Calculate approximate 3D position using depth
                    center_x, center_y = x + w//2, y + h//2
                    depth_val = self.get_depth_at_pixel(center_x, center_y)

                    if depth_val > 0:
                        # Convert pixel coordinates to 3D world coordinates
                        world_pos = self.pixel_to_world_coordinates(
                            center_x, center_y, depth_val, msg.header.frame_id
                        )

                        # Publish human pose
                        human_pose = PoseStamped()
                        human_pose.header = msg.header
                        human_pose.pose.position.x = world_pos[0]
                        human_pose.pose.position.y = world_pos[1]
                        human_pose.pose.position.z = world_pos[2]
                        human_pose.pose.orientation.w = 1.0  # No rotation for basic detection

                        self.human_pose_publisher.publish(human_pose)

                        # Determine if this is a good gaze target
                        if self.is_good_gaze_target(human_pose.pose):
                            self.publish_gaze_target(human_pose.pose, msg.header)

            # Detect other objects using different techniques
            objects = self.detect_objects(img)
            self.publish_object_markers(objects, msg.header)

        except Exception as e:
            self.get_logger().error(f"Color callback error: {str(e)}")

    def depth_callback(self, msg):
        """
        Process depth image for 3D reconstruction and obstacle detection
        """
        try:
            depth_img = self.cv_bridge.imgmsg_to_cv2(msg, '16UC1')

            # Detect surfaces and obstacles
            obstacles = self.detect_obstacles_3d(depth_img)

            # Update internal environment model
            self.update_environment_model(obstacles, msg.header)

        except Exception as e:
            self.get_logger().error(f"Depth callback error: {str(e)}")

    def detect_humans(self, image):
        """
        Detect humans in the image
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Detect humans using classifier
        humans = self.human_classifier.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=3,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )

        return humans

    def detect_objects(self, image):
        """
        Detect objects using color-based or feature-based methods
        """
        # Convert to HSV for better color-based detection
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

        # Define color ranges for common object types
        color_ranges = {
            'red': ([0, 50, 50], [10, 255, 255]),
            'blue': ([100, 50, 50], [130, 255, 255]),
            'green': ([40, 50, 50], [80, 255, 255])
        }

        objects = []

        for color_name, (lower, upper) in color_ranges.items():
            # Create mask for this color
            lower = np.array(lower)
            upper = np.array(upper)
            mask = cv2.inRange(hsv, lower, upper)

            # Find contours of this color
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            for contour in contours:
                # Filter by size to avoid tiny detections
                area = cv2.contourArea(contour)
                if area > 1000:  # Minimum area threshold
                    # Get bounding rectangle
                    x, y, w, h = cv2.boundingRect(contour)

                    object_info = {
                        'color': color_name,
                        'bbox': (x, y, w, h),
                        'area': area,
                        'center': (x + w//2, y + h//2)
                    }

                    objects.append(object_info)

        return objects

    def get_depth_at_pixel(self, u, v):
        """
        Get depth value at specific pixel (from latest depth image)
        """
        if hasattr(self, 'latest_depth_image'):
            if 0 <= u < self.latest_depth_image.shape[1] and 0 <= v < self.latest_depth_image.shape[0]:
                depth_value = self.latest_depth_image[v, u]
                # Convert from millimeters to meters if needed
                return float(depth_value) / 1000.0  # Convert mm to meters

        return 0.0

    def pixel_to_world_coordinates(self, u, v, depth, camera_frame):
        """
        Convert pixel coordinates + depth to world coordinates
        """
        # Would normally use camera intrinsic parameters from camera_info topic
        # For this example, using mock values
        fx, fy = 616.07, 615.72  # Focal lengths (from D435i)
        cx, cy = 313.09, 242.03  # Principal points (from D435i)

        # Convert to 3D camera coordinates
        x_cam = (u - cx) * depth / fx
        y_cam = (v - cy) * depth / fy
        z_cam = depth

        # Transform to world/base coordinates
        # This would require TF transform from camera frame to base/world frame
        # For now, assuming camera frame is close to base frame

        return (x_cam, y_cam, z_cam)

    def update_environment_model(self, obstacles, header):
        """
        Update internal environment model with obstacles
        """
        # This would maintain a 3D occupancy grid or other environment representation
        # For this example, just log the detection
        self.get_logger().info(f"Detected {len(obstacles)} obstacles in environment")

    def publish_object_markers(self, objects, header):
        """
        Publish detected objects as visualization markers
        """
        marker_array = MarkerArray()

        for i, obj in enumerate(objects):
            marker = Marker()
            marker.header = header
            marker.ns = "detected_objects"
            marker.id = i
            marker.type = Marker.CUBE
            marker.action = Marker.ADD

            # Set position based on object center and depth
            center_x, center_y = obj['center']
            depth = self.get_depth_at_pixel(center_x, center_y)
            world_pos = self.pixel_to_world_coordinates(center_x, center_y, depth, header.frame_id)

            marker.pose.position.x = world_pos[0]
            marker.pose.position.y = world_pos[1]
            marker.pose.position.z = world_pos[2]
            marker.pose.orientation.w = 1.0

            # Set size based on object area
            size_factor = min(obj['area'] / 10000.0, 0.5)  # Cap at 0.5m
            marker.scale.x = size_factor
            marker.scale.y = size_factor
            marker.scale.z = 0.1  # Fixed height for ground-level objects

            # Set color based on detected color
            color_map = {
                'red': (1.0, 0.0, 0.0, 1.0),
                'blue': (0.0, 0.0, 1.0, 1.0),
                'green': (0.0, 1.0, 0.0, 1.0)
            }

            r, g, b, a = color_map.get(obj['color'], (1.0, 1.0, 1.0, 1.0))
            marker.color.r = r
            marker.color.g = g
            marker.color.b = b
            marker.color.a = a

            marker.text = f"{obj['color']} object"

            marker_array.markers.append(marker)

        self.object_markers_publisher.publish(marker_array)

    def is_good_gaze_target(self, pose):
        """
        Determine if a pose makes a good gaze target for the humanoid
        """
        # Check if within reasonable distance (not too close or far)
        dist = np.sqrt(pose.position.x**2 + pose.position.y**2 + pose.position.z**2)

        if 0.5 <= dist <= 5.0:  # Between 0.5m and 5m
            return True
        return False

    def publish_gaze_target(self, pose, header):
        """
        Publish a gaze target for the humanoid robot's head movement
        """
        gaze_target = PoseStamped()
        gaze_target.header = header
        gaze_target.pose = pose  # Copy the pose

        self.gaze_target_publisher.publish(gaze_target)

    def depth_callback(self, msg):
        """
        Store the latest depth image for use in other callbacks
        """
        try:
            self.latest_depth_image = self.cv_bridge.imgmsg_to_cv2(msg, '16UC1')
        except Exception as e:
            self.get_logger().error(f"Depth image conversion error: {str(e)}")


def main(args=None):
    rclpy.init(args=args)
    node = HumanoidVisionPipeline()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Shutting down humanoid vision pipeline...')
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Integration with Isaac ROS

Isaac ROS provides optimized perception pipelines for NVIDIA hardware:

```python
#!/usr/bin/env python3
"""
Isaac ROS integration for optimized RealSense processing
"""
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, CameraInfo
from isaac_ros_managed_nitros.types import (
    ImageType,
    CameraInfoType,
    NitrosType
)
from isaac_ros_visual_slam_interfaces.msg import IsaacSlamOut


class IsaacROSRealSenseNode(Node):
    """
    Node for integrating RealSense with Isaac ROS pipelines
    """
    def __init__(self):
        super().__init__('isaac_ros_realsense_node')

        # Isaac ROS provides optimized processing pipelines
        # for tasks like visual slam, object detection, etc.

        # For visual SLAM
        self.vslam_sub = self.create_subscription(
            IsaacSlamOut,
            '/visual_slam/trajectory_pose',
            self.vslam_callback,
            10
        )

        # For stereo processing
        self.left_image_sub = self.create_subscription(
            Image,
            '/camera/infra1/image_rect_raw',
            self.left_image_callback,
            10
        )

        self.right_image_sub = self.create_subscription(
            Image,
            '/camera/infra2/image_rect_raw',
            self.right_image_callback,
            10
        )

        # For camera info
        self.camera_info_sub = self.create_subscription(
            CameraInfo,
            '/camera/infra1/camera_info',
            self.camera_info_callback,
            10
        )

        self.get_logger().info("Isaac ROS RealSense Node Initialized")

    def vslam_callback(self, msg):
        """
        Handle visual SLAM output
        """
        # Extract pose information from VSLAM
        position = msg.pose.pose.position
        orientation = msg.pose.pose.orientation

        self.get_logger().info(
            f"VSLAM Pose: ({position.x:.2f}, {position.y:.2f}, {position.z:.2f})"
        )

        # In a Physical AI system, this pose would be used for:
        # - Navigation planning
        # - Mapping
        # - Localization
        # - Path following

    def left_image_callback(self, msg):
        """
        Handle left infra image for stereo processing
        """
        # Isaac ROS stereo pipelines can process these images efficiently
        pass

    def right_image_callback(self, msg):
        """
        Handle right infra image for stereo processing
        """
        # Isaac ROS stereo pipelines can process these images efficiently
        pass

    def camera_info_callback(self, msg):
        """
        Handle camera intrinsic parameters
        """
        # Store camera parameters for 3D reconstruction
        self.fx = msg.k[0]  # Horizontal focal length
        self.fy = msg.k[4]  # Vertical focal length
        self.cx = msg.k[2]  # Principal point X
        self.cy = msg.k[5]  # Principal point Y


def main(args=None):
    rclpy.init(args=args)
    node = IsaacROSRealSenseNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Shutting down Isaac ROS RealSense node...')
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Troubleshooting Common Issues

### RealSense Troubleshooting

```bash
# 1. Check camera connection
rs-enumerate-devices

# 2. Check USB bandwidth issues (common with multiple cameras)
dmesg | grep -i usb

# 3. Verify permissions (on Linux)
sudo chmod a+rw /dev/bus/usb/*/*

# 4. Check camera calibration
roslaunch realsense2_camera rs_camera.launch
rosrun camera_calibration cameracalibrator.py --size 8x6 --square 0.108 image:=/camera/color/image_raw camera:=/camera/color

# 5. Monitor topics
rostopic echo /camera/color/image_raw
rostopic echo /camera/depth/image_rect_raw
rostopic echo /camera/imu
```

### Performance Optimization

```python
# Optimize for real-time performance
class OptimizedRealSenseNode(Node):
    """
    Optimized RealSense processing for real-time Physical AI applications
    """
    def __init__(self):
        super().__init__('optimized_realsense_node')

        # Use small queues for real-time processing
        self.color_sub = self.create_subscription(
            Image,
            '/camera/color/image_raw',
            self.color_callback,
            1  # Small queue to avoid lag
        )

        # Process every nth frame to reduce computation
        self.frame_counter = 0
        self.process_every_n_frames = 2  # Process every 2nd frame

        # Use threading for heavy processing
        import threading
        self.processing_thread = None
        self.new_image_available = threading.Condition()
        self.current_image = None

    def color_callback(self, msg):
        """
        Optimize callback for real-time performance
        """
        self.frame_counter += 1

        if self.frame_counter % self.process_every_n_frames != 0:
            return  # Skip this frame

        # Store image for processing in separate thread
        with self.new_image_available:
            self.current_image = msg
            self.new_image_available.notify()

        # Start processing thread if not already running
        if self.processing_thread is None or not self.processing_thread.is_alive():
            self.processing_thread = threading.Thread(target=self.process_image_in_background)
            self.processing_thread.start()

    def process_image_in_background(self):
        """
        Process image in background thread to avoid blocking
        """
        with self.new_image_available:
            if self.current_image is not None:
                # Do heavy processing here
                processed_result = self.heavy_image_processing(self.current_image)

                # Publish results back on main thread
                # (would use timer or other mechanism to schedule)
                self.get_logger().info("Image processing completed in background thread")
```

## Best Practices for Physical AI Perception

1. **Redundancy**: Use multiple sensors to increase reliability
2. **Real-time constraints**: Optimize for your application's latency requirements
3. **Calibration**: Regularly calibrate sensors for accurate measurements
4. **Filtering**: Apply appropriate filtering to reduce sensor noise
5. **Validation**: Validate perception outputs before using in control systems

## Conclusion

Intel RealSense cameras provide sophisticated 3D perception capabilities that are essential for Physical AI and humanoid robotics applications. Their combination of RGB, depth, and IMU data in a compact form factor makes them particularly suitable for mobile robots.

Key takeaways for Physical AI applications:
- RealSense D435i provides RGB, depth, and IMU in a single unit
- Proper calibration is essential for accurate measurements
- Sensor fusion combines multiple modalities for robust perception
- Optimizations are necessary for real-time performance
- Isaac ROS provides accelerated processing for NVIDIA platforms

In the next chapter, we'll explore Isaac ROS visual SLAM pipelines in detail, building on the sensor foundation established here.