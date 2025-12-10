import BizFiProviders from "./BizFiProviders";
import "./bizfi-colors.css";

export default function BizFiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <BizFiProviders>
            {children}
        </BizFiProviders>
    );
}
