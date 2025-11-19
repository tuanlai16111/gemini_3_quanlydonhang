import React, { useState, useRef } from 'react';
import { parseOrdersFromText } from '../services/geminiService';
import { Order } from '../types';
import { 
  FileSpreadsheet, 
  Loader2, 
  ArrowRight, 
  Database, 
  CheckCircle, 
  Download, 
  UploadCloud, 
  RefreshCw,
  FileText
} from 'lucide-react';

interface DataImportProps {
  onImportSuccess: (newOrders: Order[]) => void;
}

const DataImport: React.FC<DataImportProps> = ({ onImportSuccess }) => {
  const [activeMethod, setActiveMethod] = useState<'file' | 'drive' | 'text'>('file');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Order[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Drive Simulation State
  const [driveLink, setDriveLink] = useState('');
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);

  // --- 1. Template & File Handling ---

  const handleDownloadTemplate = () => {
    // Create a simple CSV template content in English to avoid encoding/font issues
    const csvContent = "Customer Name,Phone Number,Delivery Address,Product Description,COD Amount\nJohn Doe,0901234567,123 Le Loi Dist 1 HCMC,Sneakers size 42,1500000\nJane Smith,0987654321,456 Nguyen Trai Hanoi,Fragile Cosmetics Set,2000000";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'FastShip_Order_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content); // Set text to be analyzed by Gemini
      // Auto trigger analysis for files
      setTimeout(() => handleAnalyze(content), 500);
    };
    reader.readAsText(file);
  };

  // --- 2. Google Drive Logic (Simulated) ---

  const handleDriveSync = () => {
    if (!driveLink) {
      setError("Vui lòng nhập link Google Sheet hoặc Google Drive.");
      return;
    }
    setIsSyncingDrive(true);
    setError(null);

    // Simulation of fetching data from Drive API
    setTimeout(() => {
      setIsSyncingDrive(false);
      // Mock data that would come from Drive
      const mockDriveData = `
        Phạm Văn Drive, 0911222333, 789 Đường Google, Q.3, TP.HCM, Loa Bluetooth Sony, 3.500.000đ
        Lê Thị Sheet, 0944555666, 12 Đường Cloud, Đà Nẵng, Thực phẩm khô đóng gói, 500.000đ
      `;
      setInputText(mockDriveData);
      handleAnalyze(mockDriveData);
    }, 2000);
  };

  // --- 3. AI Analysis Logic ---

  const handleAnalyze = async (dataToAnalyze: string = inputText) => {
    if (!dataToAnalyze.trim()) {
      setError("Vui lòng nhập dữ liệu hoặc tải file lên.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const orders = await parseOrdersFromText(dataToAnalyze);
      setPreviewData(orders);
    } catch (err) {
      setError("Lỗi khi phân tích dữ liệu. Vui lòng kiểm tra file mẫu hoặc định dạng văn bản.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    onImportSuccess(previewData);
    setPreviewData([]);
    setInputText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-primary/10 p-3 rounded-full mr-4">
            <Database className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary">Nhập dữ liệu đơn hàng</h2>
            <p className="text-gray-500 text-sm">
              Hỗ trợ nhập từ File Template (English), Google Drive hoặc Copy/Paste. AI sẽ tự động phân loại.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 border-b border-gray-100 mb-6">
          <button
            onClick={() => setActiveMethod('file')}
            className={`pb-3 px-4 font-medium text-sm flex items-center ${activeMethod === 'file' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FileSpreadsheet className="mr-2" size={18} /> Upload File Mẫu
          </button>
          <button
            onClick={() => setActiveMethod('drive')}
            className={`pb-3 px-4 font-medium text-sm flex items-center ${activeMethod === 'drive' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UploadCloud className="mr-2" size={18} /> Google Drive
          </button>
          <button
            onClick={() => setActiveMethod('text')}
            className={`pb-3 px-4 font-medium text-sm flex items-center ${activeMethod === 'text' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FileText className="mr-2" size={18} /> Nhập văn bản thô
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[200px]">
          
          {/* 1. File Upload Section */}
          {activeMethod === 'file' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Step 1: Download Template */}
                <div className="flex-1 bg-blue-50 p-5 rounded-lg border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                    1. Tải file mẫu (English)
                  </h3>
                  <p className="text-sm text-blue-600 mb-4">
                    Tải file CSV mẫu (Tiêu đề tiếng Anh để tránh lỗi font). Điền thông tin đơn hàng của bạn.
                  </p>
                  <button 
                    onClick={handleDownloadTemplate}
                    className="w-full bg-white text-blue-600 border border-blue-200 hover:bg-blue-100 font-medium py-2 px-4 rounded flex items-center justify-center transition"
                  >
                    <Download size={16} className="mr-2" /> Tải xuống Template
                  </button>
                </div>

                {/* Step 2: Upload */}
                <div className="flex-1 bg-gray-50 p-5 rounded-lg border border-gray-200 border-dashed relative">
                   <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                    2. Tải lên dữ liệu
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Chọn file .csv chứa danh sách đơn hàng.
                  </p>
                  <input 
                    type="file" 
                    accept=".csv, .txt"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-white
                      file:cursor-pointer hover:file:bg-primaryHover
                    "
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                      <div className="flex items-center text-primary font-medium">
                        <Loader2 className="animate-spin mr-2" /> Đang phân tích file...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. Google Drive Section */}
          {activeMethod === 'drive' && (
            <div className="space-y-6 animate-fade-in">
               <div className="bg-green-50 border border-green-100 p-6 rounded-lg">
                  <div className="flex items-start mb-4">
                    <div className="p-2 bg-white rounded shadow-sm mr-4">
                       <img src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo_%282020%29.svg" alt="Google Drive" className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-800 text-lg">Kết nối Google Sheet</h3>
                      <p className="text-green-700 text-sm mt-1">
                        Hệ thống sẽ tự động đọc dữ liệu từ file Sheet được chia sẻ. Vui lòng đảm bảo quyền truy cập là "Bất kỳ ai có liên kết" hoặc đã cấp quyền cho App.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Dán link Google Sheet tại đây (VD: https://docs.google.com/spreadsheets/d/...)"
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      className="flex-1 border border-green-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button 
                      onClick={handleDriveSync}
                      disabled={isSyncingDrive}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center disabled:opacity-70"
                    >
                      {isSyncingDrive ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2" />}
                      Đồng bộ
                    </button>
                  </div>
               </div>
            </div>
          )}

          {/* 3. Text Input Section */}
          {activeMethod === 'text' && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dữ liệu thô (Copy/Paste từ Excel):</label>
              <div className="relative">
                <textarea
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
                  placeholder="Ví dụ: Tên Khách, SĐT, Địa chỉ, Tên Hàng, Giá trị..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                   <button 
                    onClick={() => setInputText(`Customer Name, Phone Number, Address, Product, COD\nLê Văn Test, 0909000111, 123 Test Street, Máy in Canon, 3000000`)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-600 transition"
                  >
                    Dữ liệu mẫu
                  </button>
                  <button
                    onClick={() => handleAnalyze()}
                    disabled={isProcessing || !inputText}
                    className="flex items-center bg-primary hover:bg-primaryHover text-white px-4 py-1 rounded text-sm font-medium transition disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin mr-2" size={14} /> : <Database className="mr-2" size={14} />}
                    Phân tích
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mt-4 text-sm flex items-center">
             <span className="font-bold mr-2">Lỗi:</span> {error}
          </div>
        )}
      </div>

      {/* Preview & Confirmation Section */}
      {previewData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-secondary mb-4 flex items-center justify-between">
            <div className="flex items-center">
               <CheckCircle className="text-green-500 mr-2" size={20} />
               Kết quả phân tích ({previewData.length} đơn)
            </div>
            <span className="text-xs font-normal bg-green-100 text-green-800 px-2 py-1 rounded-full">Sẵn sàng nhập kho</span>
          </h3>
          
          <div className="overflow-x-auto mb-6 border rounded-lg max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm text-left relative">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3">Sản phẩm</th>
                  <th className="p-3">Loại hàng (AI)</th>
                  <th className="p-3">Trọng lượng (AI)</th>
                  <th className="p-3">Dự kiến giao (AI)</th>
                  <th className="p-3">COD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {previewData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-medium">{item.customerName}</div>
                      <div className="text-xs text-gray-500">{item.phoneNumber}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">{item.address}</div>
                    </td>
                    <td className="p-3 text-gray-600">{item.productDescription}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold border border-blue-100">
                        {item.goodsType}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">~{item.weight} kg</td>
                    <td className="p-3 text-gray-600">
                      {new Date(item.estimatedDelivery).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-3 font-mono font-medium text-slate-700">
                      {new Intl.NumberFormat('vi-VN').format(item.codAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3">
             <button
                onClick={() => {
                   setPreviewData([]);
                   if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
              >
                Hủy bỏ
              </button>
            <button
              onClick={handleConfirmImport}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-sm hover:shadow"
            >
              Xác nhận nhập kho
              <ArrowRight className="ml-2" size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataImport;