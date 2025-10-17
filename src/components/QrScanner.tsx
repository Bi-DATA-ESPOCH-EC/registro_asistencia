
import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

const QrScanner = ({ onScanSuccess }: QrScannerProps) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader', 
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    const handleSuccess = (decodedText: string, decodedResult: any) => {
        scanner.clear();
        onScanSuccess(decodedText);
    }

    const handleError = (error: any) => {
      // console.warn(`QR error = ${error}`);
    }

    scanner.render(handleSuccess, handleError);

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5-qrcode-scanner.", error);
      });
    };
  }, [onScanSuccess]);

  return <div id="qr-reader" className="w-full md:w-[500px]" />;
};

export default QrScanner;
