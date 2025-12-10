# Hardware Guidelines and Kit Recommendations

## Course-Compatible Robotics Platforms

This section provides detailed recommendations for hardware platforms compatible with the Physical AI & Humanoid Robotics course. The recommendations span different budget levels and technical requirements to accommodate diverse learning environments.

## Tier 1: Simulation-Only Learning

For students focusing on conceptual understanding and software development without hardware:

### Recommended Setup:
- **Computing**: NVIDIA RTX 4080 or equivalent GPU for accelerated simulation
- **Software**: Isaac Sim, Gazebo Garden, ROS 2 Humble Hawksbill
- **Alternative**: Laptop with integrated graphics (slower simulation)

### Advantages:
- Lowest cost entry point
- No hardware maintenance
- Rapid iteration cycle
- Safe for experimentation

## Tier 2: Entry-Level Physical Robot

For initial physical implementation and testing:

### Option A: Poppy Ergo Jr
- **Cost**: ~$1,200
- **Joints**: 6 servo motors (5-7 DOF possible)
- **Sensors**: IMU, potential expansion with camera
- **Programming**: Python, ROS support available
- **Strengths**: Open-source, modular design
- **Limitations**: Limited mobility, plastic construction

### Option B: TurtleBot 4
- **Cost**: ~$2,500
- **Joints**: 2-wheel differential drive (no arms)
- **Sensors**: RGB-D camera, IMU, wheel encoders
- **Programming**: ROS 2 native
- **Strengths**: Industry standard, strong ecosystem
- **Limitations**: Limited manipulation capability

## Tier 3: Mid-Range Humanoid Platform

For comprehensive humanoid robotics exploration:

### Unitree H1 Educator
- **Cost**: $100,000-$150,000
- **Joints**: 23 actuators (including hands)
- **Sensors**: Stereo cameras, IMU, force/torque sensors
- **Programming**: ROS 2, Python, C++
- **Strengths**: Full humanoid with dexterous manipulation
- **Limitations**: High cost, requires specialized facility

### Agility Robotics Digit Academic
- **Cost**: $250,000+
- **Joints**: 28 actuators, full humanoid
- **Sensors**: Multiple cameras, LIDAR, IMU
- **Programming**: ROS 2, Python, C++
- **Strengths**: True human-scale humanoid
- **Limitations**: Very high cost, requires research facility

## Tier 4: Custom Humanoid Assembly

For advanced students wanting to build their own platform:

### Core Components:

#### Computing System
- **Recommended**: NVIDIA Jetson Orin AGX (64GB RAM)
- **Alternatives**: 
  - Jetson Orin NX for lighter duty
  - Custom PC with ROS 2 compatible drivers

#### Actuators
- **High-end**: Trossen PhantomX XM430 robotic servos (15-20 needed)
- **Mid-range**: Dynamixel MX-28 or RX-28 servos (20-25 needed)
- **Budget**: AX-12A servos (25-30 needed)

#### Sensors
- **Primary Vision**: Intel RealSense D455 or D435i
- **Secondary Vision**: Raspberry Pi camera modules
- **Depth Estimation**: LIDAR (Sick TIM571 or Hokuyo UTM-30LX)
- **Inertial**: IMU (Bosch BNO055)

#### Structural Elements
- **Frame**: Carbon fiber or aluminum extrusion (80/20 Inc. or Misumi)
- **Fasteners**: Grade-8 bolts and appropriate hardware
- **Connectors**: Electrical connectors rated for robotics use

#### Power System
- **Main Battery**: LiFePO4 battery (24V, 20Ah minimum)
- **Regulation**: DC-DC converters for different voltage needs
- **Management**: Battery management system for safety

## Component Selection Guidelines

### Actuator Selection Criteria:
1. **Torque Requirements**: Calculate based on payload and joint configuration
2. **Speed Requirements**: Balance between speed and precision
3. **Resolution**: Higher resolution for more precise control
4. **Feedback**: Position, velocity, and effort feedback capability
5. **Communications**: Bus-based (CAN, RS-485) for multiple actuators
6. **Durability**: Rated for intended duty cycle

### Sensor Selection Criteria:
1. **Accuracy**: Meet application requirements
2. **Frequency**: Adequate for control loops
3. **Fusion Capability**: Compatible with other sensors for data fusion
4. **Mountability**: Physically mountable on robot structure
5. **Power Consumption**: Fit within power budget
6. **Environmental**: Suitable for intended operating conditions

### Computing Selection Criteria:
1. **Processing Power**: Sufficient for vision, planning, and control
2. **Power Efficiency**: Balanced against computational needs
3. **Connectivity**: USB, Ethernet, CAN interfaces as needed
4. **RTOS Support**: Real-time OS support for control tasks
5. **Thermal Management**: Adequate cooling for sustained operation
6. **Expandability**: Room for additional sensors/computation

## Integration Considerations

### Mechanical Integration
- **Mounting**: Secure mounting that supports operating loads
- **Wiring**: Strain relief and movement accommodation for cables
- **Maintenance Access**: Easy access for repairs and adjustments
- **Weight Distribution**: Balanced for stability and performance

### Electrical Integration
- **Power Distribution**: Efficient distribution with protection
- **Signal Integrity**: Proper shielding and grounding
- **EMI Mitigation**: Minimize electromagnetic interference
- **Safety Circuits**: Emergency stops and safety interlocks

### Software Integration
- **Middleware**: ROS 2 compatibility
- **Drivers**: Reliable, maintainable driver software
- **Calibration**: Procedures for sensor and actuator calibration
- **Diagnosis**: Built-in diagnostic capabilities

## Safety and Maintenance

### Safety Requirements:
- **Emergency Stop**: Accessible to operator and autonomous systems
- **Collision Detection**: Force sensing and position monitoring
- **Structural Integrity**: Components rated for dynamic loads
- **Electrical Safety**: Proper insulation and protection

### Maintenance Schedule:
- **Daily**: Visual inspection for damage
- **Weekly**: Lubrication of moving parts
- **Monthly**: Calibration verification
- **Quarterly**: Component inspection and replacement as needed

## Budget Planning

For academic institutions planning hardware acquisitions:

### Individual Student Budgets:
- **Simulation-only**: $0-$500
- **Entry-level**: $1,000-$3,000
- **Advanced**: $10,000-$50,000

### Laboratory Setup (10-student lab):
- **Basic Equipment**: $50,000-$100,000
- **Advanced Equipment**: $200,000-$500,000
- **Facility Modifications**: $50,000-$100,000 (if humanoid platforms)

## Acquisition Tips

### Purchasing Strategy:
1. **Educational Discounts**: Many manufacturers offer academic pricing
2. **Bulk Purchasing**: For institutional purchases, volume discounts apply
3. **Used Equipment**: Often available at reduced cost with support
4. **Rental Programs**: For short-term needs or evaluation

### Vendor Selection:
1. **Support**: Local support and training availability
2. **Documentation**: Quality of technical documentation
3. **Community**: Active user community and resources
4. **Compatibility**: Integration with existing infrastructure

### Grant Opportunities:
- NSF CISE Research Infrastructure
- Department of Education STEM grants
- Industry partnership programs
- Local economic development initiatives

## Troubleshooting Hardware Issues

### Common Problems:
- **Communication Failures**: Check wiring, baud rates, and bus termination
- **Calibration Drift**: Re-calibrate using manufacturer procedures
- **Unexpected Movements**: Verify control parameters and safety limits
- **Overheating**: Check loads against specifications and cooling

### Diagnostic Procedures:
1. **Systematic Testing**: Test components individually
2. **Logging**: Enable comprehensive logging for debugging
3. **Calibration Verification**: Regular verification of calibration
4. **Safety Checks**: Verify all safety systems are operational

This hardware guideline provides a comprehensive framework for selecting, purchasing, and implementing hardware platforms appropriate for the Physical AI & Humanoid Robotics course. Students and educators should consider their specific requirements, budget constraints, and learning objectives when making hardware selections.