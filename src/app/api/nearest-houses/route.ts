import { NextResponse } from "next/server";

// Using Consumer API as fallback since AddressVerification is not enabled for this key
const CONSUMER_ENDPOINT = "https://list.melissadata.net/v1/Consumer/rest/Service.svc/get/zip";

interface RequestBody {
    houseNumber: string;
    street: string;
    city?: string;
    state?: string;
    zip: string;
}

export async function POST(request: Request) {
    try {
        const body: RequestBody = await request.json();
        const { houseNumber, street, zip } = body;

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
            records: "50", // Fetch enough to find neighbors
            format: "json",
            cols: "Name,Phone,Email" // Request explicit details
        });

        // Note: page.tsx doesn't use format=json in the URL actually? 
        // Wait, page.tsx line 84: params.append('format', 'json');
        // But then it calls response.text() and uses regex <Street>...?
        // This implies the 'json' format might be wrapped or the user code is handling XML manually?
        // Let's stick to the text/regex parsing which is proven to work in page.tsx.

        const url = `${CONSUMER_ENDPOINT}?${params.toString()}`;

        // console.log("Fetching fallback:", url); // Debug

        const res = await fetch(url);
        if (!res.ok) {
            // If 404 here, it really means something is wrong with the parameters or key permissions even for Consumer.
            // But we know Consumer works for this key.
            return NextResponse.json({ error: `Consumer API Error: ${res.status}` }, { status: 400 });
        }

        const textData = await res.text();

        // Check for explicit error responses if Melissa returns them in text
        if (textData.includes("<Result>GE05</Result>")) { // Invalid Key
            return NextResponse.json({ error: "Invalid License Key (Consumer)" }, { status: 401 });
        }

        // Parse XML using Regex (Mirrors page.tsx logic)
        // We are looking for structure: <Street>...<Geography>Zip-House#</Geography>...<Count>N</Count>...</Street>
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

        console.log("Debug Houses:", JSON.stringify(foundHouses.slice(0, 50))); // Log first 50
        console.log("Target:", parseInt(houseNumber, 10));

        if (!targetFound) {
            // If target not in list, maybe it doesn't exist?
            // Or maybe the API returned strange data.
            // We can gracefully return an error or just say no neighbors found.
            // For "Nearest House Lookup", if target doesn't exist, we can't find its neighbors relative to it.
            return NextResponse.json({
                error: "Target address not found in Consumer records",
                debug: { foundCount: foundHouses.length }
            }, { status: 404 });
        }

        // Logic for neighbor generation
        // Instead of fixed offsets (which fail on irregular streets), 
        // we return the closest surrounding neighbors found in the live record set.
        const baseNum = parseInt(houseNumber, 10);

        // Filter out the target itself and sort by distance to target
        const neighbors = foundHouses
            .filter(n => n.num !== baseNum)
            .sort((a, b) => Math.abs(a.num - baseNum) - Math.abs(b.num - baseNum))
            .slice(0, 20) // Return top 20 closest neighbors
            .map(n => ({
                address: `${n.num} ${street}`,
                count: n.count,
                name: n.name,
                phone: n.phone,
                email: n.email
            }));

        return NextResponse.json({
            validatedAddress: `${houseNumber} ${street}`, // Best effort from input
            zipPlus4: targetGeo,
            neighbors: neighbors
        });

    } catch (error: unknown) {
        console.error("Fallback Handler Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
