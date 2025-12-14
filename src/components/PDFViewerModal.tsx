import React from 'react';
import { X } from 'lucide-react';

interface PDFViewerModalProps {
    show: boolean;
    onClose: () => void;
    pdfUrl: string;
    title?: string;
}

const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ show, onClose, pdfUrl, title = 'Documento' }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] shadow-xl overflow-hidden flex flex-col animate-scaleIn">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 bg-gray-100 p-4 relative">
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full rounded-lg border border-gray-200 bg-white"
                        title="PDF Viewer"
                    />
                </div>
            </div>
        </div>
    );
};

export default PDFViewerModal;
