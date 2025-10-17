
import { useState } from 'react';
import QrScanner from '../components/QrScanner';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function Scanner() {
  const [isScanning, setIsScanning] = useState(true);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleScanSuccess = async (decodedText: string) => {
    setIsScanning(false);
    const toastId = toast.loading('Procesando QR...');

    if (!decodedText.startsWith('USER:')) {
      toast.error('Código QR no válido.', { id: toastId });
      setLastResult({ success: false, message: 'Código QR no válido.' });
      return;
    }

    const userId = decodedText.split(':')[1];

    try {
      const { data, error } = await supabase.rpc('register_attendance', { p_user_id: userId });

      if (error) {
        throw new Error(error.message);
      }

      if (data.status === 'success') {
        toast.success(data.message, { id: toastId });
        setLastResult({ success: true, message: data.message });
      } else {
        toast.error(data.message, { id: toastId });
        setLastResult({ success: false, message: data.message });
      }

    } catch (err: any) {
      toast.error(`Error: ${err.message}`, { id: toastId });
      setLastResult({ success: false, message: `Error: ${err.message}` });
    }
  };

  const handleNewScan = () => {
    setIsScanning(true);
    setLastResult(null);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Escanear Código QR</h2>
      {isScanning ? (
        <div className="flex justify-center">
            <QrScanner onScanSuccess={handleScanSuccess} />
        </div>
      ) : (
        <div className="text-center">
            <div className={`p-4 rounded-md ${lastResult?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <p className="font-semibold">{lastResult?.message}</p>
            </div>
            <button onClick={handleNewScan} className="mt-4 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">
                Escanear de nuevo
            </button>
        </div>
      )}
       <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <p className="font-bold">Acción Requerida</p>
        <p>Asegúrate de haber creado la función <code>register_attendance</code> en tu base de datos Supabase. El código SQL necesario está en el archivo <code>README.md</code>.</p>
      </div>
    </div>
  );
}
