export async function readJsonResponse(response, fallbackMessage = 'The server returned an unexpected response.') {
  const body = await response.text();

  if (!body.trim()) {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    if (/^\s*<!doctype html/i.test(body) || /<html[\s>]/i.test(body)) {
      throw new Error('Unable to connect to the backend server. Please make sure the API server is running and try again.');
    }

    throw new Error(fallbackMessage);
  }
}

export function getNetworkErrorMessage(error, fallbackMessage) {
  if (error instanceof TypeError && /fetch/i.test(error.message)) {
    return 'Unable to connect to the backend server. Please make sure the API server is running and try again.';
  }

  return error.message || fallbackMessage;
}