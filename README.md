# MERN Multi-Tenant SaaS Dashboard

## Overview
A full-stack SaaS application implementing multi-tenant architecture where multiple organizations share the same system while maintaining strict data isolation.

## Tech Stack
- Frontend: React, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- Authentication: JWT

## Features
- Multi-tenant architecture using tenantId
- Secure authentication and authorization
- RESTful APIs for projects, analytics, and users
- Rate limiting and middleware-based security

## Key Concept
Each request is scoped using a tenantId, ensuring users can only access their organization’s data.

## Setup Instructions

1. Clone repo
2. Create `.env` using `.env.example`
3. Run backend:
   cd server
   npm install
   node index.js
4. Run frontend:
   cd client
   npm install
   npm start

## Status
Working project with MongoDB integration

## Screenshots
### Login
<img width="1920" height="1020" alt="Screenshot 2026-04-26 020314" src="https://github.com/user-attachments/assets/a4d6abda-122c-4f4c-9370-7b5a21dd4355" />

### Dashboard
<img width="1920" height="1020" alt="Screenshot 2026-04-26 020331" src="https://github.com/user-attachments/assets/eaf673f9-0a74-4fa7-8ca1-9a0ced3c7f82" />
