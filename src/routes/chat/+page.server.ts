import { generateChatID, fileManager } from '$lib/server/chat';
import { chatTable } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

import type { Actions } from './$types';

export const actions = {
	startChat: async ({ request }) => {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const prompt = formData.get('prompt')?.toString();
		const fileBuffer = await file?.arrayBuffer();
		if (!fileBuffer || !prompt || !file?.name) return fail(400, { file, prompt, missing: true });

		// TODO: remove just for testing
		const filename = Date.now() + file.name;

		try {
			const fileResult = await fileManager.uploadFile(Buffer.from(fileBuffer), {
				displayName: filename,
				mimeType: 'application/pdf'
			});

			const chatID = generateChatID();
			await db.insert(chatTable).values({
				id: chatID,
				chat: [{ sender: 'user', text: prompt }],
				fileUri: fileResult.file.uri,
				expiresOn: new Date(Date.now() + 1000 * 60 * 60 * 24)
			});

			return {
				chatID
			};
		} catch (err) {
			console.error(err);
      return fail(400, { message: "something went wrong" })
		}
	}
} satisfies Actions;
