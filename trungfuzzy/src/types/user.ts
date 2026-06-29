export type Address = {
  id: string;
  label: "Home" | "Office" | "Other";
  recipientName: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
};

export type User = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  birthDate: string;
  avatar: string;
  role: "admin" | "customer";
  status: "pending" | "active" | "locked";
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
};
