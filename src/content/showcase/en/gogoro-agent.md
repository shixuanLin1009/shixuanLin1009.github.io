---
title: GOGORO LLM Agent for Electric Vehicle Support
summary: A retrieval-augmented LLM agent built on Gogoro owner manuals that answers electric-scooter questions accurately.
category: projects
date: 2024-05-01
endDate: 2024-05-31
role: Developer
org: Cloud Rising Taiwan Generative AI Application Competition
tags: [AWS SageMaker, AWS Bedrock, AWS S3, LangChain, RAG, Hugging Face]
cover: /uploads/showcase/gogoro-architecture.webp
coverAlt: "System architecture: the user's prompt goes to an agent, which asks the LLM for general information and retrieves model-specific information from a vector database built from owner manuals (data, S3, embedding model, vector database)."
links: []
order: 1
certificate:
  image: /uploads/showcase/certificates/ai-wave-hackathon-2024.webp
  file: /uploads/showcase/certificates/ai-wave-hackathon-2024.pdf
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

## Background

Gogoro sells several scooter models, each with its own owner manual. When riders have a question about charging, warning lights or maintenance, the answer is usually somewhere in a long manual for their specific model, and a general chatbot will happily make one up.

For the *Cloud Rising Taiwan Generative AI Application Competition* in the first semester of my senior year, I built **GOGORO 萬事通** ("Gogoro Know-It-All"), an AI agent that answers owners' questions using the official manuals as its knowledge base.

## Method

The system has two connected parts, shown in the architecture above.

**1. A knowledge base built from the manuals.** Owner manuals for the different Gogoro models are uploaded to **AWS S3**, converted by an embedding model, and stored in a **multimodal vector database** that keeps text, tables and images. Tables and diagrams matter here, because many answers, such as specs or indicator meanings, live in them rather than in prose.

**2. An agent that answers precisely.** The user's prompt goes to an agent built on **AWS Bedrock**:

- **General questions** go straight to the LLM.
- **Model-specific questions** first retrieve the relevant passages from the vector database (**retrieval-augmented generation**), so the answer is grounded in the manual. This cuts hallucinations and improves answer quality.

**Development.** **AWS SageMaker** with **LangChain** sped up development and made it easy to plug in open-source models from Hugging Face. **Fine-tuning** further improved accuracy on complex vehicle questions.

## What I learned

This was my first end-to-end LLM application, from data pipeline to deployed agent. It taught me how much the quality of an answer depends on retrieval and grounding, not just on the model, a lesson that carried over to my later work [grounding a vision-language model in detected events](../volleycc/).
