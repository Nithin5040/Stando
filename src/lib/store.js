
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';

const API_BASE_URL = 'http://localhost:5001/api';

export const useStore = create(
  persist(
    immer((set, get) => ({
      bookings: [],
      agents: [],
      user: null,
      agent: null, // Add agent state
      isLoading: false,
      error: null,

      fetchBookings: async () => {
        const { user, agent } = get();
        let url = `${API_BASE_URL}/bookings`;

        // Agents need all bookings to see pending ones, users only need their own.
        if (user && !agent) {
          url = `${API_BASE_URL}/bookings/user/${user.id}`;
        }
        
        set({ isLoading: true });
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Failed to fetch bookings');
          const bookings = await response.json();
          set({ bookings, isLoading: false, error: null });
        } catch (error) {
          console.error("Error fetching bookings:", error);
          set({ isLoading: false, error: 'Could not fetch bookings.' });
        }
      },

      fetchAgents: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}/agents`);
          if (!response.ok) throw new Error('Failed to fetch agents');
          const agents = await response.json();
          set({ agents, isLoading: false, error: null });
        } catch (error) {
           console.error("Error fetching agents:", error);
          set({ isLoading: false, error: 'Could not fetch agents.' });
        }
      },

      addBooking: async (newBookingData) => {
        const user = get().user;
        if (!user) {
            set({ error: 'You must be logged in to create a booking.' });
            return;
        };

        const bookingPayload = {
            ...newBookingData,
            customer: user.name,
            customer_id: user.id,
            customerPhone: user.phone || '123-456-7890', // Use user's phone or a default
        };

         try {
          const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingPayload),
          });
          if (!response.ok) throw new Error('Failed to create booking');
          
          await get().fetchBookings();

        } catch (error) {
          console.error("Error adding booking:", error);
          set({ error: 'Could not add booking.' });
        }
      },

      updateBookingStatus: async (bookingId, status) => {
        try {
          const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status }),
          });
          if (!response.ok) throw new Error('Failed to update status');
          const updatedBooking = await response.json();
          set((state) => {
            const index = state.bookings.findIndex((b) => b.id === bookingId);
            if (index !== -1) {
              state.bookings[index] = updatedBooking;
            } else {
              state.bookings.push(updatedBooking);
            }
          });
        } catch (error) {
          console.error("Error updating status:", error);
          set({ error: 'Could not update booking status.' });
        }
      },
      
      updateQueueInfo: async (bookingId, queuePosition, totalInQueue) => {
         try {
          const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/queue`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ queuePosition, totalInQueue }),
          });
          if (!response.ok) throw new Error('Failed to update queue info');
          const updatedBooking = await response.json();
          set((state) => {
             const index = state.bookings.findIndex((b) => b.id === bookingId);
              if (index !== -1) {
                  state.bookings[index] = updatedBooking;
              }
          });
        } catch (error) {
          console.error("Error updating queue info:", error);
          set({ error: 'Could not update queue info.' });
          throw error;
        }
      },

      acceptBooking: async (bookingId) => {
        const agent = get().agent;
        if (!agent) return;

        try {
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/accept`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId: agent.id }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to accept booking');
            }
            const updatedBooking = await response.json();
            // Instead of refetching, just update the state directly for responsiveness
            set(state => {
                const index = state.bookings.findIndex(b => b.id === bookingId);
                if (index !== -1) {
                    state.bookings[index] = updatedBooking;
                } else {
                    state.bookings.push(updatedBooking);
                }
            })
            return true;
        } catch (error) {
            console.error("Error accepting booking:", error);
            set({ error: error.message });
            return false;
        }
      },
      
      updateAgentLocation: async (agentId, lat, lng) => {
        set({isLoading: true});
        try {
          const response = await fetch(`${API_BASE_URL}/agents/${agentId}/location`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat, lng }),
          });
          if (!response.ok) throw new Error('Failed to update agent location');
          const updatedAgent = await response.json();
          set((state) => {
            if(state.agent && state.agent.id === agentId) {
                state.agent.location = updatedAgent.location;
            }
          });
        } catch (error) {
           console.error("Error updating agent location:", error);
           set({ error: 'Could not update agent location.' });
        } finally {
            set({isLoading: false});
        }
      },

      verifyLocation: async (bookingId) => {
         try {
          const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/verify`, {
              method: 'PATCH',
          });
          if (!response.ok) throw new Error('Failed to verify location');
          const updatedBooking = await response.json();
          set((state) => {
             const index = state.bookings.findIndex((b) => b.id === bookingId);
              if (index !== -1) {
                  state.bookings[index] = updatedBooking;
              }
          });
        } catch (error) {
          console.error("Error verifying location:", error);
          set({ error: 'Could not verify location.' });
        }
      },

      // --- AUTH ACTIONS ---

      login: async (email, password) => {
        try {
          const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            return false;
          }
          const userData = await response.json();
          set({ user: { id: userData.id, name: userData.name, email: userData.email }, agent: null, error: null });
          await get().fetchBookings(); // Fetch bookings for the logged-in user
          return true;
        } catch (error) {
          console.error("Login error:", error);
          set({ error: 'Login failed.' });
          return false;
        }
      },

      signup: async (name, email, password) => {
        try {
          const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Signup failed');
          }
          // Auto-login after signup
          return await get().login(email, password);
        } catch (error) {
          console.error("Signup error:", error);
          set({ error: error.message });
          return false;
        }
      },
      
      agentLogin: async (email, password) => {
        try {
          const response = await fetch(`${API_BASE_URL}/agents/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            return false;
          }
          const agentData = await response.json();
          set({ agent: agentData, user: null, error: null });
          await get().fetchBookings(); // Fetch all bookings for agent dashboard
          return true;
        } catch (error) {
          console.error("Agent login error:", error);
          set({ error: 'Agent login failed.' });
          return false;
        }
      },

      logout: () => {
        set({ user: null, agent: null, bookings: [], agents: [] });
      },

    })),
    {
      name: 'stando-app-storage',
      storage: createJSONStorage(() => localStorage),
       // Only persist user and agent info
      partialize: (state) => ({ user: state.user, agent: state.agent }),
    }
  )
);
