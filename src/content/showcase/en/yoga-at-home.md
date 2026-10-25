---
title: "Yoga at Home: Remote Yoga Coaching"
summary: Real-time video calls with live skeleton tracking, so a remote instructor can see and correct a student's pose.
category: projects
date: 2024-01-01
role: Developer
tags: [WebRTC, MediaPipe Pose, JavaScript]
links: []
order: 3
---

## Overview

*Yoga at Home* explores AI for health and fitness: two people join a low-latency video call, and the app overlays a live skeleton on each video stream so posture problems are easy to spot and correct, reducing the risk of injury.

## How it works

- **WebRTC** provides real-time peer-to-peer video and audio with low latency.
- **MediaPipe Pose** estimates the user's body keypoints in the browser, and the skeleton is drawn on a canvas on top of the video as instant visual feedback.

## Takeaway

Building it showed me how much potential AI has in remote health coaching — and how much product thinking matters when bringing a model to real users.
