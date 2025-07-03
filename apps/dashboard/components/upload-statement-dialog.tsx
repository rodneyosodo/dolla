"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { CirclePlus, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { uploadStatement } from "@/lib/api";

interface UploadStatementDialogProps {
  onUploadComplete?: () => void;
}

export function UploadStatementDialog({
  onUploadComplete,
}: UploadStatementDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [statementType, setStatementType] = useState<"mpesa" | "imbank">(
    "mpesa",
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast("Invalid file type", {
          description: "Please select a PDF file.",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast("No file selected", {
        description: "Please select a file to upload.",
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadStatement(file, statementType);
      toast("Upload successful", {
        description:
          "Your statement has been processed successfully. Transactions have been imported.",
      });
      setOpen(false);
      setFile(null);
      onUploadComplete?.();
    } catch (error) {
      toast("Upload failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while uploading the statement.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CirclePlus className="h-4 w-4 mr-2" />
          Upload Statement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Statement</DialogTitle>
          <DialogDescription>
            Upload your M-Pesa or bank statement to automatically import
            transactions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="statement-type" className="text-right">
              Type
            </Label>
            <Select
              value={statementType}
              onValueChange={(value: "mpesa" | "imbank") =>
                setStatementType(value)
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select statement type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mpesa">M-Pesa Statement</SelectItem>
                <SelectItem value="imbank" disabled>
                  I&M Bank Statement (Coming Soon)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              File
            </Label>
            <div className="col-span-3">
              <Input
                id="file"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {file && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Process
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
