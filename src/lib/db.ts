import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { Project } from "../types";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to remove any undefined values before writing to Firestore, which fails otherwise
function cleanUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  } else if (obj !== null && typeof obj === "object") {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = cleanUndefined(val);
      }
    }
    return cleaned;
  }
  return obj;
}

const COLLECTION_NAME = "projects";

export async function fetchUserProjects(userId: string): Promise<Project[]> {
  const path = `${COLLECTION_NAME}`;
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const fetchedProjects: Project[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      fetchedProjects.push({
        id: data.id,
        name: data.name,
        concept: data.concept,
        audience: data.audience,
        outcome: data.outcome,
        platform: data.platform,
        length: data.length,
        tone: data.tone,
        hooks: data.hooks || [],
        selectedHookId: data.selectedHookId || "",
        script: data.script,
        scenes: data.scenes || [],
        marketing: data.marketing,
        createdAt: data.createdAt || new Date().toISOString()
      });
    });

    // Sort by createdAt descending
    return fetchedProjects.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error: any) {
    console.warn("Failed to fetch user projects from Firestore. Returning empty offline registry.", error);
    if (error?.message?.includes("permission") || error?.code === "permission-denied") {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    return [];
  }
}

export async function saveProjectToFirestore(userId: string, project: Project): Promise<void> {
  const path = `${COLLECTION_NAME}/${project.id}`;
  try {
    const cleanedProject = cleanUndefined({
      ...project,
      userId,
      updatedAt: new Date().toISOString()
    });
    
    const docRef = doc(db, COLLECTION_NAME, project.id);
    await setDoc(docRef, cleanedProject, { merge: true });
    console.log(`Successfully saved project: ${project.id} to Firestore`);
  } catch (error: any) {
    console.error("Firestore save exception:", error);
    if (error?.message?.includes("permission") || error?.code === "permission-denied") {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    throw error;
  }
}

export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${projectId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, projectId);
    await deleteDoc(docRef);
    console.log(`Successfully deleted project: ${projectId} from Firestore`);
  } catch (error: any) {
    console.error("Firestore delete exception:", error);
    if (error?.message?.includes("permission") || error?.code === "permission-denied") {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
    throw error;
  }
}
