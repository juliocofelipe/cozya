"use client";

import styles from "../recipes.module.css";

type VoiceFeedbackProps = {
  error: string | null;
  transcript: string;
  onClearTranscript: () => void;
};

export default function VoiceFeedback({ error, transcript, onClearTranscript }: VoiceFeedbackProps) {
  if (!error && !transcript) {
    return null;
  }

  return (
    <div className={styles.voiceFeedback}>
      {error && <p className={styles.error}>{error}</p>}
      {transcript && (
        <>
          <p className={styles.success}>
            Capturamos: <strong>{transcript}</strong>
          </p>
          <button type="button" className={styles.voiceClear} onClick={onClearTranscript}>
            Limpar voz
          </button>
        </>
      )}
    </div>
  );
}
