export interface RepairOrder {
  id: string;
  customerName: string;
  phoneNumber: string;
  damage: string;
  price: number;
  picture?: File | string;
  deadline: string;
  status: 'pending' | 'done' | 'rescheduled';
  createdAt: string;
}

export interface JobOrder {
  id: string;
  customerName: string;
  phoneNumber: string;
  description: string;
  quantity: number;
  price: number;
  deadline: string;
  status: 'pending' | 'done' | 'rescheduled';
  createdAt: string;
}

export type OrderStatus = 'pending' | 'done' | 'rescheduled';