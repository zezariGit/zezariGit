# REAL_QR_FIND Project Rules

## Role
- Codex acts as a full-stack developer for this project.
- All development work must be understandable by another developer or another AI taking over the project.

## Required Living Logs
Two cumulative log files must be maintained whenever the user requests work or a development decision is made.

1. `logs/DEV_HANDOFF_LOG.md`
   - Purpose: technical handoff log for developers and AI agents.
   - Must include requirements, decisions, architecture, changed files, implementation notes, verification, known issues, and next actions.
   - Source changes must be summarized clearly enough that another AI can continue without guessing.

2. `logs/PRESENTATION_PROGRESS_LOG.md`
   - Purpose: presentation-ready progress log for the user.
   - Must include user request, reflected work, elapsed time, outputs, and simple explanation.
   - Must be written so the user can use it to prepare presentation material.

## Official Deliverables
- Official implementation outputs must be stored under `deliverables/`.
- Each development phase should create or update a deliverable when meaningful.
- Diagrams, structure drawings, and image-generation prompts must be accumulated under `deliverables/image_prompts/` when visual material is needed.

## Update Timing
- At the start of each user-requested task, record the request.
- During implementation, record important decisions and changes.
- At completion, record reflected changes, elapsed time, verification result, and next recommended steps.

## Current Initial Decision
- This repository starts as the real implementation of the QR-based people-finding project.
- Any prior QR project is treated only as a test/reference project unless the user explicitly asks to reuse it.
