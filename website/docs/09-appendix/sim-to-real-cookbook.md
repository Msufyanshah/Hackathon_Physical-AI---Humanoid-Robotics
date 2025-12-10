# Sim-to-Real Transfer Cookbook

## Introduction

The sim-to-real gap remains one of the most significant challenges in robotics. This cookbook provides practical strategies and techniques for transferring capabilities developed in simulation to real-world robotic systems. Each recipe addresses a specific aspect of the sim-to-real transfer problem with concrete implementation advice.

## Recipe 1: Domain Randomization for Robust Perception

### Problem
Simulated environments have perfect textures, lighting, and object properties that don't match real-world variability.

### Solution
Use domain randomization to train perception systems on diverse visual conditions.

```python
# domain_randomization.py
import numpy as np
import cv2
import random

class DomainRandomizer:
    def __init__(self):
        self.lighting_conditions = [
            'bright', 'dim', 'overcast', 'backlit', 'spotlight'
        ]
        self.texture_variations = [
            'smooth', 'rough', 'textured', 'reflective', 'matte'
        ]
        self.camera_parameters = {
            'noise_factors': [0.0, 0.1, 0.2, 0.3],
            'blur_ranges': [(0, 0), (1, 3), (3, 5)],
            'color_temperatures': [3000, 4000, 6000, 7000]  # Kelvin
        }
    
    def apply_domain_randomization(self, image, depth_map=None):
        """Apply randomization to image to increase robustness."""
        randomized_img = image.copy()
        
        # Randomize lighting
        lighting_factor = random.uniform(0.5, 1.5)
        randomized_img = cv2.convertScaleAbs(randomized_img, alpha=lighting_factor, beta=random.uniform(-20, 20))
        
        # Add random noise
        noise_factor = random.choice(self.camera_parameters['noise_factors'])
        if noise_factor > 0:
            noise = np.random.normal(0, noise_factor * 255, randomized_img.shape).astype(np.uint8)
            randomized_img = cv2.add(randomized_img, noise)
        
        # Apply random blur
        blur_kernel = random.choice(self.camera_parameters['blur_ranges'])
        if blur_kernel[0] > 0:
            kernel_size = random.randint(blur_kernel[0], blur_kernel[1])
            if kernel_size % 2 == 0:  # Must be odd for GaussianBlur
                kernel_size += 1
            randomized_img = cv2.GaussianBlur(randomized_img, (kernel_size, kernel_size), 0)
        
        # Randomize color
        temp_factor = random.choice(self.camera_parameters['color_temperatures']) / 6500  # Normalize to daylight
        randomized_img = self.adjust_color_temperature(randomized_img, temp_factor)
        
        return randomized_img
    
    def adjust_color_temperature(self, image, temp_factor):
        """Adjust image color temperature."""
        # Convert to HSV
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV).astype(np.float64)
        
        # Adjust saturation and value based on temperature
        hsv[:,:,1] = hsv[:,:,1] * (0.8 + 0.4 * temp_factor)  # Saturation
        hsv[:,:,2] = hsv[:,:,2] * (0.8 + 0.4 * temp_factor)  # Value
        
        # Clip and convert back
        hsv = np.clip(hsv, 0, 255).astype(np.uint8)
        return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

# Usage in simulation training
domain_rand = DomainRandomizer()

# During simulation training, randomize each image
for episode in range(num_episodes):
    for timestep in range(ep_max_timesteps):
        # Get simulation image
        sim_image = get_simulation_image()
        
        # Apply domain randomization
        randomized_image = domain_rand.apply_domain_randomization(sim_image)
        
        # Use randomized image for training
        train_perception_model(randomized_image, ground_truth)
```

## Recipe 2: System Identification and Parameter Adjustment

### Problem
Physical robots have different dynamics than simulation models due to manufacturing tolerances and wear.

### Solution
Identify system parameters and adjust simulation to match reality.

```python
# system_identification.py
import numpy as np
from scipy.optimize import minimize
from sklearn.gaussian_process import GaussianProcessRegressor
import matplotlib.pyplot as plt

class SystemIdentifier:
    def __init__(self, robot_model):
        self.robot_model = robot_model
        self.simulation_params = robot_model.get_parameters()
        self.real_robot_data = []
        
    def collect_system_data(self, input_trajectory):
        """Collect data from real robot execution."""
        # Execute trajectory on real robot
        real_states = self.execute_trajectory_on_real_robot(input_trajectory)
        
        # Execute same trajectory in simulation
        sim_states = self.execute_trajectory_in_sim(input_trajectory)
        
        return {
            'inputs': input_trajectory,
            'real_states': real_states,
            'sim_states': sim_states
        }
    
    def identify_parameters(self):
        """Identify simulation parameters that minimize sim-to-real gap."""
        # Define objective function to minimize
        def parameter_error(params):
            # Update simulation with new parameters
            self.robot_model.set_parameters(params)
            
            # Test on collected data
            total_error = 0
            for data_point in self.real_robot_data:
                sim_result = self.execute_trajectory_in_sim(data_point['inputs'])
                error = np.mean((np.array(sim_result) - np.array(data_point['real_states']))**2)
                total_error += error
            
            return total_error
        
        # Optimize parameters
        result = minimize(
            parameter_error,
            self.simulation_params,
            method='powell',
            options={'disp': True}
        )
        
        # Update model with optimized parameters
        self.robot_model.set_parameters(result.x)
        return result
    
    def execute_trajectory_on_real_robot(self, trajectory):
        """Execute trajectory on real robot and collect state data."""
        # This would interface with real robot hardware
        states = []
        for state in trajectory:
            # Send command to real robot
            self.robot_model.send_command(state)
            
            # Collect state feedback
            current_state = self.robot_model.get_state_feedback()
            states.append(current_state)
            
        return states
    
    def execute_trajectory_in_sim(self, trajectory):
        """Execute trajectory in simulation."""
        # This would run in simulator
        states = []
        for state in trajectory:
            # Send command to simulated robot
            self.robot_model.send_command(state)
            
            # Advance simulation
            self.robot_model.simulate_step()
            
            # Get simulated state
            current_state = self.robot_model.get_state()
            states.append(current_state)
            
        return states
    
    def adapt_control_for_real_world(self):
        """Adapt control strategies based on identified parameters."""
        # After parameter identification, adjust controllers
        self.identify_parameters()
        
        # Retune PID controllers based on new parameters
        self.retune_controllers()
        
        # Update trajectory planning to account for actuator delays
        self.update_planning_models()
    
    def retune_controllers(self):
        """Retune robot controllers based on identified parameters."""
        # For example, if joint friction increased, adjust PID gains
        for joint_idx in range(self.robot_model.num_joints):
            # Get identified friction parameter
            friction = self.simulation_params[f'joint_{joint_idx}_friction']
            
            # Adjust gain based on friction
            if friction > 0.1:  # If significantly higher than nominal
                self.robot_model.pids[joint_idx].increase_proportional_gain(1.2)  # Boost gain by 20%
    
    def update_planning_models(self):
        """Update motion planners with identified parameters."""
        # Update with new actuator dynamics
        for joint_idx in range(self.robot_model.num_joints):
            # Adjust for identified delays or bandwidth limitations
            delay = self.simulation_params[f'joint_{joint_idx}_delay']
            bandwidth = self.simulation_params[f'joint_{joint_idx}_bandwidth']
            
            self.robot_model.planners[joint_idx].update_dynamics(delay, bandwidth)
```

## Recipe 3: Reality-Guided Training

### Problem
Pure simulation training doesn't capture real-world nuances and disturbances.

### Solution
Use a small amount of real robot data to guide simulation training.

```python
# reality_guided_training.py
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

class RealityGuidedTrainer:
    def __init__(self, model, real_data_loader, sim_data_loader):
        self.model = model
        self.real_loader = real_data_loader
        self.sim_loader = sim_data_loader
        
        # Loss function that balances sim and real data
        self.sim_loss_fn = nn.MSELoss()
        self.real_loss_fn = nn.MSELoss()
        self.alignment_loss_fn = nn.MSELoss()
        
        self.optimizer = optim.Adam(model.parameters(), lr=0.001)
        
        # Weighting parameters
        self.sim_weight = 0.7
        self.real_weight = 0.2
        self.alignment_weight = 0.1
        
    def train_with_reality_guidance(self, epochs=100):
        """Train model with guidance from real-world data."""
        for epoch in range(epochs):
            total_loss = 0
            batch_count = 0
            
            # Iterate through simulation and real data together
            for (sim_batch, real_batch) in zip(self.sim_loader, self.real_loader):
                # Forward pass on simulation data
                sim_inputs, sim_targets = sim_batch
                sim_outputs = self.model(sim_inputs)
                sim_loss = self.sim_loss_fn(sim_outputs, sim_targets)
                
                # Forward pass on real data
                real_inputs, real_targets = real_batch
                real_outputs = self.model(real_inputs)
                real_loss = self.real_loss_fn(real_outputs, real_targets)
                
                # Alignment loss between sim and real outputs for same tasks
                alignment_loss = self.calculate_alignment_loss(sim_inputs, real_inputs)
                
                # Combined loss
                loss = (self.sim_weight * sim_loss + 
                       self.real_weight * real_loss + 
                       self.alignment_weight * alignment_loss)
                
                # Backward pass
                self.optimizer.zero_grad()
                loss.backward()
                self.optimizer.step()
                
                total_loss += loss.item()
                batch_count += 1
            
            avg_loss = total_loss / batch_count
            print(f"Epoch {epoch+1}/{epochs}, Average Loss: {avg_loss:.4f}")
    
    def calculate_alignment_loss(self, sim_inputs, real_inputs):
        """Calculate loss that aligns sim and real world outputs."""
        # Forward pass for both sim and real inputs
        sim_outputs = self.model(sim_inputs)
        real_outputs = self.model(real_inputs)
        
        # Align outputs (this depends on the specific problem)
        # For example, if both should produce similar action distributions:
        return self.alignment_loss_fn(sim_outputs, real_outputs.detach())

# Example usage
def prepare_reality_guided_training():
    # Get real robot data (small dataset)
    real_dataset = collect_real_robot_data()
    real_loader = DataLoader(real_dataset, batch_size=32, shuffle=True)
    
    # Get simulation data (larger dataset)
    sim_dataset = generate_simulation_data()
    sim_loader = DataLoader(sim_dataset, batch_size=64, shuffle=True)
    
    # Create model
    model = create_robot_control_model()
    
    # Create trainer with reality guidance
    trainer = RealityGuidedTrainer(model, real_loader, sim_loader)
    
    # Train with reality guidance
    trainer.train_with_reality_guidance(epochs=200)
    
    return model

def collect_real_robot_data():
    """Collect data from real robot operations."""
    inputs = []
    targets = []
    
    # Execute various tasks on real robot and record:
    # - sensor inputs
    # - commanded actions
    # - actual outcomes
    
    for task in real_robot_tasks:
        input_data = record_sensor_data(task)
        target_data = record_actual_execution(task)
        
        inputs.append(input_data)
        targets.append(target_data)
    
    inputs_tensor = torch.tensor(inputs, dtype=torch.float32)
    targets_tensor = torch.tensor(targets, dtype=torch.float32)
    
    return TensorDataset(inputs_tensor, targets_tensor)
```

## Recipe 4: Progressive Domain Transfer

### Problem
Going directly from simulation to reality often fails due to the large domain gap.

### Solution
Gradually transition through progressively realistic simulation environments.

```python
# progressive_transfer.py
import numpy as np

class ProgressiveTransfer:
    def __init__(self, initial_sim_env, target_real_env):
        self.environments = [
            self.create_clean_sim(),
            self.create_noisy_sim(),
            self.create_dynamic_sim(),
            self.create_realistic_sim(),
            target_real_env  # Actual robot
        ]
        self.current_stage = 0
        self.performance_threshold = 0.85  # 85% performance threshold to advance
        
    def create_clean_sim(self):
        """Pure simulation environment."""
        return {
            'name': 'Clean Simulation',
            'texture_realism': 0.1,
            'physics_noise': 0.01,
            'lighting_variability': 0.05,
            'dynamics_matching': 1.0,
            'sensor_noise': 0.01
        }
    
    def create_noisy_sim(self):
        """Simulation with added noise but clean textures."""
        return {
            'name': 'Noisy Simulation',
            'texture_realism': 0.1,
            'physics_noise': 0.05,
            'lighting_variability': 0.1,
            'dynamics_matching': 0.95,
            'sensor_noise': 0.05
        }
    
    def create_dynamic_sim(self):
        """Simulation with variable dynamics."""
        return {
            'name': 'Dynamic Simulation',
            'texture_realism': 0.3,
            'physics_noise': 0.1,
            'lighting_variability': 0.2,
            'dynamics_matching': 0.9,
            'sensor_noise': 0.1
        }
    
    def create_realistic_sim(self):
        """Simulation with high realism."""
        return {
            'name': 'Realistic Simulation',
            'texture_realism': 0.8,
            'physics_noise': 0.2,
            'lighting_variability': 0.4,
            'dynamics_matching': 0.85,
            'sensor_noise': 0.2
        }
    
    def train_on_current_stage(self, model, episodes=1000):
        """Train model on current environment stage."""
        env = self.environments[self.current_stage]
        print(f"Training on stage: {env['name']}")
        
        for episode in range(episodes):
            # Train on current environment
            performance = self.run_episode(model, env)
            
            # Check if ready to advance
            if episode % 100 == 0:
                avg_performance = self.evaluate_performance(model, env, 50)
                if avg_performance >= self.performance_threshold and self.current_stage < len(self.environments) - 1:
                    print(f"Advancing to next stage ({avg_performance:.2f} performance)")
                    self.current_stage += 1
                    break
        
        return model
    
    def run_episode(self, model, env):
        """Run single training episode in environment."""
        # Implementation would run robot tasks in specified environment
        # Return performance metric
        pass
    
    def evaluate_performance(self, model, env, eval_episodes=10):
        """Evaluate model performance on environment."""
        total_score = 0
        for _ in range(eval_episodes):
            score = self.run_evaluation_episode(model, env)
            total_score += score
        
        return total_score / eval_episodes
    
    def run_evaluation_episode(self, model, env):
        """Run evaluation episode in environment."""
        # Implementation would run robot in environment and return score
        pass
    
    def execute_progressive_transfer(self, model):
        """Execute the complete progressive transfer strategy."""
        for stage_idx in range(len(self.environments)):
            self.current_stage = stage_idx
            print(f"\n--- TRANSFER STAGE {stage_idx + 1}/{len(self.environments)} ---")
            print(f"Environment: {self.environments[stage_idx]['name']}")
            
            # Train on current environment
            model = self.train_on_current_stage(model, episodes=2000)
            
            # Evaluate before transferring to next stage
            perf = self.evaluate_performance(model, self.environments[stage_idx])
            print(f"Stage {stage_idx + 1} achieved {perf:.2f} performance")
        
        print("\nProgressive transfer completed!")
        return model
```

## Recipe 5: Robust Control with Sim-to-Real Adaptation

### Problem
Controllers optimized in simulation may be unstable on real robot with different dynamics.

### Solution
Design robust controllers that can adapt to real-world uncertainties.

```python
# robust_adaptive_control.py
import numpy as np
from scipy import signal
import control  # python-control package

class RobustAdaptiveController:
    def __init__(self, nominal_robot_model):
        self.nominal_model = nominal_robot_model
        self.uncertainty_estimator = UncertaintyEstimator()
        self.adaptive_element = AdaptiveElement()
        self.robut_controller = self.design_robust_controller()
        
    def design_robust_controller(self):
        """Design a robust controller using H-infinity or mu-synthesis."""
        # Linearize model around operating point
        A, B, C, D = self.linearize_model(self.nominal_model)
        
        # Design baseline controller (e.g., LQR)
        Q = np.eye(A.shape[0])  # State cost matrix
        R = np.eye(B.shape[1])  # Input cost matrix
        K_lqr, S, E = control.lqr(A, B, Q, R)
        
        # Add robustness using H-infinity methods
        # Create augmented system with uncertainty
        P = self.create_augmented_system(A, B, C, D)
        
        # Design H-infinity controller
        # This is a simplified example - full implementation would use more sophisticated methods
        controller = self.synthesize_hinf_controller(P)
        
        return controller
    
    def linearize_model(self, robot_model):
        """Linearize robot dynamics around operating point."""
        # This would implement the Jacobian of dynamics
        # Using finite differences for simplicity
        x_eq = np.zeros(robot_model.state_dimension)
        u_eq = robot_model.get_stable_equilibrium_input()
        
        # Compute A = ∂f/∂x
        A = self.compute_jacobian_x(robot_model, x_eq, u_eq)
        
        # Compute B = ∂f/∂u
        B = self.compute_jacobian_u(robot_model, x_eq, u_eq)
        
        # C and D depend on output definition
        C = np.eye(len(x_eq))  # Full state feedback
        D = np.zeros((len(x_eq), len(u_eq)))
        
        return A, B, C, D
    
    def adapt_to_real_robot(self, initial_performance):
        """Adapt controller parameters based on real robot performance."""
        adaptation_rate = 0.1
        
        for update_iter in range(100):  # Maximum 100 adaptation iterations
            # Execute current controller on real robot
            performance = self.evaluate_on_real_robot()
            
            if performance > 0.95:  # Excellent performance
                print("Controller adaptation complete!")
                break
            
            # Estimate model uncertainty
            uncertainty = self.uncertainty_estimator.estimate(
                self.nominal_model, 
                self.get_real_behavior()
            )
            
            # Adjust controller based on uncertainty
            self.adaptive_element.update(
                self.robust_controller,
                uncertainty,
                adaptation_rate
            )
            
            print(f"Adaptation iteration {update_iter + 1}: Performance improved to {performance:.3f}")
            
            # Reduce adaptation rate over time
            adaptation_rate = max(0.01, adaptation_rate * 0.99)
        
        return self.robust_controller
    
    def evaluate_on_real_robot(self):
        """Evaluate controller on real robot."""
        # Execute standard test trajectories
        test_trajectories = self.generate_test_trajectories()
        
        success_count = 0
        total_trials = 0
        
        for trajectory in test_trajectories:
            try:
                success = self.execute_trajectory(trajectory)
                if success:
                    success_count += 1
                total_trials += 1
            except Exception as e:
                print(f"Trajectory execution failed: {e}")
                total_trials += 1
        
        return success_count / total_trials if total_trials > 0 else 0
    
    def generate_test_trajectories(self):
        """Generate standardized test trajectories."""
        # Generate various movement patterns to test controller
        trajectories = []
        
        # Point-to-point movements
        for _ in range(10):
            start_pos = np.random.uniform(-1, 1, size=(self.nominal_model.dof,))
            end_pos = np.random.uniform(-1, 1, size=(self.nominal_model.dof,))
            traj = self.plan_trajectory(start_pos, end_pos)
            trajectories.append(traj)
        
        # Circular movements
        for _ in range(5):
            center = np.random.uniform(-0.5, 0.5, size=(2,))
            radius = np.random.uniform(0.1, 0.4)
            traj = self.plan_circular_trajectory(center, radius)
            trajectories.append(traj)
        
        return trajectories
    
    def plan_trajectory(self, start, end):
        """Plan point-to-point trajectory."""
        # Simplified minimum-jerk trajectory
        t = np.linspace(0, 3, 150)  # 3 seconds, 150 steps
        trajectory = []
        
        for time_step in t:
            # Minimum jerk interpolation
            ratio = min(1.0, time_step / 3.0)
            interp_factor = 10*ratio**3 - 15*ratio**4 + 6*ratio**5
            pos = start + interp_factor * (end - start)
            trajectory.append(pos)
        
        return trajectory

class UncertaintyEstimator:
    def estimate(self, nominal_model, real_behavior):
        """Estimate model uncertainty by comparing simulation to real behavior."""
        # Compare predicted vs actual behavior
        sim_predictions = self.predict_with_model(nominal_model, real_behavior.inputs)
        real_measurements = real_behavior.outputs
        
        # Calculate uncertainty as difference
        uncertainty = real_measurements - sim_predictions
        
        # Model uncertainty as noise bounds
        uncertainty_bounds = {
            'mean_error': np.mean(np.abs(uncertainty)),
            'std_error': np.std(uncertainty),
            'max_error': np.max(np.abs(uncertainty))
        }
        
        return uncertainty_bounds
    
    def predict_with_model(self, model, inputs):
        """Generate predictions with the nominal model."""
        # Implementation would simulate model forward in time
        pass

class AdaptiveElement:
    def update(self, controller, uncertainty, learning_rate):
        """Update controller based on uncertainty estimates."""
        # Adjust controller gains based on observed uncertainty
        for i in range(len(controller.gains)):
            # Reduce gains if uncertainty is high
            uncertainty_factor = 1.0 / (1.0 + uncertainty['std_error'])
            controller.gains[i] *= (1 - learning_rate) + learning_rate * uncertainty_factor
```

## Recipe 6: Safety-First Transfer

### Problem
Direct transfer from simulation to real robot can be unsafe without proper safety measures.

### Solution
Implement safety layers that ensure safe operation regardless of model accuracy.

```python
# safety_first_transfer.py
import numpy as np
from typing import Dict, List, Tuple

class SafetyLayer:
    def __init__(self, robot_model):
        self.robot_model = robot_model
        self.safety_constraints = self.define_safety_constraints()
        self.backup_controller = self.create_backup_controller()
        
    def define_safety_constraints(self):
        """Define safety constraints for the robot."""
        return {
            # Joint limits
            'joint_limits': {
                'upper': self.robot_model.get_joint_upper_limits(),
                'lower': self.robot_model.get_joint_lower_limits()
            },
            # Velocity limits (for collision avoidance)
            'velocity_limits': {
                'linear': 1.0,   # m/s
                'angular': 0.5   # rad/s
            },
            # Force limits (for safe interaction)
            'force_limits': {
                'endpoint': 50.0,  # N
                'joint': 100.0     # Nm
            },
            # Environmental constraints
            'workspace_bounds': {
                'x': [-2.0, 2.0],
                'y': [-2.0, 2.0], 
                'z': [0.0, 2.0]
            },
            # Collision constraints
            'collision_threshold': 0.1  # m
        }
    
    def create_backup_controller(self):
        """Create a simple backup controller for safety."""
        # Simple proportional controller for joint limits
        return BackupJointLimitController()
    
    def safe_action_filter(self, planned_action, current_state):
        """Filter planned actions to ensure safety."""
        # Check joint limits
        safe_action = self.check_joint_limits(planned_action, current_state)
        
        # Check velocity constraints
        safe_action = self.check_velocity_limits(safe_action, current_state)
        
        # Check for collisions
        safe_action = self.check_collision_avoidance(safe_action, current_state)
        
        # Verify constraints are satisfied
        if self.verify_action_safe(safe_action, current_state):
            return safe_action
        else:
            # Fall back to safe action
            return self.backup_controller.get_safe_action(current_state)
    
    def check_joint_limits(self, planned_action, current_state):
        """Ensure joint limit constraints are respected."""
        new_positions = current_state['joints'] + planned_action['joint_commands']
        
        upper_limits = self.safety_constraints['joint_limits']['upper']
        lower_limits = self.safety_constraints['joint_limits']['lower']
        
        # Clamp to limits
        new_positions = np.clip(new_positions, lower_limits, upper_limits)
        
        # Return modified action
        safe_action = planned_action.copy()
        safe_action['joint_commands'] = new_positions - current_state['joints']
        
        return safe_action
    
    def check_velocity_limits(self, planned_action, current_state):
        """Ensure velocity constraints are respected."""
        dt = 0.01  # Default time step
        
        velocities = planned_action['joint_commands'] / dt
        
        max_vel = self.safety_constraints['velocity_limits']['linear']
        
        # Limit velocities
        if np.any(np.abs(velocities) > max_vel):
            scale_factor = max_vel / np.max(np.abs(velocities))
            planned_action['joint_commands'] = planned_action['joint_commands'] * scale_factor
        
        return planned_action
    
    def check_collision_avoidance(self, planned_action, current_state):
        """Check planned action for collision safety."""
        # Predict next state with planned action
        predicted_state = self.predict_next_state(current_state, planned_action)
        
        # Check for collisions
        if self.would_collide(current_state, predicted_state):
            # Modify action to avoid collision
            safe_direction = self.find_safe_direction(current_state)
            planned_action['joint_commands'] = safe_direction * 0.01  # Small safe movement
        
        return planned_action
    
    def predict_next_state(self, current_state, planned_action):
        """Predict robot state after executing planned action."""
        # Simplified forward kinematics and dynamics
        next_state = current_state.copy()
        
        # Update joint positions
        next_state['joints'] = current_state['joints'] + planned_action['joint_commands']
        
        # Update end effector position based on forward kinematics
        next_state['end_effector'] = self.forward_kinematics(next_state['joints'])
        
        return next_state
    
    def would_collide(self, current_state, predicted_state):
        """Determine if predicted state results in collision."""
        # Check collision with environment
        ee_pos = predicted_state['end_effector']
        
        # Check workspace bounds
        bounds = self.safety_constraints['workspace_bounds']
        if (ee_pos[0] < bounds['x'][0] or ee_pos[0] > bounds['x'][1] or
            ee_pos[1] < bounds['y'][0] or ee_pos[1] > bounds['y'][1] or
            ee_pos[2] < bounds['z'][0] or ee_pos[2] > bounds['z'][1]):
            return True
        
        # Check distance to obstacles (simplified)
        obstacles = self.get_known_obstacles()
        for obs_pos in obstacles:
            dist = np.linalg.norm(ee_pos - obs_pos)
            if dist < self.safety_constraints['collision_threshold']:
                return True
        
        return False
    
    def find_safe_direction(self, current_state):
        """Find a safe direction to move when collision is imminent."""
        ee_pos = current_state['end_effector']
        obstacles = self.get_known_obstacles()
        
        if not obstacles:
            # No obstacles, move upward
            return np.array([0, 0, 1])
        
        # Compute repulsive force from obstacles
        repulsive_force = np.zeros(3)
        for obs_pos in obstacles:
            diff = ee_pos - obs_pos
            dist = np.linalg.norm(diff)
            
            if dist < self.safety_constraints['collision_threshold'] * 2:
                # Normalize and scale by inverse square law
                normalized_diff = diff / dist if dist > 0.001 else np.array([1, 0, 0])
                repulsive_force += normalized_diff / (dist**2)
        
        # Normalize and return safe direction
        if np.linalg.norm(repulsive_force) > 0:
            return repulsive_force / np.linalg.norm(repulsive_force)
        else:
            return np.array([0, 0, 1])  # Default: move up
    
    def verify_action_safe(self, action, state):
        """Verify that action satisfies all safety constraints."""
        # Check joint limits
        new_joints = state['joints'] + action['joint_commands']
        upper_limits = self.safety_constraints['joint_limits']['upper']
        lower_limits = self.safety_constraints['joint_limits']['lower']
        
        if np.any(new_joints > upper_limits) or np.any(new_joints < lower_limits):
            return False
        
        return True
    
    def get_known_obstacles(self):
        """Return list of known obstacles."""
        # In simulation, this might return static objects
        # In real implementation, would use perception system
        return []

class BackupJointLimitController:
    """Simple backup controller to enforce joint limits."""
    
    def get_safe_action(self, current_state):
        """Return action that moves joints away from limits."""
        current_joints = current_state['joints']
        upper_limits = np.ones(len(current_joints)) * 1.5  # Example limits
        lower_limits = np.ones(len(current_joints)) * -1.5
        
        # Calculate how close we are to limits
        distances_to_upper = upper_limits - current_joints
        distances_to_lower = current_joints - lower_limits
        
        # Move away from violated limits
        commands = np.zeros(len(current_joints))
        
        for i in range(len(current_joints)):
            if distances_to_upper[i] < 0.1:  # Close to upper limit
                commands[i] = -0.01  # Move away
            elif distances_to_lower[i] < 0.1:  # Close to lower limit
                commands[i] = 0.01   # Move away
        
        return {'joint_commands': commands}
```

## Best Practices Summary

1. **Start with Domain Randomization**: Add variability to simulation early in training
2. **Collect Minimal Real Data**: Even small amounts of real data can guide training
3. **Progressive Transfer**: Gradually increase realism rather than jumping directly to reality
4. **Robust Control Design**: Design controllers that account for model uncertainty
5. **Safety First**: Always implement safety layers when transferring to real robots
6. **Systematic Evaluation**: Compare performance across simulation and reality regularly
7. **Iterative Refinement**: Expect multiple cycles of simulation adjustment and real testing

## Troubleshooting Common Issues

### Issue: Performance drops significantly in reality
- **Solution**: Use reality-guided training with small amounts of real data
- **Alternative**: Implement system identification to tune simulation parameters

### Issue: Controller becomes unstable on real robot
- **Solution**: Design more robust controllers with wider stability margins
- **Alternative**: Add adaptive control elements that adjust to real dynamics

### Issue: Perception fails in real environment
- **Solution**: Apply domain randomization during training
- **Alternative**: Use unsupervised domain adaptation techniques

By following these recipes systematically, robotics practitioners can successfully transfer capabilities from simulation to reality, bridging the sim-to-real gap while maintaining system safety and performance.