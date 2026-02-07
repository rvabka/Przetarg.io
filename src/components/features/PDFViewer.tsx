export function PDFViewer() {
  return (
    <div className="bg-white shadow-xl h-full mx-auto max-w-[90%] p-12 text-[12px] text-gray-800 leading-relaxed opacity-95 scale-100 origin-top transform transition-transform duration-700 hover:scale-105 rounded-t-lg mt-8 min-h-[600px]">
      <h3 className="font-bold text-xl mb-6 text-text-main-light">Zapytanie Ofertowe (RFP)</h3>
      <div className="space-y-6">
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="mt-12 mb-6 font-bold text-lg text-text-main-light">3.2 Wymagania Techniczne</div>
      <div className="space-y-6">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="p-4 bg-yellow-100/50 border border-yellow-200 rounded mb-4">
          <div className="h-3 bg-yellow-300 rounded w-2/3"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  )
}
