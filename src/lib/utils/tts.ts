/**
 * Per-model TTS overrides live under model.info.meta.tts (voice, engine, model, engineConfig, split_on).
 * User-level defaults come from settings.audio.tts; admin defaults from config.audio.tts.
 */

export const SERVER_TTS_ENGINES = ['openai', 'elevenlabs', 'azure', 'transformers'] as const;

export function shouldUseWebSpeechForTts(
	configAudioTtsEngine: string | undefined,
	model: { info?: { meta?: { tts?: { engine?: string } } } } | null | undefined,
	settings: { audio?: { tts?: { engine?: string } } } | undefined
): boolean {
	const resolved = getResolvedTtsEngine(model, settings);
	const adminServerConfigured = (configAudioTtsEngine ?? '') !== '';
	if (resolved === 'browser-kokoro') {
		return false;
	}
	if ((SERVER_TTS_ENGINES as readonly string[]).includes(resolved)) {
		return false;
	}
	if (!adminServerConfigured) {
		return true;
	}
	return false;
}

export function getResolvedTtsEngine(
	model: { info?: { meta?: { tts?: { engine?: string } } } } | null | undefined,
	settings: { audio?: { tts?: { engine?: string } } } | undefined
): string {
	const meta = model?.info?.meta?.tts?.engine;
	if (typeof meta === 'string' && meta.trim() !== '') {
		return meta.trim();
	}
	return settings?.audio?.tts?.engine ?? '';
}

export function getEffectiveTtsVoice(
	model: { info?: { meta?: { tts?: { voice?: string } } } } | null | undefined,
	settings: { audio?: { tts?: { defaultVoice?: string; voice?: string } } } | undefined,
	config: { audio?: { tts?: { voice?: string } } } | undefined
): string {
	if (model?.info?.meta?.tts?.voice) {
		return model.info.meta.tts.voice;
	}
	if (settings?.audio?.tts?.defaultVoice === config?.audio?.tts?.voice) {
		return settings?.audio?.tts?.voice ?? config?.audio?.tts?.voice ?? '';
	}
	return config?.audio?.tts?.voice ?? '';
}

export function getEffectiveTtsSplitOn(
	model: { info?: { meta?: { tts?: { split_on?: string } } } } | null | undefined,
	config: { audio?: { tts?: { split_on?: string } } } | undefined
): string {
	const s = model?.info?.meta?.tts?.split_on;
	if (typeof s === 'string' && s.trim() !== '') {
		return s.trim();
	}
	return config?.audio?.tts?.split_on ?? 'punctuation';
}

export function getEffectiveKokoroDtype(
	model: { info?: { meta?: { tts?: { engineConfig?: { dtype?: string } } } } } | null | undefined,
	settings: { audio?: { tts?: { engineConfig?: { dtype?: string } } } } | undefined
): string {
	return model?.info?.meta?.tts?.engineConfig?.dtype ?? settings?.audio?.tts?.engineConfig?.dtype ?? 'fp32';
}

/** Per-model server engine / model id for `/audio/speech` body (only when set on the model). */
export function getMetaTtsEnginePayload(
	model: { info?: { meta?: { tts?: { engine?: string } } } } | null | undefined
): string | undefined {
	const e = model?.info?.meta?.tts?.engine?.trim();
	if (!e || !(SERVER_TTS_ENGINES as readonly string[]).includes(e)) {
		return undefined;
	}
	return e;
}

export function getMetaTtsModelPayload(
	model: { info?: { meta?: { tts?: { model?: string } } } } | null | undefined
): string | undefined {
	const m = model?.info?.meta?.tts?.model?.trim();
	return m || undefined;
}
