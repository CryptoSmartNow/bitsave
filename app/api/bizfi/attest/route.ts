
import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import BizFiABI from "@/app/abi/BizFi.json";

const BIZFI_PROXY_ADDRESS = "0x7C24A938e086d01d252f1cde36783c105784c770";

export async function POST(req: NextRequest) {
    try {
        const { businessId, recipient, verificationData } = await req.json();

        if (!businessId || !recipient || !verificationData) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const privateKey = process.env.REFERRAL_SIGNER_PRIVATE_KEY;
        if (!privateKey) {
            console.error("REFERRAL_SIGNER_PRIVATE_KEY is not set");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Initialize provider and signer
        // Using Base Mainnet RPC widely available or fallback to a standard one if env not set
        // ideally should use process.env.NEXT_PUBLIC_RPC_URL or similar if available
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org");
        const signer = new ethers.Wallet(privateKey, provider);
        const bizfiContract = new ethers.Contract(BIZFI_PROXY_ADDRESS, BizFiABI, signer);

        // 1. Hash the verification data
        // Removing circular references if any, though likely simple JSON
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
        // We look for the AttestationCreated event
        // event AttestationCreated(uint256 indexed attestationId, uint256 indexed businessId, bytes32 indexed easUid, AttestationType attestationType, address attestor);

        let easUid = null;
        let attestationId = null;

        // Use the interface to parse logs
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

        return NextResponse.json({
            success: true,
            attestationId,
            easUid,
            transactionHash: receipt.hash
        });

    } catch (error: any) {
        console.error("Attestation failed:", error);
        return NextResponse.json({
            error: error.message || "Failed to create attestation",
            details: error.toString()
        }, { status: 500 });
    }
}
