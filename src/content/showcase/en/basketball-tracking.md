---
title: "SportAI: Multi-Object Basketball Player Tracking"
summary: Real-time detection and tracking of every player on a basketball court, built to cut game-analysis time for players and coaches.
category: projects
date: 2024-02-01
ongoing: true
role: Computer Vision Developer
org: NCKU HSU Lab
tags: [YOLO, ByteTrack, Multi-Object Tracking, Cloud Deployment]
links: []
order: 2
---

## Overview

Under the guidance of Prof. Yi-Yu Hsu, I developed a system that captures each player's position precisely and efficiently, greatly reducing the time players and coaches spend reviewing games. It was selected as a **finalist** in the NCKU Miin Wu Innovative Applications Competition.

## Technical approach

- **Object detection** — YOLO (You Only Look Once) detects players in real time with a single convolutional network.
- **Multi-object tracking** — ByteTrack's two-stage association keeps track of players even when they are occluded, which happens constantly on a crowded court.
- **Deployment** — the tracker runs in the cloud so analysis is available during games.

## Results

Trained on **700 hand-labeled images** from the Taiwan professional basketball league (P. LEAGUE+):

| mAP | Precision | Recall |
| --- | --- | --- |
| 84% | 80% | 77% |
