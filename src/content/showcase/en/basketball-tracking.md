---
title: "SportAI: Multi-Object Basketball Player Tracking"
summary: A single-camera system that detects and tracks every player in a basketball broadcast with YOLOv8 and ByteTrack, so teams can collect game data without hours of manual review.
category: projects
date: 2024-02-01
ongoing: true
role: Computer Vision Developer
org: NCKU HSU Lab
tags: [YOLOv8, ByteTrack, Multi-Object Tracking, Computer Vision]
links: []
order: 2
---

![Tracking demo on P. LEAGUE+ game footage](https://youtu.be/TWH29l1PL-o)

## Background

Modern basketball is rarely won by one star. Championship teams combine two or three stars with the right role players, so teams rely more and more on game data to understand how the whole roster performs on offense and defense.

Collecting that data is slow and error-prone. A two-hour game has ten players on the floor, and each needs ten or more basic and advanced stats, each recorded in its own way. Analysts rewatch the game again and again to log events. The NBA has used camera-based tracking since 2013, but those multi-camera systems are expensive and still need experts to interpret the data.

## Motivation

The project was inspired by *Moneyball*: the Oakland Athletics used data to win more with fewer resources. We wanted to bring the same idea to teams that cannot afford multi-camera tracking. Our goal was a system that:

- tracks every player from a **single broadcast view**, so it is cheap enough for college and amateur teams;
- turns a full game into player trajectories automatically, instead of hours of manual review;
- in the long run, cuts **per-player highlight reels** automatically, which teams use to evaluate form.

## Method

The pipeline is *detect, then track*: a full game video goes through YOLO object detection, and ByteTrack links the detections into player trajectories.

**Data.** Public datasets alone did not match local broadcasts, so we built our own from Taiwan's professional league (P. LEAGUE+). We labeled **700 images** with bounding boxes for **six classes**: ball, player, referee, hoop, made basket and shot attempt. Images were resized to 640×640 and split 7:2:1 into train, validation and test sets.

**Detection.** We trained **YOLOv8x**, the largest YOLOv8 model. A single camera angle leaves little room for error, so we traded speed for accuracy.

**Tracking.** **ByteTrack** associates detection boxes across frames. Its two-stage matching also uses low-confidence boxes, so a player who is partly hidden keeps the same ID instead of being dropped. This matters on a basketball court, where players collide and occlude each other constantly.

## Results

On the test split, the detector reached:

| mAP | Precision | Recall |
| --- | --- | --- |
| 84% | 80% | 77% |

Integrated with ByteTrack and tested on P. LEAGUE+ game footage, the system tracks multiple players reliably and processes a full game in minutes. The project was selected as a [finalist in the NCKU Miin Wu Innovative Applications Competition](../miin-wu-innovation-2024/) (Innovative Computing track).

**Where it still fails:**

- **Players vs. referees.** The detector sometimes confuses them, and recognition of the ball and made baskets is weaker. More data and stronger hardware would help.
- **ID switches.** When players collide, ByteTrack sometimes swaps their IDs.
- **Trajectories.** When the broadcast cuts between shots, the trajectories become misaligned.

These failures, almost all caused by occlusion, pushed me toward a question I still work on: a tracker that cannot move the camera cannot fix them. That led to my later work on [active camera tracking](../sarc-ptz/).
