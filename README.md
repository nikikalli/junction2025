# Pampers Club AI Campaign Manager

AI-powered solution for automating and scaling personalized marketing campaigns across 20+ countries using Braze APIs.

## Project Overview (Challenge description)

Use AI to reinvent how personalized marketing campaigns can be automated and scaled across 20+ countries using Braze APIs.

Today, Pampers Club reaches millions of families worldwide with loyalty rewards, personalized content, and direct communication. But running these campaigns across many countries is complex, time-consuming, and inefficient.

At Junction, we invite you to tackle this challenge: how can AI and automation transform campaign creation into a faster, smarter, and more effective process? The opportunity is to shape how one of the world’s leading consumer brands connects with families in the digital era.

Managing marketing campaigns today requires manual setup for every country, every message, and every channel — making innovation slow and repetitive.

The challenge is to build an AI-powered solution that automates campaign creation and management, enabling personalization at scale while reducing manual work.

Imagine a system that allows marketers to design, test, and optimize campaigns seamlessly across dozens of countries, languages, and audiences. How would you approach this problem to make the process more efficient, scalable, and impactful for millions of parents worldwide?

# Getting started

## Prerequisites

- Node.js >= 20
- npm
- Docker
- Braze API key (provided: `6d7b0fc4-6869-4779-b492-a3b74061eb25`)


## Startin local server

```bash
npm install
npm run init
npm run dev
```
Yes. It should really be that easy. Otherwise, come to floor 3 where to the table where _the music plays_.

### Key Features

- **AI-Powered Content Generation**: Automated campaign content creation using [SAS Viay](https://www.sas.com/fi_fi/software/viya.html) + Gemini models
- **Multi-Country Support**: Seamless campaign deployment across 20+ countries and languages
- **Braze Integration**: Direct integration with Braze API for campaign management
- **Performance Optimization**: AI-driven campaign optimization suggestions
- **Analytics Dashboard**: Real-time campaign performance tracking

## Tech Stack

- **Frontend**: React + TypeScript, Tailwind
- **Backend**: Node.js + TypeScript + Express
- **Infrastructure**: Terraform + AWS
- **AI**: Gemini models (bc OpenAI team were sleeping and didn't share their API credits in the hackathon)
- **CRM**: Braze API
- **Deployment**: Vercel + AWS

### Running Locally

**Option 1: Run both services together (from root)**
```bash
npm run dev
```
- [Challenge Resources](https://drive.google.com/drive/u/1/folders/1WRlNZ9Tc73ktWEwuyIKLnLEGLBnIcbIT)
- [Braze API Documentation](https://www.braze.com/docs/api/basics/)
- API Key: `6d7b0fc4-6869-4779-b492-a3b74061eb25`

## Development Team
Built for Junction 2025 - P&G Challenge, by

[Calvin Otewa](https://linkedin.com/in/otewa)
[Faeq Qanezadeh](https://www.linkedin.com/in/faeqqanezadeh/)
[Santeri Helminen](https://www.linkedin.com/in/santeri-helminen/)
[Nikita Kallio](https://linkedin.com/in/otewa)
[Daniela Burnaz](https://www.linkedin.com/in/danielaburnaz/)
