# Doctor Consultation Backend System

Backend system for doctor consultation with role-based access, booking/session lifecycle, real-time chat, and admin controls.

## 1. What This Project Solves

This backend supports three actors:

- User: register, login, book doctor, view own bookings, chat during active session.
- Doctor: register, login, toggle online/offline, view own appointments, start/end session, chat during active session.
- Admin: login, approve doctor, block user/doctor, view platform transactions.

## 2. Tech Stack and Why It Is Used

- Node.js: non-blocking runtime, good for API + real-time communication.
- Express.js: simple, fast HTTP routing and middleware pipeline.
- MongoDB: flexible document model for users/bookings/messages.
- Mongoose: schema validation, relations via refs, indexing support.
- JWT (`jsonwebtoken`): stateless authentication for API and Socket.io.
- `bcryptjs`: secure password hashing before storing credentials.
- Socket.io: event-based real-time chat and live availability updates.
- `cors`: browser origin control.
- `morgan`: request logs for debugging and observability.
- `dotenv`: environment-based config separation.

## 3. Architecture Style

Project uses layered clean backend structure:

`Routes -> Controllers -> Services -> Repositories -> Models`

- Routes: map URL to controller and attach middleware.
- Controllers: handle HTTP request/response only.
- Services: business rules and workflow orchestration.
- Repositories: DB query abstraction.
- Models: schema and index definitions.

This structure is used to keep code testable, maintainable, and scalable.

## 4. Request Flow (How a Request Moves)

1. Request hits route in `src/routes`.
2. Middleware checks auth, role, and payload validation.
3. Controller calls service.
4. Service runs business logic and calls repository/model.
5. Data is persisted/fetched.
6. Controller returns response.
7. Errors are normalized by global error middleware.

## 5. Folder Structure and Why It Exists

```txt
src/
  app.js
  config/
  controllers/
  middleware/
  models/
  repositories/
  routes/
  services/
  socket/
  utils/
server.js
scripts/
```

- `src/app.js`: express app bootstrap, middlewares, route mounting.
- `src/config/`: environment/DB configuration.
- `src/controllers/`: request-response logic only.
- `src/middleware/`: auth, RBAC, validation, and error handling.
- `src/models/`: MongoDB schema definitions.
- `src/repositories/`: reusable DB operations.
- `src/routes/`: API endpoint definitions.
- `src/services/`: core business logic.
- `src/socket/`: socket server init and handlers.
- `src/utils/`: shared helpers (`AppError`, async wrapper, token utility).
- `server.js`: starts HTTP server + DB + Socket.io.
- `scripts/`: local testing scripts for realtime/demo.

## 6. Features Implemented (Task Checklist)

### Authentication and Roles

- User registration/login
- Doctor registration/login
- Doctor login allowed only after admin approval
- Admin login
- JWT token issue + verify
- Password hashing with bcrypt
- Protected routes
- Role-based access control
- Logout endpoint (`POST /api/auth/logout`, client-side token removal)

### Doctor Availability

- Doctor can toggle online/offline
- Availability stored in DB
- Real-time broadcast: `doctor:availability:updated`

### Booking and Session

- Book doctor
- Start session
- End session
- Auto duration calculation
- Auto billing calculation
- Status updates (`booked -> in_session -> completed`)
- Stores `startTime`, `endTime`, `durationMinutes`, `totalAmount`, `doctorEarning`
- Commission + transaction entry creation

### Real-Time Chat

- One-to-one chat scoped by booking room (`booking:<bookingId>`)
- Access only for booking participants
- Active-session-only chat enforcement
- Messages stored in MongoDB
- Typing indicator support
- Disconnect/reconnect flow via room rejoin (`chat:join`)
- Postman-friendly REST send also available

### Admin Panel

- Approve/unapprove doctor
- Block/unblock doctor
- Block/unblock user
- List all doctors
- List all users
- View all transactions

## 7. Data Models

- User: name, email, password, role, isBlocked
- Doctor: user ref, specialization, consultationFee, isApproved, isOnline, totalEarnings
- Booking: user ref, doctor ref, status, timings, billing fields, commission rate
- Message: booking ref, sender ref, senderRole, content
- Transaction: booking ref, user ref, doctor ref, amount split details

## 8. Commission Logic

At session end:

1. `durationMinutes = ceil((endTime - startTime) / 60000)` (minimum 1)
2. `totalAmount = consultationFee * durationMinutes`
3. `platformCommission = totalAmount * commissionRate`
4. `doctorEarning = totalAmount - platformCommission`

Default `commissionRate` is `0.2` and configurable via `.env`.

## 9. API Endpoints

Base URL: `/api`

Auth:

- `POST /auth/users/register`
- `POST /auth/users/login`
- `POST /auth/doctors/register`
- `POST /auth/doctors/login`
- `POST /auth/admin/login`
- `POST /auth/logout` (protected)

Doctors:

- `GET /doctors/online` (protected)
- `PATCH /doctors/availability` (doctor)

Bookings:

- `POST /bookings` (user)
- `GET /bookings/user/me` (user)
- `GET /bookings/doctor/me` (doctor)
- `PATCH /bookings/:bookingId/start` (doctor)
- `PATCH /bookings/:bookingId/end` (doctor)
- `GET /bookings/:bookingId` (participant/admin)
- `POST /bookings/:bookingId/messages` (participant/admin, active session)
- `GET /bookings/:bookingId/messages` (participant/admin)

Admin:

- `GET /admin/doctors`
- `GET /admin/users`
- `PATCH /admin/doctors/:doctorId/approve`
- `PATCH /admin/doctors/:doctorId/block`
- `PATCH /admin/users/:userId/block`
- `GET /admin/transactions`

## 10. Socket Events

Client emits:

- `chat:join` `{ bookingId }`
- `chat:send` `{ bookingId, content }`
- `chat:typing` `{ bookingId, isTyping }`

Server emits:

- `chat:joined`
- `chat:received`
- `chat:typing`
- `chat:error`
- `chat:sent`
- `session:started`
- `session:ended`
- `doctor:availability:updated`

## 11. Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Create `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/doctor-consultation
JWT_SECRET=change-me
EXPIRESIN=7d
COMMISSION_RATE=0.2
CORS_ORIGIN=*
NODE_ENV=development
```

3. Start server:

```bash
npm start
```

4. Health check:

`GET http://localhost:5000/health`

## 12. Local Testing Without Frontend

- API testing: Postman or curl
- Realtime chat testing scripts:
  - `npm run socket:listen`
  - `npm run socket:send`
- End-to-end scripted flow:
  - `npm run demo:flow`

## 13. Important Notes

- Create one admin user manually in DB (`role: admin`) for admin login.
- `endSession` uses transaction on replica set/mongos; standalone MongoDB falls back to non-transactional local-dev flow.
- For production hardening, add `helmet`, rate limiting, refresh-token strategy, audit logs, and CI tests.
