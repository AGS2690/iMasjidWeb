import { useState, useCallback } from 'react';

export function useModalState<T = any>() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<T | null>(null);
  const [selectedForView, setSelectedForView] = useState<T | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<T | null>(null);
  const [selectedForAction, setSelectedForAction] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = useCallback(() => setIsCreateOpen(true), []);
  const closeCreate = useCallback(() => setIsCreateOpen(false), []);

  const openEdit = useCallback((item: T) => setSelectedForEdit(item), []);
  const closeEdit = useCallback(() => setSelectedForEdit(null), []);

  const openView = useCallback((item: T) => setSelectedForView(item), []);
  const closeView = useCallback(() => setSelectedForView(null), []);

  const openDelete = useCallback((item: T) => setSelectedForDelete(item), []);
  const closeDelete = useCallback(() => setSelectedForDelete(null), []);

  const openAction = useCallback((item: T) => setSelectedForAction(item), []);
  const closeAction = useCallback(() => setSelectedForAction(null), []);

  return {
    isCreateOpen,
    openCreate,
    closeCreate,

    selectedForEdit,
    openEdit,
    closeEdit,

    selectedForView,
    openView,
    closeView,

    selectedForDelete,
    openDelete,
    closeDelete,

    selectedForAction,
    openAction,
    closeAction,

    isDeleting,
    setIsDeleting,
  };
}
