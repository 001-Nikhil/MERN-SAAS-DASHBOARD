# MERN SaaS Dashboard
(Project is functional and actively under development. Future updates planned.)

A full-stack multi-tenant SaaS dashboard built using the MERN stack. The project focuses on how real-world SaaS applications manage multiple organizations within a single system while ensuring proper data isolation and security.

---

## Why This Project

This project was built to understand how SaaS platforms handle multiple tenants (organizations) in one application. The goal was to implement secure data separation and simulate a real backend structure used in production systems.

---

## Key Highlight

All database queries are scoped using `tenantId`, ensuring that data from one organization is never accessible to another.

---

## Tech Stack

**Frontend**

* React.js
* Tailwind CSS
* Recharts

**Backend**

* Node.js
* Express.js
* MongoDB (Mongoose)

**Authentication**

* JSON Web Tokens (JWT)

---

## Features

* JWT-based authentication (login/register)
* Multi-tenant architecture using tenantId
* Protected API routes using middleware (auth + tenant guard)
* Dashboard analytics with data fetched from MongoDB
* Project and team/member management
* Data visualization using charts (revenue, users, MRR)
* Total projects count integrated with backend

---

## Dashboard

The dashboard provides:

* Monthly revenue overview
* Active users and new sign-ups
* Monthly recurring revenue (MRR)
* Total project count
* Basic analytics visualized through charts

---

## Project Structure

```bash
mern_saas/
├── client/        # React frontend
├── server/        # Express backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   └── middleware/
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/001-Nikhil/MERN-SAAS-DASHBOARD.git
cd MERN-SAAS-DASHBOARD
```

---

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secret
```

Run the backend:

```bash
node index.js
```

---

### 3. Frontend setup

```bash
cd client
npm install
npm start
```

---

## Screenshots
### Login page
<img width="1920" height="1020" alt="Screenshot 2026-04-26 020314" src="https://github.com/user-attachments/assets/c0279ebc-2451-4fbb-963b-b12e1737272d" />

### Dashboard Page
<img width="1899" height="918" alt="Screenshot 2026-04-26 023847" src="https://github.com/user-attachments/assets/f5e6a01a-a85e-40e7-bb05-bf65cb4b4566" />

### Project Page
<img width="1897" height="911" alt="Screenshot 2026-04-26 023908" src="https://github.com/user-attachments/assets/e7dc1653-8192-4cbb-89e0-e62ed32acc9f" />

### Project Page (New Project Interface)
<img width="1883" height="898" alt="Screenshot 2026-04-26 023938" src="https://github.com/user-attachments/assets/61da70f0-dff9-48ec-8b3c-701391f82942" />


---

## Notes

* Use the "Seed Demo Data" button to populate analytics data
* The system supports multiple users under different organizations

---

## Future Improvements

* Role-based access control (admin/user roles)
* Deployment (frontend and backend)
* Improved analytics and filtering
* Notifications system

---

## Author

Nikhil Thakur [LinkedIn](https://www.linkedin.com/in/nikhil-thakur-239273342/)
