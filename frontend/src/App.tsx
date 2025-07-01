import { useState, useEffect } from "react";

interface ImageItem {
  url: string;
  filename: string;
  type: "cached" | "no-cache";
}

function App() {
  const [images, setImages] = useState<ImageItem[]>([]);

  const cloudfrontUrl = import.meta.env.VITE_CLOUDFRONT_URL;

  // 画像ファイル名のリスト
  const cachedImageFiles = ["IMG_20250624_134720.jpg"];
  const noCacheImageFiles = ["IMG_20250624_134720.jpg"];

  useEffect(() => {
    const allImages: ImageItem[] = [
      ...cachedImageFiles.map((filename) => ({
        url: `${cloudfrontUrl}/${filename}`,
        filename,
        type: "cached" as const,
      })),
      ...noCacheImageFiles.map((filename) => ({
        url: `${cloudfrontUrl}/no-cache/${filename}`,
        filename,
        type: "no-cache" as const,
      })),
    ];

    setImages(allImages);
  }, []);

  const getTypeBadgeClass = (type: string) => {
    return type === "cached"
      ? "bg-green-500 text-white"
      : "bg-yellow-500 text-gray-800";
  };

  const getTypeLabel = (type: string) => {
    return type === "cached" ? "キャッシュあり" : "キャッシュなし";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          S3 Image Viewer with CloudFront
        </h1>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-gray-200">
            画像一覧
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image, index) => (
              <div
                key={`${image.type}-${image.filename}-${index}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="relative">
                  <div
                    className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold ${getTypeBadgeClass(
                      image.type
                    )} z-10`}
                  >
                    {getTypeLabel(image.type)}
                  </div>
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4 bg-white">
                  <p
                    className="text-sm text-gray-600 text-center"
                    title={image.url}
                  >
                    {image.filename}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
