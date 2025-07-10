export interface User {
  _id?: string;
  id?: string;
  pocketbaseID?: string;
  name?: string;
  avatar?: string;
  status?: string;
  role?: string;
  roleId?: string;
  department?: string;
  departmentId?: string;
  costUSD?: number;
  costMYR?: number;
  position?: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  bankName?: string;
  bankNumber?: string;
  swiftCode?: string;
  accountName?: string;
  isManager?: boolean;
  managerType?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
