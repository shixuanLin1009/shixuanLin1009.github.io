---
title: "SARC-PTZ: Active Visual Tracking via Deep Reinforcement Learning"
summary: End-to-end deep RL control of a Pan-Tilt-Zoom camera, with a scale-anchored reward that fixes the classic "zoom-out" failure mode.
category: research
date: 2025-11-01
endDate: 2026-03-31
role: First author
org: ACCV 2026 Submission (withdrawn for revision)
tags: [PyTorch, PPO, Unreal Engine 4, EagleSim, Computer Vision]
cover: /uploads/showcase/sarc-ptz-overview.webp
coverAlt: "SARC-PTZ overview: a CNN encoder over four stacked 224×224 RGB frames feeds a PPO actor and critic; the agent issues discrete pan, tilt and zoom actions to a PTZ camera in the EagleSim environment and receives the SARC reward."
links: []
featured: true
order: 1
resume:
  include: true
  order: 1
  subtitle: ACCV 2026 Submission, withdrawn for revision (First Author)
  bullets:
    - "Tech Stack: PyTorch, Deep Reinforcement Learning (PPO), Unreal Engine 4 (EagleSim), Computer Vision, Python"
    - Formulated active Pan-Tilt-Zoom (PTZ) camera tracking as an end-to-end Deep Reinforcement Learning (DRL) control problem, directly mapping 4-frame stacked RGB observations to discrete MultiDiscrete camera control actions.
    - Proposed Scale-Anchored Reward with Centering (SARC), combining a Gaussian scale term with target centering to resolve the systematic risk-averse "zoom-out" failure mode inherent in conventional product-style rewards.
    - Introduced graded termination smoothing and a procedural Random Waypoint motion model to enhance training convergence and prevent overfitting to static trajectories across 6 parallel simulator instances.
    - Boosted tracking Success Rate from 32% to 82% and Tracking Rate from 55.8% to 86.5% in EagleSim while maintaining target scale fidelity without an explicit detector at inference.
---

## Background

Visual object tracking has advanced mostly under the **passive** paradigm: given a video, detect objects frame by frame and link them into trajectories (DeepSORT, ByteTrack). The camera is fixed or moved by someone else, so the tracker bears no responsibility for what it sees.

Deployed systems rarely work that way. A broadcast pan-tilt-zoom (PTZ) camera, a surveillance mast or a drone following a subject has no operator supplying the viewpoint. The system itself must decide, at every instant, **where to look and at what scale to render the target**. This is **active tracking**: control the camera so that a target stays centered and at an observable size. Every camera motion changes what the agent sees next, so a poor move can make the target unrecoverable seconds later. Tracking becomes a **sequential decision problem**, which is why I approach it with deep reinforcement learning (DRL).

<!-- Video: a real PTZ camera following a moving target -->

## Motivation

**Hand-designed pipelines collapse with real perception.** The classic detect → Kalman filter → rule-based controller pipeline works only as long as detection is perfect. In my experiments, the same controller succeeds in **100%** of episodes with ground-truth boxes and in **0%** with a fine-tuned YOLOv5 detector: missed detections propagate through the filter until the target is lost for good, and nothing in the pipeline can recover it.

**The prior DRL method learns to zoom out.** Zoom adds a trade-off that fixed cameras do not have: a wide field of view keeps the target easily but renders it as a few pixels; a narrow one gives detail but no margin. Eagle, the prior DRL method for PTZ tracking, rewards the *product* of a scale term and centering terms, with a severe penalty when the target is lost. Because the reward grows only linearly with scale while the penalty is large, the value-maximizing policy is to **zoom out**. In my reproduction, Eagle shrinks the target to **0.57% of the frame**: nominally still tracking, but the imagery is useless. I had not seen this failure mode reported before.

![Left: the Eagle baseline zooms out and the target shrinks to a few pixels. Right: SARC-PTZ holds the target at the chosen scale.](/uploads/showcase/sarc-ptz-zoom-comparison.webp)

*Left: Eagle takes the risk-averse route and widens the field of view, so the target stays in frame but loses all usable detail. Right: SARC-PTZ keeps the target centered at the target scale.*

![Eagle baseline demo: the camera zooms out until the target is only a few pixels](https://youtube.com/shorts/euVuV03YbnE)

## Method

**Formulation.** Active PTZ tracking is modeled as a Markov decision process.

- **State:** the 4 most recent 224×224 RGB frames, stacked for short-horizon motion context. No privileged target position at inference.
- **Action:** discrete and factored, $\mathcal{A} = \{0,1,2\}^3$. Pan and tilt each increase, decrease or hold by 2°; zoom widens, narrows or holds the FOV by 1°.
- **Episodes:** up to 1,000 steps, terminated after 7 consecutive steps with the target lost. This allows recovery from brief occlusion but stops prolonged failure.
- **Environment:** EagleSim (Unreal Engine 4). The target is driven by a **Random Waypoint** model with trajectory persistence, boundary-aware redirection and stall recovery, so the policy cannot overfit to predictable paths.

**Scale-Anchored Reward with Centering (SARC).** Given the target scale $S_t$ (fraction of the frame area) and the normalized center offset $\text{offset}_t$, SARC combines a Gaussian scale term peaked at a user-chosen setpoint with a centering term:

$$
r_{\text{scale},t} = \exp\!\left(-\frac{(S_t - S_{\text{target}})^2}{2\sigma^2}\right),\qquad \sigma = \frac{S_{\text{target}}}{2}
$$

$$
r_{\text{SARC},t} = \tfrac12\, r_{\text{scale},t} + \tfrac12\,(1 - \text{offset}_t)
$$

The Gaussian **breaks the monotonicity** that causes risk aversion: an over-zoomed-out view is punished exactly like an over-zoomed-in one, so the agent can no longer buy safety by shrinking the target. $S_{\text{target}}$ becomes one interpretable knob for the coverage–resolution trade-off.

**Termination smoothing.** Instead of a single penalty at the moment of loss (a cliff with no learning signal while the target drifts away), the penalty grows with the number of consecutive lost steps:

$$
r_{\text{fail},t} = \tanh\!\left(\frac{t_{\text{lost}}}{k_{\text{lost}}}\right) \cdot P_{\text{max\_lost}}
$$

This gives a recoverable warning inside the 7-step window and encourages re-acquisition.

**Architecture and training.** A four-layer CNN encoder (5×5 then three 3×3 kernels, stride 2; 32/64/64/128 channels) produces a 64-d embedding shared by the PPO actor and critic. Training uses 6 parallel simulator instances and about 3.1M environment steps, roughly 7.5 hours on a single RTX 5090.

## Experiments and Results

**Setup.** 100 EagleSim evaluation episodes of up to 1,000 steps.

- **SR** (success rate): fraction of episodes that reach the step limit without early termination.
- **TR** (tracking rate): fraction of steps in which the target is tracked.
- **Scale:** mean target area as a fraction of the frame. It should match $S_{\text{target}}$.
- **Offset:** mean normalized distance of the target from the image center.

**Baselines.** Two detect–track–control pipelines that differ only in the detector: *Perfect BBox* (ground-truth boxes, an upper bound) and *YOLOv5* (a deployable system). The learned baseline is Eagle.

| Method | $S_{\text{target}}$ | SR ↑ | TR ↑ | Scale | Offset ↓ |
| --- | --- | --- | --- | --- | --- |
| Perfect BBox (oracle) | 0.05 | 100% | 99.85% | 5.02% | 11.23% |
| YOLOv5 (deployable) | 0.05 | 0% | 13.54% | 4.29% | 36.80% |
| Eagle (prior DRL) | — | 32% | 55.83% | 0.57% | 48.40% |
| **SARC-PTZ (ours)** | **0.05** | **82%** | **86.50%** | **4.55%** | **11.14%** |
| SARC-PTZ | 0.10 | 77% | 79.91% | 8.84% | 16.26% |
| SARC-PTZ | 0.15 | 77% | 79.18% | 13.00% | 15.57% |
| SARC-PTZ | 0.20 | 71% | 78.71% | 16.51% | 17.16% |

**Ablation** (components added cumulatively, starting from the Eagle reward):

| Configuration | SR ↑ | TR ↑ | Scale | Offset ↓ |
| --- | --- | --- | --- | --- |
| Eagle reward (baseline) | 32% | 55.83% | 0.57% | 48.40% |
| + Scale-anchored reward | 72% | 78.41% | 4.64% | 43.77% |
| + Centering (= SARC) | 72% | 78.37% | 4.61% | 14.70% |
| + Termination smoothing (= SARC-PTZ) | **82%** | **86.50%** | 4.55% | **11.14%** |

![Training curves (episode reward and episode length) for SARC-PTZ at four target scales and the Eagle baseline.](/uploads/showcase/sarc-ptz-training-curves.webp)

*Training curves for the four $S_{\text{target}}$ settings and Eagle (dashed). SARC-PTZ reaches higher, more stable returns and much longer episodes (fewer early terminations), and convergence barely depends on $S_{\text{target}}$.*

![SARC-PTZ tracking demo](https://youtube.com/shorts/qpg9AktNglg)

**Findings.**

- **The classical pipeline is gated by detector reliability, and the gate is binary.** With perfect boxes it essentially solves the task; with a real detector it fails every episode. SARC-PTZ is trained on the closed-loop consequences of its own actions, needs no detector at inference, and reaches 82%.
- **The learned policy approaches oracle framing without privileged input.** Compared with Eagle, SR rises from 32% to 82% and TR from 55.83% to 86.50%. Scale holds at 4.55% against a 5% setpoint, and center offset falls to 11.14%, matching the oracle's 11.23%.
- **Each component has a distinct role.** The scale-anchored reward gives most of the gain (SR 32% → 72%, scale 0.57% → 4.64%). Centering cuts offset to about a third. Termination smoothing adds the final SR gain (72% → 82%).
- **The setpoint is a real control knob.** Across setpoints of 5–20%, the achieved scale rises monotonically while SR degrades gracefully, so the coverage–resolution trade-off is measured rather than asserted.

## Limitations and next steps

The agent tracks a single vehicle class fixed at training time. The reward relies on simulator bounding boxes. Evaluation is limited to one simulator and one scene. The feed-forward frame-stack policy has no long-term memory, and the policy has not run on a real camera.

These limits define my master's thesis, *Text-Conditioned Active Player Tracking with PTZ Cameras*. There, the target is named in natural language and can be switched mid-episode. The policy observes an open-vocabulary segmentation mask, uses a CNN-LSTM for memory, and is trained with offline RL. Evaluation moves to the diverse scenes of UnrealZoo and then to physical PTZ cameras.

*Submitted to ACCV 2026 and withdrawn by the authors to address reviewer feedback before resubmission.*
