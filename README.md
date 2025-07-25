# Introduction
**Cvku.id** is a decentralized platform that allows users to securely create, store, and share digital resumes through blockchain technology. By leveraging smart contracts on the Internet Computer Protocol (ICP), every entry in a resume—such as education, work experience, and certifications—can be verified directly by the relevant institution without intermediaries, increasing data transparency and authenticity.

This project addresses common challenges in today's professional world, such as the difficulty of verifying credentials, lack of control over personal data, and reliance on centralized platforms. With its Web3-based approach, users have full control over their identity and data and can move their resumes across platforms without losing their validity or professional history.

# Project Overview
**Landing**
<img width="1345" height="623" alt="Screenshot From 2025-07-25 16-35-47" src="https://github.com/user-attachments/assets/f4eaaa15-c032-4b04-967e-d98f1490a946" />

**Login**
<img width="1345" height="623" alt="Screenshot From 2025-07-25 16-36-02" src="https://github.com/user-attachments/assets/b0b9678b-7cc6-428a-a493-86460db6e971" />

**Resume Builder**
<img width="1345" height="623" alt="Screenshot From 2025-07-25 17-24-36" src="https://github.com/user-attachments/assets/203c215e-237a-44fd-a215-04e6f3f87754" />

**AI Assistant**
<img width="1345" height="623" alt="Screenshot From 2025-07-25 16-58-53" src="https://github.com/user-attachments/assets/3963edb4-99e4-4f81-8136-74c658285cbd" />

**ATS Optimization**
<img width="1345" height="623" alt="Screenshot From 2025-07-25 17-17-29" src="https://github.com/user-attachments/assets/310df04a-9a65-4a85-a0dd-a74935acfd68" />

**Resume Score**
<img width="1345" height="623" alt="Screenshot From 2025-07-25 17-17-37" src="https://github.com/user-attachments/assets/81014a7f-06ce-4584-afb5-fae3d3091b26" />

**AI Cover Letter Builder**
<img width="1345" height="623" alt="Screenshot From 2025-07-25 17-17-44" src="https://github.com/user-attachments/assets/42b25e9a-c3c8-44cb-a770-8fe407b7af95" />

**Analytics Dashboard**
<img width="1345" height="623" alt="Screenshot From 2025-07-25 17-18-26" src="https://github.com/user-attachments/assets/34367ae8-a2dc-438b-ba8d-e30212764b07" />

**Future Enhancements Underway...**

# Features
1. **AI-Powered Resume Builder**: Leverage advanced artificial intelligence to effortlessly generate tailored resume content, transforming your professional experience into compelling narratives that stand out.
2. **Real-time Live Preview**: Visualize your resume's final appearance instantly as you make edits, ensuring perfect formatting and layout before export
3. **Customizable Sections**: Gain unparalleled flexibility by adding personalized sections, allowing you to highlight unique skills, projects, or experiences relevant to your career goals.
4. **ATS Optimization Feedback**: Receive intelligent recommendations and actionable insights to optimize your resume for Applicant Tracking Systems, significantly increasing your chances of passing initial screenings.
5. **Comprehensive Resume Scoring**: Get an objective evaluation of your resume's strength and competitiveness, identifying areas for improvement to maximize your appeal to recruiters.
6. **AI Cover Letter Generator**: Craft personalized and impactful cover letters with AI assistance, designed to capture attention and complement your resume for specific job applications.
7. **Shareable Online Resume**: Easily share a professional, web-based version of your resume with potential employers, recruiters, or your network, expanding your visibility and reach.

# Pitch Deck
[https://www.canva.com/design/DAGuIP2fstg/_8uQu0DDmuUFiiLwx-AY1w/view
](https://www.canva.com/design/DAGuIP2fstg/_8uQu0DDmuUFiiLwx-AY1w/view
)
# Architecture Description
1. **Modular/Microservice Architecture**: We've strategically adopted a modular/microservice architecture, where each core feature operates as an independent service. This approach offers significant advantages: individual services scale independently for enhanced scalability, failures are isolated for improved resilience, and teams can develop and deploy features autonomously, leading to faster development cycles. Additionally, it allows for a flexible technology stack by enabling the use of optimal tools for each task, and simplifies maintenance due to smaller, more focused codebases.
2. **Decentralized AI Computing on the Internet Computer (ICP)**: Our AI-powered features (Resume Builder, ATS Optimization, Resume Scoring, Cover Letter Generator) leverage the Internet Computer's native capabilities for scalable and distributed computing. Use the Internet Computer Protocol (ICP) AI services that are decentralized and transparent, like on-chain AI models or smart agents, ensuring security without middlemen.
3. **Secure Decentralized Authentication (Internet Identity)**: User authentication is handled through Internet Identity, a built-in feature of the Internet Computer. This provides a highly secure and convenient login experience for users, eliminating traditional usernames and passwords while offering strong cryptographic guarantees and enhanced privacy by removing centralized identity providers.

# Build and deployment instructions for local development
1. install IC SDK see [https://internetcomputer.org/docs/building-apps/getting-started/install](https://internetcomputer.org/docs/building-apps/getting-started/install)
2. Clone project
   ```bash
   git clone https://github.com/Frascth/cvku.id.git
3. Open the project with ur favorite IDE
4. Install Node JS package
   ```bash
   npm i
5. Install Motoko package
   ```bash
   mops install
6. Install Ollama (for AI feature)

   Windows download here: [https://ollama.com/download/windows](https://ollama.com/download/windows)
   
   Mac download here: [https://ollama.com/download/mac](https://ollama.com/download/mac)

   Linux run this command:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
8. Download llama3.1:8b model (for AI feature)
    ```bash
    ollama pull llama3.1:8b
9. Start Ollama service (for AI feature)
    ```bash
    ollama serve
10. Start IC Network
    ```bash
    dfx stop
    dfx start --clean --background
11. Deploy canister
    ```bash
    dfx deploy
12. Launch the Resume Builder and Start Creating Your Story
    
# ICP Features Used
1. Caller Identification
2. Candid Serialization
3. Internet Identity Authentication
4. ICP Large Language Models




