package com.apmusic.app;

import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NativeAudio")
public class NativeAudioPlugin extends Plugin {
    private void startAction(String action, PluginCall call) {
        Intent intent = new Intent(getContext(), NativeAudioService.class)
            .setAction(action);

        if (call != null) {
            String url = call.getString("url", "");
            String title = call.getString("title", "APMUSIC");
            String artist = call.getString("artist", "");
            String album = call.getString("album", "APMUSIC");
            String artwork = call.getString("artwork", "");
            String mimeType = call.getString("mimeType", "");
            double position = call.getDouble("position", 0.0);
            if (!url.isEmpty()) intent.putExtra(NativeAudioService.EXTRA_URL, url);
            intent.putExtra(NativeAudioService.EXTRA_TITLE, title);
            intent.putExtra(NativeAudioService.EXTRA_ARTIST, artist);
            intent.putExtra(NativeAudioService.EXTRA_ALBUM, album);
            intent.putExtra(NativeAudioService.EXTRA_ARTWORK, artwork);
            intent.putExtra(NativeAudioService.EXTRA_MIME, mimeType);
            intent.putExtra(NativeAudioService.EXTRA_POSITION, position);
        }

        if (NativeAudioService.ACTION_PLAY.equals(action)) {
            ContextCompat.startForegroundService(getContext(), intent);
        } else {
            getContext().startService(intent);
        }
        if (call != null) call.resolve();
    }

    @PluginMethod
    public void play(PluginCall call) {
        String url = call.getString("url", "");
        if (url.isEmpty()) {
            call.reject("A direct audio URL is required");
            return;
        }
        startAction(NativeAudioService.ACTION_PLAY, call);
    }

    @PluginMethod
    public void pause(PluginCall call) {
        startAction(NativeAudioService.ACTION_PAUSE, call);
    }

    @PluginMethod
    public void resume(PluginCall call) {
        startAction(NativeAudioService.ACTION_RESUME, call);
    }

    @PluginMethod
    public void seek(PluginCall call) {
        startAction(NativeAudioService.ACTION_SEEK, call);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        startAction(NativeAudioService.ACTION_STOP, call);
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        call.resolve(NativeAudioService.getStatus());
    }

    @PluginMethod
    public void download(PluginCall call) {
        String url = call.getString("url", "");
        String filename = call.getString("filename", "APMUSIC-track.m4a");
        String mimeType = call.getString("mimeType", "audio/mp4");
        if (url.isEmpty()) {
            call.reject("A direct audio URL is required");
            return;
        }
        try {
            String safeFilename = filename.replaceAll("[^a-zA-Z0-9._ -]", "_");
            if (!safeFilename.contains(".")) safeFilename += ".m4a";
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setTitle(safeFilename);
            request.setDescription("Downloading from APMUSIC");
            request.addRequestHeader("User-Agent", "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 Chrome/128.0 Mobile Safari/537.36");
            request.setMimeType(mimeType);
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setAllowedOverMetered(true);
            request.setAllowedOverRoaming(true);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_MUSIC, safeFilename);
            DownloadManager manager = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
            if (manager == null) {
                call.reject("Android DownloadManager is unavailable");
                return;
            }
            long downloadId = manager.enqueue(request);
            JSObject result = new JSObject();
            result.put("downloadId", downloadId);
            result.put("filename", safeFilename);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Native download failed", error);
        }
    }

    @PluginMethod
    public void resolveYoutube(PluginCall call) {
        String youtubeId = call.getString("youtubeId", "");
        if (youtubeId.isEmpty()) {
            call.reject("A YouTube ID is required");
            return;
        }
        getBridge().getActivity().runOnUiThread(() -> {
            java.util.concurrent.Executors.newSingleThreadExecutor().execute(() -> {
                try {
                    JSObject result = NativeYoutubeExtractor.resolve(youtubeId);
                    getBridge().getActivity().runOnUiThread(() -> call.resolve(result));
                } catch (Exception error) {
                    getBridge().getActivity().runOnUiThread(() -> call.reject("Device-side YouTube resolve failed", error));
                }
            });
        });
    }
}
