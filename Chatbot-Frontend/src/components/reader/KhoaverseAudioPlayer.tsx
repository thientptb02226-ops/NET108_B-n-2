import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Upload, X } from 'lucide-react';
import { AudioTrack } from '../../types';

interface KhoaverseAudioPlayerProps {
  currentTrackName?: string;
  onTrackChange?: (name: string) => void;
  className?: string;
}

export const KhoaverseAudioPlayer: React.FC<KhoaverseAudioPlayerProps> = ({
  onTrackChange,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<AudioTrack[]>([
    {
      id: 'synth-piano-1',
      name: '♫ Nhạc nền piano thư giãn (Bản quyền Net108Khai)',
      artist: 'Net108Khai Ambient',
      url: 'synth://ambient-chords',
      isCustom: false,
    },
    {
      id: 'synth-piano-2',
      name: '♫ Giai điệu mùa hạ êm đềm (432Hz)',
      artist: 'Net108Khai Ambient',
      url: 'synth://ambient-summer',
      isCustom: false,
    },
  ]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorTimerRef = useRef<number | null>(null);

  const currentTrack = playlist[currentTrackIndex] || playlist[0];

  useEffect(() => {
    if (onTrackChange && currentTrack) {
      onTrackChange(currentTrack.name);
    }
  }, [currentTrackIndex, playlist, onTrackChange]);

  // Gentle synthesizer for ambient piano chords when using synth://
  const stopSynth = () => {
    if (oscillatorTimerRef.current) {
      window.clearInterval(oscillatorTimerRef.current);
      oscillatorTimerRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const playSynthChords = () => {
    stopSynth();
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // Chord frequencies (Calm pentatonic / minor 7th progressions: C, G, Am, F)
      const chordGroups = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [196.00, 246.94, 293.66, 392.00], // G
        [220.00, 261.63, 329.63, 440.00], // Am7
        [174.61, 220.00, 261.63, 349.23], // F
      ];
      let step = 0;

      const triggerChord = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
        const now = ctx.currentTime;
        const freqs = chordGroups[step % chordGroups.length];
        step++;

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);

          // Soft attack and gentle decay
          gain.gain.setValueAtTime(0, now + idx * 0.15);
          gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.15 + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 3.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 4.0);
        });
      };

      triggerChord();
      oscillatorTimerRef.current = window.setInterval(triggerChord, 4200);
    } catch {
      setAudioError('Trình duyệt chưa cấp quyền phát âm thanh tự động.');
    }
  };

  const handleTogglePlay = async () => {
    setAudioError(null);
    if (isPlaying) {
      if (currentTrack.url.startsWith('synth://')) {
        stopSynth();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (currentTrack.url.startsWith('synth://')) {
        playSynthChords();
        setIsPlaying(true);
      } else if (audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch {
          setAudioError('Không thể phát tệp âm thanh này.');
          setIsPlaying(false);
        }
      }
    }
  };

  const handleNextTrack = () => {
    stopSynth();
    if (audioRef.current) audioRef.current.pause();
    const nextIdx = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIdx);
    setIsPlaying(false);
  };

  const handlePrevTrack = () => {
    stopSynth();
    if (audioRef.current) audioRef.current.pause();
    const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrackIndex(prevIdx);
    setIsPlaying(false);
  };

  // User selects local MP3 files from their computer (0 upload to server)
  const handleLocalFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: AudioTrack[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav')) {
        const objectUrl = URL.createObjectURL(file);
        newTracks.push({
          id: `local-${Date.now()}-${i}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Tệp từ máy của bạn',
          url: objectUrl,
          isCustom: true,
        });
      }
    }

    if (newTracks.length > 0) {
      setPlaylist((prev) => [...prev, ...newTracks]);
      setCurrentTrackIndex(playlist.length); // switch to first newly added
      setIsPlaying(false);
      setAudioError(null);
    }
  };

  // Clean up
  useEffect(() => {
    return () => {
      stopSynth();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Hidden native audio element for custom user audio files */}
      {!currentTrack.url.startsWith('synth://') && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onEnded={handleNextTrack}
          onError={() => setAudioError('Lỗi định dạng tệp âm thanh.')}
        />
      )}

      {/* Control Buttons matching KhoaVerse */}
      <div className="flex items-center gap-1.5 text-xs text-[#141414]">
        <button
          onClick={handlePrevTrack}
          title="Bài trước"
          aria-label="Bài trước"
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleTogglePlay}
          title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc nền'}
          aria-label={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
          className={`w-7 h-7 flex items-center justify-center rounded-full active:scale-95 transition-all ${
            isPlaying ? 'bg-[#1F3FB0] text-white shadow-sm' : 'hover:bg-black/5 text-[#141414]'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        <button
          onClick={handleNextTrack}
          title="Bài sau"
          aria-label="Bài sau"
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* Track Title Button to open Drawer */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="max-w-[130px] sm:max-w-[180px] truncate px-2 py-1 rounded-md text-[11px] font-semibold tracking-tight hover:bg-black/5 flex items-center gap-1.5 transition-colors text-left"
          title="Bấm để chọn bài hoặc thêm MP3 từ máy"
        >
          <Music className={`w-3.5 h-3.5 shrink-0 ${isPlaying ? 'text-[#1F3FB0] animate-pulse' : 'text-zinc-500'}`} />
          <span className="truncate">{currentTrack.name}</span>
        </button>
      </div>

      {/* Playlist & Upload Drawer / Modal */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="bg-[#F4F2ED] text-[#141414] rounded-2xl border border-black/10 shadow-elevation max-w-md w-full p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Quản lý nhạc nền đọc sách"
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-[#1F3FB0]" />
                <h3 className="font-bold text-base tracking-tight font-serif">Nhạc Nền Đọc Sách</h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-zinc-600" />
              </button>
            </div>

            {audioError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
                {audioError}
              </div>
            )}

            {/* Local MP3 Upload Picker */}
            <div className="p-4 bg-white/70 rounded-xl border border-black/5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Phát nhạc từ thiết bị của bạn
                  </div>
                  <div className="text-xs text-zinc-600 mt-0.5">
                    Chọn tệp MP3/WAV trực tiếp từ máy (hoàn toàn riêng tư, không tải lên server).
                  </div>
                </div>
              </div>

              <label className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-[#1F3FB0]/40 bg-[#1F3FB0]/5 text-[#1F3FB0] font-semibold text-xs cursor-pointer hover:bg-[#1F3FB0]/10 transition-colors">
                <Upload className="w-4 h-4" />
                <span>＋ Thêm nhạc MP3 từ máy</span>
                <input
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleLocalFilesUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Playlist */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
                Danh sách bài hát ({playlist.length})
              </div>
              {playlist.map((track, idx) => {
                const isSelected = idx === currentTrackIndex;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      stopSynth();
                      if (audioRef.current) audioRef.current.pause();
                      setCurrentTrackIndex(idx);
                      setIsPlaying(true);
                      if (track.url.startsWith('synth://')) {
                        playSynthChords();
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#1F3FB0] text-white font-semibold'
                        : 'bg-white/60 hover:bg-white text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate mr-2">
                      <span className="w-4 text-center font-mono opacity-60">{idx + 1}</span>
                      <span className="truncate">{track.name}</span>
                    </div>
                    {isSelected && isPlaying && (
                      <span className="shrink-0 flex items-center gap-1">
                        <span className="w-1 h-3 bg-white rounded-full animate-bounce" />
                        <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 text-[11px] text-zinc-500 text-center">
              Âm nhạc giúp nâng cao sự tập trung và mang lại trải nghiệm hoài niệm khi đọc.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
