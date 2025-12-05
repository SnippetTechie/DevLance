// src/hooks/useFetch.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic fetch hook with loading, error, and refresh capabilities
 * @param {string|null} url - URL to fetch (null to skip)
 * @param {object} options - Fetch options
 */
export default function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  const {
    immediate = true, // Fetch immediately on mount
    timeout = 30000, // Request timeout in ms
    retries = 0, // Number of retries on failure
    retryDelay = 1000, // Delay between retries
    onSuccess, // Callback on successful fetch
    onError, // Callback on error
    transform, // Transform response data
    ...fetchOptions
  } = options;

  const fetchData = useCallback(async (fetchUrl = url) => {
    if (!fetchUrl) {
      return null;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setLoading(true);
    setError(null);

    let lastError = null;
    let attempts = 0;
    const maxAttempts = retries + 1;

    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        // Create timeout
        const timeoutId = setTimeout(() => {
          abortControllerRef.current?.abort();
        }, timeout);

        const response = await fetch(fetchUrl, {
          ...fetchOptions,
          signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let result = await response.json();

        // Apply transform if provided
        if (transform && typeof transform === 'function') {
          result = transform(result);
        }

        if (mountedRef.current) {
          setData(result);
          setLoading(false);
          setError(null);
          
          if (onSuccess) {
            onSuccess(result);
          }
        }

        return result;
      } catch (err) {
        lastError = err;

        // Don't retry on abort
        if (err.name === 'AbortError') {
          break;
        }

        // Retry with delay
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
        }
      }
    }

    // All attempts failed
    if (mountedRef.current && lastError?.name !== 'AbortError') {
      setError(lastError);
      setLoading(false);
      
      if (onError) {
        onError(lastError);
      }
    }

    return null;
  }, [url, fetchOptions, timeout, retries, retryDelay, transform, onSuccess, onError]);

  // Refresh function
  const refresh = useCallback(() => {
    return fetchData(url);
  }, [fetchData, url]);

  // Fetch with custom URL
  const fetchUrl = useCallback((customUrl) => {
    return fetchData(customUrl);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, immediate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refresh,
    fetchUrl,
    setData,
    setError,
  };
}

/**
 * Hook for fetching IPFS metadata
 */
export function useIPFSFetch(cid, options = {}) {
  const gateway = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
  
  const cleanCID = cid
    ? cid.replace(/^ipfs:\/\//, '').replace(/^\/ipfs\//, '').trim()
    : null;
  
  const url = cleanCID ? `${gateway}${cleanCID}` : null;
  
  return useFetch(url, {
    timeout: 15000,
    retries: 2,
    retryDelay: 2000,
    ...options,
  });
}

/**
 * Hook for API requests
 */
export function useAPI(endpoint, options = {}) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  const url = endpoint ? `${baseUrl}${endpoint}` : null;
  
  return useFetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
}