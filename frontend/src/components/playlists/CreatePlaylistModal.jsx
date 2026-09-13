import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { usePlaylistStore } from "../../store/usePlaylistStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const CreatePlaylistModal = ({ isOpen, onClose, ModalRef, closeModal, onSubmit }) => {
  const { isPlaylistLoading } = usePlaylistStore();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [serverError, setServerError] = useState(null);

  const [internalOpen, setInternalOpen] = useState(false);
  const isModalOpen = isOpen !== undefined ? isOpen : internalOpen;
  const handleClose = onClose || closeModal || (() => setInternalOpen(false));

  useEffect(() => {
    if (ModalRef) {
      ModalRef.current = {
        showModal: () => setInternalOpen(true),
        close: () => setInternalOpen(false),
      };
    }
  }, [ModalRef]);

  const handleFormSubmit = async (data) => {
    setServerError("");
    const result = await onSubmit(data);

    if (result.success) {
      reset();
      handleClose();
    } else {
      setServerError(result.message || "Failed to create playlist");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Playlist</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          {/* Playlist Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Playlist Name</label>
            <input
              type="text"
              placeholder="Enter playlist name"
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.name ? "border-destructive focus-visible:ring-destructive" : "border-input"
              }`}
              {...register("name", { required: "Playlist name is required" })}
            />
            {(errors.name || serverError) && (
              <p className="text-xs text-destructive">
                {errors.name?.message || serverError}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              placeholder="Enter playlist description (optional)"
              className="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              {...register("description")}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPlaylistLoading}>
              {isPlaylistLoading ? "Creating..." : "Create Playlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlaylistModal;
