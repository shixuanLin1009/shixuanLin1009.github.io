---
title: GOGORO LLM Agent for Electric Vehicle Support
summary: A retrieval-augmented LLM agent built on Gogoro owner manuals that answers electric-scooter questions accurately.
category: projects
date: 2024-05-01
endDate: 2024-05-31
role: Developer
org: Cloud Rising Taiwan Generative AI Application Competition
tags: [AWS SageMaker, AWS Bedrock, LangChain, RAG, Hugging Face]
links: []
order: 1
resume:
  include: true
  order: 1
  subtitle: Cloud Rising Taiwan Generative AI Application Competition
  bullets:
    - "Tech Stack: AWS SageMaker, AWS S3, LangChain, Python"
    - Developed an AI agent based on Gogoro's owner manuals, improving customer support by accurately answering electric-vehicle questions.
    - Leveraged AWS SageMaker and LangChain to streamline development and integrate open-source models from Hugging Face.
    - Applied Retrieval-Augmented Generation (RAG) and fine-tuning to improve response accuracy for complex vehicle issues.
---

## Overview

Built for the *Cloud Rising Taiwan Generative AI Application Competition*, this agent ("GOGORO 萬事通") answers owners' questions using the official manuals as its knowledge base.

## System design

- **Manual knowledge base.** Owner manuals for different Gogoro models are collected and stored in a multimodal vector database covering text, tables and images.
- **Answering agent.** AWS Bedrock with retrieval-augmented generation fetches the relevant passages before answering, reducing hallucination and improving answer quality.
- **Model development.** AWS SageMaker and LangChain speed up development and connect open-source models from Hugging Face; fine-tuning further improves accuracy on complex questions.
