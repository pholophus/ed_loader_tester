import { defineStore } from 'pinia';
import type { User } from '../../schemas/User';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
  }),
  
  actions: {
    setUser(user: User) {
      this.user = user;
    },
    
    clearUser() {
      this.user = null;
    },
  },
  
  getters: {
    getUser: (state) => state.user,
    getUserId: (state) => state.user?.id,
    getUserName: (state) => state.user?.name,
    getUserEmail: (state) => state.user?.email,
    isUserLoggedIn: (state) => state.user !== null,
  }
}); 