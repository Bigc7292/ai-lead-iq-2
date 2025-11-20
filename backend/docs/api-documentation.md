# API Documentation

This document provides detailed information about the AI Lead IQ API endpoints.

## Base URL

```
http://localhost:3000/api
```

## Authentication

*Authentication will be added in Sprint 2.*

---

## Endpoints

### Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-20T12:00:00.000Z",
  "service": "AI Lead IQ API",
  "version": "1.0.0"
}
```

---

### Leads

#### Get All Leads

Retrieve all leads from the database.

**Endpoint:** `GET /leads`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "propertyType": "house",
      "budget": 500000,
      "timeline": "3-6 months",
      "score": 75,
      "status": "new",
      "notes": "",
      "createdAt": "2025-11-20T12:00:00.000Z",
      "updatedAt": "2025-11-20T12:00:00.000Z"
    }
  ]
}
```

#### Get Lead by ID

**Endpoint:** `GET /leads/:id`

**Parameters:**
- `id` (required): Lead UUID

**Response:** Same as individual lead object above

**Error Response (404):**
```json
{
  "success": false,
  "error": "Lead not found"
}
```

#### Create New Lead

Create a new lead and automatically score it using Gemini AI.

**Endpoint:** `POST /leads`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "propertyType": "house",
  "budget": 500000,
  "timeline": "3-6 months",
  "notes": "Referred by existing client"
}
```

**Required Fields:**
- `firstName`
- `lastName`
- At least one of: `email` or `phone`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "score": 75,
    ...
  }
}
```

#### Update Lead

**Endpoint:** `PUT /leads/:id`

**Parameters:**
- `id` (required): Lead UUID

**Request Body:** Any fields to update (same as create)

**Response:** Updated lead object

#### Delete Lead

**Endpoint:** `DELETE /leads/:id`

**Parameters:**
- `id` (required): Lead UUID

**Response:**
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

#### Initiate Outbound Call

*This endpoint will be fully implemented in Sprint 2.*

**Endpoint:** `POST /leads/:id/call`

**Parameters:**
- `id` (required): Lead UUID

**Current Response (501):**
```json
{
  "success": false,
  "error": "Voice calling will be implemented in Sprint 2"
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error
- `501` - Not Implemented

---

## Lead Scoring

When a lead is created or updated, it's automatically scored by Gemini AI based on:

1. Budget clarity and realism
2. Timeline urgency
3. Property type specificity
4. Completeness of information

Score range: 0-100
- **0-40**: Low quality
- **41-70**: Medium quality
- **71-100**: High quality

---

## Rate Limiting

*To be implemented in Sprint 3*

---

## Webhooks

*Webhook support for Twilio callbacks will be added in Sprint 2*
