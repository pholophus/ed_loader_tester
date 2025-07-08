# API Migration Guide

This guide explains how to migrate from direct MongoDB connection to an API-based approach using the new `apiService` and `useApi` composable.

## Overview

We're transitioning from:
- **Direct MongoDB Connection** → **HTTP API Calls**
- **useMongo composable** → **useApi composable**

The migration is designed to be **gradual** and **non-breaking**, allowing you to migrate one collection/endpoint at a time.

## Files Created

1. **`src/services/apiService.ts`** - Base API service for HTTP requests
2. **`src/renderer/Composables/useApi.ts`** - Vue composable (replacement for useMongo)
3. **`src/examples/apiServiceUsage.ts`** - Usage examples

## API Base Configuration

- **Base URL**: `http://localhost:3000/api`
- **Endpoint Structure**: `http://localhost:3000/api/{endpoint}`

Example:
- Countries: `http://localhost:3000/api/countries`
- Users: `http://localhost:3000/api/users`
- Projects: `http://localhost:3000/api/projects`

## Usage Examples

### 1. Direct API Service Usage

```typescript
import { apiService } from '@/services/apiService';

// GET all countries
const result = await apiService.get('countries');

// GET with query parameters
const filtered = await apiService.get('countries', { active: true });

// POST - Create new
const newItem = await apiService.post('countries', { name: 'Test' });

// PUT - Update by ID
const updated = await apiService.put('countries', 'id123', { name: 'Updated' });

// DELETE by ID
const deleted = await apiService.delete('countries', 'id123');
```

### 2. Vue Composable Usage

```typescript
import { useApi } from '@/composables/useApi';

// In your Vue component
const { items, loading, error, fetch, insert, update, remove } = useApi('countries');

// Load data
await fetch(); // GET /api/countries
await fetch({ active: true }); // GET /api/countries?active=true

// Create
const newCountry = await insert({ name: 'New Country' });

// Update
await update({ _id: 'id123' }, { name: 'Updated Name' });

// Delete
await remove({ _id: 'id123' });
```

## Migration Strategy

### Step 1: Identify Collections to Migrate

List all places where you currently use `useMongo`:

```typescript
// Current usage
const { items, fetch, insert } = useMongo('countries');
const { items, fetch, insert } = useMongo('users');
const { items, fetch, insert } = useMongo('projects');
```

### Step 2: Replace One Collection at a Time

**BEFORE:**
```typescript
import { useMongo } from '@/composables/useMongo';

const { items: countries, fetch: fetchCountries } = useMongo('countries');
```

**AFTER:**
```typescript
import { useApi } from '@/composables/useApi';

const { items: countries, fetch: fetchCountries } = useApi('countries');
```

### Step 3: Test Each Migration

1. Replace `useMongo` with `useApi` for one collection
2. Test all CRUD operations
3. Verify the component works correctly
4. Move to the next collection

## API Endpoints Expected

Your backend API should support these endpoints:

### Basic CRUD
```
GET    /api/{collection}              # Find documents
GET    /api/{collection}/:id          # Get by ID
POST   /api/{collection}              # Create document
PUT    /api/{collection}/:id          # Update by ID
DELETE /api/{collection}/:id          # Delete by ID
```

### Advanced Operations
```
POST   /api/{collection}/bulk         # Insert multiple
POST   /api/{collection}/update       # Update with filter
POST   /api/{collection}/upsert       # Upsert operation
POST   /api/{collection}/aggregate    # Aggregation
POST   /api/{collection}/count        # Count documents
```

### Expected Request/Response Format

**Request for bulk insert:**
```json
{
  "documents": [
    { "name": "Item 1" },
    { "name": "Item 2" }
  ]
}
```

**Request for update with filter:**
```json
{
  "filter": { "status": "active" },
  "update": { "processed": true }
}
```

**Response format:**
```json
{
  "success": true,
  "data": { /* document or array */ },
  "message": "Operation successful"
}
```

**Error response:**
```json
{
  "success": false,
  "error": "Error message",
  "data": null
}
```

## Complete Migration Example

### Before (Direct MongoDB)

```vue
<script setup lang="ts">
import { useMongo } from '@/composables/useMongo';

const { items: countries, loading, error, fetch, insert } = useMongo('countries');

const loadCountries = async () => {
  await fetch({ active: true });
};

const addCountry = async (countryData) => {
  await insert(countryData);
  await fetch(); // Refresh list
};
</script>
```

### After (API-based)

```vue
<script setup lang="ts">
import { useApi } from '@/composables/useApi';

const { items: countries, loading, error, fetch, insert } = useApi('countries');

const loadCountries = async () => {
  await fetch({ active: true });
};

const addCountry = async (countryData) => {
  await insert(countryData);
  await fetch(); // Refresh list
};
</script>
```

**The code is identical!** Only the import changes.

## Configuration Options

### Changing Base URL

```typescript
import { ApiService } from '@/services/apiService';

// Create custom instance with different base URL
const customApiService = new ApiService({
  baseUrl: 'https://api.yourdomain.com/v1',
  timeout: 60000,
  headers: {
    'Authorization': 'Bearer your-token'
  }
});
```

### Environment-based Configuration

```typescript
const apiService = new ApiService({
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.yourapp.com' 
    : 'http://localhost:3000/api'
});
```

## Error Handling

The API service provides consistent error handling:

```typescript
const result = await apiService.get('countries');

if (result.success) {
  console.log('Data:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## Benefits of This Approach

1. **Gradual Migration** - Migrate one collection at a time
2. **Same Interface** - No changes to component logic
3. **Better Architecture** - Separation of concerns
4. **Scalability** - API can handle caching, rate limiting, etc.
5. **Security** - No direct database access from frontend
6. **Flexibility** - Easy to switch between different data sources

## Next Steps

1. Set up your backend API with the expected endpoints
2. Test the API service with a simple collection first
3. Start migrating collections one by one
4. Update error handling and loading states as needed
5. Eventually remove the MongoDB direct connection code

## Troubleshooting

### Common Issues

1. **CORS errors** - Ensure your API server allows requests from your frontend
2. **Network timeouts** - Adjust timeout in ApiService configuration
3. **Response format** - Ensure your API returns the expected JSON format
4. **Query parameters** - Complex objects are JSON.stringify'd automatically

### Debug Mode

Enable console logging to see all API requests:

```typescript
// The composable already includes detailed logging
// Check browser console for request/response details
``` 