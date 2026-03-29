import BizFiProviders from "./BizFiProviders";
import "./bizfi-colors.css";
import BizFiAIWidget from "@/components/BizFiAIWidget";

export default function BizFiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <BizFiProviders>
            {children}
            <BizFiAIWidget />
        </BizFiProviders>
    );
}
