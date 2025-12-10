# Troubleshooting Guide for Physical AI & Humanoid Robotics

## Overview

This troubleshooting guide addresses common issues encountered in Physical AI and humanoid robotics projects. It provides systematic approaches to diagnose and resolve problems in vision, language, action, and integration systems.

## General Troubleshooting Principles

### 1. Systematic Debugging Approach
1. **Observe**: Carefully note the symptoms and conditions
2. **Hypothesize**: Formulate educated guesses about the root cause
3. **Test**: Design experiments to validate hypotheses
4. **Implement**: Apply solutions based on confirmed causes
5. **Verify**: Confirm the solution resolves the issue

### 2. Common Problem Patterns
- **Integration Issues**: Problems between modules/components
- **Performance Degradation**: Slower or less accurate than expected
- **Hardware Failures**: Physical components not functioning
- **Environmental Factors**: Issues caused by surroundings
- **Software Limitations**: Bugs or capacity limits in code

## Vision System Troubleshooting

### Problem: Object Detection Not Working
**Symptoms**: Vision system fails to detect objects or detects incorrect objects

**Solutions**:
1. **Check lighting conditions**: Ensure adequate lighting, avoid glare
2. **Verify camera calibration**: Recalibrate camera intrinsic parameters
3. **Update detection model**: Use model trained on similar objects/environment
4. **Adjust confidence thresholds**: Lower threshold temporarily for testing

```python
# camera_calibration_tool.py
import cv2
import numpy as np

def recalibrate_camera(camera_id=0):
    """Recalibrate camera using checkerboard pattern."""
    cap = cv2.VideoCapture(camera_id)
    
    # Define checkerboard dimensions
    checkerboard_dims = (9, 6)
    frame_shape = None
    obj_points = []  # 3D points in real world space
    img_points = []  # 2D points in image plane
    
    print("Place checkerboard in view and press SPACE to capture images, ESC to finish")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        ret, corners = cv2.findChessboardCorners(gray, checkerboard_dims, None)
        
        if ret:
            # Refine corner locations
            refined_corners = cv2.cornerSubPix(
                gray, corners, (11, 11), (-1, -1),
                (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
            )
            
            cv2.drawChessboardCorners(frame, checkerboard_dims, refined_corners, ret)
        
        cv2.imshow('Camera Calibration', frame)
        key = cv2.waitKey(1) & 0xFF
        
        if key == ord(' ') and ret:  # Space to capture
            obj_points.append(create_3d_points(checkerboard_dims))
            img_points.append(refined_corners)
            print(f"Captured image {len(obj_points)}")
            
        elif key == 27:  # ESC to finish
            break
    
    cap.release()
    cv2.destroyAllWindows()
    
    if len(obj_points) >= 10:  # Need at least 10 images for good calibration
        ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera(
            obj_points, img_points, gray.shape[::-1], None, None
        )
        
        # Save calibration parameters
        calibration_data = {
            'camera_matrix': mtx.tolist(),
            'distortion_coefficients': dist.tolist()
        }
        
        import json
        with open('camera_calibration.json', 'w') as f:
            json.dump(calibration_data, f)
        
        print("Camera calibrated successfully!")
        return mtx, dist
    else:
        print("Insufficient images captured for calibration")
        return None, None

def create_3d_points(pattern_size):
    """Create 3D points for checkerboard pattern."""
    obj_points = np.zeros((pattern_size[0] * pattern_size[1], 3), np.float32)
    obj_points[:, :2] = np.mgrid[0:pattern_size[0], 0:pattern_size[1]].T.reshape(-1, 2)
    return obj_points.astype(np.float32)
```

### Problem: Vision System Performance Slow
**Symptoms**: High latency in visual processing, low frame rate

**Solutions**:
1. **Reduce resolution**: Process smaller images
2. **Optimize model**: Use quantized or smaller models
3. **GPU acceleration**: Ensure proper hardware acceleration
4. **Threading**: Process images asynchronously

### Problem: Depth Perception Inaccuracies
**Symptoms**: Incorrect distance measurements, unreliable depth estimates

**Solutions**:
1. **Verify stereo calibration**: Check both camera alignment and individual calibrations
2. **Lighting adjustment**: Ensure adequate texture and lighting for depth algorithms
3. **Filtering**: Apply appropriate filtering to depth maps
4. **Hardware check**: Verify depth sensor functionality

```python
# depth_verification.py
def verify_depth_accuracy(depth_map, known_distances):
    """Verify depth map accuracy against known distances."""
    errors = []
    for point, known_distance in known_distances:
        measured_distance = depth_map[point[1], point[0]]
        error = abs(measured_distance - known_distance)
        errors.append(error)
        print(f"Expected: {known_distance:.3f}m, Measured: {measured_distance:.3f}m, Error: {error:.3f}m")
    
    avg_error = sum(errors) / len(errors) if errors else float('inf')
    print(f"Average depth error: {avg_error:.3f}m")
    
    return avg_error < 0.05  # Acceptable if average error < 5cm

def apply_depth_filtering(depth_map, filter_type='median'):
    """Apply filtering to improve depth map quality."""
    if filter_type == 'median':
        return cv2.medianBlur(depth_map, 5)
    elif filter_type == 'bilateral':
        return cv2.bilateralFilter(depth_map, 9, 75, 75)
    elif filter_type == 'gaussian':
        return cv2.GaussianBlur(depth_map, (5, 5), 0)
    else:
        return depth_map  # No filtering
```

## Language System Troubleshooting

### Problem: Language Understanding Fails
**Symptoms**: Robot doesn't understand commands or misinterprets requests

**Solutions**:
1. **Audio quality**: Check microphone gain and ambient noise
2. **Language model**: Verify model loaded correctly and has right context
3. **Preprocessing**: Ensure text preprocessing pipeline works correctly
4. **Context tracking**: Check for issues in maintaining conversation context

```python
# speech_diagnostic.py
import speech_recognition as sr

def diagnose_speech_system():
    """Diagnostic for speech recognition system."""
    recognizer = sr.Recognizer()
    mic = sr.Microphone()
    
    print("Adjusting for ambient noise...")
    with mic as source:
        recognizer.adjust_for_ambient_noise(source, duration=2)
    
    print("Current energy threshold:", recognizer.energy_threshold)
    
    # Test recording
    print("Please say 'test command' to verify audio input...")
    with mic as source:
        audio = recognizer.listen(source, timeout=5)
    
    try:
        text = recognizer.recognize_google(audio)
        print("Recognized text:", text)
        
        if 'test' in text.lower():
            print("✓ Audio input working correctly")
            return True
        else:
            print("✗ Audio input detected but text seems incorrect")
            return False
    except sr.WaitTimeoutError:
        print("✗ Audio recording timed out - mic may be muted or broken")
        return False
    except sr.UnknownValueError:
        print("✗ Could not understand audio - may need to adjust threshold or environment")
        return False
    except sr.RequestError as e:
        print(f"✗ Speech recognition service error: {e}")
        return False

def analyze_language_model_performance():
    """Analyze the performance of language understanding model."""
    test_cases = [
        ("Go to the kitchen", "navigation_request"),
        ("Pick up the red cup", "object_manipulation"),
        ("What do you see?", "information_query"),
        ("Tell me about the objects", "information_query")
    ]
    
    correct = 0
    total = len(test_cases)
    
    for text, expected_intent in test_cases:
        detected_intent = language_model.classify_intent(text)
        if detected_intent == expected_intent:
            correct += 1
            print(f"✓ '{text}' -> {detected_intent}")
        else:
            print(f"✗ '{text}' -> {detected_intent}, expected {expected_intent}")
    
    accuracy = correct / total if total > 0 else 0
    print(f"\nIntent classification accuracy: {accuracy:.2%}")
    
    return accuracy
```

### Problem: Context Loss During Conversations
**Symptoms**: Robot loses track of conversation topic or object references

**Solutions**:
1. **Implement context persistence**: Store context in memory or database
2. **Robust reference resolution**: Improve coreference resolution
3. **Clarification prompts**: Ask for clarification when context is ambiguous
4. **Dialogue state management**: Implement proper state tracking

```python
# context_manager.py
class DialogueContextManager:
    def __init__(self):
        self.conversation_history = []
        self.coreference_stack = []
        self.object_references = {}
        self.topic_stack = []
    
    def update_context(self, user_utterance, system_response):
        """Update conversation context based on new input."""
        # Extract entities from user utterance
        entities = self.extract_entities(user_utterance)
        
        # Resolve coreferences (pronouns, demonstratives)
        resolved_utterance = self.resolve_coreferences(user_utterance)
        
        # Update object references
        self.update_object_references(entities)
        
        # Update topic
        new_topic = self.identify_topic(resolved_utterance)
        self.topic_stack.append(new_topic)
        
        # Add to conversation history
        turn = {
            'timestamp': time.time(),
            'user_utterance': user_utterance,
            'resolved_utterance': resolved_utterance,
            'entities': entities,
            'system_response': system_response,
            'topic': new_topic
        }
        
        self.conversation_history.append(turn)
        
        # Limit history size to avoid memory issues
        if len(self.conversation_history) > 50:  # Keep last 50 turns
            self.conversation_history = self.conversation_history[-50:]
    
    def resolve_coreferences(self, utterance):
        """Resolve pronouns and demonstratives to specific objects."""
        # Simple approach: find the most recent reference for pronouns
        words = utterance.split()
        resolved_words = []
        
        for word in words:
            if word.lower() in ['it', 'that', 'this', 'them', 'those']:
                # Find most recent object reference
                most_recent_obj = self.get_most_recent_object()
                if most_recent_obj:
                    resolved_words.append(most_recent_obj)
                else:
                    resolved_words.append(word)  # Keep pronoun if no reference found
            else:
                resolved_words.append(word)
        
        return ' '.join(resolved_words)
    
    def extract_entities(self, text):
        """Extract named entities from text."""
        # In practice, use NLP library like spaCy
        # This is a simplified implementation
        import re
        
        # Look for nouns that might be objects
        candidates = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        entities = []
        
        # Filter for likely object references
        for candidate in candidates:
            if self.is_likely_object(candidate):
                entities.append({'text': candidate, 'type': 'object'})
        
        return entities
    
    def is_likely_object(self, word):
        """Simple heuristic to determine if word refers to an object."""
        object_keywords = [
            'cup', 'bowl', 'book', 'chair', 'table', 'box', 'cabinet',
            'person', 'robot', 'arm', 'hand', 'gripper', 'object'
        ]
        return word.lower() in object_keywords
    
    def get_most_recent_object(self):
        """Get the most recently referenced object."""
        for i in range(len(self.conversation_history) - 1, -1, -1):
            turn = self.conversation_history[i]
            if turn.get('entities'):
                for entity in turn['entities']:
                    if entity['type'] == 'object':
                        return entity['text']
        return None
```

## Action System Troubleshooting

### Problem: Movement Execution Fails
**Symptoms**: Robot doesn't move as commanded, or movement is imprecise

**Solutions**:
1. **Check joint limits**: Verify requested positions are within limits
2. **Verify calibration**: Confirm robot is properly calibrated
3. **Adjust control parameters**: Tune PID gains or other controllers
4. **Collision checking**: Ensure path is clear

```python
# motion_diagnostic.py
def diagnose_motion_issue(robot_controller, target_pose):
    """Diagnose why motion execution is failing."""
    current_pose = robot_controller.get_current_pose()
    
    # Check if target is reachable
    if not robot_controller.is_reachable(target_pose):
        print("❌ Target pose is not kinematically reachable")
        return False
    
    # Check for joint limit violations
    joint_angles = robot_controller.inverse_kinematics(target_pose)
    joint_limits = robot_controller.get_joint_limits()
    
    for i, angle in enumerate(joint_angles):
        if angle < joint_limits['lower'][i] or angle > joint_limits['upper'][i]:
            print(f"❌ Joint {i} would exceed limits: {angle}° (limits: {joint_limits['lower'][i]}° to {joint_limits['upper'][i]}°)")
            return False
    
    # Check for collisions
    path = robot_controller.plan_path(current_pose, target_pose)
    collision_free = robot_controller.check_path_for_collisions(path)
    
    if not collision_free:
        print("❌ Path contains collisions")
        return False
    
    # If all checks pass, try executing the motion
    try:
        success = robot_controller.move_to_pose(target_pose)
        if success:
            print("✅ Motion executed successfully")
            return True
        else:
            print("❌ Motion execution reported failure")
            return False
    except Exception as e:
        print(f"❌ Motion execution threw exception: {e}")
        return False

def tune_pid_controller(robot_controller, joint_idx, target_pose):
    """Automatically tune PID controller for a joint."""
    # Simple iterative tuning approach
    best_params = None
    best_performance = float('inf')
    
    # Test different parameter combinations
    for kp in np.arange(0.1, 2.0, 0.2):
        for ki in np.arange(0, 0.5, 0.05):
            for kd in np.arange(0, 0.5, 0.05):
                
                # Apply parameters
                robot_controller.set_pid_parameters(joint_idx, kp, ki, kd)
                
                # Test performance
                start_time = time.time()
                robot_controller.move_to_pose(target_pose)
                response_time = time.time() - start_time
                
                # Check for overshoot and settling time
                error = calculate_stability_metrics(robot_controller, joint_idx)
                performance_score = response_time + error  # Balance speed and accuracy
                
                if performance_score < best_performance:
                    best_performance = performance_score
                    best_params = (kp, ki, kd)
    
    # Apply best parameters found
    robot_controller.set_pid_parameters(joint_idx, *best_params)
    print(f"✅ Tuned PID parameters for joint {joint_idx}: {best_params}")
    
    return best_params
```

### Problem: Grasping Consistently Fails
**Symptoms**: Robot consistently fails to grasp objects, dropping them or missing completely

**Solutions**:
1. **Verify grasp planning**: Ensure grasp pose is appropriate for object
2. **Check gripper calibration**: Confirm gripper state and positioning
3. **Adjust force control**: Modify gripping force for object properties
4. **Improve object localization**: Increase precision of object position determination

```python
# grasping_diagnostic.py
def analyze_grasp_failure(robot_controller, object_info, grasp_pose):
    """Analyze reasons for grasp failures."""
    analysis = {
        'approach_angle': [],
        'contact_points': [],
        'force_data': [],
        'slippage_detected': False
    }
    
    # Execute grasp with detailed monitoring
    robot_controller.start_data_collection()
    success = robot_controller.execute_grasp(grasp_pose)
    data = robot_controller.stop_data_collection()
    
    # Analyze force/torque data
    force_data = data.get('force_torque', [])
    if force_data:
        contact_magnitude = np.mean([np.linalg.norm(f) for f in force_data[:10]])  # First 10 readings
        analysis['contact_force'] = contact_magnitude
        
        # Check for excessive oscillations (indicating slippage)
        force_variance = np.var([np.linalg.norm(f) for f in force_data])
        analysis['force_variance'] = force_variance
        analysis['slippage_detected'] = force_variance > 50  # Threshold for slippage
    
    # Analyze position error
    final_pose = robot_controller.get_current_pose()
    expected_pose = robot_controller.calculate_grasp_success_pose(grasp_pose, object_info)
    position_error = np.linalg.norm(np.array(final_pose) - np.array(expected_pose))
    analysis['position_error'] = position_error
    
    print(f"Grasp analysis:")
    print(f"  Success: {success}")
    print(f"  Contact force: {analysis['contact_force']:.2f}")
    print(f"  Force variance: {analysis['force_variance']:.2f}")
    print(f"  Position error: {analysis['position_error']:.3f}m")
    print(f"  Slippage detected: {analysis['slippage_detected']}")
    
    return analysis

def suggest_grasp_improvements(object_info, failure_analysis):
    """Suggest improvements for failed grasps."""
    suggestions = []
    
    # If position error is high, suggest better localization
    if failure_analysis['position_error'] > 0.05:  # 5cm threshold
        suggestions.append("Improve object localization - position error is high")
    
    # If slippage is detected, suggest grip adjustment
    if failure_analysis['slippage_detected']:
        suggestions.append("Increase grip force or try different grasp type for object")
    
    # If contact force is too low, gripper may not be closing properly
    if failure_analysis['contact_force'] < 5.0:  # 5N threshold
        suggestions.append("Check gripper closure - contact force is low")
    
    # Suggest different grasp based on object properties
    if object_info.get('shape') == 'cylindrical':
        suggestions.append("For cylindrical objects, try side-grasping instead of top-grasping")
    elif object_info.get('material') == 'slippery':
        suggestions.append("For slippery surfaces, try precision grip with higher force")
    
    return suggestions
```

## Integration System Troubleshooting

### Problem: Vision-Language-Action Mismatch
**Symptoms**: System receives command, sees objects, but performs wrong action

**Solutions**:
1. **Trace execution pathway**: Log each step to identify where mismatch occurs
2. **Verify data formats**: Ensure data passes between modules in correct format
3. **Check timing**: Ensure visual and linguistic inputs are properly synchronized
4. **Validate mapping**: Confirm command-object-action mapping is correct

```python
# integration_diagnostic.py
class IntegrationDiagnosticTool:
    def __init__(self, vision_system, language_system, action_planner):
        self.vision_system = vision_system
        self.language_system = language_system
        self.action_planner = action_planner
        
        # Logging for tracing execution
        self.execution_trace = []
    
    def trace_vla_execution(self, command):
        """Trace full VLA execution to identify bottlenecks."""
        trace_entry = {
            'command': command,
            'timestamp': time.time(),
            'step_results': {}
        }
        
        print("Tracing VLA execution...")
        
        # Step 1: Language processing
        try:
            language_result = self.language_system.interpret_command(command)
            trace_entry['step_results']['language'] = {
                'intent': language_result.get('intent'),
                'entities': language_result.get('entities'),
                'confidence': language_result.get('confidence', 0.0),
                'success': True
            }
            print(f"✓ Language processing: intent={language_result.get('intent')}")
        except Exception as e:
            trace_entry['step_results']['language'] = {
                'error': str(e),
                'success': False
            }
            print(f"✗ Language processing failed: {e}")
        
        # Step 2: Vision processing
        try:
            vision_result = self.vision_system.get_perception()
            trace_entry['step_results']['vision'] = {
                'objects_detected': len(vision_result.get('objects', [])),
                'scene_description': vision_result.get('scene_description'),
                'success': True
            }
            print(f"✓ Vision processing: detected {len(vision_result.get('objects', []))} objects")
        except Exception as e:
            trace_entry['step_results']['vision'] = {
                'error': str(e),
                'success': False
            }
            print(f"✗ Vision processing failed: {e}")
        
        # Step 3: Action planning
        language_res = trace_entry['step_results'].get('language', {})
        vision_res = trace_entry['step_results'].get('vision', {})
        
        if language_res.get('success') and vision_res.get('success'):
            try:
                action_plan = self.action_planner.create_plan(
                    language_result=language_result,
                    vision_result=vision_result
                )
                trace_entry['step_results']['action'] = {
                    'actions_planned': len(action_plan.get('actions', [])),
                    'plan_valid': len(action_plan.get('actions', [])) > 0,
                    'success': True
                }
                print(f"✓ Action planning: created {len(action_plan.get('actions', []))} actions")
            except Exception as e:
                trace_entry['step_results']['action'] = {
                    'error': str(e),
                    'success': False
                }
                print(f"✗ Action planning failed: {e}")
        else:
            trace_entry['step_results']['action'] = {
                'error': 'Previous steps failed',
                'success': False
            }
            print("✗ Action planning skipped due to upstream failures")
        
        self.execution_trace.append(trace_entry)
        
        # Analyze potential mismatches
        self.analyze_trace_mismatches(trace_entry)
        
        return trace_entry
    
    def analyze_trace_mismatches(self, trace_entry):
        """Analyze execution trace for potential mismatches."""
        lang_result = trace_entry['step_results'].get('language', {})
        vis_result = trace_entry['step_results'].get('vision', {})
        action_result = trace_entry['step_results'].get('action', {})
        
        # Check if command entities match detected objects
        if lang_result.get('success') and vis_result.get('success'):
            command_entities = [e['text'] for e in lang_result['entities']]
            detected_objects = [obj['name'] for obj in vis_result['objects_detected']]
            
            common_entities = set(command_entities) & set(detected_objects)
            if not common_entities:
                print(f"⚠️  Potential mismatch: Command mentions {command_entities} but detected {detected_objects}")
        
        # Check action validity
        if action_result.get('success'):
            if not action_result.get('plan_valid', False):
                print(f"⚠️  Action plan created but appears invalid")
    
    def run_vla_integrity_check(self):
        """Run comprehensive integrity check on VLA system."""
        check_results = {
            'vision_language_alignment': self.check_vision_language_alignment(),
            'language_action_mapping': self.check_language_action_mapping(),
            'timing_synchronization': self.check_timing_synchronization(),
            'data_format_compatibility': self.check_data_format_compatibility()
        }
        
        return check_results
    
    def check_vision_language_alignment(self):
        """Check that vision and language modules agree on object identification."""
        # Get current visual scene
        vision_output = self.vision_system.get_perception()
        detected_objects = [obj['name'] for obj in vision_output['objects']]
        
        # Test language understanding with descriptions of these objects
        test_commands = [f"Describe the {obj}" for obj in detected_objects[:3]]  # Test first 3 objects
        
        correct_identifications = 0
        total_tests = len(test_commands)
        
        for cmd in test_commands:
            lang_result = self.language_system.interpret_command(cmd)
            # Check if language system correctly identified the object
            entities = lang_result.get('entities', [])
            if any(obj.lower() in ent['text'].lower() for ent in entities for obj in detected_objects):
                correct_identifications += 1
        
        accuracy = correct_identifications / total_tests if total_tests > 0 else 0
        return {
            'accuracy': accuracy,
            'passed': accuracy >= 0.8,
            'details': f"{correct_identifications}/{total_tests} alignments correct"
        }
```

## Performance Optimization

### Problem: System Performance Degrades Over Time
**Symptoms**: Increasing response time, memory leaks, decreasing accuracy

**Solutions**:
1. **Memory profiling**: Identify and fix memory leaks
2. **Caching strategies**: Cache repeated computations
3. **Resource management**: Proper resource allocation and cleanup
4. **Model optimization**: Optimize neural networks for performance

```python
# performance_profiler.py
import psutil
import time
import gc
from functools import wraps

def monitor_performance(func):
    """Decorator to monitor function performance."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        start_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        
        result = func(*args, **kwargs)
        
        end_time = time.time()
        end_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        
        execution_time = end_time - start_time
        memory_delta = end_memory - start_memory
        
        if execution_time > 1.0:  # If function took more than 1 second
            print(f"⚠️  Long execution: {func.__name__} took {execution_time:.2f}s")
        
        if memory_delta > 100:  # If function allocated >100MB
            print(f"⚠️  High memory usage: {func.__name__} allocated {memory_delta:.2f}MB")
        
        return result
    return wrapper

class ResourceManager:
    def __init__(self):
        self.resources = {}
        self.cleanup_hooks = []
    
    def register_resource(self, name, resource, cleanup_hook=None):
        """Register a resource for monitoring and cleanup."""
        self.resources[name] = {
            'resource': resource,
            'created_at': time.time(),
            'cleanup_hook': cleanup_hook
        }
    
    def cleanup_unused_resources(self):
        """Clean up resources that are no longer needed."""
        for name, res_data in list(self.resources.items()):
            age = time.time() - res_data['created_at']
            
            # Clean up resources older than 1 hour if they're not actively being used
            if age > 3600:  # 1 hour
                if res_data['cleanup_hook']:
                    res_data['cleanup_hook'](res_data['resource'])
                del self.resources[name]
                print(f"Cleaned up resource: {name}")

# Memory optimization for vision models
def optimize_model_inference(model):
    """Apply optimizations for model inference."""
    # Use half precision if supported
    if torch.cuda.is_available():
        model.half()  # Convert to FP16
    
    # Set model to evaluation mode
    model.eval()
    
    # Disable gradients during inference
    for param in model.parameters():
        param.requires_grad = False
    
    return model
```

## Safety System Troubleshooting

### Problem: Safety System Triggers Inappropriately
**Symptoms**: Robot stops frequently, safety constraints too conservative

**Solutions**:
1. **Adjust safety thresholds**: Fine-tune sensitivity parameters
2. **Calibrate sensors**: Verify that safety sensors are properly calibrated
3. **Review safety constraints**: Ensure constraints are appropriate for task
4. **Test in controlled environment**: Validate safety system in safe setting

```python
# safety_system_diagnostic.py
def diagnose_safety_system(safety_monitor):
    """Diagnose issues with safety monitoring system."""
    diagnostic_results = {
        'emergency_stop_responsiveness': check_emergency_stop(safety_monitor),
        'collision_detection_sensitivity': check_collision_sensitivity(safety_monitor),
        'force_limit_monitoring': check_force_monitoring(safety_monitor),
        'zone_boundary_enforcement': check_zone_boundaries(safety_monitor)
    }
    
    return diagnostic_results

def check_emergency_stop(safety_monitor):
    """Check if emergency stop is responsive."""
    start_time = time.time()
    safety_monitor.activate_emergency_stop()
    response_time = time.time() - start_time
    
    # Should respond within 100ms
    responsive = response_time < 0.1
    print(f"Emergency stop response time: {response_time*1000:.1f}ms ({'Responsive' if responsive else 'Too slow'})")
    
    # Check if robot can resume properly
    safety_monitor.deactivate_emergency_stop()
    resumed = safety_monitor.is_operational()
    
    return {
        'responsive': responsive,
        'can_resume': resumed,
        'response_time_ms': response_time * 1000
    }

def validate_safety_zones(robot_model, safety_zones):
    """Validate safety zones don't restrict valid operations."""
    for zone in safety_zones:
        # Check if zone allows required workspace movements
        required_trajectories = robot_model.get_required_trajectories()
        
        for trajectory in required_trajectories:
            if path_intersects_zone(trajectory, zone):
                print(f"⚠️  Safety zone {zone['name']} may interfere with required trajectory")
```

## Hardware Troubleshooting

### Problem: Communication Failures
**Symptoms**: Cannot communicate with robot hardware, intermittent connections

**Solutions**:
1. **Check physical connections**: Verify cables and connectors
2. **Verify network configuration**: Check IP addresses, ports, and protocols
3. **Update firmware/drivers**: Ensure hardware is running latest compatible versions
4. **Check for interference**: Look for sources of electromagnetic interference

```python
# hardware_diagnostic.py
import socket
import serial

def diagnose_hardware_connection(device_config):
    """Diagnose connection issues with robot hardware."""
    diagnostics = {}
    
    # Check network connectivity if device uses network
    if device_config.get('connection_type') == 'network':
        diagnostics['network_connectivity'] = check_network_connection(
            device_config['ip_address'],
            device_config.get('port', 8080)
        )
    
    # Check serial connectivity if device uses serial
    if device_config.get('connection_type') == 'serial':
        diagnostics['serial_connectivity'] = check_serial_connection(
            device_config['port'],
            device_config.get('baud_rate', 115200)
        )
    
    # Check if device responds appropriately
    diagnostics['device_responsiveness'] = test_device_responsiveness(
        device_config['device_identifier']
    )
    
    return diagnostics

def check_network_connection(ip_address, port):
    """Check if device is reachable on network."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)  # 5 second timeout
        result = sock.connect_ex((ip_address, port))
        sock.close()
        
        connected = result == 0
        print(f"Network connectivity to {ip_address}:{port}: {'Connected' if connected else 'Not reachable'}")
        return connected
    except Exception as e:
        print(f"Network check failed: {e}")
        return False

def check_serial_connection(port, baud_rate):
    """Check if serial device is accessible."""
    try:
        ser = serial.Serial(port, baud_rate, timeout=2)
        ser.write(b'test\n')  # Send test command
        response = ser.readline()  # Read response
        ser.close()
        
        responsive = len(response) > 0
        print(f"Serial connection to {port}: {'Responsive' if responsive else 'No response'}")
        return responsive
    except Exception as e:
        print(f"Serial connection failed: {e}")
        return False
```

## Quick Fixes Checklist

When facing common issues, try these quick fixes:

### Vision Issues
- [ ] Restart camera service
- [ ] Check and adjust lighting
- [ ] Recalibrate camera
- [ ] Clear camera lens

### Language Issues
- [ ] Check microphone connection
- [ ] Verify speech service is running
- [ ] Test with different voice levels

### Motion Issues
- [ ] Run robot calibration routine
- [ ] Check for physical obstructions
- [ ] Verify joint limits haven't changed
- [ ] Check power supply levels

### Integration Issues
- [ ] Restart ROS nodes
- [ ] Check network connectivity
- [ ] Verify message formats
- [ ] Look for timing issues

### Performance Issues
- [ ] Monitor system resources
- [ ] Clear cache and temporary files
- [ ] Check for memory leaks
- [ ] Restart application

## Seeking Help

### When to Escalate
- Safety systems are triggering unexpectedly
- Hardware components are physically damaged
- Issues persist after following troubleshooting steps
- Unknown errors in production environment

### Resources for Help
- Manufacturer documentation and support
- ROS and robotics community forums
- Academic papers and research publications
- Colleagues and mentors
- Version control history for changes

This troubleshooting guide provides systematic approaches to identify and resolve issues in Physical AI and humanoid robotics systems. Always approach problems with safety in mind and verify fixes in a safe environment before deploying to operational systems.