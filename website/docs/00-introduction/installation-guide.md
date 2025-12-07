---
sidebar_position: 4
title: 'Installation Guide'
---

# Installation Guide: Physical AI & Humanoid Robotics Development Environment

## Prerequisites

Before beginning the installation process, ensure your system meets the minimum requirements:

- **Operating System**: Ubuntu 22.04 LTS (recommended) or Windows 10/11 with WSL2
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 20GB of free disk space
- **Internet Connection**: Stable connection for package downloads

## Step 1: System Preparation

### For Ubuntu 22.04 LTS (Recommended)

First, update your system packages:

```bash
sudo apt update && sudo apt upgrade -y
```

Install essential tools and dependencies:

```bash
sudo apt install curl gnupg lsb-release software-properties-common -y
```

### For Windows Users (WSL2)

If you're using Windows, install WSL2 with Ubuntu 22.04:

1. Open PowerShell as Administrator and run:
```powershell
wsl --install Ubuntu-22.04
```

2. After installation, launch Ubuntu from the Start menu and create your user account
3. Update the system:
```bash
sudo apt update && sudo apt upgrade -y
```

## Step 2: Install ROS 2 Humble Hawksbill

ROS 2 (Robot Operating System 2) is the middleware that connects all components of your robotic system.

### Add ROS 2 Repository

```bash
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
```

### Install ROS 2 Packages

```bash
sudo apt update
sudo apt install ros-humble-desktop-full -y
```

### Install ROS 2 Development Tools

```bash
sudo apt install python3-colcon-common-extensions python3-rosdep python3-vcstool -y
```

### Initialize rosdep

```bash
sudo rosdep init
rosdep update
```

## Step 3: Setup ROS 2 Environment

Add ROS 2 to your bash environment by adding these lines to your `~/.bashrc` file:

```bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

To verify the installation, try running:

```bash
ros2 --version
```

You should see the version information for ROS 2 Humble.

## Step 4: Install Simulation Environment

### Gazebo Classic Installation

```bash
sudo apt install ros-humble-gazebo-ros-pkgs ros-humble-gazebo-ros2-control ros-humble-gazebo-ros2-control-demos -y
```

### Gazebo Garden (Ignition) Installation

```bash
sudo apt install ignition-garden -y
```

For detailed installation instructions, visit: https://gazebosim.org/docs/garden/install_ubuntu

## Step 5: Install Isaac Sim (Optional - NVIDIA GPU Required)

Isaac Sim provides NVIDIA's high-fidelity simulation environment for advanced robotics applications.

### Prerequisites for Isaac Sim
- NVIDIA GPU with compute capability 6.0 or above
- NVIDIA Driver version 470 or later
- CUDA 11.8 toolkit

### Installation Steps
1. Visit the NVIDIA Developer Portal: https://developer.nvidia.com/isaac-sim
2. Create an account or sign in
3. Download Isaac Sim for your platform
4. Follow the installation guide at: https://docs.omniverse.nvidia.com/isaacsim/latest/installation/install_workstation.html

## Step 6: Install Development Tools

### Python Development Environment

```bash
sudo apt install python3-pip python3-dev python3-venv -y
pip3 install --upgrade pip
```

### Code Editor

Install Visual Studio Code with ROS extensions:

```bash
sudo snap install code --classic
```

After installation, open VS Code and install these extensions:
- ROS
- Python
- C/C++
- GitLens
- Docker

### Git Configuration

Set up your Git identity:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 7: Create Workspace

Create a workspace directory for your robotics projects:

```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws
```

## Step 8: Install Additional Dependencies

### Computer Vision Libraries

```bash
sudo apt install ros-humble-vision-msgs ros-humble-image-transport ros-humble-camera-info-manager -y
pip3 install opencv-python numpy scipy matplotlib
```

### Navigation and Control Libraries

```bash
sudo apt install ros-humble-navigation2 ros-humble-nav2-bringup ros-humble-dwb-core ros-humble-robot-localization -y
```

### Perception Stack

```bash
sudo apt install ros-humble-perception ros-humble-vision-opencv ros-humble-usb-cam ros-humble-pointcloud-to-laserscan -y
```

## Step 9: Install Simulation Models and Assets

Create directories for simulation assets:

```bash
mkdir -p ~/ros2_ws/simulation_assets/models
mkdir -p ~/ros2_ws/simulation_assets/worlds
```

## Step 10: Set Up Python Virtual Environment (Recommended)

For better package management:

```bash
cd ~/ros2_ws
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools
pip install rclpy transforms3d numpy matplotlib opencv-python
```

To activate the virtual environment in future sessions:

```bash
source ~/ros2_ws/venv/bin/activate
```

## Verification: Test Installation

Create a simple test to verify your installation:

### Terminal 1 - Start ROS 2 daemon:
```bash
source /opt/ros/humble/setup.bash
ros2 daemon start
```

### Terminal 2 - Test ROS 2 communication:
```bash
source /opt/ros/humble/setup.bash
ros2 topic echo /chatter std_msgs/msg/String
```

### Terminal 3 - Publish test message:
```bash
source /opt/ros/humble/setup.bash
ros2 topic pub /chatter std_msgs/msg/String "data: Hello Physical AI & Humanoid Robotics"
```

If the message appears in Terminal 2, your ROS 2 installation is working correctly.

## Troubleshooting Common Issues

### Issue 1: Permission denied when using apt
**Solution**: Add sudo to the command:
```bash
sudo apt install [package-name]
```

### Issue 2: Package not found
**Solution**: Update package lists:
```bash
sudo apt update
sudo apt upgrade
```

### Issue 3: Environment setup problems
**Solution**: Source ROS 2 in each new terminal:
```bash
source /opt/ros/humble/setup.bash
```
Or add it permanently to your `~/.bashrc`:
```bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
```

### Issue 4: Python import errors
**Solution**: Make sure Python packages are properly installed:
```bash
pip3 install --user -U rclpy
```

### Issue 5: Gazebo not launching
**Solution**: Install missing packages:
```bash
sudo apt install gazebo ros-humble-gazebo-ros-pkgs ros-humble-gazebo-plugins
```

## Next Steps

After successful installation:

1. **Explore ROS 2 tutorials**: Run the official ROS 2 tutorials to familiarize yourself with the system
2. **Try the simulation**: Launch a simple robot in Gazebo to test your installation
3. **Join the community**: Connect with other learners in the Physical AI & Humanoid Robotics community
4. **Begin Course Content**: Start with Chapter 1: Foundations of Physical AI

## Getting Help

### Documentation Resources
- ROS 2 Documentation: https://docs.ros.org/en/humble/
- Gazebo Documentation: https://gazebosim.org/docs/
- Course Resources: Check the course documentation for additional resources

### Community Support
- Course-specific Q&A forum
- ROS Discourse: https://discourse.ros.org/
- Robotics Stack Exchange: https://robotics.stackexchange.com/

## Optional: Hardware-Specific Installation

If you have physical hardware (covered in the Hardware Requirements document), additional steps will be needed:

1. Install hardware-specific drivers
2. Configure communication protocols (USB, Ethernet, etc.)
3. Test hardware connection before proceeding

## Updating Your Environment

To keep your development environment up to date:

```bash
sudo apt update && sudo apt upgrade
rosdep update
```

For ROS 2 packages specifically:
```bash
sudo apt update
sudo apt upgrade ros-humble-*
```

Your development environment for Physical AI & Humanoid Robotics is now set up! You're ready to begin exploring the fascinating world where digital intelligence meets physical reality.