---
title: Library AI Chat Platform
summary: An AI chat platform for the NCKU Library. Readers and staff sign in with their campus account, and each role gets its own models and usage limits. Prototype in October 2026, campus launch in November.
category: projects
date: 2026-10-01
endDate: 2026-12-31
role: Student Programmer (sole engineer)
org: NCKU Library
tags: [Docker, Keycloak, SAML, OIDC, Open WebUI, LiteLLM, Groq, Ollama, nginx, PostgreSQL, Redis, Python]
links: []
featured: true
order: 0
resume:
  include: false
---

## Background

The library wanted to offer an AI assistant to readers and staff. Three things were required: people must sign in with their existing library account, the platform must use AI models that the library can afford, and access and spending must depend on who the user is. I was the only engineer, and I took the project from requirements to a campus launch in two months.

## What it does

- **One login.** Users click "Sign in with library account" and log in on the university's own login page. The platform never sees their password.
- **Access by role.** Readers get a fast, low-cost model. Librarians also get a stronger model. Administrators can manage everything.
- **Spending limits.** Three layers of limits stop runaway costs: a total budget for the library, model access by group, and a personal budget and request rate for each user. Every request is recorded under the user's account.
- **Cloud and local models.** Cloud models (Groq) are reached through one gateway, together with a self-hosted open-source model on a lab server that costs nothing per request. Models use generic names, so the library can change providers without touching permissions.

## How it works

The university login system speaks SAML, but the chat interface (Open WebUI) only supports OIDC. **Keycloak** sits in the middle and translates between the two, and it also turns login attributes into groups such as reader and staff. **LiteLLM** is the model gateway: it checks which models a group may use, enforces budgets and rate limits, and records usage. All services run in **Docker** behind a single **nginx** HTTPS entrance on the campus network.

## Results

- **October (prototype):** the full login → chat → usage-control flow ran end to end, and 13 automated checks passed, covering single sign-on, roles, model access, usage tracking, limits and disabled accounts.
- **November (campus launch):** all services moved behind one HTTPS address on the campus network, a local model was added, and the library can now manage models, keys and budgets in a web interface instead of config files.
- **Faster sign-in:** the login redirect page used to download 1.7 MB of styles on every sign-in. A custom minimal page brought it down to 1.7 KB.
- **Easy to run:** 11 one-click maintenance buttons (health check, restart, logs, backup, update and more), daily backups, and an update script that rolls back automatically if something fails.
- **Handover:** a 10-page operations manual with screenshots for library staff, plus a technical documentation site.

## Problems solved along the way

- **Admin console seat limit.** The free version of the gateway's admin console allows only five users, and anyone who logs in takes a seat. I added two checks in Keycloak so that only administrators can reach it.
- **Campus firewall.** Only three ports were open from the campus network, so every service (login, model admin, docs) was moved under one HTTPS address.
- **A model was retired by the provider.** The planned model was removed, so I switched to new models and put generic names in front of them to make future changes painless.
