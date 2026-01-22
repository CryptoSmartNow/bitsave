import { HiOutlineInbox } from "react-icons/hi2";

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ElementType;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({
    title = "No Data Available",
    description = "There is no information to display at this time.",
    icon: Icon = HiOutlineInbox,
    actionLabel,
    onAction
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-900/30 border border-gray-800 rounded-2xl h-full min-h-[200px]">
            <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">
                {title}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
                {description}
            </p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-4 py-2 text-sm font-medium text-[#111827] bg-[#81D7B4] rounded-lg hover:bg-[#6bcb9f] transition-colors"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
