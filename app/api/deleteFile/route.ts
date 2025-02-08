// app/api/deleteFile/route.ts
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";

// Configure Cloudinary using environment variables
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json();
    console.log("Received file URL for deletion:", url);

    // Extract the public ID from the Cloudinary URL
    const extractPublicId = (url: string) => {
      const regex = /\/upload\/(.*?)(\.[a-zA-Z0-9]+)$/;
      const match = url.match(regex);
      return match ? match[1] : null;
    };

    const publicId = extractPublicId(url);
    if (!publicId) {
      return new NextResponse("Invalid Cloudinary URL", { status: 400 });
    }

    // Delete file from Cloudinary
    const result = await cloudinary.v2.uploader.destroy(publicId);

    if (result.result === "ok") {
      console.log("File deleted successfully");
      return new NextResponse("File deleted successfully", { status: 200 });
    } else {
      console.error("Failed to delete file:", result);
      return new NextResponse("Failed to delete file", { status: 500 });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return new NextResponse("Error deleting file", { status: 500 });
  }
}
