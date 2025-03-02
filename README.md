# Flash Sales

A high-performance Flash Sale REST API built with Express.js and MongoDB, featuring Zod validation, Redis caching, and cron jobs for automated sale updates. It leverages JWT authentication, rate limiting for security, and pagination for efficient data retrieval. A background job ensures seamless activation and deactivation of flash sales.

To maintain data integrity under high-traffic conditions, concurrency control mechanisms such as distributed locks and atomic operations are implemented. Redis-based distributed locks prevent multiple processes from modifying inventory simultaneously, avoiding race conditions where concurrent purchases could result in overselling. Additionally, MongoDB atomic updates ($set) ensure stock deductions are processed in a single operation, reducing conflicts. These techniques guarantee accurate inventory management and a seamless purchasing experience during flash sales.

## Clone the repository
```bash
git clone https://github.com/henry-mbamalu/flash-sale.git
```

## After cloning, navigate to the root directory

## Create a .env file


## Set env variables

  ```bash
PORT = 5500
```
```bash
MONGO_DB_URI = your_mongodb_uri
```
```bash
JWT_SECRET = your_jwt_secret
```
```bash
REDIS_HOST = 127.0.0.1
```
```bash
REDIS_PORT = 6379
```

## For windows user
```bash
wsl --install
```

## Install Redis
```bash
sudo apt update
```
```bash
sudo apt install redis-server -y
```
```bash
sudo service redis-server start
```

## Install Dependencies
```bash
npm install
```

## Run the app
```bash
npm run start
```
## Admin login credentials

  ```bash
email = admin@gmail.com
```
  ```bash
password = 123456
```


# REST API

## Signup

### Request

`POST /api/auth/signup`

     http://localhost:5500/api/auth/signup

     {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "user2@gmail.com",
    "password": "123456"
    }

### Response

    HTTP/1.1 201 CREATED
    Status: 201 CREATED
    Content-Type: application/json

    {
    "status": "success",
    "message": "User created successfully",
    "data": {
        "_id": "67c32ca076b87d566c1ce496",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "user2@gmail.com",
        "role": "customer",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2MzMmNhMDc2Yjg3ZDU2NmMxY2U0OTYiLCJpYXQiOjE3NDA4NDQxOTIsImV4cCI6MTc0MDkzMDU5Mn0.6z_4qZxlU5cMc0x3sbnV6e9iZzdx89NdWnDyaX5zJh8"
    }
    }

## Create an Admin

### Request

`POST /api/auth/signup/admin`

     http://localhost:5500/api/auth/signup/admin

     token needs to be in the authorization header (bearer token), only an admin has permission

     {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "user2@gmail.com",
    "password": "123456"
    }

### Response

    HTTP/1.1 201 CREATED
    Status: 201 CREATED
    Content-Type: application/json

    {
    "status": "success",
    "message": "User created successfully",
    "data": {
        "_id": "67c32ca076b87d566c1ce496",
        "firstName": "Admin",
        "lastName": "Admin",
        "email": "admin@gmail.com",
        "role": "admin",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2MzMmNhMDc2Yjg3ZDU2NmMxY2U0OTYiLCJpYXQiOjE3NDA4NDQxOTIsImV4cCI6MTc0MDkzMDU5Mn0.6z_4qZxlU5cMc0x3sbnV6e9iZzdx89NdWnDyaX5zJh8"
    }
    }

## Signin

### Request

`POST /api/auth/signin`

    http://localhost:5500/api/auth/signin

    {
    "email": "user@gmail.com",
     "password": "123456"
   
    }

### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json
   

    {
    "status": "success",
    "message": "Logged in successfully",
    "data": {
        "_id": "67c31f938a94dcd14eb54ee9",
        "firstName": "John",
        "lastName": "Doe",
        "email": "user@gmail.com",
        "role": "customer",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2MzMWY5MzhhOTRkY2QxNGViNTRlZTkiLCJpYXQiOjE3NDA4NDI4MTEsImV4cCI6MTc0MDkyOTIxMX0.Abm36HX9h7YorujoI0Guig6Bhon_ycUF3K5GFtlEq8g"
    }
    }

## Create a Flash Sale

### Request

`POST /api/flash-sale`

    http://localhost:5500/api/flash-sale

    token needs to be in the authorization header (bearer token), only an admin has permission

    {
    "product": "Clothes",
    "startTime": "19:00",
    "endTime": "20:00",
    "saleDate": "2025-03-01",
    "purchaseableQuantity": 100
    }

### Response

    HTTP/1.1 201 Created
    Status: 201 Created
    Content-Type: application/json


    {
    "status": "success",
    "message": "Flash sale created successfully",
    "data": {
        "product": "Clothes",
        "stockPerSale": 200,
        "totalStock": 1000,
        "saleDate": "2025-03-01T00:00:00.000Z",
        "startTime": "19:00",
        "endTime": "20:00",
        "saleCount": 0,
        "purchaseableQuantity": 100,
        "isActive": true,
        "_id": "67c352f0b40c6416cd393cb6",
        "createdAt": "2025-03-01T18:33:20.558Z",
        "updatedAt": "2025-03-01T18:33:20.558Z",
        "__v": 0
    }
    }

## Purchase a Product

### Request

`POST /api/flash-sale/purchase`

    http://localhost:5500/api/flash-sale/purchase

    token needs to be in the authorization header (bearer token)

    {
    "saleId": "67c352f0b40c6416cd393cb6",
    "quantity": 100
    }
### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json


    {
    "status": "success",
    "message": "Purchase successful"
    }

## List All Active Flash Sales

### Request

`GET /api/flash-sale?page=1&limit=5`

    http://localhost:5500/api/flash-sale?page=1&limit=5

    token needs to be in the authorization header (bearer token)

### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json


    {
    "status": "success",
    "message": "Operation successful",
    "data": [
        {
            "_id": "67c352f0b40c6416cd393cb6",
            "product": "Clothes",
            "stockPerSale": 50,
            "totalStock": 250,
            "saleDate": "2025-03-01T00:00:00.000Z",
            "startTime": "19:00",
            "endTime": "21:10",
            "saleCount": 4,
            "purchaseableQuantity": 100,
            "isActive": true,
            "createdAt": "2025-03-01T18:33:20.558Z",
            "updatedAt": "2025-03-01T20:02:10.973Z",
            "__v": 0
        }
    ],
    "meta": {
        "page": 1,
        "perPage": 5,
        "total": 1,
        "pageCount": 1,
        "nextPage": 0,
        "hasNextPage": false,
        "hasPrevPage": false
    }
    }


## Fetch LeaderBoard

### Request

`GET /purchase/leader-board?page=1&limit=2`

    http://localhost:5500/api/purchase/leader-board?page=1&limit=2

    token needs to be in the authorization header (bearer token), only an admin has permission

### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json


    {
        "status": "success",
        "message": "Operation successful",
        "data": {
        "data": [
            {
                "_id": "67c367c3c02a7a5be7db99c1",
                "userId": {
                    "_id": "67c31f938a94dcd14eb54ee9",
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "user@gmail.com",
                    "role": "customer",
                    "createdAt": "2025-03-01T14:54:11.537Z",
                    "updatedAt": "2025-03-01T14:54:11.537Z",
                    "__v": 0
                },
                "saleId": {
                    "_id": "67c352f0b40c6416cd393cb6",
                    "product": "Clothes",
                    "stockPerSale": 50,
                    "totalStock": 250,
                    "saleDate": "2025-03-01T00:00:00.000Z",
                    "startTime": "19:00",
                    "endTime": "21:10",
                    "saleCount": 4,
                    "purchaseableQuantity": 100,
                    "isActive": true,
                    "createdAt": "2025-03-01T18:33:20.558Z",
                    "updatedAt": "2025-03-01T20:02:10.973Z",
                    "__v": 0
                },
                "quantity": 100,
                "purchaseTime": "2025-03-01T20:02:11.117Z",
                "createdAt": "2025-03-01T20:02:11.118Z",
                "updatedAt": "2025-03-01T20:02:11.118Z",
                "__v": 0
            },
            {
                "_id": "67c3626bc02a7a5be7db998e",
                "userId": {
                    "_id": "67c32ca076b87d566c1ce496",
                    "firstName": "Jane",
                    "lastName": "Doe",
                    "email": "user2@gmail.com",
                    "role": "customer",
                    "createdAt": "2025-03-01T15:49:52.546Z",
                    "updatedAt": "2025-03-01T15:49:52.546Z",
                    "__v": 0
                },
                "saleId": {
                    "_id": "67c352f0b40c6416cd393cb6",
                    "product": "Clothes",
                    "stockPerSale": 50,
                    "totalStock": 250,
                    "saleDate": "2025-03-01T00:00:00.000Z",
                    "startTime": "19:00",
                    "endTime": "21:10",
                    "saleCount": 4,
                    "purchaseableQuantity": 100,
                    "isActive": true,
                    "createdAt": "2025-03-01T18:33:20.558Z",
                    "updatedAt": "2025-03-01T20:02:10.973Z",
                    "__v": 0
                },
                "quantity": 50,
                "purchaseTime": "2025-03-01T19:39:23.162Z",
                "createdAt": "2025-03-01T19:39:23.163Z",
                "updatedAt": "2025-03-01T19:39:23.163Z",
                "__v": 0
            }
            ],
            "meta": {
                "page": 1,
                "perPage": 2,
                "total": 20,
                "pageCount": 10,
                "nextPage": 2,
                "hasNextPage": true,
                "hasPrevPage": false
            }
        }
    }