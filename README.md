# Introduction
Cvku.id is a decentralized platform that allows users to securely create, store, and share digital resumes through blockchain technology. By leveraging smart contracts on the Internet Computer Protocol (ICP), every entry in a resume—such as education, work experience, and certifications—can be verified directly by the relevant institution without intermediaries, increasing data transparency and authenticity.

This project addresses common challenges in today's professional world, such as the difficulty of verifying credentials, lack of control over personal data, and reliance on centralized platforms. With its Web3-based approach, users have full control over their identity and data and can move their resumes across platforms without losing their validity or professional history.

# Features
1. **AI-Powered Resume Builder**: Leverage advanced artificial intelligence to effortlessly generate tailored resume content, transforming your professional experience into compelling narratives that stand out.
2. **Real-time Live Preview**: Visualize your resume's final appearance instantly as you make edits, ensuring perfect formatting and layout before export
3. Customizable Sections: Gain unparalleled flexibility by adding personalized sections, allowing you to highlight unique skills, projects, or experiences relevant to your career goals.
4. **ATS Optimization Feedback**: Receive intelligent recommendations and actionable insights to optimize your resume for Applicant Tracking Systems, significantly increasing your chances of passing initial screenings.
5. **Comprehensive Resume Scoring**: Get an objective evaluation of your resume's strength and competitiveness, identifying areas for improvement to maximize your appeal to recruiters.
6. **AI Cover Letter Generator**: Craft personalized and impactful cover letters with AI assistance, designed to capture attention and complement your resume for specific job applications.
7. **Shareable Online Resume**: Easily share a professional, web-based version of your resume with potential employers, recruiters, or your network, expanding your visibility and reach.

# Architecture Description
1. **Modular/Microservice Architecture**: We've strategically adopted a modular/microservice architecture, where each core feature operates as an independent service. This approach offers significant advantages: individual services scale independently for enhanced scalability, failures are isolated for improved resilience, and teams can develop and deploy features autonomously, leading to faster development cycles. Additionally, it allows for a flexible technology stack by enabling the use of optimal tools for each task, and simplifies maintenance due to smaller, more focused codebases.
2. **Decentralized AI Computing on the Internet Computer (ICP)**: Our AI-powered features (Resume Builder, ATS Optimization, Resume Scoring, Cover Letter Generator) leverage the Internet Computer's native capabilities for scalable and distributed computing. Use the Internet Computer Protocol (ICP) AI services that are decentralized and transparent, like on-chain AI models or smart agents, ensuring security without middlemen.
3. **Secure Decentralized Authentication (Internet Identity)**: User authentication is handled through Internet Identity, a built-in feature of the Internet Computer. This provides a highly secure and convenient login experience for users, eliminating traditional usernames and passwords while offering strong cryptographic guarantees and enhanced privacy by removing centralized identity providers.

# Build and deployment instructions for local development
1. Clone project
   ```bash
   git clone https://github.com/Frascth/cvku.id.git
2. Open the project with ur favorite IDE
3. Install Node JS package
   ```bash
   npm i
4. Install Motoko package
   ```bash
   mops install
5. Install Ollama (for AI feature)

   Windows download here: [https://ollama.com/download/windows](https://ollama.com/download/windows)
   
   Mac download here: [https://ollama.com/download/mac](https://ollama.com/download/mac)

   Linux run this command:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
7. Download llama3.1:8b model (for AI feature)
    ```bash
    ollama pull llama3.1:8b
8. Start Ollama service (for AI feature)
    ```bash
    ollama serve
9. Start IC Network
   ```bash
   dfx stop
   dfx start --clean --background
10. Deploy canister
    ```bash
    dfx deploy
11. Open the front end canister url, and start building resume

# ICP Features Used
1. Caller Identification
2. Candid Serialization
3. Internet Identity Authentication
4. ICP Large Language Models




