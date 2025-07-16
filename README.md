# Event Management API

A RESTful API for managing events and user registrations built with Node.js, Express, and Prisma with PostgreSQL.

## Features

- User registration and management
- Event creation and management
- Event registration with capacity limits
- Registration cancellation
- Event statistics and analytics
- Upcoming events filtering
- Validation and error handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/ajais-25/event-management.git
   cd "event-management"
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/event_management_db?schema=public"
   PORT=3000
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate deploy

   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the server**

   ```bash
   # Development mode with nodemon
   npm run dev

   # Or start normally
   node index.js
   ```

The server will start on `http://localhost:3000` (or your configured PORT).

## Database Schema

### User Model

- `id`: Integer (Primary Key, Auto-increment)
- `name`: String (Required)
- `email`: String (Required, Unique)
- `createdAt`: DateTime (Auto-generated)
- `updatedAt`: DateTime (Auto-updated)

### Event Model

- `id`: Integer (Primary Key, Auto-increment)
- `title`: String (Required)
- `dateTime`: DateTime (Required)
- `location`: String (Required)
- `capacity`: Integer (Required, Max: 1000)
- `createdAt`: DateTime (Auto-generated)
- `updatedAt`: DateTime (Auto-updated)

### Registration Model

- `id`: Integer (Primary Key, Auto-increment)
- `userId`: Integer (Foreign Key)
- `eventId`: Integer (Foreign Key)
- `createdAt`: DateTime (Auto-generated)
- Unique constraint on `(userId, eventId)`

## API Endpoints

### Base URL

```
http://localhost:3000/api
```

### User Endpoints

#### Register User

- **POST** `/users/register`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
  ```
- **Success Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2025-07-16T08:30:00.000Z",
      "updatedAt": "2025-07-16T08:30:00.000Z"
    },
    "message": "User registered successfully"
  }
  ```
- **Error Response** (400):
  ```json
  {
    "success": false,
    "message": "User already exists"
  }
  ```

### Event Endpoints

#### Create Event

- **POST** `/events/create`
- **Description**: Create a new event
- **Request Body**:
  ```json
  {
    "title": "Tech Conference 2025",
    "dateTime": "2025-08-15T10:00:00Z",
    "location": "Convention Center, NYC",
    "capacity": 500
  }
  ```
- **Success Response** (201):
  ```json
  {
    "success": true,
    "eventId": 1,
    "message": "Event created successfully"
  }
  ```
- **Validation Rules**:
  - All fields are required
  - `capacity` must be between 1 and 1000
  - `dateTime` cannot be in the past
  - `dateTime` must be a valid ISO date string

#### Get All Events

- **GET** `/events/`
- **Description**: Retrieve all events with registration details
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "title": "Tech Conference 2025",
        "dateTime": "2025-08-15T10:00:00.000Z",
        "location": "Convention Center, NYC",
        "capacity": 500,
        "createdAt": "2025-07-16T08:30:00.000Z",
        "updatedAt": "2025-07-16T08:30:00.000Z",
        "registrations": [
          {
            "id": 1,
            "userId": 1,
            "eventId": 1,
            "createdAt": "2025-07-16T09:00:00.000Z",
            "user": {
              "id": 1,
              "name": "John Doe",
              "email": "john.doe@example.com"
            }
          }
        ]
      }
    ],
    "message": "Events retrieved successfully"
  }
  ```

#### Get Upcoming Events

- **GET** `/events/upcoming`
- **Description**: Retrieve events scheduled for future dates
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "title": "Tech Conference 2025",
        "dateTime": "2025-08-15T10:00:00.000Z",
        "location": "Convention Center, NYC",
        "capacity": 500,
        "createdAt": "2025-07-16T08:30:00.000Z",
        "updatedAt": "2025-07-16T08:30:00.000Z"
      }
    ],
    "message": "Upcoming events retrieved successfully"
  }
  ```

#### Register for Event

- **POST** `/events/register/:eventId`
- **Description**: Register a user for a specific event
- **URL Parameters**:
  - `eventId`: Integer (Event ID)
- **Request Body**:
  ```json
  {
    "userId": 1
  }
  ```
- **Success Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "registrationId": 1,
      "user": "John Doe",
      "event": "Tech Conference 2025"
    },
    "message": "Registered for event successfully"
  }
  ```
- **Error Responses**:
  - **400**: User already registered, event full, or past event
  - **404**: User or event not found

#### Cancel Registration

- **POST** `/events/cancel/:eventId`
- **Description**: Cancel a user's registration for an event
- **URL Parameters**:
  - `eventId`: Integer (Event ID)
- **Request Body**:
  ```json
  {
    "userId": 1
  }
  ```
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Registration cancelled successfully"
  }
  ```
- **Error Response** (404):
  ```json
  {
    "success": false,
    "message": "Registration not found"
  }
  ```

#### Get Event Statistics

- **GET** `/events/stats/:eventId`
- **Description**: Get registration statistics for a specific event
- **URL Parameters**:
  - `eventId`: Integer (Event ID)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "totalRegistrations": 150,
      "remainingCapacity": 350,
      "percentageOfCapacityUsed": "30.00"
    },
    "message": "Event statistics retrieved successfully"
  }
  ```

## Error Handling

All endpoints return consistent error responses:

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation errors)
- **404**: Resource not found
- **500**: Internal server error

## Example Usage

### Complete User Registration and Event Registration Flow

1. **Register a user**:

   ```bash
   curl -X POST http://localhost:3000/api/users/register \
     -H "Content-Type: application/json" \
     -d '{"name": "Alice Smith", "email": "alice@example.com"}'
   ```

2. **Create an event**:

   ```bash
   curl -X POST http://localhost:3000/api/events/create \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Web Development Workshop",
       "dateTime": "2025-09-01T14:00:00Z",
       "location": "Tech Hub, San Francisco",
       "capacity": 50
     }'
   ```

3. **Register user for event**:

   ```bash
   curl -X POST http://localhost:3000/api/events/register/1 \
     -H "Content-Type: application/json" \
     -d '{"userId": 1}'
   ```

4. **Check event statistics**:

   ```bash
   curl http://localhost:3000/api/events/stats/1
   ```

5. **Get all upcoming events**:
   ```bash
   curl http://localhost:3000/api/events/upcoming
   ```

## Development

### Database Management

**View database in Prisma Studio**:

```bash
npx prisma studio
```

**Reset database**:

```bash
npx prisma migrate reset
```

**Create new migration**:

```bash
npx prisma migrate dev --name migration_name
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
