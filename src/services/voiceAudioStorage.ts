export type VoiceAudioUpload = {
  languageCode: string;
  mimeType: string;
  durationMs?: number;
  blob: Blob;
};

export type VoiceAudioReference = {
  uploadId: string;
  storagePath: string;
  languageCode: string;
  mimeType: string;
};

export interface VoiceAudioStorage {
  upload(input: VoiceAudioUpload): Promise<VoiceAudioReference>;
}

export class SupabaseVoiceAudioStorage implements VoiceAudioStorage {
  constructor(
    private readonly supabaseUrl: string,
    private readonly accessToken: string,
    private readonly userId: string,
  ) {}

  async upload(input: VoiceAudioUpload): Promise<VoiceAudioReference> {
    const uploadId = crypto.randomUUID();
    const extension = input.mimeType.split('/')[1]?.split(';')[0] ?? 'webm';
    const storagePath = `${this.userId}/${uploadId}.${extension}`;
    const endpoint = `${this.supabaseUrl.replace(/\/$/, '')}/storage/v1/object/voice-audio/${storagePath}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': input.mimeType,
        'x-upsert': 'false',
      },
      body: input.blob,
    });

    if (!response.ok) {
      const message = await response.text().catch(() => '');
      throw new Error(message || `Voice audio upload failed with status ${response.status}.`);
    }

    return {
      uploadId,
      storagePath,
      languageCode: input.languageCode,
      mimeType: input.mimeType,
    };
  }
}
