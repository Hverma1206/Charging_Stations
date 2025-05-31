# EV Charging Stations Management System

A full-stack application for managing electric vehicle charging stations. Users can view stations on a map, register, login, and authenticated users can add, edit, and delete their own charging stations.

## Project Structure

The project consists of two main parts:
- **Frontend**: Vue.js application
- **Backend**: Node.js/Express API with MongoDB

## Prerequisites

- Node.js (v14 or later)
- MongoDB Atlas account (or local MongoDB installation)
- Git

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
   
   Note: Generate a strong JWT secret using one of these methods:
   - Using Node.js (run in terminal):
     ```
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
   - Using an online generator (for development only)
   - Or manually create a long, random string of characters

4. Start the backend server:
   ```
   npm start
   ```
   
   The server will run on `http://localhost:5000` by default.

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   API_URL=http://localhost:5000
   ```
   
   Note: Change this to your deployed backend URL if using a remote server.

4. Update the endpoint configuration:
   
   If you're deploying the application, you'll need to update the API endpoint in two places:
   
   - `.env` file as mentioned above
   - `vercel.json` file - update the destination URL in the rewrites section:
     ```json
     {
       "rewrites": [
         {
           "source": "/api/:path*",
           "destination": "http://your-backend-url:5000/api/:path*"
         }
       ]
     }
     ```

5. Start the frontend development server:
   ```
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173` by default.

## Deployment


## Using the API with Postman

You can test the API endpoints using Postman. Here's how to get started:

1. **Registration**: 
   - Use the endpoint: `POST /api/auth/register`
   - In the body tab, provide user information:
     ```json
     {
       "name": "Your Name",
       "email": "your.email@example.com",
       "password": "yourpassword"
     }
     ```
   - The API will return a JWT token upon successful registration

2. **Login**:
   - Use the endpoint: `POST /api/auth/login`
   - In the body tab, provide credentials:
     ```json
     {
       "email": "your.email@example.com",
       "password": "yourpassword"
     }
     ```
   - The API will return a JWT token upon successful login

3. **Adding a Charging Station**:
   - Use the endpoint: `POST /api/stations`
   - In the Headers tab, add:
     ```
     x-auth-token: token returned by login api
     ```
   - In the body tab, provide station details:
     ```json
     {
       "name": "Station Name",
       "location": {
         "latitude": 40.7128,
         "longitude": -74.0060,
         "address": "New York, NY, USA"
       },
       "status": "Active",
       "powerOutput": 50,
       "connectorType": "Type 2"
     }
     ```

4. **Fetching All Stations**:
   - Use the endpoint: `GET /api/stations`
   - No headers or body required

## Features

- Interactive map showing all charging stations
- Filtering stations by status, connector type, and power output
- User authentication and authorization
- CRUD operations for charging stations
- Responsive design

## Technologies Used

- **Frontend**: Vue.js, Vue Router, Leaflet for maps, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## License

This project is licensed under the MIT License.
