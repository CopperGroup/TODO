// app/api/deleteFile/route.ts
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";

// Configure Cloudinary using environment variables
cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req: NextRequest) {
  try {
    const { urls } = await req.json();
    console.log("Received file URLs for deletion:", urls);

    if (!Array.isArray(urls) || urls.length === 0) {
      return new NextResponse("No URLs provided", { status: 400 });
    }

    // Extract public IDs from Cloudinary URLs
    const extractPublicId = (url: string) => {
      const regex = /\/([^/]+)(?=\.[a-zA-Z0-9]+$)/;
      const match = url.match(regex);
      return match ? match[1] : null;
    };

    const publicIds = urls.map(extractPublicId).filter(Boolean);

    if (publicIds.length === 0) {
      return new NextResponse("No valid Cloudinary URLs provided", { status: 400 });
    }

    // Delete multiple files sequentially
    const deletionResults = await Promise.all(
      publicIds.map((publicId) => cloudinary.v2.uploader.destroy(publicId as string))
    );

    const failedDeletions = deletionResults.filter((result) => result.result !== "ok");

    if (failedDeletions.length > 0) {
      console.error("Some files failed to delete:", failedDeletions);
      return new NextResponse("Some files failed to delete", { status: 500 });
    }

    console.log("All files deleted successfully");
    return new NextResponse("All files deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting files:", error);
    return new NextResponse("Error deleting files", { status: 500 });
  }
}
