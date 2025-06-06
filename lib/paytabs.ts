import axios from "axios";

interface PayTabsConfig {
  profileId: string;
  serverKey: string;
  clientKey: string;
  baseUrl: string;
  currency: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

interface CreatePaymentLinkParams {
  courseId: string;
  courseTitle: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  callbackUrl: string;
  returnUrl: string;
}

const config: PayTabsConfig = {
  profileId: process.env.PAYTABS_PROFILE_ID || "",
  serverKey: process.env.PAYTABS_SERVER_KEY || "",
  clientKey: process.env.PAYTABS_CLIENT_KEY || "",
  baseUrl: process.env.PAYTABS_BASE_URL || "https://secure-egypt.paytabs.com",
  currency: process.env.PAYTABS_CURRENCY || "EGP",
  country: process.env.PAYTABS_COUNTRY || "EGY",
  city: process.env.PAYTABS_CITY || "Cairo",
  state: process.env.PAYTABS_STATE || "Cairo",
  zip: process.env.PAYTABS_ZIP || "11511",
  phone: process.env.PAYTABS_PHONE || "01000000000",
};

export const createPaymentLink = async ({
  courseId,
  courseTitle,
  amount,
  customerEmail,
  customerName,
  callbackUrl,
  returnUrl,
}: CreatePaymentLinkParams) => {
  try {
    // Validate configuration
    if (!config.profileId || !config.serverKey || !config.clientKey) {
      throw new Error("Missing required PayTabs configuration. Please check your environment variables.");
    }

    // Log the configuration for debugging
    console.log("[PAYTABS_CONFIG] Configuration (redacted):", {
      profileId: config.profileId,
      baseUrl: config.baseUrl,
      currency: config.currency,
      country: config.country,
      serverKey: config.serverKey ? "******" : "NOT_SET",
      clientKey: config.clientKey ? "******" : "NOT_SET"
    });

    // Prepare the request payload
    const payload = {
      profile_id: config.profileId,
      tran_type: "sale",
      tran_class: "ecom",
      cart_id: `course_${courseId}_${Date.now()}`,
      cart_description: `Purchase of course: ${courseTitle}`,
      cart_currency: config.currency,
      cart_amount: amount,
      callback: callbackUrl,
      return: returnUrl,
      hide_shipping: true,
      customer_details: {
        name: customerName,
        email: customerEmail,
        street1: "Customer Address",
        city: config.city,
        state: config.state,
        country: config.country,
        zip: config.zip,
        phone: config.phone,
      },
    };

    // Log the request payload for debugging
    console.log("[PAYTABS_REQUEST] Payload:", JSON.stringify(payload, null, 2));

    // Make the API request with proper authentication header
    const response = await axios.post(
      `${config.baseUrl}/payment/request`,
      payload,
      {
        headers: {
          "Authorization": config.serverKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Cache-Control": "no-cache",
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    // Log the response for debugging
    console.log("[PAYTABS_RESPONSE] Status:", response.status);
    console.log("[PAYTABS_RESPONSE] Data:", JSON.stringify(response.data, null, 2));

    if (!response.data || !response.data.tran_ref) {
      throw new Error(`Invalid PayTabs response: ${JSON.stringify(response.data)}`);
    }

    return response.data;
  } catch (error) {
    // Detailed error logging
    if (axios.isAxiosError(error)) {
      console.error("[PAYTABS_ERROR] Axios error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        }
      });
      
      // Extract more detailed error message from PayTabs response if available
      const paytabsError = error.response?.data?.message || error.response?.data?.error || error.message;
      throw new Error(`PayTabs API Error: ${paytabsError}`);
    } else {
      console.error("[PAYTABS_ERROR] Error:", error);
      throw error;
    }
  }
};

export const verifyPayment = async (paymentReference: string) => {
  try {
    const response = await axios.post(
      `${config.baseUrl}/payment/query`,
      {
        profile_id: config.profileId,
        tran_ref: paymentReference,
      },
      {
        headers: {
          Authorization: config.serverKey,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    // Detailed error logging
    if (axios.isAxiosError(error)) {
      console.error("[PAYTABS_VERIFY_ERROR] Axios error:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    } else {
      console.error("[PAYTABS_VERIFY_ERROR] Error:", error);
    }
    throw error; // Re-throw the error for the caller to handle
  }
}; 