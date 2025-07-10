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
3. **`src/config/api.ts`** - API configuration with environment variable support
4. **`src/examples/apiServiceUsage.ts`** - Usage examples

## API Base Configuration

The API base URL is now configurable through the configuration file:

- **Configuration File**: `src/config/api.ts`
- **Default**: `http://localhost:3000/api`

### Setting Custom API URL

Edit the `src/config/api.ts` file:

```typescript
export const apiConfig: ApiConfig = {
  baseUrl: 'http://localhost:3000/api',  // Change this URL
  timeout: 30000
};
```

For production:

```typescript
export const apiConfig: ApiConfig = {
  baseUrl: 'https://api.yourapp.com/v1',  // Production URL
  timeout: 60000
};
```

### Endpoint Structure

All endpoints are relative to the configured base URL:
- Countries: `{BASE_URL}/countries`
- Users: `{BASE_URL}/users`
- Projects: `{BASE_URL}/projects`

Example with default configuration:
- Countries: `http://localhost:3000/api/countries`
- Users: `http://localhost:3000/api/users`
- Projects: `http://localhost:3000/api/projects`

## Usage Examples

### 1. Direct API Service Usage

```typescript
import { apiService } from '@/services/apiService';
import { getApiUrl, API_BASE_URL } from '@/config/api';

console.log('Using API Base URL:', API_BASE_URL);

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

// Direct URL construction for custom endpoints
const customUrl = getApiUrl('custom/endpoint');
```

### 2. Vue Composable Usage

```typescript
import { useApi } from '@/composables/useApi';

// In your Vue component
const { items, loading, error, fetch, insert, update, remove } = useApi('countries');

// Load data
await fetch(); // GET {BASE_URL}/countries
await fetch({ active: true }); // GET {BASE_URL}/countries?active=true

// Create
const newCountry = await insert({ name: 'New Country' });

// Update
await update({ _id: 'id123' }, { name: 'Updated Name' });

// Delete
await remove({ _id: 'id123' });
```

## Migration Strategy

### Step 1: Configure Your API URL

1. Open `src/config/api.ts`
2. Update the `baseUrl` in `apiConfig` to your API server URL
3. Optionally adjust the `timeout` value

### Step 2: Identify Collections to Migrate

List all places where you currently use `useMongo`:

```typescript
// Current usage
const { items, fetch, insert } = useMongo('countries');
const { items, fetch, insert } = useMongo('users');
const { items, fetch, insert } = useMongo('projects');
```

### Step 3: Replace One Collection at a Time

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

### Step 4: Test Each Migration

1. Replace `useMongo` with `useApi` for one collection
2. Test all CRUD operations
3. Verify the component works correctly
4. Move to the next collection

## API Endpoints Expected

Your backend API should support these endpoints relative to your configured base URL:

### Basic CRUD
```
GET    {BASE_URL}/{collection}              # Find documents
GET    {BASE_URL}/{collection}/:id          # Get by ID
POST   {BASE_URL}/{collection}              # Create document
PUT    {BASE_URL}/{collection}/:id          # Update by ID
DELETE {BASE_URL}/{collection}/:id          # Delete by ID
```

### Advanced Operations
```
POST   {BASE_URL}/{collection}/bulk         # Insert multiple
POST   {BASE_URL}/{collection}/update       # Update with filter
POST   {BASE_URL}/{collection}/upsert       # Upsert operation
POST   {BASE_URL}/{collection}/aggregate    # Aggregation
POST   {BASE_URL}/{collection}/count        # Count documents
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

### Basic Configuration

Edit `src/config/api.ts` to change the API settings:

```typescript
export const apiConfig: ApiConfig = {
  baseUrl: 'http://localhost:3000/api',  // Your API URL
  timeout: 30000                         // Request timeout in ms
};
```

### Environment-specific Configuration

You can add environment-specific logic in the config file:

```typescript
export const apiConfig: ApiConfig = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.yourapp.com/v1'
    : 'http://localhost:3000/api',
  timeout: 30000
};
```

### Programmatic Configuration

```typescript
import { apiConfig, getApiUrl, API_BASE_URL } from '@/config/api';

// Get current configuration
console.log('Base URL:', API_BASE_URL);
console.log('Timeout:', apiConfig.timeout);

// Build custom URLs
const customEndpoint = getApiUrl('custom/endpoint');
console.log('Custom URL:', customEndpoint);
```

### Creating Custom API Service Instance

```typescript
import { ApiService } from '@/services/apiService';

// Create custom instance with different configuration
const customApiService = new ApiService({
  baseUrl: 'https://api.yourdomain.com/v2',
  timeout: 60000,
  headers: {
    'Authorization': 'Bearer your-token'
  }
});
```

## Configuration Examples

### Development Configuration
```typescript
export const apiConfig: ApiConfig = {
  baseUrl: 'http://localhost:3000/api',
  timeout: 30000
};
```

### Production Configuration
```typescript
export const apiConfig: ApiConfig = {
  baseUrl: 'https://api.yourapp.com/v1',
  timeout: 60000
};
```

### Testing Configuration
```typescript
export const apiConfig: ApiConfig = {
  baseUrl: 'http://localhost:4000/api',
  timeout: 15000
};
```

## Error Handling

The API service provides consistent error handling:

```typescript
import { apiService } from '@/services/apiService';

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
3. **Configurable** - Easy environment-specific configuration
4. **Better Architecture** - Separation of concerns
5. **Scalability** - API can handle caching, rate limiting, etc.
6. **Security** - No direct database access from frontend
7. **Flexibility** - Easy to switch between different API servers

## Next Steps

1. Update `src/config/api.ts` with your correct API base URL
2. Set up your backend API with the expected endpoints
3. Test the API service with a simple collection first
4. Start migrating collections one by one
5. Update error handling and loading states as needed
6. Eventually remove the MongoDB direct connection code

## Troubleshooting

### Common Issues

1. **CORS errors** - Ensure your API server allows requests from your frontend
2. **Network timeouts** - Adjust `timeout` in `src/config/api.ts`
3. **Wrong API URL** - Check your `baseUrl` in `src/config/api.ts`
4. **Response format** - Ensure your API returns the expected JSON format
5. **Query parameters** - Complex objects are JSON.stringify'd automatically

### Debug Mode

Enable console logging to see all API requests and current configuration:

```typescript
import { API_BASE_URL } from '@/config/api';

console.log('Current API Base URL:', API_BASE_URL);
// The composable already includes detailed logging
// Check browser console for request/response details
``` 