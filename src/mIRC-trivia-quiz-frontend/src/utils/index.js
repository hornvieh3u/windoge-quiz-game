export const storage = function() {

    const STORAGE_KEY = "USER_INFO";

    return {
        save: userInfo => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userInfo, (_, value) => typeof value === 'bigint' ? value.toString() : value)),
        delete: () => sessionStorage.removeItem(STORAGE_KEY),
        get: () => sessionStorage.getItem(STORAGE_KEY) && JSON.parse(sessionStorage.getItem(STORAGE_KEY))
    }
}();

export const formatPrincipal = principal => {
  const principalStr = principal.toString();
  return `${principalStr.substring(0, 5)}...${principalStr.substring(principalStr.length - 5, principalStr.length)}`;
}