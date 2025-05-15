import { useEffect, useRef, useState } from 'react';

import { AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface UseGenericMethodProps {
    method: HttpMethod;
    apiMethod: (...args: any[]) => Promise<any> | Promise<AxiosResponse<any, any>>[];
    alternativeApiMethod?: (...args: any[]) => Promise<any> | Promise<AxiosResponse<any, any>>[];
    useAlternativeMethod?: boolean;
    onSuccess?: (data?: any) => void;
    onError?: (error: any) => void;
    executeOnMount?: boolean;
    successMessage?: string;
    errorMessage?: string;
    params?: any;
    dataExtractor?: (data: any) => any;
    skipWithOutParams?: boolean;
    initialData?: any;
}

export const useGenericMethod = ({
    method,
    apiMethod,
    alternativeApiMethod,
    useAlternativeMethod = false,
    onSuccess,
    onError,
    executeOnMount = false,
    successMessage,
    errorMessage,
    params,
    dataExtractor = (response: any) => {
        if (response?.data?.data?.data) return response.data.data.data;
        if (response?.data?.data) return response.data.data;
        if (response?.data) return response.data;
        return response;
    },
    skipWithOutParams = false,
    initialData = []
}: UseGenericMethodProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(initialData);
    const isLoaded = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const requestInProgress = useRef<boolean>(false);
    const mountedRef = useRef(false);

    const selectedApiMethod = useAlternativeMethod && alternativeApiMethod ? alternativeApiMethod : apiMethod;

    const handleAction = async (...args: any[]) => {
        if (requestInProgress.current) {
            console.log('Request already in progress');
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        requestInProgress.current = true;

        if (mountedRef.current) {
            setLoading(true);
            setError(null);
        }

        try {
            const response = await selectedApiMethod(...args, abortControllerRef.current.signal);

            // If component is unmounted or response is undefined (due to cancellation), don't proceed
            if (!mountedRef.current || response === undefined) {
                console.log('Request cancelled or component unmounted');
                return;
            }

            const resolvedResponse = Array.isArray(response) ? (await Promise.all(response))[0] : response;

            if (method === 'GET' && resolvedResponse?.status === 200) {
                const extractedData = dataExtractor(resolvedResponse);
                // Only check if mounted before setting state
                if (mountedRef.current) {
                    setData(extractedData);
                    isLoaded.current = true;
                    onSuccess?.(extractedData);
                }
                return extractedData;
            } else if (
                ['POST', 'PATCH', 'DELETE'].includes(method) &&
                (resolvedResponse?.status === 201 ||
                    resolvedResponse?.status === 200 ||
                    resolvedResponse?.status === 204)
            ) {
                isLoaded.current = true;
                // Only show toast if the request wasn't cancelled
                if (successMessage && mountedRef.current && !abortControllerRef.current?.signal.aborted) {
                    toast.success(successMessage);
                }
                if (resolvedResponse?.status === 200) {
                    const extractedData = dataExtractor(resolvedResponse);
                    if (mountedRef.current) {
                        onSuccess?.(extractedData);
                    }
                    return extractedData;
                }
                if (mountedRef.current) {
                    onSuccess?.();
                }
                return true;
            }
        } catch (error: any) {
            console.log('Error details:', error);

            // Handle cancellation
            if (
                error.name === 'CanceledError' ||
                error.name === 'AbortError' ||
                error.code === 'ERR_CANCELED' ||
                error === 'canceled'
            ) {
                console.log('Request cancelled');
                return;
            }

            // Only handle error if component is still mounted and request wasn't cancelled
            if (mountedRef.current && !abortControllerRef.current?.signal.aborted) {
                const errorMsg =
                    error?.data?.errorMessage ||
                    error?.response?.data?.errorMessage ||
                    error.message ||
                    'An error occurred';

                console.log('Real error occurred:', errorMsg);
                setError(errorMsg);
                if (errorMessage) {
                    toast.error(errorMessage);
                }

                onError?.(error);
            }
        } finally {
            // Only update state if component is still mounted
            if (mountedRef.current) {
                setLoading(false);
                requestInProgress.current = false;
            }
        }
    };

    // Internal fetch function for GET requests
    const fetchData = async () => {
        if (!params && skipWithOutParams) return;

        try {
            if (params) {
                await handleAction(params);
            } else {
                await handleAction();
            }
        } catch (err) {
            console.error('Error in fetchData:', err);
        }
    };

    // useEffect for GET requests and executeOnMount cases
    useEffect(() => {
        mountedRef.current = true;

        if (method === 'GET' && !isLoaded.current) {
            fetchData();
        }

        return () => {
            mountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                requestInProgress.current = false;
            }
        };
    }, [params, method, useAlternativeMethod]);

    const reset = () => {
        isLoaded.current = false;
        setData(null);
        setError(null);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            requestInProgress.current = false;
        }
    };

    // Manual refetch function for GET requests
    const refetch = () => {
        if (method === 'GET') {
            isLoaded.current = false;
            fetchData();
        }
    };

    return { data, loading, error, handleAction, reset, refetch, setError };
};
