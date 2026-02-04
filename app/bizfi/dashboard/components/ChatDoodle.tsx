import { useState, useRef } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiCheck, HiOutlineTrash, HiOutlinePencil, HiOutlineColorSwatch } from 'react-icons/hi';

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
        // Get data URL from canvas
        // Note: CanvasDraw doesn't have a direct getDataUrl, we need to access the canvas element
        // But CanvasDraw ref exposes getDataURL method in newer versions or we can use the canvas container
        const dataUrl = canvasRef.current?.getDataURL('png', false, '#1A2538'); // background color matching theme
        if (dataUrl) {
            onSend(dataUrl);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-[#1A2538] border border-[#7B8B9A]/20 rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-[#7B8B9A]/20 flex items-center justify-between">
                            <h3 className="font-bold text-[#F9F9FB] flex items-center gap-2">
                                <HiOutlinePencil className="w-5 h-5 text-[#81D7B4]" />
                                Signature
                            </h3>
                            <button onClick={onClose} className="text-[#9BA8B5] hover:text-[#F9F9FB]">
                                <HiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Canvas Area */}
                        <div className="flex-1 bg-[#0F1825] relative flex justify-center items-center overflow-hidden cursor-crosshair">
                            <CanvasDraw
                                ref={canvasRef}
                                brushColor={color}
                                brushRadius={brushRadius}
                                lazyRadius={0}
                                canvasWidth={500}
                                canvasHeight={400}
                                backgroundColor="#0F1825"
                                hideGrid={true}
                                className="touch-none"
                            />
                        </div>

                        {/* Controls */}
                        <div className="p-4 bg-[#1A2538] border-t border-[#7B8B9A]/20 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    {/* Colors */}
                                    {['#81D7B4', '#F9F9FB', '#EF4444', '#F59E0B', '#3B82F6'].map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                                                color === c ? 'border-white scale-110' : 'border-transparent'
                                            }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[#9BA8B5]">Size</span>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={brushRadius}
                                        onChange={(e) => setBrushRadius(parseInt(e.target.value))}
                                        className="w-20 h-1 bg-[#0F1825] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#81D7B4]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <button
                                    onClick={handleClear}
                                    className="px-4 py-2 rounded-xl text-[#9BA8B5] hover:bg-[#7B8B9A]/10 hover:text-[#EF4444] transition-colors flex items-center gap-2 text-sm font-medium"
                                >
                                    <HiOutlineTrash className="w-4 h-4" />
                                    Clear
                                </button>
                                <button
                                    onClick={handleSend}
                                    className="px-6 py-2 bg-[#81D7B4] text-[#0F1825] rounded-xl font-bold hover:bg-[#6BC4A0] transition-colors flex items-center gap-2 shadow-lg shadow-[#81D7B4]/20"
                                >
                                    <HiCheck className="w-5 h-5" />
                                    Send Signature
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
