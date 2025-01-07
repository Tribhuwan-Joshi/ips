# IPS - Image Processing Service

## Tech stack

- Express - NodeJs framework
- Storage - Cloudflare R2
- DB - Postgresql
- ORM - Prisma
- Authentication - JWT + refresh token
- Rate limting & Cache - Redis
- Transformation - FFMPEG

## Actions & Features

1. Signup/Login
2. Upload image
3. Retrieve image
4. List all images - paginated response
5. Delete specific image
6. Transform image
   - Resize
   - Crop
   - Rotate
   - Watermark
   - Flip
   - Mirror
   - Compress
   - Change format
   - Apply filters
7. Share specific image - generate a sharable link that can be access without authentication, expired after a certain time period

8. Storage limit for each user - store amount of storage used in DB

9. Error handling and validation with unambigious response & status code
10. RabbitMQ to process image transformation in queue

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
POST /register
{
  "username": "user1",
  "password": "password123"
}
```

```js
POST /login
{
  "username": "user1",
  "password": "password123"
}
```

```js
DELETE /images/:id
```

```js
POST /share/images/:id
```

```js
// return image that binds to specific shareid
GET /share/images/:shareid;
```

```js
GET / storage / info; // return total storage and storage used
```
