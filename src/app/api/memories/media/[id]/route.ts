import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { isGalleryAuthenticated } from "@/lib/memories-auth";
import { resolveSafeMediaPath, getWebFriendlyImage } from "@/lib/memories-media";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Enforce Server-Side Authentication
  const authenticated = await isGalleryAuthenticated();
  if (!authenticated) {
    return NextResponse.json(
      { error: "Unauthorized access to private memories" },
      {
        status: 401,
        headers: {
          "Cache-Control": "private, no-store, max-age=0, must-revalidate",
        },
      }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing media ID" }, { status: 400 });
  }

  // 2. Strictly resolve and validate file within private directory
  const safeMedia = resolveSafeMediaPath(id);
  if (!safeMedia) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const { filePath } = safeMedia;
  const ext = path.extname(filePath).toLowerCase();
  const isThumb = req.nextUrl.searchParams.get("thumb") === "1";

  try {
    const isVideo = ext === ".mp4" || ext === ".mov" || ext === ".webm";

    if (!isVideo) {
      // 3. Process & Serve Web-friendly Image (Handles HEIC conversion, JPEG/PNG/WebP, resizing for thumbs)
      const { buffer, contentType } = await getWebFriendlyImage(filePath, isThumb);

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": buffer.length.toString(),
          "Cache-Control": "private, no-store, max-age=0, must-revalidate",
        },
      });
    }

    // 4. Stream Video with Range Requests Support (Essential for Safari, iPhone, and Seeking)
    const stat = await fs.promises.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.get("range");

    let mimeType = "video/mp4";
    if (ext === ".mov") {
      mimeType = "video/quicktime";
    } else if (ext === ".webm") {
      mimeType = "video/webm";
    }

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 5 * 1024 * 1024, fileSize - 1); // 5MB chunk
      const chunkSize = end - start + 1;

      const fileStream = fs.createReadStream(filePath, { start, end });
      const webStream = Readable.toWeb(fileStream) as ReadableStream;

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": mimeType,
          "Cache-Control": "private, no-store, max-age=0, must-revalidate",
        },
      });
    } else {
      const fileStream = fs.createReadStream(filePath);
      const webStream = Readable.toWeb(fileStream) as ReadableStream;

      return new NextResponse(webStream, {
        status: 200,
        headers: {
          "Content-Length": fileSize.toString(),
          "Content-Type": mimeType,
          "Accept-Ranges": "bytes",
          "Cache-Control": "private, no-store, max-age=0, must-revalidate",
        },
      });
    }
  } catch (err) {
    console.error("Error streaming private media:", err);
    return NextResponse.json(
      { error: "Could not stream media" },
      { status: 500 }
    );
  }
}
