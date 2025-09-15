# Backend API Server

Node.js/Express backend API for the React Native application.

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Redis (optional, for caching)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Run database migrations:
```bash
npm run db:migrate
```

4. Seed the database (optional):
```bash
npm run db:seed
```

### Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Test User Credentials

1. CEO:
   - Email: ceo@test.com
   - Password: test123
   - Role: CEO with full admin permissions

2. Manager:
   - Email: manager@test.com
   - Password: test123
   - Role: Manager with read/write permissions

3. Staff:
   - Email: staff@test.com
   - Password: test123
   - Role: Staff with read-only permissions

### API Documentation

The API provides endpoints for:
- Authentication (`/api/auth`)
- User management (`/api/users`)
- Task management (`/api/tasks`)
- Channel/chat management (`/api/channels`)
- Notifications (`/api/notifications`)

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm test` - Run tests
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data

### Deployment

This backend is ready for deployment to platforms like Render, Heroku, or any Node.js hosting service.

For Render deployment:
1. Connect this repository
2. Set environment variables
3. Deploy with build command: `npm run build`
4. Start command: `npm start`

For Elastic Beanstalk deployment:
1. Use `eb init` to initialize
2. Configure environment variables
3. Deploy with `eb deploy`