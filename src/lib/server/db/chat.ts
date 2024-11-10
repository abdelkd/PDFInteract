import { eq } from "drizzle-orm"
import { db } from "."
import { chatTable } from "./schema"


export const getChatByID = async (id: string) => {
  return db.select()
    .from(chatTable)
    .where(eq(chatTable.id, id))
}