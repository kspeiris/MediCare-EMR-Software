import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) return;

  let clone: HTMLElement | null = null;
  try {
    clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '-9999px';
    clone.style.display = 'block';

    clone.style.setProperty('display', 'block', 'important');
    clone.classList.remove('hidden');

    if (element.clientWidth) {
      clone.style.width = `${element.clientWidth}px`;
    } else {
      clone.style.width = '800px';
    }

    document.body.appendChild(clone);

    const canvasResult = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const style = clonedDoc.createElement('style');
        style.textContent = `
          #${elementId}, #${elementId} * {
            color: #0f172a !important;
            background-color: transparent;
            border-color: #cbd5e1 !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }

          #${elementId} {
            background: #ffffff !important;
          }

          #${elementId} .bg-sky-600,
          #${elementId} .bg-sky-500,
          #${elementId} .bg-sky-50,
          #${elementId} .bg-slate-50,
          #${elementId} .bg-slate-100,
          #${elementId} .bg-white,
          #${elementId} .bg-red-100,
          #${elementId} .bg-red-50,
          #${elementId} .bg-emerald-50,
          #${elementId} .bg-amber-50 {
            background-color: #ffffff !important;
          }

          #${elementId} img {
            max-width: 100%;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    const imgData = canvasResult.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvasResult.width;
    const imgHeight = canvasResult.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    if (clone && clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }
  }
};

export const triggerPrint = (): void => {
  window.print();
};
