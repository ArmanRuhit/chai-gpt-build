# Chai GPT Build — Assignment

Instead of building another chat application from scratch, your goal is to improve an existing codebase by adding capabilities that make it feel closer to ChatGPT.

**Code Repository:** https://github.com/Aestheticsuraj234/chai-gpt-build

## Phase 1: AI Tools (Web Search)

Large Language Models only know what they were trained on.

Modern AI products solve this by allowing models to use external tools whenever additional information is required.

Your task is to build a tool calling system where the model can automatically invoke a web search tool, fetch real-time information and continue generating the final answer using the retrieved data.

The user should feel like the AI naturally searched the web before answering.

### Requirements

- Integrate at least one Web Search tool
- Allow the LLM to decide when to call the tool
- Stream tool execution and the final response
- Store tool calls and tool responses
- Handle loading and error states gracefully

## Phase 2: Chat Branching

Modern AI products allow users to continue conversations from any previous message without losing the existing conversation.

Your task is to implement conversation branching.

Users should be able to create a new branch from any previous message and continue the discussion independently.

Each branch should preserve its own history while still sharing the original conversation until the branching point.

### Requirements

- Create a branch from any message
- View and switch between branches
- Persist branch history
- Rename/Delete branches
- Build a clean UI for branch navigation

## Submission Instructions

- Public GitHub Repository
- Live Deployment
- README
- Demo Video

## Evaluation Parameters

### Tool Calling (30 Marks)

- Tool Integration
- Tool Invocation
- Streaming
- Error Handling
- Database Persistence

### Chat Branching (35 Marks)

- Branch Creation
- Branch Navigation
- Branch Management
- Data Persistence
- Overall UX

### Code Quality (20 Marks)

- Project Structure
- Reusable Components
- Type Safety
- Clean Architecture
- Proper Documentation

### User Experience (10 Marks)

- Loading States
- Responsive UI
- Error Handling
- Overall Polish

### Deployment (5 Marks)

- Live URL
- Working README
- Proper Environment Configuration

**Max Marks: 100**
