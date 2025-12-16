import { NextResponse } from "next/server";

// Using Consumer API as fallback since AddressVerification is not enabled for this key
const CONSUMER_ENDPOINT = "https://list.melissadata.net/v1/Consumer/rest/Service.svc/get/zip";

interface RequestBody {
    houseNumber: string;
    street: string;
    city?: string;
    state?: string;
    zip: string;
    sortOrder?: string; // 'all', 'asc', 'desc'
    filterType?: string; // 'all', 'odd', 'even'
}

export async function POST(request: Request) {
    try {
        const body: RequestBody = await request.json();
        const { houseNumber, street, zip, sortOrder, filterType } = body;

        // Basic validation
        if (!houseNumber || !street || !zip) {
            return NextResponse.json(
                { error: "Missing required fields: houseNumber, street, or zip" },
                { status: 400 }
            );
        }

        const apiKey = process.env.MELISSA_LICENSE_KEY;
        if (!apiKey) {
            throw new Error("MELISSA_LICENSE_KEY is not configured");
        }

        // Call Consumer API
        // We request more records to ensure we catch the neighbors (default behavior of this API with 'hno' is proximity)
        const params = new URLSearchParams({
            id: apiKey,
            zip: zip,
            street: street,
            hno: houseNumber,
            records: "100", // Increase record limit to allow for filtering
            format: "json",
            cols: "Name,Phone,Email" // Request explicit details
        });

        const url = `${CONSUMER_ENDPOINT}?${params.toString()}`;

        const res = await fetch(url);
        if (!res.ok) {
            return NextResponse.json({ error: `Consumer API Error: ${res.status}` }, { status: 400 });
        }

        const textData = await res.text();

        // Check for explicit error responses if Melissa returns them in text
        if (textData.includes("<Result>GE05</Result>")) { // Invalid Key
            return NextResponse.json({ error: "Invalid License Key (Consumer)" }, { status: 401 });
        }

        // Parse XML using Regex (Mirrors page.tsx logic)
        const streetRegex = /<Street>(.*?)<\/Street>/g;
        let match;
        const foundHouses: { num: number, count: number, name?: string | null, phone?: string | null, email?: string | null }[] = [];

        // We also want to confirm the target house exists
        let targetFound = false;
        let targetGeo = "";

        while ((match = streetRegex.exec(textData)) !== null) {
            const content = match[1];
            const geoMatch = content.match(/<Geography>(.*?)<\/Geography>/);
            const countMatch = content.match(/<Count>(.*?)<\/Count>/);
            const nameMatch = content.match(/<Name>(.*?)<\/Name>/);
            const phoneMatch = content.match(/<Phone>(.*?)<\/Phone>/);
            const emailMatch = content.match(/<Email>(.*?)<\/Email>/);

            const count = countMatch ? parseInt(countMatch[1], 10) : 0;
            const name = nameMatch ? nameMatch[1] : null;
            const phone = phoneMatch ? phoneMatch[1] : null;
            const email = emailMatch ? emailMatch[1] : null;

            if (geoMatch) {
                const fullGeo = geoMatch[1]; // e.g., "90210-6114"
                // Parse house number from the end
                const parts = fullGeo.split('-');
                const numPart = parts[parts.length - 1];
                const num = parseInt(numPart.replace(/\D/g, ''), 10);

                if (!isNaN(num)) {
                    foundHouses.push({ num, count, name, phone, email });

                    // Check if this is our target
                    if (num === parseInt(houseNumber, 10)) {
                        targetFound = true;
                        targetGeo = fullGeo;
                    }
                }
            }
        }

        if (!targetFound) {
            return NextResponse.json({
                error: "Target address not found in Consumer records",
                debug: { foundCount: foundHouses.length }
            }, { status: 404 });
        }

        const baseNum = parseInt(houseNumber, 10);

        // Filter out the target itself
        let neighbors = foundHouses.filter(n => n.num !== baseNum);

        // Apply Filters (Odd/Even)
        if (filterType === 'odd') {
            neighbors = neighbors.filter(n => n.num % 2 !== 0);
        } else if (filterType === 'even') {
            neighbors = neighbors.filter(n => n.num % 2 === 0);
        }

        // Apply Sort Order
        if (sortOrder === 'asc') {
            neighbors.sort((a, b) => a.num - b.num);
        } else if (sortOrder === 'desc') {
            neighbors.sort((a, b) => b.num - a.num);
        } else {
            // Default: Distance to target
            neighbors.sort((a, b) => Math.abs(a.num - baseNum) - Math.abs(b.num - baseNum));
        }

        // Limit to 20 closest neighbors (after filtering/sorting)
        // If sorting by number, taking the slice after sort gives the lowest/highest numbers? 
        // Actually usually "Nearest" implies distance, but if I sort ASC, I probably want the sequence.
        // Let's just slice the top 20 of the sorted list.
        neighbors = neighbors.slice(0, 20);

        // Map to response format
        const mappedNeighbors = neighbors.map(n => ({
            address: `${n.num} ${street}`,
            count: n.count,
            name: n.name,
            phone: n.phone,
            email: n.email
        }));

        return NextResponse.json({
            validatedAddress: `${houseNumber} ${street}`, // Best effort from input
            zipPlus4: targetGeo,
            neighbors: mappedNeighbors
        });

    } catch (error: unknown) {
        console.error("Fallback Handler Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Internal Server Error: ${errorMessage}` },
            { status: 500 }
        );
    }
}
