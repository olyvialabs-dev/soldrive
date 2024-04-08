"use client";

import { cn } from "~/lib/utils";
import { useFilesStore } from "../../store/store";
import FilePreviewContentItem from "./FilePreviewContentItem";
import FileDisplayControls from "./FileDisplayControls";
import { filesData } from "../data/data";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { AppLeftSidenav } from "~/modules/Layout/components/AppLeftSidenav";
import sidenavItems from "~/modules/Layout/data/sidenav";
import { FileIcon, FilePlusIcon } from "@radix-ui/react-icons";
import { OnboardingDialog } from "~/modules/Layout/components/OnboardingDialog";
import { PreviewFileDetails } from "../../FileDetails/components/PreviewFileDetails";
import { useAuthStore } from "~/modules/Auth/store/store";
import { useEffect } from "react";
import useGlobalDragAndDrop from "../../FileUpload/hooks/useGlobalDragAndDrop";
import { GlobalDnD } from "../../FileUpload/components/GlobalDnD";
import useTokenBalances from "../hooks/useGetAllFilesData";
import { useWallet } from "@solana/wallet-adapter-react";
import { FileDetails } from "../types";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyPlaceholder } from "./FileDisplayNoItems";
import { AddNewFileButton } from "./AddNewFileButton";
import { Button } from "~/components/ui/button";

const LoadingComponent = () => {
  return (
    <div className="flex h-full w-full flex-col items-center space-x-4 rounded rounded-sm border p-2 md:p-4">
      <Skeleton className="h-4 w-[200px]" />
      <div className="w-full py-4">
        <Skeleton className="h-[120px] w-full" />
      </div>
      <Skeleton className="h-4 w-[200px]" />
    </div>
  );
};

const FileDisplayContentByView = ({
  balances,
  balancesLoading,
}: {
  balances: FileDetails[];
  balancesLoading: boolean;
}) => {
  const { controls } = useFilesStore();
  console.log({ balances });

  if (balancesLoading) {
    return (
      <div className="mt-4 grid grid-cols-1 gap-4 px-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <LoadingComponent />
        <LoadingComponent />
        <LoadingComponent />
        <LoadingComponent />
        <LoadingComponent />
      </div>
    );
  }

  if (!balances.length) {
    return (
      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon>
          <FileIcon className="h-4 w-4" />
        </EmptyPlaceholder.Icon>
        <EmptyPlaceholder.Title>Nothing added yet</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          Please start by adding files via drag and drop or clicking the button
          below
        </EmptyPlaceholder.Description>
        <AddNewFileButton />
      </EmptyPlaceholder>
    );
  }
  if (controls.view === "list") {
    return (
      <div className="mt-4 w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50vw]">Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Date</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {balances.map((item) => (
              <FilePreviewContentItem
                key={`file-item-${item.file_id}`}
                item={item}
                allFiles={balances}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 px-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {balances.map((item) => (
        <FilePreviewContentItem
          key={`file-item-${item.file_id}`}
          item={item}
          allFiles={balances}
        />
      ))}
    </div>
  );
};

const FileDisplayContent = () => {
  const {
    fileSelection,
    forcedUploadFiles,
    clearFileSelection,
    setPreviewFileDetails,
    changeForcedUploadFiles,
  } = useFilesStore();
  const { shouldShowAuthModal, changeAuthModalVisibility } = useAuthStore();
  const { isDragging } = useGlobalDragAndDrop();
  const wallet = useWallet();
  const { balances, loading: balancesLoading } = useTokenBalances(
    wallet.publicKey?.toString() || "",
  );

  useEffect(() => {
    changeAuthModalVisibility(true);
    setPreviewFileDetails({ fileContent: null, fileId: "", isVisible: false });
    changeForcedUploadFiles(false);
  }, []);

  return (
    <div className="mx-auto flex w-full justify-center">
      <div className="flex h-full w-full max-w-[1250px] items-stretch gap-2">
        <div className="hidden min-w-[250px] px-1 md:block">
          <AddNewFileButton />
          <AppLeftSidenav currentSelected="home" links={sidenavItems} />
        </div>
        <div
          onClick={() => {
            if (fileSelection.filesSelected.length) {
              clearFileSelection();
            }
          }}
          className="mx-auto flex w-[1280px] max-w-full flex-1"
        >
          <div className="h-full w-full">
            {isDragging || forcedUploadFiles ? (
              <>
                <GlobalDnD />
                {forcedUploadFiles && (
                  <Button
                    onClick={() => {
                      changeForcedUploadFiles(false);
                    }}
                    variant="link"
                    className="px-4"
                    size="lg"
                  >
                    Close file uploader
                  </Button>
                )}
              </>
            ) : (
              <>
                <FileDisplayControls
                  balancesLoading={balancesLoading}
                  balances={balances}
                />
                <FileDisplayContentByView
                  balancesLoading={balancesLoading}
                  balances={balances}
                />
              </>
            )}
          </div>
        </div>
        <PreviewFileDetails balances={balances} />
      </div>
      {shouldShowAuthModal && <OnboardingDialog />}
    </div>
  );
};

export { FileDisplayContent };