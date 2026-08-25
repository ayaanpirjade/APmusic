package com.apmusic.app;

import android.content.Intent;
import android.net.Uri;
import android.os.IBinder;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.media3.common.AudioAttributes;
import androidx.media3.common.C;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MediaMetadata;
import androidx.media3.common.Player;
import androidx.media3.datasource.DefaultHttpDataSource;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory;
import androidx.media3.session.MediaSession;
import androidx.media3.session.MediaSessionService;

import com.getcapacitor.JSObject;

public class NativeAudioService extends MediaSessionService {
    public static final String ACTION_PLAY = "com.apmusic.app.PLAY";
    public static final String ACTION_PAUSE = "com.apmusic.app.PAUSE";
    public static final String ACTION_RESUME = "com.apmusic.app.RESUME";
    public static final String ACTION_SEEK = "com.apmusic.app.SEEK";
    public static final String ACTION_STOP = "com.apmusic.app.STOP";

    public static final String EXTRA_URL = "url";
    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_ARTIST = "artist";
    public static final String EXTRA_ALBUM = "album";
    public static final String EXTRA_ARTWORK = "artwork";
    public static final String EXTRA_POSITION = "position";
    public static final String EXTRA_MIME = "mimeType";

    private static NativeAudioService instance;
    private ExoPlayer player;
    private MediaSession mediaSession;
    private volatile String lastError = "";

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;

        AudioAttributes audioAttributes = new AudioAttributes.Builder()
            .setUsage(C.USAGE_MEDIA)
            .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
            .build();
        DefaultHttpDataSource.Factory dataSourceFactory = new DefaultHttpDataSource.Factory()
            .setUserAgent("Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 Chrome/128.0 Mobile Safari/537.36")
            .setAllowCrossProtocolRedirects(true)
            .setDefaultRequestProperties(java.util.Map.of(
                "Referer", "https://www.youtube.com/",
                "Accept", "*/*"
            ));
        player = new ExoPlayer.Builder(this)
            .setAudioAttributes(audioAttributes, true)
            .setMediaSourceFactory(new DefaultMediaSourceFactory(dataSourceFactory))
            .build();
        player.addListener(new Player.Listener() {
            @Override
            public void onPlayerError(@NonNull androidx.media3.common.PlaybackException error) {
                lastError = androidx.media3.common.PlaybackException.getErrorCodeName(error.errorCode) + ": " + error.getMessage();
                android.util.Log.e("APMUSIC", "Native playback failed: " + lastError, error);
            }

            @Override
            public void onPlaybackStateChanged(int playbackState) {
                android.util.Log.d("APMUSIC", "Native playback state=" + playbackState + " playing=" + player.isPlaying());
            }
        });
        mediaSession = new MediaSession.Builder(this, player).build();
    }

    @Override
    public MediaSession onGetSession(MediaSession.ControllerInfo controllerInfo) {
        return mediaSession;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        super.onStartCommand(intent, flags, startId);
        if (intent != null && player != null) {
            String action = intent.getAction();
            if (ACTION_PLAY.equals(action)) {
                playFromIntent(intent);
            } else if (ACTION_PAUSE.equals(action)) {
                player.pause();
            } else if (ACTION_RESUME.equals(action)) {
                player.play();
            } else if (ACTION_SEEK.equals(action)) {
                long position = (long) (intent.getDoubleExtra(EXTRA_POSITION, 0.0) * 1000.0);
                player.seekTo(Math.max(0L, position));
            } else if (ACTION_STOP.equals(action)) {
                player.stop();
                stopSelf();
            }
        }
        return START_STICKY;
    }

    private void playFromIntent(Intent intent) {
        String url = intent.getStringExtra(EXTRA_URL);
        if (url == null || url.isEmpty()) {
            android.util.Log.e("APMUSIC", "Native play rejected: empty URL");
            return;
        }

        String title = intent.getStringExtra(EXTRA_TITLE);
        String artist = intent.getStringExtra(EXTRA_ARTIST);
        String album = intent.getStringExtra(EXTRA_ALBUM);
        String artwork = intent.getStringExtra(EXTRA_ARTWORK);
        String mimeType = intent.getStringExtra(EXTRA_MIME);

        MediaMetadata.Builder metadata = new MediaMetadata.Builder()
            .setTitle(title == null ? "APMUSIC" : title)
            .setArtist(artist == null ? "" : artist)
            .setAlbumTitle(album == null ? "APMUSIC" : album);
        if (artwork != null && !artwork.isEmpty()) metadata.setArtworkUri(Uri.parse(artwork));

        MediaItem.Builder itemBuilder = new MediaItem.Builder()
            .setUri(Uri.parse(url))
            .setMediaMetadata(metadata.build());
        if (mimeType != null && !mimeType.isEmpty()) itemBuilder.setMimeType(mimeType);

        lastError = "";
        player.setMediaItem(itemBuilder.build());
        player.prepare();
        player.play();
        android.util.Log.d("APMUSIC", "Native play requested url=" + url + " mime=" + mimeType);
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        // Do not stop or release the player when the app task is removed while
        // music is playing. MediaSessionService owns the player independently.
        if (player == null || !player.isPlaying()) super.onTaskRemoved(rootIntent);
    }

    public static JSObject getStatus() {
        JSObject status = new JSObject();
        NativeAudioService service = instance;
        if (service == null || service.player == null) {
            status.put("available", false);
            return status;
        }
        status.put("available", true);
        status.put("isPlaying", service.player.isPlaying());
        status.put("position", Math.max(0L, service.player.getCurrentPosition()) / 1000.0);
        status.put("duration", Math.max(0L, service.player.getDuration()) / 1000.0);
        status.put("playbackState", service.player.getPlaybackState());
        status.put("error", service.lastError);
        return status;
    }

    @Override
    public void onDestroy() {
        instance = null;
        if (mediaSession != null) mediaSession.release();
        if (player != null) player.release();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return super.onBind(intent);
    }
}
