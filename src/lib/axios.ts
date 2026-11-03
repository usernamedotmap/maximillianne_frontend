import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export type ApiFieldError = {
  field: string;
  message: string;
};

type ApiErrorResponse = {
  code?: string;
  message?: string;
  details?: ApiFieldError[];
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiError extends Error {
  public readonly status: number | undefined;
  public readonly code: string | undefined;
  public readonly details: ApiFieldError[];

  constructor(
    message: string,
    status?: number,
    code?: string,
    details: ApiFieldError[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const code = data?.error?.code ?? data?.code;
    const serverMessage = data?.error?.message ?? data?.message;
    const message = !error.response
      ? "Unable to reach the server. Check your connection and try again."
      : status !== undefined && status >= 500
        ? "The server could not complete the request. Please try again."
        : serverMessage ?? "The request could not be completed.";

    return Promise.reject(
      new ApiError(message, status, code, data?.details ?? []),
    );
  }
);
