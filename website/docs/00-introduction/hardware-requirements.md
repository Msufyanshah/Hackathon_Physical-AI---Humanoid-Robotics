---
sidebar_position: 3
title: 'Hardware Requirements'
---

# Hardware Requirements: Physical AI & Humanoid Robotics

## Overview

This course offers multiple hardware tiers to accommodate different budgets and learning objectives. All tiers provide full access to the curriculum, with higher tiers offering enhanced physical interaction opportunities. The simulation-first approach ensures that foundational learning is accessible to all students regardless of hardware investment.

## Tier 1: Simulation-Only (Free)

### Target Audience
- Students beginning their journey in robotics
- Those exploring the field before making hardware investments
- Educational institutions with limited budgets
- Learners who want to master software concepts first

### System Requirements
- **Operating System**: Ubuntu 22.04 LTS (recommended) or Windows 10/11 with WSL2
- **CPU**: Intel i5 or AMD Ryzen 5 (4 cores, 2.5GHz minimum)
- **RAM**: 8GB minimum, 16GB recommended
- **GPU**: Integrated graphics acceptable, NVIDIA GPU recommended for Isaac Sim
- **Storage**: 20GB free space minimum
- **Internet**: Stable connection for package downloads

### Software Components
- ROS 2 Humble Hawksbill (LTS)
- Gazebo Garden or Gazebo Classic
- Python 3.10
- Git version control
- Docker and Docker Compose
- Visual Studio Code with ROS extensions

### Learning Outcomes
- Master ROS 2 architecture and communication patterns
- Design and model robots using URDF/XACRO
- Implement perception and navigation algorithms
- Deploy and test in simulation environments
- Understand physical AI principles without hardware constraints

### Advantages
- Zero hardware cost
- Consistent environment across all students
- Access to high-fidelity physics simulation
- No hardware maintenance or safety concerns

## Tier 2: Development Kit (Mid-Range)

### Target Audience
- Serious learners wanting real-world experience
- Makers and hobbyists
- Students advancing from simulation tier
- Small robotics teams

### Recommended Hardware
#### Primary Processing Unit
- **Option A**: NVIDIA Jetson Orin Nano Developer Kit ($499)
  - 1024-core NVIDIA Ampere™ GPU
  - 2.0 GHz, 4-core ARM v8.2 64-bit CPU
  - 4GB or 8GB LPDDR5 memory
  - Comprehensive I/O connectivity

- **Option B**: Raspberry Pi 4 Model B 8GB + Google Coral USB Accelerator ($150)
  - 1.8GHz quad-core ARM Cortex-A72 CPU
  - 8GB LPDDR4-3200 SDRAM
  - Google Edge TPU for AI acceleration

#### 3D Perception System
- **Intel RealSense D435i** ($199)
  - RGB camera: 1920 × 1080 max resolution
  - Depth sensor: 1280 × 720 max resolution
  - Built-in IMU (gyroscope and accelerometer)
  - Stereo depth technology for accurate depth perception

#### Additional Sensors
- **9-axis IMU**: MPU9250 or BNO055 ($15-30)
- **Distance Sensors**: HC-SR04 ultrasonic sensors (2-3 units, $10-15)
- **Camera**: Pi Camera V2 or equivalent (if using Raspberry Pi)

### Optional Additions
- **Robot Platform**:
  - Clearpath Husky A200 (Educational discount: $15,000)
  - TurtleBot 4 ($2,500)
  - DIY differential drive platform ($500-1000)

### Learning Outcomes
- Bridge simulation-to-reality gap
- Understand sensor integration and calibration
- Test algorithms on physical hardware
- Experience real-world challenges
- Validate simulation results

## Tier 3: Full-Scale Humanoid Platform (Premium)

### Target Audience
- Advanced students and researchers
- Professional robotics development teams
- Universities and research institutions
- Companies building humanoid applications

### Platform Options

#### Option A: Unitree G1 Humanoid Robot ($15,000-$30,000)
- **Height**: 83 cm
- **Weight**: 19 kg
- **Degrees of Freedom**: 32
- **Actuators**: 32 MDS Servo Motors
- **Battery Life**: 1.5 hours continuous operation
- **Onboard Computing**: NVIDIA Orin NX module
- **Sensors**: 3D LiDAR, stereo cameras, IMU, force sensors
- **Connectivity**: WiFi, Ethernet, CAN bus

#### Option B: Agility Robotics Digit ($25,000-$75,000)
- **Height**: 173 cm (adjustable)
- **Weight**: 75 kg
- **Degrees of Freedom**: 20+ (arms, legs, torso, neck)
- **Payload**: 2.3 kg per hand
- **Battery Life**: 2-4 hours depending on activity
- **Sensors**: Multiple cameras, IMU, force/torque sensors
- **API**: ROS 2 compatible

#### Option C: Tesla Optimus (Future availability)
- Details to be announced
- Expected to be ROS 2 compatible
- Potential for advanced AI integration

### Support Equipment
- **Development Workstation**: High-performance PC
  - NVIDIA RTX 4080/4090 or higher
  - Intel i9 or AMD Threadripper CPU
  - 64GB+ RAM
  - Multiple high-resolution monitors
- **Network Infrastructure**: Gigabit Ethernet, industrial WiFi
- **Safety Equipment**: Emergency stop buttons, safety barriers
- **Maintenance Tools**: Calibration equipment, spare parts kit

### Learning Outcomes
- Advanced humanoid control algorithms
- Bipedal locomotion and balance
- Complex manipulation tasks
- Real-world deployment strategies
- Research-level implementation

## Simulation-Only Setup Instructions

### Ubuntu 22.04 Installation
```bash
# Install ROS 2 Humble
sudo apt update && sudo apt upgrade -y
sudo apt install software-properties-common
sudo add-apt-repository universe
sudo apt update
sudo apt install curl -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
sudo apt update
sudo apt install ros-humble-desktop-full -y
source /opt/ros/humble/setup.bash
```

### Isaac Sim Installation (NVIDIA GPU Required)
```bash
# Download Isaac Sim from NVIDIA Developer Portal
# Follow the official installation guide:
# https://docs.omniverse.nvidia.com/isaacsim/latest/installation/install_workstation.html
```

### Gazebo Installation
```bash
sudo apt install ros-humble-gazebo-ros-pkgs ros-humble-gazebo-ros2-control ros-humble-gazebo-ros2-control-demos -y
```

## Hardware Integration Guidelines

### Pre-Integration Checklist
1. **Safety First**: Ensure proper workspace setup with safety measures
2. **Power Management**: Stable power supply for all components
3. **Communication Protocols**: Understand required communication interfaces
4. **Calibration**: Plan for sensor and actuator calibration procedures
5. **Emergency Procedures**: Have emergency stops and fail-safe mechanisms

### Best Practices
- Start with simulation before physical deployment
- Implement layered safety checks
- Use version control for all software
- Document all hardware configurations
- Regular backup of robot state and parameters

## Cost-Benefit Analysis

| Tier | Cost Range | Primary Benefits | Best For |
|------|------------|------------------|----------|
| Simulation-Only | $0 | No hardware risk, consistent environment, easy troubleshooting | Beginners, theory-first learners |
| Development Kit | $500-$1,000 | Real sensor data, physical validation, hands-on experience | Dedicated learners, makers |
| Full Platform | $15,000-$75,000 | Advanced research, real-world testing, cutting-edge development | Researchers, professionals |

## Support Resources

### Setup Assistance
- Video tutorials for each hardware tier
- Community hardware lab for testing
- Troubleshooting guides and FAQs
- Direct support for university deployments

### Maintenance
- Regular firmware updates
- Calibration guidelines
- Troubleshooting procedures
- Replacement part recommendations

## Accessibility Considerations

### Physical Accessibility
- Remote access options for users with mobility limitations
- Virtual reality integration for immersive interaction
- Alternative interaction methods for different abilities

### Financial Accessibility
- Scholarship programs for students
- Hardware sharing initiatives
- Open-source alternatives where possible
- Gradual upgrade paths from simulation tier

## Future-Proofing

### Technology Evolution
- Regular updates for new hardware platforms
- Compatibility with evolving ROS standards
- Migration paths for new sensor technologies
- Support for emerging humanoid platforms

### Upgrade Paths
- Clear upgrade progression from Tier 1 to Tier 3
- Compatibility across tiers
- Modular design allowing incremental improvements
- Community-sourced hardware recommendations