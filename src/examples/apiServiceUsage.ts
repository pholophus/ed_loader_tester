/**
 * Example usage of the new API service and composable
 * This shows how to migrate from MongoDB direct connection to API-based approach
 */

import { apiService } from '../services/apiService';
import { useApi } from '../renderer/Composables/useApi';

// ===== Direct API Service Usage =====

/**
 * Example 1: Using apiService directly for countries endpoint
 * URL: http://localhost:3000/api/countries
 */
async function directApiServiceExample() {
  console.log('=== Direct API Service Example ===');

  // GET all countries
  const countries = await apiService.get('countries');
  console.log('Countries:', countries);

  // GET countries with query parameters
  const filteredCountries = await apiService.get('countries', { 
    region: 'Asia', 
    active: true 
  });
  console.log('Filtered Countries:', filteredCountries);

  // POST - Create new country
  const newCountry = await apiService.post('countries', {
    name: 'Test Country',
    code: 'TC',
    region: 'Test Region'
  });
  console.log('Created Country:', newCountry);

  // PUT - Update country by ID
  if (newCountry.success && newCountry.data?._id) {
    const updatedCountry = await apiService.put('countries', newCountry.data._id, {
      name: 'Updated Test Country',
      active: true
    });
    console.log('Updated Country:', updatedCountry);
  }

  // DELETE - Delete country by ID
  if (newCountry.success && newCountry.data?._id) {
    const deleted = await apiService.delete('countries', newCountry.data._id);
    console.log('Deleted Country:', deleted);
  }
}

// ===== Composable Usage (Vue Component Example) =====

/**
 * Example 2: Using useApi composable (similar to useMongo)
 * This is how you would use it in a Vue component
 */
function composableExample() {
  console.log('=== Composable Usage Example ===');

  // Initialize the composable for 'users' endpoint
  // URL: http://localhost:3000/api/users
  const { 
    items: users, 
    loading, 
    error, 
    fetch, 
    insert, 
    update, 
    remove, 
    upsert 
  } = useApi('users');

  // Example Vue component methods
  const loadUsers = async () => {
    await fetch(); // GET http://localhost:3000/api/users
    console.log('Users loaded:', users.value);
  };

  const loadUsersWithFilter = async () => {
    await fetch({ active: true, role: 'admin' }); // GET with query params
    console.log('Filtered Users:', users.value);
  };

  const createUser = async () => {
    try {
      const newUser = await insert({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user'
      });
      console.log('Created User:', newUser);
    } catch (err) {
      console.error('Error creating user:', error.value);
    }
  };

  const updateUser = async (userId: string) => {
    try {
      await update({ _id: userId }, { name: 'John Updated' });
      console.log('User updated successfully');
    } catch (err) {
      console.error('Error updating user:', error.value);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await remove({ _id: userId });
      console.log('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', error.value);
    }
  };

  return {
    users,
    loading,
    error,
    loadUsers,
    loadUsersWithFilter,
    createUser,
    updateUser,
    deleteUser
  };
}

// ===== Migration Example =====

/**
 * Example 3: How to migrate from useMongo to useApi
 * 
 * BEFORE (using MongoDB directly):
 * const { items, loading, error, fetch, insert } = useMongo('countries');
 * 
 * AFTER (using API):
 * const { items, loading, error, fetch, insert } = useApi('countries');
 * 
 * The interface is exactly the same!
 */

// Example migration for a specific collection
function migrationExample() {
  console.log('=== Migration Example ===');

  // OLD WAY - Direct MongoDB connection
  // const { items: countries, fetch: fetchCountries } = useMongo('countries');
  
  // NEW WAY - API-based
  const { items: countries, fetch: fetchCountries } = useApi('countries');
  
  // Usage remains exactly the same!
  const loadCountries = async () => {
    await fetchCountries({ active: true });
    console.log('Countries loaded via API:', countries.value);
  };

  return { countries, loadCountries };
}

// ===== Real-world Vue Component Example =====

/**
 * Example 4: How this would look in a real Vue component
 */
const exampleVueComponent = `
<template>
  <div>
    <div v-if="loading">Loading countries...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-for="country in countries" :key="country._id">
      {{ country.name }} ({{ country.code }})
    </div>
    
    <button @click="loadCountries">Refresh</button>
    <button @click="addCountry">Add Country</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useApi } from '@/composables/useApi';

interface Country {
  _id: string;
  name: string;
  code: string;
  region: string;
  active: boolean;
}

// Use the API composable instead of useMongo
const { 
  items: countries, 
  loading, 
  error, 
  fetch: fetchCountries, 
  insert: insertCountry 
} = useApi<Country>('countries');

const loadCountries = async () => {
  await fetchCountries({ active: true });
};

const addCountry = async () => {
  try {
    await insertCountry({
      name: 'New Country',
      code: 'NC',
      region: 'Test',
      active: true
    });
    // Refresh the list
    await loadCountries();
  } catch (err) {
    console.error('Failed to add country');
  }
};

// Load countries on component mount
onMounted(() => {
  loadCountries();
});
</script>
`;

export {
  directApiServiceExample,
  composableExample,
  migrationExample,
  exampleVueComponent
}; 