//ProblemTable.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bookmark, PencilIcon, TrashIcon, Plus, OptionIcon, MoveLeftIcon, MoveRightIcon, Loader, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useProblemStore } from "../store/useProblemStore";
import { usePlaylistStore } from "../store/usePlaylistStore";
import CreatePlaylistModal from "./playlists/CreatePlaylistModal";
import AddToPlaylistModal from "./playlists/AddToPlaylistModal";


const ProblemTable = () => {

  const { authUser } = useAuthStore()
  const { getAllProblems, problems, isProblemsLoading, deleteProblem, isDeletingProblem } = useProblemStore();
  const { createPlaylist } = usePlaylistStore()
  // const createPlaylist = usePlaylistStore((state) => state.createPlaylist);

  const [search, setSearch] = useState("")
  const [difficulty, setDifficulty] = useState("ALL")
  const [selectedTag, setSelectedTag] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  // const [isCreatePlaylistModalOpen, setCreatePlaylistModalOpen] = useState(false)
  const [selectedProblemId, setSelectedProblemId] = useState(null)

  const ModalRef = useRef(null);
  const openModal = () => {
    if (ModalRef.current) {
      ModalRef.current.showModal();
    }
  };

  const closeModal = () => {
    if (ModalRef.current) {
      ModalRef.current.close();
    }
  };

  // AddToPlaylist Modal Ref and Handlers
  const AddToPlaylistRef = useRef(null);

  const openAddToPlaylistModal = () => {
    if (AddToPlaylistRef.current) {
      AddToPlaylistRef.current.showModal();
    }
  };
  const closeAddToPlaylistModal = () => {
    if (AddToPlaylistRef.current) {
      AddToPlaylistRef.current.close();
    }
  };

  useEffect(() => {
    getAllProblems();
  }, [getAllProblems]);

  // Extract all unique tags from problems
  const allTags = useMemo(() => {
    if (!Array.isArray(problems)) return []
    const tagSet = new Set()

    problems.forEach((p) => p.tags?.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet)
  }, [problems])

  // console.log(allTags);

  const difficulties = ["EASY", "MEDIUM", "HARD"]

  const filteredProblems = useMemo(() => {
    return (problems || [])
      .filter((problem) => problem.title.toLowerCase().includes(search.toLocaleLowerCase())) // Title search
      .filter((problem) => difficulty === "ALL" ? true : problem.difficulty === difficulty) // Difficulty filter
      .filter((problem) => selectedTag === "ALL" ? true : problem.tags?.includes(selectedTag)) // Tag filter
  }, [problems, search, difficulty, selectedTag])

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage) // Eg: 50/5 = 10 Pages
  const paginatedProblems = useMemo(() => {
    return filteredProblems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)  // ((1-1)*5, (1*5)) =>(0,5) | ((5-1)*5, (5*5)) =>(20,25)
  }, [filteredProblems, currentPage])

  // console.log("paginatedProblems", paginatedProblems);

  const handleDelete = async (id) => {
    deleteProblem(id)
  }

  const handleCreatePlaylist = async (playlistData) => {
    try {
      const res = await createPlaylist(playlistData);
      // console.log("Created playlist data:", res);
      return { success: true, data: res };
    } catch (err) {
      return { success: false, message: err.message }
    }
  };

  const handleAddToPlaylist = async (problemId) => {
    // Open the AddToPlaylistModal and pass the problemId to it.
    openAddToPlaylistModal();
    setSelectedProblemId(problemId);
  };


  return (
    <div className="w-full max-w-6xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Problems</h2>
        <button
          className="btn btn-primary gap-2"
          onClick={openModal}
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <input type="text"
          placeholder="Search By Title"
          className="input input-bordered w-full md:w-1/3 bg-base-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="select select-bordered bg-base-200"
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value) }}
        >
          <option value={"ALL"}> All Difficulties</option>
          {difficulties.map((diff) => (
            <option key={diff} value={diff}>
              {diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase()}
            </option>
          ))}
        </select>

        <select
          className="select select-bordered bg-base-200"
          value={selectedTag}
          onChange={(e) => { setSelectedTag(e.target.value) }}
        >
          <option value={"ALL"}>All Tags</option>
          {
            allTags.map((tag) => (
              <option key={tag} value={tag}>
                {/* {tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()} */}
                {
                  tag
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")

                }
              </option>
            ))
          }
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="table table-zebra table-lg bg-base-200 text-base-content">
          <thead className="bg-base-200">
            <tr>
              <th>Solved</th>
              <th>Title</th>
              <th>Tags</th>
              <th>Difficulty</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {isProblemsLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  <Loader className="size-10 animate-spin mx-auto" />
                </td>
              </tr>
            ) : paginatedProblems.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No problems found.
                </td>
              </tr>
            ) : (
              // 🔹 Render problems when available
              paginatedProblems.map((problem) => {
                const isSolved = problem.solvedBy.some(
                  (user) => user.userId === authUser?.id
                );
                return (
                  <tr key={problem.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSolved}
                        readOnly
                        className="checkbox checkbox-sm"
                      />
                    </td>
                    <td>
                      <Link
                        to={`/problem/${problem.id}`}
                        className="font-semibold hover:underline"
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(problem.tags || []).map((tag, i) => (
                          <span
                            key={i}
                            className="badge badge-outline badge-warning text-xs font-bold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge font-semibold text-xs text-white ${problem.difficulty === "EASY"
                            ? "badge-success"
                            : problem.difficulty === "MEDIUM"
                              ? "badge-warning"
                              : "badge-error"
                          }`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col md:flex-row gap-2 lg:items-center md:items-center">
                        {authUser?.role === "ADMIN" && (
                          <div className="flex gap-2">
                            <div className="tooltip" data-tip="Delete">
                              <button
                                onClick={() => handleDelete(problem.id)}
                                disabled={isDeletingProblem}
                                className="btn btn-sm btn-error"
                              >
                                {isDeletingProblem ? (
                                  <Loader2 className="animate-spin h-4 w-4" />
                                ) : (
                                  <TrashIcon className="w-4 h-4 text-white" />
                                )}
                              </button>
                            </div>
                            <div className="tooltip" data-tip="Edit">
                              <button className="tooltip-top btn btn-sm btn-warning" data-tip="Edit">
                                <PencilIcon className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="tooltip tooltip-top" data-tip="Add To Playlist">
                          <button
                            className="btn btn-circle btn-info btn-outline"
                            onClick={() => handleAddToPlaylist(problem.id)}
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>


      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 gap-2" >

        <MoveLeftIcon
          className="btn btn-sm btn-ghost cursor-pointer "
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)} />
        <span className="btn btn-ghost btn-sm">
          {currentPage}/{totalPages}
        </span>
        <MoveRightIcon
          className="btn btn-sm btn-ghost cursor-pointer "
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        />
      </div>

      {/* Modal */}
      {/* <CreatePlaylistModal
        isOpen={isCreatePlaylistModalOpen}
        onClose={() => setCreatePlaylistModalOpen(false)}
      /> */}
      <CreatePlaylistModal
        ModalRef={ModalRef}
        closeModal={closeModal}
        onSubmit={handleCreatePlaylist}
      />
      <AddToPlaylistModal
        ModalRef={AddToPlaylistRef}
        closeModal={closeAddToPlaylistModal}
        problemId={selectedProblemId}
      />
    </div>
  )
}

export default ProblemTable