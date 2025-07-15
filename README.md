# CareerOS Authentication System

A complete authentication system with Spring Boot backend and React frontend, featuring user registration, login, logout, and protected routes.

## Features

- ✅ User registration with validation
- ✅ User login with JWT authentication
- ✅ Protected routes with React Router
- ✅ Automatic token validation
- ✅ User logout functionality
- ✅ Responsive UI with Tailwind CSS
- ✅ Error handling and loading states
- ✅ Role-based authentication

## Tech Stack

### Backend
- Spring Boot 3.5.3
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL (Supabase)
- Java 22

### Frontend
- React 18
- TypeScript
- React Router DOM
- Axios for API calls
- Tailwind CSS
- Lucide React icons

## Quick Start

### 1. Backend Setup

Navigate to the backend directory and start the Spring Boot application:

```bash
cd backend
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 2. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/validate` - Token validation

### Request/Response Examples

#### Signup Request
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "role": ["user"]
}
```

#### Login Request
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

#### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["ROLE_USER"]
}
```

## Usage Flow

1. **Registration**: Visit `/auth` and click "Create a new account"
2. **Login**: After registration, you'll be redirected to login
3. **Dashboard**: After successful login, you'll be redirected to `/dashboard`
4. **Logout**: Click the logout button in the dashboard or navigation

## Project Structure

```
CareerOS/
├── backend/
│   ├── src/main/java/com/careeros/backend/
│   │   ├── controller/
│   │   │   └── AuthController.java
│   │   ├── model/
│   │   │   ├── User.java
│   │   │   └── Role.java
│   │   ├── repository/
│   │   │   └── UserRepository.java
│   │   ├── security/
│   │   │   ├── AuthTokenFilter.java
│   │   │   ├── JwtUtils.java
│   │   │   ├── UserDetailsImpl.java
│   │   │   └── UserDetailsServiceImpl.java
│   │   ├── payload/
│   │   │   ├── request/
│   │   │   │   ├── LoginRequest.java
│   │   │   │   └── SignupRequest.java
│   │   │   └── response/
│   │   │       ├── JwtResponse.java
│   │   │       └── MessageResponse.java
│   │   └── config/
│   │       └── WebSecurityConfig.java
│   └── src/main/resources/
│       └── application.properties
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── AuthPage.tsx
    │   │   │   ├── LoginForm.tsx
    │   │   │   └── SignupForm.tsx
    │   │   ├── common/
    │   │   │   └── ProtectedRoute.tsx
    │   │   ├── dashboard/
    │   │   │   └── Dashboard.tsx
    │   │   └── navigation/
    │   │       └── Navigation.tsx
    │   ├── contexts/
    │   │   └── AuthContext.tsx
    │   ├── services/
    │   │   └── api.ts
    │   ├── types/
    │   │   └── auth.ts
    │   └── utils/
    │       ├── apiErrorHandler.ts
    │       └── validation.ts
    └── package.json
```

## Environment Configuration

### Backend Configuration
The backend uses Supabase PostgreSQL. Update `application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:postgresql://your-database-url
spring.datasource.username=your-username
spring.datasource.password=your-password
app.jwt.secret=your-jwt-secret-key
app.jwt.expiration=86400000
```

### Frontend Configuration
Update the API URL in `src/services/api.ts` if your backend runs on a different port:

```typescript
const API_URL = 'http://localhost:8080/api';
```

## Security Features

- JWT-based authentication
- Password encryption with BCrypt
- CORS configuration for cross-origin requests
- Role-based authorization
- Token validation middleware
- Secure session management

## Development

### Backend Development
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production
```bash
# Backend
cd backend
./mvnw clean package

# Frontend
cd frontend
npm run build
```

## Testing the Authentication Flow

1. Start both backend and frontend servers
2. Open `http://localhost:5173` in your browser
3. You'll be redirected to `/auth` if not logged in
4. Create a new account using the signup form
5. After successful registration, you'll be redirected to login
6. Login with your credentials
7. You'll be redirected to the dashboard
8. Test logout functionality

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend CORS configuration matches your frontend URL
2. **Database Connection**: Verify your Supabase credentials in `application.properties`
3. **JWT Token Issues**: Check that the JWT secret is properly configured
4. **Frontend Build Errors**: Run `npm install` to ensure all dependencies are installed

### Logs
- Backend logs: Check the Spring Boot console output
- Frontend logs: Check the browser developer console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the authentication flow
5. Submit a pull request

## License

This project is licensed under the MIT License.