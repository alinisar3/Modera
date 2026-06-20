# Modera - AI Content Moderation Platform

Modera is an industrial-grade, full-stack platform designed for automated policy compliance screening. It leverages the Mistral Pixtral 12B Vision AI to analyze digital assets against six major safety categories with high-precision confidence scoring.

## Architecture Decisions

1. Policy Integrity Snapshots: Every image submission saves a copy of the active admin policies at that exact timestamp. This ensures that historical verdicts remain tied to the rules active at the time of audit.
2. Dual-Engine Enforcement: The platform uses a backend gated logic system that compares AI confidence scores against database-defined thresholds to decide if an asset is Approved, Flagged, or Blocked.
3. Multi-Role Capability: The system uses JWT-based identity management to strictly separate Standard User capabilities from Administrative Oversight tools.
4. Card-Less Command Center UI: The interface uses an open-space, industrial design with high-contrast typography (font-black) to provide a professional governance aesthetic.

## Required Environment Variables

Create a file named .env in the root directory (modera/) and paste the following:

MISTRAL_API_KEY=your_mistral_ai_key
JWT_SECRET=your_random_64_character_string
ADMIN_SECRET_KEY=MODERA_2025_ACCESS
MONGO_URI=mongodb://mongo:27017/modera
PORT=5000

## Setup Instructions

Step 1: Clone the repository to your local machine.
Step 2: Ensure Docker Desktop is installed and the engine status is green (Running).
Step 3: Open the modera project folder in VS Code.
Step 4: Create the .env file in the root folder as described above.
Step 5: Open your terminal in the root folder.
Step 6: Deploy using the Docker commands listed below.

## Docker Deployment Commands

### Option A: The Primary Method (Recommended)
This command builds all images, sets up the internal network, and starts the database, backend, and frontend simultaneously.

Run in root folder:
docker-compose up --build

### Option B: Manual Individual Run (For Debugging)
If you wish to run services individually, follow these steps in order:

1. Create a virtual network:
docker network create modera-network

2. Start the Database:
docker run -d --name mongo --network modera-network -p 27017:27017 mongo:latest

3. Build and Start Backend:
docker build -t modera-backend ./backend
docker run -d --name backend --network modera-network -p 5000:5000 --env-file .env modera-backend

4. Build and Start Frontend:
docker build -t modera-frontend ./frontend
docker run -d --name frontend --network modera-network -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:5000/api modera-frontend

## Initialization and Use

1. Register Master Admin:
   - Access http://localhost:3000/auth
   - Click Join Now.
   - Select Platform Admin.
   - Enter your credentials.
   - Enter the Secret Key: MODERA_2025_ACCESS.
   - Click Create Admin Account.

2. Access Governance:
   - Once logged in, the sidebar will unlock the Policies, Analytics, and Appeals nodes.
   - Use the Policies tab to set AI sensitivity (e.g., set Weapons to 30% for strictness).

3. Execute Scans:
   - Use the Dashboard to paste a public image URL.
   - The AI will generate a live audit report with per-category confidence scores and reasoning.

4. Manage Appeals:
   - Users can file disputes for Blocked content.
   - Admins review these in the Appeals Oversight queue, provide written feedback, and override the AI verdict to Approved.

## Security and Integrity

1. Admin Lock: Registration for the 'Administrator' role is gated by the Secret Key: MODERA_2025_ACCESS.
2. Route Guards: Unauthenticated users are automatically redirected to the secure login portal.
3. Session Persistence: Remember Me functionality extends security tokens to 30 days.
4. Data Purge: Admins have exclusive rights to permanently delete security records from the audit log.

## Troubleshooting

- Docker Error: If the build fails, ensure Docker Desktop is open.
- Port Collision: Ensure ports 3000 and 5000 are not being used by other apps.
- API Failures: Verify that your MISTRAL_API_KEY has active credits in the Mistral console.