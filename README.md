# 📡 Meat Machines – Backend (NestJS + MongoDB)

## 📦 Project Description

This is the backend server for the Meat Machines web platform. It provides
secure APIs for managing industrial equipment listings, handling media uploads,
sending emails, scheduling tasks, and enabling multilingual support.

The backend powers both the public website and the internal admin panel.

## ⚙️ Technologies Used

- NestJS — server-side framework

- MongoDB — database (via Mongoose)

- JWT Authentication — secure login and access

- Multer — file uploads

- Cloudinary — cloud storage for product images and videos

- SendGrid — sending emails (contact forms, inquiries)

- node-cron — scheduled tasks (e.g., auto-removal of sold products)

- AI Integration — automatic product translation

## 🚀 Quick Start

### 📡 Backend

```bash
cd server
npm install
npm run start:dev
```

### 💻 Frontend

```bash
cd client
npm install
npm run dev
```

## 🔧 Key Features

- Authentication & Authorization (JWT-based)

- Products Management:

  - Create, Edit, Delete products

  - Upload and store media on Cloudinary

  - Mark products as Sold (with auto-removal after a set period using node-cron)

- Categories, Manufacturers, and Industries Management

- Public API for product listings and filtering

- Contact and Inquiry Forms:

  - Users can send messages via forms

  - Emails are sent securely using SendGrid

- Multilingual Support:

  - Automatic translation of product content via integrated AI

## 🕑 Scheduled Tasks (node-cron)

- Products marked as Sold are automatically removed after a specific time.

## 📬 Email Sending (SendGrid)

- Emails are sent for:

  - Contacting the company

  - Price requests

  - Product submission offers

- Email sending is handled with @sendgrid/mail.

## ☁️ Media Uploads (Cloudinary)

- Product images and videos are uploaded to Cloudinary.

- Uploads happen securely through backend routes using the Cloudinary SDK.

## 📝 Notes

- This server must be deployed with secure environment variables.

- All critical routes are protected by authentication guards.

- Can be easily scaled for additional services like payment integration or
  inventory synchronization.

## 📬 Contact

Development and support: **Marharyta Katsan**

**Emails:**

- 3margo10@gmail.com
- marharyta.katsan@gmail.com
- info@mmsweden.se
