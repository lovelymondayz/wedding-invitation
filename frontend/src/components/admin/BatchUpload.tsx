import { FC, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { compressImages } from '../../utils/compressImage';

interface BatchUploadProps {
  coupleSlug: string;
  onUploaded: () => void;
}

export const BatchUpload: FC<BatchUploadProps> = ({ coupleSlug, onUploaded }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
    if (arr.length === 0) {
      toast.error('Please select image files only');
      return;
    }
    if (arr.length > 10) {
      toast.error('Maximum 10 images per upload');
      return;
    }
    setFiles(arr);
    setPreviews(arr.map(f => URL.createObjectURL(f)));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    try {
      // Compress images
      setProgress({ current: 0, total: files.length });
      const compressed = await compressImages(files, (current, total) => {
        setProgress({ current, total });
      });

      // Build form data
      const formData = new FormData();
      compressed.forEach(f => formData.append('images', f));

      // Upload
      const res = await fetch(`/api/admin/couples/${coupleSlug}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        const successCount = data.results?.filter((r: any) => !r.error).length || 0;
        const failCount = data.results?.filter((r: any) => r.error).length || 0;
        if (successCount > 0) toast.success(`${successCount} image(s) uploaded!`);
        if (failCount > 0) toast.error(`${failCount} failed`);
        setFiles([]);
        setPreviews([]);
        onUploaded();
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('Upload failed');
    }
    setUploading(false);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver ? 'border-primary bg-primary/5' : 'border-primary/30 hover:border-primary/60'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="text-4xl mb-2">📷</div>
        <p className="text-text-muted text-sm">
          Drag & drop images here, or <span className="text-primary font-medium">browse</span>
        </p>
        <p className="text-text-muted text-xs mt-1">Up to 10 images, 5MB each (auto-compressed)</p>
      </div>

      {/* Previews */}
      <AnimatePresence>
        {previews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {previews.map((src, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group aspect-square rounded-xl overflow-hidden bg-surface-alt"
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 text-surface rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Upload button */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary"
              >
                {uploading ? `Compressing ${progress.current}/${progress.total}...` : `Upload ${files.length} Image${files.length > 1 ? 's' : ''}`}
              </button>
              <button
                onClick={() => { setFiles([]); setPreviews([]); }}
                className="btn-outline text-sm"
                disabled={uploading}
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
