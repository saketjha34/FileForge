import React from "react";
import CreateFolderModal from "../CreateFolderModal";
import RenameModal from "../RenameModal";

const DashboardModals = ({
  showCreateFolderModal,
  setShowCreateFolderModal,
  newFolderName,
  setNewFolderName,
  createFolder,
  showRenameModal,
  setShowRenameModal,
  renameData = { name: "", type: "" },
  setRenameData,
  renameItem,
}) => {
  return (
    <>
      <CreateFolderModal
        show={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        createFolder={createFolder}
      />

      <RenameModal
        show={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        name={renameData.name}
        setName={(name) => setRenameData((prev) => ({ ...prev, name }))}
        onRename={renameItem}
        type={renameData.type}
      />
    </>
  );
};

export default DashboardModals;
