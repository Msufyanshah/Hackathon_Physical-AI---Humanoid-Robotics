---
sidebar_position: 4
title: 'Computer Vision for Robotics'
---

# Computer Vision for Physical AI: Seeing the World Through Robot Eyes

## Introduction to Computer Vision in Physical AI

Computer vision is the cornerstone of robotic perception in Physical AI systems, enabling robots to interpret and understand the visual world around them. Unlike traditional computer vision applications that might analyze images in isolation, Physical AI systems require real-time visual processing that integrates seamlessly with motor control, navigation, and decision-making systems.

The challenge in Physical AI is to create vision systems that can process visual information rapidly enough to support embodied behavior while providing the semantic understanding necessary for complex robot interactions.

## Key Computer Vision Applications in Physical AI

### Object Detection and Recognition

For Physical AI systems, object detection is crucial for:

- **Environmental awareness**: Identifying and locating objects in the environment
- **Manipulation planning**: Recognizing graspable objects and their properties
- **Navigation**: Identifying walkable surfaces, obstacles, and pathways
- **Human interaction**: Recognizing humans, gestures, and facial expressions

#### Implementation Approaches

1. **Classic Computer Vision**:
   - Color-based segmentation
   - Template matching
   - Feature descriptors (SIFT, SURF, ORB)

2. **Deep Learning-Based**:
   - YOLO (You Only Look Once) for real-time detection
   - Mask R-CNN for instance segmentation
   - Vision Transformers for advanced understanding

### Depth and 3D Understanding

Physical AI systems must understand the three-dimensional structure of their environment:

- **Stereo vision**: Using binocular vision to estimate depth
- **Structure from Motion (SfM)**: Reconstructing 3D scenes from motion
- **Visual SLAM**: Simultaneous localization and mapping using vision
- **Neural radiance fields**: Novel view synthesis and scene reconstruction

### Optical Flow and Motion Understanding

Humanoid robots need to understand motion in the environment:

- **Scene flow**: 3D motion of points in the environment
- **Optical flow**: 2D apparent motion in image space
- **Ego-motion**: Robot's own movement through visual observations
- **Motion segmentation**: Separating moving objects from static environment

## Isaac ROS Computer Vision Pipelines

### Isaac ROS Vision Modules

Isaac ROS provides optimized computer vision capabilities:

```python
#!/usr/bin/env python3
"""
Isaac ROS Computer Vision Pipeline for Physical AI
"""
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from vision_msgs.msg import Detection2DArray, Detection3DArray
from geometry_msgs.msg import PointStamped
from std_msgs.msg import Header
from cv_bridge import CvBridge
import cv2
import numpy as np


class IsaacROSComputerVisionNode(Node):
    """
    Computer vision pipeline using Isaac ROS optimized modules
    """
    def __init__(self):
        super().__init__('isaac_ros_cv_pipeline')
        
        # Create subscriptions
        self.image_sub = self.create_subscription(
            Image,
            '/camera/color/image_raw',
            self.image_callback,
            10
        )
        
        self.depth_sub = self.create_subscription(
            Image,
            '/camera/aligned_depth_to_color/image_raw',
            self.depth_callback,
            10
        )
        
        # Create publishers for computer vision results
        self.detection_pub = self.create_publisher(Detection2DArray, '/cv/detections', 10)
        self.feature_pub = self.create_publisher(Image, '/cv/features', 10)
        self.depth_aware_pub = self.create_publisher(Detection3DArray, '/cv/detections_3d', 10)
        
        # Initialize computer vision components
        self.cv_bridge = CvBridge()
        
        # Feature detection parameters
        self.feature_params = dict(
            maxCorners=200,
            qualityLevel=0.01,
            minDistance=7,
            blockSize=7
        )
        
        # Lucas-Kanade optical flow parameters
        self.lk_params = dict(
            winSize=(15, 15),
            maxLevel=2,
            criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 10, 0.03)
        )
        
        # Storage for previous frame data
        self.prev_gray = None
        self.prev_features = None
        self.tracks = []
        
        self.get_logger().info("Isaac ROS Computer Vision Pipeline Started")

    def image_callback(self, msg):
        """
        Process incoming image for computer vision analysis
        """
        try:
            # Convert ROS image to OpenCV
            cv_image = self.cv_bridge.imgmsg_to_cv2(msg, 'bgr8')
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            
            # Feature detection and tracking
            if self.prev_gray is not None:
                # Calculate optical flow
                new_features, status, error = cv2.calcOpticalFlowPyrLK(
                    self.prev_gray, gray, self.prev_features, None, **self.lk_params
                )
                
                # Filter good points
                good_new = new_features[status.ravel() == 1]
                good_old = self.prev_features[status.ravel() == 1]
                
                # Calculate motion vectors
                motion_vectors = []
                for i, (new, old) in enumerate(zip(good_new, good_old)):
                    a, b = new.ravel()
                    c, d = old.ravel()
                    motion_vectors.append({'start': (c, d), 'end': (a, b)})
                
                # Draw motion vectors on image
                for mv in motion_vectors:
                    cv2.line(cv_image, mv['start'], mv['end'], (0, 255, 0), 2)
                    cv2.circle(cv_image, mv['end'], 5, (0, 0, 255), -1)
                
                # Publish feature image
                feature_msg = self.cv_bridge.cv2_to_imgmsg(cv_image, encoding='bgr8')
                feature_msg.header = msg.header
                self.feature_publisher.publish(feature_msg)
            
            # Update for next iteration
            self.prev_gray = gray.copy()
            
            # Good features to track for next iteration
            new_features = cv2.goodFeaturesToTrack(gray, mask=None, **self.feature_params)
            if new_features is not None:
                self.prev_features = new_features
            else:
                # If no features found, reinitialize
                self.prev_features = cv2.goodFeaturesToTrack(gray, mask=None, **self.feature_params)
            
            # Object detection using OpenCV DNN
            detections = self.detect_objects(cv_image)
            
            # Publish 2D detections
            if detections:
                detection_array = self.create_detection_array(detections, msg.header)
                self.detection_publisher.publish(detection_array)
                
        except Exception as e:
            self.get_logger().error(f"Image processing error: {str(e)}")

    def depth_callback(self, msg):
        """
        Process depth information in conjunction with color image
        """
        # This would normally be synchronized with image_callback
        # For 3D detection and understanding
        pass

    def detect_objects(self, image):
        """
        Object detection using Isaac ROS optimized methods
        """
        # In a real implementation, this would use Isaac ROS DNN modules
        # For example: Isaac ROS DetectNet, Isaac ROS SegmentationNet, etc.
        
        # Placeholder implementation using OpenCV
        # Detect specific shapes in the environment
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect circles (potential objects)
        circles = cv2.HoughCircles(
            gray,
            cv2.HOUGH_GRADIENT,
            dp=1,
            minDist=50,
            param1=50,
            param2=30,
            minRadius=10,
            maxRadius=100
        )
        
        detections = []
        if circles is not None:
            circles = np.round(circles[0, :]).astype("int")
            for (x, y, r) in circles:
                detection = {
                    'class': 'circle_object',
                    'confidence': 0.8,
                    'bbox': [x-r, y-r, 2*r, 2*r],  # x, y, width, height
                    'center': (x, y),
                    'radius': r
                }
                detections.append(detection)
        
        return detections

    def create_detection_array(self, detections, header):
        """
        Create Detection2DArray message from object detections
        """
        detection_array = Detection2DArray()
        detection_array.header = header
        
        for i, det in enumerate(detections):
            detection_2d = Detection2D()
            detection_2d.header = header
            detection_2d.results = []
            
            # Create detection result
            result = ObjectHypothesisWithPose()
            result.hypothesis.class_id = det['class']
            result.hypothesis.score = det['confidence']
            
            detection_2d.results.append(result)
            
            # Set bounding box
            bbox = BoundingBox2D()
            bbox.center.position.x = det['center'][0]
            bbox.center.position.y = det['center'][1]
            bbox.center.theta = 0.0
            bbox.size_x = det['bbox'][2]
            bbox.size_y = det['bbox'][3]
            
            detection_2d.bbox = bbox
            detection_array.detections.append(detection_2d)
        
        return detection_array


def main(args=None):
    rclpy.init(args=args)
    node = IsaacROSComputerVisionNode()
    
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

## Deep Learning-Based Vision for Physical AI

### Isaac ROS AI Perception

Isaac ROS provides optimized deep learning perception:

```yaml
# Isaac ROS DNN configuration
isaac_ros_detectnet:
  ros__parameters:
    # Input image parameters
    input_tensor: input_0
    input_width: 640
    input_height: 360
    output_tensor: output_0
    model_file_path: "/opt/isaac_ros/models/yolo.pt"
    class_labels_file_path: "/opt/isaac_ros/models/coco_labels.txt"
    enable_profiling: false
    tensorrt_cache_path: "/tmp/tensorrt"
    
    # Detection parameters
    confidence_threshold: 0.5
    max_objects: 50
    enable_bbox: true
    
    # Performance settings
    input_layer_name: "input"
    output_layer_name: "output"
```

### Vision Transformer Integration

For more advanced perception:

```python
#!/usr/bin/env python3
"""
Vision Transformer integration for Physical AI perception
"""
import rclpy
from rclpy.node import Node
import torch
import torchvision.transforms as transforms
from sensor_msgs.msg import Image
from vision_msgs.msg import Detection2DArray
from cv_bridge import CvBridge
import numpy as np
import cv2


class VisionTransformerNode(Node):
    """
    Vision transformer node for advanced object recognition in Physical AI
    """
    def __init__(self):
        super().__init__('vision_transformer_node')
        
        self.image_sub = self.create_subscription(
            Image,
            '/camera/color/image_raw',
            self.image_callback,
            10
        )
        
        self.detection_pub = self.create_publisher(Detection2DArray, '/vt/detections', 10)
        
        self.cv_bridge = CvBridge()
        
        # Initialize vision transformer model
        # In practice, this would load a pre-trained ViT model
        # self.model = self.load_vit_model()
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
        
        self.get_logger().info("Vision Transformer Node Started")

    def image_callback(self, msg):
        """
        Process image using vision transformer
        """
        try:
            # Convert ROS image to OpenCV
            cv_image = self.cv_bridge.imgmsg_to_cv2(msg, 'bgr8')
            
            # Preprocess image
            input_tensor = self.preprocess_image(cv_image)
            
            # Run inference (in real system, using actual ViT model)
            # predictions = self.model(input_tensor)
            # results = self.process_predictions(predictions)
            
            # For this example, using placeholder results
            results = self.placeholder_vit_results(cv_image)
            
            # Create and publish detection array
            detection_array = self.create_detection_array_from_vt(results, msg.header)
            self.detection_publisher.publish(detection_array)
            
        except Exception as e:
            self.get_logger().error(f"Vision transformer error: {str(e)}")

    def preprocess_image(self, image):
        """
        Preprocess image for vision transformer
        """
        # OpenCV uses BGR, but transforms expects RGB
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Apply transforms
        tensor = self.transform(rgb_image)
        tensor = tensor.unsqueeze(0)  # Add batch dimension
        
        return tensor

    def placeholder_vit_results(self, image):
        """
        Placeholder for ViT results processing
        """
        # In a real implementation, this would use actual ViT model
        # For now, simulate some results
        height, width = image.shape[:2]
        
        # Simulate detecting some objects
        results = [
            {
                'label': 'person',
                'confidence': 0.92,
                'bbox': [int(width*0.3), int(height*0.2), int(width*0.5), int(height*0.7)],
                'semantic_info': 'Standing human present'
            },
            {
                'label': 'chair',
                'confidence': 0.85,
                'bbox': [int(width*0.6), int(height*0.4), int(width*0.8), int(height*0.8)],
                'semantic_info': 'Seating furniture identified'
            }
        ]
        
        return results

    def create_detection_array_from_vt(self, results, header):
        """
        Create Detection2DArray from ViT results
        """
        detection_array = Detection2DArray()
        detection_array.header = header
        
        for result in results:
            detection_2d = Detection2D()
            detection_2d.header = header
            detection_2d.results = []
            
            # Create detection result
            hyp_result = ObjectHypothesisWithPose()
            hyp_result.hypothesis.class_id = result['label']
            hyp_result.hypothesis.score = result['confidence']
            
            detection_2d.results.append(hyp_result)
            
            # Set bounding box
            bbox = BoundingBox2D()
            bbox.center.position.x = (result['bbox'][0] + result['bbox'][2]) / 2.0
            bbox.center.position.y = (result['bbox'][1] + result['bbox'][3]) / 2.0
            bbox.center.theta = 0.0
            bbox.size_x = abs(result['bbox'][2] - result['bbox'][0])
            bbox.size_y = abs(result['bbox'][3] - result['bbox'][1])
            
            detection_2d.bbox = bbox
            detection_array.detections.append(detection_2d)
        
        return detection_array


def main(args=None):
    rclpy.init(args=args)
    node = VisionTransformerNode()
    
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

## Semantic Segmentation for Physical AI

### Instance Segmentation in Robotics

Semantic understanding is crucial for Physical AI systems:

```yaml
# Isaac ROS segmentation configuration
isaac_ros_segmentation:
  ros__parameters:
    # Model parameters
    input_tensor: input_0
    output_tensor: output_0
    model_file_path: "/opt/isaac_ros/models/segmentation.onnx"
    colormap_file_path: "/opt/isaac_ros/models/colormap.txt"
    
    # Segmentation parameters
    confidence_threshold: 0.7
    mask_threshold: 0.5
    
    # Performance settings
    width: 640
    height: 480
    enable_resize: true
    resize_method: bilinear
```

### Implementation Example

```python
#!/usr/bin/env python3
"""
Semantic segmentation for Physical AI perception
"""
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from visualization_msgs.msg import Marker, MarkerArray
from cv_bridge import CvBridge
import cv2
import numpy as np


class SemanticSegmentationNode(Node):
    """
    Node for semantic segmentation in Physical AI applications
    """
    def __init__(self):
        super().__init__('semantic_segmentation_node')
        
        self.image_sub = self.create_subscription(
            Image,
            '/camera/color/image_raw',
            self.image_callback,
            10
        )
        
        self.segmentation_pub = self.create_publisher(Image, '/cv/segmentation', 10)
        self.instance_markers_pub = self.create_publisher(MarkerArray, '/cv/instance_markers', 10)
        
        self.cv_bridge = CvBridge()
        
        # Class definitions for Physical AI environment
        self.classes = {
            0: 'background',
            1: 'human',
            2: 'robot',
            3: 'obstacle',
            4: 'walkable_surface',
            5: 'interactable_object',
            6: 'navigation_target'
        }
        
        self.class_colors = {
            0: (0, 0, 0),        # Black for background
            1: (255, 0, 0),      # Red for humans
            2: (0, 255, 0),      # Green for robots
            3: (0, 0, 255),      # Blue for obstacles
            4: (0, 255, 255),    # Yellow for walkable surfaces
            5: (255, 0, 255),    # Magenta for interactable objects
            6: (255, 255, 0)     # Cyan for navigation targets
        }
        
        self.get_logger().info("Semantic Segmentation Node Started")

    def image_callback(self, msg):
        """
        Process image for semantic segmentation
        """
        try:
            # Convert to OpenCV format
            cv_image = self.cv_bridge.imgmsg_to_cv2(msg, 'bgr8')
            
            # Perform semantic segmentation
            # In real implementation, this would use Isaac ROS segmentation modules
            segmentation = self.semantic_segmentation_pipeline(cv_image)
            
            # Generate segmented image for visualization
            segmented_img = self.colorize_segmentation(segmentation)
            
            # Publish colored segmentation
            seg_msg = self.cv_bridge.cv2_to_imgmsg(segmented_img, encoding='bgr8')
            seg_msg.header = msg.header
            self.segmentation_publisher.publish(seg_msg)
            
            # Create markers for detected instances
            markers = self.create_instance_markers(segmentation, msg.header)
            self.instance_markers_publisher.publish(markers)
            
        except Exception as e:
            self.get_logger().error(f"Segmentation error: {str(e)}")

    def semantic_segmentation_pipeline(self, image):
        """
        Placeholder for semantic segmentation pipeline
        """
        # In a real system, this would use Isaac ROS SegmentationNet
        # For this example, we'll create a simulated segmentation result
        
        height, width = image.shape[:2]
        segmentation = np.zeros((height, width), dtype=np.uint8)
        
        # Simulate finding regions based on color or other features
        # This is a simplified example - real segmentation would be more sophisticated
        
        # Find skin-toned regions (heuristic for humans)
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        lower_skin = np.array([0, 20, 70])
        upper_skin = np.array([20, 255, 255])
        skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
        
        # Add simulated segments
        segmentation[skin_mask > 0] = 1  # Humans
        
        # Add floor detection (simplified)
        floor_region = np.zeros_like(segmentation)
        floor_region[int(0.7*height):, :] = 1  # Bottom 30% of image
        segmentation[floor_region == 1] = 4  # Walkable surface
        
        # Add obstacle detection (simplified)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        obstacles = np.zeros_like(edges)
        obstacles[edges > 0] = 1
        # Only mark prominent edges as obstacles
        kernel = np.ones((3, 3), np.uint8)
        obstacles_dilated = cv2.dilate(obstacles, kernel, iterations=1)
        segmentation[obstacles_dilated > 0] = 3  # Obstacles
        
        return segmentation

    def colorize_segmentation(self, segmentation):
        """
        Convert segmentation to color image for visualization
        """
        height, width = segmentation.shape
        color_seg = np.zeros((height, width, 3), dtype=np.uint8)
        
        for class_id, color in self.class_colors.items():
            mask = segmentation == class_id
            color_seg[mask] = color
        
        return color_seg

    def create_instance_markers(self, segmentation, header):
        """
        Create visualization markers for segmented instances
        """
        marker_array = MarkerArray()
        
        # Find connected components for each class
        for class_id, class_name in self.classes.items():
            if class_id == 0:  # Skip background
                continue
                
            # Create binary mask for this class
            class_mask = (segmentation == class_id).astype(np.uint8) * 255
            
            # Find contours
            contours, _ = cv2.findContours(class_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for i, contour in enumerate(contours):
                if cv2.contourArea(contour) > 100:  # Ignore small regions
                    # Calculate centroid
                    M = cv2.moments(contour)
                    if M["m00"] != 0:
                        cx = int(M["m10"] / M["m00"])
                        cy = int(M["m01"] / M["m00"])
                        
                        # Create marker
                        marker = Marker()
                        marker.header = header
                        marker.ns = f"segmented_{class_name}"
                        marker.id = i
                        marker.type = Marker.SPHERE
                        marker.action = Marker.ADD
                        
                        # Position would come from depth information in real system
                        # For this example, using placeholder values
                        marker.pose.position.x = cx * 0.001  # Convert to meters
                        marker.pose.position.y = cy * 0.001  # Convert to meters
                        marker.pose.position.z = 1.0  # Placeholder depth
                        marker.pose.orientation.w = 1.0
                        
                        # Set size based on region size
                        size_factor = min(0.5, max(0.05, cv2.contourArea(contour) / 10000))
                        marker.scale.x = size_factor
                        marker.scale.y = size_factor
                        marker.scale.z = size_factor
                        
                        # Color based on class
                        color = self.class_colors[class_id]
                        marker.color.r = color[0] / 255.0
                        marker.color.g = color[1] / 255.0
                        marker.color.b = color[2] / 255.0
                        marker.color.a = 0.7
                        
                        marker_array.markers.append(marker)
        
        return marker_array


def main(args=None):
    rclpy.init(args=args)
    node = SemanticSegmentationNode()
    
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

## Real-Time Optimization for Physical AI

### Performance Considerations

Physical AI systems have strict real-time requirements:

```python
class OptimizedVisionPipeline:
    """
    Optimized computer vision pipeline for real-time Physical AI applications
    """
    def __init__(self):
        # Configuration for performance optimization
        self.image_processing_rate = 15.0  # Hz - balance between accuracy and speed
        self.detection_confidence = 0.7    # Lower for faster processing if needed
        self.max_objects_per_class = 10    # Limit processing of too many detections
        self.roi_enabled = True            # Region of interest processing
        self.roi_bounds = [0.1, 0.1, 0.8, 0.8]  # x, y, width, height ratios
        
        # Threading for parallel processing
        from concurrent.futures import ThreadPoolExecutor
        self.executor = ThreadPoolExecutor(max_workers=2)
        
        # Memory pools to avoid allocation overhead
        self.output_buffer_pool = []
        self.max_pooled_buffers = 10
        
    def roi_process(self, image):
        """
        Process only region of interest for performance
        """
        if not self.roi_enabled:
            return image
            
        h, w = image.shape[:2]
        x, y, roi_w, roi_h = self.roi_bounds
        x_start = int(x * w)
        y_start = int(y * h)
        x_end = int((x + roi_w) * w)
        y_end = int((y + roi_h) * h)
        
        return image[y_start:y_end, x_start:x_end]

    def process_with_optimizations(self, image):
        """
        Process image with various optimizations
        """
        # Resize image if too large for faster processing
        initial_shape = image.shape
        if image.shape[0] > 640 or image.shape[1] > 640:
            # Calculate appropriate size maintaining aspect ratio
            scale_factor = min(640/image.shape[0], 640/image.shape[1])
            new_height = int(image.shape[0] * scale_factor)
            new_width = int(image.shape[1] * scale_factor)
            image = cv2.resize(image, (new_width, new_height))
        
        # Process ROI
        roi_image = self.roi_process(image)
        
        # Perform vision tasks on ROI
        results = self.perform_vision_tasks(roi_image)
        
        # Scale results back to original image coordinates if needed
        scaled_results = self.scale_results_to_original(results, initial_shape, roi_image.shape)
        
        return scaled_results

    def perform_vision_tasks(self, image):
        """
        Perform multiple vision tasks in parallel if possible
        """
        future_detection = self.executor.submit(self.object_detection_task, image)
        future_segmentation = self.executor.submit(self.segmentation_task, image)
        
        detection_results = future_detection.result()
        segmentation_results = future_segmentation.result()
        
        return {
            'detection': detection_results,
            'segmentation': segmentation_results
        }

    def object_detection_task(self, image):
        """
        Perform object detection
        """
        # Use optimized detector
        return self.fast_detect_objects(image)

    def segmentation_task(self, image):
        """
        Perform segmentation
        """
        # Use optimized segmentation
        return self.fast_segment_image(image)

    def fast_detect_objects(self, image):
        """
        Fast object detection with performance optimizations
        """
        # For Physical AI, prioritize certain classes (humans, obstacles, interactable objects)
        # Use lightweight models or cached results when possible
        pass

    def fast_segment_image(self, image):
        """
        Fast semantic segmentation
        """
        # Use optimized neural networks or heuristic approaches
        # depending on requirements
        pass
```

## Integration with Physical AI Control Systems

### Perception-Action Loops

The ultimate goal of computer vision in Physical AI is to support closed-loop control:

```python
#!/usr/bin/env python3
"""
Perception-action integration for Physical AI systems
"""
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from geometry_msgs.msg import Twist, Point
from std_msgs.msg import Bool
from vision_msgs.msg import Detection2DArray
import numpy as np


class PerceptionActionControl(Node):
    """
    Integrates computer vision with robot control for Physical AI behavior
    """
    def __init__(self):
        super().__init__('perception_action_control')
        
        # Vision input
        self.detection_sub = self.create_subscription(
            Detection2DArray,
            '/cv/detections',
            self.detection_callback,
            10
        )
        
        # Control output
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.gaze_pub = self.create_publisher(Point, '/target_gaze', 10)
        self.interaction_pub = self.create_publisher(Bool, '/interaction_available', 10)
        
        # Vision-to-control parameters
        self.follow_person_distance = 2.0  # meters
        self.avoid_obstacle_distance = 0.5  # meters
        self.interaction_distance = 1.0  # meters
        self.max_approach_speed = 0.5  # m/s
        
        # Robot state
        self.robot_position = np.array([0.0, 0.0])  # x, y in world coordinates
        self.targets = []  # Detected targets requiring action
        
        self.get_logger().info("Perception-Action Control Node Started")

    def detection_callback(self, msg):
        """
        Process vision detections and generate appropriate robot actions
        """
        # Process detections and update targets
        self.update_targets_from_detections(msg.detections)
        
        # Generate appropriate control commands based on targets
        control_cmd = self.generate_control_command()
        
        if control_cmd:
            self.cmd_vel_publisher.publish(control_cmd)
        
        # Generate gaze command to look at target
        gaze_cmd = self.generate_gaze_command()
        if gaze_cmd:
            self.gaze_publisher.publish(gaze_cmd)

    def update_targets_from_detections(self, detections):
        """
        Update list of relevant targets based on computer vision detections
        """
        new_targets = []
        humans = []
        obstacles = []
        interactables = []
        
        for detection in detections:
            if len(detection.results) > 0:
                class_id = detection.results[0].hypothesis.class_id
                confidence = detection.results[0].hypothesis.score
                center_x = detection.bbox.center.position.x
                center_y = detection.bbox.center.position.y
                size_x = detection.bbox.size_x
                size_y = detection.bbox.size_y
                
                # Convert image coordinates to world coordinates using camera pose
                world_coords = self.image_to_world_coordinates(center_x, center_y, class_id)
                
                target_info = {
                    'class': class_id,
                    'confidence': confidence,
                    'world_position': world_coords,
                    'image_coords': (center_x, center_y),
                    'size': (size_x, size_y)
                }
                
                if class_id == 'person' and confidence > 0.7:
                    humans.append(target_info)
                elif class_id == 'obstacle' and confidence > 0.6:
                    obstacles.append(target_info)
                elif class_id == 'interactable_object' and confidence > 0.8:
                    interactables.append(target_info)
        
        # Store best targets for each category
        self.best_human = max(humans, key=lambda x: x['confidence']) if humans else None
        self.nearest_obstacle = min(obstacles, key=lambda x: self.distance_to_robot(x['world_position'])) if obstacles else None
        self.best_interactable = max(interactables, key=lambda x: x['confidence']) if interactables else None

    def generate_control_command(self):
        """
        Generate velocity commands based on current perception
        """
        cmd = Twist()
        
        if self.best_human:
            # Follow person at comfortable distance
            person_pos = self.best_human['world_position']
            robot_to_person = person_pos - self.robot_position
            distance = np.linalg.norm(robot_to_person)
            
            if distance > self.follow_person_distance + 0.5:
                # Person too far, move closer
                direction = robot_to_person / distance
                cmd.linear.x = min(self.max_approach_speed, max(0.1, 0.5 * (distance - self.follow_person_distance)))
                cmd.angular.z = 0.5 * np.arctan2(direction[1], direction[0])  # Turn toward person
            elif distance < self.follow_person_distance - 0.5:
                # Person too close, move away
                direction = -(robot_to_person / distance)
                cmd.linear.x = 0.3 * (self.follow_person_distance - distance)
                cmd.angular.z = 0.5 * np.arctan2(direction[1], direction[0])  # Turn away if needed
            else:
                # At appropriate distance, just face person
                direction = robot_to_person / distance
                cmd.angular.z = 0.5 * np.arctan2(direction[1], direction[0])
        
        elif self.nearest_obstacle:
            # Avoid obstacles
            obstacle_pos = self.nearest_obstacle['world_position']
            robot_to_obstacle = obstacle_pos - self.robot_position
            distance = np.linalg.norm(robot_to_obstacle)
            
            if distance < self.avoid_obstacle_distance:
                # Obstacle too close, move away
                direction = -(robot_to_obstacle / distance)
                avoidance_strength = max(0.2, 1.0 - distance/self.avoid_obstacle_distance)
                cmd.linear.x = -0.3 * avoidance_strength
                cmd.angular.z = 0.8 * np.arctan2(direction[1], direction[0])
        
        elif self.best_interactable:
            # Move toward interactable object
            object_pos = self.best_interactable['world_position']
            robot_to_object = object_pos - self.robot_position
            distance = np.linalg.norm(robot_to_object)
            
            if distance > self.interaction_distance:
                # Move toward object
                direction = robot_to_object / distance
                cmd.linear.x = min(self.max_approach_speed, 0.5 * (distance - self.interaction_distance + 0.5))
                cmd.angular.z = 0.5 * np.arctan2(direction[1], direction[0])
            elif distance < self.interaction_distance - 0.3:
                # Too close, move back
                direction = -(robot_to_object / distance)
                cmd.linear.x = 0.2 * (self.interaction_distance - distance)
        
        return cmd

    def generate_gaze_command(self):
        """
        Generate gaze commands to look at detected objects
        """
        target_pos = None
        
        # Priority: interactable objects > humans > other targets
        if self.best_interactable:
            target_pos = self.best_interactable['world_position']
        elif self.best_human:
            target_pos = self.best_human['world_position']
        
        if target_pos is not None:
            # Convert to gaze command
            gaze_point = Point()
            gaze_point.x = target_pos[0]
            gaze_point.y = target_pos[1]
            gaze_point.z = 1.0  # Eye level height
            
            return gaze_point
        
        return None

    def image_to_world_coordinates(self, img_x, img_y, class_type):
        """
        Convert image coordinates to world coordinates using camera parameters
        """
        # This would use camera intrinsic/extrinsic parameters and depth information
        # For this example, using a simplified approach
        # In practice, this would come from the depth image and camera calibration
        
        # Assume fixed height and use triangulation
        camera_height = 1.0  # meters
        camera_fov = 60.0  # degrees
        
        # Calculate angular offset
        img_center_x = 320  # for 640x480 image
        img_center_y = 240  # for 640x480 image
        
        angle_x = (img_x - img_center_x) * (camera_fov * np.pi / 180) / 640
        angle_y = (img_y - img_center_y) * (camera_fov * np.pi / 180) / 480
        
        # Estimate distance based on object class (more sophisticated approach would use depth)
        if class_type == 'person':
            estimated_distance = 2.0  # meters
        elif class_type == 'obstacle':
            estimated_distance = 1.0
        elif class_type == 'interactable_object':
            estimated_distance = 1.2
        else:
            estimated_distance = 1.5
        
        # Calculate world coordinates (simplified)
        world_x = self.robot_position[0] + estimated_distance * np.cos(angle_x)
        world_y = self.robot_position[1] + estimated_distance * np.sin(angle_x)
        
        return np.array([world_x, world_y])

    def distance_to_robot(self, point):
        """
        Calculate distance from robot to a point
        """
        return np.linalg.norm(point - self.robot_position)


def main(args=None):
    rclpy.init(args=args)
    node = PerceptionActionControl()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        # Stop robot on shutdown
        stop_cmd = Twist()
        node.cmd_vel_publisher.publish(stop_cmd)
        node.get_logger().info("Perception-action system stopped")
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Sensor Fusion for Robust Perception

### Multi-Modal Perception Fusion

For Physical AI applications, combining vision with other sensors increases robustness:

```python
#!/usr/bin/env python3
"""
Multi-modal sensor fusion for computer vision in Physical AI
"""
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, PointCloud2, Imu
from geometry_msgs.msg import PoseStamped
from nav_msgs.msg import Odometry
from std_msgs.msg import Float32MultiArray
from cv_bridge import CvBridge
import numpy as np
from scipy.spatial.transform import Rotation as R


class MultiModalFusionNode(Node):
    """
    Fuses vision with other sensors for enhanced perception in Physical AI
    """
    def __init__(self):
        super().__init__('multi_modal_fusion')
        
        # Vision
        self.image_sub = self.create_subscription(Image, '/camera/color/image_raw', self.image_callback, 10)
        self.depth_sub = self.create_subscription(Image, '/camera/aligned_depth_to_color/image_raw', self.depth_callback, 10)
        
        # Other sensors
        self.imu_sub = self.create_subscription(Imu, '/camera/imu', self.imu_callback, 10)
        self.odom_sub = self.create_subscription(Odometry, '/odom', self.odom_callback, 10)
        
        # Fusion output
        self.fused_perception_pub = self.create_publisher(Float32MultiArray, '/fused_perception', 10)
        self.enhanced_detections_pub = self.create_publisher(Detection2DArray, '/enhanced_detections', 10)
        
        self.cv_bridge = CvBridge()
        
        # Storage for sensor data
        self.latest_image = None
        self.latest_depth = None
        self.latest_imu = None
        self.latest_odom = None
        
        # Timestamp synchronization
        self.sync_window = 0.05  # 50ms sync window
        
        # Confidence weighting for fusion
        self.vision_weight = 0.7
        self.imu_weight = 0.2
        self.odom_weight = 0.1
        
        self.get_logger().info("Multi-Modal Fusion Node Started")

    def image_callback(self, msg):
        """
        Process image data and store for fusion
        """
        try:
            self.latest_image = {
                'data': msg,
                'timestamp': msg.header.stamp,
                'image': self.cv_bridge.imgmsg_to_cv2(msg, 'bgr8')
            }
            self.attempt_fusion()
        except Exception as e:
            self.get_logger().error(f"Image callback error: {str(e)}")

    def depth_callback(self, msg):
        """
        Process depth data and store for fusion
        """
        try:
            self.latest_depth = {
                'data': msg,
                'timestamp': msg.header.stamp,
                'image': self.cv_bridge.imgmsg_to_cv2(msg, '16UC1')  # Raw depth
            }
            self.attempt_fusion()
        except Exception as e:
            self.get_logger().error(f"Depth callback error: {str(e)}")

    def imu_callback(self, msg):
        """
        Process IMU data for fusion
        """
        self.latest_imu = {
            'data': msg,
            'timestamp': msg.header.stamp
        }
        self.attempt_fusion()

    def odom_callback(self, msg):
        """
        Process odometry data for fusion
        """
        self.latest_odom = {
            'data': msg,
            'timestamp': msg.header.stamp
        }
        self.attempt_fusion()

    def attempt_fusion(self):
        """
        Attempt fusion when all required data is available
        """
        if all([self.latest_image, self.latest_depth, self.latest_imu, self.latest_odom]):
            # Check timestamp synchronicity
            time_diffs = [
                abs((self.latest_image['timestamp'].nanosec - self.latest_depth['timestamp'].nanosec) / 1e9),
                abs((self.latest_image['timestamp'].nanosec - self.latest_imu['timestamp'].nanosec) / 1e9),
                abs((self.latest_image['timestamp'].nanosec - self.latest_odom['timestamp'].nanosec) / 1e9)
            ]
            
            if all(diff < self.sync_window for diff in time_diffs):
                # All data is synchronized, perform fusion
                fused_result = self.fuse_multimodal_data()
                self.publish_fused_result(fused_result)
                
                # Clear processed data
                self.latest_image = None
                self.latest_depth = None
                self.latest_imu = None
                self.latest_odom = None

    def fuse_multimodal_data(self):
        """
        Perform multimodal data fusion
        """
        # Extract visual features
        visual_features = self.extract_visual_features(self.latest_image['image'])
        
        # Extract motion data from IMU
        motion_data = self.extract_motion_from_imu(self.latest_imu['data'])
        
        # Extract position data from odometry
        position_data = self.extract_position_from_odom(self.latest_odom['data'])
        
        # Extract depth features
        depth_features = self.extract_depth_features(
            self.latest_depth['image'], 
            self.latest_image['image']
        )
        
        # Combine all information with confidence weighting
        fused_perception = {
            'visual_features': visual_features,
            'motion_data': motion_data,
            'position_data': position_data,
            'depth_features': depth_features,
            'timestamp': self.get_clock().now().to_msg()
        }
        
        return fused_perception

    def extract_visual_features(self, image):
        """
        Extract relevant visual features from image
        """
        # Convert to grayscale for feature detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Extract ORB features
        orb = cv2.ORB_create(nfeatures=200)
        keypoints, descriptors = orb.detectAndCompute(gray, None)
        
        if keypoints is not None:
            features = {
                'keypoints_count': len(keypoints),
                'keypoint_positions': [(kp.pt[0], kp.pt[1]) for kp in keypoints[:50]],  # Limit for efficiency
                'average_brightness': np.mean(gray),
                'edge_density': self.calculate_edge_density(gray)
            }
        else:
            features = {
                'keypoints_count': 0,
                'keypoint_positions': [],
                'average_brightness': float(np.mean(gray)),
                'edge_density': 0.0
            }
        
        return features

    def extract_motion_from_imu(self, imu_msg):
        """
        Extract motion information from IMU
        """
        # Extract angular velocity and linear acceleration
        angular_velocity = [
            imu_msg.angular_velocity.x,
            imu_msg.angular_velocity.y,
            imu_msg.angular_velocity.z
        ]
        
        linear_acceleration = [
            imu_msg.linear_acceleration.x,
            imu_msg.linear_acceleration.y,
            imu_msg.linear_acceleration.z
        ]
        
        # Calculate magnitude of motions
        ang_vel_mag = np.linalg.norm(angular_velocity)
        lin_acc_mag = np.linalg.norm(linear_acceleration)
        
        return {
            'angular_velocity': angular_velocity,
            'linear_acceleration': linear_acceleration,
            'angular_velocity_magnitude': float(ang_vel_mag),
            'linear_acceleration_magnitude': float(lin_acc_mag)
        }

    def extract_position_from_odom(self, odom_msg):
        """
        Extract position and orientation from odometry
        """
        pose = odom_msg.pose.pose
        
        # Convert orientation quaternion to Euler angles
        quaternion = [pose.orientation.x, pose.orientation.y, pose.orientation.z, pose.orientation.w]
        r = R.from_quat(quaternion)
        euler = r.as_euler('xyz')
        
        return {
            'position': [pose.position.x, pose.position.y, pose.position.z],
            'orientation_quat': quaternion,
            'orientation_euler': euler.tolist(),
            'linear_velocity': [
                odom_msg.twist.twist.linear.x,
                odom_msg.twist.twist.linear.y,
                odom_msg.twist.twist.linear.z
            ]
        }

    def extract_depth_features(self, depth_image, color_image):
        """
        Extract features from depth information
        """
        # Convert from mm to meters
        depth_meters = depth_image.astype(np.float32) / 1000.0
        
        # Calculate depth statistics
        valid_depths = depth_meters[depth_meters > 0.1]  # Only consider valid depths > 10cm
        
        if len(valid_depths) > 0:
            depth_features = {
                'min_depth': float(np.min(valid_depths)),
                'max_depth': float(np.max(valid_depths)),
                'mean_depth': float(np.mean(valid_depths)),
                'std_depth': float(np.std(valid_depths)),
                'valid_pixels': len(valid_depths),
                'total_pixels': depth_meters.size,
                'valid_ratio': len(valid_depths) / depth_meters.size
            }
        else:
            depth_features = {
                'min_depth': 0.0,
                'max_depth': 0.0,
                'mean_depth': 0.0,
                'std_depth': 0.0,
                'valid_pixels': 0,
                'total_pixels': depth_meters.size,
                'valid_ratio': 0.0
            }
        
        return depth_features

    def calculate_edge_density(self, gray_image):
        """
        Calculate edge density in image for texture analysis
        """
        edges = cv2.Canny(gray_image, 50, 150)
        edge_pixels = np.sum(edges > 0)
        total_pixels = edges.size
        return float(edge_pixels) / total_pixels

    def publish_fused_result(self, fused_data):
        """
        Publish fused perception results
        """
        # Convert dictionary to Float32MultiArray for publication
        # In practice, you might want to create a custom message type for fused perception
        result = Float32MultiArray()
        result.layout.dim = []
        
        # Flatten the fused_data into a list of floats
        flattened_data = [
            fused_data['visual_features']['keypoints_count'],
            fused_data['visual_features']['average_brightness'],
            fused_data['visual_features']['edge_density'],
            fused_data['motion_data']['angular_velocity_magnitude'],
            fused_data['motion_data']['linear_acceleration_magnitude'],
            fused_data['position_data']['position'][0],  # x
            fused_data['position_data']['position'][1],  # y
            fused_data['position_data']['position'][2],  # z
            fused_data['depth_features']['mean_depth'],
            fused_data['depth_features']['valid_ratio']
        ]
        
        result.data = flattened_data
        result.header.stamp = fused_data['timestamp']
        result.header.frame_id = 'fused_perception_frame'
        
        self.fused_perception_publisher.publish(result)
        
        self.get_logger().debug(f"Published fused perception data: {len(flattened_data)} values")


def main(args=None):
    rclpy.init(args=args)
    node = MultiModalFusionNode()
    
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

## Troubleshooting Computer Vision in Physical AI

### Common Issues and Solutions

1. **Insufficient Feature Points**: In textureless environments, add artificial markers or increase exposure
2. **Motion Blur**: Use rolling shutter cameras or implement motion compensation
3. **Illumination Changes**: Implement adaptive exposure and histogram equalization
4. **Occlusions**: Use temporal information to maintain tracking
5. **Scale Ambiguity**: Fuse with depth sensors or IMU data
6. **Real-time Performance**: Optimize algorithms, use GPU acceleration, reduce image resolution

### Quality Assurance for CV Systems

```bash
# Monitor vision pipeline performance
ros2 run tf2_tools view_frames
ros2 topic hz /camera/color/image_raw
ros2 topic hz /cv/detections

# Check processing latency
ros2 run topic_tools delay /camera/color/image_raw
ros2 run topic_tools delay /cv/detections

# Monitor computational resources
nvidia-smi  # For GPU usage
htop        # For CPU usage
```

## Conclusion

Computer vision in Physical AI represents a confluence of traditional computer vision techniques with embodied intelligence principles. The key aspects covered in this chapter include:

1. **Multi-sensor integration**: Combining visual, depth, and inertial data for robust perception
2. **Real-time performance**: Optimizing algorithms for continuous, real-world operation
3. **Embodied understanding**: Moving beyond scene understanding to understanding the robot's interaction possibilities
4. **Deep learning integration**: Leveraging modern neural networks for complex visual understanding
5. **Perception-action coupling**: Closing the loop between visual perception and robot behavior

In Physical AI systems, computer vision becomes part of a larger perceptual apparatus that includes tactile, proprioceptive, and other sensory modalities. The vision system must not only recognize and understand the world but do so in a way that supports the robot's physical interaction with that world.

As we progress through this book, we'll see how these computer vision foundations integrate with navigation systems, manipulation algorithms, and ultimately enable humanoid robots to operate effectively in human environments. The fusion of multiple modalities creates the rich sensory understanding that Physical AI systems need to make intelligent decisions in real-time.