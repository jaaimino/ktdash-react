# KTDash Next.js React App

![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-Latest-blue?style=for-the-badge&logo=react)
![Prisma](https://img.shields.io/badge/Prisma-6.6.0-2D3748?style=for-the-badge&logo=prisma)
![SWR](https://img.shields.io/badge/SWR-2.3.3-black?style=for-the-badge)

A comprehensive dashboard application built with Next.js and React for managing Kill Team rosters and resources.

[![Website](https://img.shields.io/badge/Visit_Website-ktdash.app-success?style=for-the-badge)](https://beta.ktdash.app)
[![Discord](https://img.shields.io/badge/Join_Discord-KTDash-7289DA?style=for-the-badge&logo=discord)](https://discord.gg/zyuVDgYNeY)

## Getting Started

### New Installation

1. **Set up environment**
   Create a `.env` file in the project root with your database connection:
   ```
   DATABASE_URL=mysql://[user]:[password]@[host]:[port]/[dbname]?connect_timeout=300
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

### For Existing Developers (Updating Dependencies)

If you already have the project installed and have not updated the project in a while, follow these steps:

1. **Update to the latest packages**
   ```bash
   # Remove existing dependencies
   rm -rf node_modules
   
   # Install fresh dependencies
   npm install
   ```

2. **Regenerate Prisma client**
   ```bash
   npx prisma generate
   ```

3. **Verify the update**
   ```bash
   # Build the application
   npm run build
   
   # Run the development server
   npm run dev
   ```

## Contributing

Contributions are welcome! Please feel free to fork this project and submit a Pull Request.