import { create } from "zustand"
import { axiosInstance } from '../lib/axios.js'
import toast from "react-hot-toast"

export const usePlaylistStore = create((set, get) => ({
    playlists: [],
    currentPlaylist: null,
    isPlaylistLoading: false,
    error: null,

    createPlaylist: async (playlistData) => {
        try {
            set({ isPlaylistLoading: true })
            const res = await axiosInstance.post("/playlist/create-playlist", playlistData)
            set((state) => ({
                playlists: [...state.playlists, res.data.playlist]
            }))
            toast.success("Playlist Created Successfully")
            return res.data.playlist
        } catch (error) {
            const message = error.response?.data?.error || "Something went wrong"
            // console.log("Error creating Playlist", message);
            throw new Error(message)
        } finally {
            set({ isPlaylistLoading: false })
        }

    },

    getAllPlaylists: async () => {
        try {
            set({ isPlaylistLoading: true })
            const res = await axiosInstance.get('/playlist')
            set({ playlists: res.data.playlists })
        } catch (error) {
            // console.log("Error fetching playlist details", error);
            toast.error("Failed to fetch playlist details")
        } finally {
            set({ isPlaylistLoading: false })
        }
    },

    getPlaylistDetails: async (playlistId) => {
        try {
            set({ isPlaylistLoading: false })
            const res = await axiosInstance.get(`/playlist/${playlistId}`)
            set({ currentPlaylist: res.data.playlist })
        } catch (error) {
            // console.log("Error gettting playlist details", error);
            toast.error("Failed to fetch playlist details")
        } finally {
            set({ isPlaylistLoading: false })
        }
    },

    addProblemToPlaylist: async (playlistId, problemIds) => {
        try {
            set({ isPlaylistLoading: true });

            const res = await axiosInstance.post(
                `/playlist/${playlistId}/add-problem`,
                { problemIds }
            );

            if (get().currentPlaylist?.id === playlistId) {
                await get().getPlaylistDetails(playlistId);
            }

            toast.success('Problem added to playlist');
            return { success: true, message: "Added Successfully" };

        } catch (error) {
            // console.log('Error adding problem to playlist', error);
            return { success: false, message: "You have already added this problem to this playlist." };

        } finally {
            set({ isPlaylistLoading: false });
        }
    },



    removeProblemFromPlaylist: async ({ playlistId, problemIds }) => {
        try {
            await axiosInstance.delete(
                `/playlist/${playlistId}/remove-problem`,
                problemIds
            )
        } catch (error) {
            // console.error("Error removing problem from playlist", error);
            toast.error("Failed to remove remove problem from playlist")
        } finally {
            set({ isPlaylistLoading: false })
        }
    },

    deletePlaylist: async (playlistId) => {
        try {
            set({ isPlaylistLoading: true })
            await axiosInstance.delete(`/playlist/${playlistId}`)

            set((state) => ({
                playlists: state.playlists.filter((p) => p.id !== playlistId)
            }))
            toast.success("Playlist deleted successfully")
        } catch (error) {
            // console.error("Error deleting problem", error);
            toast.error("Failed to delete Playlist")
        } finally {
            Set({ isPlaylistLoading: false })
        }
    },
}))

