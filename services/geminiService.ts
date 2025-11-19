import { GoogleGenAI, Type } from "@google/genai";
import { GoodsType, Order, OrderStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

/**
 * Parses unstructured text (e.g., copied from Google Sheets/Drive) into structured Order objects.
 * It also intelligently predicts the GoodsType and Estimated Delivery based on the product.
 */
export const parseOrdersFromText = async (textInput: string): Promise<Order[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `
        You are a logistics data processing AI. Analyze the following input data which represents e-commerce orders.
        The data might be in CSV format, JSON, or raw text copied from a spreadsheet.
        
        IMPORTANT: The input data might use English Headers (e.g., "Customer Name", "Address") OR Vietnamese Headers.
        You must map them correctly to the output JSON keys.
        
        Current Date: ${new Date().toISOString()}
        
        Tasks:
        1. Extract orders into a structured JSON list.
        2. Fields mapping:
           - If ID is missing, generate a short random string (e.g., "GHN-xxxxx").
           - Map columns "Customer Name"/"Tên Khách" -> customerName
           - Map columns "Phone Number"/"SĐT" -> phoneNumber
           - Map columns "Address"/"Địa Chỉ" -> address
           - Map columns "Product Description"/"Tên Hàng" -> productDescription
           - Map columns "COD Amount"/"Tiền Thu Hộ" -> codAmount
           - Estimate 'weight' (in kg) based on the product name (e.g., Laptop ~ 2kg, Phone ~ 0.5kg).
        3. Classify 'goodsType' based on the product description into exactly one of: STANDARD, FRAGILE, LIQUID, BULKY, ELECTRONIC, FOOD.
        4. Estimate 'estimatedDelivery' date (ISO string) based on typical shipping times (2-5 days).
        5. Set 'status' to 'Chờ lấy hàng'.
        6. Create an initial history entry.

        Input Data:
        """
        ${textInput}
        """
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              customerName: { type: Type.STRING },
              phoneNumber: { type: Type.STRING },
              address: { type: Type.STRING },
              productDescription: { type: Type.STRING },
              weight: { type: Type.NUMBER },
              codAmount: { type: Type.NUMBER },
              status: { type: Type.STRING }, // We will cast this to enum later
              goodsType: { type: Type.STRING }, // We will cast this to enum later
              createdAt: { type: Type.STRING },
              estimatedDelivery: { type: Type.STRING },
              history: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    status: { type: Type.STRING },
                    location: { type: Type.STRING },
                    description: { type: Type.STRING }
                  }
                }
              }
            },
            required: ["customerName", "productDescription", "goodsType"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const parsedData = JSON.parse(jsonText);
    
    // Post-processing to ensure Types match our Enums strictly if Gemini hallucinations occur
    return parsedData.map((item: any) => ({
      ...item,
      status: OrderStatus.PENDING, // Force new orders to pending
      createdAt: new Date().toISOString(),
      // Default history if empty
      history: item.history && item.history.length > 0 ? item.history : [{
        date: new Date().toISOString(),
        status: "Đã tạo đơn",
        location: "Hệ thống",
        description: "Đơn hàng được khởi tạo từ dữ liệu nhập"
      }]
    }));

  } catch (error) {
    console.error("Error parsing orders with Gemini:", error);
    throw new Error("Không thể xử lý dữ liệu. Vui lòng kiểm tra định dạng văn bản hoặc file.");
  }
};

/**
 * Analyzes a single product to recommend packaging and shipping method.
 */
export const analyzeShippingAdvisory = async (productDescription: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Provide a short shipping advisory (max 50 words) in Vietnamese for a product described as: "${productDescription}". 
      Include packaging advice and handling warnings.`
    });
    return response.text || "Không có lời khuyên cụ thể.";
  } catch (error) {
    return "Lỗi khi lấy lời khuyên.";
  }
};