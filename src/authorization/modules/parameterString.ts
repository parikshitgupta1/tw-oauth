import { SignatureOAuthOptions } from "../../types";
import { percentEncode } from "../helpers";

function buildOutputString(
  sortedEncodedParams: Record<string, string>
): string {
  return Object.entries(sortedEncodedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

function sortEncodedParams(
  encodedParams: Record<string, string>
): Record<string, string> {
  const sortedEncodedParams: Record<string, string> = {};
  for (const key of Object.keys(encodedParams).sort()) {
    sortedEncodedParams[key] = encodedParams[key];
  }
  return sortedEncodedParams;
}

function encodeParams(params: Record<string, string>): Record<string, string> {
  const encodedParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    encodedParams[key] = percentEncode(value);
  }
  return encodedParams;
}

export default function parameterString(
  signatureOptions: SignatureOAuthOptions,
  queryParams?: Record<string, string>,
  bodyParams?: Record<string, string | number | boolean>
): string {
  /*
    Collecting parameters
  */
  const params = Object.assign(queryParams || {}, bodyParams || {}, {
    oauth_consumer_key: signatureOptions.api_key,
    oauth_nonce: signatureOptions.oauth_nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: signatureOptions.oauth_timestamp,
    oauth_token: signatureOptions.access_token,
    oauth_version: "1.0",
  });
  /*
    These values need to be encoded into a single string which will be used later on. The process to build the string is very specific:
      1. Percent encode every key and value that will be signed.
      2. Sort the list of parameters alphabetically by encoded key.
      3. For each key/value pair:
        1. Append the encoded key to the output string.
        2. Append the ‘=’ character to the output string.
        3. Append the encoded value to the output string.
        4. If there are more key/value pairs remaining, append a ‘&’ character to the output string.
  */
  // 1. Percent encode every key and value that will be signed.
  const encodedParams = encodeParams(params);
  // 2. Sort the list of parameters alphabetically by encoded key
  const sortedEncodedParams = sortEncodedParams(encodedParams);
  //  3. For each key/value pair:
  //    1. Append the encoded key to the output string.
  //    2. Append the ‘=’ character to the output string.
  //    3. Append the encoded value to the output string.
  //    4. If there are more key/value pairs remaining, append a ‘&’ character
  return buildOutputString(sortedEncodedParams);
}