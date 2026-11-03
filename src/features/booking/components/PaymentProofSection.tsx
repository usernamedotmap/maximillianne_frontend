import { useEffect, useRef, useState } from "react";
import { FileUp, Image, X } from "lucide-react";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type PaymentProofSectionProps = {
  file: File | null;
  error?: string;
  disabled: boolean;
  onFileChange: (file: File | null) => void;
  onError: (message: string) => void;
};

export function PaymentProofSection({
  file,
  error,
  disabled,
  onFileChange,
  onError,
}: PaymentProofSectionProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [isDragging, setIsDragging] = useState(false);


  useEffect(() => {
    if (!file) {
      setPreviewUrl(undefined);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const selectFile = (selected?: File) => {
    if (!selected) return;
    if (!ALLOWED_FILE_TYPES.has(selected.type)) {
      onFileChange(null);
      onError("Choose a JPEG, PNG, or WebP image.");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    if (selected.size > MAX_FILE_SIZE_BYTES) {
      onFileChange(null);
      onError("The image must be 5 MB or smaller.");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    onFileChange(selected);
    onError("");
  };

  const removeFile = () => {
    onFileChange(null);
    onError("");
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div>
        <h2 className="font-serif text-lg font-bold">Submit payment proof</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a screenshot of your completed transfer.
        </p>
      </div>

      <div>
        <label htmlFor="payment-proof" className="mb-2 block text-xs font-semibold">
          Receipt image <span className="text-destructive">*</span>
        </label>
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInput.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            selectFile(event.dataTransfer.files[0]);
          }}
          aria-describedby={error ? "payment-proof-error" : "payment-proof-help"}
          className={`w-full rounded-xl border-2 border-dashed p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isDragging
              ? "border-primary bg-secondary/50"
              : "border-border hover:border-primary/60"
          }`}
        >
          {previewUrl ? (
            <span className="flex items-center gap-4">
              <img
                src={previewUrl}
                alt="Preview of payment receipt"
                className="h-20 w-20 rounded-lg border border-border object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {file?.name}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Preview · click to replace
                </span>
              </span>
              <Image className="size-5 shrink-0 text-primary" aria-hidden="true" />
            </span>
          ) : (
            <span className="flex flex-col items-center py-3 text-center">
              <FileUp className="mb-2 size-6 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">
                Drop receipt here or browse
              </span>
              <span
                id="payment-proof-help"
                className="mt-1 text-xs text-muted-foreground"
              >
                JPEG, PNG, or WebP · up to 5 MB
              </span>
            </span>
          )}
        </button>
        <input
          ref={fileInput}
          id="payment-proof"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          className="sr-only"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
        {file && !disabled && (
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={removeFile}
          >
            <X className="size-3" aria-hidden="true" />
            Remove image
          </button>
        )}
        {error && (
          <p
            id="payment-proof-error"
            className="mt-2 text-xs text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
