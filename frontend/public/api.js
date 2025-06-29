export const API_BASE = 'http://localhost:3000/api';

export const api = {
    searchTrailer: async (movieName) => {
        try {
            const url = new URL(`${API_BASE}/trailers/search`);
            url.searchParams.append('movieName', movieName);

            const response = await fetch(url.toString(), {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) throw new Error(await response.text());

            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch trailer: ${error.message}`);
        }
    },

    searchTrack: async (songName) => {
        try {
            const url = new URL(`${API_BASE}/music/preview`);
            url.searchParams.append('songName', songName);

            const response = await fetch(url.toString(), {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) throw new Error(await response.text());

            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch track: ${error.message}`);
        }
    },

    exportMix: async (payload) => {
        console.log(payload)
        try {
            const response = await fetch(`${API_BASE}/mix/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (!response.ok) throw new Error(await response.text());
            return await response.blob();
        } catch (error) {
            throw new Error(`Export failed: ${error.message}`);
        }
    },

    saveMix: async (mixData) => {
        try {
            const response = await fetch(`${API_BASE}/mix/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(mixData),
            });
            if (!response.ok) throw new Error(await response.text());
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to save mix: ${error.message}`);
        }
    },

    getPublicMixes: async () => {
        try {
            const response = await fetch(`${API_BASE}/mix/public`, {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) throw new Error(await response.text());
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch public mixes: ${error.message}`);
        }
    },

    getMyMixes: async () => {
        try {
            const response = await fetch(`${API_BASE}/mix/mine`, {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) throw new Error(await response.text());
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch your mixes: ${error.message}`);
        }
    },

    deleteMix: async (mixId) => {
        try {
            const response = await fetch(`${API_BASE}/mix/${mixId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) throw new Error(await response.text());
            return await response.json(); 
        } catch (error) {
            throw new Error(`Failed to delete mix: ${error.message}`);
        }
    },

    addFriend: async (friendId) => {
        try {
            const response = await fetch(`${API_BASE}/friend/add/${friendId}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!response.ok) throw new Error(await response.text());
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to add friend: ${error.message}`);
        }
    },

    removeFriend: async (friendId) => {
        try {
            const response = await fetch(`${API_BASE}/friend/remove/${friendId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!response.ok) throw new Error(await response.text());
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to remove friend: ${error.message}`);
        }
    },

    getFriends: async () => {
        try {
            const response = await fetch(`${API_BASE}/friend/list`, {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) throw new Error(await response.text());
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch friends: ${error.message}`);
        }
    },

    getAllUsers: async () => {
        try {
            const response = await fetch(`${API_BASE}/users`, {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) throw new Error(await response.text());
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch all users: ${error.message}`);
        }
    },

    getUserMixes: async (userId) => {
        try {
          const response = await fetch(`${API_BASE}/users/${userId}/mixes`, {
            method: 'GET',
            credentials: 'include',
          });
          if (!response.ok) throw new Error(await response.text());
          return await response.json(); // returns { username, mixes }
        } catch (error) {
          throw new Error(`Failed to fetch user mixes: ${error.message}`);
        }
      },

};
