# IPS - Image Processing Service

## Tech stack

- Express - NodeJs framework
- Storage - Supabase
- DB - Postgresql
- ORM - Prisma
- Authentication - JWT + refresh token
- Rate limting & Cache - Redis - [ioredis](https://github.com/redis/ioredis)
- Transformation - [Sharp](https://sharp.pixelplumbing.com/)

## Actions & Features

1. Signup/Login
2. Upload image
3. Retrieve image
4. List all images - paginated response
5. Delete specific image
6. Transform image [Limited feature ~ Beta]
   - Resize
   - Crop
   - Rotate
   - Flip
   - Change format
   - Apply filters
7. Share specific image - generate a sharable link that can be `access without authentication` , expired after a certain `time period`.

8. Storage limit for each user - `store amount of storage used` in DB

9. Error handling and validation with unambigious response & status code

## APIs Endpoints

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
DELETE / user; // delete the user -> needs jwt token in header
```
