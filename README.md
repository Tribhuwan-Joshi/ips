# IPS - Image Processing Service

## Tech stack

- Express - NodeJs framework
- Storage - Supabase
- DB - Postgresql
- ORM - Prisma
- Authentication - JWT + refresh token
- Rate limiting & Cache - Redis - [ioredis](https://github.com/redis/ioredis)
- Transformation - [Sharp](https://sharp.pixelplumbing.com/)

Base URL - https://ips-ollj.onrender.com/

## Installation Guide

### Prerequisites

Ensure you have the following installed:

- Node.js (Latest LTS version recommended)
- PostgreSQL
- Redis

### Setup Instructions

1. **Clone the repository**

   ```sh
   git clone https://github.com/yourusername/ips.git
   cd ips
   ```

2. **Install dependencies**

   ```sh
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory and configure it with the following variables (replace placeholders with actual values):

   ```env
   POSTGRES_USER="your_postgres_user"
   POSTGRES_PASSWORD="your_postgres_password"
   DATABASE_URL="postgresql://your_postgres_user:your_postgres_password@localhost:5432/your_database?schema=public"
   JWT_SECRET="your_jwt_secret"
   REFRESH_SECRET="your_refresh_secret"
   STORAGE_URL="https://your_supabase_url/storage/v1"
   API_KEY="your_supabase_api_key"
   SHARE_SECRET="your_share_secret"
   ```

4. **Start PostgreSQL and Redis**

   Make sure both services are running:

   ```sh
   sudo systemctl start postgresql
   redis-server
   ```

5. **Run database migrations**

   ```sh
   npx prisma migrate dev --name init
   ```

6. **Start the server**

   ```sh
   npm start
   ```

   The server should now be running on `http://localhost:3000` (or the port specified in your environment variables).

## Actions & Features

1. Signup/Login
2. Upload image
3. Retrieve image - LRU cache eviction policy
4. List all images - paginated response
5. Delete specific image
6. Transform image [Limited feature ~ Beta]
   - Resize
   - Crop
   - Rotate
   - Flip
   - Change format
   - Apply filters
7. Share specific image - generate a sharable link that can be `accessed without authentication`, expires after a certain `time period`.
8. Storage limit for each user - `store amount of storage used` in DB
9. Error handling and validation with unambiguous response & status code

## API Endpoints

```js
GET /images/:id
```

```js
GET /images?page=1&limit=10
```

```js
POST /images
Request Body: Multipart form-data with image file
Response: Uploaded image details (URL, metadata).
```

```js
POST /images/:id/transform
{
  "transformations": {
    "resize": {
      "width": "number",
      "height": "number"
    },
    "crop": {
      "width": "number",
      "height": "number",
      "x": "number",
      "y": "number"
    },
    "rotate": "number",
    "format": "string",
    "filters": {
      "grayscale": "boolean",
      "sepia": "boolean"
    }
  }
}
```

```js
POST /auth/register
{
  "username": "user1",
  "password": "password123"
}
```

```js
POST /auth/login
{
  "username": "user1",
  "password": "password123"
}
```

```js
DELETE /images/:id
```

```js
POST /images/:id/share
```

```js
DELETE /images/:id/share
```

```js
// return image that binds to specific shareid
GET /images/shared/:shareid;
```

```js
DELETE /user // delete the user -> needs JWT token in header
