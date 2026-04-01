import { NextResponse } from 'next/server';

/**
 * Server-side proxy for Appwrite storage files.
 * This bypasses CORS restrictions by fetching the file on the server
 * and serving it from the same origin as the app.
 */
export async function GET(request, { params }) {
    const { fileId } = await params;
    
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const bucketId = 'inquiry_files';

    const url = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;

    try {
        const response = await fetch(url, {
            headers: {
                'x-appwrite-project': projectId,
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Appwrite returned ${response.status}` },
                { status: response.status }
            );
        }

        const contentType = response.headers.get('content-type') || 'image/png';
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Storage proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch file from storage' },
            { status: 500 }
        );
    }
}
