import React, { useEffect, useRef, useState } from 'react'
import { X, Plus, Loader } from 'lucide-react'
import { usePlaylistStore } from '../../store/usePlaylistStore'
import CreatePlaylistModal from './CreatePlaylistModal'


const AddToPlaylistModal = ({ ModalRef, closeModal, problemId }) => {
  const { playlists, getAllPlaylists, addProblemToPlaylist, isPlaylistLoading, createPlaylist } = usePlaylistStore()

  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [serverError, setServerError] = useState(null);

  //CreatePlaylistModal ref
  const createPlaylistModalRef = useRef(null);

  const openCreatePlaylistModal = () => {
    if (createPlaylistModalRef.current) {
      createPlaylistModalRef.current.showModal();
    }
  }

  const closeCreatePlaylistModal = () => {
    if (createPlaylistModalRef.current) {
      createPlaylistModalRef.current.close();
    }
  }

  const handleCreatePlaylist = async (data) => {
    try {
      const res = await createPlaylist(data);
      await getAllPlaylists(); 

      if (res?.id) {
        setSelectedPlaylist(res.id); //select the newly created playlist
      }else if(res?.data?.id){
        setSelectedPlaylist(res.data.id); 
      }
      
      return { success: true, data: res };

    } catch (error) {
      return { success: false , message: error.message};
    }
  }
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const result = await addProblemToPlaylist(selectedPlaylist, [problemId]);
    if (result.success) {
      closeModal();
    } else {
      setServerError(result.message || "Failed to add problem to playlist");
    }
  }

  useEffect(() => {
    if (ModalRef) {
      getAllPlaylists();
    }
  }, [ModalRef, getAllPlaylists])


  return (
    <>
      <dialog ref={ModalRef} className="modal">
        <div className="modal-box w-full max-w-md p-6 space-y-6">
          <h3>Select a playlist to add this problem to:</h3>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" aria-label="Close">
            <X className="w-4 h-4" onClick={closeModal} />
          </button>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <select
                className='select select-primary w-full'
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
              <p className="mt-2 text-sm">
                {serverError && <span className="text-error">{serverError}</span>}
              </p>

            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={openCreatePlaylistModal} className="btn btn-outline btn-success">
                <Plus className="w-4 h-4" /> Create Playlist
              </button>
              <button type="button" onClick={closeModal} className="btn btn-ghost">
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!selectedPlaylist || isPlaylistLoading}
              >
                {isPlaylistLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add to Playlist
              </button>
            </div>
          </form>

        </div>

        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close modal"></button>
        </form>
      </dialog>

      <CreatePlaylistModal
        ModalRef={createPlaylistModalRef}
        closeModal={closeCreatePlaylistModal}
        onSubmit={handleCreatePlaylist}
      />
    </>
  )
}

export default AddToPlaylistModal