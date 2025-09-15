import { useCallback, useMemo, useState } from 'react'

const DEFAULT_API_BASE_URL = typeof import.meta !== 'undefined'
  ? import.meta.env.VITE_API_URL ?? '/api'
  : '/api'

const isFormData = (value) => typeof FormData !== 'undefined' && value instanceof FormData

const normalizeBaseUrl = (baseUrl) => {
  if (!baseUrl) {
    return ''
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

const normalizeEndpoint = (endpoint) => {
  if (!endpoint) {
    return ''
  }

  return endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
}

const buildUrl = (baseUrl, endpoint) => {
  if (!endpoint) {
    return normalizeBaseUrl(baseUrl)
  }

  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint
  }

  const normalizedBase = normalizeBaseUrl(baseUrl)
  const normalizedEndpoint = normalizeEndpoint(endpoint)

  if (!normalizedBase) {
    return `/${normalizedEndpoint}`.replace(/\/+/g, '/').replace(/\/(\?|$)/, '$1')
  }

  return `${normalizedBase}/${normalizedEndpoint}`.replace(/\/+/g, '/')
}

const DEFAULT_ERROR_MESSAGE = 'Erro ao se comunicar com o servidor. Tente novamente em instantes.'

export function useApi(options = {}) {
  const { baseUrl = DEFAULT_API_BASE_URL, token, defaultHeaders = {}, onError } = options
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const authHeaders = useMemo(() => {
    if (!token) {
      return {}
    }

    return {
      Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
    }
  }, [token])

  const request = useCallback(async (requestOptions) => {
    const {
      endpoint,
      method = 'GET',
      data,
      params,
      headers,
      signal,
      parseResponse = true
    } = requestOptions ?? {}

    const url = new URL(buildUrl(baseUrl, endpoint), typeof window !== 'undefined' ? window.location.origin : 'http://localhost')

    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return
        }
        url.searchParams.append(key, value)
      })
    }

    const finalHeaders = {
      Accept: 'application/json',
      ...defaultHeaders,
      ...authHeaders,
      ...headers
    }

    const fetchOptions = {
      method,
      headers: finalHeaders,
      signal
    }

    if (data !== undefined) {
      if (isFormData(data)) {
        fetchOptions.body = data
        if (fetchOptions.headers && fetchOptions.headers['Content-Type']) {
          delete fetchOptions.headers['Content-Type']
        }
      } else if (method !== 'GET' && method !== 'HEAD') {
        fetchOptions.body = JSON.stringify(data)
        fetchOptions.headers = {
          'Content-Type': 'application/json',
          ...fetchOptions.headers
        }
      }
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, fetchOptions)

      if (!parseResponse) {
        if (!response.ok) {
          const error = new Error(response.statusText || DEFAULT_ERROR_MESSAGE)
          error.status = response.status
          throw error
        }

        return response
      }

      const contentType = response.headers.get('content-type') ?? ''
      let payload = null

      if (contentType.includes('application/json')) {
        try {
          payload = await response.json()
        } catch {
          payload = null
        }
      } else {
        try {
          payload = await response.text()
        } catch {
          payload = null
        }
      }

      if (!response.ok) {
        const message =
          (payload && typeof payload === 'object' && 'message' in payload && payload.message) ||
          (typeof payload === 'string' && payload.trim()) ||
          response.statusText ||
          DEFAULT_ERROR_MESSAGE

        const apiError = new Error(message)
        apiError.status = response.status
        apiError.payload = payload
        setError(apiError)
        if (onError) {
          onError(apiError)
        }
        throw apiError
      }

      return payload
    } catch (caughtError) {
      if (!(caughtError instanceof Error)) {
        const fallbackError = new Error(DEFAULT_ERROR_MESSAGE)
        setError(fallbackError)
        if (onError) {
          onError(fallbackError)
        }
        throw fallbackError
      }

      setError(caughtError)
      if (onError) {
        onError(caughtError)
      }
      throw caughtError
    } finally {
      setLoading(false)
    }
  }, [authHeaders, baseUrl, defaultHeaders, onError])

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  return {
    request,
    loading,
    error,
    resetError
  }
}

export default useApi
