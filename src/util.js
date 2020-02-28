import base64url from "base64url";

export const _fetch = async (path, payload = "") => {
  const headers = {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json; charset=utf-8"
  };
  const res = await fetch(path, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload)
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
    throw new Error("You need User Verifying Platform Authenticator.");
  }
  const options = await _fetch("http://localhost:9999/auth/registerRequest", opts);
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

export const logInUser = (route, body, setState, state) => {
  _fetch(`http://localhost:9999/auth/${route}`, body)
    .then(user => {
      setState({
        ...state,
        user
      });
    })
    .catch(e => {
      alert(e.message);
    });
};
