import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface BarcodeScannerModalProps {
    show: boolean;
    onClose: () => void;
    onScan: (decodedText: string) => void;
}

const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ show, onClose, onScan }) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (show) {
            // Small timeout to ensure DOM is ready
            const timeoutId = setTimeout(() => {
                if (!scannerRef.current) {
                    const scanner = new Html5QrcodeScanner(
                        "reader",
                        { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
                    );

                    scanner.render(
                        (decodedText) => {
                            onScan(decodedText);
                            // Optional: Close on first successful scan
                            // onClose(); 
                            // Or let user control close, but usually we want to stop after one scan
                            scanner.clear().catch(console.error);
                            onClose();
                        },
                        (errorMessage) => {
                            // scan failure, usually better to ignore
                            // console.log(errorMessage);
                        }
                    );
                    scannerRef.current = scanner;
                }
            }, 100);

            return () => clearTimeout(timeoutId);
        } else {
            // Cleanup if modal closes
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        }
    }, [show, onScan, onClose]);

    // Handle unmount cleanup
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, []);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 z-10"
                >
                    <X size={24} />
                </button>

                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Escanear Código</h3>

                <div id="reader" className="w-full overflow-hidden rounded-lg"></div>

                <p className="text-sm text-gray-500 text-center mt-4">
                    Apunta la cámara al código de barras.
                </p>
            </div>
        </div>
    );
};

export default BarcodeScannerModal;
