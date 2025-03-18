import { useAlertStore } from '@/stores/alerts'

export const fetchWrapper = {
  get: request('GET'),
  post: request('POST'),
  put: request('PUT'),
  delete: request('DELETE')
}

function request(method) {
  return async (url, body) => {
    const requestOptions = {
      method
    }
    if (body) {
      requestOptions.headers['Content-Type'] = 'application/json'
      requestOptions.body = JSON.stringify(body)
    }
    console.log('url', url, 'options', requestOptions)
    try {
      let resp = await fetch(url, requestOptions)
      return handleResponse(resp)
    } catch (e) {
      const alertStore = useAlertStore()
      alertStore.displayAlert({
        title: 'Error with request',
        text: `Encountered an issue connection to ${url}: ${e}`,
        type: 'error',
        closable: true,
        duration: 6
      })
      console.error(e)
    }
  }
}

// helper functions

function handleResponse(response) {
  return response.text().then((text) => {
    const data = text && JSON.parse(text)

    if (!response.ok) {
      const error = (data && data.message) || response.statusText
      return Promise.reject(error)
    }

    return data
  })
}
