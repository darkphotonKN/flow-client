import { config } from "@/config/environment";

// API base URL from environment config
const API_BASE_URL = config.apiBaseUrl;

/**
 * Authenticated fetch wrapper. Attaches Bearer token from localStorage.
 * On 401: clears tokens and redirects to /auth.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = localStorage.getItem("accessToken");

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/auth";
    throw new Error("Unauthorized");
  }

  return response;
}

export const scope = {
  longterm: "longterm",
  daily: "daily",
} as const;
export type ScopeEnum = (typeof scope)[keyof typeof scope];

export interface ChecklistItem {
  id: string;
  description: string;
  done: boolean;
  scheduledTime?: string; // ISO date string for scheduled items
  scope?: ScopeEnum;
}

export interface ChecklistResponse {
  statusCode: number;
  message: string;
  result: ChecklistItem[];
}

export interface PlanResponse {
  statusCode: number;
  message: string;
  result: {
    items: ChecklistItem[];
    dailyReset: boolean;
  };
}

export interface ChecklistCreateRequest {
  description: string;
}

export interface UpdateChecklistItemRequest {
  description?: string;
  done?: boolean;
  scope?: ScopeEnum;
}

export interface DeleteChecklistItemResponse {
  result: "success" | "failure";
}

export interface UpdateChecklistItemResponse {
  result: "success" | "failure";
  item?: ChecklistItem;
}

export interface ChecklistSuggestionResponse {
  message: string;
  result: string;
  statusCode: number;
}

export interface DailyInsightsResponse {
  result: string[];
  message: string;
  statusCode: number;
}

export interface PlanDetailResponse {
  statusCode: number;
  message: string;
  result: PlanDetailData;
}

export interface PlanDetailData {
  id: string;
  name: string;
  description: string;
  focus: string;
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  result: "success" | "failure";
}

/**
 * Fetch Plan Information
 */
export const fetchPlan = async (id: string): Promise<PlanDetailResponse> => {
  const response = await authFetch(`${API_BASE_URL}/api/plans/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch checklist: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Fetch all checklist items for the specified plan
 */
export const fetchChecklist = async (
  planId: string,
  scope: "daily" | "longterm" = "daily",
  archived: boolean = false,
): Promise<ChecklistResponse> => {
  const response = await authFetch(
    `${API_BASE_URL}/api/plans/${planId}/checklists?scope=${scope}&archived=${archived}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch checklist: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Create a new checklist item
 */
export const createChecklistItem = async (
  description: string,
  planId: string,
  scope: "daily" | "longterm" = "daily",
): Promise<ChecklistItem> => {
  const response = await authFetch(
    `${API_BASE_URL}/api/plans/${planId}/checklists`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description, scope }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to create checklist item: ${response.statusText}`);
  }

  const jsonRes = await response.json();

  return await jsonRes.result;
};

/**
 * Update a checklist item (description and/or done status)
 */
export const updateChecklistItem = async (
  id: string,
  updates: UpdateChecklistItemRequest,
  planId: string,
  scope: "daily" | "longterm" = "daily",
): Promise<UpdateChecklistItemResponse> => {
  try {
    const response = await authFetch(
      `${API_BASE_URL}/api/plans/${planId}/checklists/${id}?scope=${scope}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update checklist item: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return { result: "success", item: data };
  } catch (err) {
    console.error("Failed to update checklist item:", err);
    return { result: "failure" };
  }
};

/**
 * Delete a checklist item
 */
export const deleteChecklistItem = async (
  id: string,
  planId: string,
  scope: "daily" | "longterm" = "daily",
): Promise<DeleteChecklistItemResponse> => {
  try {
    const response = await authFetch(
      `${API_BASE_URL}/api/plans/${planId}/checklists/${id}?scope=${scope}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return await response.json();
  } catch (err) {
    console.log("Failed to delete checklist item, error:", err);
    return { result: "failure" };
  }
};

/**
 * Get an AI-generated checklist item suggestion
 */
export const getChecklistSuggestion = async (
  planId: string,
  scope: "daily" | "longterm" = "daily",
): Promise<ChecklistSuggestionResponse> => {
  try {
    const response = await authFetch(
      `${API_BASE_URL}/api/insights/checklist-suggestion?plan_id=${planId}&scope=${scope}`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get checklist suggestion: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (err) {
    console.error("Failed to get checklist suggestion:", err);
    // Return a fallback suggestion if the API fails
    return {
      message: "Failed to generate suggestion",
      result: "Review your current project priorities",
      statusCode: 200,
    };
  }
};

/**
 * Schedule a checklist item
 */
export const scheduleChecklistItem = async (
  id: string,
  planId: string,
  scheduleTime: Date,
  scope: "daily" | "longterm" = "daily",
): Promise<UpdateChecklistItemResponse> => {
  try {
    const response = await authFetch(
      `${API_BASE_URL}/api/plans/${planId}/checklists/${id}/schedule?scope=${scope}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scheduledTime: scheduleTime.toISOString() }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to schedule checklist item: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return { result: "success", item: data };
  } catch (err) {
    console.error("Failed to schedule checklist item:", err);
    return { result: "failure" };
  }
};

/**
 * Get daily insights suggestions based on long-term items
 */
export const getDailyInsights = async (
  planId: string,
): Promise<DailyInsightsResponse> => {
  try {
    const response = await authFetch(
      `${config.apiBaseUrl}/api/insights/checklist-suggestion-daily?plan_id=${planId}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to get daily insights: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get daily insights:", error);
    // Return a fallback suggestion if the API fails
    return {
      message: "Failed to generate insights",
      result: [],
      statusCode: 200,
    };
  }
};

/**
 * Archive a checklist item
 */
export const archiveChecklistItem = async (
  id: string,
  planId: string,
  scope: "daily" | "longterm" = "daily",
): Promise<UpdateChecklistItemResponse> => {
  try {
    console.log("planId:", planId, " checklist id:", id);
    const response = await authFetch(
      `${API_BASE_URL}/api/plans/${planId}/checklists/${id}/archive?scope=${scope}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to archive checklist item: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return { result: "success", item: data };
  } catch (err) {
    console.error("Failed to archive checklist item:", err);
    return { result: "failure" };
  }
};

/**
 * Fetch archived checklist items for the specified plan
 */
export const fetchArchivedChecklist = async (
  planId: string,
  scope: "daily" | "longterm" = "daily",
): Promise<ChecklistResponse> => {
  const response = await authFetch(
    `${API_BASE_URL}/api/plans/${planId}/checklists/archived?scope=${scope}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch archived checklist: ${response.statusText}`,
    );
  }

  return await response.json();
};

export const toggleDailyReset = async (
  planId: string,
): Promise<ApiResponse> => {
  const response = await authFetch(
    `${API_BASE_URL}/api/plans/${planId}/toggle-daily-reset`,
    {
      method: "PATCH",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to toggle daily reset");
  }

  return response.json();
};

// --- Auth ---

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface SignInResponse {
  statusCode: number;
  message: string;
  result: {
    accessToken: string;
    refreshToken: string;
    accessExpiresIn: number;
    refreshExpiresIn: number;
    userInfo: AuthUser;
  };
}

export interface SignUpResponse {
  statusCode: number;
  message: string;
}

export const signIn = async (
  email: string,
  password: string,
): Promise<SignInResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Sign in failed");
  }

  return data;
};

export const signUp = async (
  name: string,
  email: string,
  password: string,
): Promise<SignUpResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Sign up failed");
  }

  return data;
};

// --- User Profile ---

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  created_at: string;
}

export interface UserProfileResponse {
  statusCode: number;
  message: string;
  result: UserProfile;
}

export interface UpdateProfileRequest {
  name?: string;
  displayName?: string;
  bio?: string;
}

export const getProfile = async (): Promise<UserProfileResponse> => {
  const response = await authFetch(`${API_BASE_URL}/api/users/profile`);

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.statusText}`);
  }

  return await response.json();
};

export const updateProfile = async (
  updates: UpdateProfileRequest,
): Promise<UserProfileResponse> => {
  const response = await authFetch(`${API_BASE_URL}/api/users/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update profile: ${response.statusText}`);
  }

  return await response.json();
};

export const fetchPlanDetails = async (
  planId: string,
): Promise<PlanResponse> => {
  const response = await authFetch(
    `${API_BASE_URL}/api/plans/${planId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch plan details");
  }

  return response.json();
};
