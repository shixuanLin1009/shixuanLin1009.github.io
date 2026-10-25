---
title: GOGORO 萬事通：電動機車客服 AI Agent
summary: 以 Gogoro 車主手冊為知識庫、結合 RAG 的 LLM Agent，能精準回答電動機車相關問題。
role: 開發者
org: 雲湧智生台灣生成式 AI 應用競賽
resume:
  subtitle: 雲湧智生台灣生成式 AI 應用競賽
  bullets:
    - 技術：AWS SageMaker、AWS S3、LangChain、Python
    - 以 Gogoro 車主手冊為知識庫開發 AI Agent，精準回答電動機車相關問題，提升客服效率。
    - 運用 AWS SageMaker 與 LangChain 加速開發，並整合 Hugging Face 上的開源模型。
    - 結合檢索增強生成（RAG）與微調，提升複雜車輛問題的回答準確度。
---

## 專案簡介

在大四上學期的「雲湧智生台灣生成式 AI 應用競賽」中，為 Gogoro 開發出以車主手冊為知識庫、能回應電動車相關問題的 AI Agent——「GOGORO 萬事通」。

## 系統架構

- **彙整車主手冊**：彙整不同車型的車主手冊，以多模態向量知識庫儲存文字、表格與圖像資料，提升回覆的準確性。
- **精準回答的 Agent**：以 AWS Bedrock 結合 RAG 技術，在回答前先檢索相關段落，減少 LLM 幻覺、提升回應品質。
- **模型開發**：以 AWS SageMaker 搭配 LangChain 加速大型語言模型應用的開發，串接社群開源模型，並透過微調提升複雜問題的回答精準度。
