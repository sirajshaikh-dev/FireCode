import React, { useEffect, useState } from 'react'
import { Plus, Loader } from 'lucide-react'
import { usePlaylistStore } from '../../store/usePlaylistStore'
import { useAuthStore } from '../../store/useAuthStore'
import CreatePlaylistModal from './CreatePlaylistModal'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const AddToPlaylistModal = ({ isOpen, onClose, ModalRef, closeModal, problemId }) => {
  const { playlists, getAllPlaylists, addProblemToPlaylist, isPlaylistLoading, createPlaylist } = usePlaylistStore()
  const { authUser } = useAuthStore()

  const [selectedPlaylist, setSelectedPlaylist] = useState("")
  const [serverError, setServerError] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [internalOpen, setInternalOpen] = useState(false)
  const isModalOpen = isOpen !== undefined ? isOpen : internalOpen
  const handleClose = onClose || closeModal || (() => setInternalOpen(false))

  useEffect(() => {
    if (ModalRef) {
      ModalRef.current = {
        showModal: () => setInternalOpen(true),
        close: () => setInternalOpen(false),
      }
    }
  }, [ModalRef])

  const handleCreatePlaylist = async (data) => {
    try {
      const res = await createPlaylist(data)
      await getAllPlaylists()

      if (res?.id) {
        setSelectedPlaylist(res.id)
      } else if (res?.data?.id) {
        setSelectedPlaylist(res.data.id)
      }
      
      return { success: true, data: res }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setServerError("")

    const result = await addProblemToPlaylist(selectedPlaylist, [problemId])
    if (result.success) {
      handleClose()
    } else {
      setServerError(result.message || "Failed to add problem to playlist")
    }
  }

  useEffect(() => {
    if (isModalOpen && authUser) {
      getAllPlaylists()
    }
  }, [isModalOpen, getAllPlaylists, authUser])

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Select a playlist to add this problem to:
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
            <div>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedPlaylist}
                onChange={(e) => setSelectedPlaylist(e.target.value)}
              >
                <option disabled value={""}>Select a playlist</option>
                {playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>
                    {playlist.name}
                  </option>
                ))}
              </select>
              {serverError && (
                <p className="mt-2 text-xs text-destructive">{serverError}</p>
              )}
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(true)}
                className="text-emerald-500 border-emerald-500/40 hover:bg-emerald-500/10"
              >
                <Plus className="w-4 h-4 mr-1" /> Create Playlist
              </Button>
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedPlaylist || isPlaylistLoading}
              >
                {isPlaylistLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add to Playlist
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CreatePlaylistModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreatePlaylist}
      />
    </>
  )
}

export default AddToPlaylistModal