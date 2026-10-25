---
title: "RECOBOT: Recycling Robot on NVIDIA JetBot"
summary: A JetBot that sees a falling object, tracks it and drives over to catch it before it hits the ground — the project that started my research on active tracking.
category: research
date: 2025-09-01
endDate: 2026-01-31
role: Developer
org: Introduction to Robotics, NCKU
tags: [NVIDIA Jetson, YOLOv5, Kalman Filter, PID Control]
links: []
featured: true
order: 3
---

## Where it started

Empty cups and wrappers kept piling up on my desk. Sometimes it wasn't a mess, just laziness. What if the trash can could *see* the trash flying toward it and move to catch it? I built that idea as the final project for an introductory robotics course.

## How it works

RECOBOT runs on the **NVIDIA JetBot**, an open-source robot kit with a Jetson Nano, a camera and differential drive, so deep learning models run in real time on the edge.

1. **Detection** — YOLOv5 locates the object in the frame.
2. **Tracking** — a Kalman filter tracks it across frames, smoothing over motion blur and missed detections.
3. **Control** — a PID controller turns the error between the object center and the image center into wheel commands, so the robot aligns with the target and closes in.

## What I learned

Techniques that look great in papers meet a lot of unexpected problems in the real world. The classic *detect + filter + PID* pipeline needs manual tuning and loses robustness under collisions, lighting changes and fast targets. That led me to a question I am still working on: **can a robot learn how to look and how to move from experience?** It became my master's research on active PTZ tracking with deep reinforcement learning.
