
const isTokenExpired = (token) => {
  if (!token) return true;

  const tokenParts = token.split('.');
  if (tokenParts.length < 2) return true;

  const payload = JSON.parse(atob(tokenParts[1]));
  if (!payload || !payload.exp) return true;

  const expirationTimeInSeconds = payload.exp;
  const currentTimeInSeconds = Math.floor(Date.now()/1000); //milliseconds



  return currentTimeInSeconds >= expirationTimeInSeconds;
};

export default isTokenExpired;