import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  icNo: string;
  role?: 'staff' | 'supervisor' | 'director';
  email?: string;
}

// Default initial staff accounts for EMO Book Services
export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user_1',
    username: 'ahmad',
    password: 'password123',
    name: 'AHMAD ZULKIFLI BIN HASSAN',
    icNo: '940815-10-5823',
    role: 'staff',
  },
  {
    id: 'user_2',
    username: 'siti',
    password: 'password123',
    name: 'SITI NURHALIZA BINTI OMAR',
    icNo: '920312-14-5110',
    role: 'staff',
  },
  {
    id: 'user_3',
    username: 'weichen',
    password: 'password123',
    name: 'TAN WEI CHEN',
    icNo: '960521-08-6142',
    role: 'staff',
  },
  {
    id: 'user_4',
    username: 'supervisor',
    password: 'password123',
    name: 'K. S. CHONG',
    icNo: '780105-10-4122',
    role: 'supervisor',
  },
  {
    id: 'user_5',
    username: 'director',
    password: 'password123',
    name: 'EMILY TAN',
    icNo: '750420-14-2019',
    role: 'director',
  }
];

const USERS_STORAGE_KEY = 'emo_users_directory_v1';
const CURRENT_USER_KEY = 'emo_current_logged_user_v1';

export async function getUsers(): Promise<UserAccount[]> {
  try {
    // Try fetching from Firestore
    const querySnapshot = await getDocs(collection(db, 'users'));
    if (!querySnapshot.empty) {
      const list: UserAccount[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as UserAccount);
      });
      return list;
    }
  } catch (e) {
    console.warn('Firestore fetch users fallback to localStorage:', e);
  }

  // Fallback to localStorage
  const local = localStorage.getItem(USERS_STORAGE_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {}
  }

  // Initialize with defaults
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

export async function saveUserToDirectory(user: UserAccount): Promise<void> {
  const users = await getUsers();
  const existingIdx = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
  if (existingIdx >= 0) {
    users[existingIdx] = user;
  } else {
    users.push(user);
  }

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  try {
    await setDoc(doc(db, 'users', user.id), user);
  } catch (e) {
    console.warn('Firestore save user warning:', e);
  }
}

export function getCurrentUser(): UserAccount | null {
  const local = localStorage.getItem(CURRENT_USER_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {}
  }
  return DEFAULT_USERS[0]; // Default logged in user
}

export function setCurrentUser(user: UserAccount | null): void {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}
