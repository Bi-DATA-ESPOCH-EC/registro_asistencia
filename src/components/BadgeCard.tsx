import { useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';

const BadgeCard = () => {
  const { user, profile } = useAuth();
  const badgeRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    const element = badgeRef.current;
    if (!element || !profile || !profile.nombres || !profile.apellidos) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF();
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    const fileName = `gafete-${profile.nombres}_${profile.apellidos}.pdf`;
    pdf.save(fileName);
  };

  if (!user || !profile) {
    return null;
  }

  const qrValue = `USER:${user.id}`;
  const fullName = `${profile.nombres || ''} ${profile.apellidos || ''}`.trim();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4 text-center">Mi Gafete Digital</h3>
      
      {/* Badge for display */}
      <div className="w-full max-w-xs mx-auto border border-gray-200 rounded-lg p-4 text-center">
        <h4 className="font-bold text-lg">{fullName}</h4>
        <p className="text-sm text-gray-500">{profile.carreras?.nombre || 'Carrera no asignada'}</p>
        <div className="my-4 flex justify-center">
          <QRCodeCanvas value={qrValue} size={128} />
        </div>
        <p className="text-xs text-gray-400">ID: {user.id}</p>
      </div>

      {/* Hidden badge for PDF generation */}
      <div className="absolute -z-10 -left-[9999px] top-0">
          <div ref={badgeRef} className="w-[400px] p-4 bg-white">
            <div className="text-center border-2 border-black p-4">
                <h2 className="font-bold text-2xl text-black">EVENTO ASISTENCIA</h2>
                <div className="my-4 flex justify-center">
                    <QRCodeCanvas value={qrValue} size={200} />
                </div>
                <h3 className="font-bold text-xl text-black">{fullName}</h3>
                <p className="text-lg text-black">{profile.carreras?.nombre || ''}</p>
                <p className="text-md text-gray-700">{profile.facultades?.nombre || ''}</p>
            </div>
          </div>
      </div>

      <button
        onClick={handleDownload}
        className="w-full mt-4 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <Download className="w-4 h-4 mr-2" />
        Descargar Gafete
      </button>
    </div>
  );
};

export default BadgeCard;