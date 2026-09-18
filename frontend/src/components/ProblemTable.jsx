//ProblemTable.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bookmark, PencilIcon, TrashIcon, Plus, OptionIcon, MoveLeftIcon, MoveRightIcon, Loader, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { useProblemStore } from "../store/useProblemStore";
import { usePlaylistStore } from "../store/usePlaylistStore";
import CreatePlaylistModal from "./playlists/CreatePlaylistModal";
import AddToPlaylistModal from "./playlists/AddToPlaylistModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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
    if (!authUser) {
      toast.error("Please log in to create a playlist");
      return;
    }
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
    if (!authUser) {
      toast.error("Please log in to manage playlists");
      return;
    }
    // Open the AddToPlaylistModal and pass the problemId to it.
    openAddToPlaylistModal();
    setSelectedProblemId(problemId);
  };


  return (
    <div className="w-full max-w-6xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Problems</h2>
        <Button
          onClick={openModal}
          className="gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-1/3">
          <Input
            type="text"
            placeholder="Search By Title"
            className="w-full bg-muted/40 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:justify-end">
          <Select value={difficulty} onValueChange={(val) => setDifficulty(val)}>
            <SelectTrigger className="w-40 bg-muted/40 focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent side="bottom" className="max-h-64">
              <SelectItem value="ALL">All Difficulties</SelectItem>
              {difficulties.map((diff) => (
                <SelectItem key={diff} value={diff}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTag} onValueChange={(val) => setSelectedTag(val)}>
            <SelectTrigger className="w-48 bg-muted/40 focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent side="bottom" className="max-h-64">
              <SelectItem value="ALL">All Tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-16">Solved</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right sm:text-left">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isProblemsLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader className="size-8 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : paginatedProblems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No problems found.
                </TableCell>
              </TableRow>
            ) : (
              // 🔹 Render problems when available
              paginatedProblems.map((problem) => {
                const isSolved = problem.solvedBy?.some(
                  (user) => user.userId === authUser?.id
                ) || false;
                return (
                  <TableRow key={problem.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSolved}
                        readOnly
                        className="h-4 w-4 rounded border-border accent-primary cursor-default"
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/problem/${problem.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {problem.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(problem.tags || []).map((tag, i) => (
                          <Badge
                            key={i}
                            variant="tag"
                            className="text-[11px] font-medium"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          problem.difficulty === "EASY"
                            ? "easy"
                            : problem.difficulty === "MEDIUM"
                              ? "medium"
                              : "hard"
                        }
                      >
                        {problem.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col md:flex-row gap-2 lg:items-center md:items-center">
                        {authUser?.role === "ADMIN" && (
                          <div className="flex gap-2">
                            <div className="tooltip" data-tip="Delete">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(problem.id)}
                                disabled={isDeletingProblem}
                                className="h-8 w-8 p-0"
                              >
                                {isDeletingProblem ? (
                                  <Loader2 className="animate-spin h-4 w-4" />
                                ) : (
                                  <TrashIcon className="w-4 h-4 text-white" />
                                )}
                              </Button>
                            </div>
                            <div className="tooltip" data-tip="Edit">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 w-8 p-0 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="tooltip tooltip-top" data-tip="Add To Playlist">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full text-sky-400 border-sky-400/40 hover:bg-sky-400/10"
                            onClick={() => handleAddToPlaylist(problem.id)}
                          >
                            <Bookmark className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>


      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          <MoveLeftIcon className="w-4 h-4" />
        </Button>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-md bg-muted text-muted-foreground">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          <MoveRightIcon className="w-4 h-4" />
        </Button>
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