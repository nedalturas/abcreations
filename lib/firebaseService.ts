// Firebase service for CRUD operations
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, hasValidConfig } from './firebase';
import { RepairOrder, JobOrder } from '@/types';

// Collection names
const REPAIR_ORDERS_COLLECTION = 'repairOrders';
const JOB_ORDERS_COLLECTION = 'jobOrders';

// Mock data for when Firebase is not configured
const mockRepairOrders: RepairOrder[] = [];
const mockJobOrders: JobOrder[] = [];

// Repair Orders Service
export class RepairOrdersService {
  private collectionRef = db ? collection(db, REPAIR_ORDERS_COLLECTION) : null;

  // Create a new repair order
  async create(orderData: Omit<RepairOrder, 'id' | 'createdAt'>): Promise<string> {
    if (!hasValidConfig() || !db) {
      // Mock implementation
      const mockId = Date.now().toString();
      const mockOrder: RepairOrder = {
        ...orderData,
        id: mockId,
        createdAt: new Date().toISOString(),
      };
      mockRepairOrders.unshift(mockOrder);
      return mockId;
    }

    try {
      const docRef = await addDoc(this.collectionRef!, {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating repair order:', error);
      throw error;
    }
  }

  // Get all repair orders
  async getAll(): Promise<RepairOrder[]> {
    if (!hasValidConfig() || !db) {
      // Return mock data
      return [...mockRepairOrders];
    }

    try {
      const q = query(this.collectionRef!, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as RepairOrder[];
    } catch (error) {
      console.error('Error fetching repair orders:', error);
      throw error;
    }
  }

  // Get repair order by ID
  async getById(id: string): Promise<RepairOrder | null> {
    if (!hasValidConfig() || !db) {
      // Mock implementation
      return mockRepairOrders.find(order => order.id === id) || null;
    }

    try {
      const docRef = doc(db, REPAIR_ORDERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as RepairOrder;
      }
      return null;
    } catch (error) {
      console.error('Error fetching repair order:', error);
      throw error;
    }
  }

  // Update repair order
  async update(id: string, orderData: Partial<RepairOrder>): Promise<void> {
    if (!hasValidConfig() || !db) {
      // Mock implementation
      const index = mockRepairOrders.findIndex(order => order.id === id);
      if (index !== -1) {
        mockRepairOrders[index] = { ...mockRepairOrders[index], ...orderData };
      }
      return;
    }

    try {
      const docRef = doc(db, REPAIR_ORDERS_COLLECTION, id);
      await updateDoc(docRef, {
        ...orderData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating repair order:', error);
      throw error;
    }
  }

  // Delete repair order
  async delete(id: string): Promise<void> {
    if (!hasValidConfig() || !db) {
      // Mock implementation
      const index = mockRepairOrders.findIndex(order => order.id === id);
      if (index !== -1) {
        mockRepairOrders.splice(index, 1);
      }
      return;
    }

    try {
      const docRef = doc(db, REPAIR_ORDERS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting repair order:', error);
      throw error;
    }
  }

  // Get repair orders by status
  async getByStatus(status: string): Promise<RepairOrder[]> {
    if (!hasValidConfig() || !db) {
      // Mock implementation
      return mockRepairOrders.filter(order => order.status === status);
    }

    try {
      const q = query(
        this.collectionRef!,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as RepairOrder[];
    } catch (error) {
      console.error('Error fetching repair orders by status:', error);
      throw error;
    }
  }

  // Real-time listener for repair orders
  onSnapshot(callback: (orders: RepairOrder[]) => void): () => void {
    if (!hasValidConfig() || !db) {
      // Mock implementation - call callback immediately with mock data
      callback([...mockRepairOrders]);
      return () => {}; // Return empty unsubscribe function
    }

    const q = query(this.collectionRef!, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as RepairOrder[];
      
      callback(orders);
    });
  }

  // Upload image for repair order
  async uploadImage(file: File, orderId: string): Promise<string> {
    if (!hasValidConfig() || !storage) {
      // Mock implementation - return a placeholder URL
      return `https://via.placeholder.com/400x300?text=Mock+Image+${orderId}`;
    }

    try {
      const storageRef = ref(storage, `repair-images/${orderId}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Delete image
  async deleteImage(imageUrl: string): Promise<void> {
    if (!hasValidConfig() || !storage) {
      // Mock implementation - do nothing
      return;
    }

    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
}

// Job Orders Service
export class JobOrdersService {
  private collectionRef = db ? collection(db, JOB_ORDERS_COLLECTION) : null;

  // Create a new job order
  async create(orderData: Omit<JobOrder, 'id' | 'createdAt'>): Promise<string> {
    if (!hasValidConfig() || !db) {
      // Mock implementation
      const mockId = Date.now().toString();
      const mockOrder: JobOrder = {
        ...orderData,
        id: mockId,
        createdAt: new Date().toISOString(),
      };
      mockJobOrders.unshift(mockOrder);
      return mockId;
    }

    try {
      const docRef = await addDoc(this.collectionRef!, {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating job order:', error);
      throw error;
    }
  }

  // Get all job orders
  async getAll(): Promise<JobOrder[]> {
    if (!hasValidConfig() || !db) {
      // Return mock data
      return [...mockJobOrders];
    }

    try {
      const q = query(this.collectionRef!, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as JobOrder[];
    } catch (error) {
      console.error('Error fetching job orders:', error);
      throw error;
    }
  }

  // Get job order by ID
  async getById(id: string): Promise<JobOrder | null> {
    if (!hasValidConfig() || !db) {
      // Mock implementation
      return mockJobOrders.find(order => order.id === id) || null;
    }

    try {
      const docRef = doc(db, JOB_ORDERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as JobOrder;
      }
      return null;
    } catch (error) {
      console.error('Error fetching job order:', error);
      throw error;
    }
  }

  // Update job order
  async update(id: string, orderData: Partial<JobOrder>): Promise<void> {
    if (!hasValidConfig() || !db) {
      // Mock implementation
      const index = mockJobOrders.findIndex(order => order.id === id);
      if (index !== -1) {
        mockJobOrders[index] = { ...mockJobOrders[index], ...orderData };
      }
      return;
    }

    try {
      const docRef = doc(db, JOB_ORDERS_COLLECTION, id);
      await updateDoc(docRef, {
        ...orderData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating job order:', error);
      throw error;
    }
  }

  // Delete job order
  async delete(id: string): Promise<void> {
    if (!hasValidConfig() || !db) {
      // Mock implementation
      const index = mockJobOrders.findIndex(order => order.id === id);
      if (index !== -1) {
        mockJobOrders.splice(index, 1);
      }
      return;
    }

    try {
      const docRef = doc(db, JOB_ORDERS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting job order:', error);
      throw error;
    }
  }

  // Get job orders by status
  async getByStatus(status: string): Promise<JobOrder[]> {
    if (!hasValidConfig() || !db) {
      // Mock implementation
      return mockJobOrders.filter(order => order.status === status);
    }

    try {
      const q = query(
        this.collectionRef!,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as JobOrder[];
    } catch (error) {
      console.error('Error fetching job orders by status:', error);
      throw error;
    }
  }

  // Real-time listener for job orders
  onSnapshot(callback: (orders: JobOrder[]) => void): () => void {
    if (!hasValidConfig() || !db) {
      // Mock implementation - call callback immediately with mock data
      callback([...mockJobOrders]);
      return () => {}; // Return empty unsubscribe function
    }

    const q = query(this.collectionRef!, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as JobOrder[];
      
      callback(orders);
    });
  }
}

// Service instances
export const repairOrdersService = new RepairOrdersService();
export const jobOrdersService = new JobOrdersService();