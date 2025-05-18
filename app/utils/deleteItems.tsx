// utils/deleteItem.ts
import { databases } from '../appwrite'

const deleteItem = async (documentId: string) => {
  try {
    const response = await databases.deleteDocument(
      '[DATABASE_ID]',
      '[COLLECTION_ID]',
      documentId
    )
    console.log('Deleted:', response)
    return { success: true }
  } catch (error: any) {
    console.error('Delete failed:', error.message)
    return { success: false, error: error.message }
  }
}

export default deleteItem
