import { Cancel01Icon, CheckmarkCircle02Icon, Delete02Icon, PaintBoardIcon } from "hugeicons-react";
import { useState, useRef } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatDoodleProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (dataUrl: string) => void;
}

export default function ChatDoodle({ isOpen, onClose, onSend }: ChatDoodleProps) {
    const canvasRef = useRef<any>(null);
    const [color, setColor] = useState("#81D7B4");
    const [brushRadius, setBrushRadius] = useState(2);

    const handleClear = () => {
        canvasRef.current?.clear();
    };

    const handleSend = () => {
        const dataUrl = canvasRef.current?.getDataURL('png', false, '#0F1825');
        if (dataUrl) {
            onSend(dataUrl);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070A0F]/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0F1825] border border-[#7B8B9A]/20 rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-[#7B8B9A]/15 flex items-center justify-between">
                            <h3 className="font-bold text-sm text-[#F9F9FB] flex items-center gap-2">
                                <PaintBoardIcon className="w-4 h-4 text-[#81D7B4]" />
                                Draw / Attest Signature
                            </h3>
                            <button 
                                onClick={onClose} 
                                className="p-1 rounded-lg text-[#7B8B9A] hover:text-[#F9F9FB] hover:bg-[#1A2538]"
                            >
                                <Cancel01Icon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Canvas Area */}
                        <div className="flex-1 bg-[#0A0E14] relative flex justify-center items-center overflow-hidden cursor-crosshair p-2 min-h-[300px]">
                            <CanvasDraw
                                ref={canvasRef}
                                brushColor={color}
                                brushRadius={brushRadius}
                                lazyRadius={0}
                                canvasWidth={450}
                                canvasHeight={320}
                                backgroundColor="#0A0E14"
                                hideGrid={true}
                                className="touch-none rounded-xl"
                            />
                        </div>

                        {/* Controls */}
                        <div className="p-4 bg-[#1A2538]/40 border-t border-[#7B8B9A]/15 space-y-3">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    {['#81D7B4', '#F9F9FB', '#EF4444', '#F59E0B', '#3B82F6'].map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer ${
                                                color === c ? 'border-white scale-110' : 'border-transparent'
                                            }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-[#7B8B9A] font-semibold">Size</span>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={brushRadius}
                                        onChange={(e) => setBrushRadius(parseInt(e.target.value))}
                                        className="w-16 h-1 bg-[#0F1825] rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-1">
                                <button
                                    onClick={handleClear}
                                    className="px-3.5 py-2 rounded-xl text-[#7B8B9A] hover:bg-[#1A2538] hover:text-red-400 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                                >
                                    <Delete02Icon className="w-3.5 h-3.5" />
                                    Clear
                                </button>
                                <button
                                    onClick={handleSend}
                                    className="px-4 py-2 bg-[#81D7B4] hover:bg-[#9FE0C5] text-[#0F1825] rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
                                >
                                    <CheckmarkCircle02Icon className="w-4 h-4" />
                                    Attach Signature
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
