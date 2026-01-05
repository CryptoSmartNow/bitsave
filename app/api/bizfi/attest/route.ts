import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import BizFiABI from "@/app/abi/BizFi.json";
import { getDatabase } from "@/lib/mongodb";

const BIZFI_PROXY_ADDRESS = "0x7C24A938e086d01d252f1cde36783c105784c770";

export async function POST(req: NextRequest) {
    let businessId, recipient;
    try {
        const body = await req.json();
        businessId = body.businessId;
        recipient = body.recipient;
        const { verificationData, transactionHash } = body;

        if (!businessId || !recipient || !verificationData) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const privateKey = process.env.REFERRAL_SIGNER_PRIVATE_KEY;
        if (!privateKey) {
            console.error("REFERRAL_SIGNER_PRIVATE_KEY is not set");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Initialize provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org");
        const signer = new ethers.Wallet(privateKey, provider);
        const bizfiContract = new ethers.Contract(BIZFI_PROXY_ADDRESS, BizFiABI, signer);

        // 1. Hash the verification data
        const dataString = JSON.stringify(verificationData);
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes(dataString));

        // 2. Prepare attestation parameters
        const attestationType = 0; // GENERAL_INFO
        const expirationTime = 0; // Never expires

        console.log(`Creating attestation for Business #${businessId} (Owner: ${recipient})...`);

        // 3. Create attestation
        const tx = await bizfiContract.createAttestation(
            businessId,
            attestationType,
            dataHash,
            recipient,
            expirationTime
        );

        console.log("Attestation tx submitted:", tx.hash);
        const receipt = await tx.wait();

        // 4. Extract EAS UID from logs
        let easUid = null;
        let attestationId = null;

        const iface = new ethers.Interface(BizFiABI);

        for (const log of receipt.logs) {
            try {
                const parsed = iface.parseLog(log);
                if (parsed && parsed.name === "AttestationCreated") {
                    attestationId = parsed.args.attestationId.toString();
                    easUid = parsed.args.easUid;
                    break;
                }
            } catch (e) {
                // Ignore logs that don't match
            }
        }

        if (!easUid) {
            throw new Error("Failed to retrieve EAS UID from transaction logs");
        }

        // 5. Update Database with Attestation UID
        if (transactionHash) {
            try {
                const db = await getDatabase();
                if (db) {
                    await db.collection("businesses").updateOne(
                        { transactionHash: transactionHash },
                        {
                            $set: {
                                attestationUid: easUid,
                                attestationId: attestationId,
                                businessId: businessId.toString()
                            }
                        }
                    );
                    console.log(`Updated business record for tx ${transactionHash} with UID ${easUid}`);
                }
            } catch (dbErr) {
                console.error("Failed to update business record with attestation:", dbErr);
                // We don't fail the request if DB update fails, as consistent on-chain state is more important
            }
        }

        return NextResponse.json({
            success: true,
            attestationId,
            easUid,
            transactionHash: receipt.hash
        });

    } catch (error: any) {
        const timestamp = new Date().toISOString();
        console.error(`[Attestation API Error] ${timestamp} | Context: Create Attestation (Business ID: ${businessId || 'unknown'})`);
        console.error(`[Attestation API Error] Details:`, error);

        return NextResponse.json({
            error: error.message || "Failed to create attestation",
            details: error.toString()
        }, { status: 500 });
    }
}
