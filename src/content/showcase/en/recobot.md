---
title: "RECOBOT: Recycling Robot on NVIDIA JetBot"
summary: A JetBot that sees a tissue flying toward it, tracks it and drives over to catch it at 25 FPS, the project that started my research on active tracking.
category: research
date: 2025-09-01
endDate: 2026-01-31
role: Developer
org: Introduction to Robotics, NCKU
tags: [NVIDIA Jetson, YOLOv5, Kalman Filter, PID Control, Embodied AI]
cover: /uploads/showcase/recobot-overview.webp
coverAlt: "RECOBOT pipeline: the JetBot alternates YOLO detection and Kalman-filter tracking frame by frame, then a PID controller follows the target to catch it."
links: []
featured: true
order: 3
---

## Background

Large language models have made AI remarkably capable in the digital world, but acting in the physical world is still hard. At AI Ascent 2025, Jim Fan (NVIDIA) proposed a **Physical Turing Test**: if, after a party, you cannot tell whether a human or a robot cleaned the house, the machine has reached real intelligence. We took a small, concrete slice of that test: **catching trash in an office**.

## Motivation

Empty cups and wrappers kept piling up on my desk. Sometimes it wasn't a mess, just laziness. What if the trash can could *see* the trash flying toward it and move to catch it? RECOBOT is that idea, built by a team of six for a robotics course: a robot that catches a tossed tissue before it lands.

![RECOBOT: an NVIDIA JetBot carrying a 3D-printed basket|320](/uploads/showcase/recobot-robot.webp)

## Method

RECOBOT runs on the **NVIDIA JetBot**, an open-source robot kit with a Jetson Nano, a single camera and two-wheel differential drive. Everything runs on the robot. The pipeline has three stages: detect, track, control.

**Detection: YOLOv5n.** Estimating 3D position is too expensive for a Jetson Nano, so the 2D bounding box serves as a proxy for where the target is. The JetBot image ships with Python 3.6, which rules out newer YOLO versions, so we used YOLOv5. After testing model sizes on the hardware, we chose the smallest, **YOLOv5n**, with 320×320 input.

- **Data:** 913 images collected on the NCKU Miin Wu School of Computing campus, labeled in Roboflow and split 80:20. Collecting data in the robot's own environment matches its lighting and backgrounds.
- **Augmentation:** each image was expanded into three variations with 2×2 tiling for small objects, flips, 90° rotations, random crops, ±10° shear, and **motion blur** to imitate camera shake and fast-moving targets.

**Tracking: Kalman filter.** A tossed tissue is visible for only a few frames, detections drop out under occlusion, lighting changes or blur, and detection latency means the robot reacts to where the tissue *was*. A constant-velocity Kalman filter over the state $(x, y, v_x, v_y)$ solves both problems:

- **Failure compensation:** when YOLO misses, the filter's prediction keeps guiding the robot instead of letting it stop.
- **Inference offloading:** YOLO and the Kalman filter take turns frame by frame: even frames run detection, odd frames use the filter's prediction. This keeps the GPU from throttling and raised the control loop from 20 to **25 FPS**.

**Control: PID.** The error is the horizontal distance between the predicted target position and the image center. A PID controller turns it into motor power: P steers harder when the target is far off-center, I removes steady drift from friction or motor imbalance, and D damps overshoot so the pursuit stays smooth.

**Hardware.** We designed a 3D-printed basket that uses the printer's full build volume. A lattice pattern cuts its weight by a third, and a mortise-and-tenon joint holds it on a bracket that fits over the JetBot's existing mount.

![CAD drawing of the 3D-printed lattice basket (units: mm)|560](/uploads/showcase/recobot-basket.webp)

## Results

| Precision | Recall | mAP@.5 | mAP@.5:.95 |
| --- | --- | --- | --- |
| 0.719 | 0.575 | 0.624 | 0.294 |

The detector favors precision over recall, so the robot rarely chases false positives, which matters more for a stable pursuit than catching every frame. Combined with Kalman prediction and PID control, RECOBOT runs at a stable **25 FPS** on the Jetson Nano and intercepts moving targets in real-world tests.

**Limitations.**

- **Environment-sensitive:** the data comes from one campus, and lighting still causes false positives.
- **Narrow view:** the 320×320 input keeps the frame rate high but throws away information.
- **Hand-tuned:** camera placement, motor gains and PID parameters all have to be tuned by hand.

## What I learned

Techniques that look great in papers meet a lot of unexpected problems in the real world. The classic *detect + filter + PID* pipeline needs manual tuning and loses robustness under collisions, lighting changes and fast targets. That led me to a question I am still working on: **can a robot learn how to look and how to move from experience?** It became my master's research on [active PTZ tracking with deep reinforcement learning](../sarc-ptz/).
