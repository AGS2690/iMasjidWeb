export interface ApiResponse<T = any> {
  success?: boolean;
  isSuccess?: boolean;
  statusCode?: number;
  message: string;
  errors?: Array<{ field?: string; message: string }> | string[] | null;
  correlationId?: string;
  timestamp?: string;
  data: T;
}

export interface PagedResponse<T = any> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface TokenDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresOn?: string;
  refreshTokenExpiresOn?: string;
  tokenType: string;
  expiresIn?: number;
  requiresTwoFactor?: boolean;
  maskedEmail?: string | null;
  userName?: string | null;
}

export interface OtpSentResponse {
  success: boolean;
  maskedEmail: string;
  message: string;
}

export interface SendOtpRequest {
  userNameOrEmail: string;
  purpose?: string;
}

export interface VerifyOtpRequest {
  userNameOrEmail: string;
  otp: string;
  purpose?: string;
}

export interface ToggleTwoFactorRequest {
  enable: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
}

export interface UserDetailsResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  twoFactorEnabled?: boolean;
  lastLoginDate?: string;
  roles: string[];
  permissions: string[];
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  twoFactorEnabled?: boolean;
  lastLoginDate?: string;
  createdOn: string;
  roles: string[];
}

export interface RoleResponse {
  id: string;
  name: string;
  normalizedName?: string;
  description?: string;
  isActive: boolean;
  createdOn: string;
  userCount?: number;
  permissions: string[];
}

export interface PermissionDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  module: string;
}

export interface UserNavMenuResponse {
  id: string;
  title: string;
  route?: string;
  icon?: string;
  orderIndex: number;
  parentId?: string;
  authorizedActions?: string[];
  actions?: string[];
  children?: UserNavMenuResponse[];
  subMenus?: UserNavMenuResponse[];
}

export interface MenuTreeNodeResponse {
  id: string;
  title: string;
  route?: string;
  icon?: string;
  orderIndex: number;
  parentId?: string;
  isActive: boolean;
  actions: BusinessActionResponse[];
  children?: MenuTreeNodeResponse[];
}

export interface MenuResponse {
  id: string;
  title: string;
  route?: string;
  icon?: string;
  parentId?: string;
  orderIndex: number;
  isActive: boolean;
  createdOn: string;
  actions: BusinessActionResponse[];
}

export interface RoleMenuActionAssignmentResponse {
  actionId: string;
  actionName: string;
  actionCode: string;
  isGranted: boolean;
}

export interface RoleMenuDetailsResponse {
  menuId: string;
  title?: string;
  menuTitle?: string;
  route?: string;
  menuRoute?: string;
  icon?: string;
  parentId?: string;
  orderIndex?: number;
  isAssigned: boolean;
  actions?: RoleMenuActionAssignmentResponse[];
  availableActions?: { actionId: string; actionCode: string; actionName: string }[];
  assignedActionIds?: string[];
  children?: RoleMenuDetailsResponse[];
}

export interface BusinessActionResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdOn: string;
}

export interface SettingResponse {
  id: string;
  key: string;
  value: string;
  description?: string;
  module: string;
  isEncrypted: boolean;
  createdOn: string;
}

export interface AuditLogResponse {
  id: string;
  userId?: string;
  action: number;
  actionName: string;
  entityName: string;
  entityId?: string;
  oldValues?: string;
  newValues?: string;
  ipAddress?: string;
  userAgent?: string;
  createdOn: string;
}

export interface SupportedLocale {
  id: string;
  displayOrder: number;
  countryName: string;
  phoneCode: string;
  languageName: string;
  cultureCode: string;
  currencySymbol: string;
  currencyName: string;
  currencyCode: string;
  direction: "LTR" | "RTL";
  flagIconUrl: string;
  isActive: boolean;
}

