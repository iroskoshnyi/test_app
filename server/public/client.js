export const _fetch = async (path, payload = "") => {
  const headers = {
    "X-Requested-With": "XMLHttpRequest"
  };
  if (payload && !(payload instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(payload);
  }
  const res = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: headers,
    body: payload
  });
  if (res.status === 200) {
    // Server authentication succeeded
    return res.json();
  } else {
    // Server authentication failed
    const result = await res.json();
    throw result.error;
  }
};
export const registerCredential = async opts => {
  const UVPAA = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  if (!UVPAA) {
    throw "You need User Verifying Platform Authenticator.";
  }
  const options = await _fetch("/auth/registerRequest", opts);
  options.user.id = base64url.decode(options.user.id);
  options.challenge = base64url.decode(options.challenge);

  if (options.excludeCredentials) {
    for (let cred of options.excludeCredentials) {
      cred.id = base64url.decode(cred.id);
    }
  }
  const cred = await navigator.credentials.create({
    publicKey: options
  });
  const credential = {};
  credential.id = cred.id;
  credential.rawId = base64url.encode(cred.rawId);
  credential.type = cred.type;

  if (cred.response) {
    const clientDataJSON = base64url.encode(cred.response.clientDataJSON);
    const attestationObject = base64url.encode(cred.response.attestationObject);
    credential.response = {
      clientDataJSON,
      attestationObject
    };
  }
  localStorage.setItem(`credId`, credential.id);
  return await _fetch("/auth/registerResponse", credential);
};
export const unregisterCredential = async credId => {
  localStorage.removeItem("credId");
  return _fetch(`/auth/removeKey?credId=${encodeURIComponent(credId)}`);
};
export const authenticate = async opts => {
  if (!window.PublicKeyCredential) {
    console.info("WebAuthn not supported on this browser.");
    return Promise.resolve(null);
  }
  const UVPAA = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  if (!UVPAA) {
    console.info("You need User Verifying Platform Authenticator..");
    return Promise.resolve(null);
  }
  let url = '/auth/signinRequest';
  const credId = localStorage.getItem(`credId`);
  if (credId) {
    url += `?credId=${encodeURIComponent(credId)}`;
  }
  const options = await _fetch(url, opts);
  if (options.allowCredentials.length === 0) {
    console.info('No registered credentials found.');
    return Promise.resolve(null);
  }
  options.challenge = base64url.decode(options.challenge);

  for (let cred of options.allowCredentials) {
    cred.id = base64url.decode(cred.id);
  }
  const cred = await navigator.credentials.get({
    publicKey: options
  });
  const credential = {};
  credential.id =     cred.id;
  credential.type =   cred.type;
  credential.rawId =  base64url.encode(cred.rawId);

  if (cred.response) {
    const clientDataJSON =
      base64url.encode(cred.response.clientDataJSON);
    const authenticatorData =
      base64url.encode(cred.response.authenticatorData);
    const signature =
      base64url.encode(cred.response.signature);
    const userHandle =
      base64url.encode(cred.response.userHandle);
    credential.response = {
      clientDataJSON,
      authenticatorData,
      signature,
      userHandle
    };
  }
  localStorage.setItem(`credId`, credential.id);
  return await _fetch(`/auth/signinResponse`, credential);
};

// TODO (3): Authenticate the user with a fingerprint
// 1. Create `authetnicate()` function
// 2. Feature detection and User Verifying Platform Authenticator check
// 3. Obtain the challenge and other options from server
// 4. Locally verify the user and get a credential
// 5. Assert the credential on the server
