# REST API Documentation - Wavo CRM

All API endpoints follow a RESTful structure, outputting standard JSON payloads. The base production URL is `https://api.wavocrm.com/api/v1`.

---

## 1. Authentication Endpoints

### 1.1 Send OTP
*   **Endpoint:** `/auth/otp/send`
*   **Method:** `POST`
*   **Description:** Generates and sends a 6-digit OTP code to the requested mobile number.
*   **Request Body:**
    ```json
    {
      "phoneNumber": "+14159990102"
    }
    ```
*   **Successful Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "OTP sent successfully",
      "sessionId": "otp_session_ab617c093"
    }
    ```

### 1.2 Verify OTP & Login
*   **Endpoint:** `/auth/otp/verify`
*   **Method:** `POST`
*   **Description:** Verifies OTP and returns user authentication tokens.
*   **Request Body:**
    ```json
    {
      "phoneNumber": "+14159990102",
      "code": "847291"
    }
    ```
*   **Successful Response (200 OK):**
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5...",
      "user": {
        "id": "c71be68b-57fc-4b47-ba21-50e5015b6348",
        "email": "owner@acme.com",
        "firstName": "Alex",
        "lastName": "Manager",
        "role": "BUSINESS_OWNER",
        "businessId": "b88b22a0-432d-4299-8cfb-5a02484ad20d"
      }
    }
    ```

---

## 2. Customer Management Endpoints
*Requires header: `Authorization: Bearer <accessToken>`*

### 2.1 Get Customers (Paginated & Filtered)
*   **Endpoint:** `/customers`
*   **Method:** `GET`
*   **Query Parameters:**
    *   `page` (default: 1)
    *   `limit` (default: 20)
    *   `search` (search by name, email, or phone)
    *   `tag` (filter by customer tag)
*   **Successful Response (200 OK):**
    ```json
    {
      "data": [
        {
          "id": "e2d78a9c-293e-48a1-b4c6-e918a2e1d08e",
          "fullName": "ACME Corp",
          "mobileNumber": "+14159990102",
          "email": "info@acme.com",
          "company": "ACME Ltd",
          "source": "WhatsApp Inbound",
          "status": "Active",
          "tags": ["VIP", "Enterprise"],
          "createdAt": "2026-06-09T14:00:00Z"
        }
      ],
      "meta": {
        "totalItems": 150,
        "itemCount": 1,
        "itemsPerPage": 20,
        "totalPages": 8,
        "currentPage": 1
      }
    }
    ```

### 2.2 Create Customer
*   **Endpoint:** `/customers`
*   **Method:** `POST`
*   **Request Body:**
    ```json
    {
      "fullName": "John Doe",
      "mobileNumber": "+15550199283",
      "email": "john.doe@gmail.com",
      "company": "Personal",
      "source": "Website Form",
      "tags": ["New Lead"]
    }
    ```
*   **Successful Response (211 Created):**
    ```json
    {
      "id": "2fa40d06-1bc0-4e1b-b461-12cd2a83e0cb",
      "fullName": "John Doe",
      "mobileNumber": "+15550199283",
      "email": "john.doe@gmail.com",
      "company": "Personal",
      "source": "Website Form",
      "status": "Active",
      "createdAt": "2026-06-09T14:07:00Z"
    }
    ```

---

## 3. Lead & Sales Pipeline Endpoints

### 3.1 Get Leads (Pipeline Stages List)
*   **Endpoint:** `/leads`
*   **Method:** `GET`
*   **Query Parameters:** `assignedTo` (User UUID)
*   **Successful Response (200 OK):**
    ```json
    [
      {
        "id": "31b67d5e-cb70-43f1-9c3f-c399a9b8915b",
        "title": "ACME CRM Deployment Deal",
        "stage": "NEW",
        "estimatedValue": 8500.00,
        "leadScore": 92,
        "customer": {
          "id": "e2d78a9c-293e-48a1-b4c6-e918a2e1d08e",
          "fullName": "ACME Corp",
          "mobileNumber": "+14159990102"
        },
        "assignedTo": "c71be68b-57fc-4b47-ba21-50e5015b6348"
      }
    ]
    ```

### 3.2 Update Lead Stage
*   **Endpoint:** `/leads/:id/stage`
*   **Method:** `PATCH`
*   **Request Body:**
    ```json
    {
      "stage": "NEGOTIATION"
    }
    ```
*   **Successful Response (200 OK):**
    ```json
    {
      "id": "31b67d5e-cb70-43f1-9c3f-c399a9b8915b",
      "stage": "NEGOTIATION",
      "updatedAt": "2026-06-09T14:08:12Z"
    }
    ```

---

## 4. WhatsApp Helper Endpoints

### 4.1 Trigger Campaign Broadcast
*   **Endpoint:** `/whatsapp/broadcast`
*   **Method:** `POST`
*   **Request Body:**
    ```json
    {
      "campaignName": "Independence Day Promo 2026",
      "templateId": "8f3a3fbe-ec1a-4712-88fb-803a07de672b",
      "recipientTags": ["VIP-Retail"],
      "variableMappings": {
        "1": "fullName",
        "2": "code"
      },
      "customValues": {
        "code": "SAVE20"
      }
    }
    ```
*   **Successful Response (202 Accepted):**
    ```json
    {
      "campaignId": "ad60cde7-a16f-45a7-96a9-8356cbb01a7f",
      "status": "PROCESSING",
      "recipientCount": 145,
      "message": "Broadcast pushed to task processing queue successfully."
    }
    ```

---

## 5. AI Module Endpoints

### 5.1 Suggest Response Replies
*   **Endpoint:** `/ai/suggest-replies`
*   **Method:** `POST`
*   **Request Body:**
    ```json
    {
      "customerId": "e2d78a9c-293e-48a1-b4c6-e918a2e1d08e",
      "limit": 3
    }
    ```
*   **Successful Response (200 OK):**
    ```json
    {
      "suggestions": [
        "Sure, I can send you the invoice copies immediately. Should I send them on WhatsApp or Email?",
        "Our business hours are 9 AM to 6 PM. I can schedule a call for tomorrow morning.",
        "Yes, we support multi-device integrations in our Business Plan."
      ]
    }
    ```

---

## 6. Error Schema Handling
All endpoints return structured error payloads under failures:

*   **Authentication Failure (401 Unauthorized):**
    ```json
    {
      "statusCode": 401,
      "message": "JWT token has expired or is invalid.",
      "error": "Unauthorized"
    }
    ```
*   **Validation Failures (400 Bad Request):**
    ```json
    {
      "statusCode": 400,
      "message": [
        "phoneNumber must be in valid E.164 format",
        "code must be exactly 6 characters long"
      ],
      "error": "Bad Request"
    }
    ```
*   **Resource Not Found (404 Not Found):**
    ```json
    {
      "statusCode": 404,
      "message": "Customer record with ID 'e2d78a9c-...' not found.",
      "error": "Not Found"
    }
    ```
