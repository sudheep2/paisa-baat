export interface AuthResponse {
    authenticated: boolean;
    isAppInstalled: boolean;
    aadhaarPanVerified: boolean;
    aadhaarPan: string;
    solanaAddressSet: boolean;
  }