package com.apmusic.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MediaMetadata;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.session.MediaSession;

import com.getcapacitor.JSObject;

public class NativeAudioService extends Service {
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

    private static final String CHANNEL_ID = "apmusic_native_audio";
    private static final int NOTIFICATION_ID = 2402;

    private static NativeAudioService instance;
    private ExoPlayer player;
    private MediaSession mediaSession;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        createNotificationChannel();
        player = new ExoPlayer.Builder(this).build();
        mediaSession = new MediaSession.Builder(this, player).build();
        startForeground(NOTIFICATION_ID, buildNotification());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
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
                stopSelf();
            }
        }
        return START_STICKY;
    }

    private void playFromIntent(Intent intent) {
        String url = intent.getStringExtra(EXTRA_URL);
        if (url == null || url.isEmpty()) return;

        String title = intent.getStringExtra(EXTRA_TITLE);
        String artist = intent.getStringExtra(EXTRA_ARTIST);
        String album = intent.getStringExtra(EXTRA_ALBUM);
        String artwork = intent.getStringExtra(EXTRA_ARTWORK);

        MediaMetadata.Builder metadata = new MediaMetadata.Builder()
            .setTitle(title == null ? "APMUSIC" : title)
            .setArtist(artist == null ? "" : artist)
            .setAlbumTitle(album == null ? "APMUSIC" : album);
        if (artwork != null && !artwork.isEmpty()) {
            metadata.setArtworkUri(Uri.parse(artwork));
        }

        MediaItem item = new MediaItem.Builder()
            .setUri(Uri.parse(url))
            .setMediaMetadata(metadata.build())
            .build();
        player.setMediaItem(item);
        player.prepare();
        player.play();
    }

    private Notification buildNotification() {
        Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent contentIntent = launchIntent == null ? null : PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle("APMUSIC")
            .setContentText("Native background playback")
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setShowWhen(false)
            .addAction(android.R.drawable.ic_media_pause, "Pause", commandIntent(ACTION_PAUSE))
            .addAction(android.R.drawable.ic_media_play, "Play", commandIntent(ACTION_RESUME));
        if (contentIntent != null) builder.setContentIntent(contentIntent);
        return builder.build();
    }

    private PendingIntent commandIntent(String action) {
        Intent intent = new Intent(this, NativeAudioService.class).setAction(action);
        return PendingIntent.getService(
            this,
            action.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "APMUSIC native playback",
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Background and lock-screen music controls");
        channel.setShowBadge(false);
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) manager.createNotificationChannel(channel);
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
        return status;
    }

    @Override
    public void onDestroy() {
        instance = null;
        if (mediaSession != null) mediaSession.release();
        if (player != null) player.release();
        stopForeground(STOP_FOREGROUND_REMOVE);
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
