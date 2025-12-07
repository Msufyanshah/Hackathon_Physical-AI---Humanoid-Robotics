---
sidebar_position: 3
title: '3D Vision Fusion'
---

# 3D Vision Fusion: Creating Comprehensive Spatial Awareness for Physical AI

## Introduction to 3D Vision Fusion

3D vision fusion represents a critical technology in Physical AI and humanoid robotics, combining multiple sensors and data sources to create a comprehensive understanding of the three-dimensional environment. Unlike traditional 2D computer vision approaches, 3D vision fusion provides depth, spatial relationships, and volumetric understanding essential for robots that must physically interact with their environment.

This chapter explores the principles, techniques, and implementation of 3D vision fusion systems in the context of Physical AI applications, focusing on sensors like RGB-D cameras, LiDAR, stereo vision, and how to combine their data effectively.

## 3D Vision Fundamentals

### Depth Perception Modalities

Physical AI systems utilize several approaches to obtain depth information:

1. **Stereo Vision**: Uses two cameras to triangulate depth based on parallax
2. **Structured Light**: Projects known patterns and analyzes deformation
3. **Time-of-Flight (ToF)**: Measures light travel time to infer distances
4. **LiDAR**: Uses laser pulses to measure distances with high precision
5. **Monocular Depth Estimation**: Uses single camera with learned priors

### Coordinate Systems in 3D Vision

Understanding coordinate transformations is essential for 3D vision fusion:

```bash
# ROS 2 coordinate frames for 3D vision pipeline
base_link          # Robot's base coordinate frame
├── camera_link    # Camera mounting point
│   ├── camera_optical_frame  # Camera optical center (Z-forward convention)
│   ├── depth_frame          # Depth sensor frame (if different from RGB)
│   └── infrared_frame       # Infrared sensor frame (if applicable)
├── lidar_link     # LiDAR mounting point
└── imu_link       # Inertial measurement unit frame
```

### Point Cloud Representation

Point clouds are the standard representation for 3D spatial data:

```python
#!/usr/bin/env python3
"""
Understanding point cloud representations in Physical AI
"""
import numpy as np
import struct
from sensor_msgs.msg import PointCloud2, PointField
import sensor_msgs.point_cloud2 as pc2
from std_msgs.msg import Header


class PointCloudProcessor:
    """
    Utilities for processing point cloud data in 3D vision fusion
    """
    def __init__(self):
        self.fields = [
            PointField(name='x', offset=0, datatype=PointField.FLOAT32, count=1),
            PointField(name='y', offset=4, datatype=PointField.FLOAT32, count=1),
            PointField(name='z', offset=8, datatype=PointField.FLOAT32, count=1),
            PointField(name='rgb', offset=12, datatype=PointField.UINT32, count=1),  # Optional
        ]

    def create_point_cloud_msg(self, points_3d, rgb_colors=None, frame_id="camera_depth_optical_frame"):
        """
        Create PointCloud2 message from 3D points
        """
        header = Header()
        header.stamp = self.get_clock().now().to_msg()
        header.frame_id = frame_id

        # Prepare point cloud data
        cloud_points = []
        for i, point in enumerate(points_3d):
            if rgb_colors is not None:
                # Pack RGB into single UINT32
                r, g, b = rgb_colors[i]
                rgb_uint32 = struct.unpack('I', struct.pack('BBBB', b, g, r, 0))[0]
                cloud_points.append([point[0], point[1], point[2], rgb_uint32])
            else:
                cloud_points.append([point[0], point[1], point[2]])

        # Create PointCloud2 message
        cloud_msg = PointCloud2()
        cloud_msg.header = header
        cloud_msg.height = 1
        cloud_msg.width = len(cloud_points)
        cloud_msg.is_dense = False
        cloud_msg.is_bigendian = False
        cloud_msg.fields = self.fields
        cloud_msg.point_step = 16  # 4 floats * 4 bytes each
        cloud_msg.row_step = cloud_msg.point_step * cloud_msg.width

        # Pack the data
        buffer = []
        for point in cloud_points:
            for value in point:
                buffer.append(struct.pack('f', value))

        cloud_msg.data = b''.join(buffer)
        return cloud_msg

    def convert_depth_image_to_pointcloud(self, depth_image, camera_info):
        """
        Convert depth image to point cloud
        """
        # Get camera intrinsic parameters
        fx = camera_info.k[0]  # Focal length x
        fy = camera_info.k[4]  # Focal length y
        cx = camera_info.k[2]  # Principal point x
        cy = camera_info.k[5]  # Principal point y

        height, width = depth_image.shape

        # Create coordinate grids
        u_coords, v_coords = np.meshgrid(np.arange(width), np.arange(height))

        # Calculate 3D coordinates
        z = depth_image.astype(np.float32) / 1000.0  # Convert from mm to meters
        x = (u_coords - cx) * z / fx
        y = (v_coords - cy) * z / fy

        # Stack into point cloud
        points = np.stack([x, y, z], axis=-1)

        # Remove invalid points (where depth is 0 or too large)
        valid_mask = (z > 0.1) & (z < 10.0)  # Valid range: 0.1m to 10m
        valid_points = points[valid_mask]

        return valid_points

    def downsample_pointcloud(self, points, voxel_size=0.01):
        """
        Downsample point cloud using voxel grid filter
        """
        # Create voxel grid
        min_bound = np.min(points, axis=0)
        max_bound = np.max(points, axis=0)

        # Calculate voxel indices
        voxel_indices = np.floor((points - min_bound) / voxel_size).astype(int)

        # Group points by voxel
        unique_voxels, indices = np.unique(voxel_indices, axis=0, return_index=True)

        # Return representative points for each voxel
        downsampled_points = points[indices]
        return downsampled_points

    def filter_ground_points(self, points, ground_threshold=0.1):
        """
        Filter out ground points from point cloud
        """
        # Simple height-based ground filtering (in robot's coordinate system)
        # Assuming robot's base is at z=0 and ground is slightly below
        ground_points = points[points[:, 2] < ground_threshold]  # Points below threshold
        object_points = points[points[:, 2] >= ground_threshold]  # Points above threshold

        return object_points, ground_points

    def cluster_objects_in_pointcloud(self, points):
        """
        Simple clustering to identify distinct objects
        """
        from sklearn.cluster import DBSCAN

        # Use DBSCAN for clustering
        clustering = DBSCAN(eps=0.1, min_samples=10)  # 10cm distance, 10 points minimum
        labels = clustering.fit_predict(points)

        # Group points by cluster
        clusters = {}
        for label in np.unique(labels):
            if label == -1:  # Noise points
                continue
            clusters[label] = points[labels == label]

        return clusters, labels


def main(args=None):
    rclpy.init(args=args)
    processor = PointCloudProcessor()

    # Example usage would be in a callback
    print("Point cloud processor initialized")

    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Sensor Fusion Techniques for Physical AI

### Multi-Sensor Data Integration

Effective 3D vision fusion combines data from multiple sensors:

```python
#!/usr/bin/env python3
"""
Multi-sensor fusion for 3D vision in Physical AI
"""
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import PointCloud2, Image, CameraInfo, LaserScan
from geometry_msgs.msg import PointStamped, TransformStamped
from tf2_ros import TransformBuffer, TransformListener
from visualization_msgs.msg import MarkerArray
import numpy as np
from scipy.spatial import cKDTree


class MultiSensorFusionNode(Node):
    """
    Fuses RGB-D, LiDAR, and IMU data for comprehensive 3D understanding
    """
    def __init__(self):
        super().__init__('multi_sensor_fusion')

        # Subscriptions for different sensors
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

        self.camera_info_sub = self.create_subscription(
            CameraInfo,
            '/camera/depth/camera_info',
            self.camera_info_callback,
            10
        )

        self.lidar_sub = self.create_subscription(
            PointCloud2,
            '/lidar_points',
            self.lidar_callback,
            10
        )

        self.imu_sub = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10
        )

        # Publishers for fused data
        self.fused_cloud_pub = self.create_publisher(PointCloud2, '/fused_point_cloud', 10)
        self.environment_map_pub = self.create_publisher(PointCloud2, '/environment_map', 10)
        self.object_markers_pub = self.create_publisher(MarkerArray, '/fused_objects', 10)

        # TF for coordinate transformations
        self.tf_buffer = TransformBuffer(self.get_clock())
        self.tf_listener = TransformListener(self.tf_buffer, self)

        # Storage for sensor data
        self.latest_depth = None
        self.latest_color = None
        self.latest_lidar = None
        self.camera_info = None
        self.latest_imu = None

        # Synchronization parameters
        self.sync_timeout = 0.1  # 100ms sync tolerance
        self.fusion_frequency = 10.0  # Hz

        self.get_logger().info("Multi-Sensor Fusion Node Initialized")

    def depth_callback(self, msg):
        """
        Handle depth image from RGB-D camera
        """
        self.latest_depth = msg
        self.attempt_fusion()

    def color_callback(self, msg):
        """
        Handle color image for RGB-D fusion
        """
        self.latest_color = msg
        self.attempt_fusion()

    def camera_info_callback(self, msg):
        """
        Store camera intrinsic parameters
        """
        self.camera_info = msg

    def lidar_callback(self, msg):
        """
        Handle LiDAR point cloud
        """
        self.latest_lidar = msg
        self.attempt_fusion()

    def imu_callback(self, msg):
        """
        Handle IMU data for motion compensation
        """
        self.latest_imu = msg

    def attempt_fusion(self):
        """
        Attempt to fuse available sensor data if all required data is available
        """
        if (self.latest_depth is not None and
            self.latest_color is not None and
            self.camera_info is not None and
            self.latest_lidar is not None):

            # Transform LiDAR points to camera frame
            lidar_points = self.pointcloud2_to_array(self.latest_lidar)
            lidar_in_camera_frame = self.transform_points_to_frame(
                lidar_points,
                self.latest_lidar.header.frame_id,
                self.latest_depth.header.frame_id
            )

            # Convert depth to point cloud
            depth_points = self.depth_image_to_pointcloud(
                self.latest_depth,
                self.camera_info
            )

            # Merge RGB-D and LiDAR point clouds
            merged_cloud = self.merge_pointclouds(depth_points, lidar_in_camera_frame)

            # Apply motion compensation if IMU data is available
            if self.latest_imu is not None:
                merged_cloud = self.compensate_motion(merged_cloud, self.latest_imu)

            # Publish fused results
            fused_msg = self.array_to_pointcloud2(merged_cloud, self.latest_depth.header)
            self.fused_cloud_publisher.publish(fused_msg)

            # Process for environment understanding
            self.process_environment_map(merged_cloud)

            # Reset processed flags
            self.latest_depth = None
            self.latest_lidar = None

    def depth_image_to_pointcloud(self, depth_msg, camera_info):
        """
        Convert depth image to 3D point cloud
        """
        # Convert ROS Image to NumPy array
        depth_image = self.cv_bridge.imgmsg_to_cv2(depth_msg, '16UC1')

        # Get camera parameters
        fx, fy = camera_info.k[0], camera_info.k[4]
        cx, cy = camera_info.k[2], camera_info.k[5]

        # Create coordinate grids
        height, width = depth_image.shape
        u_coords, v_coords = np.meshgrid(np.arange(width), np.arange(height))

        # Calculate 3D coordinates
        z = depth_image.astype(np.float32) / 1000.0  # Convert from mm to meters
        x = (u_coords - cx) * z / fx
        y = (v_coords - cy) * z / fy

        # Stack into point cloud (filter out invalid points)
        points_3d = np.stack([x.flatten(), y.flatten(), z.flatten()], axis=-1)
        valid_points = points_3d[(z.flatten() > 0.1) & (z.flatten() < 10.0)]  # Filter valid depths

        return valid_points

    def pointcloud2_to_array(self, cloud_msg):
        """
        Convert PointCloud2 message to NumPy array
        """
        points_list = []
        for point in pc2.read_points(cloud_msg, field_names=("x", "y", "z"), skip_nans=True):
            points_list.append([point[0], point[1], point[2]])

        return np.array(points_list)

    def array_to_pointcloud2(self, points_array, header):
        """
        Convert NumPy array to PointCloud2 message
        """
        # Create PointField definitions
        fields = [
            PointField(name='x', offset=0, datatype=PointField.FLOAT32, count=1),
            PointField(name='y', offset=4, datatype=PointField.FLOAT32, count=1),
            PointField(name='z', offset=8, datatype=PointField.FLOAT32, count=1)
        ]

        # Prepare data
        data = []
        for point in points_array:
            data.extend([point[0], point[1], point[2]])

        # Create PointCloud2 message
        cloud_msg = PointCloud2()
        cloud_msg.header = header
        cloud_msg.height = 1
        cloud_msg.width = len(points_array)
        cloud_msg.fields = fields
        cloud_msg.is_bigendian = False
        cloud_msg.point_step = 12  # 3 * sizeof(float)
        cloud_msg.row_step = cloud_msg.point_step * cloud_msg.width
        cloud_msg.data = np.asarray(data, dtype=np.float32).tobytes()

        return cloud_msg

    def transform_points_to_frame(self, points, from_frame, to_frame):
        """
        Transform points from one frame to another using TF
        """
        try:
            # Lookup transform
            transform = self.tf_buffer.lookup_transform(
                to_frame, from_frame, rclpy.time.Time()
            )

            # Extract transformation matrix
            t = transform.transform.translation
            r = transform.transform.rotation

            # Create transformation matrix
            T = np.eye(4)
            T[0:3, 3] = [t.x, t.y, t.z]

            # Convert quaternion to rotation matrix
            import tf_transformations
            rotation_matrix = tf_transformations.quaternion_matrix([r.x, r.y, r.z, r.w])
            T[0:3, 0:3] = rotation_matrix[0:3, 0:3]

            # Apply transformation
            homogeneous_points = np.hstack([points, np.ones((len(points), 1))])
            transformed_homo = homogeneous_points @ T.T
            transformed_points = transformed_homo[:, 0:3]

            return transformed_points

        except Exception as e:
            self.get_logger().warn(f"Transform lookup failed: {str(e)}")
            return points  # Return original points if transform unavailable

    def merge_pointclouds(self, cloud1, cloud2, max_distance=0.02):
        """
        Merge two point clouds intelligently, avoiding duplicate points
        """
        # Use KD-tree for efficient nearest neighbor search
        tree1 = cKDTree(cloud1)
        tree2 = cKDTree(cloud2)

        # Find points in cloud2 that are far from cloud1
        distances, _ = tree1.query(cloud2)
        cloud2_unique = cloud2[distances > max_distance]  # Only keep points far from cloud1

        # Merge unique points from both clouds
        merged_cloud = np.vstack([cloud1, cloud2_unique])

        return merged_cloud

    def compensate_motion(self, points, imu_data):
        """
        Compensate for robot motion during point cloud acquisition
        """
        # This would use IMU data to correct for motion during scanning
        # For this example, we'll skip detailed motion compensation
        # but note that this is crucial for moving robots
        return points

    def process_environment_map(self, fused_cloud):
        """
        Process fused point cloud for environment understanding
        """
        # Segment the environment into different components
        ground_points, object_points = self.segment_ground(fused_cloud)

        # Cluster objects
        clusters, labels = self.cluster_objects(object_points)

        # Analyze each cluster for object properties
        environment_objects = []
        for cluster_label in np.unique(labels):
            if cluster_label == -1:  # Noise
                continue

            cluster_points = object_points[labels == cluster_label]
            object_properties = self.analyze_object_properties(cluster_points)
            environment_objects.append(object_properties)

        # Publish environment map
        env_map_msg = self.array_to_pointcloud2(ground_points, Header(frame_id="map"))
        self.environment_map_publisher.publish(env_map_msg)

        # Publish object markers for visualization
        self.publish_object_markers(environment_objects)

    def segment_ground(self, points, ground_threshold=0.1):
        """
        Segment ground from point cloud using height-based filtering
        """
        # More sophisticated ground segmentation would use RANSAC or plane fitting
        ground_mask = points[:, 2] < ground_threshold
        ground_points = points[ground_mask]
        object_points = points[~ground_mask]

        return ground_points, object_points

    def cluster_objects(self, points, eps=0.1, min_samples=20):
        """
        Cluster points into distinct objects using DBSCAN
        """
        from sklearn.cluster import DBSCAN

        clustering = DBSCAN(eps=eps, min_samples=min_samples)
        labels = clustering.fit_predict(points)

        return labels

    def analyze_object_properties(self, points):
        """
        Analyze properties of an object cluster
        """
        # Calculate bounding box
        min_pt = np.min(points, axis=0)
        max_pt = np.max(points, axis=0)
        center = np.mean(points, axis=0)
        dimensions = max_pt - min_pt

        # Calculate volume approximation
        volume = np.prod(dimensions) if len(points) > 0 else 0

        # Calculate centroid
        centroid = np.mean(points, axis=0)

        return {
            'centroid': centroid,
            'dimensions': dimensions,
            'volume': volume,
            'point_count': len(points)
        }

    def publish_object_markers(self, objects):
        """
        Publish object markers for visualization
        """
        marker_array = MarkerArray()

        for i, obj in enumerate(objects):
            marker = Marker()
            marker.header.frame_id = "map"
            marker.header.stamp = self.get_clock().now().to_msg()
            marker.ns = "fused_objects"
            marker.id = i
            marker.type = Marker.CUBE
            marker.action = Marker.ADD

            # Set position to object centroid
            marker.pose.position.x = obj['centroid'][0]
            marker.pose.position.y = obj['centroid'][1]
            marker.pose.position.z = obj['centroid'][2] + obj['dimensions'][2]/2  # Center + half height
            marker.pose.orientation.w = 1.0

            # Set dimensions
            marker.scale.x = max(0.1, obj['dimensions'][0])  # Minimum size for visibility
            marker.scale.y = max(0.1, obj['dimensions'][1])
            marker.scale.z = max(0.1, obj['dimensions'][2])

            # Set color based on size (larger objects are more significant)
            size_factor = min(1.0, obj['volume'] * 10)
            marker.color.r = size_factor
            marker.color.g = 0.5 * (1 - size_factor)
            marker.color.b = 1.0 - size_factor
            marker.color.a = 0.7  # Semi-transparent

            marker_array.markers.append(marker)

        self.object_markers_publisher.publish(marker_array)
```

### Real-Time 3D Reconstruction

For Physical AI applications, real-time 3D reconstruction is essential:

```python
#!/usr/bin/env python3
"""
Real-time 3D reconstruction for Physical AI applications
"""
import open3d as o3d
import numpy as np
from threading import Lock
import queue


class RealTimeReconstruction:
    """
    Real-time 3D reconstruction pipeline for Physical AI
    """
    def __init__(self, voxel_size=0.01):
        # Initialize Open3D TSDF volume
        self.tsdf_volume = o3d.pipelines.integration.ScalableTSDFVolume(
            voxel_length=voxel_size,
            sdf_trunc=0.04,
            color_type=o3d.pipelines.integration.TSDFVolumeColorType.RGB8
        )

        # Frame queue for processing
        self.frame_queue = queue.Queue(maxsize=10)
        self.processing_lock = Lock()

        # Camera parameters (would be obtained from camera_info topic)
        self.intrinsic = o3d.camera.PinholeCameraIntrinsic(
            width=640, height=480,
            fx=320, fy=320, cx=320, cy=240
        )

        # Transformation from camera to robot base
        self.camera_to_robot = np.eye(4)

    def integrate_frame(self, depth_image, rgb_image, camera_pose):
        """
        Integrate a new frame into the 3D reconstruction
        """
        if depth_image is None or rgb_image is None:
            return

        # Convert to Open3D format
        o3d_depth = o3d.geometry.Image(depth_image)
        o3d_rgb = o3d.geometry.Image(rgb_image)

        # Create RGBD image
        rgbd = o3d.geometry.RGBDImage.create_from_color_and_depth(
            o3d_rgb, o3d_depth,
            depth_scale=1000.0,  # mm to meters
            depth_trunc=3.0,     # 3m max depth
            convert_rgb_to_intensity=False
        )

        # Integrate into TSDF volume
        self.tsdf_volume.integrate(
            rgbd,
            self.intrinsic,
            np.linalg.inv(camera_pose)  # Convert to world-to-camera transform
        )

    def get_mesh(self):
        """
        Extract mesh from current TSDF volume
        """
        return self.tsdf_volume.extract_triangle_mesh()

    def get_point_cloud(self):
        """
        Extract point cloud from current TSDF volume
        """
        return self.tsdf_volume.extract_point_cloud()

    def update_camera_pose(self, new_pose):
        """
        Update camera pose for reconstruction
        """
        self.camera_to_robot = new_pose


def main(args=None):
    rclpy.init(args=args)
    node = MultiSensorFusionNode()

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

## Isaac ROS 3D Vision Components

### Isaac ROS Stereo DNN

Isaac ROS provides optimized stereo deep neural network processing:

```python
#!/usr/bin/env python3
"""
Isaac ROS Stereo DNN for Physical AI perception
"""
import rclpy
from rclpy.node import Node
from stereo_msgs.msg import DisparityImage
from sensor_msgs.msg import Image, CameraInfo
from isaac_ros_stereo_image_proc_msgs.msg import DenseDisparityImage
from vision_msgs.msg import Detection3DArray
import numpy as np


class IsaacROSStereoDNN(Node):
    """
    Isaac ROS Stereo DNN for 3D object detection
    """
    def __init__(self):
        super().__init__('isaac_ros_stereo_dnn')

        # Subscriptions
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

        self.left_camera_info_sub = self.create_subscription(
            CameraInfo,
            '/camera/infra1/camera_info',
            self.left_camera_info_callback,
            10
        )

        self.right_camera_info_sub = self.create_subscription(
            CameraInfo,
            '/camera/infra2/camera_info',
            self.right_camera_info_callback,
            10
        )

        # Publishers
        self.disparity_pub = self.create_publisher(DenseDisparityImage, '/disparity/image_raw', 10)
        self.detections_3d_pub = self.create_publisher(Detection3DArray, '/detections_3d', 10)

        # Stereo matching parameters
        self.block_size = 16
        self.min_disparity = 0
        self.num_disparities = 64  # Must be divisible by 16

        # Storage
        self.latest_left = None
        self.latest_right = None
        self.left_camera_info = None
        self.right_camera_info = None

        self.get_logger().info("Isaac ROS Stereo DNN Node Started")

    def left_image_callback(self, msg):
        """
        Handle left camera image
        """
        self.latest_left = msg
        self.attempt_stereo_processing()

    def right_image_callback(self, msg):
        """
        Handle right camera image
        """
        self.latest_right = msg
        self.attempt_stereo_processing()

    def left_camera_info_callback(self, msg):
        """
        Store left camera intrinsic parameters
        """
        self.left_camera_info = msg

    def right_camera_info_callback(self, msg):
        """
        Store right camera intrinsic parameters
        """
        self.right_camera_info = msg

    def attempt_stereo_processing(self):
        """
        Attempt stereo processing when both images are available
        """
        if (self.latest_left is not None and
            self.latest_right is not None and
            self.left_camera_info is not None and
            self.right_camera_info is not None):

            # Process stereo pair
            self.perform_stereo_detection(
                self.latest_left,
                self.latest_right
            )

            # Reset images after processing
            self.latest_left = None
            self.latest_right = None

    def perform_stereo_detection(self, left_img, right_img):
        """
        Perform stereo-based 3D object detection
        """
        # In a real implementation, this would use Isaac ROS DNN nodes
        # which are optimized for NVIDIA hardware

        # Convert ROS images to OpenCV
        left_cv = self.cv_bridge.imgmsg_to_cv2(left_img, 'bgr8')
        right_cv = self.cv_bridge.imgmsg_to_cv2(right_img, 'bgr8')

        # Example stereo processing (would use Isaac ROS nodes in practice)
        stereo = cv2.StereoSGBM_create(
            minDisparity=self.min_disparity,
            numDisparities=self.num_disparities,
            blockSize=self.block_size,
            P1=8 * 3 * self.block_size**2,
            P2=32 * 3 * self.block_size**2,
            disp12MaxDiff=1,
            uniquenessRatio=15,
            speckleWindowSize=0,
            speckleRange=2,
            mode=cv2.STEREO_SGBM_MODE_SGBM_3WAY
        )

        # Compute disparity
        disparity = stereo.compute(left_cv, right_cv).astype(np.float32) / 16.0

        # Convert disparity to depth
        baseline = 0.05  # 5cm baseline (would be from calibration)
        focal_length = self.left_camera_info.k[0]  # fx from camera matrix
        depth_map = (baseline * focal_length) / (disparity + 1e-6)  # Avoid division by zero

        # Filter out invalid depths
        depth_map[disparity <= 0] = 0  # Invalid disparities

        # Create 3D detections based on depth analysis
        detections_3d = self.detect_3d_objects_from_depth(left_img, depth_map)

        # Publish results
        self.publish_3d_detections(detections_3d, left_img.header)

    def detect_3d_objects_from_depth(self, color_image, depth_map):
        """
        Detect 3D objects from depth information
        """
        # This would typically use deep learning models
        # combined with geometric analysis

        # For this example, we'll simulate detection of simple objects
        height, width = depth_map.shape
        detections = []

        # Simple blob detection in depth
        for y in range(0, height, 30):  # Sample every 30 pixels
            for x in range(0, width, 30):
                # Check if there's a nearby object
                region_depth = depth_map[y:y+30, x:x+30]
                valid_depths = region_depth[region_depth > 0]

                if len(valid_depths) > 200:  # Sufficient points for object
                    avg_depth = np.mean(valid_depths)
                    std_depth = np.std(valid_depths)

                    # If region has consistent depth, it might be an object
                    if std_depth < avg_depth * 0.1:  # Low variance in depth
                        # Calculate 3D position
                        camera_x = (x - self.left_camera_info.k[2]) * avg_depth / self.left_camera_info.k[0]  # cx, fx
                        camera_y = (y - self.left_camera_info.k[5]) * avg_depth / self.left_camera_info.k[4]  # cy, fy
                        camera_z = avg_depth

                        detection = {
                            'position': [camera_x, camera_y, camera_z],
                            'size': [0.2, 0.2, 0.3],  # Estimated size
                            'confidence': 0.7 + 0.3 * (1 - std_depth / (avg_depth + 1e-6))
                        }

                        detections.append(detection)

        return detections

    def publish_3d_detections(self, detections, header):
        """
        Publish 3D object detections
        """
        detection_array = Detection3DArray()
        detection_array.header = header

        for i, det in enumerate(detections):
            # Create 3D detection message
            detection_3d = Detection3D()
            detection_3d.header = header
            detection_3d.results = []

            # Hypothetical object result
            result = ObjectHypothesisWithPose()
            result.hypothesis.class_id = "object"
            result.hypothesis.score = det['confidence']

            # Create pose in camera frame
            result.pose.pose.position.x = det['position'][0]
            result.pose.pose.position.y = det['position'][1]
            result.pose.pose.position.z = det['position'][2]
            result.pose.pose.orientation.w = 1.0  # No rotation

            detection_3d.results.append(result)
            detection_3d.bbox.center = result.pose.pose
            detection_3d.bbox.size.x = det['size'][0]
            detection_3d.bbox.size.y = det['size'][1]
            detection_3d.bbox.size.z = det['size'][2]

            detection_array.detections.append(detection_3d)

        self.detections_3d_publisher.publish(detection_array)


def main(args=None):
    rclpy.init(args=args)
    node = IsaacROSStereoDNN()

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

## Humanoid Robotics Applications

### 3D Vision for Humanoid Perception

In humanoid robotics, 3D vision fusion enables critical capabilities:

```python
#!/usr/bin/env python3
"""
3D vision fusion specifically for humanoid robotics
"""
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import PointCloud2, Image, LaserScan
from geometry_msgs.msg import PoseStamped, PointStamped
from std_msgs.msg import Bool
from visualization_msgs.msg import MarkerArray
import numpy as np
from scipy.spatial.transform import Rotation as R


class Humanoid3DPerception(Node):
    """
    3D perception system tailored for humanoid robot needs
    """
    def __init__(self):
        super().__init__('humanoid_3d_perception')

        # Sensor subscriptions
        self.rgb_sub = self.create_subscription(Image, '/camera/color/image_raw', self.rgb_callback, 10)
        self.depth_sub = self.create_subscription(Image, '/camera/aligned_depth_to_color/image_raw', self.depth_callback, 10)
        self.lidar_sub = self.create_subscription(PointCloud2, '/scan_filtered', self.lidar_callback, 10)

        # Publishers for humanoid-specific perception
        self.obstacle_map_pub = self.create_publisher(PointCloud2, '/humanoid/obstacle_map', 10)
        self.surface_normals_pub = self.create_publisher(PointCloud2, '/humanoid/surface_normals', 10)
        self.walkable_surface_pub = self.create_publisher(PointCloud2, '/humanoid/walkable_surface', 10)
        self.fall_risk_pub = self.create_publisher(Bool, '/humanoid/fall_risk_detected', 10)
        self.interactive_objects_pub = self.create_publisher(MarkerArray, '/humanoid/interactive_objects', 10)

        # Storage for sensor data
        self.latest_rgb = None
        self.latest_depth = None
        self.latest_lidar = None

        # Humanoid-specific parameters
        self.robot_height = 1.6  # Average humanoid height
        self.step_height_threshold = 0.2  # Max step height humanoid can handle
        self.slope_threshold = 0.3  # Max slope humanoid can traverse (in radians)
        self.clearance_height = 0.5  # Min clearance for humanoid to pass

        # For surface analysis
        self.surface_analyzer = SurfaceAnalyzer()

        self.get_logger().info("Humanoid 3D Perception Node Initialized")

    def depth_callback(self, msg):
        """
        Process depth image for 3D understanding
        """
        self.latest_depth = msg
        if self.latest_rgb is not None:
            self.fuse_rgb_depth_analysis()

    def lidar_callback(self, msg):
        """
        Process LiDAR for 360-degree environment understanding
        """
        self.latest_lidar = msg
        self.process_lidar_data()

    def rgb_callback(self, msg):
        """
        Process color image for semantic information
        """
        self.latest_rgb = msg
        if self.latest_depth is not None:
            self.fuse_rgb_depth_analysis()

    def fuse_rgb_depth_analysis(self):
        """
        Fuse RGB and depth for comprehensive scene understanding
        """
        # Convert images to usable format
        depth_image = self.cv_bridge.imgmsg_to_cv2(self.latest_depth, '16UC1')
        rgb_image = self.cv_bridge.imgmsg_to_cv2(self.latest_rgb, 'bgr8')

        # Convert depth to 3D points
        points_3d = self.depth_to_3d_points(depth_image)

        # Analyze for humanoid-specific requirements
        obstacle_map = self.identify_obstacles(points_3d)
        walkable_surfaces = self.identify_walkable_surfaces(points_3d)
        interactive_objects = self.identify_interactive_objects(rgb_image, points_3d)

        # Assess fall risk based on ground analysis
        fall_risk = self.assess_fall_risk(points_3d)

        # Publish results
        self.obstacle_map_publisher.publish(obstacle_map)
        self.walkable_surface_publisher.publish(walkable_surfaces)
        self.interactive_objects_publisher.publish(interactive_objects)

        fall_risk_msg = Bool()
        fall_risk_msg.data = fall_risk
        self.fall_risk_publisher.publish(fall_risk_msg)

    def identify_obstacles(self, points_3d):
        """
        Identify obstacles that would impede humanoid locomotion
        """
        # Filter points at human walking height range (0.1m to 1.2m)
        walking_height_mask = (points_3d[:, 2] > 0.1) & (points_3d[:, 2] < 1.2)
        potential_obstacles = points_3d[walking_height_mask]

        # Remove ground points (anything below 0.1m)
        obstacle_points = potential_obstacles[potential_obstacles[:, 2] > 0.1]

        return self.points_to_pointcloud(obstacle_points, self.latest_depth.header)

    def identify_walkable_surfaces(self, points_3d):
        """
        Identify surfaces that are walkable for the humanoid
        """
        # Filter floor-level points (between ground and ankle height)
        floor_mask = (points_3d[:, 2] > -0.1) & (points_3d[:, 2] < 0.5)  # Ground to knee height
        floor_points = points_3d[floor_mask]

        # Segment walkable surfaces based on flatness
        walkable_surfaces = self.surface_analyzer.find_flat_surfaces(floor_points)

        # Filter by slope and step height constraints
        walkable_filtered = []
        for surface in walkable_surfaces:
            # Check slope
            normal = surface['normal']
            slope_angle = np.arccos(abs(normal[2]))  # Angle from vertical

            if slope_angle < self.slope_threshold:
                # Check for excessive step heights
                min_z = np.min(surface['points'][:, 2])
                max_z = np.max(surface['points'][:, 2])

                if (max_z - min_z) < self.step_height_threshold:
                    walkable_filtered.extend(surface['points'])

        return self.points_to_pointcloud(np.array(walkable_filtered), self.latest_depth.header)

    def identify_interactive_objects(self, rgb_image, points_3d):
        """
        Identify objects that the humanoid can interact with
        """
        # This would normally use object detection models
        # For this example, we'll identify objects at appropriate heights

        # Filter objects at interaction height (0.5m to 1.5m)
        interaction_mask = (points_3d[:, 2] > 0.5) & (points_3d[:, 2] < 1.5)
        interaction_objects = points_3d[interaction_mask]

        # Group into potential objects
        object_clusters = self.cluster_points(interaction_objects)

        # Create markers for each object cluster
        markers = MarkerArray()

        for i, cluster in enumerate(object_clusters):
            if len(cluster) > 50:  # Significant cluster
                marker = self.create_interaction_marker(cluster, i)
                markers.markers.append(marker)

        return markers

    def assess_fall_risk(self, points_3d):
        """
        Assess environmental risk factors that could cause humanoid falls
        """
        # Identify steep slopes that could cause instability
        ground_mask = (points_3d[:, 2] > -0.5) & (points_3d[:, 2] < 0.5)  # Ground region
        ground_points = points_3d[ground_mask]

        # Analyze ground for unevenness, steps, holes, etc.
        if len(ground_points) > 100:
            # Calculate local normals to identify steep areas
            normals = self.estimate_surface_normals(ground_points)

            # Check for angles greater than safe threshold
            steep_areas = np.arccos(np.abs(normals[:, 2])) > self.slope_threshold
            if np.sum(steep_areas) > len(ground_points) * 0.1:  # More than 10% steep
                return True

        return False

    def estimate_surface_normals(self, points):
        """
        Estimate surface normals for a point cloud
        """
        from sklearn.neighbors import NearestNeighbors

        # Find k-nearest neighbors for each point
        k = 10
        nbrs = NearestNeighbors(n_neighbors=k, algorithm='auto').fit(points)
        distances, indices = nbrs.kneighbors(points)

        # Calculate normal from local plane fitting
        normals = []
        for i, idx in enumerate(indices):
            neighborhood = points[idx]

            # Fit plane to neighborhood
            if len(neighborhood) >= 3:
                # Calculate centroid
                centroid = np.mean(neighborhood, axis=0)

                # Calculate covariance matrix
                cov_matrix = np.cov(neighborhood.T)

                # Find eigenvalues and eigenvectors
                eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)

                # Normal is the eigenvector corresponding to smallest eigenvalue
                normal = eigenvectors[:, 0]

                # Ensure normal points upward (positive z direction)
                if normal[2] < 0:
                    normal = -normal

                normals.append(normal)
            else:
                normals.append([0, 0, 1])  # Default upward normal

        return np.array(normals)

    def cluster_points(self, points):
        """
        Simple clustering using DBSCAN
        """
        from sklearn.cluster import DBSCAN

        clustering = DBSCAN(eps=0.1, min_samples=10)
        labels = clustering.fit_predict(points)

        clusters = []
        for label in np.unique(labels):
            if label != -1:  # Not noise
                cluster = points[labels == label]
                clusters.append(cluster)

        return clusters

    def create_interaction_marker(self, cluster_points, id):
        """
        Create visualization marker for an interactive object
        """
        marker = Marker()
        marker.header.stamp = self.get_clock().now().to_msg()
        marker.header.frame_id = self.latest_depth.header.frame_id
        marker.ns = "interactive_objects"
        marker.id = id
        marker.type = Marker.SPHERE
        marker.action = Marker.ADD

        # Calculate center of cluster
        center = np.mean(cluster_points, axis=0)
        marker.pose.position.x = center[0]
        marker.pose.position.y = center[1]
        marker.pose.position.z = center[2]
        marker.pose.orientation.w = 1.0

        # Calculate size based on cluster extent
        size = np.max(np.std(cluster_points, axis=0)) * 2
        size = max(0.1, min(size, 0.5))  # Clamp between 0.1 and 0.5
        marker.scale.x = size
        marker.scale.y = size
        marker.scale.z = size

        # Color interaction objects
        marker.color.r = 1.0
        marker.color.g = 0.5
        marker.color.b = 0.0
        marker.color.a = 0.8

        return marker

    def points_to_pointcloud(self, points, header):
        """
        Convert numpy array of points to PointCloud2 message
        """
        # Implementation similar to PointCloudProcessor
        # For brevity, using a simplified version
        cloud_msg = PointCloud2()
        cloud_msg.header = header
        cloud_msg.height = 1
        cloud_msg.width = len(points)

        # Define fields
        fields = [
            PointField(name='x', offset=0, datatype=PointField.FLOAT32, count=1),
            PointField(name='y', offset=4, datatype=PointField.FLOAT32, count=1),
            PointField(name='z', offset=8, datatype=PointField.FLOAT32, count=1)
        ]
        cloud_msg.fields = fields
        cloud_msg.point_step = 12  # 3 * 4 bytes

        # Pack data
        cloud_msg.row_step = cloud_msg.point_step * cloud_msg.width
        cloud_msg.is_dense = True
        cloud_msg.data = np.asarray(points, dtype=np.float32).tobytes()

        return cloud_msg


def main(args=None):
    rclpy.init(args=args)
    node = Humanoid3DPerception()

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

### Surface Analysis for Humanoid Locomotion

```python
#!/usr/bin/env python3
"""
Surface analysis for humanoid locomotion safety
"""
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.linear_model import RANSACRegressor


class SurfaceAnalyzer:
    """
    Analyze surfaces for humanoid locomotion safety
    """
    def __init__(self):
        self.ground_normal_threshold = 0.1  # Normal should be within 0.1 of [0,0,1]
        self.max_slope_angle = np.radians(20)  # Max walkable slope: 20 degrees
        self.min_surface_area = 0.04  # 20cm x 20cm minimum for stable footing
        self.max_step_height = 0.15  # 15cm max step height

    def find_walkable_surfaces(self, point_cloud):
        """
        Find surfaces suitable for humanoid walking
        """
        surfaces = []

        # Use RANSAC to find planar surfaces
        ransac = RANSACRegressor(residual_threshold=0.02)  # 2cm tolerance

        # Segment the point cloud into different surfaces
        remaining_points = point_cloud.copy()

        while len(remaining_points) > 100:  # Need enough points for plane fitting
            # Try to fit a plane using RANSAC
            if len(remaining_points) < 50:
                break

            try:
                # Fit plane to largest cluster of points
                ransac.fit(remaining_points[:, :2], remaining_points[:, 2])

                # Identify inliers (points that fit the plane)
                inlier_mask = np.abs(ransac.predict(remaining_points[:, :2]) - remaining_points[:, 2]) < 0.02
                inliers = remaining_points[inlier_mask]

                # Check if this plane is horizontal enough to be walkable
                plane_normal = self.calculate_plane_normal(inliers)

                if self.is_walkable_surface(plane_normal, inliers):
                    # Add this surface
                    surfaces.append({
                        'points': inliers,
                        'normal': plane_normal,
                        'center': np.mean(inliers, axis=0),
                        'area': self.calculate_polygon_area(inliers)
                    })

                    # Remove inliers from remaining points
                    remaining_points = remaining_points[~inlier_mask]
                else:
                    # Remove outliers to try again
                    outliers = remaining_points[~inlier_mask]
                    if len(outliers) < len(remaining_points) // 2:
                        remaining_points = outliers
                    else:
                        break

            except Exception as e:
                # If RANSAC fails, break to avoid infinite loop
                self.get_logger().warn(f"Surface fitting failed: {str(e)}")
                break

        return surfaces

    def calculate_plane_normal(self, points):
        """
        Calculate the normal vector of a planar surface
        """
        if len(points) < 3:
            return np.array([0, 0, 1])

        # Use PCA to find the normal (eigenvector corresponding to smallest eigenvalue)
        covariance = np.cov(points.T)
        eigenvalues, eigenvectors = np.linalg.eigh(covariance)

        # Sort by eigenvalues (ascending)
        idx = np.argsort(eigenvalues)
        eigenvectors = eigenvectors[:, idx]

        # The normal is the eigenvector corresponding to the smallest eigenvalue
        normal = eigenvectors[:, 0]

        # Ensure normal points upward
        if normal[2] < 0:
            normal = -normal

        return normal

    def is_walkable_surface(self, normal, points):
        """
        Determine if a surface is suitable for humanoid walking
        """
        # Check if normal is approximately vertical (walking surface)
        is_flat = abs(normal[2]) > np.cos(self.max_slope_angle)

        # Check if area is sufficient for humanoid feet
        area = self.calculate_polygon_area(points)
        has_sufficient_area = area > self.min_surface_area

        # Check height (not too high above ground)
        avg_height = np.mean(points[:, 2])
        is_reasonable_height = avg_height < 0.5  # Not above 50cm

        # Check for consistency (not too much height variation)
        height_variance = np.var(points[:, 2])
        is_consistent = height_variance < 0.001  # Less than 1cm^2 variance

        return is_flat and has_sufficient_area and is_reasonable_height and is_consistent

    def calculate_polygon_area(self, points):
        """
        Approximate surface area using 2D projection
        """
        if len(points) < 3:
            return 0.0

        # Project to 2D (x, y plane) and calculate area using convex hull
        from scipy.spatial import ConvexHull

        try:
            hull = ConvexHull(points[:, :2])
            return hull.volume  # For 2D hull, volume is area
        except:
            # If convex hull fails, use bounding box area
            min_x, max_x = np.min(points[:, 0]), np.max(points[:, 0])
            min_y, max_y = np.min(points[:, 1]), np.max(points[:, 1])
            return (max_x - min_x) * (max_y - min_y)

    def identify_obstacles_and_clearances(self, points_3d):
        """
        Identify obstacles and analyze clearances for humanoid navigation
        """
        obstacles = {
            'low_obstacles': [],  # Things to step over
            'high_obstacles': [],  # Things to duck under
            'narrow_passages': [],  # Tight spaces
            'clear_paths': []  # Safe passages
        }

        # Categorize points based on height
        ground_level = points_3d[points_3d[:, 2] < 0.1]  # Ground objects
        step_range = points_3d[(points_3d[:, 2] >= 0.1) & (points_3d[:, 2] < 0.5)]  # Step height
        waist_range = points_3d[(points_3d[:, 2] >= 0.5) & (points_3d[:, 2] < 0.8)]  # Waist height objects
        head_range = points_3d[points_3d[:, 2] >= 0.8]  # Head height obstacles

        # Analyze each category
        obstacles['low_obstacles'] = self.analyze_low_obstacles(step_range)
        obstacles['high_obstacles'] = self.analyze_high_obstacles(head_range)
        obstacles['narrow_passages'] = self.analyze_narrow_passages(waist_range)

        return obstacles

    def analyze_low_obstacles(self, points):
        """
        Analyze obstacles at stepping height
        """
        # Use clustering to identify individual obstacles
        if len(points) == 0:
            return []

        clustering = DBSCAN(eps=0.2, min_samples=10)
        labels = clustering.fit_predict(points)

        obstacles = []
        for label in np.unique(labels):
            if label == -1:  # Skip noise
                continue

            cluster = points[labels == label]

            # Check if this could be stepped over
            height_range = np.max(cluster[:, 2]) - np.min(cluster[:, 2])
            if height_range > 0.05 and height_range < self.max_step_height:  # Between 5cm and 15cm
                obstacles.append({
                    'type': 'step_obstacle',
                    'position': np.mean(cluster, axis=0)[:2],  # x, y only
                    'height_range': height_range,
                    'center_height': np.mean(cluster[:, 2])
                })

        return obstacles

    def analyze_high_obstacles(self, points):
        """
        Analyze overhead obstacles
        """
        # Check if there are low overhead obstacles that require ducking
        if len(points) == 0:
            return []

        # Find lowest points in head region
        min_height = np.min(points[:, 2])
        max_height = np.max(points[:, 2])

        # If lowest point is below ducking threshold (e.g., 1.4m for humanoid)
        ducking_threshold = 1.4
        if min_height < ducking_threshold:
            return [{
                'type': 'overhead_obstacle',
                'min_clearance': min_height,
                'obstacle_region': points
            }]

        return []

    def analyze_narrow_passages(self, points):
        """
        Analyze narrow passages at waist level
        """
        # This would analyze if there are narrow gaps at waist level
        # that might impede humanoid passage
        if len(points) == 0:
            return []

        # For now, return empty list - in a real implementation this would
        # analyze passageway widths
        return []


def main():
    """
    Example usage of surface analyzer
    """
    print("Surface analyzer initialized")
    # This would typically run as part of a larger node
    # that continuously analyzes incoming point clouds